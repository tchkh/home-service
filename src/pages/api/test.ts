import { SubService } from '@/types'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { NextApiRequest, NextApiResponse } from 'next'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { service_id, title, price, service_unit }: SubService = req.body

  if (req.method === 'POST') {
    // Handle GET request

    const { data, error } = await supabase
      .from('sub_services')
      .insert([{ service_id, title, price, service_unit }])

    res.status(200).json({ data, error })
  }
}
