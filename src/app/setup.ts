import * as Canvas from "../canvas"
import * as Input from "../input"
import * as Color from "color"
import { delay } from "../util"

export async function setup(getState: () => Canvas.State, sender: Canvas.MsgSender): Promise<void> {
    const forceRender = () => sender.onFrame(performance.now())

    const mkPt = (x: number, y: number, p: number): Input.PointerInput => ({
        alt: false,
        ctrl: false,
        shift: false,
        time: performance.now(),
        pressure: p,
        x: x,
        y: y,
    })
    sender.tool.brush.setOpacity(0.6)
    sender.tool.brush.setColor(new Color.Hsluv(0, 100, 50))
    sender.tool.brush.setDiameter(100)
    sender.onFrame(performance.now())
    forceRender()
    sender.onClick(mkPt(100, 100, 0.2))
    forceRender()
    sender.onDrag(mkPt(600, 700, 1.0))
    forceRender()
    sender.onFrame(performance.now())
    forceRender()
    sender.onRelease(mkPt(600, 700, 1.0))
    forceRender()
    sender.layer.newLayer(getState().layers.current().id)
    forceRender()
    sender.layer.setOpacity(getState().layers.current().id, 0.5)
    forceRender()
    sender.tool.brush.setColor(new Color.Hsluv(240, 40, 30))
    sender.onClick(mkPt(100, 700, 0.2))
    forceRender()
    sender.onDrag(mkPt(600, 100, 1.0))
    forceRender()
    await delay(30)
    sender.onRelease(mkPt(600, 100, 1.0))
}
