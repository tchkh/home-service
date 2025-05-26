export function generatePromptPayQR(
  promptPayId: string, // เบอร์โทร หรือ เลขบัตรประชาชน
  amount: number
): string {
  // Format: 00020101021129370016A000000677010111011300660000000005802TH530376463048956

  // PromptPay Payload Format
  const payload = [
    '000201', // Version
    '010212', // Method (12 = PromptPay)
    '29370016A000000677010111', // PromptPay ID
    formatPromptPayId(promptPayId),
    '5802TH', // Country Code
    '5303764', // Currency Code (THB)
    amount > 0
      ? `54${padLeft(amount.toFixed(2).length, 2)}${amount.toFixed(2)}`
      : '',
    '6304', // CRC Placeholder
  ].join('')

  const crc = calculateCRC16(payload)
  return payload + crc
}

function formatPromptPayId(id: string): string {
  const digits = id.replace(/\D/g, '')

  if (digits.length === 10) {
    // Phone number - add 66 prefix and remove leading 0
    return `01130066${digits.substring(1)}`
  } else if (digits.length === 13) {
    // ID card number
    return `02${digits.length}${digits}`
  }

  throw new Error('Invalid PromptPay ID')
}

function padLeft(value: number, length: number): string {
  return value.toString().padStart(length, '0')
}

function calculateCRC16(payload: string): string {
  // CRC-16 CCITT calculation
  let crc = 0xffff
  const polynomial = 0x1021

  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8

    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ polynomial
      } else {
        crc <<= 1
      }
    }
  }

  return (crc & 0xffff).toString(16).toUpperCase().padStart(4, '0')
}
