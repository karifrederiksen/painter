import * as React from "react"
import * as styles from "./scripting.scss"
import { SetOnce } from "../util"

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
                        <span className={styles.monospaced}>gl</span>: WebGLRenderingContext
                    </li>
                </ul>
            </div>
            <textarea
                className={styles.codeInput}
                value={code}
                onChange={ev => setCode(ev.target.value)}
                onKeyDown={onKeyboard}
            />
        </div>
    )
}
