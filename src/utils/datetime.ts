import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

export function formatThaiDatetime(utcString: string): string {
  const date = dayjs.utc(utcString).tz("Asia/Bangkok")
  const day = date.date().toString().padStart(2, '0')
  const month = (date.month() + 1).toString().padStart(2, '0')
  const year = date.year() + 543
  const hour = date.hour().toString().padStart(2, '0')
  const minute = date.minute().toString().padStart(2, '0')
  return `${day}/${month}/${year} เวลา ${hour}.${minute} น.`
}

export const formatAppointmentDate = (dateString: string | null | undefined): string => {
  if (!dateString) {
    return "--/--/--- เวลา --.-- น."
  }
  try {
    // แปลง string เป็น Date object
    const date = new Date(dateString);
    
    // ตรวจสอบว่าเป็น valid date หรือไม่
    if (isNaN(date.getTime())) {
      return "--/--/---- เวลา --.-- น.";
    }
    // แปลงเป็นปี พ.ศ.
    const buddhistYear = date.getFullYear() + 543;
    
    // จัดรูปแบบวันที่ (DD/MM/YYYY)
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    
    // จัดรูปแบบเวลา (HH.MM)
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}/${month}/${buddhistYear} เวลา ${hours}.${minutes} น.`;
  } catch {
    // ถ้าเกิด error ในการแปลง
    return "--/--/---- เวลา --.-- น.";
  }
}