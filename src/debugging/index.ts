import { Op, Events, component, _, invalidate } from "ivi"
import { div } from "ivi-html"
import * as styles from "./index.scss"
import { SetOnce, PerfTracker } from "../util"
import { Surface } from "../views/surface"
import { DefaultButton } from "../views/buttons"
import * as Canvas from "../canvas"
import * as Signals from "../signals"
import { Scripting } from "./scripting"
import { Performance } from "./performance"

interface DebugWindowProps {
    readonly state: Canvas.State
    readonly gl: SetOnce<WebGLRenderingContext>
    readonly perfSamplesSignal: Signals.Signal<readonly PerfTracker.Sample[]>
}

// let's get the webgl context in here somehow!
// there's a lot of stuff I could use that for... maybe even eval?

export const DebugWindow = component<DebugWindowProps>(c => {
    let isOpen = false

    function open() {
        isOpen = true
        invalidate(c)
    }

    function close() {
        isOpen = false
        invalidate(c)
    }

    return props => {
        const { state } = props
        return Surface(
            !isOpen
                ? DefaultButton({
                      onClick: open,
                      content: "Debug",
                  })
                : div(styles.container, _, [
                      DefaultButton({
                          content: "Close",
                          onClick: close,
                      }),
                      div(styles.contentContainer, _, [
                          "RNG: ",
                          div(styles.monospaced, _, state.rng.display()),
                          Performance({
                              samplesSignal: props.perfSamplesSignal,
                          }),
                          Scripting({
                              gl: props.gl,
                          }),
                      ]),
                  ])
        )
    }
})
