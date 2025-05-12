import React from 'react';
import { useState, useEffect } from 'react';
import ServiceCard from './ServiceCard';
import axios from 'axios';

function PoppularService() {
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
   const dataQuery: SearchType = {
      search: '',
      category: '',
      minPrice: null,
      maxPrice: null,
      sortBy: 'title', //เรียงตาม poppular
      onLimit: 2,
   };

   // URLSearchParams จะแปลง object เป็น  ?minPrice='500'&?maxPrice=`4000`
   const queryString = new URLSearchParams({
      search: dataQuery.search,
      category: dataQuery.category,
      minPrice: (dataQuery.minPrice ?? '').toString(),
      maxPrice: (dataQuery.maxPrice ?? '').toString(),
      sortBy: dataQuery.sortBy,
      onLimit: (dataQuery.onLimit ?? '').toString(),
   }).toString();
   useEffect(() => {
      getDataService();
   }, [, dataQuery]);

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
   return (
      <>
         <div>start PoppularService</div>
         <div className="max-w-[1440px] grid grid-cols-1 justify-items-center mx-3 my-6  md:mt-[42px] md:px-[160px] md:mb-[65px] gap-y-6 gap-x-4 md:grid-cols-3 md:gap-y-[48px]  md:gap-x-[37px] ">
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
      </>
   );
}

export default PoppularService;
