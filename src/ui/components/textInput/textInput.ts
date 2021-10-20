import {
    Op,
    Events,
    onChange,
    onPaste,
    onKeyDown,
    _,
    component,
    OpState,
    box,
    Ref,
    findDOMNode,
    useMutationEffect,
    shallowEqual,
} from "ivi"
import { input, VALUE } from "ivi-html"
import * as styles from "./textInput.scss"

export interface TextInputProps {
    readonly initialValue: string
    readonly onChange?: (text: string) => void
    readonly onEnter?: (text: string) => void
    readonly autoFocus?: boolean
}

export const TextInput = component<TextInputProps>(c => {
    const inputRef = box<OpState<HTMLInputElement> | null>(null)
    let propsOnChange: ((text: string) => void) | null = null
    let propsOnEnter: ((text: string) => void) | null = null

    function handleChange(ev: Event) {
        if (propsOnChange === null) {
            return
        }

        propsOnChange((ev.target as any).value)
    }

    function handleKeyboard(ev: KeyboardEvent) {
        if (ev.key !== "Enter") {
            return
        }
        if (propsOnEnter === null) {
            return
        }
        const elem = findDOMNode(inputRef) as HTMLInputElement
        propsOnEnter(elem.value)
    }

    const autoFocus = useMutationEffect<boolean>(
        c,
        shouldAutoFocus => {
            if (!shouldAutoFocus) {
                return
            }
            const inputElem = findDOMNode(inputRef) as HTMLInputElement

            inputElem.focus()
        },
        () => true
    )

    return props => {
        propsOnChange = props.onChange || null
        propsOnEnter = props.onEnter || null

        autoFocus(!!props.autoFocus)

        return Events(
            [onPaste(handleChange), onChange(handleChange), onKeyDown(handleKeyboard)],
            Ref(
                inputRef,
                input(styles.textInput, {
                    type: "text",
                    value: VALUE(props.initialValue),
                    style: { width: "100%" },
                })
            )
        )
    }
}, shallowEqual)
