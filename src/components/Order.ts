import { IOrderForm, IOrderFormContacts } from "../types";
import { IEvents } from "./base/events";
import { Form } from "./common/Form";

export class Order extends Form<IOrderForm> {
    protected _card: HTMLButtonElement;
    protected _cash: HTMLButtonElement;

    private toggleCard(state: boolean = true) {
        if (this._card) {
            this.toggleClass(this._card, 'button_alt-active', state);
        }
    }

    private toggleCash(state: boolean = true) {
        if (this._cash) {
            this.toggleClass(this._cash, 'button_alt-active', state);
        }
    }

    private handlePaymentClick = (paymentType: 'cash' | 'card') => {
        if (paymentType === 'cash') {
            this.toggleCash(true);
            this.toggleCard(false);
        } else {
            this.toggleCard(true);
            this.toggleCash(false);
        }

        this.onInputChange('payment', paymentType);
    };

    constructor(protected blockName: string, container: HTMLFormElement, events: IEvents) {
        super(container, events);

        this._card = container.elements.namedItem('card') as HTMLButtonElement | null;
        this._cash = container.elements.namedItem('cash') as HTMLButtonElement | null;

        if (this._cash && this._card) {
            this._cash.addEventListener('click', () => this.handlePaymentClick('cash'));
            this._card.addEventListener('click', () => this.handlePaymentClick('card'));
        }
    }

    disableButtons() {
        this.toggleCard(false);
        this.toggleCash(false);
    }
}

export class Contacts extends Form<IOrderFormContacts> {
    private _emailInput: HTMLInputElement | null = null;
    private _phoneInput: HTMLInputElement | null = null;

    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events)

        this._emailInput = container.elements.namedItem('email') as HTMLInputElement | null;
        this._phoneInput = container.elements.namedItem('phone') as HTMLInputElement | null;
    }

    setEmail(value: string) {
        if (this._emailInput) {
            this._emailInput.value = value;
            this.onInputChange('email', value);
        }
    }

    setPhone(value: string) {
        if (this._phoneInput) {
            this._phoneInput.value = value;
            this.onInputChange('phone', value);
        }
    }

    getEmail(): string | undefined {
        return this._emailInput?.value;
    }

    getPhone(): string | undefined {
        return this._phoneInput?.value;
    }
}