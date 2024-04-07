import CustomEventEmitter from "../utils/eventemitter";

declare class MonacoBridge implements CustomEventEmitter {
    on(types: string | string[], handler: Function): void;
    off(types: string | string[], handler: Function): void;
    trigger(types: string | string[], ...args: any[]): void;
    setContent(content: string): void;
    getContent(): string;
}