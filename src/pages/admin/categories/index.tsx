import React, { useState } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import ToggleSidebarComponent from "@/components/ToggleSidebarComponent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { Card, CardContent } from "@/components/ui/card";

interface CategoryData {
   name: string;
   createdAt: string;
   updatedAt: string;
}

export default function CategoryForm() {
   const [categoryName, setCategoryName] = useState("บริการห้องครัว");
   const [isEditing, setIsEditing] = useState(false);

   // Mock data for demonstration
   const categoryData: CategoryData = {
      name: categoryName,
      createdAt: "12/02/2022 10:30PM",
      updatedAt: "12/02/2022 10:30PM",
   };

   const handleSave = () => {
      console.log("Saving category:", categoryName);
      setIsEditing(false);
      // Here you would typically save to your backend
   };
   console.log("isEditing: ", isEditing);
   const handleCancel = () => {
      console.log("Cancelling changes");
      setCategoryName(categoryData.name);
      setIsEditing(false);
   };

   const handleDelete = () => {
      console.log("Deleting category");
      // Here you would typically show a confirmation dialog
   };

   const handleBack = () => {
      console.log("Going back");
      // Here you would typically navigate back
   };

   return (
      <div className="min-h-screen bg-gray-50">
         {/* Header */}
         <header className="relative bg-white border-b border-gray-200 px-4 py-3">
            <ToggleSidebarComponent />
            <section className="flex items-center justify-between max-w-4xl mx-auto">
               <div className="flex items-center space-x-4">
                  <Button
                     variant="ghost"
                     size="sm"
                     onClick={handleBack}
                     className="p-2 hover:bg-gray-100"
                  >
                     <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </Button>
                  <h1 className="text-lg font-semibold text-gray-900">
                     หมวดหมู่
                  </h1>
               </div>

               <div className="flex items-center space-x-3">
                  <Button
                     variant="outline"
                     size="sm"
                     onClick={handleCancel}
                     className="px-4 py-2 text-gray-600 border-gray-300 hover:bg-gray-50"
                  >
                     ยกเลิก
                  </Button>
                  <Button
                     size="sm"
                     onClick={handleSave}
                     className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                     ยืนยัน
                  </Button>
               </div>
            </section>
         </header>

         {/* Main Content */}
         <section className="max-w-4xl mx-auto p-6">
            <div className="bg-white shadow-sm">
               <div className="p-6 space-y-6">
                  {/* Category Name Input */}
                  <div className="space-y-2">
                     <Label
                        htmlFor="categoryName"
                        className="text-sm font-medium text-gray-700"
                     >
                        ชื่อหมวดหมู่*
                     </Label>
                     <Input
                        id="categoryName"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="กรอกชื่อหมวดหมู่"
                     />
                  </div>

                  {/* Metadata Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                     <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-500">
                           สร้างเมื่อ
                        </Label>
                        <p className="text-sm text-gray-900">
                           {categoryData.createdAt}
                        </p>
                     </div>

                     <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-500">
                           แก้ไขล่าสุด
                        </Label>
                        <p className="text-sm text-gray-900">
                           {categoryData.updatedAt}
                        </p>
                     </div>
                  </div>

                  {/* Delete Section */}
                  <div className="pt-6 border-t border-gray-100">
                     <Button
                        variant="outline"
                        onClick={handleDelete}
                        className="flex items-center space-x-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                     >
                        <Trash2 className="w-4 h-4" />
                        <span>ลบหมวดหมู่</span>
                     </Button>
                  </div>
               </div>
            </div>
         </section>
      </div>
   );
}
