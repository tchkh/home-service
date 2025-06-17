import Navbar from "@/components/shared/Navbar";
import { useRouter } from "next/router";
import PoppularService from "@/components/PoppularService";
import Image from "next/image";
import futureHome from "../../public/asset/images/futureHome.png";
import { useResetBookingOnNavigation } from "@/hooks/useResetBookingOnNavigation";

export default function Home() {
   const router = useRouter();

   // Reset booking data when user navigates to home page
   useResetBookingOnNavigation();

   return (
      <div>
         <Navbar />
         {/* Hero Section */}

         <section className="bg-[color:var(--blue-100)] py-[5%]  overflow-hidden h-[704px] md:h-auto relative flex justify-center">
            <div className="max-w-[1400px]  w-full md:mx-20">
               <div className="container  px-4 md:px-30 relative z-10 ">
                  <div className="items-center">
                     <div className="md:text-left flex flex-col z-10 relative">
                        <h1 className="text-[40px] md:text-[64px] font-bold text-[color:var(--blue-700)] mb-4">
                           เรื่องบ้าน...ให้เราช่วยดูแลคุณ
                        </h1>
                        <h2 className="text-[20px] md:text-[42px] font-bold md:pb-[30px]">
                           “สะดวก ราคาคุ้มค่า เชื่อถือได้“
                        </h2>
                        <div className="text-[color:var(--gray-700)] mb-4 pt-[30px] ">
                           <p className="pr-[150px]">
                              ซ่อมเครื่องใช้ไฟฟ้า ซ่อมแอร์ ทำความสะอาดบ้าน
                           </p>
                           <p />
                           โดยพนักงานแม่บ้านและช่างมืออาชีพ
                        </div>

                        <button
                           className="btn btn--primary px-[32px] py-[12px] w-[191px] md:mt-[30px] mt-[15px]"
                           onClick={() => router.push("/serviceList")}
                        >
                           เช็คราคาบริการ
                        </button>
                     </div>
                  </div>
               </div>

               {/* Floating Image in Mobile */}
               {/* <div className="absolute right-0 bottom-0 md:right-[10%] "> */}
               <Image
                  src="/asset/images/plumber-pointing-lateral.png"
                  width={400}
                  height={400}
                  alt="plumber-pointing-lateral"
                  className="absolute lg:h-[90%] h-[50%] w-auto right-0 bottom-0 lg:right-[10%] object-cover md:h-[70%] md:-bottom-4"
               />
               {/* </div> */}
            </div>
         </section>

         {/* Services Section */}
         <section className="py-12">
            <div className="flex flex-col items-center gap-8">
               <h2 className="text-heading-2 md:text-heading-1 text-center">
                  บริการยอดฮิตของเรา
               </h2>
               <PoppularService />
               <button
                  className="btn btn--primary py-[10px] px-[24px]"
                  onClick={() => router.push("/serviceList")}
               >
                  ดูบริการท้ังหมด
               </button>
            </div>
         </section>

         {/* Join Us Section */}
         <section className="mt-30">
            <div className="relative overflow-hidden md:flex bg-[color:var(--blue-600)]">
               <div className="md:w-1/3 ">
                  <Image
                     src="/asset/images/construction-worker.png"
                     width={500}
                     height={500}
                     alt="construction-worker"
                     className="w-full md:w-full md:h-full md:object-cover"
                  />
               </div>
               <div className="z-2 md:w-2/3 p-[5%] h-[100%] pb-20">
                  <div className="text-[color:var(--white)]">
                     <h1 className="md:text-[40px] md:font-medium text-[32px]">
                        มาร่วมเป็นพนักงานซ่อมกับ HomeServices
                     </h1>
                     <p className="md:text-[20px] text-[16px] pt-[3%]">
                        เข้ารับการฝึกอบรมที่ได้มาตรฐาน ฟรี! <br />{" "}
                        และยังได้รับค่าตอบแทนที่มากขึ้นกว่าเดิม
                     </p>
                     <h3 className="md:text-[32px] text-[20px] pt-[3%]">
                        ติดต่อมาที่อีเมล: job@homeservices.co
                     </h3>
                  </div>
               </div>
               <Image
                  src={futureHome}
                  alt="futureHome"
                  width={500}
                  height={500}
                  priority={true}
                  className="hidden md:flex z-0 absolute w-auto h-[120%] -right-[98px] top-0 opacity-50"
               />
            </div>
         </section>
      </div>
   );
}
