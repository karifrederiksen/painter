import * as styledComponents from "styled-components"
import { Theme } from "../theme"

const {
    default: styled,
    css,
    withTheme,
    createGlobalStyle,
    keyframes,
    ThemeProvider,
} = styledComponents as styledComponents.ThemedStyledComponentsModule<Theme>

export default styled /* tslint:disable-line */
export { css, createGlobalStyle, keyframes, ThemeProvider, withTheme }

export const Rem = 16
