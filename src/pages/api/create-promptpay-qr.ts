import { NextApiRequest, NextApiResponse } from 'next'
import QRCode from 'qrcode'
import generatePayload from 'promptpay-qr' // npm install promptpay-qr

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { amount } = req.body

    // Validate amount
    if (!amount || amount < 1) {
      return res.status(400).json({ error: 'Invalid amount' })
    }

    // PromptPay ID (หมายเลขโทรศัพท์หรือเลขบัตรประชาชน)
    // TODO: เปลี่ยนเป็นหมายเลขจริงของร้าน
    const promptPayId = process.env.PROMPTPAY_ID || '0812345678'

    // Generate PromptPay payload
    const payload = generatePayload(promptPayId, { amount })

    // Generate QR Code
    const qrCode = await QRCode.toDataURL(payload, {
      type: 'image/png',
      width: 300,
      margin: 2,
    })

    const paymentId = `PP-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`

    // TODO: บันทึกข้อมูล pending payment ลง database
    // const promptPayPayment = {
    //   paymentId: paymentId,
    //   bookingId: bookingId || `booking_${Date.now()}`,
    //   amount: amount,
    //   promptPayId: promptPayId,
    //   qrCode: qrCode,
    //   paymentStatus: 'pending',
    //   expiredAt: new Date(Date.now() + 30 * 60 * 1000), // 30 นาที
    //   customerInfo: customerInfo,
    //   items: items,
    //   createdAt: new Date(),
    // }
    // await db.promptpayPayments.create({ data: promptPayPayment })

    res.status(200).json({
      paymentId,
      qrCode,
      amount,
      promptPayId: promptPayId.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2'), // Mask phone number
      expiresIn: 30 * 60, // 30 minutes in seconds
    })
  } catch (error) {
    console.error('PromptPay QR generation error:', error)
    res.status(500).json({
      error: 'Failed to generate PromptPay QR',
      details: (error as Error).message,
    })
  }
}
