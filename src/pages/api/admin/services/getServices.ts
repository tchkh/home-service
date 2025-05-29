import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase';
import { ServiceWithCategory } from '@/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ServiceWithCategory[] | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('services')
      .select(`
        id,
        title,
        category_id,
        image_url,
        created_at,
        updated_at,
        category: categories (
          name
        ),
        order_num
      `)
      .order('order_num', { ascending: true });

    if (error) {
      console.error('Error fetching services:', error);
      return res.status(500).json({ error: 'Failed to fetch services' });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const services: ServiceWithCategory[] = (data ?? []).map((svc: any) => ({
        id: svc.id,
        title: svc.title,
        category_id: svc.category_id,
        category_name: svc.category?.name ?? 'Uncategorized',
        image_url: svc.image_url,
        created_at: svc.created_at,
        updated_at: svc.updated_at,
        order_num: svc.order_num,
      }));
    return res.status(200).json(services);
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: 'An unexpected error occurred' });
  }
}
