/**
 * EventBus — 简单的发布/订阅事件总线
 * 用于模块间解耦通信
 */
export class EventBus {
    constructor() {
        this._handlers = new Map();
    }

    on(event, handler) {
        if (!this._handlers.has(event)) {
            this._handlers.set(event, new Set());
        }
        this._handlers.get(event).add(handler);
        return () => this.off(event, handler);
    }

    off(event, handler) {
        const set = this._handlers.get(event);
        if (set) set.delete(handler);
    }

    emit(event, data) {
        const set = this._handlers.get(event);
        if (set) {
            set.forEach((h) => {
                try {
                    h(data);
                } catch (e) {
                    console.error(`EventBus handler error for "${event}":`, e);
                }
            });
        }
    }
}
