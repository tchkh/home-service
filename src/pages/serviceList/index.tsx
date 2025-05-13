import { Prompt } from 'next/font/google';
import ServiceCard from '@/components/ServiceCard';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
   faMagnifyingGlass,
   faCaretDown,
} from '@fortawesome/free-solid-svg-icons';
// ส่วน shadcn
import * as Slider from '@radix-ui/react-slider';
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   // SelectValue,
} from '@/components/ui/select';
import {
   Popover,
   PopoverContent,
   PopoverTrigger,
} from '@/components/ui/popover';

const prompt = Prompt({
   subsets: ['latin', 'thai'],
   weight: ['300', '400', '500', '600'],
});
// ส่วน icon
const iconSearch = (
   <FontAwesomeIcon
      className="text-[var(--gray-300)]"
      icon={faMagnifyingGlass}
   />
);

/* 
เก็บใน useState เป็น object
เมื่อ useState เป็น ให้ useEffect ทำงาน
*/
// export const getServerSideProps = async () => {
//    // เป็นการ render ฝั่ง server ก่อน ตามด้วย runฝั่ง client
//    // getServerSideProps เป็น function ที่ run บน next เท่านั้น
//    //ค่าที่ return จะถูกส่งเข้าไปเป็น props ของ component หน้า
//    const res = await axios.get('http://localhost:3000/api/service');

//    return {
//       props: {
//          services: res.data,
//       },
//    };
// };

export default function Home() {
   interface ServiceCardProps {
      id: number;
      category_name: string;
      service_title: string;
      image_url: string;
      min_price: string;
      max_price: string;
   }
   interface SearchType {
      search: string;
      category: string;
      minPrice?: number | null;
      maxPrice?: number | null;
      sortBy: string;
      onLimit: number | null;
   }

   const [dataCard, setServiceCard] = useState<ServiceCardProps[]>([]);
   const [dataQuery, setDataQuery] = useState<SearchType>({
      search: '',
      category: '',
      minPrice: null,
      maxPrice: null,
      sortBy: 'title',
      onLimit: null,
   });
   const [inputSearch, setInputSearch] = useState<string>('');

   // URLSearchParams จะแปลง object เป็น  ?minPrice='500'&?maxPrice=`4000`
   const queryString = new URLSearchParams({
      search: dataQuery.search,
      category: dataQuery.category,
      minPrice: (dataQuery.minPrice ?? '').toString(),
      maxPrice: (dataQuery.maxPrice ?? '').toString(),
      sortBy: dataQuery.sortBy,
      onLimit: (dataQuery.onLimit ?? '').toString(),
   }).toString();

   // รับการเปลี่ยนค่า input
   const inputTextSearch = () => {
      setDataQuery((prevState) => ({
         ...prevState,
         search: inputSearch,
      }));
   };

   // ส่วน rang slider ราคา
   const [range, setRange] = useState([0, 2000]); // กำหนดค่าเริ่มต้น min/max
   // const [isDragging, setIsDragging] = useState<number | null>(null); // 0 หรือ 1

   const handleChange = (value: number[]) => {
      setRange(value);
   };

   const getDataService = async () => {
      try {
         // search=${searchTest}&category=${categoryTest}&
         const res = await axios.get(
            `http://localhost:3000/api/service?${queryString}`
         );
         setServiceCard(res.data);
      } catch (error) {
         console.log('error: ', error);
      }
   };

   useEffect(() => {
      getDataService();
   }, [, dataQuery]);

   return (
      <div
         className={`${prompt.className} flex flex-col  items-center bg-[var(--gray-200)]`}
      >
         {/* ส่วน search bar */}
         <section className="w-[375px]  h-[134px] bg-[var(--white)] flex flex-col p-4 gap-y-4 ">
            <div className={`flex  gap-x-4 w-full`}>
               <div className="relative w-full ">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2">
                     {iconSearch}
                  </span>
                  <input
                     type="text"
                     placeholder="ค้นหารายการ..."
                     className=" text-body-2 pl-10 border-2 border-[var(--gray-300)] min-w-[240px] w-full h-[45px] rounded-lg  placeholder:text-[16px] placeholder:text-[var(--gray-700)] " // เพิ่ม padding ด้านซ้ายเพื่อให้มีพื้นที่สำหรับ icon
                     value={inputSearch}
                     onChange={(e) => {
                        setInputSearch(e.target.value);
                     }}
                  />
               </div>
               <button
                  type="button"
                  onClick={inputTextSearch}
                  className="btn btn--primary w-[85px] h-[45px]"
               >
                  ค้นหา
               </button>
            </div>
            <div className="flex flex-row border-blue-600 border-2">
               {/* ส่วนSlider */}
               <Popover>
                  <PopoverTrigger className="flex flex-col items-start relative box-border w-[115px] h-[42px] px-[10px] border-2 border-red-400 ">
                     <p className="text-body-4 text-[var(--gray-700)]">ราคา</p>
                     <p className="text-heading-5 text-[var(--gray-950)] ">
                        {range[0]}-{range[1]}฿
                     </p>
                     <FontAwesomeIcon
                        icon={faCaretDown}
                        className="absolute bottom-[10px] right-[5px] translate-y-1 text-[10px]"
                     />
                  </PopoverTrigger>
                  <PopoverContent className="w-[253px] h-[112px] flex flex-col items-start bg-[var(--white)] box-border gap-y-4 py-5 px-4 rounded-lg border-0 ">
                     <p className="text-body-3 text-[var(--gray-700)]">
                        {range[0]}-{range[1]}฿
                     </p>
                     {/* แถบ rang */}
                     <form className="bg-[var(--white)] w-[100%] h-fit ">
                        <Slider.Root
                           className="relative flex items-center w-full h-5 touch-none select-none  "
                           value={range}
                           onValueChange={handleChange}
                           min={0}
                           max={2000}
                           step={1}
                        >
                           <Slider.Track className="  relative h-[4px] grow rounded-full bg-[var(--gray-300)] ">
                              <Slider.Range className="  absolute h-full rounded-full bg-[var(--blue-700)]" />
                           </Slider.Track>
                           {range.map((value, index) => (
                              <Slider.Thumb
                                 key={index}
                                 // ส่วนที่ต้องการให้ hidden
                                 // onPointerDown={() => setIsDragging(index)}
                                 // onPointerUp={() => setIsDragging(null)}
                                 className="relative block size-[13px] rounded-full bg-[var(--blue-700)] shadow-md hover:bg-[var(--blue-300)] focus:outline-none focus:ring-2 focus:ring-[var(--blue-500)]"
                              >
                                 <div className="block absolute top-[4px] left-[4px] size-[5px] rounded-full bg-[var(--white)]"></div>
                                 <div className="text-body-4 absolute top-[15px] left-1/2 -translate-x-1/2 whitespace-nowrap text-[var(--blue-700)]">
                                    {value.toLocaleString()}
                                 </div>
                                 {/* ส่วนที่ต้องการให้ hidden */}
                                 {/* {isDragging === index && (
                                    <div className="absolute top-[24px] left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-violet-600 px-2 py-1 text-xs text-white shadow">
                                       {value.toLocaleString()}฿
                                    </div>
                                 )} */}
                              </Slider.Thumb>
                           ))}
                        </Slider.Root>
                     </form>
                  </PopoverContent>
               </Popover>
            </div>
         </section>
         {/* ส่วน card */}
         <section className="max-w-[1440px] grid grid-cols-1 justify-items-center px-3 pt-6 pb-14 md:pt-[60px] md:px-[160px] md:pb-[133px] gap-y-6 gap-x-4 md:grid-cols-3 md:gap-y-[48px]  md:gap-x-[37px] ">
            {dataCard.map((service) => (
               <ServiceCard
                  key={service.id}
                  id={service.id}
                  title={service.service_title}
                  image={service.image_url}
                  category={service.category_name}
                  minPrice={service.min_price}
                  maxPrice={service.max_price}
               />
            ))}
         </section>
      </div>
   );
}
