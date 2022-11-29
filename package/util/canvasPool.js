const reusableCanvases = [];
export function getCanvas({ width, height }) {
    let canvas = reusableCanvases.pop();
    if (canvas === undefined) {
        canvas = document.createElement("canvas");
    }
    canvas.width = width;
    canvas.height = height;
    return canvas;
}
export function recycle(canvas) {
    reusableCanvases.push(canvas);
}
