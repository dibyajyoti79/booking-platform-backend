import { prisma } from "../prisma/client";
import { getDatesInRange } from "../utils/date-range";
import type { GetQuoteDto, QuoteResultDto } from "../dtos/availability.dto";
import { NotFoundError } from "../utils/api-error";

/**
 * Returns the list of dates (nights) from checkIn to the day before checkOut (inclusive).
 * e.g. checkIn Jan 1, checkOut Jan 3 => [Jan 1, Jan 2]
 */
function getNightDates(checkIn: Date, checkOut: Date): Date[] {
  const end = new Date(checkOut);
  end.setUTCDate(end.getUTCDate() - 1);
  return getDatesInRange(checkIn, end);
}

export async function getQuote(dto: GetQuoteDto): Promise<QuoteResultDto> {
  const nights = getNightDates(dto.checkIn, dto.checkOut);
  if (nights.length === 0) {
    return {
      available: false,
      totalPrice: 0,
      nightlyRates: [],
      message: "checkOut must be at least one day after checkIn",
    };
  }

  const roomType = await prisma.roomType.findFirst({
    where: { id: dto.roomTypeId, hotelId: dto.hotelId },
  });
  if (!roomType) {
    throw new NotFoundError("Room type not found for this hotel");
  }
  if (
    dto.totalGuests != null &&
    dto.totalGuests > roomType.maxOccupancy
  ) {
    return {
      available: false,
      totalPrice: 0,
      nightlyRates: [],
      message: `Room type allows max ${roomType.maxOccupancy} guests`,
    };
  }

  const [inventories, rates] = await Promise.all([
    prisma.inventory.findMany({
      where: {
        hotelId: dto.hotelId,
        roomTypeId: dto.roomTypeId,
        date: { in: nights },
      },
    }),
    prisma.rate.findMany({
      where: {
        hotelId: dto.hotelId,
        roomTypeId: dto.roomTypeId,
        date: { in: nights },
      },
    }),
  ]);

  const inventoryByDate = new Map(
    inventories.map((i) => [i.date.toISOString().slice(0, 10), i])
  );
  const rateByDate = new Map(
    rates.map((r) => [r.date.toISOString().slice(0, 10), Number(r.rate)])
  );

  const nightlyRates: { date: string; rate: number }[] = [];
  let totalPrice = 0;
  let available = true;

  for (const night of nights) {
    const dateStr = night.toISOString().slice(0, 10);
    const inv = inventoryByDate.get(dateStr);
    const rate = rateByDate.get(dateStr);

    if (rate == null) {
      available = false;
      break;
    }
    const availableRooms = inv
      ? inv.totalInventory - inv.totalReserved
      : 0;
    if (availableRooms < 1) {
      available = false;
      break;
    }

    nightlyRates.push({ date: dateStr, rate });
    totalPrice += rate;
  }

  return {
    available,
    totalPrice,
    nightlyRates,
    message: available
      ? undefined
      : "No availability or missing rate for one or more nights",
  };
}
