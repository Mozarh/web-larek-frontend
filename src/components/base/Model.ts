import { IEvents } from "./events";

/**
* Базовая модель, чтобы можно было отличить ее от простых объектов с данными
*/

export abstract class Model<T> {
    constructor(data: Partial<T>, protected events: IEvents) {
        Object.assign(this, data)
    }

    // Сообщить всем что модель поменялась
    emitChanges(event: string, payLoad?: object) {
        this.events.emit(event, payLoad ?? {});
    }
}