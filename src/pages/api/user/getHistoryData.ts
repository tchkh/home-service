import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";
import { RepairCardProps } from "@/types/index";
import { getAuthenticatedClient } from "@/utils/api-helpers";

const fetchHistoryData = async (
  userId: string
): Promise<RepairCardProps[] | null> => {
  try {
    const { data, error } = await supabase
      .from("service_requests")
      .select(`
        id,
        status:technician_assignment_status(status),
        appointment_at,
        technician_assignment(
          technician:technicians(
            first_name,
            last_name
          )
        ),
        total_price,
        quantity,
        service:sub_services(
          title,
          service_unit
        ),
        service_request_code
      `)
      .order("created_at", { ascending: false })
      .eq("user_id", userId)
      .eq("status_id", 3);

    if (error) {
      throw new Error(error.message);
    }
    return data as unknown as RepairCardProps[];
  } catch (error) {
    console.error("Unexpected error:", error);
    return null;
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RepairCardProps[] | { error: string }>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!supabase) {
    return res.status(500).json({ error: "Server configuration error" });
  }

  try {
    const authResult = await getAuthenticatedClient(req, res);
    if (!authResult) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { session } = authResult;

    const userId = session.user.id;
    const data = await fetchHistoryData(userId);
    console.log("[DEBUG] data: ", data);
    if (!data) {
      return res.status(404).json({ error: "No repairs found" });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({ error: "An unexpected error occurred" });
  }
}
