import type { NextApiRequest, NextApiResponse } from 'next'
import formidable, { IncomingForm } from 'formidable'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { z } from 'zod'
import {
  CreateServiceSchema,
  CreateServicePayload,
} from '../../../schemas/post-service'

// 1. บอก Next.js ว่าอย่าใช้ built-in bodyParser
export const config = {
  api: {
    bodyParser: false,
  },
}

interface ServiceWithDetails {
  id: string
  created_at: string
  updated_at: string | null
  title: string
  category_id: number | null
  image_url: string
}

// 3. ฟังก์ชันสำหรับอัปโหลดไฟล์ขึ้น Supabase Storage
async function uploadImageToStorage(
  filePath: string,
  originalFilename: string
) {
  const fileExt = originalFilename.split('.').pop()
  const uniqueName = `service-image/${uuidv4()}.${fileExt}`
  const fileBuffer = fs.readFileSync(filePath)

  if (supabaseAdmin === null) {
    throw new Error('Supabase Admin is not initialized')
  }

  const { error: uploadError } = await supabaseAdmin.storage
    .from('service-image')
    .upload(uniqueName, fileBuffer, {
      contentType: `image/${fileExt}`,
      upsert: false,
    })

  if (uploadError) {
    console.error('Supabase Storage upload error:', uploadError)
    throw uploadError
  }

  // ดึง public URL
  const { data } = supabase.storage
    .from('service-image')
    .getPublicUrl(uniqueName)

  return data.publicUrl
}

// 4. ฟังก์ชันสำหรับสร้าง Service + Sub-services
async function createServiceInDB(
  payload: CreateServicePayload & { image_url: string },
  subServices: { title: string; price: number; service_unit: string }[]
): Promise<ServiceWithDetails> {
  const { title, category, image_url } = payload
  const now = new Date().toISOString()

  try {
    // หา category_id ตามชื่อ
    const { error: categoriesError, data: categoriesData } = await supabase
      .from('categories')
      .select('id')
      .eq('name', category)
      .single()
    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError)
      throw new Error('Failed to fetch categories')
    }
    if (!categoriesData) {
      throw new Error('Category ' + category + ' not found')
    }

    // สร้าง service
    const { data: serviceData, error: serviceError } = await supabase
      .from('services')
      .insert({
        title,
        category_id: categoriesData.id,
        image_url,
        created_at: now,
        updated_at: now,
      })
      .select('*')
      .single()
    if (serviceError || !serviceData) {
      throw serviceError ?? new Error('Failed to create service')
    }

    // สร้าง sub-services
    if (subServices.length > 0) {
      const payloads = subServices.map(s => ({
        service_id: serviceData.id,
        title: s.title,
        price: s.price,
        service_unit: s.service_unit,
      }))
      const { error: subError } = await supabase
        .from('sub_services')
        .insert(payloads)
      if (subError) {
        console.error('Error creating sub-services:', subError)
        // อาจ rollback service ได้ตามต้องการ
        throw subError
      }
    }

    // ดึงข้อมูลรายละเอียดกลับมา
    const { data: fullData, error: fetchError } = await supabase
      .from('services')
      .select(`*, categories(id, name), sub_services(*)`)
      .eq('id', serviceData.id)
      .single()
    if (fetchError || !fullData) {
      return serviceData as ServiceWithDetails
    }
    return fullData as ServiceWithDetails
  } catch (error) {
    console.error('Error creating service:', error)
    throw error
  }
}

// 5. Handler หลัก
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    ServiceWithDetails | { message: string; errors?: z.ZodIssue[] }
  >
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  const parseForm = (): Promise<{
    fields: formidable.Fields
    files: formidable.Files
  }> =>
    new Promise((resolve, reject) => {
      const form = new IncomingForm({ keepExtensions: true })
      form.parse(req, (err, fields, files) =>
        err ? reject(err) : resolve({ fields, files })
      )
    })

  let fields, files
  try {
    ;({ fields, files } = await parseForm())
    console.log('fields:', fields)
    console.log('files:', files)
  } catch (err) {
    console.error('Form parse error:', err)
    return res.status(500).json({ message: 'Cannot parse form data' })
  }

  try {
    // fields.title, category เป็น array of string ต้องดึง [0]
    const payload: CreateServicePayload = {
      title: Array.isArray(fields.title)
        ? fields.title[0]
        : ((fields.title ?? '') as string),
      category: Array.isArray(fields.category)
        ? fields.category[0]
        : ((fields.category ?? '') as string),
      sub_services: fields.sub_services
        ? JSON.parse(
            Array.isArray(fields.sub_services)
              ? fields.sub_services[0]
              : (fields.sub_services as string)
          )
        : undefined,
    }

    // Validate กับ Zod
    CreateServiceSchema.parse(payload)

    // อัปโหลดรูป
    if (!files.image) {
      throw new Error('Image file is required')
    }
    const imgFile = Array.isArray(files.image) ? files.image[0] : files.image
    const imageUrl = await uploadImageToStorage(
      imgFile.filepath,
      imgFile.originalFilename!
    )

    // สร้างใน DB
    const service = await createServiceInDB(
      { ...payload, image_url: imageUrl },
      payload.sub_services || []
    )

    return res.status(201).json(service)
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: 'Invalid data', errors: err.issues })
    }
    console.error('Error creating service:', err)
    if (err instanceof Error) {
      return res
        .status(500)
        .json({ message: err.message ?? 'Internal Server Error' })
    }
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}
