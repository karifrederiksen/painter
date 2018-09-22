import * as React from "react"
import styled from "../styled"
import { withTheme } from "../styled"
import { Theme } from "canvas/theme"

export type SwitchProps = {
    readonly checked: boolean
    readonly onCheck: (checked: boolean) => void
    readonly color?: string
}

const Switch_ = styled.span`
    cursor: pointer;
    display: inline-flex;
    margin: 0.5rem 0;
`

const SwitchButtonContainer = styled.span`
    display: inline-flex;
    position: absolute;
    z-index: 2;
    transition: 150ms transform;
`

const SwitchButton = styled.span`
    cursor: pointer;
    width: 1rem;
    height: 1rem;
    border-radius: 0.5rem;
    z-index: 2;
    transition: 150ms background-color, 150ms transform;
    box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14),
        0 3px 1px -2px rgba(0, 0, 0, 0.12);
`

const SwitchBar = styled.span`
    background-color: ${p => p.theme.colorDefault.toStyle()};
    display: block;
    width: 1.75rem;
    height: 0.75rem;
    border-radius: 0.3775rem;
    z-index: 1;
    transition: 150ms background-color, 150ms opacity;
`

export const Switch = withTheme(
    class UnwrappedSwitch extends React.PureComponent<SwitchProps & { readonly theme: Theme }> {
        render(): JSX.Element {
            const { checked, color, onCheck } = this.props
            const theme = this.props.theme as Theme
            console.log(this.props)
            const color_ = color || theme.colorPrimary.toStyle()
            return (
                <Switch_ onClick={() => onCheck(!checked)}>
                    <SwitchButtonContainer
                        style={{
                            transform: checked
                                ? "translate(0.75rem, -0.125rem)"
                                : "translate(0, -0.125rem)",
                        }}
                    >
                        <SwitchButton
                            style={{
                                backgroundColor: checked
                                    ? color_
                                    : theme.colorDefaultLight.toStyle(),
                            }}
                        />
                    </SwitchButtonContainer>
                    <SwitchBar />
                </Switch_>
            )
        }
    }
)
