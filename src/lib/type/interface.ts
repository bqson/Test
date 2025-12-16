export interface IDestination {
  id?: string;
  region_id: string;
  name: string;
  country: string;
  description: string;
  latitude: number;
  longitude: number;
  category: string;
  best_season: string;
  rating: number;
  images: Array<string>;
  created_at: Date;
  updated_at: Date;
}

export interface ITrip {
  id?: string;
  destination_id: string;
  title: string;
  description: string;
  departure: string;
  distance: number;
  start_date: Date;
  end_date: Date;
  difficult: number;
  total_budget: number;
  spent_amount: number;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export interface ICost {
  id?: string;
  route_id: string;
  description: string;
  amount: number;
  currency: string;
  created_at: Date;
  updated_at: Date;
}

export interface IRoute {
  id?: string;
  index: number;
  trip_id: string;
  title: string;
  description: string;
  lngStart: number;
  latStart: number;
  lngEnd: number;
  latEnd: number;
  details: string[];
  costs: ICost[]; // ĐÃ THÊM: Danh sách chi phí
  created_at: Date;
  updated_at: Date;
}

export interface TripDetail {
  id: string;
  title: string;
  description: string;
  departure: string;
  destination: string;
  start_date: string;
  end_date: string;
  difficult: number;
  total_budget: number;
  spent_amount: number;
  status: "planning" | "ongoing" | "completed" | "cancelled";
  currency: string;
  members: number;
  routes: IRoute[];
  distance: number;
}
