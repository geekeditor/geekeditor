export interface EventEmitterInstance {
    on: (events: string | string[], handler: Function) => void;
    off: (events: string | string[], handler: Function) => void;
    trigger: (events: string, data: any) => void;
}

export default class CustomEventEmitter {
    protected _listeners!: { [key: string]: Function[] };
    constructor() {
        this._listeners = {}
    }

    private getListener(event: string) {
        return this._listeners[event] || (this._listeners[event] = [] as Function[])
    }

    on(events: string | string[], listener: Function) {
        if (typeof events === 'string') {
            events = events.trim().split(/\s+/);
        }

        for (const event of events) {
            this.getListener(event).push(listener);
        }
    }

    off(events: string | string[], listener: Function) {
        if (typeof events === 'string') {
            events = events.trim().split(/\s+/);
        }

        for (const event of events) {
            const listeners = this.getListener(event),
                index = listeners.findIndex((l) => l === listener);
            if (index !== -1) {
                listeners.splice(index, 1);
            }
        }
    }

    offAll(events: string | string[]) {
        if (typeof events === 'string') {
            events = events.trim().split(/\s+/);
        }

        for (const event of events) {
            this._listeners[event] = []
        }
    }

    trigger(events: string | string[], ...args: any[]) {
        if (typeof events === 'string') {
            events = events.trim().split(/\s+/);
        }

        for (const event of events) {
            const listeners = this.getListener(event);

            const tagrs = [...args];
            listeners.forEach((listener) => {
                listener.apply(this, tagrs);
            })
        }
    }

}