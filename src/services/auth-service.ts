import supabase, { withAdmin } from '../lib/supabase'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import { splitName, getGravatarUrl } from '../utils/string-utils'
import { validateEmail } from '../utils/validation'

// ประเภทของข้อมูลสำหรับการลงทะเบียน
export interface RegisterInput {
  name: string
  email: string
  password: string
  tel: string
  imageUrl?: string
}

// ประเภทของข้อมูลสำหรับการเข้าสู่ระบบ
export interface LoginInput {
  email: string
  password: string
}

/**
 * ลงทะเบียนผู้ใช้ใหม่
 * @param input ข้อมูลสำหรับการลงทะเบียน
 * @returns ข้อมูลผู้ใช้ที่ลงทะเบียนสำเร็จ
 */
export async function registerUser(input: RegisterInput) {
  const { name, email, password, tel, imageUrl } = input

  // ตรวจสอบข้อมูลนำเข้า
  if (!name || !email || !password || !tel) {
    throw new Error('กรุณาระบุชื่อ, อีเมล, รหัสผ่าน และหมายเลขโทรศัพท์')
  }

  // ตรวจสอบรูปแบบอีเมล
  if (!validateEmail(email)) {
    throw new Error('รูปแบบอีเมลไม่ถูกต้อง')
  }
  // users?.users.some(user => user.email === email)

  const isEmailExists = await supabase
    .from('users') // หรือตารางที่เก็บข้อมูลผู้ใช้ของคุณ
    .select('*', { count: 'exact', head: true })
    .eq('email', email)

  if (!isEmailExists) {
    throw new Error('อีเมลนี้มีอยู่ในระบบแล้ว')
  }

  // แยกชื่อจริงและนามสกุล
  const { firstName, lastName } = splitName(name)

  // 1. ลงทะเบียนผ่าน Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: name,
      },
    },
  })

  if (authError) {
    throw new Error(authError.message)
  }

  if (!authData.user?.id) {
    throw new Error('เกิดข้อผิดพลาดในการลงทะเบียน: ไม่มี User ID')
  }

  // 2. เพิ่มข้อมูลในตาราง users
  const { error: userError } = await supabase.from('users').insert([
    {
      id: authData.user.id,
      first_name: firstName,
      last_name: lastName,
      email,
      tel,
      image_url: imageUrl || getGravatarUrl(email),
    },
  ])

  if (userError) {
    console.error('Error creating user profile:', userError)
    throw new Error(userError.message)
  }

  // 3. สร้าง backup authentication record
  try {
    await createBackupAuth(authData.user.id, password)
  } catch (error) {
    console.error('Failed to create backup auth:', error)
    // ไม่ต้องยกเลิกการลงทะเบียน
  }

  return authData.user
}

/**
 * สร้าง backup authentication record
 * @param userId ID ของผู้ใช้
 * @param password รหัสผ่าน
 */
export async function createBackupAuth(userId: string, password: string) {
  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)
  const recoveryToken = crypto.randomBytes(32).toString('hex')

  return await withAdmin(async admin => {
    const { error } = await admin.from('user_backup_auth').insert({
      id: userId,
      backup_hash: passwordHash,
      recovery_token: recoveryToken,
      last_updated: new Date().toISOString(),
    })

    if (error) {
      throw new Error(`Failed to create backup auth: ${error.message}`)
    }

    return true
  })
}

/**
 * เข้าสู่ระบบ
 * @param input ข้อมูลสำหรับการเข้าสู่ระบบ
 * @returns ข้อมูลการเข้าสู่ระบบ
 */
export async function loginUser(input: LoginInput) {
  const { email, password } = input

  // ตรวจสอบข้อมูลนำเข้า
  if (!email || !password) {
    throw new Error('Email และ password จำเป็นต้องระบุ')
  }

  // เข้าสู่ระบบผ่าน Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw new Error(error.message)
  }

  return {
    user: data.user,
    session: data.session,
  }
}
