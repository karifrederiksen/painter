import {
    Op,
    Events,
    useEffect,
    component,
    invalidate,
    _,
    onChange,
    box,
    OpState,
    Ref,
    findDOMNode,
} from "ivi"
import { div, span, ul, textarea, li, CONTENT } from "ivi-html"
import * as styles from "./scripting.scss"
import { SetOnce } from "../util"

export interface ScriptingProps {
    readonly gl: SetOnce<WebGLRenderingContext>
}

export const Scripting = component<ScriptingProps>(c => {
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
