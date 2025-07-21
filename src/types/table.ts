export interface RestaurantTable {
  id: string;
  tableType: { id: string; name: string };
  name: string;
  status: String;
  maxPerson?: number | null;
  note?: string | null;
  dishes?: OrderItem[];
}

export interface TableType {
  id: string;
  name: string;
}

export interface OrderItem {
  id: string;
  tableId: string;
  dishId: string;
  dishName: string;
  price: number;
  unit: string;
  image?: string | null;
  quantity: number;
  note?: string | null;
  status: string;
}