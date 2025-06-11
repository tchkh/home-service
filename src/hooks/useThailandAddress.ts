import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'

interface AddressData {
  id: number
  provinceCode: number
  provinceNameTh: string
  provinceNameEn: string
  districtCode: number
  districtNameTh: string
  districtNameEn: string
  subdistrictCode: number
  subdistrictNameTh: string
  subdistrictNameEn: string
  postalCode: number
}

// Export types เพื่อใช้ใน components อื่น
export interface Province {
  code: number
  nameTh: string
  nameEn: string
}

export interface District {
  code: number
  nameTh: string
  nameEn: string
}

export interface Subdistrict {
  code: number
  nameTh: string
  nameEn: string
  postalCode: number
}

export const useThailandAddress = () => {
  const [addresses, setAddresses] = useState<AddressData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadAddressData = async () => {
      try {
        // ใช้ข้อมูลจาก GitHub CDN
        const response = await axios.get<AddressData[]>(
          'https://raw.githubusercontent.com/thailand-geography-data/thailand-geography-json/main/src/geography.json'
        )

        // Cache ไว้ใน localStorage เพื่อลดการโหลดซ้ำ
        localStorage.setItem(
          'thailand-addresses',
          JSON.stringify(response.data)
        )
        localStorage.setItem(
          'thailand-addresses-timestamp',
          Date.now().toString()
        )

        setAddresses(response.data)
      } catch (error) {
        console.error('Failed to load address data:', error)

        // ถ้าโหลดไม่ได้ ลองดึงจาก cache
        const cached = localStorage.getItem('thailand-addresses')
        if (cached) {
          setAddresses(JSON.parse(cached))
        } else {
          setError('ไม่สามารถโหลดข้อมูลที่อยู่ได้')
        }
      } finally {
        setLoading(false)
      }
    }

    // เช็ค cache ก่อน (cache 7 วัน)
    const cached = localStorage.getItem('thailand-addresses')
    const cachedTimestamp = localStorage.getItem('thailand-addresses-timestamp')
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000

    if (
      cached &&
      cachedTimestamp &&
      Date.now() - parseInt(cachedTimestamp) < sevenDaysInMs
    ) {
      setAddresses(JSON.parse(cached))
      setLoading(false)
    } else {
      loadAddressData()
    }
  }, [])

  // ดึงรายชื่อจังหวัดทั้งหมด
  const provinces = useMemo((): Province[] => {
    const uniqueProvinces = new Map<number, Province>()

    addresses.forEach(addr => {
      if (!uniqueProvinces.has(addr.provinceCode)) {
        uniqueProvinces.set(addr.provinceCode, {
          code: addr.provinceCode,
          nameTh: addr.provinceNameTh,
          nameEn: addr.provinceNameEn,
        })
      }
    })

    return Array.from(uniqueProvinces.values()).sort((a, b) =>
      a.nameTh.localeCompare(b.nameTh, 'th')
    )
  }, [addresses])

  // ดึงอำเภอตามจังหวัด
  const getDistrictsByProvince = (provinceCode: number): District[] => {
    const districts = new Map<number, District>()

    addresses
      .filter(addr => addr.provinceCode === provinceCode)
      .forEach(addr => {
        if (!districts.has(addr.districtCode)) {
          districts.set(addr.districtCode, {
            code: addr.districtCode,
            nameTh: addr.districtNameTh,
            nameEn: addr.districtNameEn,
          })
        }
      })

    return Array.from(districts.values()).sort((a, b) =>
      a.nameTh.localeCompare(b.nameTh, 'th')
    )
  }

  // ดึงตำบลตามอำเภอ
  const getSubdistrictsByDistrict = (districtCode: number): Subdistrict[] => {
    return addresses
      .filter(addr => addr.districtCode === districtCode)
      .map(addr => ({
        code: addr.subdistrictCode,
        nameTh: addr.subdistrictNameTh,
        nameEn: addr.subdistrictNameEn,
        postalCode: addr.postalCode,
      }))
      .sort((a, b) => a.nameTh.localeCompare(b.nameTh, 'th'))
  }

  // ดึงรหัสไปรษณีย์
  const getPostalCode = (subdistrictCode: number): string => {
    const addr = addresses.find(a => a.subdistrictCode === subdistrictCode)
    return addr?.postalCode?.toString() || ''
  }

  // ค้นหาจังหวัด
  const searchProvinces = (query: string): Province[] => {
    const lowerQuery = query.toLowerCase()
    return provinces.filter(
      p =>
        p.nameTh.includes(query) || p.nameEn.toLowerCase().includes(lowerQuery)
    )
  }

  // หาชื่อจากรหัส
  const getProvinceByCode = (code: number): Province | undefined => {
    return provinces.find(p => p.code === code)
  }

  const getDistrictByCode = (
    provinceCode: number,
    districtCode: number
  ): District | undefined => {
    const districts = getDistrictsByProvince(provinceCode)
    return districts.find(d => d.code === districtCode)
  }

  const getSubdistrictByCode = (
    districtCode: number,
    subdistrictCode: number
  ): Subdistrict | undefined => {
    const subdistricts = getSubdistrictsByDistrict(districtCode)
    return subdistricts.find(s => s.code === subdistrictCode)
  }

  return {
    provinces,
    getDistrictsByProvince,
    getSubdistrictsByDistrict,
    getPostalCode,
    searchProvinces,
    getProvinceByCode,
    getDistrictByCode,
    getSubdistrictByCode,
    loading,
    error,
  }
}
