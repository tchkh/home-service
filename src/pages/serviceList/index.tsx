import { Prompt } from "next/font/google";
import ServiceCard from "@/components/ServiceCard";
import LoadingServiceCard from "@/components/LoadingServiceCard";
import axios, { AxiosError } from "axios";
import { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
   faMagnifyingGlass,
   faAngleDown,
} from "@fortawesome/free-solid-svg-icons";
import futureHome from "../../../public/asset/images/futureHome.png";
import Image from "next/image";
// ส่วน shadcn
import * as Slider from "@radix-ui/react-slider";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   // SelectValue,
} from "@/components/ui/select";
import {
   Popover,
   PopoverContent,
   PopoverTrigger,
} from "@/components/ui/popover";

const prompt = Prompt({
   subsets: ["latin", "thai"],
   weight: ["300", "400", "500", "600"],
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
      color: string;
   }
   interface SearchType {
      search: string;
      category: string;
      minPrice?: number | null;
      maxPrice?: number | null;
      sortBy: string;
      onLimit: number | null;
   }
   // ส่วน DATA
   const [dataCard, setDataCard] = useState<ServiceCardProps[]>([]);
   // console.log("dataCard: ", dataCard);
   const [fetchDataQuery, setFetchDataQuery] = useState<SearchType>({
      search: "",
      category: "บริการทั้งหมด",
      minPrice: null,
      maxPrice: null,
      sortBy: "title",
      onLimit: null,
   });
   // console.log('fetchDataQuery: ', fetchDataQuery);
   // ส่วน rang slider ราคา
   const [serviceMaxPrice, setServiceMaxPrice] = useState<number>(0);
   const [range, setRange] = useState<number[]>([]); // กำหนดค่าเริ่มต้น min/max
   // ค่า query ก่อนการ fetch
   const [dataQuery, setDataQuery] = useState<SearchType>({
      search: "",
      category: "บริการทั้งหมด",
      minPrice: null,
      maxPrice: null,
      sortBy: "title",
      onLimit: null,
   });

   // เก็บ category ทีไม่ซ้ำกัน
   const [uniqueDataCard, setUniqueDataCard] = useState<string[]>([]);

   // เก็บค่า auto complete
   const [showBox, setShowBox] = useState(false);
   const [autocompleteData, setAutocompleteData] = useState<string[]>([]);

   const boxRef = useRef<HTMLDivElement>(null); // สำหรับตรวจว่าคลิกนอกกล่องไหม
   /* 
   useRef เป็น React Hook ที่ใช้เพื่อเก็บ “reference” ไปยัง DOM element หรือ “ค่า” อะไรก็ได้โดย ไม่ trigger re-render
   เมื่อใช้กับ DOM → มันช่วยให้เราเข้าถึง องค์ประกอบ HTML จริง ๆ (เช่น <div>, <input>) ได้โดยตรงใน React
   
   มันคือ TypeScript type ที่ระบุว่า element นี้คือ div จาก HTML

   ใช้เพื่อให้ TypeScript รู้ว่า boxRef.current จะเป็น HTMLDivElement (หรือ null)
   → แบบนี้ TypeScript จะช่วยแนะนำ method ต่าง ๆ ได้ เช่น .contains(), .classList, .focus() ฯลฯ
   */

   //  เก็บค่าหน้า londing
   const [loading, setLoading] = useState<boolean>(false);

   // เก็บคาส linmit
   const [currentLimit, setCurrentLimit] = useState<number>(0);
   // console.log("currentLimit: ", currentLimit);
   const [maxLimit, setMaxLimit] = useState<number>(0);
   // console.log("maxLimit: ", maxLimit);
   const [loadCard, setLoadCard] = useState<boolean>(true);
   // console.log("loadCard: ", loadCard);
   const [isTriggeredByUser, setIsTriggeredByUser] = useState(false); // เพิ่มมาบอกว่า use เรียก

   // ค่าการเรียง order
   const typeSortBy: { [key: string]: string } = {
      title: "บริการแนะนำ",
      poppular: "บริการยอดนิยม",
      ascending: "ตามตัวอักษร (Ascending)",
      descending: "ตามตัวอักษร (Descending)",
   };

   // ส่วนรับ event input
   // const [inputSearch, setInputSearch] = useState<string>('');
   // URLSearchParams จะแปลง object เป็น  ?minPrice='500'&?maxPrice=`4000`
   const queryString = new URLSearchParams({
      search: fetchDataQuery.search,
      category: fetchDataQuery.category,
      minPrice: (fetchDataQuery.minPrice ?? "").toString(),
      maxPrice: (fetchDataQuery.maxPrice ?? "").toString(),
      sortBy: fetchDataQuery.sortBy,
      onLimit: (fetchDataQuery.onLimit ?? "").toString(),
   }).toString();

   // เมื่อคลิก "ค้นหา" คำสั่งเปลี่ยนค่า dataCard ตาม qeury
   const inputDataQuery = () => {
      setFetchDataQuery((prevState) => ({
         ...prevState,
         ...dataQuery,
      }));
   };

   //เปลี่ยนค่าเมื่อมีการ search
   const inputSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
      setDataQuery((prevState) => ({
         ...prevState,
         search: e.target.value,
      }));
   };
   const inputSearchAuto = (searchCompltet: string) => {
      setShowBox(false);
      setDataQuery((prevState) => ({
         ...prevState,
         search: searchCompltet,
      }));
   };

   // เปลี่ยนค่า Category
   const changeCategory = (value: string) => {
      setDataQuery((prevState) => ({
         ...prevState,
         category: value,
      }));
   };

   // เปลี่ยนค่า rang ราคา
   const handleChange = (value: number[]) => {
      setRange(value);
      setDataQuery((prevState) => ({
         ...prevState,
         minPrice: value[0],
         maxPrice: value[1],
      }));
   };

   // เปลี่ยนค่า sortBy
   const changeSortBy = (value: string) => {
      setDataQuery((prevState) => ({
         ...prevState,
         sortBy: value,
      }));
   };

   //  เช็คค่า limit มีเกินจำนวน
   const handleLoadCard = () => {
      setIsTriggeredByUser(true);
      const newLimit = currentLimit + 9;

      if (newLimit >= maxLimit) {
         setCurrentLimit(maxLimit); // ส่งค่า maxLimit จริง ๆ
         // setLoadCard(false); // เมื่อ limit สูงสุดแล้วให้ hide button
      } else {
         // setLoadCard(true);
         setCurrentLimit(newLimit);
      }
   };
   // useEffect รอให้ currentLimit assign ค่าเสร็จก่อน
   useEffect(() => {
      if (!isTriggeredByUser) return; //ป้องกันการ rerender ซ้ำ

      console.log("useEffect limit");
      const conditionLimit = () => {
         if (currentLimit < maxLimit) {
            setLoadCard(true);
         } else {
            setLoadCard(false); // เมื่อ limit สูงสุดแล้วให้ hide button
         }

         setFetchDataQuery((prevState) => ({
            ...prevState,
            onLimit: currentLimit,
         }));
      };
      conditionLimit();
      setIsTriggeredByUser(false);
   }, [currentLimit, isTriggeredByUser, maxLimit]);
   // condition show hide button loand card

   //  fetch ครั้งแรก
   useEffect(() => {
      // เปลี่ยนค่า rang ราคา
      const setMaxPrice = (data: ServiceCardProps[]) => {
         const maxPrice = Math.max(
            ...data.map((service): number => {
               const price = Number(service.max_price);
               return price;
            })
         );
         setRange([0, maxPrice]);
         setServiceMaxPrice(maxPrice);
      };
      //  กรองค่า category ไม่ให้ซ้ำ
      // const dataTagCategory = dataCard.filter((item, index, arr) => {
      //    return (
      //       index === arr.findIndex((t) => t.category_name === item.category_name)
      //    );
      // });
      const allCategory = (data: ServiceCardProps[]) => {
         const dataTagCategory = data
            .map((item) => item.category_name)
            .filter((name, index, arr) => {
               return index === arr.indexOf(name);
            });
         setUniqueDataCard([...dataTagCategory]);
      };

      //  first Fetch
      const firstGetDataService = async () => {
         try {
            setLoading(true);
            const res = await axios.get(`/api/service?${queryString}`);
            setDataCard(res.data.service);
            allCategory(res.data.service);
            setMaxPrice(res.data.service);
            setMaxLimit(res.data.count - 1);
            setCurrentLimit(res.data.service.length - 1);
            setLoading(false);
         } catch (error) {
            console.log("error: ", error);
         }
      };
      firstGetDataService();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   //  เมื่อมีการ query ให้ fetch
   useEffect(() => {
      const getDataService = async () => {
         try {
            // search=${searchTest}&category=${categoryTest}&
            setLoading(true);

            const res = await axios.get(`/api/service?${queryString}`);
            // console.log("execute getDataService");
            setDataCard(res.data.service);
            setMaxLimit(res.data.count - 1);
            setCurrentLimit(res.data.service.length - 1);
            setLoading(false);
         } catch (error) {
            console.log("error: ", error);
         }
      };

      getDataService();
      if (currentLimit >= maxLimit) {
         setLoadCard(false);
      } else if (currentLimit < maxLimit) {
         setLoadCard(true); // เมื่อ limit สูงสุดแล้วให้ hide button
      }
   }, [currentLimit, fetchDataQuery, maxLimit, queryString]);

   // auto complete เมื่อ มีการ search ให้ fetch
   useEffect(() => {
      // เมื่อ search มีการเปลี่ยนแปลงให้ ให้ดึงข้อมูล title แล้วไปเก็บค่าที่ usestate ไป .map
      const timer = setTimeout(() => {
         const getDataService = async () => {
            if (dataQuery.search) {
               try {
                  const res = await axios.get(
                     `/api/searchService?searchTitle=${dataQuery.search}`
                  );
                  // console.log("res.data: ", res.data);
                  const dataTitle = res.data.map((data: string[]) => {
                     return Object.values(data);
                  });
                  // console.log("dataTitle: ", dataTitle);
                  setAutocompleteData(dataTitle);
               } catch (error) {
                  const massageError = error as AxiosError;
                  // console.log("error: ", massageError);
                  const massageShow: string = (
                     massageError.response?.data as { massage: string }
                  ).massage;
                  // console.log("massageShow: ", massageShow);
                  setAutocompleteData([massageShow]);
               }
            } else {
               setAutocompleteData(["Please enter a search term."]);
            }
         };
         getDataService();
      }, 600);
      return () => clearTimeout(timer); // ล้าง timer ถ้า query เปลี่ยนก่อน 3 วิ
   }, [dataQuery.search]);
   // ตรวจจับการคลิกนอกกล่อง
   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (boxRef.current && !boxRef.current.contains(event.target as Node)) {
            setShowBox(false); // ถ้าคลิกนอกกล่อง input + box ให้ซ่อน
         }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
         document.removeEventListener("mousedown", handleClickOutside);
   }, []);

   return (
      <div
         className={`${prompt.className} flex flex-col items-center bg-[var(--gray-200)]  `}
      >
         {/* ส่วน บริการของเรา*/}
         <section
            className={`flex flex-col justify-center items-center h-[240px] w-full gap-y-[17px] text-[var(--white)] bg-size-[auto_1440px] bg-position-[center_bottom_-28rem] bg-[rgba(0,26,81,0.60)] bg-[url('/asset/images/backgroundService.jpg')] bg-blend-overlay `}
         >
            <h1 className="text-heading-1">บริการของเรา</h1>
            <p className="text-body-1   text-center">
               ซ่อมเครื่องใช้ไฟฟ้า ซ่อมแอร์ ทำความสะอาดบ้าน และอื่น ๆ อีกมากมาย{" "}
               <br />
               โดยพนักงานแม่บ้าน และช่างมืออาชีพ
            </p>
         </section>
         {/* ส่วน search bar  */}
         <section className="sticky top-[49px] md:top-[59px] z-50 bg-[var(--white)] w-full h-[134px] md:h-[84px] flex justify-center ">
            <div className="container flex flex-col md:justify-between items-center px-5 md:mx-50 py-4 gap-y-4 md:flex-row  ">
               {/* ส่วนค้นหา */}
               <section
                  className={`flex gap-x-4 w-full md:max-w-[350px] relative`}
               >
                  <div ref={boxRef} className="w-full">
                     <label htmlFor="inputSearch" className="relative w-full ">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2">
                           <FontAwesomeIcon
                              className="text-[var(--gray-300)]"
                              icon={faMagnifyingGlass}
                           />
                        </span>
                        <input
                           id="inputSearch"
                           type="text"
                           placeholder="ค้นหารายการ..."
                           className=" text-body-2 pl-10 border-2 border-[var(--gray-300)] min-w-[240px] w-full h-[45px] rounded-lg  placeholder:text-[16px] placeholder:text-[var(--gray-700)]  " // เพิ่ม padding ด้านซ้ายเพื่อให้มีพื้นที่สำหรับ icon
                           value={dataQuery.search}
                           onChange={inputSearch}
                           onFocus={() => setShowBox(true)}
                        />
                     </label>
                     {showBox && dataQuery.search && (
                        <ul className="absolute left-[5px] mt-1 rounded  bg-white w-[95%] md:max-w-[350px] shadow-[0px_1px_10px_1px_rgba(0,0,0,0.25)]">
                           {autocompleteData?.map((dataAuto) => (
                              <li
                                 key={dataAuto}
                                 className="py-1 px-2 hover:bg-gray-100 cursor-pointer"
                                 onClick={() => inputSearchAuto(dataAuto)}
                              >
                                 {dataAuto}
                              </li>
                           ))}
                        </ul>
                     )}
                  </div>
                  <button
                     type="button"
                     onClick={inputDataQuery}
                     id="btn-search-mobile"
                     className="btn btn--primary w-[85px] h-[45px] "
                  >
                     ค้นหา
                  </button>
               </section>
               {/* ส่วนตัวเลือก */}
               <section className="flex flex-row md:justify-end justify-around items-center w-full h-full md:w-fit md:gap-x-[8px] lg:gap-x-[32px] md:ml-2 ">
                  {/* หมวดหมู่บริการ */}
                  <Select
                     onValueChange={changeCategory}
                     value={dataQuery.category}
                  >
                     <SelectTrigger className="relative box-border w-[114px]  md:w-[120px] h-[42px] px-0 py-0 border-0 cursor-pointer">
                        <h2 className="text-body-4 text-[var(--gray-700)] h-full flex flex-col items-start justify-between ">
                           หมวดหมู่บริการ
                           <p
                              // placeholder={`${dataQuery.category}`}
                              className="text-heading-5 w-[84px] overflow-hidden text-ellipsis md:overflow-visible text-[var(--gray-950)] "
                           >
                              {dataQuery.category}
                           </p>
                        </h2>
                     </SelectTrigger>
                     <SelectContent className="text-body-3 gap-y-2 bg-[var(--white)] text-[var(--gray-700)]">
                        <SelectItem
                           value={"บริการทั้งหมด"}
                           className={`${
                              dataQuery.category === "บริการทั้งหมด"
                                 ? "text-[var(--blue-700)]"
                                 : ""
                           } cursor-pointer`}
                        >
                           บริการทั้งหมด
                        </SelectItem>
                        {uniqueDataCard.map((value, index) => (
                           <SelectItem
                              key={index}
                              value={value}
                              className={`${
                                 value === dataQuery.category
                                    ? "text-[var(--blue-700)]"
                                    : ""
                              } cursor-pointer`}
                           >
                              {value}
                           </SelectItem>
                        ))}
                     </SelectContent>
                  </Select>
                  <div className="border-1 border-[var(--gray-300)] h-full "></div>
                  {/* ส่วน ราคา Slider */}
                  <Popover>
                     <PopoverTrigger className="flex flex-col items-start relative box-border w-[114px] md:w-[120px] h-[42px] px-[10px]  cursor-pointer">
                        <p className="text-body-4 text-[var(--gray-700)]">
                           ราคา
                        </p>
                        <p className="text-heading-5 text-[var(--gray-950)] ">
                           {range[0]}-{range[1]}฿
                        </p>
                        <FontAwesomeIcon
                           icon={faAngleDown}
                           className="absolute top-[12px] right-[5px] text-[13px] text-[#7F7F7F] "
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
                              max={serviceMaxPrice}
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
                                    className="relative block size-[13px] rounded-full bg-[var(--blue-700)] shadow-md hover:bg-[var(--blue-300)] focus:outline-none focus:ring-2 focus:ring-[var(--blue-500)] cursor-pointer"
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
                  <div className="border-1 border-[var(--gray-300)] h-full"></div>
                  {/* เรียงตาม */}
                  <div className="flex items-center md:w-fit">
                     <Select
                        onValueChange={changeSortBy}
                        value={dataQuery.sortBy}
                     >
                        <SelectTrigger className="relative box-border w-[114px] md:w-fit  h-[42px] px-[10px] py-0 border-0 cursor-pointer">
                           <h2 className="text-body-4 text-[var(--gray-700)] h-full flex flex-col items-start justify-between ">
                              เรียงตาม
                              <p className="text-heading-5 w-[84px]  lg:w-fit overflow-hidden text-ellipsis text-[var(--gray-950)] ">
                                 {typeSortBy[dataQuery.sortBy]}
                              </p>
                           </h2>
                        </SelectTrigger>
                        <SelectContent className="text-body-3 gap-y-2 bg-[var(--white)] text-[var(--gray-700)]">
                           {Object.entries(typeSortBy).map(([value, label]) => (
                              <SelectItem
                                 key={value}
                                 value={value}
                                 className={`${
                                    value === dataQuery.sortBy
                                       ? "text-[var(--blue-700)]"
                                       : ""
                                 } cursor-pointer`}
                              >
                                 {label}
                              </SelectItem>
                           ))}
                        </SelectContent>
                     </Select>
                     <button
                        type="button"
                        onClick={inputDataQuery}
                        id="btn-search-desktop"
                        className="btn btn--primary w-[86px] h-[45px] ml-3"
                     >
                        ค้นหา
                     </button>
                  </div>
               </section>
            </div>
         </section>
         {/* ส่วน card */}
         <section className="max-w-[1440px] flex flex-col items-center md:grid justify-items-center mx-3 mt-6 mb-14 md:mt-[60px] md:mx-[160px] md:mb-[133px] gap-y-6 gap-x-4 md:grid-cols-2 md:gap-y-[48px]  md:gap-x-[37px] lg:grid-cols-3 ">
            {loading &&
               Array.from({ length: 3 }).map((_, index) => {
                  return <LoadingServiceCard key={index} />;
               })}
            {!loading &&
               dataCard.map((service) => (
                  <ServiceCard
                     key={service.id}
                     id={service.id}
                     title={service.service_title}
                     image={service.image_url}
                     category={service.category_name}
                     minPrice={service.min_price}
                     maxPrice={service.max_price}
                     color={service.color}
                  />
               ))}
            {!dataCard[0] && !loading && (
               <h1 className="absolute text-heading-1 ">
                  Sorry! No found service
               </h1>
            )}
            {loadCard && !loading && (
               <button
                  type="button"
                  className="btn btn--primary col-start-2 text-body-1 text-[var(--white)] max-h-[60px] max-w-[300px] py-2 px-[30px]  "
                  onClick={handleLoadCard}
               >
                  ดู Service เพิ่มเติม
               </button>
            )}
         </section>
         <section className="relative overflow-hidden w-full h-[284px]  flex items-center bg-[var(--blue-600)]">
            <Image
               src={futureHome}
               alt="futureHome"
               width={500}
               height={500}
               priority={true}
               className="hidden md:flex z-1 absolute w-auto h-[120%] -right-[98px] top-0 opacity-50 "
            />

            <p className="z-2 text-heading-3 w-full text-[var(--white)] text-center ">
               เพราะเราคือช่าง ผู้ให้บริการเรื่องบ้านอันดับ 1 แบบครบวงจร
               โดยทีมช่างมืออาชีพมากกว่า 100 ทีม <br />
               สามารถตอบโจทย์ด้านการบริการเรื่องบ้านของคุณ และสร้าง <br />
               ความสะดวกสบายในการติดต่อกับทีมช่าง ได้ทุกที่ ทุกเวลา ตลอด 24 ชม.{" "}
               <br />
               มั่นใจ ช่างไม่ทิ้งงาน พร้อมรับประกันคุณภาพงาน
            </p>
         </section>
      </div>
   );
}
