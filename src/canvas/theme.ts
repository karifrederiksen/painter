import { Color, Hsluv } from "./color"

export interface Theme {
    readonly colorPrimary: Color
    readonly colorDefaultLight: Color
    readonly colorDefault: Color
    readonly colorTextLightest: Color
    readonly colorTextLight: Color
    readonly colorTextDark: Color
    readonly colorBg1: Color
    readonly colorBg2: Color
    readonly colorBg3: Color
}

export const init: Theme = {
    colorPrimary: new Hsluv(0, 50, 70),
    colorDefaultLight: new Hsluv(0, 0, 77),
    colorDefault: new Hsluv(0, 0, 70),
    colorTextLightest: new Hsluv(0, 0, 92),
    colorTextLight: new Hsluv(0, 0, 85),
    colorTextDark: new Hsluv(0, 0, 4),
    colorBg1: new Hsluv(0, 0, 35),
    colorBg2: new Hsluv(0, 0, 30),
    colorBg3: new Hsluv(0, 0, 23),
}

const CssVars = `
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
