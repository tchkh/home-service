import { NextApiRequest, NextApiResponse } from "next";
import { getAuthenticatedClient } from "@/utils/api-helpers";
import { IncomingForm } from "formidable";
import fs from "fs";

// ไม่ต้องจัดการ body ของ request นี้ ให้ formidable จัดการเอง
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function avatar(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const authResult = await getAuthenticatedClient(req, res);
    if (!authResult) {
      return;
    }
    const { session, supabase } = authResult;

    if (req.method === "POST") {
      // Upload avatar
      const form = new IncomingForm();

      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error("Error parsing form:", err);
          return res.status(500).json({ error: "Failed to parse form data" });
        }

        const file = Array.isArray(files.avatar)
          ? files.avatar[0]
          : files.avatar;

        if (!file) {
          return res.status(400).json({ error: "No file uploaded" });
        }

        try {
          // Read file
          const fileBuffer = fs.readFileSync(file.filepath);
          const fileName = `avatar`;
          const filePath = `${session.user.id}/${fileName}`;

          // Upload to Supabase Storage
          const { error: uploadError } =
            await supabase.storage
              .from("avatars")
              .upload(filePath, fileBuffer, {
                contentType: file.mimetype || "image/jpeg",
                upsert: true, // Replace if exists
              });

          if (uploadError) {
            console.error("Error uploading file:", uploadError);
            return res.status(500).json({ error: "Failed to upload avatar" });
          }

          // Get public URL
          const { data: urlData } = supabase.storage
            .from("avatars")
            .getPublicUrl(filePath);

          // สร้าง URL ที่มี cache buster parameter
          const publicUrlWithCacheBuster = `${urlData.publicUrl}?t=${Date.now()}`;

          // Update user profile with image URL
          const { error: updateError } = await supabase
            .from("users")
            .update({
              image_url: publicUrlWithCacheBuster,
              updated_at: new Date().toISOString(),
            })
            .eq("id", session.user.id);

          if (updateError) {
            console.error("Error updating user profile:", updateError);
            return res.status(500).json({ error: "Failed to update profile" });
          }

          // Clean up temp file
          fs.unlinkSync(file.filepath);

          return res.status(200).json({
            message: "Avatar uploaded successfully",
            imageUrl: publicUrlWithCacheBuster,
          });
        } catch (error) {
          console.error("Error processing file upload:", error);
          return res
            .status(500)
            .json({ error: "Failed to process file upload" });
        }
      });
    } else if (req.method === "DELETE") {
      // Delete avatar
      try {
        const filePath = `${session.user.id}/avatar`;

        // Delete from Supabase Storage
        const { error: deleteError } = await supabase.storage
          .from("avatars")
          .remove([filePath]);

        if (deleteError) {
          console.error("Error deleting from storage:", deleteError);
          // Don't return error here as file might not exist
        }

        // Update user profile to remove image URL
        const { error: updateError } = await supabase
          .from("users")
          .update({
            image_url: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", session.user.id);

        if (updateError) {
          console.error("Error updating user profile:", updateError);
          return res.status(500).json({ error: "Failed to update profile" });
        }

        return res.status(200).json({
          message: "Avatar deleted successfully",
        });
      } catch (error) {
        console.error("Error processing avatar deletion:", error);
        return res
          .status(500)
          .json({ error: "Failed to process avatar deletion" });
      }
    } else {
      return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error in avatar handler:", error);
    return res.status(500).json({
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    });
  }
}
