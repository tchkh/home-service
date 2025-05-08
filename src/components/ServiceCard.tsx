import Image from 'next/image';
import { Prompt } from 'next/font/google';
// import Vector from '../../public/asset/svgs/Vector.svg';
const prompt = Prompt({
   subsets: ['latin', 'thai'],
   weight: ['300', '400', '500', '600'],
});

interface ServiceCardProps {
   id: number;
   title: string;
   category: string;
   image: string;
   minPrice: string;
   maxPrice: string;
}

const getCategoryTagStyle = (category: string) => {
   switch (category) {
      case 'บริการทั่วไป':
         return 'text-[var(--blue-800)] bg-[var(--blue-100)]';
      case 'บริการห้องครัว':
         return 'text-[var(--purple-900)] bg-[var(--purple-100)]';
      case 'บริการห้องน้ำ':
         return 'text-[var(--green-900)] bg-[var(--green-100)]';
      default:
         return 'text-[var(--blue-800)] bg-[var(--blue-100)]';
   }
};

export default function ServiceCard({
   title,
   image,
   category,
   minPrice,
   maxPrice,
   id,
}: ServiceCardProps) {
   return (
      <div
         className={`${prompt.className} my-6 mx-4 md:my-[48px] md:mx-[37px] max-w-[340px] max-h-[365px] rounded-[8px] flex flex-col justify-start bg-[var(--white)] shadow-sm `}
         key={id}
      >
         <div
            className={` object-fill object-center w-full max-h-[200px] overflow-hidden mb-2`}
         >
            <Image
               src={image}
               alt={title}
               width={500}
               height={500}
               priority={true}
               className=""
            />
         </div>
         <div className="m-4  gap-y-2 flex flex-col justify-start ">
            <h3
               className={`${getCategoryTagStyle(
                  category
               )} text-[var(--blue-800)] bg-[var(--blue-100)] rounded-[8px] grid place-items-center w-[80px] h-[26px] font-medium text-body-4`}
            >
               {category}
            </h3>

            <h4 className="mr-2 text-heading-2">{title}</h4>

            <h4
               className={`flex items-center text-[var(--gray-700)] text-body-3 mb-2 `}
            >
               <span className="mr-2">
                  <Image
                     alt="price"
                     src="/asset/svgs/Vector.svg"
                     width={15}
                     height={15}
                     className=""
                  />
               </span>
               ค่าบริการประมาณ {minPrice} - {maxPrice} ฿
            </h4>
         </div>
         <button className="btn btn--ghost mx-4 mb-[18px] w-fit ">
            ดูรายละเอียด
         </button>
      </div>
   );
}
