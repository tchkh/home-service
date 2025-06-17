import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone, MapPin, Edit, Save, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPhoneNumber } from "@/utils/phone";

type Province = {
  code: number | string;
  nameTh: string;
};

type District = {
  code: number | string;
  nameTh: string;
};

type Subdistrict = {
  code: number | string;
  nameTh: string;
};

type ProfileData = {
  first_name?: string;
  last_name?: string;
  tel?: string;
  email?: string;
  address?: string;
  province?: string;
  district?: string;
  subdistrict?: string;
};

type Errors = {
  first_name?: string;
  last_name?: string;
  tel?: string;
  province?: string;
  district?: string;
  subdistrict?: string;
};

interface ProfileFormProps {
  profileData: ProfileData;
  errors: Errors;
  isEditMode: boolean;
  isLoading: boolean;
  onChange: (field: keyof ProfileData, value: string) => void;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  provinces: Province[];
  getDistrictsByProvince: (provinceCode: string | number) => District[];
  getSubdistrictsByDistrict: (districtCode: string | number) => Subdistrict[];
  selectedProvinceCode?: string | number | null;
  selectedDistrictCode?: string | number | null;
  selectedSubdistrictCode?: string | number | null;
  addressLoading: boolean;
  handleProvinceChange: (value: string) => void;
  handleDistrictChange: (value: string) => void;
  handleSubdistrictChange: (value: string) => void;
}

export default function ProfileForm({
  profileData,
  errors,
  isEditMode,
  isLoading,
  onChange,
  onEdit,
  onSave,
  onCancel,
  provinces,
  getDistrictsByProvince,
  getSubdistrictsByDistrict,
  selectedProvinceCode,
  selectedDistrictCode,
  selectedSubdistrictCode,
  addressLoading,
  handleProvinceChange,
  handleDistrictChange,
  handleSubdistrictChange,
}: ProfileFormProps) {
  return (
    <>
      {/* Form Section */}
      <div className="flex-1 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label
              htmlFor="firstName"
              className="text-sm font-medium text-[var(--gray-950)] flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              ชื่อ
            </Label>
            <Input
              id="firstName"
              type="text"
              value={profileData?.first_name || ""}
              onChange={(e) => onChange("first_name", e.target.value)}
              disabled={!isEditMode}
              className={`w-full px-4 py-3 border border-[var(--gray-300)] rounded-[8px] focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 ${
                errors.first_name ? "border-red-500" : ""
              }`}
              placeholder="กรอกชื่อ"
            />
            {errors.first_name && (
              <p className="text-red-500 text-sm">{errors.first_name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="lastName"
              className="text-sm font-medium text-[var(--gray-950)] flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              นามสกุล
            </Label>
            <Input
              id="lastName"
              type="text"
              value={profileData?.last_name || ""}
              onChange={(e) => onChange("last_name", e.target.value)}
              disabled={!isEditMode}
              className={`w-full px-4 py-3 border border-[var(--gray-300)] rounded-[8px] focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 ${
                errors.last_name ? "border-red-500" : ""
              }`}
              placeholder="กรอกนามสกุล"
            />
            {errors.last_name && (
              <p className="text-red-500 text-sm">{errors.last_name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="phone"
              className="text-sm font-medium text-[var(--gray-950)] flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              เบอร์โทรศัพท์
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formatPhoneNumber(profileData?.tel || "")}
              onChange={(e) => onChange("tel", e.target.value)}
              disabled={!isEditMode}
              className={`w-full px-4 py-3 border border-[var(--gray-300)] rounded-[8px] focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 ${
                errors.tel ? "border-red-500" : ""
              }`}
              placeholder="กรอกเบอร์โทรศัพท์"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-[var(--gray-950)] flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              อีเมล
            </Label>
            <Input
              id="email"
              type="email"
              value={profileData?.email || ""}
              disabled={true}
              className="w-full px-4 py-3 border border-[var(--gray-300)] rounded-[8px] focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="กรอกอีเมล"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="address"
              className="text-sm font-medium text-[var(--gray-950)] flex items-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              ที่อยู่
            </Label>
            <Input
              id="address"
              type="text"
              value={profileData?.address || ""}
              onChange={(e) => onChange("address", e.target.value)}
              disabled={!isEditMode}
              className="w-full px-4 py-3 border border-[var(--gray-300)] rounded-[8px] focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="กรอกที่อยู่"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="province"
              className="text-sm font-medium text-[var(--gray-950)] flex items-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              จังหวัด
            </Label>
            {isEditMode ? (
              <Select
                value={selectedProvinceCode?.toString() || ""}
                onValueChange={handleProvinceChange}
                disabled={addressLoading}
              >
                <SelectTrigger
                  className={`w-full px-4 py-3 border border-[var(--gray-300)] rounded-[8px] focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer ${
                    errors.province ? "border-red-500" : ""
                  }`}
                >
                  <SelectValue
                    placeholder={profileData?.province || "เลือกจังหวัด"}
                  />
                </SelectTrigger>
                <SelectContent className="bg-white max-h-60">
                  {provinces.map((province) => (
                    <SelectItem
                      key={province.code}
                      value={province.code.toString()}
                      className="hover:bg-gray-100 cursor-pointer"
                    >
                      {province.nameTh}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="province"
                type="text"
                value={profileData?.province || ""}
                disabled={true}
                className="w-full px-4 py-3 border border-[var(--gray-300)] rounded-[8px] focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="กรอกจังหวัด"
              />
            )}
            {errors.province && (
              <p className="text-red-500 text-sm">{errors.province}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="district"
              className="text-sm font-medium text-[var(--gray-950)] flex items-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              เขต/อำเภอ
            </Label>
            {isEditMode ? (
              <Select
                value={selectedDistrictCode?.toString() || ""}
                onValueChange={handleDistrictChange}
                disabled={!selectedProvinceCode || addressLoading}
              >
                <SelectTrigger
                  className={`w-full px-4 py-3 border border-[var(--gray-300)] rounded-[8px] focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer ${
                    errors.district ? "border-red-500" : ""
                  }`}
                >
                  <SelectValue
                    placeholder={profileData?.district || "เลือกเขต/อำเภอ"}
                  />
                </SelectTrigger>
                <SelectContent className="bg-white max-h-60">
                  {selectedProvinceCode &&
                    getDistrictsByProvince(selectedProvinceCode).map(
                      (district) => (
                        <SelectItem
                          key={district.code}
                          value={district.code.toString()}
                          className="hover:bg-gray-100 cursor-pointer"
                        >
                          {district.nameTh}
                        </SelectItem>
                      )
                    )}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="district"
                type="text"
                value={profileData?.district || ""}
                disabled={true}
                className="w-full px-4 py-3 border border-[var(--gray-300)] rounded-[8px] focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="กรอกเขต/อำเภอ"
              />
            )}
            {errors.district && (
              <p className="text-red-500 text-sm">{errors.district}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="subdistrict"
              className="text-sm font-medium text-[var(--gray-950)] flex items-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              แขวง/ตำบล
            </Label>
            {isEditMode ? (
              <Select
                value={selectedSubdistrictCode?.toString() || ""}
                onValueChange={handleSubdistrictChange}
                disabled={!selectedDistrictCode || addressLoading}
              >
                <SelectTrigger
                  className={`w-full px-4 py-3 border border-[var(--gray-300)] rounded-[8px] focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer ${
                    errors.subdistrict ? "border-red-500" : ""
                  }`}
                >
                  <SelectValue
                    placeholder={profileData?.subdistrict || "เลือกแขวง/ตำบล"}
                  />
                </SelectTrigger>
                <SelectContent className="bg-white max-h-60">
                  {selectedDistrictCode &&
                    getSubdistrictsByDistrict(selectedDistrictCode).map(
                      (subdistrict) => (
                        <SelectItem
                          key={subdistrict.code}
                          value={subdistrict.code.toString()}
                          className="hover:bg-gray-100 cursor-pointer"
                        >
                          {subdistrict.nameTh}
                        </SelectItem>
                      )
                    )}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="subdistrict"
                type="text"
                value={profileData?.subdistrict || ""}
                disabled={true}
                className="w-full px-4 py-3 border border-[var(--gray-300)] rounded-[8px] focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="กรอกแขวง/ตำบล"
              />
            )}
            {errors.subdistrict && (
              <p className="text-red-500 text-sm">{errors.subdistrict}</p>
            )}
          </div>
        </div>

        <div className="pt-4">
          {!isEditMode ? (
            <button
              type="button"
              onClick={onEdit}
              className="btn btn--primary w-full px-[24px] py-[10px] flex items-center justify-center"
              disabled={isLoading}
            >
              <Edit className="w-4 h-4 mr-2" />
              แก้ไขโปรไฟล์
            </button>
          ) : (
            <div className="flex gap-7 content-center justify-center">
              <button
                type="button"
                onClick={onSave}
                className="btn btn--primary w-full px-[24px] py-[10px]"
              >
                <Save className="w-4 h-4 mr-2" />
                บันทึก
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="btn btn--secondary w-full px-[24px] py-[10px]"
              >
                <X className="w-4 h-4 mr-2" />
                ยกเลิก
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
