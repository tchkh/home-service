import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react'
import { useBookingStore } from '@/stores/bookingStore'
import { customerInfoSchema, CustomerInfoForm } from '@/schemas/booking'
import {
  useThailandAddress,
  type District,
  type Subdistrict,
} from '@/hooks/useThailandAddress'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const BookingDetailsForm: React.FC = () => {
  const { customerInfo, updateCustomerInfo } = useBookingStore()

  // ใช้ Thailand Address Hook
  const {
    provinces,
    getDistrictsByProvince,
    getSubdistrictsByDistrict,
    getPostalCode,
    loading: addressLoading,
    error: addressError,
  } = useThailandAddress()

  // State สำหรับเก็บ code ของที่เลือก
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<
    number | null
  >(null)
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<
    number | null
  >(null)
  const [districts, setDistricts] = useState<District[]>([])
  const [subdistricts, setSubdistricts] = useState<Subdistrict[]>([])
  const [postalCode, setPostalCode] = useState<string>('')
  const form = useForm<CustomerInfoForm>({
    resolver: zodResolver(customerInfoSchema),
    defaultValues: {
      serviceDate: customerInfo.serviceDate || undefined,
      serviceTime: customerInfo.serviceTime,
      address: customerInfo.address,
      province: customerInfo.province,
      district: customerInfo.district,
      subDistrict: customerInfo.subDistrict,
      additionalInfo: customerInfo.additionalInfo,
    },
  })

  // Update store when form values change
  useEffect(() => {
    const subscription = form.watch(value => {
      updateCustomerInfo({
        serviceDate: value.serviceDate || null,
        serviceTime: value.serviceTime || '',
        address: value.address || '',
        province: value.province || '',
        district: value.district || '',
        subDistrict: value.subDistrict || '',
        additionalInfo: value.additionalInfo || '',
      })
    })
    return () => subscription.unsubscribe()
  }, [form, updateCustomerInfo])

  // Handle province selection
  const handleProvinceChange = (provinceCode: string) => {
    const code = parseInt(provinceCode)
    setSelectedProvinceCode(code)
    setSelectedDistrictCode(null)
    // หาชื่อจังหวัด
    const province = provinces.find(p => p.code === code)
    if (province) {
      form.setValue('province', province.nameTh)
      // โหลดอำเภอ
      const districtsList = getDistrictsByProvince(code)
      setDistricts(districtsList)
      setSubdistricts([])
      // Reset ค่าอื่นๆ
      form.setValue('district', '')
      form.setValue('subDistrict', '')
      setPostalCode('')
    }
  }

  // Handle district selection
  const handleDistrictChange = (districtCode: string) => {
    const code = parseInt(districtCode)
    setSelectedDistrictCode(code)
    // หาชื่ออำเภอ
    const district = districts.find(d => d.code === code)
    if (district) {
      form.setValue('district', district.nameTh)
      // โหลดตำบล
      const subdistrictsList = getSubdistrictsByDistrict(code)
      setSubdistricts(subdistrictsList)
      // Reset ค่าอื่นๆ
      form.setValue('subDistrict', '')
      setPostalCode('')
    }
  }

  // Handle subdistrict selection
  const handleSubdistrictChange = (subdistrictCode: string) => {
    const code = parseInt(subdistrictCode)
    // หาชื่อตำบลและรหัสไปรษณีย์
    const subdistrict = subdistricts.find(s => s.code === code)
    if (subdistrict) {
      form.setValue('subDistrict', subdistrict.nameTh)
      const postal = getPostalCode(code)
      setPostalCode(postal)
    }
  }

  // ค้นหาจังหวัด
  const [provinceSearch, setProvinceSearch] = useState('')
  const filteredProvinces = provinces.filter(
    p =>
      p.nameTh.includes(provinceSearch) ||
      p.nameEn.toLowerCase().includes(provinceSearch.toLowerCase())
  )
  if (addressLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">กำลังโหลดข้อมูลที่อยู่...</p>
          </div>
        </div>
      </div>
    )
  }

  if (addressError) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">เกิดข้อผิดพลาดในการโหลดข้อมูลที่อยู่</p>
        </div>
      </div>
    )
  }

  return (
    <Form {...form}>
      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <h2 className="text-xl font-semibold text-gray-800">
          กรอกข้อมูลบริการ
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="serviceDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  วันที่สะดวกใช้บริการ <span className="text-red-500">*</span>
                </FormLabel>

                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',

                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />

                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>กรุณาเลือกวันที่</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>

                  <PopoverContent
                    className="z-[99999] w-auto p-0"
                    style={{
                      pointerEvents: 'auto',
                      position: 'absolute',
                    }}
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={date =>
                        date <
                        new Date(new Date().setDate(new Date().getDate() - 1))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="serviceTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  เวลาที่สะดวกใช้บริการ <span className="text-red-500">*</span>
                </FormLabel>

                <FormControl>
                  <div className="relative">
                    <Input type="time" {...field} className="pr-10" />

                    <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                ที่อยู่ <span className="text-red-500">*</span>
              </FormLabel>

              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="บ้านเลขที่, หมู่บ้าน, ซอย, ถนน"
                    {...field}
                    className="pr-10"
                  />

                  <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="province"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  จังหวัด <span className="text-red-500">*</span>
                </FormLabel>

                <Select
                  value={selectedProvinceCode?.toString()}
                  onValueChange={handleProvinceChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกจังหวัด">
                        {field.value || 'เลือกจังหวัด'}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>

                  <SelectContent>
                    <div className="p-2">
                      <Input
                        placeholder="ค้นหาจังหวัด..."
                        value={provinceSearch}
                        onChange={e => setProvinceSearch(e.target.value)}
                        className="mb-2"
                      />
                    </div>

                    <div className="max-h-[200px] overflow-y-auto">
                      {filteredProvinces.map(province => (
                        <SelectItem
                          key={province.code}
                          value={province.code.toString()}
                        >
                          {province.nameTh}
                        </SelectItem>
                      ))}
                    </div>
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="district"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  เขต / อำเภอ <span className="text-red-500">*</span>
                </FormLabel>

                <Select
                  value={selectedDistrictCode?.toString()}
                  onValueChange={handleDistrictChange}
                  disabled={!selectedProvinceCode}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกเขต / อำเภอ">
                        {field.value || 'เลือกเขต / อำเภอ'}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>

                  <SelectContent>
                    <div className="max-h-[200px] overflow-y-auto">
                      {districts.map(district => (
                        <SelectItem
                          key={district.code}
                          value={district.code.toString()}
                        >
                          {district.nameTh}
                        </SelectItem>
                      ))}
                    </div>
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="subDistrict"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  แขวง / ตำบล <span className="text-red-500">*</span>
                </FormLabel>

                <Select
                  onValueChange={handleSubdistrictChange}
                  disabled={!selectedDistrictCode}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกแขวง / ตำบล">
                        {field.value || 'เลือกแขวง / ตำบล'}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>

                  <SelectContent>
                    <div className="max-h-[200px] overflow-y-auto">
                      {subdistricts.map(subdistrict => (
                        <SelectItem
                          key={subdistrict.code}
                          value={subdistrict.code.toString()}
                        >
                          {subdistrict.nameTh}
                        </SelectItem>
                      ))}
                    </div>
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {postalCode && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              รหัสไปรษณีย์: <strong>{postalCode}</strong>
            </p>
          </div>
        )}

        <FormField
          control={form.control}
          name="additionalInfo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ระบุข้อมูลเพิ่มเติม</FormLabel>

              <FormControl>
                <Textarea
                  placeholder="จุดสังเกต, รายละเอียดเพิ่มเติม เช่น ใกล้ 7-11, ตึกสีเหลือง ฯลฯ"
                  rows={3}
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Form>
  )
}

export default BookingDetailsForm
