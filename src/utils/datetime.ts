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