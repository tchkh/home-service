import React, { useState } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { Card, CardContent } from "@/components/ui/card";

interface CategoryData {
   name: string;
   color: string;
}

export default function CategoryForm() {
   const [categoryName, setCategoryName] = useState("บริการห้องครัว");
   const [categoryColor, setCategoryColor] = useState("#ffffff");
   //    const [isEditing, setIsEditing] = useState(false);

   //    // Mock data for demonstration
   const categoryData: CategoryData = {
      name: categoryName,
      color: categoryColor,
   };

   const handleSave = () => {
      console.log("Saving category:");

      // Here you would typically save to your backend
   };
   //    console.log("isEditing: ", isEditing);
   const handleCancel = () => {
      console.log("Cancelling changes");
   };

   //    const handleDelete = () => {
   //       console.log("Deleting category");
   //       // Here you would typically show a confirmation dialog
   //    };

   const handleColor = (e: React.ChangeEvent<HTMLInputElement>) => {
      setCategoryColor(e.target.value);
   };

   return (
      <div className="min-h-screen bg-gray-50">
         {/* Header */}
         <section className="bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-end max-w-4xl mx-auto">
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
            </div>
         </section>

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
                  <label htmlFor="changeColor">สี </label>
                  <input
                     id="changeColor"
                     type="color"
                     value={categoryColor}
                     onChange={handleColor}
                  />
                  <input
                     type="text"
                     value={categoryColor}
                     onChange={handleColor}
                  />
               </div>
            </div>
         </section>
      </div>
   );
}
