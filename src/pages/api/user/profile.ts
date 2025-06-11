import { NextApiRequest, NextApiResponse } from "next";
import { getAuthenticatedClient } from "@/utils/api-helpers";
import { z } from "zod";

const updateProfileSchema = z.object({
  first_name: z.string().min(1, "กรุณากรอกชื่อ"),
  last_name: z.string().min(1, "กรุณากรอกนามสกุล"),
  tel: z.string().min(1, "กรุณากรอกเบอร์โทรศัพท์"),
  address: z.string().min(1, "กรุณากรอกที่อยู่"),
  subdistrict: z.string().min(1, "กรุณากรอกตำบล"),
  district: z.string().min(1, "กรุณากรอกอำเภอ"),
  province: z.string().min(1, "กรุณากรอกจังหวัด"),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const authResult = await getAuthenticatedClient(req, res);
    if (!authResult) {
      return;
    }
    const { session, supabase } = authResult;

    if (req.method === "GET") {
      // Get user profile with address data
      const { data: userProfile, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle()

      if (userError) {
        console.error("Error fetching user profile:", userError);
        return res.status(500).json({ error: "Failed to fetch user profile" });
      }

      // Get user address
      const { data: addressData, error: addressError } = await supabase
        .from("user_addresses")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle()

      const combinedProfile = {
        ...userProfile,
        address: addressData?.address || "",
        subdistrict: addressData?.sub_district || "",
        district: addressData?.district || "",
        province: addressData?.province || "",
        postalCode: addressData?.additional_info || "",
      };

      if (addressError) {
        console.error("Error fetching user address:", addressError);
        return res.status(500).json({ error: "Failed to fetch user address" });
      }

      return res.status(200).json({ user: combinedProfile });
    }

    if (req.method === "PUT") {
      // ✅ Validate request body (บังคับทุกช่อง)
      const validationResult = updateProfileSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: validationResult.error.errors,
        });
      }

      const {
        first_name,
        last_name,
        tel,
        address,
        subdistrict,
        district,
        province,
      } = validationResult.data;

      // Update users table
      const { error: userUpdateError } = await supabase
        .from("users")
        .update({
          first_name,
          last_name,
          tel,
          updated_at: new Date().toISOString(),
        })
        .eq("id", session.user.id);

      if (userUpdateError) {
        console.error("Error updating user profile:", userUpdateError);
        return res.status(500).json({ error: "Failed to update user profile" });
      }

      // Address handling (ไม่มี if เช็ค เพราะ validation บังคับแล้ว)
      const { data: existingAddress } = await supabase
        .from("user_addresses")
        .select("id")
        .eq("user_id", session.user.id)
        .single();

      const addressData = {
        user_id: session.user.id,
        address,
        sub_district: subdistrict,
        district,
        province,
        updated_at: new Date().toISOString(),
      };

      if (existingAddress) {
        const { error: addressUpdateError } = await supabase
          .from("user_addresses")
          .update(addressData)
          .eq("user_id", session.user.id);

        if (addressUpdateError) {
          console.error("Error updating address:", addressUpdateError);
          return res.status(500).json({ error: "Failed to update address" });
        }
      } else {
        const { error: addressInsertError } = await supabase
          .from("user_addresses")
          .insert({
            ...addressData,
            created_at: new Date().toISOString(),
          });

        if (addressInsertError) {
          console.error("Error creating address:", addressInsertError);
          return res.status(500).json({ error: "Failed to create address" });
        }
      }

      // Fetch and return updated data
      const { data: finalProfile, error: finalError } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .single();


      if (finalError) {
        console.error("Error fetching updated profile:", finalError);
        return res.status(500).json({ error: "Failed to fetch updated profile" });
      }

      const { data: updatedAddressData } = await supabase
        .from("user_addresses")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      const combinedUpdatedProfile = {
        ...finalProfile,
        address: updatedAddressData?.address || "",
        subdistrict: updatedAddressData?.sub_district || "",
        district: updatedAddressData?.district || "",
        province: updatedAddressData?.province || "",
        postalCode: updatedAddressData?.additional_info || "",
      };

      return res.status(200).json({ user: combinedUpdatedProfile });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Error in profile handler:", error);
    return res.status(500).json({
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    });
  }
}



