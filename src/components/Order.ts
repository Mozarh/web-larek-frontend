import { IOrderForm, IOrderFormContacts } from "../types";
import { IEvents } from "./base/events";
import { Form } from "./common/Form";

export class Order extends Form<IOrderForm> {
    protected _card: HTMLButtonElement;
    protected _cash: HTMLButtonElement;

    private handlePaymentClick = (paymentType: 'cash' | 'card') => {
        const activeButton = paymentType === 'cash' ? this._cash : this._card;
        const inactiveButton = paymentType === 'cash' ? this._card : this._cash;

        activeButton.classList.add('button_alt-active');
        inactiveButton.classList.remove('button_alt-active');
        this.onInputChange('payment', paymentType);
    };

    constructor(protected blockName: string, container: HTMLFormElement, events: IEvents) {
        super(container, events);

        this._card = container.elements.namedItem('card') as HTMLButtonElement;
        this._cash = container.elements.namedItem('cash') as HTMLButtonElement;

        if (this._cash && this._card) {
            this._cash.addEventListener('click', () => this.handlePaymentClick('cash'));
            this._card.addEventListener('click', () => this.handlePaymentClick('card'));
        }
    }

    disableButtons() {
        this._card.classList.remove('button_alt-active')
        this._cash.classList.remove('button_alt-active')
    }
}

export class Contacts extends Form<IOrderFormContacts> {
    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events)
    }
}