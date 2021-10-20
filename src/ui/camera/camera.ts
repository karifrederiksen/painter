import { _, shallowEqual, statelessComponent } from "ivi"
import { div } from "ivi-html"
import * as Camera from "../../tools/camera"

interface DetailsProps {
    readonly camera: Camera.Config
    readonly sender: Camera.MsgSender
}

export const Details = statelessComponent<DetailsProps>((props) => {
    return div(_, _, "Hello!")
}, shallowEqual)
