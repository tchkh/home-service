// pages/api/auth/create-backup-auth.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../lib/supabase'
import bcrypt from 'bcrypt'
import crypto from 'crypto'

interface ResponseSuccess {
  success: true
  message: string
}

interface ResponseError {
  success: false
  error: string
}

type ApiResponse = ResponseSuccess | ResponseError

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' })
  }

  try {
    // ตรวจสอบว่ามี supabaseAdmin หรือไม่
    if (!supabaseAdmin) {
      console.error(
        'SUPABASE_SERVICE_ROLE_KEY is missing - cannot perform admin operations'
      )
      return res.status(500).json({
        success: false,
        error: 'Server configuration error - missing admin credentials',
      })
    }

    const { userId, password } = req.body

    if (!userId || !password) {
      return res.status(400).json({
        success: false,
        error: 'User ID and password are required',
      })
    }

    // สร้าง backup authentication record
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)
    const recoveryToken = crypto.randomBytes(32).toString('hex')

    console.log('Creating backup auth for user ID:', userId)

    const { error: backupError } = await supabaseAdmin
      .from('user_backup_auth')
      .insert({
        id: userId,
        backup_hash: passwordHash,
        recovery_token: recoveryToken,
        last_updated: new Date().toISOString(),
      })

    if (backupError) {
      console.error('Failed to create backup auth:', backupError)
      return res.status(500).json({
        success: false,
        error: backupError.message,
      })
    }

    return res.status(201).json({
      success: true,
      message: 'Backup authentication created successfully',
    })
  } catch (error: any) {
    console.error('Error creating backup auth:', error)
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    })
  }
}