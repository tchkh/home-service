import { NextApiRequest, NextApiResponse } from 'next'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { IncomingForm, File } from 'formidable'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'
import {
  ServiceIdSchema,
  UpdateServiceSchema,
  UpdateServicePayload,
} from '../../../../schemas/put-service-by-id'
import { z } from 'zod'

// บอก Next.js ว่าไม่ต้อง parse body เอง (we’ll use formidable)
export const config = { api: { bodyParser: false } }

// 2. ฟังก์ชันช่วยอัปโหลดภาพไป Supabase Storage

async function uploadImageToStorage(filePath: string, origName: string) {
  const ext = origName.split('.').pop()
  const objectName = `service-image/${uuidv4()}.${ext}`
  const buffer = fs.readFileSync(filePath)

  if (supabaseAdmin === null) {
    throw new Error('Supabase Admin is not initialized')
  }
  const { error: upErr } = await supabaseAdmin.storage
    .from('service-image')
    .upload(objectName, buffer, { contentType: `image/${ext}`, upsert: false })
  if (upErr) throw upErr

  const { data } = supabaseAdmin.storage
    .from('service-image')
    .getPublicUrl(objectName)
  return data.publicUrl
}

// 3. ฟังก์ชันสำหรับอัปเดตข้อมูล Service และ Sub-services ใน Supabase
async function updateServiceWithDetails(
  serviceId: string,
  payload: UpdateServicePayload & { image_url: string | null }
) {
  const now = new Date().toISOString() // กำหนด updated_at เป็นเวลาปัจจุบัน

  try {
    // หา category_id
    const { data: cat, error: catErr } = await supabase
      .from('categories')
      .select('id')
      .eq('name', payload.category)
      .single()
    if (catErr || !cat) throw catErr ?? new Error('Category not found')

    // อัปเดตตาราง services
    if (supabaseAdmin === null) {
      throw new Error('Supabase Admin is not initialized')
    }
    const { error: svcErr } = await supabaseAdmin
      .from('services')
      .update({
        title: payload.title,
        category_id: cat.id,
        image_url: payload.image_url,
        updated_at: now,
      })
      .eq('id', serviceId)
    if (svcErr) throw svcErr

    // ลบ sub_services เก่า
    const { error: delErr } = await supabaseAdmin
      .from('sub_services')
      .delete()
      .eq('service_id', serviceId)
    if (delErr) throw delErr

    // แทรก sub_services ใหม่
    const insertPayload = payload.sub_services.map(s => ({
      service_id: serviceId,
      title: s.title,
      price: s.price,
      service_unit: s.service_unit,
    }))
    const { error: insErr } = await supabaseAdmin
      .from('sub_services')
      .insert(insertPayload)
    if (insErr) throw insErr
  } catch (error) {
    console.error('Error in updateServiceWithDetails:', error)
    throw error
  }
}

// 4. Handler Function สำหรับ API Route ของ Next.js (PUT Request)
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    { message: string } | { error: string; issues?: z.ZodIssue[] }
  >
) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  const parseForm = () =>
    new Promise<{
      fields: Record<string, unknown>
      files: Record<string, File | File[]>
    }>((resolve, reject) => {
      const form = new IncomingForm({ keepExtensions: true })
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err)
        // Remove undefined values from files
        const filteredFiles: Record<string, File | File[]> = {}
        for (const key in files) {
          const value = files[key]
          if (value !== undefined) {
            filteredFiles[key] = value as File | File[]
          }
        }
        resolve({ fields, files: filteredFiles })
      })
    })

  let fields, files
  try {
    ;({ fields, files } = await parseForm())
  } catch (e) {
    console.error('Form parse error:', e)
    return res.status(500).json({ error: 'Cannot parse form data' })
  }

  try {
    // 1) ดึง serviceId จาก query
    const { serviceId } = ServiceIdSchema.parse(req.query)

    // 2) แปลง fields → payload เทียบ schema
    const rawPayload = {
      title: Array.isArray(fields.title) ? fields.title[0] : fields.title,
      category: Array.isArray(fields.category)
        ? fields.category[0]
        : fields.category,
      sub_services: JSON.parse(
        Array.isArray(fields.sub_services)
          ? fields.sub_services[0]
          : (fields.sub_services as string)
      ),
    }
    const validPayload = UpdateServiceSchema.parse(rawPayload)

    let imageUrl: string

    // 3) ตรวจสอบไฟล์ภาพ ถ้ามีให้อัปโหลด ถ้าเป็น string (URL เดิม) ไม่ต้องทำอะไร
    // กรณีอัปโหลดไฟล์ใหม่
    if (files.image) {
      const img = Array.isArray(files.image) ? files.image[0] : files.image
      imageUrl = await uploadImageToStorage(img.filepath, img.originalFilename!)
    }
    // กรณีใช้ URL เดิม
    else if (fields.image) {
      imageUrl = Array.isArray(fields.image) ? fields.image[0] : fields.image
    } else {
      throw new Error('Image file or URL is required')
    }

    // 4) เรียกอัปเดตใน DB
    await updateServiceWithDetails(serviceId, {
      ...validPayload,
      image_url: imageUrl,
    })

    return res
      .status(200)
      .json({ message: `Service ${serviceId} updated successfully` })
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: 'Validation error', issues: err.issues })
    }
    console.error('Error in PUT service:', err)
    if (err instanceof Error) {
      return res
        .status(500)
        .json({ error: err.message || 'Internal Server Error' })
    }
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}
