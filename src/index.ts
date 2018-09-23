import * as ReactDOM from "react-dom"
import { start } from "./ui"

// Start
const rootElement = document.getElementById("canvas-root")

if (rootElement === null) {
    throw "canvas-root not found"
}

ReactDOM.render(start(), rootElement)

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
