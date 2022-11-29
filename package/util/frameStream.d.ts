export interface FrameStream {
    (fn: (time: number) => void): CancelFrameStream;
}
export interface CancelFrameStream {
    (): void;
}
export declare const FrameStream: {
    make: (fn: (time: number) => void) => CancelFrameStream;
};
