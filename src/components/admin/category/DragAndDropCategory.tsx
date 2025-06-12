import React, { useEffect, useState } from "react";
import { CategoryData } from "@/types/index";
import { useRouter } from "next/router";
import axios from "axios";
import ReconfirmPage from "@/components/admin/ReconfirmPage";
// ของพี่นัท
import { toast } from "sonner";
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
// import {
//    AlertDialog,
//    AlertDialogAction,
//    AlertDialogCancel,
//    AlertDialogContent,
//    AlertDialogDescription,
//    AlertDialogFooter,
//    AlertDialogHeader,
//    AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import {
   closestCenter,
   DndContext,
   DragEndEvent,
   KeyboardSensor,
   PointerSensor,
   useSensor,
   useSensors,
   useDroppable,
   useDndContext,
} from "@dnd-kit/core";
import {
   arrayMove,
   SortableContext,
   sortableKeyboardCoordinates,
   useSortable,
   verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// -------------------- end import --------------------

function DraggableRow({
   id,
   categoryId,
   category,
   children,
}: {
   id: string;
   categoryId: string;
   category: CategoryData[];
   children: React.ReactNode;
}) {
   const {
      attributes,
      listeners,
      setNodeRef: dragSetNodeRef,
      transform,
      transition,
      isDragging,
   } = useSortable({ id });

   const style: React.CSSProperties = {
      transform: CSS.Transform.toString(transform),
      transition,
      zIndex: isDragging ? 100 : "auto",
      opacity: isDragging ? 0.8 : 1,
   };

   const { isOver, setNodeRef: dropSetNodeRef } = useDroppable({
      id: id, // Use the same id as Sortable for simplicity, or create a unique one
   });

   const { active } = useDndContext();
   const activeId = active?.id;

   const combinedRef = (node: HTMLTableRowElement | null) => {
      dragSetNodeRef(node);
      dropSetNodeRef(node);
   };

   // Handle row click while preserving button clicks
   const handleRowClick = (e: React.MouseEvent) => {
      if (
         e.target instanceof HTMLButtonElement ||
         e.target instanceof HTMLAnchorElement ||
         (e.target as HTMLElement).closest('button, a, [role="button"]')
      ) {
         return;
      }
      window.location.href = `/admin/categories/${categoryId}`;
   };

   const dragHandle = (
      <span
         className="mr-2 cursor-grab"
         {...attributes}
         {...listeners}
         onClick={(e) => e.stopPropagation()}
      >
         <GripVertical className="h-4 w-4 text-[var(--gray-400)]" />
      </span>
   );

   return (
      <tr
         ref={combinedRef}
         style={style}
         onClick={handleRowClick}
         className={`hover:bg-gray-50 cursor-pointer ${
            isDragging ? "shadow-md border border-blue-500 bg-blue-50" : ""
         } ${
            isOver && activeId && activeId !== id
               ? "border-t-2 border-blue-400"
               : ""
         } ${
            category[category.length - 1]?.id === id
               ? "border-b border-gray-200"
               : "border-b border-gray-100"
         } transition-all duration-200`}
      >
         {React.Children.map(children, (child, index) => {
            if (
               !React.isValidElement<{
                  children?: React.ReactNode;
                  className?: string;
               }>(child)
            ) {
               return child;
            }

            // Add drag handle to the first cell
            if (index === 0) {
               return React.cloneElement(child, {
                  children: (
                     <div className="flex items-center">
                        {dragHandle}
                        <div className="flex-1">{child.props.children}</div>
                     </div>
                  ),
               });
            }

            // For action cells with buttons, prevent row click
            if (child.props.className?.includes("text-center")) {
               return React.cloneElement(child, {
                  children: (
                     <div onClick={(e) => e.stopPropagation()}>
                        {child.props.children}
                     </div>
                  ),
               });
            }

            return child;
         })}
      </tr>
   );
}

// interface dragAndDropType {
//    // dataCatag: CategoryData[];
//    fetchDataCatag: () => void;
// }

// ส่วน componente
export default function DragAndDropCategory({
   search,
   setSearch,
}: {
   search: string;
   setSearch: (value: string) => void;
}) {
   const router = useRouter();
   const [dataCatag, setDataCatag] = useState<CategoryData[]>([]);
   console.log("dataCatag: ", dataCatag);
   const [toggleDeleteConfirm, setToggleDeleteConfirm] = useState(false);
   const [removeIndex, setRemoveIndex] = useState<number>(0);
   const [titleRemove, setTitleRemove] = useState<string>("");
   // -------------------
   // const [search, setSearch] = useState("");
   // const [deleteId, setDeleteId] = useState<string | null>(null);
   // const [isLoading, setIsLoading] = useState(true);
   // const [isDeleting, setIsDeleting] = useState(false);
   // const [error, setError] = useState<string | null>(null);
   // const [services, setServices] = useState<ServiceWithCategory[]>([]);

   // fetch ครั้งแรก
   const firstGetDataService = async () => {
      try {
         // setLoading(true);
         const res = await axios.get(`/api/admin/category`);

         setDataCatag(res.data);
         // allCategory(res.data.service);
         // setLoading(false);
      } catch (error) {
         console.log("error: ", error);
      }
   };
   useEffect(() => {
      firstGetDataService();
   }, []);

   const handleDelete = async (idRemove: number) => {
      if (!idRemove) {
         alert("ไม่มี id ขออภัย");
         return null;
      }
      const { data } = await axios.delete(`/api/admin/category`, {
         params: {
            id: idRemove,
         },
      });
      console.log("data: ", data);
      if (data.error) {
         console.log(data.error);
      }
      alert("delete data complete");
      // router.push("/admin/categories"); //หรือ router.back();
   };
   // const fetchServicesData = async () => {
   //    try {
   //       // setIsLoading(true);
   //       // setError(null as string | null);
   //       const data = await getServices();
   //       const formattedServices = data.map((s) => ({
   //          ...s,
   //          id: s.id.toString(), // ถ้าต้องการให้ id เป็น string
   //       }));
   //       setServices(formattedServices as ServiceWithCategory[]);
   //    } catch (err) {
   //       console.error("Failed to fetch services:", err);
   //       setError(
   //          "ไม่สามารถโหลดข้อมูลบริการได้ กรุณาลองใหม่อีกครั้ง" as string | null
   //       );
   //       throw err;
   //    } finally {
   //       setIsLoading(false);
   //    }
   // };
   // useEffect(() => {
   //    fetchServicesData();
   // }, []);

   // function convertDateAndTime(dateString: string) {
   //    const date = new Date(dateString);
   //    return date.toLocaleString();
   // }

   // เรียงลำดับ drag and drop
   // const filteredServices = [...dataCatag].sort(
   //    (a, b) => (Number(a.order_num) || 0) - (Number(b.order_num) || 0)
   // );

   const sortedCategory = [...dataCatag].sort(
      (a, b) => (Number(a.order_num) || 0) - (Number(b.order_num) || 0)
   );

   const filteredServices = React.useMemo(() => {
      const searchTerm = search.toLowerCase();
      return sortedCategory.filter(
         (s: CategoryData) => (s.name?.toLowerCase() || "").includes(searchTerm)
         // ||         (s.category_name?.toLowerCase() || "").includes(searchTerm)
      );
   }, [sortedCategory, search]);

   // เซ็นเซอร์
   const sensors = useSensors(
      useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
      useSensor(KeyboardSensor, {
         coordinateGetter: sortableKeyboardCoordinates,
      })
   );

   // ส่ง order_number ที่มีการเปลี่ยนแปลงไป update ค่าใหม่ ใน database
   async function updateServiceOrder(oldOrder: number, newOrder: number) {
      try {
         const res = await axios.post(
            "/api/admin/category/updateCategoryOrder",
            {
               oldOrder,
               newOrder,
            }
         );
         if (!res.data || res.data.success === false) {
            const errorMessage =
               res.data?.error || "Failed to update category order";
            throw new Error(errorMessage);
         }
         return res.data;
      } catch (error) {
         console.error("Error in updateServiceOrder:", error);
         throw error;
      }
   }

   // function การยก drag and drop ไปวาง
   const handleDragEnd = async (event: DragEndEvent) => {
      const { active, over } = event;
      console.log("active: ", active);
      console.log("over: ", over);

      if (over && active.id !== over.id) {
         const oldIndex = dataCatag.findIndex(
            (item) => item.order_num === Number(active.id)
         );
         const newIndex = dataCatag.findIndex(
            (item) => item.order_num === Number(over.id)
         );

         const newCategory = arrayMove([...dataCatag], oldIndex, newIndex);
         setDataCatag(newCategory);

         try {
            console.log("start updateServiceOrder");

            await updateServiceOrder(oldIndex + 1, newIndex + 1);
            firstGetDataService();
         } catch (error) {
            console.error("Error updating service order:", error);
            toast.error("เกิดข้อผิดพลาดในการอัปเดทลำดับ");
         }
      }
   };

   // fetch จากการค้นหา
   // useEffect(() => {
   //    setTimeout(() => {}, 600);
   //    const firstGetDataService = async () => {
   //       try {
   //          // setLoading(true);
   //          await axios.get(`/api/admin/category`, {
   //             params: {
   //                search: { inputSearch },
   //             },
   //          });
   //          // const res = await axios.get(`/api/service?${queryString}`);
   //          // setDataCard(res.data.service);
   //          // allCategory(res.data.service);
   //          // setMaxPrice(res.data.service);
   //          // setMaxLimit(res.data.count - 1);
   //          // setCurrentLimit(res.data.service.length - 1);
   //          // setLoading(false);
   //       } catch (error) {
   //          console.log("error: ", error);
   //       }
   //    };
   //    firstGetDataService();
   // }, [inputSearch]);

   const subTitle = titleRemove ? titleRemove : "หวดหมู่";
   // const subTitle = "หวดหมู่";
   const actionDelete = "ลบหมวดหมู่";
   const titleDelete = `ยืนยันการ${actionDelete}`;

   return (
      <div className="flex flex-col w-[90%] max-w-[95%] mx-auto  mt-10 bg-[var(--white)] border-2 border-[var(--gray-200)] rounded-2xl shadow-lg ">
         <ReconfirmPage
            title={titleDelete}
            subTitle={subTitle}
            action={actionDelete}
            toggle={toggleDeleteConfirm}
            setTaggle={setToggleDeleteConfirm}
            actionFunction={() => handleDelete(removeIndex)}
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
                     onClick={() => router.push(`/admin/categories/create`)}
                  >
                     <Plus className="mr-2 h-4 w-4" />
                     เพิ่มหมวดหมู่
                  </Button>
               )}
            </div>
         ) : (
            <DndContext
               sensors={sensors}
               collisionDetection={closestCenter}
               onDragEnd={handleDragEnd}
            >
               <SortableContext
                  items={filteredServices.map((s) => s.order_num)}
                  strategy={verticalListSortingStrategy}
               >
                  <Table>
                     <TableHeader className="bg-[#F3F4F6] text-[var(--gray-700)] bo">
                        <TableRow>
                           <TableHead className="w-[10px] text-center"></TableHead>
                           <TableHead className="text-center">ลำดับ</TableHead>
                           <TableHead>ชื่อหมวดหมู่</TableHead>
                           {/* <TableHead>หมวดหมู่</TableHead> */}
                           <TableHead>สร้างเมื่อ</TableHead>
                           <TableHead>แก้ไขล่าสุด</TableHead>
                           <TableHead className="w-[120px] text-center">
                              action
                           </TableHead>
                        </TableRow>
                     </TableHeader>
                     <TableBody>
                        {filteredServices.map((category, index) => (
                           <DraggableRow
                              key={category.order_num}
                              id={category.order_num.toString()}
                              categoryId={category.id}
                              category={dataCatag}
                           >
                              <TableCell className="text-center"></TableCell>
                              <TableCell className="font-medium text-center">
                                 {category.order_num}
                              </TableCell>
                              <TableCell>{category.name}</TableCell>
                              <TableCell>
                                 {setDateTimeFormat(
                                    new Date(category.created_at)
                                 )}
                              </TableCell>
                              <TableCell>
                                 {setDateTimeFormat(
                                    new Date(category.updated_at)
                                 )}
                              </TableCell>
                              <TableCell className="text-center">
                                 <div className="flex items-center justify-center gap-2">
                                    <Button
                                       size="icon"
                                       variant="ghost"
                                       className="text-[var(--gray-500)] hover:text-[var(--red)] cursor-pointer"
                                       onClick={() => {
                                          setRemoveIndex(index as number);
                                          setTitleRemove(category.name);
                                          setToggleDeleteConfirm(true);
                                       }}
                                       // disabled={isDeleting}
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
                                             `/admin/categorys/${category.id}/edit`
                                          );
                                       }}
                                    >
                                       <Pencil className="h-4 w-4" />
                                    </Button>
                                 </div>
                              </TableCell>
                           </DraggableRow>
                        ))}
                     </TableBody>
                  </Table>
               </SortableContext>
            </DndContext>
         )}
      </div>
   );
}
