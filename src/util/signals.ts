export interface Subscription {
    dispose(): void
}

export interface ChangeHandler<a> {
    (value: a): void
}

export interface SignalPipe<a, b> {
    (x: Signal<a>): Signal<b>
}

export interface Signal<a> {
    pipe<b>(f: SignalPipe<a, b>): Signal<b>
    value(): a
    subscribe(handler: ChangeHandler<a>): Subscription
}

export interface PushableSignal<a> extends Signal<a> {
    readonly signal: Signal<a>

    push(value: a): void
}

export function create<a>(initialValue: a): PushableSignal<a> {
    return new SignalWithPush(initialValue)
}

class SignalWithPush<a> implements PushableSignal<a> {
    private readonly handlers: ChangeHandler<a>[] = []
    private currentValue: a

    /**
     * Immutable wrapper for the pushable signal.
     */
    readonly signal: Signal<a>

    constructor(initialValue: a) {
        this.currentValue = initialValue
        this.signal = new SignalWrapper(this)
    }

    pipe<b>(f: SignalPipe<a, b>): Signal<b> {
        return f(this)
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

    subscribe(handler: ChangeHandler<a>): Subscription {
        const handlers = this.handlers
        handlers.push(handler)
        return {
            dispose() {
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
            },
        }
    }
}

class SignalWrapper<a> implements Signal<a> {
    constructor(private readonly baseSignal: Signal<a>) {}

    pipe<b>(f: SignalPipe<a, b>): Signal<b> {
        return f(this)
    }

    value(): a {
        return this.baseSignal.value()
    }

    subscribe(handler: ChangeHandler<a>) {
        return this.baseSignal.subscribe(handler)
    }
}

export function map<a, b>(transform: (value: a) => b): SignalPipe<a, b> {
    return (signal) => new SignalMap(signal, transform)
}

class SignalMap<a, b> implements Signal<b> {
    constructor(
        private readonly baseSignal: Signal<a>,
        private readonly transform: (val: a) => b
    ) {}

    pipe<c>(f: SignalPipe<b, c>): Signal<c> {
        return f(this)
    }

    value(): b {
        return this.transform(this.baseSignal.value())
    }

    subscribe(handler: ChangeHandler<b>) {
        const mappedHandler = (val: a) => {
            handler(this.transform(val))
        }

        return this.baseSignal.subscribe(mappedHandler)
    }
}

export function filter<a>(defaultValue: a, filter: (value: a) => boolean): SignalPipe<a, a> {
    return (signal) => new SignalFilter(signal, filter, defaultValue)
}

class SignalFilter<a> implements Signal<a> {
    private currentValue: a
    constructor(
        private readonly baseSignal: Signal<a>,
        private readonly filter: (val: a) => boolean,
        defaultValue: a
    ) {
        this.filter = filter
        const baseValue = baseSignal.value()
        this.currentValue = filter(baseValue) ? baseValue : defaultValue
    }

    pipe<b>(f: SignalPipe<a, b>): Signal<b> {
        return f(this)
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

export function flatMap<a, b>(transform: (value: a) => Signal<b>): SignalPipe<a, b> {
    return (signal) => new SignalFlatMap(signal, transform)
}

class SignalFlatMap<a, b> implements Signal<b> {
    private currentValue: Signal<b>
    constructor(
        private readonly baseSignal: Signal<a>,
        private readonly transform: (val: a) => Signal<b>
    ) {
        this.currentValue = transform(baseSignal.value())
    }

    pipe<c>(f: SignalPipe<b, c>): Signal<c> {
        return f(this)
    }

    value(): b {
        return this.currentValue.value()
    }

    subscribe(handler: ChangeHandler<b>) {
        let sub: Subscription | undefined = undefined
        const flatMappedHandler = (val: a) => {
            const nextValue = this.transform(val)
            if (nextValue != this.currentValue) {
                sub?.dispose()
                sub = nextValue.subscribe(handler)
                this.currentValue = nextValue
            }
        }

        return this.baseSignal.subscribe(flatMappedHandler)
    }
}

export function combine<a>(signals: SignalRecord<a>): Signal<a> {
    return new SignalCombine(signals)
}

export type SignalRecord<a> = { readonly [x in keyof a]: Signal<a[x]> }

class SignalCombine<a> implements Signal<a> {
    private currentValue: a
    constructor(private readonly signals: SignalRecord<a>) {
        const val: any = {}
        for (const key in signals) {
            val[key] = signals[key].value()
        }
        this.currentValue = val
    }

    pipe<b>(f: SignalPipe<a, b>): Signal<b> {
        return f(this)
    }

    value(): a {
        return this.currentValue
    }

    subscribe(handler: ChangeHandler<a>): Subscription {
        const signals = this.signals
        const subs: Subscription[] = []

        for (const key in signals) {
            const sub = signals[key].subscribe((val) => {
                const nextValue = { ...this.currentValue, [key]: val }
                this.currentValue = nextValue
                handler(nextValue)
            })
            subs.push(sub)
        }

        return {
            dispose() {
                for (let i = 0; i < subs.length; i++) {
                    subs[i].dispose()
                }
                subs.length = 0
            },
        }
    }
}
