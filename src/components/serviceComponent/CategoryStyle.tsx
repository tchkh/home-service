import React from "react";
import { useEffect, useState } from "react";

interface popVarible {
   text: string;
   color: string;
   className?: string;
}
export default function CategoryStyle({ text, color, className }: popVarible) {
   const colortag = color;
   const [tagColor, setTagColor] = useState<string>("");

   useEffect(() => {
      const getCategoryTagStyle = (colorCategory: string) => {
         let bgColor;
         switch (colorCategory) {
            case "#0e3fb0":
               bgColor = " var(--blue-100) ";
               break;
            case "#4512b4":
               bgColor = " var(--purple-100) ";
               break;
            case "#00596c":
               bgColor = " var(--green-100) ";
               break;
            default:
               bgColor = `${color}2a`;
               break;
         }
         setTagColor(bgColor);
      };
      getCategoryTagStyle(colortag);
   }, [color, colortag]);
   if (!color) return null;
   return (
      <p
         style={{
            color: colortag,
            background: tagColor ? tagColor : "#000000",
         }}
         className={`rounded-[8px] grid place-items-center px-[10px] py-[4px]  min-w-[80px] min-h-[26px] box-border ${className}`}
      >
         {text}
      </p>
   );
}
