import { ProductCategory } from "../../types";
import { CDN_URL, comparisonCategory } from "../../utils/constants";
import { ensureElement, handlePrice } from "../../utils/utils";
import { Component } from "../base/Component";

export interface ICardActions {
    onClick: (event: MouseEvent) => void;
}

export interface ICard {
    title: string;
    description: string;
    id: string;
    image: string;
    price: number | null;
    category: string;
    selected: boolean;
}

export class Card extends Component<ICard> {
    protected _category: HTMLElement;
    protected _title: HTMLElement;
    protected _image: HTMLImageElement;
    protected _price: HTMLElement
    protected _button: HTMLButtonElement;

    constructor(protected BlockName: string, container: HTMLElement, actions?: ICardActions) {
        super(container);

        this._title = ensureElement<HTMLElement>(`.${BlockName}__title`, container);
        this._image = ensureElement<HTMLImageElement>(`.${BlockName}__image`, container);

        this._category = container.querySelector(`.${BlockName}__category`);
        this._price = container.querySelector(`.${BlockName}__price`);
        this._button = container.querySelector(`.${BlockName}__button`);

        if (actions?.onClick) {
            if (this._button) {
                this._button.addEventListener('click', actions.onClick);
            } else {
                container.addEventListener('click', actions.onClick);
            }
        }
    }

    set id(value: string) {
        this.container.dataset.id = value;
    }

    get id() {
        return this.container.dataset.id || ''
    }

    set title(value: string) {
        this.setText(this._title, value)
    }

    get title() {
        return this._title.textContent || ''
    }

    set image(value: string) {
        this._image.src = CDN_URL + value;
    }

    set selected(value: boolean) {
        if (!this._button.disabled) {
            this._button.disabled = value;
        }
    }

    set price(value: number | null) {
        this._price.textContent = value
            ? handlePrice(value) + ' ' + 'cинапсов'
            : 'Бесценно';
        if (this._button && !value) {
            this._button.disabled = true
        }
    }

    set category(value: ProductCategory) {
        this._category.textContent = value;
        this._category.classList.add(comparisonCategory[value])
    }
}

export class CatalogItem extends Card {
    constructor(container: HTMLElement, actions?: ICardActions) {
        super('card', container, actions)
    }
}


export class CatalogItemPreview extends Card {
    protected _description: HTMLElement;

    constructor(container: HTMLElement, actions?: ICardActions) {
        super('card', container, actions);

        this._description = container.querySelector(`.${this.BlockName}__text`)
    }

    set description(value: string) {
        this._description.textContent = value
    }
}