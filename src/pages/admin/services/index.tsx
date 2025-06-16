import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getServices } from "@/lib/serviceAPI";
import { deleteService } from "@/lib/serviceAPI";
import { toast } from "sonner";
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";
import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
   Plus,
   GripVertical,
   AlertTriangle,
   SquarePen,
   Trash2,
   Search,
} from "lucide-react";
import { ServiceWithCategory } from "@/types";
import axios from "axios";
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
import { cn } from "@/lib/utils";
import ToggleSidebarComponent from "@/components/ToggleSidebarComponent";

function DraggableRow({
   id,
   serviceId,
   services,
   children,
   className,
}: {
   id: string;
   serviceId: string;
   services: ServiceWithCategory[];
   children: React.ReactNode;
   className?: string;
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
      window.location.href = `/admin/services/detail-service?serviceId=${serviceId}`;
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
         className={cn(
            `hover:bg-gray-50 cursor-pointer ${className} ${
               isDragging ? "shadow-md border border-blue-500 bg-blue-50" : ""
            } ${
               isOver && activeId && activeId !== id
                  ? "border-t-2 border-blue-400"
                  : ""
            } ${
               services[services.length - 1]?.id === id
                  ? "border-b border-gray-200"
                  : "border-b border-gray-100"
            } transition-all duration-200`
         )}
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

const categoryVariants = {
   บริการทั่วไป: "bg-blue-100 text-blue-800 hover:bg-blue-200",
   บริการห้องครัว: "bg-purple-100 text-purple-800 hover:bg-purple-200",
   บริการห้องน้ำ: "bg-cyan-100 text-cyan-800 hover:bg-cyan-200",
} as const;

const ServicePage = () => {
   const [search, setSearch] = useState("");
   const [deleteId, setDeleteId] = useState<string | null>(null);
   const [isLoading, setIsLoading] = useState(true);
   const [isDeleting, setIsDeleting] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [services, setServices] = useState<ServiceWithCategory[]>([]);

   const fetchServicesData = async () => {
      try {
         setIsLoading(true);
         setError(null as string | null);
         const data = await getServices();
         const formattedServices = data.map((s) => ({
            ...s,
            id: s.id.toString(), // ถ้าต้องการให้ id เป็น string
         }));
         setServices(formattedServices as ServiceWithCategory[]);
      } catch (err) {
         console.error("Failed to fetch services:", err);
         setError(
            "ไม่สามารถโหลดข้อมูลบริการได้ กรุณาลองใหม่อีกครั้ง" as string | null
         );
         throw err;
      } finally {
         setIsLoading(false);
      }
   };
   useEffect(() => {
      fetchServicesData();
   }, []);

   const sensors = useSensors(
      useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
      useSensor(KeyboardSensor, {
         coordinateGetter: sortableKeyboardCoordinates,
      })
   );

   async function updateServiceOrder(oldOrder: number, newOrder: number) {
      try {
         const res = await axios.post(
            "/api/admin/services/updateServiceOrder",
            {
               oldOrder,
               newOrder,
            }
         );
         if (!res.data || res.data.success === false) {
            const errorMessage =
               res.data?.error || "Failed to update service order";
            throw new Error(errorMessage);
         }
         return res.data;
      } catch (error) {
         console.error("Error in updateServiceOrder:", error);
         throw error;
      }
   }

   const handleDragEnd = async (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
         const oldIndex = services.findIndex(
            (item) => item.order_num === Number(active.id)
         );
         const newIndex = services.findIndex(
            (item) => item.order_num === Number(over.id)
         );

         const newServices = arrayMove([...services], oldIndex, newIndex);
         setServices(newServices);

         try {
            await updateServiceOrder(oldIndex + 1, newIndex + 1);
            fetchServicesData();
         } catch (error) {
            console.error("Error updating service order:", error);
            toast.error("เกิดข้อผิดพลาดในการอัปเดทลำดับ");
         }
      }
   };

   const handleDeleteService = async () => {
      if (!deleteId) return;
      try {
         setIsDeleting(true);
         await deleteService(deleteId);
         setServices((prev) =>
            prev.filter((service) => service.id !== deleteId)
         );
         setDeleteId(null);
         toast.success("ลบบริการเรียบร้อยแล้ว");
      } catch (error) {
         console.error("Failed to delete service:", error);
         toast.error("ไม่สามารถลบบริการได้ กรุณาลองใหม่อีกครั้ง");
      } finally {
         setIsDeleting(false);
         fetchServicesData();
      }
   };

   // --- SORTED & FILTERED SERVICES ---
   const sortedServices = [...services].sort(
      (a, b) => (Number(a.order_num) || 0) - (Number(b.order_num) || 0)
   );

   const filteredServices = React.useMemo(() => {
      const searchTerm = search.toLowerCase();
      return sortedServices.filter(
         (s: ServiceWithCategory) =>
            (s.title?.toLowerCase() || "").includes(searchTerm) ||
            (s.category_name?.toLowerCase() || "").includes(searchTerm)
      );
   }, [sortedServices, search]);

   const convertDateAndTimeFormat = (dateString: string) => {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const amPm = date.getHours() >= 12 ? "PM" : "AM";
      return `${day}/${month}/${year} ${hours}:${minutes}${amPm}`;
   };

   // --- LOADING SKELETON ---
   const renderLoadingSkeleton = () => (
      <div className="space-y-4">
         {[...Array(5)].map((_, i) => (
            <div
               key={i}
               className="h-16 bg-gray-100 rounded-md animate-pulse"
            ></div>
         ))}
      </div>
   );

   // --- ERROR STATE ---
   if (error) {
      return (
         <main className="p-6 bg-[var(--bg)] min-h-screen flex flex-col items-center justify-center">
            <section className="text-center max-w-md">
               <div className="text-[var(--red)] text-5xl mb-4">⚠️</div>
               <h2 className="text-xl font-semibold mb-2">เกิดข้อผิดพลาด</h2>
               <p className="text-[var(--gray-600)] mb-6">{error}</p>
               <Button
                  onClick={fetchServicesData}
                  disabled={isLoading}
                  className="flex items-center gap-2 mx-auto"
               >
                  {isLoading ? (
                     <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[var(--white)]"></div>
                        กำลังโหลด...
                     </>
                  ) : (
                     "ลองอีกครั้ง"
                  )}
               </Button>
            </section>
         </main>
      );
   }

   // --- MAIN RENDER ---
   return (
      <main className={`flex flex-col min-h-screen mb-16 bg-[var(--bg)]`}>
         {/* Header & Search */}
         <header className="relative flex flex-row justify-between items-center z-100 h-24 pl-12 pr-12 py-5 bg-[var(--white)]">
            <ToggleSidebarComponent />

            <div>
               <h1 className="text-2xl font-bold text-[var(--black)]">
                  บริการ
               </h1>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
               <div className="relative w-full md:w-80">
                  <Search className="absolute top-1/2 left-2 transform -translate-y-1/2 w-4 h-4 text-[var(--gray-300)]" />
                  <Input
                     placeholder="ค้นหาบริการ..."
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                     className="pl-8 border-2 border-[var(--gray-200)] rounded-md"
                  />
               </div>
               <Link href="/admin/services/add-service">
                  <Button className="flex items-center gap-2 px-5 py-2 btn btn--primary">
                     เพิ่มบริการ
                     <Plus className="h-4 w-4" />
                  </Button>
               </Link>
            </div>
         </header>

         {/* Main Table & DnD */}
         <section className="flex flex-col gap-[40px] w-[92%] max-w-[95%] mx-auto mt-10 bg-[var(--white)] border-2 border-[var(--gray-200)] rounded-2xl shadow-lg overflow-hidden">
            {isLoading ? (
               <div className="p-6">{renderLoadingSkeleton()}</div>
            ) : filteredServices.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-8">
                  <h3 className="text-lg font-medium text-[var(--black)]">
                     ไม่พบบริการ
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
                     <Link href="/admin/services/add-service">
                        <Button className="mt-4 px-5 py-2 btn btn-primary">
                           <Plus className="mr-2 h-4 w-4" />
                           เพิ่มบริการแรก
                        </Button>
                     </Link>
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
                        <TableHeader className="bg-[var(--bg)] text-body-3 text-[var(--gray-700)]">
                           <TableRow>
                              <TableHead className="w-[10px] text-center"></TableHead>
                              <TableHead className="text-center">
                                 ลำดับ
                              </TableHead>
                              <TableHead className="w-60">ชื่อบริการ</TableHead>
                              <TableHead className="w-60">หมวดหมู่</TableHead>
                              <TableHead>สร้างเมื่อ</TableHead>
                              <TableHead>แก้ไขล่าสุด</TableHead>
                              <TableHead className="w-[120px] text-center">
                                 Action
                              </TableHead>
                           </TableRow>
                        </TableHeader>
                        <TableBody>
                           {filteredServices.map((service) => (
                              <DraggableRow
                                 key={service.order_num}
                                 id={service.order_num.toString()}
                                 serviceId={service.id}
                                 services={services}
                                 className="h-18"
                              >
                                 <TableCell className="text-center"></TableCell>
                                 <TableCell className="text-center">
                                    {service.order_num}
                                 </TableCell>
                                 <TableCell>{service.title}</TableCell>
                                 <TableCell>
                                    <Link
                                       href={`/admin/categories/${service.category_id}`}
                                    >
                                       <span
                                          className={`px-2 py-1 rounded text-xs ${
                                             categoryVariants[
                                                service.category_name as keyof typeof categoryVariants
                                             ] || ""
                                          }`}
                                       >
                                          {service.category_name}
                                       </span>
                                    </Link>
                                 </TableCell>
                                 <TableCell>
                                    {convertDateAndTimeFormat(
                                       service.created_at
                                    )}
                                 </TableCell>
                                 <TableCell>
                                    {convertDateAndTimeFormat(
                                       service.updated_at
                                    )}
                                 </TableCell>
                                 <TableCell className="text-center">
                                    <div className="flex items-center justify-center">
                                       <Button
                                          size="icon"
                                          variant="ghost"
                                          className="text-[var(--gray-500)] hover:text-[var(--red)] hover:bg-[var(--gray-100)] cursor-pointer"
                                          onClick={() =>
                                             setDeleteId(service.id)
                                          }
                                          disabled={isDeleting}
                                       >
                                          <Trash2 />
                                       </Button>
                                       <Button
                                          size="icon"
                                          variant="ghost"
                                          className="text-[var(--blue-600)] hover:text-[var(--blue-400)] hover:bg-[var(--gray-100)] cursor-pointer"
                                          asChild
                                       >
                                          <Link
                                             href={`/admin/services/edit-service?serviceId=${service.id}`}
                                          >
                                             <SquarePen />
                                          </Link>
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
         </section>

         {/* Delete Dialog */}
         <AlertDialog
            open={!!deleteId}
            onOpenChange={(open) => {
               if (!open) setDeleteId(null);
            }}
         >
            <AlertDialogContent className="bg-[var(--white)] rounded-lg shadow-md p-6 w-96">
               <div className="flex justify-center">
                  <AlertTriangle className="w-10 h-10 text-[var(--red)]" />
               </div>
               <AlertDialogHeader className="text-center">
                  <AlertDialogTitle className="flex justify-center text-lg font-semibold text-[var(--gray-950)]">
                     ยืนยันการลบรายการ?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="flex justify-center text-center mt-2 text-md text-[var(--gray-700)]">
                     คุณต้องการลบรายการ &apos;
                     {services.find((s) => s.id === deleteId)?.title}&apos;
                     <br />
                     ใช่หรือไม่
                  </AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter className="flex flex-row justify-center sm:flex-row sm:justify-center items-center gap-2 mt-2">
                  <AlertDialogAction
                     onClick={handleDeleteService}
                     className="w-1/3 px-4 py-2 btn btn--primary"
                     disabled={isDeleting}
                  >
                     {isDeleting ? "กำลังลบ..." : "ลบรายการ"}
                  </AlertDialogAction>
                  <AlertDialogCancel
                     className="w-1/3 px-4 py-2 btn btn--secondary"
                     disabled={isDeleting}
                  >
                     ยกเลิก
                  </AlertDialogCancel>
               </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>
      </main>
   );
};

// --- Error Boundary Wrapper ---
const ServicePageWithErrorBoundary: React.FC = () => {
   return <ServicePage />;
};

export default ServicePageWithErrorBoundary;
