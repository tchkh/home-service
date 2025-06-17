import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ServiceFormValues } from "../../../types/index";
import ToggleSidebarComponent from "@/components/ToggleSidebarComponent";
import { formatThaiDatetime } from "@/utils/datetime";

function EditServicePage() {
  const router = useRouter();
  const [serviceData, setServiceData] = useState<ServiceFormValues | null>(
    null
  );
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const serviceId = router.query.serviceId;

  useEffect(() => {
    const fetchServiceData = async (id: string) => {
      setIsLoading(true);
      setFetchError(null);
      try {
        if (!id) {
          setIsLoading(false);
          return;
        }

        const result = await axios.get(
          `/api/admin/services/getServiceById?serviceId=${id}`
        );

        if (result.status === 200 && result.data) {
          const serviceData = result.data.service;
          console.log("[DEBUG] serviceData: ", serviceData);
          let imageUrl = serviceData.image_url || "";
          // ตรวจสอบและปรับปรุง URL รูปภาพ
          if (imageUrl && !imageUrl.startsWith('http')) {
            imageUrl = `https://${imageUrl}`;
          }

          setServiceData({
            title: serviceData.title || "",
            category: serviceData.category?.name || "",
            image: imageUrl || "",
            created_at: serviceData.created_at || "",
            updated_at: serviceData.updated_at || "",
            sub_services: serviceData.sub_services || [],
          });
        } else {
          setFetchError(
            "ไม่สามารถดึงข้อมูลบริการได้: " +
              (result.data.message || "Unknown error")
          );
        }
      } catch (error) {
        console.error("Error fetching service data:", error);
        setFetchError("ไม่สามารถโหลดข้อมูลบริการได้ กรุณาลองใหม่อีกครั้ง");
      } finally {
        setIsLoading(false);
      }
    };

    if (serviceId) {
      fetchServiceData(serviceId as string);
    }

  }, [serviceId]);

  const handleEdit = () =>
    router.push("/admin/services/edit-service?serviceId=" + serviceId);

  const handleGoBack = () => router.push("/admin/services");

  if (isLoading) {
    return (
      <main className="flex min-h-screen bg-[var(--bg)] items-center justify-center">
        <div>กำลังโหลดข้อมูล...</div>
      </main>
    );
  }

  if (fetchError) {
    return (
      <main className="flex min-h-screen bg-[var(--bg)] items-center justify-center flex-col p-4">
        <h2 className="text-xl font-semibold text-red-600 mb-2">
          เกิดข้อผิดพลาด
        </h2>
        <p className="text-gray-700 text-center">{fetchError}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          ลองอีกครั้ง
        </Button>
      </main>
    );
  }
  return (
    <main className={`flex min-h-screen bg-[var(--bg)]`}>
      <section className="w-full flex flex-col mb-16 space-y-6">
        {/* Header */}
        <header className="relative flex flex-row justify-between items-center h-24 pl-12 pr-10 py-5 bg-[var(--white)]">
          {/* Hide & Show sidebar */}
          <ToggleSidebarComponent />
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
        </header>

        {/* Basic Info */}
        <section className="flex flex-col gap-[40px] w-[90%] max-w-[95%] mx-auto px-5 py-10 bg-[var(--white)] border-1 border-[var(--gray-200)] rounded-2xl shadow-lg overflow-hidden">
          {/* Service Name */}
          <section className="flex flex-row items-center gap-10 space-y-1">
            <h2 className="w-40 text-heading-5 text-[var(--gray-700)]">
              ชื่อบริการ
            </h2>
            <span className="w-80 text-sm">{serviceData?.title}</span>
          </section>
          {/* Category */}
          <section className="flex flex-row items-center gap-10 space-y-1">
            <h2 className="w-40 text-heading-5 text-[var(--gray-700)]">
              หมวดหมู่
            </h2>
            <span className="w-80 text-sm">{serviceData?.category}</span>
          </section>
          {/* Image Upload */}
          <section className="flex flex-row items-start gap-10 space-y-1">
            <h2 className="w-40 text-heading-5 text-[var(--gray-700)]">
              รูปภาพ
            </h2>
            <div className="w-80">
              {serviceData?.image ? (
                <Image
                  src={serviceData.image}
                  alt={serviceData.title || "Service Image"}
                  width={500}
                  height={300}
                  className="object-contain rounded"
                />
              ) : null}
            </div>
          </section>
          <div className="mt-4 border-t-2 border-[var(--gray-200)]"></div>
          {/* Sub-services */}
          <section className="flex flex-col justify-start gap-10 space-y-2">
            <h2 className="text-heading-5 text-[var(--gray-700)]">
              รายการบริการย่อย
            </h2>
            {serviceData?.sub_services?.map((subService) => (
              <div
                key={subService.id}
                className="grid grid-cols-8 justify-between items-center gap-4"
              >
                <div className="flex flex-col col-span-4">
                  <h2 className="text-body-3 text-[var(--gray-700)]">
                    ชื่อรายการ
                  </h2>
                  <span className="text-body-3 text-[var(--black)]">
                    {subService.title}
                  </span>
                </div>
                <div className="flex flex-col col-span-2">
                  <h2 className="text-body-3 text-[var(--gray-700)]">
                    ค่าบริการ / 1 หน่วย
                  </h2>
                  <span className="text-body-3 text-[var(--black)]">
                    {subService.price}
                  </span>
                </div>
                <div className="flex flex-col col-span-2">
                  <span className="text-body-3 text-[var(--gray-700)]">
                    หน่วยการบริการ
                  </span>
                  <span className="text-body-3 text-[var(--black)]">
                    {subService.service_unit}
                  </span>
                </div>
              </div>
            ))}
          </section>
          {/* เส้นใต้ */}
          <div className="mt-4 border-t-2 border-[var(--gray-200)]"></div>
          {/* Create Time & Update Time */}
          <section className="flex flex-col justify-start gap-10 space-y-2">
            <div className="flex flex-row justify-start items-center gap-10 space-y-2">
              <span className="w-40 text-heading-5 text-[var(--gray-700)]">
                สร้างเมื่อ
              </span>
              <span className="text-body-3 text-[var(--gray-900)]">
                {serviceData?.created_at
                  ? formatThaiDatetime(serviceData.created_at)
                  : "ไม่ระบุ"}
              </span>
            </div>
            <div className="flex flex-row justify-start items-center gap-10 space-y-2">
              <span className="w-40 text-heading-5 text-[var(--gray-700)]">
                แก้ไขล่าสุด
              </span>
              <span className="text-body-3 text-[var(--gray-900)]">
                {serviceData?.updated_at
                  ? formatThaiDatetime(serviceData.updated_at)
                  : "ไม่ระบุ"}
              </span>
            </div>
          </section>
        </section>
      </section>
    </main>
  );
}

export default EditServicePage;
