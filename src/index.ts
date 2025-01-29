import { AppState, ProductChangeEvent, ProductItem } from './components/AppData';
import { Api, ApiListResponse } from './components/base/api';
import { EventEmitter } from './components/base/events';
import { Basket, CatalogItemBasket } from './components/Basket';
import { CatalogItem, CatalogItemPreview } from './components/Card';
import { Modal } from './components/common/Modal';
import { Success } from './components/Success';
import { Contacts, Order } from './components/Order';
import { Page } from './components/Page';
import './scss/styles.scss';
import { ApiResponse, IOrderForm, IOrderFormContacts, IProduct } from './types';
import { API_URL } from './utils/constants';
import { cloneTemplate, ensureElement } from './utils/utils';
import { AppEvents } from './types/enum';
import { ApiService } from './components/common/ApiLarek';

const events = new EventEmitter();
const api = new Api(API_URL);
const apiService = new ApiService(API_URL)

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
        modal._toggleModal(false);
    }
})

// Дальше идет бизнес-логика
// Поймали событие, сделали что нужно

//изменились элементы каталога 
events.on<ProductChangeEvent>(AppEvents.ItemsChanged, () => {
    page.catalog = appData.catalog.map(item => {
        const card = new CatalogItem(cloneTemplate(cardСatalogTemplate), {
            onClick: () => events.emit(AppEvents.CardSelect, item)
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
events.on(AppEvents.CardSelect, (item: ProductItem) => {
    page.locked = true;
    const card = new CatalogItemPreview(cloneTemplate(cardPreviewTemplate), {
        onClick: () => {
            events.emit(AppEvents.CardAddToBasket, item);
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
    document.addEventListener('keydown', modal._handleEscape);
})

//открытие корзины 
events.on(AppEvents.BasketOpen, () => {
    page.locked = true
    const basketItems = appData.basket.map((item, index) => {
        const catalogItem = new CatalogItemBasket('card', cloneTemplate(cardBasketTemplate), {
            onClick: () => events.emit(AppEvents.BasketDelete, item),
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
    modal._toggleModal(true);
})

//закрываем модальное окно
events.on(AppEvents.ModalClose, () => {
    page.locked = false;
    appData.refreshOrder();
    modal._toggleModal(false);
    document.removeEventListener('keydown', modal._handleEscape);
});

//добавляем товар в корзину
events.on(AppEvents.CardAddToBasket, (item: ProductItem) => {
    item.selected = true;
    appData.addToBasket(item);
    page.counter = appData.getBasketAmount();
    modal._toggleModal(false);
})

//удаляем товар из корзины
events.on(AppEvents.BasketDelete, (item: ProductItem) => {
    appData.deleteFromBasket(item.id);
    item.selected = false;

    basket.price = appData.getTotal();
    page.counter = appData.getBasketAmount();

    if (!appData.basket.length) {
        basket.disableButton();
    }

    basket.list = appData.basket.map((item, index) => {
        const catalogItem = new CatalogItemBasket('card', cloneTemplate(cardBasketTemplate), {
            onClick: () => events.emit(AppEvents.BasketDelete, item),
        });
        return catalogItem.render({
            title: item.title,
            price: item.price,
            index: index + 1,
        });
    });
})

//оформить заказ    
events.on(AppEvents.BasketOrder, () => {
    modal.render({
        content: order.render({
            address: '',
            valid: false,
            errors: [],
        })
    })
});

//Изменилось состояние валидации способ оплаты, адрес доставки
events.on(AppEvents.OrderFormErrorsChange, (errors: Partial<IOrderForm>) => {
    const { payment, address } = errors;
    order.valid = !payment && !address;
    order.errors = Object.values({ payment, address }).filter(i => !!i).join('; ')
});

//Изменилось состояние валидации способ почты, телефона
events.on(AppEvents.ContactsFormErrorsChange, (errors: Partial<IOrderFormContacts>) => {
    const { email, phone } = errors;
    contacts.valid = !email && !phone;
    contacts.errors = Object.values({ email, phone }).filter(i => !!i).join('; ')
});

//Изменилось одно из полей
events.on(AppEvents.OrderInputChange, (data: { field: keyof IOrderForm, value: string }) => {
    appData.setOrderField(data.field, data.value)
});

//заполнение полей
events.on(AppEvents.OrderSubmit, () => {
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
events.on(AppEvents.OrderSuccess, (res: ApiListResponse<string>) => {
    modal.render({
        content: success.render({
            description: res.total
        })
    })
    appData.clearBasket();
    page.counter = 0;
})

//приобретение товаров
events.on(AppEvents.ContactsSubmit, () => {
    page.locked = true;
    apiService.sendOrder(appData.order)
        .then((res) => {
            events.emit(AppEvents.OrderSuccess, res);
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
apiService.getProducts()
    .then((res: ApiResponse) => {
        appData.setCatalog(res.items as IProduct[])
    })
    .catch((err) => {
        console.error('ошибка при получении продуктов с сервера ', err)
        alert('Произошла ошибка при работе с сервером, пожалуйста, попробуйте позже.');
    });







