import {
    Op,
    Events,
    component,
    _,
    invalidate,
    useEffect,
    box,
    OpState,
    findDOMNode,
    Ref,
    onChange,
} from "ivi"
import { div, ul, li, span, textarea, CONTENT } from "ivi-html"
import * as styles from "./debugging.scss"
import { SetOnce, PerfTracker, Signals } from "../../util"
import { Surface, DefaultButton } from "../components"
import { Seed } from "../../rng"

interface PerformanceProps {
    readonly samplesSignal: Signals.Signal<readonly PerfTracker.Sample[]>
}

const Performance = component<PerformanceProps>((c) => {
    let samples = SamplesOverTime.empty

    const subscribe = useEffect<Signals.Signal<readonly PerfTracker.Sample[]>>(
        c,
        (samplesSignal) => {
            const { dispose } = samplesSignal.subscribe((nextSamples) => {
                samples = samples.update(nextSamples)
                invalidate(c)
            })

            return dispose
        }
    )

    return (props): Op => {
        subscribe(props.samplesSignal)

        const samplecount = samples.length()
        let max = Number.MIN_VALUE
        let sum = 0

        samples.forEach((sample, index) => {
            const time = sample.endMs - sample.startMs
            sum += time
            if (time > max) {
                max = time
            }
        })

        return div(_, _, [
            div(_, _, "Max: " + max.toFixed(3) + " ms"),
            div(_, _, "Avg: " + (sum / samplecount).toFixed(3) + " ms"),
        ])
    }
})

class SamplesOverTime {
    static empty = new SamplesOverTime([], [], [], [])

    private constructor(
        readonly sample0: readonly PerfTracker.Sample[],
        readonly sample1: readonly PerfTracker.Sample[],
        readonly sample2: readonly PerfTracker.Sample[],
        readonly sample3: readonly PerfTracker.Sample[]
    ) {}

    update(sample: readonly PerfTracker.Sample[]) {
        return new SamplesOverTime(sample, this.sample0, this.sample1, this.sample2)
    }

    length() {
        return this.sample0.length + this.sample1.length + this.sample2.length + this.sample3.length
    }

    forEach(f: (sample: PerfTracker.Sample, index: number) => void): void {
        let samples = this.sample0
        let length = 0
        for (let i = 0; i < samples.length; i++) {
            f(samples[i], i)
        }
        length += samples.length
        samples = this.sample1
        for (let i = 0; i < samples.length; i++) {
            f(samples[i], length + i)
        }
        length += samples.length
        samples = this.sample2
        for (let i = 0; i < samples.length; i++) {
            f(samples[i], length + i)
        }
        length += samples.length
        samples = this.sample3
        for (let i = 0; i < samples.length; i++) {
            f(samples[i], length + i)
        }
    }
}

interface ScriptingProps {
    readonly gl: SetOnce<WebGLRenderingContext>
}

const Scripting = component<ScriptingProps>((c) => {
    const textareaRef = box<OpState<HTMLTextAreaElement> | null>(null)
    let code = ""

    function onInput(ev: Event) {
        code = (ev.target as any).value
        invalidate(c)
    }

    function onKeyboard(ev: KeyboardEvent) {
        const textareaNode = findDOMNode<HTMLTextAreaElement>(textareaRef)
        if (textareaNode === null || textareaNode !== ev.target) {
            return
        }
        if (ev.key === "Enter" && !ev.shiftKey && !ev.altKey) {
            ev.preventDefault()
            try {
                /* eslint-disable-next-line no-eval */
                console.log(eval("var gl = props.gl.value;\n" + code))
            } catch {}
            code = ""
            invalidate(c)
        }
    }

    const listenToKeyboard = useEffect(c, () => {
        document.body.addEventListener("keydown", onKeyboard)
        return () => {
            document.body.removeEventListener("keydown", onKeyboard)
        }
    })

    return (props): Op => {
        listenToKeyboard()
        return div(_, _, [
            div(_, _, [
                "Variables",
                ul(_, _, li(_, _, [span(styles.monospaced, _, "gl"), ": WebGLRenderingContext"])),
            ]),
            Ref(
                textareaRef,
                Events(
                    onChange(onInput),
                    textarea(styles.codeInput, {
                        content: CONTENT(code),
                    })
                )
            ),
        ])
    }
})

interface DebugWindowProps {
    readonly themeRng: Seed
    readonly gl: SetOnce<WebGLRenderingContext>
    readonly perfSamplesSignal: Signals.Signal<readonly PerfTracker.Sample[]>
}

// let's get the webgl context in here somehow!
// there's a lot of stuff I could use that for... maybe even eval?

export const DebugWindow = component<DebugWindowProps>((c) => {
    let isOpen = false

    function open() {
        isOpen = true
        invalidate(c)
    }

    function close() {
        isOpen = false
        invalidate(c)
    }

    return (props) => {
        const { themeRng } = props
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
                          div(styles.monospaced, _, themeRng.display()),
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
