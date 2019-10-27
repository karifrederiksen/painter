import { Stack } from "../collections"

export namespace Modifiers {
    export declare class T {
        private nominal: void
    }

    /* eslint-disable @typescript-eslint/no-explicit-any */
    function toNumber(x: T): number {
        return x as any
    }
    function fromNumber(x: number): T {
        return x as any
    }
    /* eslint-enable */

    export const None = fromNumber(0)

    export function create(shift: boolean, alt: boolean, ctrl: boolean): T {
        let x = 0

        if (shift) {
            x += 1
        }
        if (alt) {
            x += 2
        }
        if (ctrl) {
            x += 4
        }

        return fromNumber(x)
    }

    export function hasModifiers(self: T, other: T): boolean {
        return (toNumber(self) & toNumber(other)) > 0
    }

    export function hasShift(x: T): boolean {
        return (toNumber(x) & 1) > 0
    }

    export function hasAlt(x: T): boolean {
        return (toNumber(x) & 2) > 0
    }

    export function hasCtrl(x: T): boolean {
        return (toNumber(x) & 4) > 0
    }

    export function toString(x: T): string {
        return toNumber(x).toString()
    }

    export function fromString(text: string): T | null {
        const x = parseInt(text, 10)
        return isNaN(x) ? null : fromNumber(x)
    }
}

const ModifierKeyCodes = [/*Shift*/ 16, /*Ctrl*/ 17, /*Alt*/ 18, /*OS*/ 91] as const

export interface KeyInput {
    readonly code: string
    readonly modifiers: Modifiers.T
}

export namespace KeyInput {
    export function toString(x: KeyInput): string {
        return Modifiers.toString(x.modifiers) + "|" + x.code
    }

    export interface CreateKeyArgs {
        readonly code: string
        readonly shift?: boolean
        readonly alt?: boolean
        readonly ctrl?: boolean
    }

    export function createKey(args: CreateKeyArgs): string {
        return toString({
            code: args.code,
            modifiers: Modifiers.create(!!args.shift, !!args.alt, !!args.ctrl),
        })
    }

    export function fromString(text: string): KeyInput | null {
        const parts = text.split("|")
        if (parts.length !== 2) {
            return null
        }
        const code = parts[1]

        const modifiers = Modifiers.fromString(parts[0])
        if (modifiers === null) {
            return null
        }
        return { code, modifiers }
    }

    export function fromKeyboardEvent(ev: KeyboardEvent): KeyInput {
        console.log(ev)
        return {
            code: ev.code,
            modifiers: Modifiers.create(ev.shiftKey, ev.altKey, ev.ctrlKey),
        }
    }
}

export interface KeyBinding<msg> {
    readonly msg: msg
    readonly passive: boolean
}

export interface KeyBindLayer<msg> {
    readonly [key: string]: KeyBinding<msg>
}

export interface KeyBindingSystem<msg> {
    readonly layers: Stack.NonEmpty<KeyBindLayer<msg>>
}

export function handleKeyCode<msg>(system: KeyBindingSystem<msg>, input: KeyInput): readonly msg[] {
    const key = KeyInput.toString(input)

    let msgs: msg[] = []
    let layers: Stack.Stack<KeyBindLayer<msg>> = system.layers
    while (layers.isNonEmpty()) {
        if (key in layers.head) {
            const binding = layers.head[key]
            if (typeof binding !== undefined) {
            }
            msgs.push(binding.msg)
            if (!binding.passive) {
                break
            }
        }
        layers = layers.tail
    }
    return msgs
}

export interface ListenArgs {
    handle(input: KeyInput): void
}

export interface StopListening {
    (): void
}

export function listen(args: ListenArgs): StopListening {
    function handle(ev: KeyboardEvent) {
        args.handle(KeyInput.fromKeyboardEvent(ev))
    }
    window.addEventListener("keydown", handle)
    return () => {
        window.removeEventListener("keydown", handle)
    }
}
