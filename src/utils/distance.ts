import { isPointWithinRadius } from "geolib";
import { CustomerRequest } from "@/types";

export function filterNearbyCustomers(
  technicianPos: { latitude: number; longitude: number },
  customersPos: CustomerRequest[],
  maxDistance: number
) {
  return customersPos.filter((cust) =>
    isPointWithinRadius(
      { latitude: cust.latitude, longitude: cust.longitude },
      technicianPos,
      maxDistance
    )
  );
}

/**
 * คำนวณระยะทางแบบเส้นตรงระหว่างสองจุดโดยใช้ Haversine formula
 * @param lat1 ละติจูดจุดแรก
 * @param lon1 ลองจิจูดจุดแรก
 * @param lat2 ละติจูดจุดที่สอง
 * @param lon2 ลองจิจูดจุดที่สอง
 * @returns ระยะทางในหน่วยกิโลเมตร
 */
export const calculateStraightDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371; // รัศมีของโลกในหน่วยกิโลเมตร
  
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const lat1Rad = toRad(lat1);
  const lat2Rad = toRad(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) *
      Math.sin(dLon / 2) *
      Math.cos(lat1Rad) *
      Math.cos(lat2Rad);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
};