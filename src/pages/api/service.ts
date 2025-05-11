import supabase from '@/lib/supabase';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
   req: NextApiRequest,
   res: NextApiResponse
) {
   if (req.method === 'GET') {
      try {
         const { data: services, error } = await supabase
            .from('services_with_card')
            .select('*')
            .range(0, 8)
            .order('id', { ascending: true });
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
