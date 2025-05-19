/**
 * ตรวจสอบว่าอีเมลถูกต้องหรือไม่
 * @param email อีเมลที่ต้องการตรวจสอบ
 * @returns true ถ้าอีเมลถูกต้อง, false ถ้าไม่ถูกต้อง
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(email)
}

/**
 * ตรวจสอบว่าเบอร์โทรศัพท์ถูกต้องหรือไม่
 * @param phone เบอร์โทรศัพท์ที่ต้องการตรวจสอบ
 * @returns true ถ้าเบอร์โทรศัพท์ถูกต้อง, false ถ้าไม่ถูกต้อง
 */
export function validatePhone(phone: string): boolean {
  // ตรวจสอบว่าเบอร์โทรศัพท์มีแต่ตัวเลขและมีความยาวอย่างน้อย 9 ตัว
  const phoneRegex = /^[0-9]{9,}$/
  return phoneRegex.test(phone)
}
