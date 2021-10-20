import { Op, _, statelessComponent, shallowEqual } from "ivi"
import { div } from "ivi-html"
import * as styles from "./miniMap.scss"
import { LabeledSlider } from "../components"
import * as Camera from "../../tools/camera"
import { clamp, stringToFloat } from "../../util"

function zoomToString(pct: number): string {
    return (pct * 100).toFixed(2)
}
function rotateToString(pct: number): string {
    return (pct * 360).toFixed(1)
}
function toFixed0(px: number): string {
    return px.toFixed(0)
}

export interface MiniMapDetailsProps {
    readonly camera: Camera.Config
    readonly sender: Camera.MsgSender
}

export const MiniMapDetails = statelessComponent<MiniMapDetailsProps>(({ camera, sender }) => {
    return div(styles.container, _, [
        LabeledSlider({
            label: "Zoom",
            valuePostfix: "%",
            value: camera.zoomPct,
            fromString: stringToFloat,
            toString: zoomToString,
            percentage: camera.zoomPct / 4,
            onChange: (pct) => {
                sender.setZoom(pct * 4)
            },
        }),
        LabeledSlider({
            label: "Rotate",
            valuePostfix: " deg",
            value: camera.rotateTurns,
            fromString: stringToFloat,
            toString: rotateToString,
            percentage: camera.rotateTurns,
            onChange: (pct) => {
                console.log(camera.rotateTurns, pct)
                sender.setRotation(pct)
            },
        }),
        LabeledSlider({
            label: "Offset X",
            valuePostfix: " px",
            value: camera.offsetX,
            fromString: stringToFloat,
            toString: toFixed0,
            percentage: clamp((camera.offsetX + 2500) / 5000, -5000, 5000),
            onChange: (pct) => {
                sender.setOffset(pct * 5000 - 2500, camera.offsetY)
            },
        }),
        LabeledSlider({
            label: "Offset Y",
            valuePostfix: " px",
            value: camera.offsetY,
            fromString: stringToFloat,
            toString: toFixed0,
            percentage: clamp((camera.offsetY + 2500) / 5000, -5000, 5000),
            onChange: (pct) => {
                sender.setOffset(camera.offsetX, pct * 5000 - 2500)
            },
        }),
    ])
}, shallowEqual)
