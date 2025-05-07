import supabase from '@/lib/supabase';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
   req: NextApiRequest,
   res: NextApiResponse
) {
   if (req.method === 'GET') {
      try {
         const { data: services, error } = await supabase
            .from('services')
            .select('*')
            .in('id', [1, 2, 3, 4, 5]);
         if (error) {
            return res.status(500).json({ error: 'Error fetching services' });
         }
         return res.status(200).json(services);
      } catch (error) {
         console.log('error at get methor', error);
      }
   }
   // if (req.method === 'GET') {
   //    try {
   //       return res.status(200).json({ message: 'start services' });
   //    } catch (error) {
   //       console.log('error at get methor', error);
   //    }
   // }
}
