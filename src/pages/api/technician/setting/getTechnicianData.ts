import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";
import { TechnicianData } from "@/types";
import { getAuthenticatedClient } from "@/utils/api-helpers";

async function fetchTechnicianData(technicianId: string): Promise<TechnicianData | null> {
    try {
      const { data: techData, error: techError } = await supabase
          .from('technicians')
          .select(`
            id,
            first_name,
            last_name,
            tel,
            address,
            status,
            technician_services(
              id,
              is_active,
              services (
                id,
                title
              )
            )
          `)
          .eq("id", technicianId)
          .maybeSingle()
    
        if (techError) {
          console.error("Error fetching technician data:", techError);
          throw techError;
        }

        if (!techData) {
          console.error("No technician data found for ID:", technicianId);
          throw new Error("No technician data found for ID: " + technicianId);
        }

        const { data: allServicesData, error: allServicesError } = await supabase
          .from('services')
          .select(`
            id,
            title
          `)
          .order('order_num', { ascending: true });

        if (allServicesError) {
          console.error("Error fetching all services:", allServicesError);
          throw allServicesError;
        }

        if (!allServicesData) {
          console.error("No services found");
          throw new Error("No services found");
        }

        return { ...techData, allServices: allServicesData } as unknown as TechnicianData;
      } catch (error) {
        console.error("Error fetching technician data:", error);
        throw error;
      }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.status(405).json({ message: "Method not allowed" });
  }

  if (!supabase) {
    return res.status(500).json({ message: "Server configuration error" });
  }

  try {
    const authResult = await getAuthenticatedClient(req, res);
    if (!authResult) {
      return;
    }

    const { session } = authResult;
    const technicianId = session.user.id;
    const technicianData = await fetchTechnicianData(technicianId);
    console.log("fetchTechnicianData: ", technicianData);
    
    if (!technicianData) {
      return res.status(404).json({ message: "Technician not found" });
    }
    return res.status(200).json(technicianData);
  } catch (error) {
    console.error("Error fetching technician data:", error);
    return res.status(500).json({ message: "Failed to fetch technician data" });
  }
}
