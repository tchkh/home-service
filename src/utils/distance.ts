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
