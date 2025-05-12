import supabase from '@/lib/supabase';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
   req: NextApiRequest,
   res: NextApiResponse
) {
   if (req.method === 'GET') {
      try {
         const { search, category, minPrice, maxPrice, sortBy } = req.query as {
            search?: string;
            category?: string;
            minPrice?: string;
            maxPrice?: string;
            sortBy?: string;
         };
         console.log('req.query :  ', req.query);

         let query = supabase

            .from('services_with_card')
            .select('*')
            .range(0, 8);

         if (search) {
            query = query.ilike('service_title', `%${search}%`);
         }

         if (category) {
            query = query.eq('category_name', category);
         }

         if (minPrice) {
            query = query.gte('min_price', minPrice);
         }

         if (maxPrice) {
            query = query.lte('max_price', maxPrice);
         }

         if (sortBy === 'price_asc') {
            query = query.order('min_price', { ascending: true });
         } else if (sortBy === 'price_desc') {
            query = query.order('min_price', { ascending: false });
         } else if (sortBy === 'title') {
            query = query.order('id', { ascending: true });
         }

         const { data: services, error } = await query;

         if (error) {
            console.log('error: ', error);
            return res.status(500).json({ error: 'Error fetching services' });
         }
         return res.status(200).json(services);
      } catch (error) {
         console.log('error at get methor', error);
      }
   }
}
