import supabase from '@/lib/supabase'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const { search, category, minPrice, maxPrice, sortBy, onLimit } =
        req.query as {
          search?: string
          category?: string
          minPrice?: string
          maxPrice?: string
          sortBy?: string
          onLimit?: string
        }
      // เช็คว่าส่ง limit มาไหม
      let limit
      if (onLimit) {
        limit = Number(onLimit)
      } else {
        limit = 8
      }
      let query = supabase
        .from('services_with_card')
        .select('*')
        .range(0, limit)

      if (search) {
        query = query.ilike('service_title', `%${search}%`)
      }

      if (category) {
        if (category !== 'บริการทั้งหมด') {
          // ไม่ได้ใช้ คำถามทำไม่ถึง query categoryAll ไม่ได้
          // const categoryAll = '';
          query = query.eq('category_name', category)
        }
      }

      if (minPrice) {
        query = query.gte('min_price', minPrice)
      }

      if (maxPrice) {
        query = query.lte('max_price', maxPrice)
      }

      if (sortBy === 'ascending') {
        query = query.order('service_title', { ascending: true })
      } else if (sortBy === 'descending ') {
        query = query.order('service_title', { ascending: false })
      } else if (sortBy === 'title') {
        query = query.order('id', { ascending: true })
      }

      const { data: services, error } = await query

      if (error) {
        console.log('error: ', error)
        return res.status(500).json({ error: 'Error fetching services' })
      }
      return res.status(200).json(services)
    } catch (error) {
      console.log('error at get methor', error)
    }
  }
}
