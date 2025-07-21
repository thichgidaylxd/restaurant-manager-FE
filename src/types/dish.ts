export interface Dish {
  id: string;
  dishId?: string;
  name: string;
  dishType?: { id: string; name: string } | null;
  price: number;
  image: string;
  unit?: string;
  status?: string;
  note?: string | null;
}
export interface DishType {

  id: string;
  name: string;

}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  note?: string | null | undefined;
}

export interface Notification {
  id: string;
  tableId: string;
  dishId: string;
  dishName: string;
  quantity: number;
  status: string;
  timestamp: number;
}