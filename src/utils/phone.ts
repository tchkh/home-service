export const formatPhoneNumber = (phone: string) => {
  // ลบ space และ special characters ออกก่อน
  const cleanPhone = phone.replace(/\D/g, '');
  
  // ตรวจสอบความยาวและรูปแบบของเบอร์โทร
  if (cleanPhone.length === 10) {
    // เบอร์มือถือ: 080 000 1233 หรือ 020 000 1233
    return cleanPhone.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3");
  } else if (cleanPhone.length === 9) {
    // เบอร์บ้าน 9 หลัก: 02 456 7894
    return cleanPhone.replace(/(\d{2})(\d{3})(\d{4})/, "$1 $2 $3");
  }
}