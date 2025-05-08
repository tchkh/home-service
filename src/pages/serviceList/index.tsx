// import { Prompt } from 'next/font/google';
import ServiceCard from '@/components/ServiceCard';

// const prompt = Prompt({
//    subsets: ['latin', 'thai'],
//    weight: ['300', '400', '500', '600'],
// });

interface ServiceCardProps {
   id: number;
   title: string;
   image: string;
   category: string;
   minPrice: string;
   maxPrice: string;
}

const services: ServiceCardProps[] = [
   {
      id: 1,
      title: 'ช่างแอร์',
      image: 'https://etletpzpbuxirovvaths.supabase.co/storage/v1/object/public/service-image//clean_air_conditioner.jpg',
      category: 'กรุงเทพมหานคร',
      minPrice: '500฿ - 1,000฿',
      maxPrice: '500฿ - 1,000฿',
   },
   {
      id: 2,
      title: 'ช่างไฟฟ้า',
      image: 'https://etletpzpbuxirovvaths.supabase.co/storage/v1/object/public/service-image//install_exhaust_hood.jpg',
      category: 'กรุงเทพมหานคร',
      minPrice: '500฿ - 800฿',
      maxPrice: '500฿ - 800฿',
   },
   {
      id: 3,
      title: 'ช่างประปา',
      image: 'https://etletpzpbuxirovvaths.supabase.co/storage/v1/object/public/service-image//install_air_cinditioner.jpg',
      category: 'กรุงเทพมหานคร',
      minPrice: '450฿ - 900฿',
      maxPrice: '450฿ - 900฿',
   },
   {
      id: 4,
      title: 'ช่างทาสีภายใน',
      image: 'https://etletpzpbuxirovvaths.supabase.co/storage/v1/object/public/service-image//install_exhaust_hood.jpg',
      category: 'กรุงเทพมหานคร',
      minPrice: '500฿ - 1,200฿',
      maxPrice: '500฿ - 1,200฿',
   },
   {
      id: 5,
      title: 'ช่างซ่อมเครื่องซักผ้า',
      image: 'https://etletpzpbuxirovvaths.supabase.co/storage/v1/object/public/service-image//install_exhaust_hood.jpg',
      category: 'กรุงเทพมหานคร',
      minPrice: '400฿ - 800฿',
      maxPrice: '400฿ - 800฿',
   },
   {
      id: 6,
      title: 'ช่างซ่อมเตาแก๊ส',
      image: 'https://etletpzpbuxirovvaths.supabase.co/storage/v1/object/public/service-image//install_exhaust_hood.jpg',
      category: 'กรุงเทพมหานคร',
      minPrice: '300฿ - 700฿',
      maxPrice: '300฿ - 700฿',
   },
];
export default function Home() {
   return (
      <>
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6  ">
            {services.map((service) => (
               <ServiceCard
                  key={service.id}
                  id={service.id}
                  title={service.title}
                  image={service.image}
                  category={service.category}
                  minPrice={service.minPrice}
                  maxPrice={service.maxPrice}
               />
            ))}
         </div>
      </>
   );
}
