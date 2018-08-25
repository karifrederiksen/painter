import * as React from "react"
import styled from "styled-components"
import {
    CSS_COLOR_DEFAULT,
    CSS_COLOR_DEFAULT_HIGHLIGHT,
    CSS_COLOR_TEXT_LIGHTEST,
    CSS_COLOR_TEXT_DARK,
    CSS_COLOR_PRIMARY,
} from "ui/css"

const ButtonCommon = styled.button`
    cursor: pointer;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    position: relative;
    text-decoration: none;
    border: 0;
    border-radius: 0.25rem;
    padding: 0.5rem;
    height: 2.25rem;
    width: 100%;
    min-width: 4rem;
    transition: all 150ms;
    line-height: 1.4em;
`

export const PrimaryButton = styled(ButtonCommon)`
    background-color: ${CSS_COLOR_PRIMARY};
    color: ${CSS_COLOR_TEXT_DARK};
    box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14),
        0 3px 1px -2px rgba(0, 0, 0, 0.12);

    &:hover {
        background-color: ${CSS_COLOR_DEFAULT_HIGHLIGHT};
    }
`

export const DefaultButton = styled(ButtonCommon)`
    background-color: ${CSS_COLOR_DEFAULT};
    color: ${CSS_COLOR_TEXT_LIGHTEST};
    box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14),
        0 3px 1px -2px rgba(0, 0, 0, 0.12);

    &:hover {
        background-color: ${CSS_COLOR_DEFAULT_HIGHLIGHT};
        color: ${CSS_COLOR_TEXT_DARK};
    }
`
