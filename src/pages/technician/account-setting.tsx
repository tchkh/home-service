import React, { useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  technicianAccountSchema,
  TechnicianAccountFormData,
} from "@/schemas/technicianAccountSchema";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { Service, TechnicianServiceSettings } from "@/types";
import AddressAutocomplete from "@/components/AddressAutocomplete";
import MobileHeader from "@/components/shared/MobileHeader";
import ToggleSidebarComponent from "@/components/ToggleSidebarComponent";

const TechnicianAccountSettingsPage: React.FC = () => {
  const [allServices, setAllServices] = React.useState<Service[]>([]);
  const [address, setAddress] = React.useState<string>("");

  useEffect(() => {
    fetchTechnicianData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTechnicianData = async () => {
    try {
      const response = await axios.get(
        `/api/technician/setting/getTechnicianData`
      );
      const data = response.data;
      console.log("TechnicianData: ", data);
      setValue("firstName", data.first_name || "");
      setValue("lastName", data.last_name || "");
      setValue("tel", data.tel || "");
      setValue("currentLocation", data.address || "");
      setAddress(data.address || "");
      setValue(
        "technicianStatus",
        data.status === "active" ? "active" : "inactive"
      );

      const allServicesList = Array.isArray(data.allServices)
        ? data.allServices
        : [];
      setAllServices(allServicesList);
      console.log("AllServices: ", allServicesList);

      setValue(
        "servicesActive",
        Array.isArray(data.technician_services)
          ? data.technician_services
              .filter((service: TechnicianServiceSettings) => service.is_active)
              .map((service: TechnicianServiceSettings) => ({
                service_id: service.services.id || "",
                is_active: service.is_active === true ? true : false,
              }))
          : []
      );
    } catch (error) {
      console.error("Error fetching technician data:", error);
    }
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TechnicianAccountFormData>({
    resolver: zodResolver(technicianAccountSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      tel: "",
      currentLocation: "",
      servicesActive: [],
    },
  });

  useEffect(() => {
    console.log("formState.errors: ", errors);
  }, [errors]);

  const watchedTechnicianStatus = watch("technicianStatus");
  const watchedActiveServices = watch("servicesActive") || [];

  const handleRefreshLocation = () => {
    // Simulate getting current location
    navigator.geolocation.getCurrentPosition((position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      console.log("Current location:", latitude, longitude);
      setAddress(latitude + ", " + longitude);
      setValue("currentLocation", latitude + ", " + longitude);
    });
    toast.loading("ระบบกำลังอัพเดทตำแหน่งที่อยู่ปัจจุบันของคุณ...");
  };

  const handleServiceChange = (serviceId: number, checked: boolean) => {
    const currentServices = watchedActiveServices || [];
    if (checked) {
      setValue(
        "servicesActive",
        [...currentServices, { service_id: serviceId, is_active: checked }],
        {
          shouldDirty: true,
        }
      );
    } else {
      const updatedServices = currentServices.map((item) => {
        if (item.service_id === serviceId) {
          return { ...item, is_active: false }; // อัปเดต is_active เป็น false
        }
        return item; // คง item เดิมไว้ถ้า service_id ไม่ตรงกัน
      });
      setValue("servicesActive", updatedServices, {
        shouldDirty: true,
      });
    }
  };

  const onSubmit: SubmitHandler<TechnicianAccountFormData> = async (data) => {
    console.log("Form submitted with data:", data);

    try {
      const response = await axios.put(
        `/api/technician/setting/updateTechnicianData`,
        data
      );

      const technicianData = response.data;
      console.log("API Response:", technicianData);
      toast.success("ข้อมูลบัญชีของคุณได้รับการอัพเดทแล้ว");
      fetchTechnicianData();
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error("ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  return (
    <div className="flex flex-col min-h-screen ">
      <main className="flex-1 w-full bg-[var(--bg)] overflow-visible">
        <div className="w-full mx-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="bg-[var(--bg)]">
            {/* Mobile Header */}
            <MobileHeader />
            {/* Header */}
            <section className="relative flex items-center justify-between w-full h-fit px-4 md:px-8 py-5 md:py-5 mt-16 md:mt-0 bg-[var(--white)] border-b-1 border-[var(--gray-300)]">
              {/* Sidebar Button */}
              <ToggleSidebarComponent />
              <h1 className="text-heading-2 text-[var(--black)]">
                ตั้งค่าบัญชีผู้ใช้
              </h1>
              <div className="flex gap-2 md:gap-4">
                <Button
                  type="button"
                  className="w-18 md:w-24 h-10 btn btn--secondary"
                >
                  ยกเลิก
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-18 md:w-24 h-10 btn btn--primary"
                >
                  ยืนยัน
                </Button>
              </div>
            </section>
            <section className="flex flex-col gap-6 p-6 m-6 md:m-8 bg-[var(--white)] border-1 border-b-0 border-[var(--gray-200)] rounded-md">
              {/* Personal Information */}
              <div className="space-y-2">
                <div className="mb-4">
                  <h2 className="text-heading-2 text-[var(--black)]">
                    รายละเอียดบัญชี
                  </h2>
                </div>
                <div className="space-y-4">
                  <article className="flex flex-col gap-8">
                    <div className="flex items-center space-y-2">
                      <Label
                        htmlFor="firstName"
                        className="block min-w-4/10 md:min-w-64 text-heading-4 text-[var(--gray-700)] mb-0"
                      >
                        ชื่อ<span className="text-[var(--red)]">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="firstName"
                          {...register("firstName")}
                          className={`md:w-120 border-[var(--gray-300)] ${
                            errors.firstName ? "border-[var(--red)]" : ""
                          }`}
                        />
                        {errors.firstName && (
                          <p className="absolute bottom-[-20px] text-[10px] text-[var(--red)]">
                            {errors.firstName.message}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-y-2">
                      <Label
                        htmlFor="lastName"
                        className="block min-w-4/10 md:min-w-64 text-heading-4 text-[var(--gray-700)] mb-0"
                      >
                        นามสกุล<span className="text-[var(--red)]">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="lastName"
                          {...register("lastName")}
                          className={`md:w-120 border-[var(--gray-300)] ${
                            errors.lastName ? "border-[var(--red)]" : ""
                          }`}
                        />
                        {errors.lastName && (
                          <p className="absolute bottom-[-20px] text-[10px] text-[var(--red)]">
                            {errors.lastName.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-y-2">
                      <Label
                        htmlFor="tel"
                        className="block min-w-4/10 md:min-w-64 text-heading-4 text-[var(--gray-700)] mb-0"
                      >
                        เบอร์ติดต่อ<span className="text-[var(--red)]">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="tel"
                          {...register("tel")}
                          className={`md:w-120 border-[var(--gray-300)] ${
                            errors.tel ? "border-[var(--red)]" : ""
                          }`}
                        />
                        {errors.tel && (
                          <p className="absolute bottom-[-20px] text-[10px] text-[var(--red)]">
                            {errors.tel.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start space-y-2">
                      <Label
                        htmlFor="currentLocation"
                        className="block min-w-4/10 md:min-w-64 text-heading-4 text-[var(--gray-700)] mt-2 mb-0"
                      >
                        ตำแหน่งที่อยู่ปัจจุบัน
                        <span className="pl-0 text-[var(--red)]">*</span>
                      </Label>
                      <div className="flex flex-col md:flex-row md:gap-6 space-y-2">
                        <AddressAutocomplete
                          value={address}
                          onChange={setAddress}
                          onSelect={(result) =>
                            setValue("currentLocation", result.display_name)
                          }
                          className="w-42 h-23 md:w-120 border-1 border-[var(--gray-200)] rounded-xl"
                        />
                        {errors.currentLocation && (
                          <p className="absolute bottom-[-20px] text-[10px] text-[var(--red)]">
                            {errors.currentLocation.message}
                          </p>
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={handleRefreshLocation}
                          className="w-18 h-10 btn btn--secondary"
                        >
                          รีเฟรช
                        </Button>
                      </div>
                    </div>
                  </article>
                </div>
              </div>
              <div className="border-b border-[var(--gray-300)]"></div>

              {/* Service Status */}
              <article className="md:flex md:flex-row">
                <div className="mb-4">
                  <h2 className="md:w-64 text-heading-2 text-[var(--black)]">
                    สถานะบัญชี
                  </h2>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Switch
                      id="serviceStatus"
                      checked={watchedTechnicianStatus === "active"}
                      onCheckedChange={(checked) =>
                        setValue(
                          "technicianStatus",
                          checked ? "active" : "inactive"
                        )
                      }
                      className="cursor-pointer"
                    />
                    <div>
                      <p className="text-heading-5 text-[var(--gray-700)]">
                        พร้อมให้บริการ
                      </p>
                      <p className="text-sm text-gray-500">
                        ระบบจะแสดงให้ลูกค้าเห็นและสามารถส่งคำร่องขอบริการได้
                        หากคุณพร้อมให้บริการ
                      </p>
                    </div>
                  </div>
                </div>
              </article>
              <div className="border-b border-[var(--gray-200)]"></div>

              {/* Service Selection */}
              <article className="md:flex">
                <div className="md:flex md:w-64 mb-4">
                  <div className="text-heading-2 text-[var(--black)]">
                    บริการที่รับซ่อม
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex flex-col gap-5">
                    {Array.isArray(allServices) && allServices.length > 0 ? (
                      allServices.map((service: Service) => (
                        <div
                          key={service.id}
                          className="flex items-center space-x-4"
                        >
                          <Checkbox
                            id={service.id}
                            checked={watchedActiveServices.some(
                              (item: {
                                service_id: number;
                                is_active: boolean;
                              }) =>
                                item.service_id === Number(service.id) &&
                                item.is_active
                            )}
                            onCheckedChange={(checked) => {
                              handleServiceChange(
                                Number(service.id),
                                checked as boolean
                              );
                            }}
                            className="w-6 h-6 data-[state=checked]:bg-[var(--blue-600)] data-[state=checked]:border-[var(--blue-600)] data-[state=checked]:text-[var(--white)] data-[state=unchecked]:text-[var(--gray-700)] cursor-pointer"
                          />
                          <Label
                            htmlFor={service.id}
                            className="text-[var(--black)]"
                          >
                            {service.title}
                          </Label>
                        </div>
                      ))
                    ) : (
                      <p>ไม่พบบริการ</p>
                    )}
                  </div>
                  {errors.servicesActive && (
                    <p className="text-heading-5 text-[var(--red)] mt-2">
                      {errors.servicesActive.message}
                    </p>
                  )}
                </div>
              </article>
            </section>
          </form>
        </div>
        {/* เพิ่ม Toaster component ที่นี่เพื่อให้ toast สามารถแสดงผลได้ */}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 2000,
              iconTheme: {
                primary: '#4ade80',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
            loading: {
              iconTheme: {
                primary: '#3b82f6',
                secondary: '#fff',
              },
            },
          }}
        />
      </main>
    </div>
  );
};

export default TechnicianAccountSettingsPage;
