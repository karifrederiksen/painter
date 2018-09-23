import * as Color from "./color"
import * as Rng from "./rng"

export interface Theme {
    readonly colorPrimary: Color.Hsluv
    readonly colorDefaultLight: Color.Hsluv
    readonly colorDefault: Color.Hsluv
    readonly colorTextLightest: Color.Hsluv
    readonly colorTextLight: Color.Hsluv
    readonly colorTextDark: Color.Hsluv
    readonly colorBg1: Color.Hsluv
    readonly colorBg2: Color.Hsluv
    readonly colorBg3: Color.Hsluv
}

const init_: Theme = {
    colorPrimary: new Color.Hsluv(0, 50, 70),
    colorDefaultLight: new Color.Hsluv(0, 0, 77),
    colorDefault: new Color.Hsluv(0, 0, 60),
    colorTextLightest: new Color.Hsluv(0, 0, 96),
    colorTextLight: new Color.Hsluv(0, 0, 90),
    colorTextDark: new Color.Hsluv(0, 0, 4),
    colorBg1: new Color.Hsluv(0, 0, 46),
    colorBg2: new Color.Hsluv(0, 0, 38),
    colorBg3: new Color.Hsluv(0, 0, 23),
}

function randomizeColors(rng: Rng.RngState, initialTheme: Theme): Theme {
    const theme: any = {}
    const keys = Object.keys(initialTheme) as (keyof Theme)[]
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        const color = initialTheme[key]

        const [s, h, nextState] = Rng.next2(rng)
        rng = nextState

        theme[key] = color.withS(10 + s * 50).withH(h * 360)
    }

    return theme
}

export const init = randomizeColors(Rng.seed(/*114*/ 12372), init_)
