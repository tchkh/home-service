import React from "react";
import dynamic from "next/dynamic";
import { MapProps, MapPopupProps } from "@/types";

// Dynamic import ของ Map component เพื่อหลีกเลี่ยง SSR
const MapComponent = dynamic<MapProps>(() => import("./MapDistance"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f3f4f6",
        color: "#6b7280",
      }}
    >
      🗺️ กำลังโหลดแผนที่...
    </div>
  ),
});

export function MapPopup({
  isOpen,
  onClose,
  data,
  technicianLocation,
  straightDistance,
}: MapPopupProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "20px",
          width: "90%",
          maxWidth: "800px",
          height: "75%",
          maxHeight: "650px",
          position: "relative",
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ปุ่มปิด */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "15px",
            right: "15px",
            backgroundColor: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: "50%",
            width: "32px",
            height: "32px",
            fontSize: "18px",
            fontWeight: "bold",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1001,
          }}
        >
          ×
        </button>

        {/* หัวข้อและข้อมูลระยะทาง */}
        <div style={{ marginBottom: "15px" }}>
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              marginBottom: "12px",
              color: "#1f2937",
            }}
          >
            เส้นทางไปยังลูกค้า
          </h2>

          <div
            style={{
              display: "flex",
              gap: "25px",
              flexWrap: "wrap",
              marginBottom: "8px",
            }}
          >
            <div>
              <span style={{ fontSize: "14px", color: "#6b7280" }}>
                ระยะทางโดยประมาณ:{" "}
              </span>
              <span
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#2563eb",
                }}
              >
                {straightDistance.toFixed(1)} กม.
              </span>
            </div>
          </div>
        </div>

        {/* แผนที่ */}
        <div
          style={{
            height: "calc(100% - 100px)",
            borderRadius: "8px",
            overflow: "hidden",
            border: "2px solid #e5e7eb",
          }}
        >
          <MapComponent
            data={data}
            technicianLocation={technicianLocation}
            straightDistance={straightDistance}
          />
        </div>
      </div>
    </div>
  );
}