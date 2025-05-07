import Image from 'next/image';

interface ServiceCardProps {
   id: number;
   title: string;
   category: string;
   image: string;
   minPrice: string;
   maxPrice: string;
}

export default function ServiceCard({
   title,
   image,
   category,
   minPrice,
   maxPrice,
   id,
}: ServiceCardProps) {
   return (
      <div className="bg-white p-2 rounded-lg shadow-sm" key={id}>
         <div className="relative h-40 w-full overflow-hidden rounded-lg mb-2">
            <Image
               src={image}
               alt={title}
               layout="fill"
               objectFit="cover"
               className="rounded-lg"
            />
         </div>
         <h3 className="text-purple-800 font-medium text-lg">{category}</h3>
         <div className="flex items-center text-gray-500 text-sm mb-1">
            <span className="mr-2">📍 {title}</span>
         </div>
         <div className="flex items-center text-gray-500 text-sm mb-2">
            <span className="mr-2">
               💰 ค่าบริการประมาณ {minPrice} - {maxPrice}
            </span>
         </div>
         <button className="w-full bg-blue-500 text-white rounded-md py-1 px-4 text-sm font-medium">
            ดูรายละเอียด
         </button>
      </div>
   );
}
