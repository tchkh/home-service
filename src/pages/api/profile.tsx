import { NextApiRequest, NextApiResponse } from 'next'
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const supabase = createPagesServerClient({ req, res })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return res.status(401).json({ error: "Unauthorized" });
  const { data, error } = await supabase
    .from('users')
    .select('id, first_name, last_name, image_url')
    .eq('id', user.id)
    .single()

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  return res.status(200).json(data)
}
