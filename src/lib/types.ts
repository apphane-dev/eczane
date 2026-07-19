export interface Pharmacy {
  name: string;
  address: string;
  phone: string | null;
  province: string;
  district: string;
  coordinates: { lat: number; lng: number } | null;
}

export interface CityData {
  province: string;
  updatedAt: string; // ISO
  pharmacies: Pharmacy[];
}
