export interface CanvasArgs {
    readonly width: number;
    readonly height: number;
}
export declare function getCanvas({ width, height }: CanvasArgs): HTMLCanvasElement;
export declare function recycle(canvas: HTMLCanvasElement): void;
