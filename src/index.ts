import * as ReactDOM from "react-dom"
import { start } from "./ui"
import { frameStream } from "canvas/frameStream"

// Start
const rootElement = document.getElementById("canvas-root")

if (rootElement === null) {
    throw "canvas-root not found"
}

ReactDOM.render(start(frameStream), rootElement)

// HMR hooks
declare global {
    interface NodeModule {
        readonly hot?: {
            accept(): void
        }
    }
}

if (typeof module.hot === "object") {
    module.hot.accept()
}
