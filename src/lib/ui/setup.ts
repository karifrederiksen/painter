import type * as Canvas from "../canvas/index.js";
import type * as Input from "../canvas/input.js";
import * as Color from "color";
import { delay, ColorMode } from "../util/index.js";
import { rgbToHsluv } from "color";

export async function setup(
    canvas: HTMLCanvasElement,
    getState: () => Canvas.Config,
    sender: Canvas.Sender,
): Promise<void> {
    const forceRender = () => sender.onFrame(performance.now());

    const mkPt = (x: number, y: number, p: number): Input.PointerData => ({
        alt: false,
        ctrl: false,
        shift: false,
        time: performance.now(),
        pressure: p,
        x: x + canvas.offsetLeft,
        y: y + canvas.offsetTop,
    });

    const mkPts = (x: number, y: number, p: number): readonly Input.PointerData[] => [
        mkPt(x, y, p),
    ];

    sender.tool.camera.setRotation(0.125);
    sender.tool.camera.setOffset(150, 0);
    sender.tool.camera.setZoom(1);
    sender.tool.brush.setOpacity(0.6);
    sender.tool.brush.setColor(new Color.Hsluv(0, 100, 50));
    sender.tool.brush.setDiameter(100);
    forceRender();
    sender.onClick(mkPt(100, 100, 0.2));
    forceRender();
    sender.onDrag(mkPts(600, 700, 1.0));
    forceRender();
    sender.onRelease(mkPt(600, 700, 1.0));
    forceRender();
    sender.layer.setOpacity(getState().layers.current().id, 0.5);
    sender.layer.newLayer(getState().layers.current().id);
    forceRender();
    // sender.layer.setOpacity(getState().layers.current().id, 0.8);
    forceRender();
    sender.tool.brush.setColor(new Color.Hsluv(240, 40, 30));
    sender.onClick(mkPt(100, 700, 0.2));
    forceRender();
    sender.onDrag(mkPts(600, 100, 1.0));
    forceRender();
    await delay(30);
    sender.onRelease(mkPt(600, 100, 1.0));
    sender.tool.brush.setColorMode(ColorMode.Hsv);
    sender.tool.brush.setColor(rgbToHsluv(new Color.Rgb(0, 0, 1)));
    sender.tool.brush.setDiameter(200);
    forceRender();
    // sender.toggleHighlightRenderBlocks();
    // sender.tool.setTool(ToolType.Zoom)
    // forceRender()
}
