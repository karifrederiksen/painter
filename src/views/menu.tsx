import * as React from "react"
import styled, { Rem } from "../styled"
import { ZipperList } from "../collections/zipperList"

const Container = styled.div`
    background-color: ${p => p.theme.color.surface.toStyle()};
    color: ${p => p.theme.color.onSurface.toStyle()};
    min-width: 6rem;
`

const SelectedDisplayCommon = styled.div`
    cursor: pointer;
    text-align: center;
    min-width: 100%;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
`

const SelectedDisplay = styled(SelectedDisplayCommon)`
    &:hover {
        background-color: ${p => p.theme.color.secondary.toStyle()};
        color: ${p => p.theme.color.onSecondary.toStyle()};
    }
`

const SelectedDisplayExpanded = styled(SelectedDisplayCommon)`
    background-color: ${p => p.theme.color.secondary.toStyle()};
    color: ${p => p.theme.color.onSecondary.toStyle()};
`

const SelectableOptions = styled.div`
    position: absolute;
    flex-direction: column;
    min-width: 6rem;
    margin-top: 1px;
    background-color: ${p => p.theme.color.surface.toStyle()};
    color: ${p => p.theme.color.onSurface.toStyle()};
    box-shadow: ${p => p.theme.shadows.menu};

    > :first-child {
        border-top-left-radius: 0.25rem;
        border-top-right-radius: 0.25rem;
    }
    > :last-child {
        border-bottom-left-radius: 0.25rem;
        border-bottom-right-radius: 0.25rem;
    }
`

const OptionCommon = styled.div`
    cursor: pointer;
    padding: 0.25rem 0.5rem;
`

const OptionDefault = styled(OptionCommon)`
    &:hover {
        background-color: ${p => p.theme.color.secondaryLight.toStyle()};
    }
`

const OptionSelected = styled(OptionCommon)`
    background-color: ${p => p.theme.color.secondary.toStyle()};
    color: ${p => p.theme.color.onSecondary.toStyle()};
`

interface State {
    readonly isExpanded: boolean
}

export interface Props<a> {
    readonly choices: ZipperList<a>
    readonly show: (val: a) => string
    readonly onSelect: (val: a) => void
}

export function Menu<a>(props: Props<a>) {
    return React.createElement(Menu_, props as any, [])
}

const Menu_ = React.memo(function<a>(props: Props<a>) {
    const { choices, show } = props
    const container = React.useRef<HTMLDivElement | null>(null)
    const [isExpanded, setIsExpanded] = React.useState(false)
    const [listeningToGlobal, setListeningToGlobal] = React.useState(false)

    function onGlobalClick(ev: MouseEvent) {
        let target = ev.target as HTMLElement
        while (target.parentElement !== null) {
            if (target === container.current) return

            target = target.parentElement
        }
        closeMenu()
    }

    function closeAndCallback(val: a) {
        closeMenu()
        props.onSelect(val)
    }

    function openMenu() {
        setIsExpanded(true)
    }

    function closeMenu() {
        setIsExpanded(false)
    }

    React.useEffect(() => {
        if (isExpanded && !listeningToGlobal) {
            document.body.addEventListener("mousedown", onGlobalClick, {
                passive: true,
            })
            setListeningToGlobal(true)
            return () => {
                document.body.removeEventListener("mousedown", onGlobalClick)
            }
        }
        if (listeningToGlobal) {
            setListeningToGlobal(false)
        }
        return () => {}
    }, [isExpanded, listeningToGlobal])

    return (
        <Container onBlur={closeMenu}>
            <div ref={container}>
                {isExpanded ? (
                    <>
                        <SelectedDisplayExpanded onMouseDown={closeMenu}>
                            {show(choices.focus)}
                        </SelectedDisplayExpanded>
                        <SelectableOptions
                            style={{
                                marginTop:
                                    "calc(-0.5rem - " +
                                    container.current!.getBoundingClientRect().height +
                                    "px)",
                            }}
                        >
                            {choices.getLeft().map(value => (
                                <OptionDefault
                                    key={show(value)}
                                    onClick={() => closeAndCallback(value)}
                                >
                                    {show(value)}
                                </OptionDefault>
                            ))}
                            <OptionSelected key={show(choices.focus)} onClick={closeMenu}>
                                {show(choices.focus)}
                            </OptionSelected>
                            {choices.getRight().map(value => (
                                <OptionDefault
                                    key={show(value)}
                                    onClick={() => closeAndCallback(value)}
                                >
                                    {show(value)}
                                </OptionDefault>
                            ))}
                        </SelectableOptions>
                    </>
                ) : (
                    <SelectedDisplay onMouseDown={openMenu}>{show(choices.focus)}</SelectedDisplay>
                )}
            </div>
        </Container>
    )
})
