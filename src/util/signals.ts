export interface Subscription<a> {
    initialValue: a
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
    subscribe(handler: ChangeHandler<a>): Subscription<a>
}

export interface PushableSignal<a> extends Signal<a> {
    readonly signal: Signal<a>

    push(value: a): void
}

export function on<k extends keyof HTMLElementEventMap>(
    element: HTMLElement,
    type: k,
    passive: boolean
): Subscription<Signal<HTMLElementEventMap[k] | null>>
export function on<k extends keyof HTMLElementEventMap, a>(
    element: HTMLElement,
    type: k,
    passive: boolean,
    initialValue: a,
    map: (e: HTMLElementEventMap[k]) => a
): Subscription<Signal<a>>
export function on<k extends keyof HTMLElementEventMap, a>(
    element: HTMLElement,
    type: k,
    passive: boolean,
    initialValue?: a | undefined,
    map?: ((e: HTMLElementEventMap[k]) => a) | undefined
): Subscription<Signal<a>> {
    const signal = new SignalWithPush<any>(initialValue ?? null)

    const mappedHandler =
        map == null
            ? (e: HTMLElementEventMap[k]) => {
                  signal.push(e)
              }
            : (e: HTMLElementEventMap[k]) => {
                  signal.push(map(e))
              }
    element.addEventListener(type, mappedHandler, passive ? { passive: true } : undefined)
    return {
        initialValue: signal,
        dispose() {
            element.removeEventListener(type, mappedHandler)
        },
    }
}

export function create<a>(initialValue: a): PushableSignal<a> {
    return new SignalWithPush(initialValue)
}

class SignalWithPush<a> implements PushableSignal<a> {
    private handler: ChangeHandler<a> | null = null
    private currentValue: a

    /**
     * Immutable, broadcastable, wrapper for the pushable signal.
     */
    readonly signal: Signal<a>

    constructor(initialValue: a) {
        this.currentValue = initialValue
        this.signal = new SignalBroadcast(this)
    }

    pipe<b>(f: SignalPipe<a, b>): Signal<b> {
        return f(this)
    }

    push(value: a): void {
        this.currentValue = value
        this.handler?.(value)
    }

    subscribe(handler: ChangeHandler<a>): Subscription<a> {
        const { currentValue } = this
        if (this.handler != null) {
            throw new Error("Handler already exists")
        }
        this.handler = handler
        return {
            initialValue: currentValue,
            dispose: () => {
                if (this.handler == null) {
                    throw new Error("Handler does not exist")
                }
                this.handler = null
            },
        }
    }
}

// Caches the results of the underlying stream, allowing multiple subscribers without creating multiple
// subscriptions on the underlying signal.
// The subscription to the underlying signal is disposed when there is no active subscription. It is reestablished
// when there are subscribers again.
export function broadcast<a>(): SignalPipe<a, a> {
    return (signal) => new SignalBroadcast(signal)
}

class SignalBroadcast<a> implements Signal<a> {
    private readonly handlers: ChangeHandler<a>[] = []
    private sourceSub: Subscription<a> | null = null
    private currentValue: a | null = null
    constructor(private readonly source: Signal<a>) {}

    pipe<b>(f: SignalPipe<a, b>): Signal<b> {
        return f(this)
    }

    subscribe(handler: ChangeHandler<a>): Subscription<a> {
        const { handlers } = this
        if (this.sourceSub == null) {
            this.sourceSub = this.source.subscribe((nextVal) => {
                this.currentValue = nextVal
            })
            this.currentValue = this.sourceSub.initialValue
        }
        handlers.push(handler)
        return {
            initialValue: this.currentValue!,
            dispose: () => {
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
                if (handlers.length === 0) {
                    this.sourceSub?.dispose()
                    this.sourceSub = null
                    this.currentValue = null
                }
            },
        }
    }
}

export function map<a, b>(transform: (value: a) => b): SignalPipe<a, b> {
    return (signal) => new SignalMap(signal, transform)
}

class SignalMap<a, b> implements Signal<b> {
    constructor(private readonly source: Signal<a>, private readonly transform: (val: a) => b) {}

    pipe<c>(f: SignalPipe<b, c>): Signal<c> {
        return f(this)
    }

    subscribe(handler: ChangeHandler<b>): Subscription<b> {
        const { source, transform } = this
        const mappedHandler = (val: a) => {
            handler(transform(val))
        }
        const sub = source.subscribe(mappedHandler)
        return {
            initialValue: transform(sub.initialValue),
            dispose: sub.dispose,
        }
    }
}

export function filter<a>(defaultValue: a, filter: (value: a) => boolean): SignalPipe<a, a> {
    return (signal) => new SignalFilter(signal, filter, defaultValue)
}

class SignalFilter<a> implements Signal<a> {
    constructor(
        private readonly source: Signal<a>,
        private readonly filter: (val: a) => boolean,
        private readonly defaultValue: a
    ) {
        this.filter = filter
    }

    pipe<b>(f: SignalPipe<a, b>): Signal<b> {
        return f(this)
    }

    subscribe(handler: ChangeHandler<a>): Subscription<a> {
        const { filter, source, defaultValue } = this

        const filteredHandler = (val: a) => {
            if (filter(val)) {
                handler(val)
            }
        }
        const sub = source.subscribe(filteredHandler)
        return {
            initialValue: filter(sub.initialValue) ? sub.initialValue : defaultValue,
            dispose: sub.dispose,
        }
    }
}

export function flatMap<a, b>(transform: (value: a) => Signal<b>): SignalPipe<a, b> {
    return (signal) => new SignalFlatMap(signal, transform)
}

class SignalFlatMap<a, b> implements Signal<b> {
    constructor(
        private readonly sourceSignal: Signal<a>,
        private readonly transform: (val: a) => Signal<b>
    ) {}

    pipe<c>(f: SignalPipe<b, c>): Signal<c> {
        return f(this)
    }

    subscribe(f: ChangeHandler<b>): Subscription<b> {
        const { sourceSignal, transform } = this

        let nextSub: Subscription<b>
        const sourceSub = sourceSignal.subscribe((nextSourceValue) => {
            const oldSub = nextSub
            nextSub = transform(nextSourceValue).subscribe(f)
            // we dispose after creating a new subscription because broadcast signals
            // unsubscribe from their sources when they have 0 active subscriptions.
            oldSub.dispose()
        })
        nextSub = transform(sourceSub.initialValue).subscribe(f)

        return {
            initialValue: nextSub.initialValue,
            dispose() {
                nextSub.dispose()
                sourceSub.dispose()
            },
        }
    }
}

export function reducing<a, b>(
    initial: (v: a) => b,
    reduce: (cur: b, next: a) => b
): SignalPipe<a, b> {
    return (signal) => new Reducing(signal, initial, reduce)
}

class Reducing<a, b> implements Signal<b> {
    constructor(
        private readonly source: Signal<a>,
        private readonly initial: (v: a) => b,
        private readonly reduce: (curr: b, next: a) => b
    ) {}
    pipe<c>(f: SignalPipe<b, c>): Signal<c> {
        return f(this)
    }
    subscribe(handler: ChangeHandler<b>): Subscription<b> {
        let curVal: b
        const sub = this.source.subscribe((sourceVal) => {
            let nextVal = this.reduce(curVal, sourceVal)
            curVal = nextVal
            handler(nextVal)
        })
        curVal = this.initial(sub.initialValue)
        return {
            initialValue: curVal,
            dispose: sub.dispose,
        }
    }
}

export function combine<a>(signals: SignalRecord<a>): Signal<a> {
    return new SignalCombine(signals)
}

export type SignalRecord<a> = { readonly [x in keyof a]: Signal<a[x]> }

class SignalCombine<a> implements Signal<a> {
    constructor(private readonly sources: SignalRecord<a>) {}

    pipe<b>(f: SignalPipe<a, b>): Signal<b> {
        return f(this)
    }

    subscribe(handler: ChangeHandler<a>): Subscription<a> {
        const { sources } = this
        const subs: Subscription<a[keyof a]>[] = []
        let currentValue: any = {}

        for (const key in sources) {
            const sub = sources[key].subscribe((val) => {
                const nextValue = { ...currentValue, [key]: val }
                currentValue = nextValue
                handler(nextValue)
            })
            currentValue[key] = sub.initialValue
            subs.push(sub)
        }

        return {
            initialValue: currentValue,
            dispose() {
                for (let i = 0; i < subs.length; i++) {
                    subs[i].dispose()
                }
                subs.length = 0
            },
        }
    }
}
