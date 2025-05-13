/**
 * แยกชื่อเต็มเป็นชื่อจริงและนามสกุล
 * @param fullName ชื่อเต็ม
 * @returns ออบเจ็กต์ที่มี firstName และ lastName
 */
export function splitName(fullName: string): {
  firstName: string
  lastName: string
} {
  // ตัดช่องว่างที่ไม่จำเป็น
  const trimmedName = fullName.trim()

  // หาตำแหน่งของช่องว่างสุดท้าย
  const lastSpaceIndex = trimmedName.lastIndexOf(' ')

  // ถ้าไม่มีช่องว่าง ให้ใช้ชื่อเต็มเป็นชื่อจริงและนามสกุลเป็นค่าว่าง
  if (lastSpaceIndex === -1) {
    return {
      firstName: trimmedName,
      lastName: '',
    }
  }

  // แยกชื่อจริงและนามสกุลตามตำแหน่งของช่องว่างสุดท้าย
  const firstName = trimmedName.substring(0, lastSpaceIndex)
  const lastName = trimmedName.substring(lastSpaceIndex + 1)

  return { firstName, lastName }
}

/**
 * สร้าง URL ของ Gravatar จากอีเมล
 * @param email อีเมล
 * @param size ขนาดของรูปภาพ (ค่าเริ่มต้นคือ 200)
 * @returns URL ของ Gravatar
 */
export function getGravatarUrl(email: string, size: number = 200): string {
  const md5 = crypto
    .createHash('md5')
    .update(email.toLowerCase().trim())
    .digest('hex')
  return `https://www.gravatar.com/avatar/${md5}?d=mp&s=${size}`
}
