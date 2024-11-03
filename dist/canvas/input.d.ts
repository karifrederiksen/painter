export interface Unsubscribe {
    (): void;
}
export interface Observable<a> {
    subscribe(f: (val: a) => void): Unsubscribe;
}
export interface PointerData {
    readonly x: number;
    readonly y: number;
    readonly pressure: number;
    readonly shift: boolean;
    readonly alt: boolean;
    readonly ctrl: boolean;
    readonly time: number;
}
export interface Observables {
    readonly click: Observable<PointerData>;
    readonly move: Observable<readonly PointerData[]>;
    readonly drag: Observable<readonly PointerData[]>;
    readonly release: Observable<PointerData>;
}
export declare function listen(canvas: HTMLCanvasElement): Observables;
