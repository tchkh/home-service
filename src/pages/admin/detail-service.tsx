import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ArrowLeft } from 'lucide-react'
import Sidebar from '@/components/shared/AdminSidebar'
import { ServiceFormValues } from '../../types/index'

function EditServicePage() {
  const router = useRouter()
  const [serviceData, setServiceData] = useState<ServiceFormValues | null>(null)
  const serviceId = router.query.serviceId

  useEffect(() => {
    const fetchServiceData = async (serviceId: string) => {
      try {
        if (!serviceId) return // ถ้าไม่มี serviceId ให้หยุดการทำงาน

        const result = await axios.get(
          `/api/admin/getServiceById?serviceId=${serviceId}`
        )
        if (result.status === 200) {
          console.log(
            'DetailServicePage: Response from backend (getServiceById) : ',
            result.data
          )

          // เช็คว่า image_url มีค่าที่ถูกต้องหรือไม่
          if (result.data.image_url) {
            console.log('Image URL:', result.data.image_url)
          } else {
            // ถ้าไม่มี https:// ให้เพิ่ม
            result.data.image_url = `https://${result.data.image_url}`
            console.log('Updated Image URL:', result.data.image_url)
          }

          setServiceData({
            title: result.data.title || '',
            category: result.data.category?.name || '',
            image: result.data.image_url || '',
            created_at: result.data.created_at || '',
            updated_at: result.data.updated_at || '',
            subervices: result.data.sub_services || [],
          })
        }
      } catch (error) {
        console.error('Error fetching service data:', error)
        return
      }
    }
    if (serviceId) {
      fetchServiceData(serviceId as string)
    }

    console.log('DetailServicePage: serviceId:', serviceId)
  }, [serviceId])

  const setDateTimeFormat = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const amPm = date.getHours() >= 12 ? 'PM' : 'AM'
    return `${day}/${month}/${year} ${hours}:${minutes}${amPm}`
  }

  const handleEdit = () =>
    router.push('/admin/edit-service?serviceId=' + serviceId)

  const handleGoBack = () => router.back()

  return (
    <div className={`flex w-screen min-h-screen bg-[var(--bg)]`}>
      <Sidebar className="sticky top-0" />
      <div className="w-full flex flex-col space-y-6">
        {/* Header */}
        <div className="flex flex-row justify-between items-center px-8 py-5 bg-[var(--white)]">
          <div className="flex items-center space-x-4">
            <Button
              type="button"
              variant="ghost"
              className="p-2 hover:bg-[var(--gray-100)] active:bg-[var(--gray-200)] cursor-pointer rounded-full"
              onClick={handleGoBack}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <span className="text-[var(--gray-700)] text-body-4">บริการ</span>
              <h1 className="text-heading-2 text-2xl font-semibold">
                {serviceData?.title}
              </h1>
            </div>
          </div>
          {/* ปุ่ม */}
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              onClick={handleEdit}
              className="btn btn--primary px-6 py-3 mr-5"
            >
              แก้ไข
            </Button>
          </div>
        </div>

        {/* Basic Info */}
        <div className="flex flex-col gap-[40px] w-[90%] max-w-[95%] mx-auto px-5 py-10 bg-[var(--white)] border-1 border-[var(--gray-200)] rounded-2xl shadow-lg overflow-hidden">
          {/* ชื่อบริการ */}
          <div className="flex flex-row gap-10 space-y-1">
            <h2 className="w-40 text-heading-5">ชื่อบริการ</h2>
            <span className="w-80 text-body-1">{serviceData?.title}</span>
          </div>
          {/* หมวดหมู่ */}
          <div className="flex flex-row gap-10 space-y-1">
            <h2 className="w-40 text-heading-5">หมวดหมู่</h2>
            <span className="w-80 text-body-1">
              {/* Todo: ดึงหมวดหมู่ */}
              {serviceData?.category}
            </span>
          </div>
          {/* Image Upload */}
          <div className="flex flex-row items-start gap-10 space-y-1">
            <h2 className="w-40 text-heading-5">รูปภาพ</h2>
            <div className="w-80">
              {serviceData?.image ? (
                <Image
                  src={serviceData.image}
                  alt="preview"
                  width={500}
                  height={300}
                  className="object-contain rounded"
                />
              ) : // อาจจะแสดง Placeholder อื่นๆ หรือไม่แสดงอะไรเลย
              null}
            </div>
          </div>
          <div className="mt-4 border-t-1 border-[var(--gray-200)]"></div>
          {/* Sub-services */}
          <div className="flex flex-col justify-start gap-10 space-y-2">
            <Label className="text-heading-5">รายการบริการย่อย</Label>
            {serviceData?.subervices?.map(subService => (
              <div
                key={subService.id} // ตรวจสอบให้แน่ใจว่า subService มี id ที่ไม่ซ้ำกัน
                className="grid grid-cols-8 justify-between items-center gap-4"
              >
                <div className="flex flex-col col-span-4">
                  <span>ชื่อรายการ</span>
                  {subService.title}
                </div>
                <div className="flex flex-col col-span-2">
                  <span>ค่าบริการ / 1 หน่วย</span>
                  {subService.price}
                </div>
                <div className="flex flex-col col-span-2">
                  <span>หน่วยการบริการ</span>
                  {subService.service_unit}
                </div>
              </div>
            ))}
          </div>
          {/* เส้นใต้ */}
          <div className="mt-4 border-t-1 border-[var(--gray-200)]"></div>
          {/* Create Time & Update Time */}
          <div className="flex flex-col justify-start gap-10 space-y-2">
            <div className="flex flex-row justify-start gap-10 space-y-2">
              <span className="w-40">สร้างเมื่อ</span>
              <span>
                {serviceData?.created_at
                  ? setDateTimeFormat(new Date(serviceData.created_at))
                  : 'N/A'}
              </span>
            </div>
            <div className="flex flex-row justify-start gap-10 space-y-2">
              <span className="w-40">แก้ไขล่าสุด</span>
              <span>
                {serviceData?.updated_at
                  ? setDateTimeFormat(new Date(serviceData.updated_at))
                  : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditServicePage
