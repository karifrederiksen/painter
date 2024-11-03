export interface Config {
    readonly duration: number;
}
export declare const noDelay: Config;
export declare function delay(duration: number): Config;
export declare class Input {
    readonly x: number;
    readonly y: number;
    readonly pressure: number;
    constructor(x: number, y: number, pressure: number);
    lerp(pct: number, end: Input): Input;
}
export interface State {
    readonly startTime: number;
    readonly start: Input;
    readonly end: Input;
}
export declare function init(currentTime: number, start: Input): State;
export declare function updateWithInput(config: Config, state: State, currentTime: number, end: Input): [State, Input];
export declare function update(config: Config, state: State, currentTime: number): [State, Input];
