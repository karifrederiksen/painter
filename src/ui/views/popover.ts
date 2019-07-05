import { component, Events, _, Op, box, OpState, Ref, shallowEqual, findDOMNode } from "ivi"
import { span, div } from "ivi-html"
import { onMouseEnter, onMouseLeave } from "../ivi-util"
import styles from "./popover.scss"

function popoverText(text: string) {
    return div(styles.popover, _, text)
}

export interface PopoverProps {
    readonly text: string
    readonly content: Op
}

export const Popover = component<PopoverProps>(c => {
    const contentRef = box<OpState<HTMLElement> | null>(null)
    const popoverRef = box<OpState<HTMLElement> | null>(null)
    let timeout: NodeJS.Timeout | null = null

    function setShouldShow() {
        const contentElem = findDOMNode(contentRef) as HTMLElement
        const popoverElem = findDOMNode(popoverRef) as HTMLElement
        const contentBounds = contentElem.getBoundingClientRect()
        popoverElem.style.display = ""
        const popoverBounds = popoverElem.getBoundingClientRect()

        const widthDelta = contentBounds.width - popoverBounds.width
        const left = contentBounds.left + widthDelta / 2
        const top = contentBounds.top - popoverBounds.height - 8

        popoverElem.style.left = left + "px"
        popoverElem.style.top = top + "px"
    }

    function mouseEnterHandler() {
        timeout = setTimeout(setShouldShow, 250)
    }

    function mouseLeaveHandler() {
        const popoverElem = findDOMNode(popoverRef) as HTMLElement
        popoverElem.style.display = "none"
        popoverElem.style.left = ""
        popoverElem.style.top = ""

        if (timeout !== null) {
            clearTimeout(timeout)
            timeout = null
        }
    }

    return props => {
        return Events(
            [onMouseEnter(mouseEnterHandler), onMouseLeave(mouseLeaveHandler)],
            span(_, _, [Ref(popoverRef, popoverText(props.text)), Ref(contentRef, props.content)])
        )
    }
}, shallowEqual)
