import { IOrderForm, IProduct } from "../../types";
import { Api, ApiListResponse } from "../base/api";


export class ApiService extends Api {
    constructor(baseUrl: string) {
        super(baseUrl);
    }

    getProducts(): Promise<ApiListResponse<IProduct>> {
        return this.get('/product');
    }

    sendOrder(orderData: IOrderForm): Promise<ApiListResponse<string>> {
        return this.post('/order', orderData);
    }

    updateProduct(id: string, data: IProduct): Promise<IProduct> {
        return this.post(`/product/${id}`, data, 'PUT');
    }

    deleteProduct(id: string): Promise<void> {
        return this.post(`/product/${id}`, {}, 'DELETE');
    }
}
