export type ProductCategory =
    | 'софт-скил'
    | 'другое'
    | 'дополнительное'
    | 'кнопка'
    | 'хард-скил';

export type ComparisonCategory = {
    [Key in ProductCategory]: string;
}

export interface IProduct {
    title: string;
    description: string;
    id: string;
    image: string;
    price: number | null;
    category: string;
    addedToCart: boolean;
};

export interface IAppState {
    catalog: IProduct[];
    basket: string[];
    order: IOrder | null;
    loading: boolean;
}

export interface IOrderForm {
    payment: string;
    address: string;
}

export interface IOrderFormContacts {
    email: string;
    phone: string;
}

export interface IOrder extends IOrderForm {
    items: string[];
    payment: string;
    address: string;
    total: number;
    email: string;
    phone: string
}

export type FormErrors = Partial<Record<keyof IOrder, string>>;

export interface ApiResponse {
    items: IProduct[];
}