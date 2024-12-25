export interface IProduct {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
};

export interface ICartItem extends IProduct {
    quantity: number;
};

export interface IUser {
    id: string;
    email: string;
    phone: string;
    adress: string;
};

export interface IOrder {
    id: string;
    totalPrice: number;
    paymentMethod: 'online' | 'offline';
};