import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { ServiceWithCategory } from '@/types';
import { getAuthenticatedClient } from '@/utils/api-helpers';

const fetchServices = async () => {
  const { data, error } = await supabase
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
}

return data;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ServiceWithCategory[] | { message: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const authResult = await getAuthenticatedClient(req, res);
    if (!authResult) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const services = await fetchServices();

    if (!services) {
      return res.status(404).json({ message: 'Services not found' });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const servicesData: ServiceWithCategory[] = (services ?? []).map((svc: any) => ({
        id: svc.id,
        title: svc.title,
        category_id: svc.category_id,
        category_name: svc.category?.name ?? 'Uncategorized',
        image_url: svc.image_url,
        created_at: svc.created_at,
        updated_at: svc.updated_at,
        order_num: svc.order_num,
      }));
    return res.status(200).json(servicesData);
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ message: 'An unexpected error occurred' });
  }
}
