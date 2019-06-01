import * as React from "react"
import styled from "../styled"
import { SetOnce } from "../util"

const Monospaced = styled.span`
    font-family: "Courier New", Courier, monospace;
`

const CodeInput = styled.textarea`
    font-family: "Courier New", Courier, monospace;
    background-color: ${p => p.theme.color.primary.toStyle()};
    color: ${p => p.theme.color.onPrimary.toStyle()};
    border-radius: 0.25rem;
    padding: 0.25rem;
`

export interface ScriptingProps {
    readonly gl: SetOnce<WebGLRenderingContext>
}

export function Scripting(props: ScriptingProps) {
    const [code, setCode] = React.useState("")

    function onKeyboard(ev: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (ev.key === "Enter" && !ev.shiftKey && !ev.altKey) {
            ev.preventDefault()
            try {
                /* eslint-disable-next-line no-eval */
                console.log(eval("var gl = props.gl.value;\n" + code))
            } catch {}
            setCode("")
        }
    }

    return (
        <div>
            <div>
                Variables
                <ul>
                    <li>
                        <Monospaced>gl</Monospaced>: WebGLRenderingContext
                    </li>
                </ul>
            </div>
            <CodeInput
                value={code}
                onChange={ev => setCode(ev.target.value)}
                onKeyDown={onKeyboard}
            />
        </div>
    )
}
