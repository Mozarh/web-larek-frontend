import { ICartItem } from "./Models"

export interface ICart {
    items: ICartItem[];
    totalPrice: number;
}