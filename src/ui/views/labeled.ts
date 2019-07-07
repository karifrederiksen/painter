import { Op, _, Events, onClick, component, shallowEqual, invalidate } from "ivi"
import { div, p } from "ivi-html"
import * as styles from "./labeled.scss"
import { Dialog } from "./dialog"
import { PrimaryButton } from "."
import { Row } from "./row"
import { DefaultButton } from "./buttons"
import { TextInput } from "./textInput"

function noOp() {}

export interface LabledProps<a> {
    readonly label: string
    readonly valuePostfix?: string
    readonly value: a
    readonly toString: (value: a) => string
    readonly fromString: (text: string) => a | null
    readonly children: Op
    readonly onChange: (val: a) => void
}

const Labeled_ = component<LabledProps<unknown>>(c => {
    let isEditing = false
    let inputValue = ""
    let textToValue: (text: string) => unknown | null = noOp
    let handleChange: (val: unknown) => void = noOp

    function handleInput(text: string) {
        inputValue = text
    }

    function startEditing() {
        isEditing = true
        invalidate(c)
    }

    function stopEditing() {
        isEditing = false
        invalidate(c)
    }

    function handleUpdate() {
        const value = textToValue(inputValue)
        console.debug("value", value)
        if (value === null) {
            // unable to parse - show error?
        } else {
            handleChange(value)
            isEditing = false
        }
        invalidate(c)
    }

    function handleUpdateWithText(text: string) {
        handleInput(text)
        handleUpdate()
    }

    return props => {
        textToValue = props.fromString
        handleChange = props.onChange
        inputValue = props.toString(props.value)

        return div(styles.container, _, [
            div(styles.textContainer, _, [
                p(styles.label, _, props.label),
                Events(
                    onClick(startEditing),
                    p(styles.label, _, [
                        props.toString(props.value) || "",
                        props.valuePostfix || null,
                    ])
                ),
                Dialog({
                    isOpen: isEditing,
                    onClose: stopEditing,
                    content: [
                        div(styles.titleText, _, props.label),
                        TextInput({
                            initialValue: inputValue,
                            onChange: handleInput,
                            onEnter: handleUpdateWithText,
                            autoFocus: true,
                        }),
                    ],
                    footer: Row({
                        spacing: "0.5rem",
                        children: [
                            DefaultButton({
                                content: "Cancel",
                                onClick: stopEditing,
                            }),
                            PrimaryButton({
                                content: "Update",
                                onClick: handleUpdate,
                            }),
                        ],
                    }),
                }),
            ]),
            div(styles.content, _, props.children),
        ])
    }
}, shallowEqual)

export function Labeled<a>(props: LabledProps<a>) {
    return Labeled_(props as any)
}
