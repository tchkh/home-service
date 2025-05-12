import { Prompt } from 'next/font/google';
import { Prompt } from 'next/font/google';
import ServiceCard from '@/components/ServiceCard';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

const prompt = Prompt({
   subsets: ['latin', 'thai'],
   weight: ['300', '400', '500', '600'],
});

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

   const inputTextSearch = () => {
      setDataQuery((prevState) => ({
         ...prevState,
         search: inputSearch,
      }));
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
            <div className="border-amber-600 border-2"></div>
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
