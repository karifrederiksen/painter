import { Op, _, statelessComponent, shallowEqual } from "ivi"
import { div } from "ivi-html"
import * as styles from "./miniMap.scss"
import { Labeled, InlineLabeled, Slider } from "./views"
import * as Camera from "../tools/camera"
import { clamp } from "../util"

export interface MiniMapDetailsProps {
    readonly camera: Camera.State
    readonly sender: Camera.MsgSender
}

export const MiniMapDetails = statelessComponent<MiniMapDetailsProps>(({ camera, sender }) => {
    return div(styles.container, _, [
        Labeled({
            label: "Zoom",
            value: (camera.zoomPct * 100).toFixed(1) + "%",
            children: Slider({
                percentage: camera.zoomPct / 4,
                onChange: pct => {
                    sender.setZoom(pct * 4)
                },
            }),
        }),
        Labeled({
            label: "Rotate",
            value: (camera.rotateTurns * 360).toFixed(1) + " deg",
            children: Slider({
                percentage: camera.rotateTurns,
                onChange: pct => {
                    console.log(camera.rotateTurns, pct)
                    sender.setRotation(pct)
                },
            }),
        }),
        Labeled({
            label: "Offset X",
            value: camera.offsetX.toFixed(0) + " px",
            children: Slider({
                percentage: clamp(-5000, 5000, (camera.offsetX + 2500) / 5000),
                onChange: pct => {
                    sender.setOffset(pct * 5000 - 2500, camera.offsetY)
                },
            }),
        }),
        Labeled({
            label: "Offset Y",
            value: camera.offsetY.toFixed(0) + " px",
            children: Slider({
                percentage: clamp(-5000, 5000, (camera.offsetY + 2500) / 5000),
                onChange: pct => {
                    sender.setOffset(camera.offsetX, pct * 5000 - 2500)
                },
            }),
        }),
    ])
}, shallowEqual)
