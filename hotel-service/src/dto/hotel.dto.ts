export interface CreateHotelDto {
  name: string;
  address: string;
  location: string;
  rating?: number;
  ratingCount?: number;
}

export interface UpdateHotelDto {
  name?: string;
  address?: string;
  location?: string;
  rating?: number;
  ratingCount?: number;
}
