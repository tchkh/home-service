import { NextApiRequest, NextApiResponse } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { geocodeAddress } from "@/utils/location";

interface CartItem {
  id: number;
  price: number;
  quantity: number;
}

interface DiscountedCartItem extends CartItem {
  finalPrice: number;
  finalTotal: number;
  discountAmount: number;
}

interface PromoCodeDiscount {
  type: "percentage" | "fixed";
  value: number;
  amount: number;
}

interface Coordinates {
  lat: number;
  lng: number;
}

// Function to calculate discounted prices for each cart item
const calculateDiscountedPrices = (
  items: CartItem[],
  discount: PromoCodeDiscount | null,
): DiscountedCartItem[] => {
  if (!discount) {
    // No discount applied - return original prices
    return items.map((item) => ({
      ...item,
      finalPrice: item.price,
      finalTotal: item.price * item.quantity,
      discountAmount: 0,
    }));
  }

  const grandTotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  if (discount.type === "percentage") {
    // Apply percentage discount to each item individually
    return items.map((item) => {
      const discountedPrice = item.price * (1 - discount.value / 100);
      const discountedTotal = discountedPrice * item.quantity;
      const itemDiscountAmount = item.price * item.quantity - discountedTotal;

      return {
        ...item,
        finalPrice: discountedPrice,
        finalTotal: discountedTotal,
        discountAmount: itemDiscountAmount,
      };
    });
  } else {
    // Fixed discount - distribute proportionally across all items
    return items.map((item) => {
      const itemTotal = item.price * item.quantity;
      const itemProportion = itemTotal / grandTotal;
      const itemDiscountAmount = discount.amount * itemProportion;
      const discountedItemTotal = Math.max(0, itemTotal - itemDiscountAmount);
      const discountedPrice =
        item.quantity > 0 ? discountedItemTotal / item.quantity : 0;

      return {
        ...item,
        finalPrice: discountedPrice,
        finalTotal: discountedItemTotal,
        discountAmount: itemDiscountAmount,
      };
    });
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT",
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
  );

  // Handle preflight request
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Create authenticated Supabase client
  const supabase = createSupabaseServerClient({ req, res });

  // Get user from session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = session.user.id;

  try {
    const {
      items,
      customerInfo,
      paymentIntentId,
      paymentStatus = "paid",
      promoCode,
      discount,
    } = req.body;

    // Validate required fields
    if (!items || !customerInfo) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Calculate discounted prices for each item
    const discountedItems = calculateDiscountedPrices(
      items as CartItem[],
      discount,
    );

    // Log incoming data for debugging
    console.log("🔍 Debugging booking creation:");
    console.log("userId:", userId);
    console.log("items:", JSON.stringify(items, null, 2));
    console.log("discountedItems:", JSON.stringify(discountedItems, null, 2));
    console.log("customerInfo:", JSON.stringify(customerInfo, null, 2));
    console.log("paymentIntentId:", paymentIntentId);
    console.log("paymentStatus:", paymentStatus);
    console.log("promoCode:", promoCode);
    console.log("discount:", JSON.stringify(discount, null, 2));

    // Format appointment datetime - handle Thai timezone correctly
    const serviceDate = new Date(customerInfo.serviceDate);
    const [hours, minutes] = customerInfo.serviceTime.split(":");

    // Create timestamp in local timezone (Thailand)
    const year = serviceDate.getFullYear();
    const month = serviceDate.getMonth();
    const date = serviceDate.getDate();
    const hour = parseInt(hours);
    const minute = parseInt(minutes);

    // Create date string in format that doesn't get converted
    const appointmentDateTime = `${year}-${String(month + 1).padStart(2, "0")}-${String(date).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00+07:00`;

    // Get GPS coordinates if not provided manually
    let latitude = customerInfo.latitude;
    let longitude = customerInfo.longitude;

    if (!latitude || !longitude) {
      try {
        const coordinates = (await geocodeAddress(
          `${customerInfo.address} ${customerInfo.subDistrict} ${customerInfo.district} ${customerInfo.province}`,
        )) as Coordinates;
        latitude = coordinates.lat;
        longitude = coordinates.lng;
      } catch (error) {
        console.error("Geocoding error:", error);
        // Continue without coordinates
      }
    }

    // Prepare service requests with discounted prices
    // Note: We store the final discounted total_price, but keep the original structure for database compatibility
    const serviceRequests = discountedItems.map((item) => ({
      user_id: userId,
      sub_service_id: item.id,
      address: customerInfo.address,
      province: customerInfo.province,
      district: customerInfo.district,
      sub_district: customerInfo.subDistrict,
      additional_info: customerInfo.additionalInfo ?? null,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      appointment_at: appointmentDateTime,
      total_price: item.finalTotal, // This is the final price after discount
      quantity: item.quantity,
    }));

    // Log the final service requests for debugging
    console.log("📝 Final service requests to insert:", JSON.stringify(serviceRequests, null, 2));

    // Insert to database
    const { data, error } = await supabase
      .from("service_requests")
      .insert(serviceRequests)
      .select();

    if (error) {
      console.error("❌ Supabase error:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      return res.status(500).json({
        error: "Failed to create booking",
        details: error.message,
        supabaseError: error,
      });
    }

    console.log("✅ Successfully inserted to database:", data);

    // Generate booking ID from the first inserted record
    const bookingId =
      data && data[0] ? `BKG-${data[0].id}` : `BKG-${Date.now()}`;

    // Store discount information in a metadata table for tracking
    if (discount && promoCode && data && data.length > 0) {
      try {
        const discountMetadata = {
          booking_id: bookingId,
          service_request_ids: data.map(record => record.id),
          promocode: promoCode,
          discount_type: discount.type,
          discount_value: discount.value,
          total_discount_amount: discount.amount,
          original_total: discountedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
          final_total: discountedItems.reduce((sum, item) => sum + item.finalTotal, 0),
          created_at: new Date().toISOString()
        };
        
        console.log("💾 Storing discount metadata:", JSON.stringify(discountMetadata, null, 2));
        
        // Try to insert discount metadata (this will fail gracefully if table doesn't exist)
        const { error: metadataError } = await supabase
          .from('booking_discounts')
          .insert([discountMetadata]);
          
        if (metadataError) {
          console.log("ℹ️ Note: booking_discounts table doesn't exist, skipping metadata storage");
        }
      } catch (metadataError) {
        console.log("ℹ️ Could not store discount metadata:", metadataError);
      }
    }

    // TODO: บันทึกข้อมูล payment ใน table แยก (ถ้าต้องการ)
    // const paymentRecord = {
    //   booking_id: bookingId,
    //   payment_intent_id: paymentIntentId,
    //   payment_status: paymentStatus,
    //   total_amount: totalAmount,
    //   payment_method: 'creditcard'
    // }
    // await supabase.from('payments').insert([paymentRecord])

    // Return success response
    return res.status(200).json({
      success: true,
      bookingId,
      serviceRequests: data,
      message: "Booking created successfully",
      totalRecords: data?.length || 0,
    });
  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: (error as Error).message,
    });
  }
}
