import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";
import { CategoryName } from "@/types";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    const { data, error } = await supabase.from("categories").select(
      `
      id,
      name
      `
    );
    if (error) {
      console.log("error: ", error);
      throw error;
    }
    return res.status(200).json(data as CategoryName[]);
  }
};

export default handler;
