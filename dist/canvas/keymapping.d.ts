import type { Stack } from "../collections/index.js";
export interface ModifiersT {
    __nominal: "ModifiersT";
}
export declare const Modifiers: {
    None: ModifiersT;
    create(shift: boolean, alt: boolean, ctrl: boolean): ModifiersT;
    hasModifiers(self: ModifiersT, other: ModifiersT): boolean;
    hasShift(x: ModifiersT): boolean;
    hasAlt(x: ModifiersT): boolean;
    hasCtrl(x: ModifiersT): boolean;
    toString(x: ModifiersT): string;
    fromString(text: string): ModifiersT | null;
};
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
export declare const KeyInput: {
    toString(x: KeyInput): string;
    createKey(args: CreateKeyArgs): string;
    fromString(text: string): KeyInput | null;
    fromKeyboardEvent(ev: KeyboardEvent): KeyInput;
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
export declare function handleKeyCode<msg>(system: KeyBindingSystem<msg>, input: KeyInput): readonly msg[];
export interface ListenArgs {
    handle(input: KeyInput): void;
}
export interface StopListening {
    (): void;
}
export declare function listen(args: ListenArgs): StopListening;
