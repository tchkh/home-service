import { Prompt } from 'next/font/google';
import { Prompt } from 'next/font/google';
import ServiceCard from '@/components/ServiceCard';
import axios from 'axios';
import { useEffect, useState } from 'react';

const prompt = Prompt({
   subsets: ['latin', 'thai'],
   weight: ['300', '400', '500', '600'],
});

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
   }

   const [dataCard, setServiceCard] = useState<ServiceCardProps[]>([]);
   const [dataQuery, setDataQuery] = useState<SearchType>({
      search: '',
      category: '',
      minPrice: null,
      maxPrice: null,
      sortBy: 'title',
   });

   // URLSearchParams จะแปลง object เป็น  ?minPrice='500'&?maxPrice=`4000`
   const queryString = new URLSearchParams({
      search: dataQuery.search,
      category: dataQuery.category,
      minPrice: (dataQuery.minPrice ?? '').toString(),
      maxPrice: (dataQuery.maxPrice ?? '').toString(),
      sortBy: dataQuery.sortBy,
   }).toString();

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
   }, []);
   return (
      <div
         className={`${prompt.className} flex items-center justify-center bg-[var(--gray-200)] `}
      >
         <div className="max-w-[1440px] grid grid-cols-1 justify-items-center px-3 pt-6 pb-14 md:pt-[60px] md:px-[160px] md:pb-[133px] gap-y-6 gap-x-4 md:grid-cols-3 md:gap-y-[48px]  md:gap-x-[37px] ">
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
         </div>
      </div>
   );
}
