import { FormErrors, IAppState, IOrder, IOrderForm, IProduct } from '../types';
import { Model } from './base/Model';

export type ProductChangeEvent = {
    catalog: ProductItem[];
};

export class ProductItem extends Model<IProduct> {
    title: string;
    description: string;
    id: string;
    image: string;
    price: number | null;
    category: string;
    selected: boolean;
    template?: HTMLTemplateElement;
}

export class AppState extends Model<IAppState> {
    catalog: ProductItem[];
    basket: ProductItem[] = [];
    order: IOrder = {
        items: [],
        payment: '',
        address: '',
        email: '',
        phone: '',
        total: null,
    };
    formErrors: FormErrors = {};

    addToBasket(value: ProductItem): boolean {
        if (!this.basket.some(item => item.id === value.id)) {
            this.basket.push(value);
            this.events.emit('basket:changed', this.basket);
            return true;
        }
        return false;
    }

    deleteFromBasket(id: string) {
        const itemIndex = this.basket.findIndex(item => item.id === id);
        if (itemIndex !== -1) {
            this.basket.splice(itemIndex, 1);
            this.events.emit('basket:changed', this.basket);
        }
    }

    clearBasket() {
        this.basket.length = 0;
        this.events.emit('basket:changed', this.basket);
    }

    getBasketAmount() {
        return this.basket.length;
    }

    setItems() {
        this.order.items = this.basket.map(item => item.id)
    }

    setOrderField(field: keyof IOrderForm, value: string) {
        this.order[field] = value;
        this.validateForm();
    }

    private validateForm() {
        const isContactsValid = this.validateContacts();
        const isOrderValid = this.validateOrder();

        if (isContactsValid && isOrderValid) {
            this.events.emit('order:ready', this.order);
        }
    }

    validateContacts() {
        const errors: typeof this.formErrors = {};

        const emailRegExp = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!this.order.email || !emailRegExp.test(this.order.email)) {
            errors.email = 'Необходимо указать правильный email';
        }

        const phoneRegExp = /^(\+7|8)?(\(?\d{3}\)?[\s\-]?)?(\d{3}[\s\-]?\d{2}[\s\-]?\d{2})$/;
        if (!this.order.phone || !phoneRegExp.test(this.order.phone)) {
            errors.phone = 'Необходимо указать правильный номер телефона';
        }

        this.formErrors = errors;
        this.events.emit('contactsFormErrors:change', this.formErrors);
        return Object.keys(errors).length === 0;
    }

    validateOrder() {
        const errors: typeof this.formErrors = {};
        if (!this.order.payment) {
            errors.payment = 'Необходимо указать способ оплаты';
        }
        if (!this.order.address) {
            errors.address = 'Необходимо указать адрес';
        }
        this.formErrors = errors;
        this.events.emit('orderFormErrors:change', this.formErrors);
        return Object.keys(errors).length === 0;
    }

    getTotal() {
        return this.basket.reduce((total, item) => {
            return total + (item.price || 0);
        }, 0);
    };

    setCatalog(items: IProduct[]) {
        this.catalog = items.map((item) => new ProductItem(item, this.events));
        this.emitChanges('items:changed', { catalog: this.catalog });
    }

    resetSelected() {
        this.catalog.filter(item => !item.selected).forEach(item => {
            item.selected = false;
        });
    }

    refreshOrder() {
        this.order = {
            items: [],
            payment: '',
            address: '',
            email: '',
            phone: '',
            total: null,
        };
    }
}
