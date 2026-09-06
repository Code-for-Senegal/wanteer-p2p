export interface GeoPoint {
  latitude: number;
  longitude: number;
}

/** Coarse coordinates plus the administrative labels safe to expose publicly. */
export interface PublicLocation extends GeoPoint {
  country: string;
  region: string | null;
  city: string | null;
  district: string | null;
  displayName: string;
}
