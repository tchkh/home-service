import React, { useEffect, useState } from "react";
import { PomotionData } from "@/types/index";
import { useRouter } from "next/router";
import axios from "axios";
import ReconfirmPage from "@/components/admin/ReconfirmPage";
// import { toast } from "sonner";
import setDateTimeFormat from "@/hooks/setDateTimeFormat";
import { Button } from "@/components/ui/button";
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";

import { Plus, Pencil, Trash2 } from "lucide-react";

export default function TebleDataPromotion({
   search,
   setSearch,
}: {
   search: string;
   setSearch: (value: string) => void;
}) {
   const router = useRouter();
   const [dataPromotion, setDataPromotion] = useState<PomotionData[]>([]);
   // console.log("dataPromotion: ", dataPromotion);
   const [toggleDeleteConfirm, setToggleDeleteConfirm] = useState(false);
   const [removeIndex, setRemoveIndex] = useState<number>(0);
   const [titleRemove, setTitleRemove] = useState<string>("");

   // fetch ครั้งแรก
   const firstGetDataPromotion = async () => {
      try {
         const res = await axios.get(`/api/admin/promotion`);

         setDataPromotion(res.data);
      } catch (error) {
         console.log("error: ", error);
      }
   };
   useEffect(() => {
      firstGetDataPromotion();
   }, []);

   const handleDelete = async (idRemove: string) => {
      console.log("idRemove: ", idRemove);
      if (!idRemove) {
         alert("ไม่มี id ขออภัย");
         return null;
      }
      const { data } = await axios.delete(`/api/admin/promotion`, {
         params: {
            id: idRemove,
         },
      });
      console.log("data: ", data);
      if (data.error) {
         console.log(data.error);
      }
      alert("delete data complete");
      setToggleDeleteConfirm(false);
      firstGetDataPromotion();
   };

   const filteredServices = React.useMemo(() => {
      const searchTerm = search.toLowerCase();
      return dataPromotion.filter((s: PomotionData) =>
         (s.code?.toLowerCase() || "").includes(searchTerm)
      );
   }, [dataPromotion, search]);

   const subTitle = titleRemove ? titleRemove : "Promotion";

   const actionDelete = "ลบ Promotion";
   const titleDelete = `ยืนยันการ${actionDelete}`;

   return (
      <div className="flex flex-col w-[90%] max-w-[95%] mx-auto  mt-10 bg-[var(--white)] border-2 border-[var(--gray-200)] rounded-2xl shadow-lg ">
         <ReconfirmPage
            title={titleDelete}
            subTitle={subTitle}
            action={actionDelete}
            toggle={toggleDeleteConfirm}
            setTaggle={setToggleDeleteConfirm}
            actionFunction={() => {
               if (dataPromotion[removeIndex].id) {
                  handleDelete(dataPromotion[removeIndex].id);
               }
            }}
         />
         {filteredServices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 bg-[var(--white)]">
               <h3 className="text-lg font-medium text-[var(--black)]">
                  ไม่พบหมวดหมู่
               </h3>
               <p className="mt-1 text-sm text-[var(--gray-600)]">
                  {search
                     ? "ลองเปลี่ยนคำค้นหาของคุณ"
                     : "ยังไม่มีบริการที่ลงทะเบียน"}
               </p>
               {search ? (
                  <Button
                     variant="outline"
                     className="mt-4 px-5 py-2 btn btn-primary"
                     onClick={() => setSearch("")}
                  >
                     ล้างการค้นหา
                  </Button>
               ) : (
                  <Button
                     className="mt-4 px-5 py-2 btn btn-primary"
                     onClick={() => router.push(`/admin/promotion/create`)}
                  >
                     <Plus className="mr-2 h-4 w-4" />
                     เพิ่มหมวดหมู่
                  </Button>
               )}
            </div>
         ) : (
            <Table>
               <TableHeader className="bg-[#F3F4F6] text-[var(--gray-700)] bo">
                  <TableRow>
                     <TableHead className="text-center">
                        Promotion Code
                     </TableHead>
                     <TableHead>ประเภท</TableHead>
                     <TableHead>โควต้าการใช้(ครั้ง)</TableHead>
                     <TableHead>ราคาที่ลด</TableHead>
                     <TableHead>วันเริ่ม</TableHead>
                     <TableHead>วันหมดอายุ</TableHead>
                     <TableHead className="w-[120px] text-center">
                        action
                     </TableHead>
                  </TableRow>
               </TableHeader>
               {filteredServices.map((promotion, index) => (
                  <TableBody key={promotion.id}>
                     <TableCell
                        className="font-medium text-center  cursor-pointer hover:underline hover:underline-offset-2"
                        onClick={() => {
                           router.push(`/admin/promotion/${promotion.id}`);
                        }}
                     >
                        {promotion.code}
                     </TableCell>
                     <TableCell>
                        {promotion.discount_type === "percentage"
                           ? "Percent"
                           : "Fixed"}
                     </TableCell>
                     <TableCell>
                        {promotion.used_count}/{promotion.usage_limit}
                     </TableCell>
                     <TableCell className="text-[var(--red)]">
                        {promotion.discount_value}
                        {promotion.discount_type === "percentage" ? "%" : "฿"}
                     </TableCell>

                     <TableCell>
                        {promotion.start_date
                           ? setDateTimeFormat(new Date(promotion.start_date))
                                .split("")
                                .slice(0, 10)
                                .join("")
                           : "yyyy-mm-dd"}
                     </TableCell>
                     <TableCell>
                        {promotion.end_date
                           ? setDateTimeFormat(new Date(promotion.end_date))
                                .split("")
                                .slice(0, 10)
                                .join("")
                           : "yyyy-mm-dd"}
                     </TableCell>
                     <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                           <Button
                              size="icon"
                              variant="ghost"
                              className="text-[var(--gray-500)] hover:text-[var(--red)] cursor-pointer"
                              onClick={() => {
                                 setRemoveIndex(index as number);
                                 setTitleRemove(promotion.code);
                                 setToggleDeleteConfirm(true);
                              }}
                           >
                              <Trash2 className="h-4 w-4" />
                           </Button>
                           <Button
                              size="icon"
                              variant="ghost"
                              className="text-[var(--blue-600)] hover:text-[var(--blue-500)] cursor-pointer"
                              asChild
                              onClick={() => {
                                 router.push(
                                    `/admin/promotion/${promotion.id}/edit`
                                 );
                              }}
                           >
                              <Pencil className="h-4 w-4" />
                           </Button>
                        </div>
                     </TableCell>
                  </TableBody>
               ))}
            </Table>
         )}
      </div>
   );
}
