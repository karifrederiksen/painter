import * as React from "react"
import styled from "../styled"
import { ZipperList } from "../zipperList"

export interface Props<a> {
    readonly choices: ZipperList<a>
    readonly show: (val: a) => string
    readonly onSelect: (val: a) => void
}

const Container = styled.div`
    background-color: ${p => p.theme.surfaceColor.toStyle()};
    color: ${p => p.theme.onSurfaceColor.toStyle()};
    width: 100%;
`

interface State {
    readonly isExpanded: boolean
}

const SelectedDisplay = styled.div`
    background-color: ${p => p.theme.primaryColor.toStyle()};
    color: ${p => p.theme.onPrimaryColor.toStyle()};
    width: 100%;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    cursor: pointer;
`

const SelectableOptions = styled.div`
    position: absolute;
    margin-top: 1px;
    > :first-child {
        border-top-left-radius: 0.25rem;
        border-top-right-radius: 0.25rem;
    }
    > :last-child {
        border-bottom-left-radius: 0.25rem;
        border-bottom-right-radius: 0.25rem;
    }
`

export class DropDown<a> extends React.Component<Props<a>, State> {
    constructor(props: Props<a>) {
        super(props)
        this.state = { isExpanded: false }
    }

    render(): JSX.Element {
        console.log("dropdowns")
        const state = this.state
        const { choices, show, onSelect } = this.props
        const left = choices.getLeft().map(value =>
            toOption({
                value,
                isSelected: false,
                show,
                onSelect: this.closeAndCallback,
            })
        )
        const right = choices.getRight().map(value =>
            toOption({
                value,
                isSelected: false,
                show,
                onSelect: this.closeAndCallback,
            })
        )
        const focus = [
            toOption({
                value: choices.focus,
                isSelected: true,
                show,
                onSelect: this.closeAndCallback,
            }),
        ]

        return (
            <Container>
                <SelectedDisplay
                    onMouseDown={() => this.setState({ isExpanded: !state.isExpanded })}
                >
                    {show(choices.focus)}
                </SelectedDisplay>
                {this.state.isExpanded ? (
                    <SelectableOptions>{left.concat(focus).concat(right)}</SelectableOptions>
                ) : (
                    <></>
                )}
            </Container>
        )
    }

    private closeAndCallback = (val: a) => {
        this.setState({ isExpanded: false })
        this.props.onSelect(val)
    }
}

const OptionCommon = styled.div`
    padding: 0.25rem 0.5rem;
`

const OptionDefault = styled(OptionCommon)`
    background-color: ${p => p.theme.secondaryColor.toStyle()};
    color: ${p => p.theme.onSecondaryColor.toStyle()};
    cursor: pointer;
`

const OptionSelected = styled(OptionCommon)`
    background-color: ${p => p.theme.primaryColor.toStyle()};
    color: ${p => p.theme.onPrimaryColor.toStyle()};
    cursor: pointer;
`

interface OptionProps<a> {
    readonly show: (val: a) => string
    readonly onSelect: (val: a) => void
    readonly value: a
    readonly isSelected: boolean
}

function toOption<a>({ value, isSelected, show, onSelect }: OptionProps<a>): JSX.Element {
    if (isSelected) {
        return <OptionSelected key={show(value)}>{show(value)}</OptionSelected>
    } else {
        return (
            <OptionDefault key={show(value)} onClick={() => onSelect(value)}>
                {show(value)}
            </OptionDefault>
        )
    }
}
