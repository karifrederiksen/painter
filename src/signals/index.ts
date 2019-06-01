export interface CancelSubscribtion {
    dispose(): void
}

export interface ChangeHandler<a> {
    (value: a): void
}

export interface Signal<a> {
    value(): a
    subscribe(handler: ChangeHandler<a>): CancelSubscribtion
}

export interface PushableSignal<a> extends Signal<a> {
    readonly signal: Signal<a>

    push(value: a): void
}

export function create<a>(initialValue: a): PushableSignal<a> {
    return new SignalWithPush(initialValue)
}

export function map<a, b>(signal: Signal<a>, transform: (value: a) => b): Signal<b> {
    return new SignalTransform(signal, transform)
}

export function filter<a>(
    signal: Signal<a>,
    defaultValue: a,
    filter: (value: a) => boolean
): Signal<a> {
    return new SignalFilter(signal, defaultValue, filter)
}

class SignalWithPush<a> implements PushableSignal<a> {
    private handlers: ChangeHandler<a>[] = []
    private currentValue: a

    /**
     * Immutable wrapper for the pushable signal.
     */
    readonly signal: Signal<a>

    constructor(initialValue: a) {
        this.currentValue = initialValue
        this.signal = new SignalWrapper(this)
    }

    push(value: a): void {
        this.currentValue = value

        const handlers = this.handlers
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](value)
        }
    }

    value(): a {
        return this.currentValue
    }

    subscribe(handler: ChangeHandler<a>): CancelSubscribtion {
        this.handlers.push(handler)
        return {
            dispose: () => {
                removeHandler(this.handlers, handler)
            },
        }
    }
}

function removeHandler<a>(handlers: ChangeHandler<a>[], handler: ChangeHandler<a>): void {
    let idx = -1
    for (let i = 0; i < handlers.length; i++) {
        if (handlers[i] === handler) {
            idx = i
            break
        }
    }
    if (idx !== -1) {
        handlers.splice(idx, 1)
    }
}

class SignalWrapper<a> implements Signal<a> {
    constructor(readonly baseSignal: Signal<a>) {}

    value(): a {
        return this.baseSignal.value()
    }

    subscribe(handler: ChangeHandler<a>) {
        return this.baseSignal.subscribe(handler)
    }
}

class SignalTransform<a, b> implements Signal<b> {
    constructor(readonly baseSignal: Signal<a>, readonly transform: (val: a) => b) {}

    value(): b {
        return this.transform(this.baseSignal.value())
    }

    subscribe(handler: ChangeHandler<b>) {
        const transformedHandler = (val: a) => {
            handler(this.transform(val))
        }

        return this.baseSignal.subscribe(transformedHandler)
    }
}

class SignalFilter<a> implements Signal<a> {
    readonly baseSignal: Signal<a>
    private currentValue: a
    readonly filter: (val: a) => boolean
    constructor(baseSignal: Signal<a>, defaultValue: a, filter: (val: a) => boolean) {
        this.baseSignal = baseSignal
        this.filter = filter
        const baseValue = baseSignal.value()
        this.currentValue = filter(baseValue) ? baseValue : defaultValue
    }

    value(): a {
        return this.currentValue
    }

    subscribe(handler: ChangeHandler<a>) {
        const filter = this.filter

        const filteredHandler = (val: a) => {
            if (filter(val)) {
                this.currentValue = val
                handler(val)
            }
        }

        return this.baseSignal.subscribe(filteredHandler)
    }
}
