import { render } from "inferno"
import { start } from "./ui"
import { defaultState } from "./canvas"
import { frameStream } from "./core/frameStream"

// HMR hooks
declare global {
    interface NodeModule {
        readonly hot: {
            // Module or one of its dependencies was just updated
            accept(deps: string | ReadonlyArray<string>, cb: () => void): void

            // Module is about to be replaced
            dispose(cb: () => void): void
        }
    }
}

function renderUI(root: HTMLElement | null) {
    render(start(defaultState(), frameStream), rootElement)
}

function unrenderUI() {
    render(null, rootElement)
}

// Start

const rootElement = document.getElementById("canvas-root")
renderUI(rootElement)

/* tslint:disable-next-line */
var lastDisposeTime: number
if (module.hot) {
    module.hot.dispose(() => {
        if (performance.now() - (lastDisposeTime || 0) < 200) {
            console.error("hot reload isn't working properly")
            return
        }

        console.log("disposing of everything")
        unrenderUI()
        renderUI(rootElement)
        lastDisposeTime = performance.now()
    })
}
