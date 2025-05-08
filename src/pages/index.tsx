import Navbar from "@/components/shared/Navbar";
import { useRouter } from "next/router";



export default function Home() {
  const router = useRouter();
  return  (
    <div>
      <Navbar />
      {/* Hero Section */}
      <section className="bg-[color:var(--blue-100)] py-[5%] relative overflow-hidden h-[704px] md:h-auto">
        <div className="container md:px-20 px-4 relative z-10 ">
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
              <p />โดยพนักงานแม่บ้านและช่างมืออาชีพ
              </div>
              
              <button 
                className="btn btn--primary px-[32px] py-[12px] w-[191px] md:mt-[30px] mt-[15px]"
                onClick={() => router.push("/service")}
                >
                เช็คราคาบริการ
              </button>
            </div>
          </div>
        </div>

        {/* Floating Image in Mobile */}
        <div className="absolute right-0 bottom-0 md:right-[10%] ">
          <img
            src="/asset/images/plumber-pointing-lateral.png"
            alt="plumber-pointing-lateral"
            className="w-[327px] md:relative md:w-[100%]"
          />
        </div>
      </section>

      {/* Services Section */}
      <section className="bg-[color:var(--white)] py-12">
        <div className="flex flex-col items-center gap-8">
          <h2 className="text-heading-2 md:text-heading-1 text-center">
            บริการยอดฮิตของเรา
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:p-3">
            {/* ใส่ props  */}
          </div>
          <button 
            className="btn btn--primary py-[10px] px-[24px]"
            onClick={() => router.push("/serviceList")}
            >
            ดูบริการท้ังหมด
          </button>
        </div>
      </section>

      {/* Join Us Section */}
      <section className="">
        <div className="md:flex bg-[color:var(--blue-600)] relative">
          <div className="md:w-1/3 ">
            <img 
              src="/asset/images/construction-worker.png" 
              alt="construction-worker" 
              className="w-full md:w-full md:h-full md:object-cover"
              />
          </div>
          <div className="md:w-2/3 p-[5%] h-[100%] pb-20">
            <div className="text-[color:var(--white)]">
              <h1 className="text-heading-1">มาร่วมเป็นพนักงานซ่อมกับ HomeServices</h1>
              <p className="md:text-heading-3 pt-[3%]">เข้ารับการฝึกอบรมที่ได้มาตรฐาน ฟรี! <br /> และยังได้รับค่าตอบแทนที่มากขึ้นกว่าเดิม</p>
              <h3 className="text-heading-2 md:text-heading-1 pt-[3%]">ติดต่อมาที่อีเมล: job@homeservices.co
              </h3>
            </div>
            {/* <div className="absolute md:right-0 md:bottom-0 right-10 bottom-0">
              <img 
                src="/asset/svgs/houseLogo.svg" 
                alt="house icon" 
                className="w-[250px]  opacity-50 relative left-12 object-cover object-left aspect-[3/4]"
                />
            </div> */}
          </div>
        </div>
      </section>
    </div>
  )
}
