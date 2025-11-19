export interface CreateHotelDto {
  name: string;
  address: string;
  location: string;
  rating?: number;
  rating_count?: number;
}

export interface UpdateHotelDto {
  name?: string;
  address?: string;
  location?: string;
  rating?: number;
  rating_count?: number;
}
