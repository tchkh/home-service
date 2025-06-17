import { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabase";
import { ServiceIdSchema } from "../../../../schemas/delete-service-by-id";

// Disable body parsing (though no body expected)
export const config = { api: { bodyParser: false } };

// Schema for query parameters
type DeleteResponse = { message: string } | { error: string };

async function deleteImageFromStorage(imageUrl: string): Promise<void> {
  try {
    if (!imageUrl) return;
    if (supabaseAdmin === null) {
      throw new Error("Supabase Admin is not initialized");
    }

    const match = imageUrl.match(/service-image\/(.+)/);
    if (!match) {
      console.error("Not a service-image bucket file");
      return;
    }
    let filePath = match[1];
    if (!filePath.startsWith("service-image/")) {
      filePath = `service-image/${filePath}`;
    }

    const { error } = await supabaseAdmin.storage
      .from("service-image")
      .remove([filePath]);
    if (error) {
      console.error("Supabase Storage delete error:", error);
    }
  } catch (err) {
    console.error("Error deleting image from storage:", err);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DeleteResponse>
) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Validate query
  let serviceId: string;
  try {
    ({ serviceId } = ServiceIdSchema.parse(req.query));
  } catch {
    return res.status(400).json({ error: "Invalid serviceId" });
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ error: "Supabase Admin is not initialized" });
  }

  try {
    // Update sub_services first (soft delete)
    const { error: delSubErr } = await supabaseAdmin
      .from("sub_services")
      .update({ status: "cancelled" })
      .eq("service_id", serviceId);
    if (delSubErr) {
      console.error("Error soft deleting sub_services:", delSubErr);
      throw delSubErr;
    }

    // get order_num of deleted service
    const { data: deletedService, error: SelectErr } = await supabaseAdmin
      .from("services")
      .select("order_num")
      .eq("id", serviceId)
      .single();
    if (SelectErr || !deletedService) {
      console.error("Error soft deleting service:", SelectErr);
      throw SelectErr;
    }
    const deletedOrderNum = deletedService.order_num;
    
    // delete image from storage
    const { data: oldData, error: oldErr } = await supabaseAdmin
      .from("services")
      .select("image_url")
      .eq("id", serviceId)
      .single();
    if (!oldErr && oldData?.image_url) {
      await deleteImageFromStorage(oldData.image_url);
    }
    // Update service (soft delete)
    const { error: delSvcErr } = await supabaseAdmin
      .from("services")
      .update({ status: "cancelled" })
      .eq("id", serviceId);
    if (delSvcErr) {
      console.error("Error soft deleting service:", delSvcErr);
      throw delSvcErr;
    }

    // reorder order_num
    const { error: reorderErr } = await supabaseAdmin.rpc(
      "reorder_after_delete",
      { deleted_order_num: deletedOrderNum }
    );
    if (reorderErr) {
      console.error("Error reordering services:", reorderErr);
      throw reorderErr;
    }

    return res
      .status(200)
      .json({ message: `Service ${serviceId} deleted successfully` });
  } catch (error: unknown) {
    console.error("Error in deleteServiceById:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    return res.status(500).json({ error: errorMessage });
  }
}
