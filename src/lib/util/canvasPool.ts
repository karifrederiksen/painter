const reusableCanvases: HTMLCanvasElement[] = [];

export interface CanvasArgs {
  readonly width: number;
  readonly height: number;
}

export function getCanvas({ width, height }: CanvasArgs): HTMLCanvasElement {
  let canvas: HTMLCanvasElement | undefined = reusableCanvases.pop();
  if (canvas === undefined) {
    canvas = document.createElement("canvas");
  }
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

export function recycle(canvas: HTMLCanvasElement): void {
  reusableCanvases.push(canvas);
}
