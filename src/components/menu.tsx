import * as React from "react"
import styled, { Rem } from "../styled"
import { ZipperList } from "../zipperList"

export interface Props<a> {
    readonly choices: ZipperList<a>
    readonly show: (val: a) => string
    readonly onSelect: (val: a) => void
}

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

export class Menu<a> extends React.Component<Props<a>, State> {
    state = { isExpanded: false }
    container: HTMLDivElement | null = null
    listeningToGlobalClick: boolean = false

    render(): JSX.Element {
        const { choices, show } = this.props

        return (
            <Container onBlur={this.closeMenu}>
                <div ref={x => (this.container = x)}>
                    {this.state.isExpanded ? (
                        <>
                            <SelectedDisplayExpanded onMouseDown={this.closeMenu}>
                                {show(choices.focus)}
                            </SelectedDisplayExpanded>
                            <SelectableOptions
                                style={{
                                    marginTop:
                                        "calc(-0.5rem - " +
                                        this.container!.getBoundingClientRect().height +
                                        "px)",
                                }}
                            >
                                {choices.getLeft().map(value => (
                                    <OptionDefault
                                        key={show(value)}
                                        onClick={() => this.closeAndCallback(value)}
                                    >
                                        {show(value)}
                                    </OptionDefault>
                                ))}
                                <OptionSelected key={show(choices.focus)} onClick={this.closeMenu}>
                                    {show(choices.focus)}
                                </OptionSelected>
                                {choices.getRight().map(value => (
                                    <OptionDefault
                                        key={show(value)}
                                        onClick={() => this.closeAndCallback(value)}
                                    >
                                        {show(value)}
                                    </OptionDefault>
                                ))}
                            </SelectableOptions>
                        </>
                    ) : (
                        <SelectedDisplay onMouseDown={this.openMenu}>
                            {show(choices.focus)}
                        </SelectedDisplay>
                    )}
                </div>
            </Container>
        )
    }

    componentDidUpdate() {
        if (this.state.isExpanded) {
            if (!this.listeningToGlobalClick) {
                document.body.addEventListener("mousedown", this.onGlobalClick, {
                    passive: true,
                })
                this.listeningToGlobalClick = true
            }
        } else {
            if (this.listeningToGlobalClick) {
                document.body.removeEventListener("mousedown", this.onGlobalClick)
                this.listeningToGlobalClick = false
            }
        }
    }

    componentWillUnmount() {
        document.body.removeEventListener("mousedown", this.onGlobalClick)
    }

    onGlobalClick = (ev: MouseEvent) => {
        let target = ev.target as HTMLElement
        while (target.parentElement !== null) {
            if (target === this.container) return

            target = target.parentElement
        }
        this.closeMenu()
    }

    closeAndCallback = (val: a) => {
        this.closeMenu()
        this.props.onSelect(val)
    }

    openMenu = () => this.setState({ isExpanded: true })

    closeMenu = () => this.setState({ isExpanded: false })
}
