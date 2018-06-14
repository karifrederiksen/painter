import { render } from "inferno"
import { start } from "./ui"
import { defaultState } from "./canvas"
import { frameStream } from "./frameStream"

render(start(defaultState(), frameStream), document.getElementById("canvas-root"))
