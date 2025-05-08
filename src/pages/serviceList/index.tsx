import { Prompt } from 'next/font/google';
import ServiceCard from '@/components/ServiceCard';
import axios from 'axios';

const prompt = Prompt({
   subsets: ['latin', 'thai'],
   weight: ['300', '400', '500', '600'],
});

interface ServiceCardProps {
   id: number;
   category_name: string;
   service_title: string;
   image_url: string;
   min_price: string;
   max_price: string;
}
export const getServerSideProps = async () => {
   // เป็นการ render ฝั่ง server ก่อน ตามด้วย runฝั่ง client
   // getServerSideProps เป็น function ที่ run บน next เท่านั้น
   //ค่าที่ return จะถูกส่งเข้าไปเป็น props ของ component หน้า
   const res = await axios.get('http://localhost:3000/api/service');
   return {
      props: {
         services: res.data,
      },
   };
};

export default function Home({ services }: { services: ServiceCardProps[] }) {
   return (
      <div className={prompt.className}>
         <div className="bg-[var(--gray-200)] pb-14 grid grid-cols-1 justify-items-center  md:pt-[60px] md:px-[160px] md:pb-[133px] md:grid-cols-3 md:gap-y-[48px]  md:gap-x-[37px] ">
            {services.map((service) => (
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
