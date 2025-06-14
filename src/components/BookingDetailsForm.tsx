import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { Calendar as CalendarIcon, Clock, MapPin, User } from 'lucide-react'
import { useBookingStore } from '@/stores/bookingStore'
import { customerInfoSchema, CustomerInfoForm } from '@/schemas/booking'
import {
  useThailandAddress,
  type District,
  type Subdistrict,
} from '@/hooks/useThailandAddress'
import { useUser } from '@/contexts/UserContext'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
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
  const { user } = useUser()
  const [gettingLocation, setGettingLocation] = useState(false)

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
  const [selectedSubdistrictCode, setSelectedSubdistrictCode] = useState<
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
      latitude: customerInfo.latitude,
      longitude: customerInfo.longitude,
    },
  })

  // Update store when form values change
  useEffect(() => {
    const subscription = form.watch(value => {
      updateCustomerInfo({
        serviceDate: value.serviceDate || null,
        serviceTime: value.serviceTime ?? '',
        address: value.address ?? '',
        province: value.province ?? '',
        district: value.district ?? '',
        subDistrict: value.subDistrict ?? '',
        additionalInfo: value.additionalInfo ?? '',
        latitude: value.latitude,
        longitude: value.longitude,
      })
    })
    return () => subscription.unsubscribe()
  }, [form, updateCustomerInfo])

  // GPS Location handler
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('เบราว์เซอร์ของคุณไม่รองรับ GPS')
      return
    }

    setGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords
        // Update form values
        form.setValue('latitude', latitude)
        form.setValue('longitude', longitude)
        // Update store
        updateCustomerInfo({ latitude, longitude })
        setGettingLocation(false)
        console.log('📍 GPS Location saved:', { latitude, longitude })
      },
      error => {
        console.error('GPS Error:', error)
        setGettingLocation(false)
        let message = 'ไม่สามารถระบุตำแหน่งได้'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'กรุณาอนุญาตให้เข้าถึงตำแหน่งที่ตั้ง'
            break
          case error.POSITION_UNAVAILABLE:
            message = 'ไม่สามารถระบุตำแหน่งได้ในขณะนี้'
            break
          case error.TIMEOUT:
            message = 'หมดเวลารอการระบุตำแหน่ง'
            break
        }
        alert(message)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    )
  }

  // Auto-fill user's default address
  const handleUseDefaultAddress = () => {
    if (
      !user?.address ||
      !user?.province ||
      !user?.district ||
      !user?.subdistrict
    ) {
      alert('คุณยังไม่มีที่อยู่เริ่มต้น กรุณาตั้งค่าที่อยู่ในหน้าโปรไฟล์')
      return
    }

    // Find and set dropdown selections first to populate the dropdown states
    const userProvince = provinces.find(p => p.nameTh === user.province)
    if (userProvince) {
      setSelectedProvinceCode(userProvince.code)
      const districtsList = getDistrictsByProvince(userProvince.code)
      setDistricts(districtsList)

      const userDistrict = districtsList.find(d => d.nameTh === user.district)
      if (userDistrict) {
        setSelectedDistrictCode(userDistrict.code)
        const subdistrictsList = getSubdistrictsByDistrict(userDistrict.code)
        setSubdistricts(subdistrictsList)

        const userSubdistrict = subdistrictsList.find(
          s => s.nameTh === user.subdistrict
        )
        if (userSubdistrict) {
          setSelectedSubdistrictCode(userSubdistrict.code)
          const postal = getPostalCode(userSubdistrict.code)
          setPostalCode(postal)
        }
      }
    }

    // Then set form values after a small delay to ensure dropdowns are populated
    setTimeout(() => {
      form.setValue('address', user.address)
      form.setValue('province', user.province)
      form.setValue('district', user.district)
      form.setValue('subDistrict', user.subdistrict)

      // Set additional info if user has postal code data
      if (user.postalCode) {
        form.setValue('additionalInfo', user.postalCode)
      }
    }, 100)
  }

  // Handle province selection
  const handleProvinceChange = (provinceCode: string) => {
    const code = parseInt(provinceCode)
    setSelectedProvinceCode(code)
    setSelectedDistrictCode(null)
    setSelectedSubdistrictCode(null)

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
    setSelectedSubdistrictCode(null)

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
    setSelectedSubdistrictCode(code)
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
      <div className="bg-white rounded-lg shadow p-4 md:p-6 space-y-6">
        <h2 className="text-lg md:text-xl font-semibold text-gray-800">
          กรอกข้อมูลบริการ
        </h2>

        <div className="flex flex-col gap-4 md:grid md:grid-cols-2 md:gap-6">
          <FormField
            control={form.control}
            name="serviceDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  วันที่สะดวกใช้บริการ <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Popover modal={true}>
                    <PopoverTrigger>
                      <button
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          'flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50',
                          'h-9 transition-colors cursor-pointer',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                        <span className="truncate">
                          {field.value
                            ? format(field.value, 'PPP', { locale: th })
                            : 'กรุณาเลือกวันที่'}
                        </span>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 z-50 border-gray-300"
                      align="start"
                      side="bottom"
                      sideOffset={4}
                      avoidCollisions={true}
                      collisionPadding={20}
                    >
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={date =>
                          date <
                          new Date(new Date().setDate(new Date().getDate() - 1))
                        }
                        locale={th}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="serviceTime"
            render={({ field }) => {
              const [tempTime, setTempTime] = useState({
                hour: '00',
                minute: '00',
              })
              const [isTimeOpen, setIsTimeOpen] = useState(false)

              // Initialize temp time when field value changes
              useEffect(() => {
                if (field.value) {
                  const [hour, minute] = field.value.split(':')
                  setTempTime({ hour, minute })
                }
              }, [field.value])

              const handleConfirmTime = () => {
                field.onChange(`${tempTime.hour}:${tempTime.minute}`)
                setIsTimeOpen(false)
              }

              return (
                <FormItem>
                  <FormLabel>
                    เวลาที่สะดวกใช้บริการ{' '}
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Popover open={isTimeOpen} onOpenChange={setIsTimeOpen}>
                      <PopoverTrigger>
                        <button
                          type="button"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            'flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50',
                            'h-9 transition-colors cursor-pointer',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          <Clock className="mr-2 h-4 w-4 text-gray-400" />
                          <span className="truncate">
                            {field.value || 'เลือกเวลา'}
                          </span>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="min-w-0 max-w-34 rounded-lg shadow-lg bg-white overflow-hidden z-50"
                        align="start"
                        side="bottom"
                        sideOffset={4}
                      >
                        <div className="flex">
                          {/* Hours Column */}
                          <div className="border-r border-gray-200">
                            <div className="max-h-[200px] overflow-y-auto w-16">
                              {Array.from({ length: 24 }, (_, i) => i).map(
                                hour => (
                                  <button
                                    key={hour}
                                    type="button"
                                    className={cn(
                                      'w-full px-3 py-2 hover:bg-blue-50 cursor-pointer text-center text-sm transition-colors focus:outline-none focus:bg-blue-100',
                                      tempTime.hour ===
                                        hour.toString().padStart(2, '0') &&
                                        'bg-blue-100'
                                    )}
                                    onClick={() => {
                                      setTempTime(prev => ({
                                        ...prev,
                                        hour: hour.toString().padStart(2, '0'),
                                      }))
                                    }}
                                  >
                                    {hour.toString().padStart(2, '0')}
                                  </button>
                                )
                              )}
                            </div>
                          </div>

                          {/* Minutes Column */}
                          <div>
                            <div className="max-h-[200px] overflow-y-auto w-16">
                              {Array.from({ length: 60 }, (_, i) => i).map(
                                minute => (
                                  <button
                                    key={minute}
                                    type="button"
                                    className={cn(
                                      'w-full px-3 py-2 hover:bg-blue-50 cursor-pointer text-center text-sm transition-colors focus:outline-none focus:bg-blue-100',
                                      tempTime.minute ===
                                        minute.toString().padStart(2, '0') &&
                                        'bg-blue-100'
                                    )}
                                    onClick={() => {
                                      setTempTime(prev => ({
                                        ...prev,
                                        minute: minute
                                          .toString()
                                          .padStart(2, '0'),
                                      }))
                                    }}
                                  >
                                    {minute.toString().padStart(2, '0')}
                                  </button>
                                )
                              )}
                            </div>
                          </div>
                        </div>
                        {/* Time Display and Confirm Button */}
                        <div className="border-t border-gray-200 px-3 py-2 flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">
                            {tempTime.hour}:{tempTime.minute}
                          </span>
                          <button
                            onClick={handleConfirmTime}
                            className="text-blue-700 underline text-sm font-bold px-2 cursor-pointer"
                          >
                            ยืนยัน
                          </button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )
            }}
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
                <div className="space-y-2">
                  <div className="relative">
                    <Input
                      placeholder="บ้านเลขที่, หมู่บ้าน, ซอย, ถนน"
                      {...field}
                      className="w-full"
                    />
                    <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                  {user?.address && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleUseDefaultAddress}
                      className="w-full md:w-auto border-blue-500 text-blue-600 hover:bg-blue-50"
                    >
                      <User className="w-4 h-4 mr-2" />
                      ใช้ที่อยู่เริ่มต้นของฉัน
                    </Button>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col gap-4 md:grid md:grid-cols-3 md:gap-6">
          <FormField
            control={form.control}
            name="province"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>
                  จังหวัด <span className="text-red-500">*</span>
                </FormLabel>
                <Select
                  value={selectedProvinceCode?.toString()}
                  onValueChange={handleProvinceChange}
                >
                  <FormControl>
                    <SelectTrigger className="h-10 min-w-0">
                      <SelectValue
                        placeholder="เลือกจังหวัด"
                        className="truncate"
                      >
                        {field.value || 'เลือกจังหวัด'}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent
                    className="z-50 max-w-[90vw] md:max-w-sm border-gray-300"
                    position="popper"
                    sideOffset={4}
                  >
                    <div className="p-2">
                      <Input
                        placeholder="ค้นหาจังหวัด..."
                        value={provinceSearch}
                        onChange={e => setProvinceSearch(e.target.value)}
                        className="mb-2 h-9"
                        onClick={e => e.stopPropagation()}
                      />
                    </div>
                    <div className="max-h-[200px] overflow-y-auto">
                      {filteredProvinces.map(province => (
                        <SelectItem
                          key={province.code}
                          value={province.code.toString()}
                          className="text-sm"
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
              <FormItem className="w-full">
                <FormLabel>
                  เขต/อำเภอ <span className="text-red-500">*</span>
                </FormLabel>
                <Select
                  value={selectedDistrictCode?.toString()}
                  onValueChange={handleDistrictChange}
                  disabled={!selectedProvinceCode}
                >
                  <FormControl>
                    <SelectTrigger className="h-10 min-w-0">
                      <SelectValue
                        placeholder="เลือกเขต/อำเภอ"
                        className="truncate"
                      >
                        {field.value || 'เลือกเขต/อำเภอ'}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent
                    className="z-50 max-w-[90vw] md:max-w-sm border-gray-300"
                    position="popper"
                    sideOffset={4}
                  >
                    <div className="max-h-[200px] overflow-y-auto">
                      {districts.map(district => (
                        <SelectItem
                          key={district.code}
                          value={district.code.toString()}
                          className="text-sm"
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
              <FormItem className="w-full">
                <FormLabel>
                  แขวง/ตำบล <span className="text-red-500">*</span>
                </FormLabel>
                <Select
                  value={selectedSubdistrictCode?.toString()}
                  onValueChange={handleSubdistrictChange}
                  disabled={!selectedDistrictCode}
                >
                  <FormControl>
                    <SelectTrigger className="h-10 min-w-0">
                      <SelectValue
                        placeholder="เลือกแขวง/ตำบล"
                        className="truncate"
                      >
                        {field.value || 'เลือกแขวง/ตำบล'}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent
                    className="z-50 max-w-[90vw] md:max-w-sm border-gray-300"
                    position="popper"
                    sideOffset={4}
                  >
                    <div className="max-h-[200px] overflow-y-auto">
                      {subdistricts.map(subdistrict => (
                        <SelectItem
                          key={subdistrict.code}
                          value={subdistrict.code.toString()}
                          className="text-sm"
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
                  className="w-full"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* GPS Location Button */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <h4 className="font-medium text-green-800">
                📍 ระบุตำแหน่งที่ตั้งแม่นยำ
              </h4>
              <p className="text-sm text-green-600 mt-1">
                ช่วยให้ช่างค้นหาตำแหน่งของคุณได้ง่ายขึ้น
              </p>
              {form.watch('latitude') && form.watch('longitude') && (
                <p className="text-xs text-green-700 mt-1">
                  ✅ ตำแหน่ง GPS ถูกบันทึกแล้ว
                </p>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGetLocation}
              className="border-green-500 text-green-600 hover:bg-green-50 cursor-pointer w-full md:w-auto"
            >
              <MapPin className="w-4 h-4 mr-2" />
              {gettingLocation ? 'กำลังค้นหา...' : 'ใช้ตำแหน่งปัจจุบัน'}
            </Button>
          </div>
        </div>
      </div>
    </Form>
  )
}

export default BookingDetailsForm
