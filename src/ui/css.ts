import styled from "styled-components"

export const Rem = 16

export const CSS_COLOR_PRIMARY = "var(--color-primary)"
export const CSS_COLOR_PRIMARY_HIGHLIGHT = "var(--color-primary-highlight)"
export const CSS_COLOR_DEFAULT = "var(--color-default)"
export const CSS_COLOR_DEFAULT_HIGHLIGHT = "var(--color-default-highlight)"

export const CSS_COLOR_TEXT_LIGHT = "var(--color-text-light)"
export const CSS_COLOR_TEXT_LIGHTEST = "var(--color-text-lightest)"
export const CSS_COLOR_TEXT_DARK = "var(--color-text-dark)"

export const CSS_COLOR_BG_LEVEL_0 = "var(--color-bg-level-0)"
export const CSS_COLOR_BG_LEVEL_1 = "var(--color-bg-level-1)"
export const CSS_COLOR_BG_LEVEL_2 = "var(--color-bg-level-2)"

export const CssVars = styled.div`
    --color-primary: rgb(191, 151, 255);
    --color-primary-highlight: rgb(255, 159, 255);
    --color-default: rgb(135, 135, 135);
    --color-default-highlight: rgb(190, 190, 190);
    --color-text-light: rgb(223, 223, 223);
    --color-text-lightest: rgb(255, 255, 255);
    --color-text-dark: rgb(51, 51, 51);
    --color-bg-level-0: rgb(63, 63, 63);
    --color-bg-level-1: rgb(87, 87, 87);
    --color-bg-level-2: rgb(100, 100, 100);
`
