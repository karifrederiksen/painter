import {
    DOMElementOp,
    component,
    Events,
    onClick,
    useEffect,
    onBlur,
    Ref,
    OpState,
    box,
    invalidate,
    onMouseDown,
    findDOMNode,
    _,
} from "ivi"
import { div } from "ivi-html"
import * as styles from "./menu.scss"
import { ZipperList } from "../collections/zipperList"

export interface Props<a> {
    readonly choices: ZipperList<a>
    readonly show: (val: a) => string
    readonly onSelect: (val: a) => void
}

function noOp() {}

function Menu_<a>(c: OpState) {
    const containerRef = box<OpState<HTMLDivElement> | null>(null)
    let isExpanded = false
    let selectHandler: (val: any) => void = noOp

    function onGlobalClick(ev: MouseEvent) {
        const containerNode = findDOMNode(containerRef)
        let target = ev.target as HTMLElement
        while (target.parentElement !== null) {
            if (target === containerNode) {
                return
            }

            target = target.parentElement
        }
        closeMenu()
    }

    function openMenu() {
        isExpanded = true
        invalidate(c)
    }

    function closeMenu() {
        isExpanded = false
        invalidate(c)
    }

    function closeAndCallback(val: a) {
        selectHandler(val)
        closeMenu()
    }

    const listenToMouse = useEffect<boolean>(c, isExpanded => {
        if (!isExpanded) {
            return
        }
        document.body.addEventListener("mousedown", onGlobalClick, {
            passive: true,
        })
        return () => {
            document.body.removeEventListener("mousedown", onGlobalClick)
        }
    })

    return (props: Props<a>) => {
        listenToMouse(isExpanded)

        selectHandler = props.onSelect
        const containerNode = findDOMNode<HTMLDivElement>(containerRef)

        return Events(
            onBlur(closeMenu),
            Ref(
                containerRef,
                div(styles.container, _, [
                    Events(
                        onMouseDown(isExpanded ? closeMenu : openMenu),
                        div(
                            isExpanded ? styles.selectedDisplayExpanded : styles.selectedDisplay,
                            _,
                            props.show(props.choices.focus)
                        )
                    ),
                    !isExpanded
                        ? null
                        : div(
                              styles.selectableOptions,
                              {
                                  style: {
                                      "margin-top":
                                          containerNode === null
                                              ? _
                                              : "calc(-0.5rem - " +
                                                containerNode.getBoundingClientRect().height +
                                                "px)",
                                  },
                              },
                              // nesting fragments inside fragments seems to cause trouble
                              [
                                  div(
                                      _,
                                      _,
                                      props.choices
                                          .getLeft()
                                          .map(val =>
                                              Events(
                                                  onClick(() => closeAndCallback(val)),
                                                  div(styles.optionDefault, _, props.show(val))
                                              )
                                          )
                                  ),
                                  Events(
                                      onClick(closeMenu),
                                      div(styles.optionSelected, _, props.show(props.choices.focus))
                                  ),
                                  div(
                                      _,
                                      _,
                                      props.choices
                                          .getRight()
                                          .map(val =>
                                              Events(
                                                  onClick(() => closeAndCallback(val)),
                                                  div(styles.optionDefault, _, props.show(val))
                                              )
                                          )
                                  ),
                              ]
                          ),
                ])
            )
        )
    }
}

export const Menu = component(Menu_) as <a>(props: Props<a>) => DOMElementOp<Props<a>>
