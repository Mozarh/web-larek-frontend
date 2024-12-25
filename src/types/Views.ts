export interface IProductCardView {
    id: string;
    name: string;
    price: number;
    image: string;
};

export interface ICartItemView {
    id: string;
    name: string;
    quantity: number;
    price: number;
    totalPrice: number;
};