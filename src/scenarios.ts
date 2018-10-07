import * as Canvas from "./canvas"
import * as Input from "./input"
import { Hsluv } from "./color"

export async function setup(
    getState: () => Canvas.State,
    sender: Canvas.MsgSender,
    afterUpdate: () => Promise<void>
): Promise<void> {
    await multipleLayers(getState, sender, afterUpdate)
}

async function multipleLayers(
    getState: () => Canvas.State,
    sender: Canvas.MsgSender,
    afterUpdate: () => Promise<void>
) {
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
    sender.tool.brush.setColor(new Hsluv(0, 100, 50))
    sender.tool.brush.setDiameter(100)
    await afterUpdate()
    sender.onClick(mkPt(100, 100, 0.2))
    await afterUpdate()
    sender.onDrag(mkPt(600, 700, 1.0))
    await afterUpdate()
    sender.onFrame(performance.now())
    await afterUpdate()
    sender.onRelease(mkPt(600, 700, 1.0))
    await afterUpdate()
    sender.layer.newLayer(getState().layers.current().id)
    await afterUpdate()
    sender.layer.setOpacity(getState().layers.current().id, 0.5)
    await afterUpdate()
    sender.tool.brush.setColor(new Hsluv(240, 40, 30))
    sender.onClick(mkPt(100, 700, 0.2))
    await afterUpdate()
    sender.onDrag(mkPt(600, 100, 1.0))
}
