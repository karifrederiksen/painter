import "regenerator-runtime/runtime"
import { render } from "ivi"
import { App } from "./ui/app"

const rootElement = document.getElementById("canvas-root")

if (rootElement === null) {
    throw "canvas-root not found"
}

render(App(), rootElement)
