import { useEffect, useState, useRef } from "react";
import axios from "axios";
import SideNavbar from "@/components/shared/SideNavbar";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { toast } from "react-hot-toast";
import { useUser } from "@/contexts/UserContext";
import { useThailandAddress } from "@/hooks/useThailandAddress";
import ProfileForm from "@/components/shared/ProfileForm";
import ProfileImageManager from "@/components/shared/ProfileImageManager";
import ProfileDialogs from "@/components/shared/ProfileDialogs";

const profileSchema = z.object({
  first_name: z.string().min(1, "กรุณากรอกชื่อ"),
  last_name: z.string().min(1, "กรุณากรอกนามสกุล"),
  tel: z.string().min(1, "กรุณากรอกเบอร์โทรศัพท์"),
  address: z.string().min(1, "กรุณากรอกที่อยู่"),
  subdistrict: z.string().min(1, "กรุณากรอกตำบล"),
  district: z.string().min(1, "กรุณากรอกอำเภอ"),
  province: z.string().min(1, "กรุณากรอกจังหวัด"),
});

type ProfileData = z.infer<typeof profileSchema> & {
  id: string;
  email: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
};

export default function ProfilePage() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  // สำเนาข้อมูลตอนเริ่ม เพื่อใช้กรณีกด “ยกเลิก” แล้วคืนค่าเดิม
  const [originalData, setOriginalData] = useState<ProfileData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showUploadConfirm, setShowUploadConfirm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { updateUser } = useUser();
  // Address related states
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<
    number | null
  >(null);
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<
    number | null
  >(null);
  const [selectedSubdistrictCode, setSelectedSubdistrictCode] = useState<
    number | null
  >(null);

  // เก็บ address codes ต้นแบบสำหรับการ reset
  const [originalProvinceCode, setOriginalProvinceCode] = useState<
    number | null
  >(null);
  const [originalDistrictCode, setOriginalDistrictCode] = useState<
    number | null
  >(null);
  const [originalSubdistrictCode, setOriginalSubdistrictCode] = useState<
    number | null
  >(null);

  const {
    provinces,
    getDistrictsByProvince,
    getSubdistrictsByDistrict,
    getProvinceByCode,
    getDistrictByCode,
    getSubdistrictByCode,
    loading: addressLoading,
  } = useThailandAddress();

  const profile = async () => {
    try {
      setIsLoading(true);

      const response = await axios.get("/api/user/profile");
      setProfileData(response.data.user);
      setOriginalData(response.data.user);
    } catch (error) {
      console.log(error);
      toast.error("ไม่สามารถโหลดข้อมูลโปรไฟล์ได้");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    profile();
  }, []);

  // Initialize address codes from existing profile data
  const initializeAddressCodes = (userData: ProfileData) => {
    if (!userData || addressLoading) return;

    const provinceCode = null;
    const districtCode = null;
    const subdistrictCode = null;

    // Find province code
    const province = provinces.find((p) => p.nameTh === userData.province);
    if (province) {
      setSelectedProvinceCode(province.code);

      // Find district code
      const districts = getDistrictsByProvince(province.code);
      const district = districts.find((d) => d.nameTh === userData.district);
      if (district) {
        setSelectedDistrictCode(district.code);

        // Find subdistrict code
        const subdistricts = getSubdistrictsByDistrict(district.code);
        const subdistrict = subdistricts.find(
          (s) => s.nameTh === userData.subdistrict
        );
        if (subdistrict) {
          setSelectedSubdistrictCode(subdistrict.code);
        }
      }
    }

    // บันทึก original codes
    setOriginalProvinceCode(provinceCode);
    setOriginalDistrictCode(districtCode);
    setOriginalSubdistrictCode(subdistrictCode);
  };

  // Re-initialize address codes when addresses are loaded
  useEffect(() => {
    if (!addressLoading && profileData) {
      initializeAddressCodes(profileData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressLoading, profileData]);

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    if (!profileData) return;

    setProfileData({
      ...profileData,
      [field]: value,
    });

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: "",
      });
    }
  };

  const handleProvinceChange = (provinceCode: string) => {
    const code = parseInt(provinceCode);
    const province = getProvinceByCode(code);

    if (province) {
      setSelectedProvinceCode(code);
      setSelectedDistrictCode(null);
      setSelectedSubdistrictCode(null);

      // ใช้ functional update เพื่อให้แน่ใจว่า state อัปเดต
      setProfileData((prev) => {
        if (!prev) return prev;
        const updated = {
          ...prev,
          province: province.nameTh,
          district: "",
          subdistrict: "",
        };
        return updated;
      });

      // Clear errors
      setErrors((prev) => ({
        ...prev,
        province: "",
        district: "",
        subdistrict: "",
      }));
    }
  };

  const handleDistrictChange = (districtCode: string) => {
    const code = parseInt(districtCode);
    const district = getDistrictByCode(selectedProvinceCode!, code);

    if (district) {
      setSelectedDistrictCode(code);
      setSelectedSubdistrictCode(null);

      // ใช้ functional update
      setProfileData((prev) => {
        if (!prev) return prev;
        const updated = {
          ...prev,
          district: district.nameTh,
          subdistrict: "",
        };
        return updated;
      });

      // Clear errors
      setErrors((prev) => ({
        ...prev,
        district: "",
        subdistrict: "",
      }));
    }
  };

  const handleSubdistrictChange = (subdistrictCode: string) => {
    const code = parseInt(subdistrictCode);
    const subdistrict = getSubdistrictByCode(selectedDistrictCode!, code);

    if (subdistrict) {
      setSelectedSubdistrictCode(code);
      // ใช้ functional update
      setProfileData((prev) => {
        if (!prev) return prev;
        const updated = {
          ...prev,
          subdistrict: subdistrict.nameTh,
        };
        return updated;
      });

      // Clear errors
      setErrors((prev) => ({
        ...prev,
        subdistrict: "",
      }));
    }
  };

  const handleEditProfile = () => {
    setIsEditMode(true);
  };

  const handleCancel = () => {
    if (originalData) {
      setProfileData(originalData);
    }

    setSelectedProvinceCode(originalProvinceCode);
    setSelectedDistrictCode(originalDistrictCode);
    setSelectedSubdistrictCode(originalSubdistrictCode);

    setIsEditMode(false);
    setErrors({});
  };

  const handleSave = async () => {
    if (!profileData) return;

    try {
      setIsLoading(true);
      setErrors({});

      // Validate data using schema
      const validationResult = profileSchema.safeParse({
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        tel: profileData.tel,
        address: profileData.address,
        subdistrict: profileData.subdistrict,
        district: profileData.district,
        province: profileData.province,
      });

      if (!validationResult.success) {
        const validationErrors: Record<string, string> = {};
        validationResult.error.errors.forEach((error) => {
          if (error.path[0]) {
            validationErrors[error.path[0] as string] = error.message;
          }
        });
        setErrors(validationErrors);
        toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
        return;
      }

      const response = await axios.put("/api/user/profile", {
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        tel: profileData.tel,
        address: profileData.address,
        subdistrict: profileData.subdistrict,
        district: profileData.district,
        province: profileData.province,
      });

      if (response.status === 200) {
        updateUser(response.data.user);
        // Update local state with response data
        setProfileData(response.data.user);
        setOriginalData(response.data.user);
        setIsEditMode(false);
        toast.success("บันทึกข้อมูลโปรไฟล์สำเร็จ");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error saving profile:", error);

      if (error.response && error.response.data) {
        // Handle specific validation errors from the server
        const serverErrors: Record<string, string> = {};
        error.response.data.details.forEach(
          (err: { path: string; message: string }) => {
            serverErrors[err.path] = err.message;
          }
        );
        setErrors(serverErrors);
      } else {
        toast.error("ไม่สามารถบันทึกข้อมูลโปรไฟล์ได้");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
    setIsDialogOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("ขนาดไฟล์ต้องไม่เกิน 5MB");
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
        setShowUploadConfirm(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadConfirm = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload.");
      return;
    }

    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append("avatar", selectedFile);

      const response = await axios.post("/api/user/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        // Update profile data with new image URL
        updateUser({ image_url: response.data.imageUrl });
        setProfileData((prev) =>
          prev ? { ...prev, image_url: response.data.imageUrl } : null
        );
        setOriginalData((prev) =>
          prev ? { ...prev, image_url: response.data.imageUrl } : null
        );

        toast.success("อัพโหลดรูปโปรไฟล์สำเร็จ");
        setShowUploadConfirm(false);
        setSelectedFile(null);
        setPreviewUrl(null);
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("ไม่สามารถอัพโหลดรูปโปรไฟล์ได้");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadCancel = () => {
    setShowUploadConfirm(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDeleteImage = async () => {
    setIsDialogOpen(false);
    setShowDeleteAlert(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);

      const response = await axios.delete("/api/user/avatar");

      if (response.status === 200) {
        updateUser({ image_url: response.data.imageUrl });
        // Update profile data to remove image URL
        setProfileData((prev) =>
          prev ? { ...prev, image_url: undefined } : null
        );
        setOriginalData((prev) =>
          prev ? { ...prev, image_url: undefined } : null
        );

        toast.success("ลบรูปโปรไฟล์สำเร็จ");
        setShowDeleteAlert(false);
      }
    } catch (error) {
      console.error("Error deleting avatar:", error);
      toast.error("ไม่สามารถลบรูปโปรไฟล์ได้");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading && !profileData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <section className="md:mt-0 md:mx-0 bg-[#F3F4F6]">
      {/* Desktop header */}
      <h1
        className="bg-[var(--blue-600)] py-2 px-4 rounded-[8px] my-5 md:my-0 text-[20px] text-[var(--white)] text-center hidden
        md:block md:rounded-[0px] md:h-[96px] md:text-[32px] content-center"
      >
        รายละเอียดบัญชี
      </h1>
      <main className="mb-5 md:mt-8 md:mx-50 ">
        <div className="flex flex-col md:flex-row md:gap-6">
          <SideNavbar />
          {/* Mobile header */}
          <h1 className="bg-[var(--blue-600)] py-2 px-4 mx-5 rounded-[8px] my-5 text-[20px] text-[var(--white)] text-center md:hidden">
            รายละเอียดบัญชี
          </h1>
          {/* content */}
          <div className="lg:w-3/4 mx-5 md:mx-0 mb-30">
            <div className="px-4 md:px-8 py-6 border-1 border-[var(--gray-300)] rounded-[8px] bg-[var(--white)] shadow-lg">
              {/* Profile Picture Section */}

              {profileData && (
                <ProfileImageManager
                  profileData={profileData}
                  isDialogOpen={isDialogOpen}
                  setIsDialogOpen={setIsDialogOpen}
                  isUploading={isUploading}
                  isDeleting={isDeleting}
                  handleUploadClick={handleUploadClick}
                  handleDeleteImage={handleDeleteImage}
                  handleFileChange={handleFileChange}
                  fileInputRef={fileInputRef}
                />
              )}

              {/* Form Section */}
              {profileData && (
                <ProfileForm
                  profileData={profileData}
                  errors={errors}
                  isEditMode={isEditMode}
                  isLoading={isLoading}
                  onChange={handleInputChange}
                  onEdit={handleEditProfile}
                  onSave={handleSave}
                  onCancel={handleCancel}
                  provinces={provinces}
                  getDistrictsByProvince={(provinceCode: string | number) =>
                    getDistrictsByProvince(
                      typeof provinceCode === "string"
                        ? parseInt(provinceCode)
                        : provinceCode
                    )
                  }
                  getSubdistrictsByDistrict={(districtCode: string | number) =>
                    getSubdistrictsByDistrict(
                      typeof districtCode === "string"
                        ? parseInt(districtCode)
                        : districtCode
                    )
                  }
                  selectedProvinceCode={selectedProvinceCode}
                  selectedDistrictCode={selectedDistrictCode}
                  selectedSubdistrictCode={selectedSubdistrictCode}
                  addressLoading={addressLoading}
                  handleProvinceChange={handleProvinceChange}
                  handleDistrictChange={handleDistrictChange}
                  handleSubdistrictChange={handleSubdistrictChange}
                />
              )}
            </div>
          </div>
        </div>
      </main>
      <ProfileDialogs
        showUploadConfirm={showUploadConfirm}
        setShowUploadConfirm={setShowUploadConfirm}
        previewUrl={previewUrl}
        handleUploadCancel={handleUploadCancel}
        handleUploadConfirm={handleUploadConfirm}
        isUploading={isUploading}
        showDeleteAlert={showDeleteAlert}
        setShowDeleteAlert={setShowDeleteAlert}
        handleDeleteConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </section>
  );
}
