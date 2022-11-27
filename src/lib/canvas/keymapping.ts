import type { Stack } from "../collections";

export interface ModifiersT {
    __nominal: "ModifiersT";
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function toNumber(x: ModifiersT): number {
    return x as any;
}
function fromNumber(x: number): ModifiersT {
    return x as any;
}
/* eslint-enable */

export const Modifiers = {
    None: fromNumber(0),
    create(shift: boolean, alt: boolean, ctrl: boolean): ModifiersT {
        let x = 0;

        if (shift) {
            x += 1;
        }
        if (alt) {
            x += 2;
        }
        if (ctrl) {
            x += 4;
        }

        return fromNumber(x);
    },
    hasModifiers(self: ModifiersT, other: ModifiersT): boolean {
        return (toNumber(self) & toNumber(other)) > 0;
    },
    hasShift(x: ModifiersT): boolean {
        return (toNumber(x) & 1) > 0;
    },
    hasAlt(x: ModifiersT): boolean {
        return (toNumber(x) & 2) > 0;
    },
    hasCtrl(x: ModifiersT): boolean {
        return (toNumber(x) & 4) > 0;
    },
    toString(x: ModifiersT): string {
        return toNumber(x).toString();
    },
    fromString(text: string): ModifiersT | null {
        const x = parseInt(text, 10);
        return isNaN(x) ? null : fromNumber(x);
    },
};

const ModifierKeyCodes = [/*Shift*/ 16, /*Ctrl*/ 17, /*Alt*/ 18, /*OS*/ 91] as const;

export interface KeyInput {
    readonly code: string;
    readonly modifiers: ModifiersT;
}

export interface CreateKeyArgs {
    readonly code: string;
    readonly shift?: boolean;
    readonly alt?: boolean;
    readonly ctrl?: boolean;
}

export const KeyInput = {
    toString(x: KeyInput): string {
        return Modifiers.toString(x.modifiers) + "|" + x.code;
    },
    createKey(args: CreateKeyArgs): string {
        return KeyInput.toString({
            code: args.code,
            modifiers: Modifiers.create(!!args.shift, !!args.alt, !!args.ctrl),
        });
    },
    fromString(text: string): KeyInput | null {
        const parts = text.split("|");
        if (parts.length !== 2) {
            return null;
        }
        const code = parts[1];

        const modifiers = Modifiers.fromString(parts[0]);
        if (modifiers === null) {
            return null;
        }
        return { code, modifiers };
    },
    fromKeyboardEvent(ev: KeyboardEvent): KeyInput {
        console.log(ev);
        return {
            code: ev.code,
            modifiers: Modifiers.create(ev.shiftKey, ev.altKey, ev.ctrlKey),
        };
    },
};

export interface KeyBinding<msg> {
    readonly msg: msg;
    readonly passive: boolean;
}

export interface KeyBindLayer<msg> {
    readonly [key: string]: KeyBinding<msg>;
}

export interface KeyBindingSystem<msg> {
    readonly layers: Stack.NonEmpty<KeyBindLayer<msg>>;
}

export function handleKeyCode<msg>(system: KeyBindingSystem<msg>, input: KeyInput): readonly msg[] {
    const key = KeyInput.toString(input);

    const msgs: msg[] = [];
    let layers: Stack.Stack<KeyBindLayer<msg>> = system.layers;
    while (layers.isNonEmpty()) {
        if (key in layers.head) {
            const binding = layers.head[key];
            msgs.push(binding.msg);
            if (!binding.passive) {
                break;
            }
        }
        layers = layers.tail;
    }
    return msgs;
}

export interface ListenArgs {
    handle(input: KeyInput): void;
}

export interface StopListening {
    (): void;
}

export function listen(args: ListenArgs): StopListening {
    function handle(ev: KeyboardEvent) {
        args.handle(KeyInput.fromKeyboardEvent(ev));
    }
    window.addEventListener("keydown", handle);
    return () => {
        window.removeEventListener("keydown", handle);
    };
}
