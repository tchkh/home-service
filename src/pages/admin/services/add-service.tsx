import { useState } from "react"; // Hook สำหรับจัดการ state ใน Component
import { useForm, useFieldArray } from "react-hook-form"; // Hook สำหรับจัดการฟอร์มและอาร์เรย์ของฟิลด์
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Component Input จาก Shadcn UI
import { Label } from "@/components/ui/label"; // Component Label จาก Shadcn UI
import { Trash } from "lucide-react";
import { useRouter } from "next/router"; // Hook
// สำหรับจัดการการเปลี่ยนเส้นทางใน Next.js
import Image from "next/image";
import { serviceSchema, ServiceFormValues } from "../../../schemas/add-service";
import ToggleSidebarComponent from "@/components/ToggleSidebarComponent";
import { CategoryName } from "@/types";
import { useEffect } from "react";

function AddServicePage() {
   const router = useRouter();
   const [categories, setCategories] = useState<CategoryName[]>([]);
   // เพิ่ม state เก็บไฟล์จริงๆ (File) แยกจาก URL preview
   const [selectedFile, setSelectedFile] = useState<File | null>(null);
   const [selectedImage, setSelectedImage] = useState<string | null>(null);
   const [isSubmitting, setIsSubmitting] = useState(false);

   useEffect(() => {
      const fetchCategories = async () => {
         try {
            const result = await axios.get("/api/admin/services/getAllCategory");
            if (result.status === 200) {
               setCategories(result.data);
            }
         } catch (error) {
            console.error("Error fetching categories:", error);
            return;
         }
      };
      fetchCategories();
   }, []);

   // ตัดการ register ฟิลด์ "image" ออกไป เพราะเราจะควบคุมด้วย state แทน
   const {
      register,
      handleSubmit,
      control,
      formState: { errors },
      setValue, // ยังใช้ setValue สำหรับ zod validation ถ้าต้องการ
   } = useForm<ServiceFormValues>({
      resolver: zodResolver(serviceSchema),
      defaultValues: {
         sub_services: [{ title: "", price: 0, service_unit: "" }],
      },
   });

   const {
      // ดึงฟังก์ชันและ fields ที่จำเป็นจาก useFieldArray hook สำหรับจัดการอาร์เรย์ของบริการย่อย
      fields, // อาร์เรย์ของฟิลด์ที่ถูกจัดการ
      append, // ฟังก์ชันสำหรับเพิ่มฟิลด์ใหม่
      remove, // ฟังก์ชันสำหรับลบฟิลด์
   } = useFieldArray({ control, name: "sub_services" }); // เชื่อมต่อกับ control ของ useForm และระบุชื่อของอาร์เรย์

  // ฟังก์ชันที่ถูกเรียกเมื่อมีการ submit ฟอร์ม
  const onSubmit = async (data: ServiceFormValues) => {
    try {
      setIsSubmitting(true);
      // สร้าง FormData สำหรับ multipart/form-data
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("category", data.category);
      // เอาไฟล์จาก state ไป append
      if (selectedFile) {
        formData.append("image", selectedFile);
      } else {
        throw new Error("No image file selected");
      }
      // sub_services เป็น JSON string ให้ formidable มา parse
      formData.append("sub_services", JSON.stringify(data.sub_services));

         // เรียก API ด้วย multipart/form-data
         const result = await axios.post(
            "/api/admin/services/postService",
            formData
         );

         // ถ้าสร้างสำเร็จ ไปหน้า detail-service
         const newId = result.data.id as string;
         router.push(`/admin/services/detail-service?serviceId=${newId}`);
      } catch (err) {
         console.error("Error creating service:", err);
      }
   };

   // ฟังก์ชันสำหรับจัดการการยกเลิกและกลับไปยังหน้าก่อนหน้า
   const handleCancel = () => router.push("/admin/services");

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
    <main className={`flex min-h-screen bg-[var(--bg)]`}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full flex flex-col space-y-6"
      >
        {/* Header */}
        <header className="relative flex flex-row justify-between items-center h-24 pl-8 pr-15 py-5 bg-[var(--white)]">
          {/* Hide & Show sidebar */}
          <ToggleSidebarComponent />

          <h1 className="ml-5 text-heading-2 text-2xl font-semibold">เพิ่มบริการ</h1>
          {/* ปุ่ม */}
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              onClick={handleCancel}
              className="btn btn--secondary px-6 py-3"
            >
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isSubmitting} className="btn btn--primary px-6 py-3">
              สร้าง
            </Button>
          </div>
        </header>

        {/* Basic Info */}
        <section className="flex flex-col gap-[40px] w-[90%] max-w-[95%] mx-auto px-5 py-10 bg-[var(--white)] border-1 border-[var(--gray-200)] rounded-2xl shadow-lg overflow-hidden">
          {/* Service Name */}
          <section className="flex flex-row items-center gap-10 space-y-1">
            <Label htmlFor="title" className="block w-40 text-heading-5">
              ชื่อบริการ<span className="text-[var(--red)]">*</span>
            </Label>
            <Input
              id="title"
              autoComplete="off"
              className="w-80 border-1 border-[var(--gray-300)] text-sm"
              {...register("title", { required: true })}
            />
            {errors.title && (
              <p className="text-sm text-[var(--red)]">
                {errors.title.message}
              </p>
            )}
          </section>
          {/* Category */}
          <section className="flex flex-row gap-10 space-y-1">
            <Label htmlFor="category" className="block w-40 text-heading-5">
              หมวดหมู่<span className="text-[var(--red)]">*</span>
            </Label>
            <select
              id="category"
              className="w-80 h-9 pl-2 border-1 border-[var(--gray-300)] rounded-md text-sm"
              {...register("category", { required: true })}
            >
              <option value="">เลือกหมวดหมู่</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-sm text-[var(--red)]">
                {errors.category.message}
              </p>
            )}
          </section>
          {/* Image Upload */}
          <section className="flex flex-row items-start gap-10 space-y-1">
            <Label htmlFor="image-upload" className="block w-40 text-heading-5">
              รูปภาพ<span className="text-[var(--red)]">*</span>
            </Label>
            <div className="relative flex items-center justify-center w-80 min-h-40 p-6 rounded-md border-1 border-dashed border-[var(--gray-300)]">
              {selectedImage ? (
                <div className="w-full">
                  <Image
                    src={selectedImage}
                    alt="preview"
                    width={500}
                    height={300}
                    className="rounded object-contain"
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
                <div className="flex flex-col items-center text-center text-xs text-[var(--gray-700)]">
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
                id="image-upload"
                type="file"
                accept="image/*"
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
          </section>
          <div className="mt-4 border-t-1 border-[var(--gray-200)]"></div>
          {/* Sub Services */}
          <section className="flex flex-col justify-start gap-10 space-y-2">
            <Label className="text-heading-5">รายการบริการย่อย</Label>
            {fields.map(
              (
                field,
                idx // วนลูปผ่านรายการบริการย่อยที่ถูกจัดการโดย useFieldArray
              ) => (
                <div
                  key={field.id}
                  className="grid grid-cols-9 justify-between gap-2"
                >
                  <div className="flex flex-col col-span-4">
                    <span>ชื่อรายการ</span>
                    <Input
                      autoComplete="off"
                      {...register(`sub_services.${idx}.title` as const, {
                        required: true,
                      })}
                    />
                    {errors.sub_services?.[idx]?.title && (
                      <p className="text-xs text-[var(--red)]">
                        {errors.sub_services[idx].title.message}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col col-span-2">
                    <span>ค่าบริการ / 1 หน่วย</span>
                    <Input
                      autoComplete="off"
                      {...register(`sub_services.${idx}.price` as const, {
                        required: true,
                        valueAsNumber: true,
                      })}
                      onChange={(e) => handlePriceChange(e, idx)}
                    />
                    {errors.sub_services?.[idx]?.price && (
                      <p className="text-xs text-[var(--red)]">
                        {errors.sub_services[idx].price.message}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col col-span-2">
                    <span>หน่วยการบริการ</span>
                    <Input
                      autoComplete="off"
                      {...register(
                        `sub_services.${idx}.service_unit` as const,
                        {
                          required: true,
                        }
                      )}
                    />
                    {errors.sub_services?.[idx]?.service_unit && (
                      <p className="text-xs text-[var(--red)]">
                        {errors.sub_services[idx].service_unit.message}
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    className="w-[72px] pt-8 ml-2 btn text-[var(--gray-400)] underline cursor-hover"
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
          </section>
        </section>
      </form>
    </main>
  );
}

export default AddServicePage;
