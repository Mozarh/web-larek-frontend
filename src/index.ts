import { AppState, ProductChangeEvent, ProductItem } from './components/AppData';
import { Api, ApiListResponse } from './components/base/api';
import { EventEmitter } from './components/base/events';
import { Basket, CatalogItemBasket } from './components/common/Basket';
import { CatalogItem, CatalogItemPreview } from './components/common/Card';
import { Modal } from './components/common/Modal';
import { Success } from './components/common/Success';
import { Contacts, Order } from './components/Order';
import { Page } from './components/Page';
import './scss/styles.scss';
import { ApiResponse, IOrderForm, IOrderFormContacts, IProduct } from './types';
import { API_URL } from './utils/constants';
import { cloneTemplate, ensureElement } from './utils/utils';

const events = new EventEmitter();
const api = new Api(API_URL);

events.onAll(({ eventName, data }) => {
    console.log(eventName, data);
})

//все шаблоны
const cardСatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

//модель данных приложения
const appData = new AppState({}, events)

//глобальные контейнеры
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

// Переиспользуемые части интерфейса
const basket = new Basket('basket', cloneTemplate(basketTemplate), events);
const order = new Order('order', cloneTemplate(orderTemplate), events);
const contacts = new Contacts(cloneTemplate(contactsTemplate), events);
const success = new Success('order-success', cloneTemplate(successTemplate), {
    onClick: () => {
        events.emit('modal:close');
        modal.close()
    }
})

// Дальше идет бизнес-логика
// Поймали событие, сделали что нужно

//изменились элементы каталога 
events.on<ProductChangeEvent>('items:changed', () => {
    page.catalog = appData.catalog.map(item => {
        const card = new CatalogItem(cloneTemplate(cardСatalogTemplate), {
            onClick: () => events.emit('card:select', item)
        });
        return card.render({
            id: item.id,
            title: item.title,
            image: item.image,
            category: item.category,
            price: item.price,
        });
    });
});

//открытие карточки продукта
events.on('card:select', (item: ProductItem) => {
    page.locked = true;
    const card = new CatalogItemPreview(cloneTemplate(cardPreviewTemplate), {
        onClick: () => {
            events.emit('card:addToBasket', item);
        }
    })
    modal.render({
        content: card.render({
            id: item.id,
            title: item.title,
            image: item.image,
            category: item.category,
            description: item.description,
            price: item.price,
            selected: item.selected
        })
    })
})

//открытие корзины 
events.on('basket:open', () => {
    page.locked = true
    const basketItems = appData.basket.map((item, index) => {
        const catalogItem = new CatalogItemBasket('card', cloneTemplate(cardBasketTemplate), {
            onClick: () => events.emit('basket:delete', item),
        });
        return catalogItem.render({
            title: item.title,
            price: item.price,
            index: index + 1,
        });
    });

    basket.list = basketItems;
    basket.price = appData.getTotal();
    page.counter = appData.getBasketAmount();

    modal.render({
        content: basket.render({
            items: basketItems,
            price: appData.getTotal(),
        }),
    });
})

//закрываем модальное окно
events.on('modal:close', () => {
    page.locked = false;
    appData.refreshOrder();
});

//добавляем товар в корзину
events.on('card:addToBasket', (item: ProductItem) => {
    item.selected = true;
    appData.addToBasket(item);
    page.counter = appData.getBasketAmount();
    modal.close();
})

//удаляем товар из корзины
events.on('basket:delete', (item: ProductItem) => {
    appData.deleteFromBasket(item.id);
    item.selected = false;

    basket.price = appData.getTotal();
    page.counter = appData.getBasketAmount();

    if (!appData.basket.length) {
        basket.disableButton();
    }

    basket.list = appData.basket.map((item, index) => {
        const catalogItem = new CatalogItemBasket('card', cloneTemplate(cardBasketTemplate), {
            onClick: () => events.emit('basket:delete', item),
        });
        return catalogItem.render({
            title: item.title,
            price: item.price,
            index: index + 1,
        });
    });
})

//оформить заказ    
events.on('basket:order', () => {
    modal.render({
        content: order.render({
            address: '',
            valid: false,
            errors: [],
        })
    })
});

//Изменилось состояние валидации способ оплаты, адрес доставки
events.on('orderFormErrors:change', (errors: Partial<IOrderForm>) => {
    const { payment, address } = errors;
    order.valid = !payment && !address;
    order.errors = Object.values({ payment, address }).filter(i => !!i).join('; ')
});

//Изменилось состояние валидации способ почты, телефона
events.on('contactsFormErrors:change', (errors: Partial<IOrderFormContacts>) => {
    const { email, phone } = errors;
    contacts.valid = !email && !phone;
    contacts.errors = Object.values({ email, phone }).filter(i => !!i).join('; ')
});

//Изменилось одно из полей
events.on('orderInput:change', (data: { field: keyof IOrderForm, value: string }) => {
    appData.setOrderField(data.field, data.value)
});

//заполнение полей
events.on('order:submit', () => {
    appData.order.total = appData.getTotal();
    appData.setItems();
    modal.render({
        content: contacts.render({
            valid: false,
            errors: []
        })
    })
})

//модалка после успешной покупки
events.on('order:success', (res: ApiListResponse<string>) => {
    modal.render({
        content: success.render({
            description: res.total
        })
    })
    appData.clearBasket();
    page.counter = 0;
})

//приобретение товаров
events.on('contacts:submit', () => {
    page.locked = true;
    api.post('/order', appData.order)
        .then((res) => {
            events.emit('order:success', res);
            appData.clearBasket();
            appData.refreshOrder();
            order.disableButtons();
            page.counter = 0;
            appData.resetSelected();
        })
        .catch((err) => {
            console.log(err)
            alert('Произошла ошибка при работе с сервером, пожалуйста, попробуйте позже.');
        })
        .finally(() => {
            page.locked = false;
        });
})

//получаем продуктыы с сервера
api
    .get('/product')
    .then((res: ApiResponse) => {
        appData.setCatalog(res.items as IProduct[])
    })
    .catch((err) => {
        console.error('ошибка при получении продуктов с сервера ', err)
        alert('Произошла ошибка при работе с сервером, пожалуйста, попробуйте позже.');
    });
