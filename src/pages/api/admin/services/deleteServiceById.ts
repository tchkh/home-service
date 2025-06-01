import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabase'
import { ServiceIdSchema } from '../../../../schemas/delete-service-by-id'

// Disable body parsing (though no body expected)
export const config = { api: { bodyParser: false } }

// Schema for query parameters
type DeleteResponse = { message: string } | { error: string }

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DeleteResponse>
) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  // Validate query
  let serviceId: string
  try {
    ;({ serviceId } = ServiceIdSchema.parse(req.query))
  } catch {
    return res.status(400).json({ error: 'Invalid serviceId' })
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Supabase Admin is not initialized' })
  }
  
  try {
    // Delete sub_services first
    const { error: delSubErr } = await supabaseAdmin
    .from('sub_services')
    .delete()
    .eq('service_id', serviceId)
    if (delSubErr) {
      console.error('Error deleting sub_services:', delSubErr)
      throw delSubErr
    }

    // get order_num of deleted service
    const { data: deletedService, error: SelectErr } = await supabaseAdmin
    .from('services')
    .select('order_num')
    .eq('id', serviceId)
    .single()
    if (SelectErr || !deletedService) {
      console.error('Error deleting service:', SelectErr)
      throw SelectErr
    }
    const deletedOrderNum = deletedService.order_num;

    // Delete service
    const { error: delSvcErr } = await supabaseAdmin
      .from('services')
      .delete()
      .eq('id', serviceId)
    if (delSvcErr) {
      console.error('Error deleting service:', delSvcErr)
      throw delSvcErr
    }


    // reorder order_num
    const { error: reorderErr } = await supabaseAdmin.rpc('reorder_after_delete', { deleted_order_num: deletedOrderNum })
    if (reorderErr) {
      console.error('Error reordering services:', reorderErr)
      throw reorderErr
    }

    return res
      .status(200)
      .json({ message: `Service ${serviceId} deleted successfully` })
  } catch (error: unknown) {
    console.error('Error in deleteServiceById:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Internal Server Error'
    return res.status(500).json({ error: errorMessage })
  }
}
