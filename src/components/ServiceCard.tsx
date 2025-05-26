import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTag } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'

interface ServiceCardProps {
  id: number
  title: string
  category: string
  image: string
  minPrice: string
  maxPrice: string
}

const getCategoryTagStyle = (category: string) => {
  switch (category) {
    case 'บริการทั่วไป':
      return 'text-[var(--blue-800)] bg-[var(--blue-100)]'
    case 'บริการห้องครัว':
      return 'text-[var(--purple-900)] bg-[var(--purple-100)]'
    case 'บริการห้องน้ำ':
      return 'text-[var(--green-900)] bg-[var(--green-100)]'
    default:
      return 'text-[var(--blue-800)] bg-[var(--blue-100)]'
  }
}

export default function ServiceCard({
  title,
  image,
  category,
  minPrice,
  maxPrice,
  id,
}: ServiceCardProps) {
  // max-w-[350px] max-h-[365px]  md:my-[48px] md:mx-[37px]my-6 mx-4
  return (
    <div
      className={`max-w-[350px] max-h-[365px] rounded-[8px] flex flex-col justify-start bg-[var(--white)] shadow-sm `}
      key={id}
    >
      <div
        className={`object-fill object-center w-full max-h-[200px] overflow-hidden mb-2 rounded-t-[8px]`}
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
            <FontAwesomeIcon
              icon={faTag}
              className="w-[15px] h-[15px] text-[var(--gray-700)] "
            />
          </span>
          ค่าบริการประมาณ {minPrice} - {maxPrice} ฿
        </h4>
      </div>
      <Link href={`/service/${id}`}>
        <button className="btn btn--ghost mx-4 mb-[18px] w-fit ">
          เลือกบริการ
        </button>
      </Link>
    </div>
  )
}
