import { IProduct } from "../../types";
import { handlePrice } from "../../utils/utils";
import { Component } from "../base/Component";
import { EventEmitter } from "../base/events";

interface IBasketView {
    items: HTMLElement[];
    price: number;
}

export class Basket extends Component<IBasketView> {
    protected _items: HTMLElement;
    protected _price: HTMLElement;
    protected _button: HTMLButtonElement;

    constructor(protected blockName: string, container: HTMLElement, protected events: EventEmitter) {
        super(container);

        this._items = container.querySelector(`.${blockName}__list`);
        this._price = container.querySelector(`.${blockName}__price`);
        this._button = container.querySelector(`.${blockName}__button`);

        if (this._button) {
            this._button.addEventListener('click', () => {
                events.emit('basket:order');
            });
        }
    }

    set list(items: HTMLElement[]) {
        this._items.replaceChildren(...items);
        this._button.disabled = items.length ? false : true;
        this.refreshIndex();
    }

    set price(price: number) {
        this._price.textContent = handlePrice(price) + ' ' + 'синапсов'
    }

    disableButton() {
        this._button.disabled = true;
    }

    refreshIndex() {
        Array.from(this._items.children).forEach((item: HTMLElement, index: number) => {
            const indexElement = item.querySelector('.basket__item-index');
            if (indexElement) {
                indexElement.textContent = (index + 1).toString();
            }
        });
    }
}


export interface IProductBasketItem extends IProduct {
    id: string,
    index: number,
}

export interface ICatalogItemBasket {
    onClick: (event: MouseEvent) => void;
}

export class CatalogItemBasket extends Component<IProductBasketItem> {
    protected _index: HTMLElement;
    protected _title: HTMLElement;
    protected _price: HTMLElement;
    protected _buttonDelete: HTMLButtonElement;

    constructor(protected BlockName: string, container: HTMLElement, actions?: ICatalogItemBasket) {
        super(container);

        this._index = container.querySelector(`.basket__item-index`);
        this._title = container.querySelector(`.${BlockName}__title`);
        this._price = container.querySelector(`.${BlockName}__price`);
        this._buttonDelete = container.querySelector(`.${BlockName}__button`);

        if (!this._title || !this._index || !this._price || !this._buttonDelete) {
            console.error("Не все элементы компонента StoreItemBasket найдены.");
        }

        if (this._buttonDelete) {
            this._buttonDelete.addEventListener('click', (evt) => {
                actions?.onClick(evt);
                this.container.remove();
            })
        }
    }

    set title(value: string) {
        this._title.textContent = value
    }

    set index(value: number) {
        this._index.textContent = value.toString()
    }

    set price(value: number) {
        this._price.textContent = handlePrice(value) + ' ' + 'cинапсов'
    }
}