import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { TechnicianData } from "@/types";
import { technicianAccountSchema } from "@/schemas/technicianAccountSchema";
import { getAuthenticatedClient } from "@/utils/api-helpers";

const updateTechnicianData = async (
  technicianId: string,
  payload: Omit<TechnicianData, "technician_services">
): Promise<TechnicianData> => {
  try {
    // Update technician table
    const { data: techData, error: techError } = await supabase
      .from("technicians")
      .update({
        first_name: payload.first_name,
        last_name: payload.last_name,
        tel: payload.tel,
        address: payload.address,
        status: payload.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", technicianId)
      .select()
      .single();

    if (techError || !techData) {
      console.error("Error updating technician data:", techError);
      throw techError || new Error("Failed to update technician data");
    }

    // Update technician services table
    const upsertPayload = payload.services_active.map((service) => ({
      technician_id: technicianId,
      service_id: service.service_id,
      is_active: service.is_active,
      updated_at: new Date().toISOString(),
    }));

    // ตรวจสอบ duplicate
    const seen = new Set();
    const hasDuplicate = upsertPayload.some((item) => {
      const key = `${item.technician_id}-${item.service_id}`;
      if (seen.has(key)) return true;
      seen.add(key);
      return false;
    });
    if (hasDuplicate) {
      throw new Error("Duplicate service_id in upsertPayload");
    }

    const { error: techServicesError } = await supabase
      .from("technician_services")
      .upsert(upsertPayload, { onConflict: "technician_id,service_id" });

    if (techServicesError) {
      console.error(
        "Error updating technician services data:",
        techServicesError
      );
      throw techServicesError;
    }

    // Fetch updated technician data with services
    const { data: updatedTechData, error: fetchError } = await supabase
      .from("technicians")
      .select(
        `
        *,
        technician_services!inner(
          *,
          services:services(*)
        )
      `
      )
      .eq("id", technicianId)
      .single();

    if (fetchError || !updatedTechData) {
      console.error("Error fetching updated technician data:", fetchError);
      throw fetchError || new Error("Failed to fetch updated technician data");
    }

    const technicianData = {
      id: updatedTechData.id,
      first_name: updatedTechData.first_name,
      last_name: updatedTechData.last_name,
      tel: updatedTechData.tel,
      address: updatedTechData.address,
      status: updatedTechData.status,
      services_active: updatedTechData.services_active || [],
      technician_services: updatedTechData.technician_services || [],
    };

    return technicianData;
  } catch (error) {
    console.error("Error updating technician data:", error);
    throw error;
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    | { message: string; technicianData?: TechnicianData }
    | { error: string; issues?: z.ZodIssue[] }
  >
) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
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
    const validPayload = technicianAccountSchema.parse(req.body);
    console.log("ValidPayload: ", validPayload);

    const formatedPayload = {
      id: technicianId,
      first_name: validPayload.firstName,
      last_name: validPayload.lastName,
      tel: validPayload.tel,
      address: validPayload.currentLocation,
      status: validPayload.technicianStatus?.toString() || "",
      services_active: validPayload.servicesActive.map((service) => ({
        service_id: Number(service.service_id),
        is_active: Boolean(service.is_active),
      })),
      updated_at: new Date().toISOString(),
    };
    console.log("FormatedPayload: ", formatedPayload);
    const technicianData = await updateTechnicianData(
      technicianId,
      formatedPayload
    );
    console.log("UpdatedTechnicianData: ", technicianData);
    
    if (!technicianData) {
      return res.status(404).json({ message: "Technician not found" });
    }
    return res.status(200).json({
      message: "Technician updated successfully",
      technicianData: technicianData,
    });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: "Validation error", issues: err.issues });
    }

    if (err instanceof Error) {
      return res
        .status(500)
        .json({ error: err.message || "Internal Server Error" });
    }

    console.error("Error updating technician data:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
