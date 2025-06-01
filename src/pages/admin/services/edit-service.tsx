import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { ArrowLeft, Trash, AlertTriangle } from "lucide-react";
import { useRouter } from "next/router"; // เพิ่ม import useRouter
import { useSidebar } from "@/contexts/SidebarContext";
import Image from "next/image";
import {
  serviceSchema,
  ServiceFormValues,
} from "../../../schemas/edit-service";

function EditServicePage() {
  const router = useRouter(); // สร้าง router instance
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  // เพิ่ม state เก็บไฟล์จริงๆ (File) แยกจาก URL preview
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [serviceData, setServiceData] = useState<ServiceFormValues | null>(
    null
  );
  const serviceId = router.query.serviceId;

  // ฟังก์ชันสําหรับดึงข้อมูล Service จาก API
  useEffect(() => {
    const fetchServiceData = async (serviceId: string) => {
      try {
        if (!serviceId) return; // ถ้าไม่มี serviceId ให้หยุดการทำงาน

        const result = await axios.get(
          `/api/admin/services/getServiceById?serviceId=${serviceId}`
        );
        if (result.status === 200) {
          setServiceData({
            title: result.data.title || "",
            category: result.data.category?.name || "",
            image: result.data.image_url || "",
            sub_services: result.data.sub_services || [],
            created_at: result.data.created_at || "",
            updated_at: result.data.updated_at || "",
          });
          setSelectedImage(result.data.image_url);
          setSelectedFile(null);
          console.log(
            "EditServicePage: Response from backend (getServiceById) : ",
            result.data
          );
        }
      } catch (error) {
        console.error("Error fetching service data:", error);
        return;
      }
    };

    if (serviceId) {
      fetchServiceData(serviceId as string);
    }

    console.log("EditServicePage: serviceId for (getServiceById)", serviceId);
  }, [serviceId]);

  // react-hook-form + zod
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {},
    mode: "onChange",
  });

  // **ใช้ useEffect เพื่ออัปเดต Form ด้วยข้อมูลที่ดึงมา**
  useEffect(() => {
    if (serviceData) {
      reset(serviceData);
      console.log(
        "EditServicePage: serviceData for (putServiceById)",
        serviceData
      );
    }
  }, [serviceData, reset]);

  // ใช้ name: "sub_services" ให้ตรงกับ schema
  const { fields, append, remove } = useFieldArray({
    control,
    name: "sub_services",
  });

  const setDateTimeFormat = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const amPm = date.getHours() >= 12 ? "PM" : "AM";
    return `${day}/${month}/${year} ${hours}:${minutes}${amPm}`;
  };

  // ฟังก์ชันที่ถูกเรียกเมื่อมีการ submit ฟอร์ม
  const onSubmit = async (data: ServiceFormValues) => {
    try {
      const formData = new FormData();
      formData.append("title", data.title); // ใช้ serviceName ตาม schema
      formData.append("category", data.category);

      // จัดการรูปภาพ
      if (selectedFile) {
        formData.append("image", selectedFile); // ส่ง File
      } else if (selectedImage) {
        formData.append("image", selectedImage); // ส่ง URL ในรูป string
      }

      // sub_services เป็น JSON string
      formData.append("sub_services", JSON.stringify(data.sub_services)); // ใช้ sub_services ตาม schema

      // ดึง serviceId จาก URL query parameter
      const serviceId = router.query.serviceId as string;

      if (!serviceId) {
        console.error("No serviceId provided");
        return;
      } // ถ้าไม่มี serviceId ให้หยุดการทำงาน

      // เรียก API ด้วย PUT method ไปที่ Endpoint สำหรับแก้ไข
      const result = await axios.put(
        `/api/admin/services/putServiceById?serviceId=${serviceId}`,
        formData
      );

      if (result.status === 200) {
        console.log(
          "EditServicePage: Response from backend (putServiceById) :",
          result.data
        );
      }

      // ถ้าแก้ไขสำเร็จ ไปหน้า detail-service
      router.push(`/admin/services/detail-service?serviceId=${serviceId}`);
    } catch (err) {
      console.error("Error updating service:", err);
      // จัดการ Error (เช่น แสดงข้อความผิดพลาดให้ผู้ใช้)
    }
  };

  const handleCancel = () =>
    router.push("/admin/services/detail-service?serviceId=" + serviceId);

  const handleGoBack = () => router.push("/admin/services/service");

  // ฟังก์ชันสำหรับจัดการเมื่อมีการเปลี่ยนแปลงไฟล์รูปภาพ
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      // เก็บ URL preview
      setSelectedImage(URL.createObjectURL(file));
      // เก็บไฟล์จริงๆ ไว้ใน state
      setSelectedFile(file);
      setValue("image", file, { shouldValidate: true });
      setValue("image", file as File, { shouldValidate: true });
    }
    console.log(
      "Selected image (preview URL):",
      file ? URL.createObjectURL(file) : null
    );
    console.log("Selected file:", file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setSelectedFile(null);
    setValue("image", null, { shouldValidate: true });
  };

  const handlePriceChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = event.target.value;
    setValue(`sub_services.${index}.price`, Number(value), {
      shouldValidate: true,
    });
  };

  const handleDeleteService = async () => {
    try {
      // ดึง serviceId จาก URL query parameter
      const serviceId = router.query.serviceId as string;

      if (!serviceId) {
        console.error("No serviceId provided");
        return;
      } // ถ้าไม่มี serviceId ให้หยุดการทำงาน

      const result = await axios.delete(
        `/api/admin/services/deleteServiceById?serviceId=${serviceId}`
      );
      if (result.status === 200) {
        console.log(
          "EditServicePage: Response from backend (deleteServiceById) :",
          result.data
        );
      }
      router.push("/admin/services/service");
    } catch (err) {
      console.error("Error deleting service:", err);
    }
  };

  const handleRemoveSubService = (index: number) => {
    if (index > 0) {
      remove(index);
    } else {
      remove(index);
      append({
        title: "",
        price: 0,
        service_unit: "",
      });
    }
  };

  return (
    <div className={` flex min-h-screen bg-[var(--bg)]`}>
      <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col">
        {/* Header */}
        <div className="relative flex flex-row justify-between items-center px-8 py-5 bg-[var(--white)]">
          <Button
            type="button"
            onClick={toggleSidebar}
            className="absolute top-7 -left-3 bg-[var(--blue-950)] hover:bg-[var(--blue-800)] active:bg-[var(--blue-900)] border-1 border-[var(--gray-200)] cursor-pointer"
          >
            {isSidebarOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-chevron-left-icon lucide-chevron-left"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-chevron-right-icon lucide-chevron-right"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            )}
          </Button>
          <div className="flex items-center space-x-4">
            <Button
              type="button"
              variant="ghost"
              className="p-2 hover:bg-[var(--gray-100)]  active:bg-[var(--gray-200)] cursor-pointer rounded-full"
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
              onClick={handleCancel}
              className="btn btn--secondary px-6 py-3"
            >
              ยกเลิก
            </Button>
            <Button type="submit" className="btn btn--primary px-6 py-3">
              บันทึก
            </Button>
          </div>
        </div>

        {/* Basic Info */}
        <div className="flex flex-col gap-[40px] w-[90%] max-w-[95%] mx-auto px-5 py-10 mt-6 bg-[var(--white)] border-1 border-[var(--gray-200)] rounded-2xl shadow-lg overflow-hidden">
          {/* ชื่อบริการ */}
          <div className="flex flex-row gap-10 space-y-1">
            <Label htmlFor="title" className="w-40 text-heading-5">
              ชื่อบริการ <span className="text-[var(--red)]">*</span>
            </Label>
            <Input
              id="title"
              autoComplete="off"
              className="w-80 border-1 border-[var(--gray-300)] text-body-1"
              {...register("title", { required: true })}
              defaultValue={serviceData?.title}
            />
            {errors.title && (
              <p className="text-sm text-[var(--red)]">
                {errors.title.message}
              </p>
            )}
          </div>
          {/* หมวดหมู่ */}
          <div className="flex flex-row gap-10 space-y-1">
            <Label htmlFor="category" className="w-40 text-heading-5">
              หมวดหมู่ <span className="text-[var(--red)]">*</span>
            </Label>
            <select
              id="category"
              className="w-80 border-1 border-[var(--gray-300)] rounded-sm text-body-1"
              {...register("category", { required: true })}
              defaultValue={serviceData?.category}
            >
              <option value="">เลือกหมวดหมู่</option>
              <option value="บริการทั่วไป">บริการทั่วไป</option>
              <option value="บริการห้องครัว">บริการห้องครัว</option>
              <option value="บริการห้องน้ํา">บริการห้องน้ํา</option>
            </select>
            {errors.category && (
              <p className="text-sm text-[var(--red)]">
                {errors.category.message}
              </p>
            )}
          </div>
          {/* Image Upload */}
          <div className="flex flex-row items-start gap-10 space-y-1">
            <Label htmlFor="image-upload" className="w-40 text-heading-5">
              รูปภาพ <span className="text-[var(--red)]">*</span>
            </Label>
            <div className="relative w-80 rounded-md border-1 border-dashed border-[var(--gray-300)] p-6 flex items-center justify-center">
              {selectedImage ? (
                <div className="w-full">
                  <Image
                    src={selectedImage}
                    alt="preview"
                    width={500}
                    height={300}
                    className="rounded object-contain "
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    className="absolute bottom-[-36px] right-[-10px] btn btn--ghost text-xs text-[var(--blue-600)] cursor-hover"
                    onClick={handleRemoveImage}
                  >
                    <Trash className="h-4 w-4" /> ลบรูปภาพ
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center text-[var(--gray-700)]">
                  <Image
                    src="/asset/svgs/add-image.svg"
                    alt="Add Image Icon"
                    width={50}
                    height={50}
                    className="w-10 h-10 mb-2 text-[var(--gray-400)]"
                  />
                  <p>
                    <span className="text-[var(--blue-600)]">
                      อัปโหลดรูปภาพ
                    </span>{" "}
                    หรือ ลากและวางที่นี่
                  </p>
                  <p className="text-xs">PNG, JPG ไม่เกิน 5MB</p>
                </div>
              )}
              <Input
                type="file"
                accept="image/*"
                {...register("image")}
                onChange={handleImageChange}
                autoComplete="off"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <span className="absolute bottom-[-26px] left-0 text-xs text-[var(--gray-700)]">
                ขนาดภาพที่แนะนำ: 1440 x 225 PX
              </span>
            </div>
            {errors.image && (
              <p className="text-sm text-[var(--red)]">
                {errors.image.message as string}
              </p>
            )}
          </div>
          <div className="mt-4 border-t-1 border-[var(--gray-200)]"></div>
          {/* Sub-services */}
          <div className="flex flex-col justify-start gap-10 space-y-2">
            <Label>รายการบริการย่อย</Label>
            {fields.map(
              (
                field,
                idx // วนลูปผ่านรายการบริการย่อยที่ถูกจัดการโดย useFieldArray
              ) => (
                <div
                  key={field.id}
                  className="grid grid-cols-9 justify-between gap-4"
                >
                  <div className="flex flex-col col-span-4">
                    <span>
                      ชื่อรายการ <span className="text-[var(--red)]">*</span>
                    </span>
                    <Input
                      autoComplete="off"
                      {...register(`sub_services.${idx}.title` as const, {
                        required: true,
                      })}
                      defaultValue={serviceData?.sub_services[idx]?.title}
                    />
                    {errors.sub_services?.[idx]?.title && (
                      <p className="text-xs text-[var(--red)]">
                        {errors.sub_services[idx].title.message}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col col-span-2">
                    <span>
                      ค่าบริการ / 1 หน่วย{" "}
                      <span className="text-[var(--red)]">*</span>
                    </span>
                    <Input
                      autoComplete="off"
                      {...register(`sub_services.${idx}.price` as const, {
                        required: true,
                        valueAsNumber: true,
                      })}
                      defaultValue={Number(
                        serviceData?.sub_services[idx]?.price
                      )}
                      onChange={(e) => handlePriceChange(e, idx)}
                    />
                    {errors.sub_services?.[idx]?.price && (
                      <p className="text-xs text-[var(--red)]">
                        {errors.sub_services[idx].price.message}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col col-span-2">
                    <span>
                      หน่วยการบริการ{" "}
                      <span className="text-[var(--red)]">*</span>
                    </span>
                    <Input
                      autoComplete="off"
                      {...register(
                        `sub_services.${idx}.service_unit` as const,
                        {
                          required: true,
                        }
                      )}
                      defaultValue={
                        serviceData?.sub_services[idx]?.service_unit
                      }
                    />
                    {errors.sub_services?.[idx]?.service_unit && (
                      <p className="text-xs text-[var(--red)]">
                        {errors.sub_services[idx].service_unit.message}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="default"
                    type="button"
                    className="justify-self-end w-[72px] pt-6 btn btn--ghost text-[var(--gray-400)]"
                    onClick={() => {
                      handleRemoveSubService(idx);
                    }}
                  >
                    ลบรายการ
                  </Button>
                </div>
              )
            )}
            <Button
              type="button"
              className="btn btn--secondary w-[185px] px-[24px] py-[10px]"
              onClick={() => append({ title: "", price: 0, service_unit: "" })}
            >
              เพิ่มรายการ +
            </Button>
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
                  : "N/A"}
              </span>
            </div>
            <div className="flex flex-row justify-start gap-10 space-y-2">
              <span className="w-40">แก้ไขล่าสุด</span>
              <span>
                {serviceData?.updated_at
                  ? setDateTimeFormat(new Date(serviceData.updated_at))
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>
        {/* ปุ่มลบ service */}
        <div className="flex justify-end mr-8">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className="underline text-[var(--gray-600)] flex items-center space-x-1"
              >
                <Trash />
                <span>ลบบริการ</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-[var(--white)] rounded-lg shadow-md p-6 w-96">
              {/* ไอคอนเตือนตรงกลาง */}
              <div className="flex justify-center">
                <AlertTriangle className="w-10 h-10 text-[var(--red)]" />
              </div>
              <AlertDialogHeader className="text-center">
                <AlertDialogTitle className="flex justify-center text-lg font-semibold text-[var(--gray-950)]">
                  ยืนยันการลบรายการ?
                </AlertDialogTitle>
                <AlertDialogDescription className="flex justify-center text-center mt-2 text-md text-[var(--gray-700)]">
                  คุณต้องการลบรายการ ‘{serviceData?.title}’
                  <br />
                  ใช่หรือไม่
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex flex-row justify-center sm:flex-row sm:justify-center items-center gap-2 mt-2">
                <AlertDialogAction
                  onClick={handleDeleteService}
                  className="w-1/3 px-4 py-2 btn btn--primary"
                >
                  ลบรายการ
                </AlertDialogAction>
                <AlertDialogCancel className="w-1/3 px-4 py-2 btn btn--secondary">
                  ยกเลิก
                </AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </form>
    </div>
  );
}

export default EditServicePage;
