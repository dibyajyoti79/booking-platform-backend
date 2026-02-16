import { serverConfig } from "../config";
import { InternalServerError } from "../utils/api-error";

export interface QuoteResult {
  available: boolean;
  totalPrice: number;
  nightlyRates: { date: string; rate: number }[];
  message?: string;
}

export interface QuoteResponse {
  success: boolean;
  message: string;
  data: QuoteResult;
}

export interface GetQuoteBody {
  hotelId: number;
  roomTypeId: number;
  checkIn: Date;
  checkOut: Date;
  totalGuests?: number;
}

/**
 * Calls hotel-service availability quote endpoint.
 * Uses HOTEL_SERVICE_URL (e.g. http://localhost:3000 for direct service call).
 */
export async function getQuote(body: GetQuoteBody): Promise<QuoteResult> {
  const baseUrl = serverConfig.HOTEL_SERVICE_URL.replace(/\/$/, "");
  const url = `${baseUrl}/api/v1/availability/quote`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      hotelId: body.hotelId,
      roomTypeId: body.roomTypeId,
      checkIn: body.checkIn.toISOString().slice(0, 10),
      checkOut: body.checkOut.toISOString().slice(0, 10),
      ...(body.totalGuests != null && { totalGuests: body.totalGuests }),
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new InternalServerError(
      `Hotel service quote failed: ${res.status} ${text}`
    );
  }

  const json = (await res.json()) as QuoteResponse;
  if (!json.data) {
    throw new InternalServerError("Hotel service returned invalid quote response");
  }
  return json.data;
}
