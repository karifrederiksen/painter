import * as Color from "./color"
import * as Gen from "./generators"

export interface Theme {
    readonly color: {
        readonly primary: Color.Hsluv
        readonly primaryLight: Color.Hsluv
        readonly primaryDark: Color.Hsluv
        readonly secondary: Color.Hsluv
        readonly secondaryLight: Color.Hsluv
        readonly secondaryDark: Color.Hsluv
        readonly onPrimary: Color.Hsluv
        readonly onSecondary: Color.Hsluv
        readonly onSurface: Color.Hsluv
        readonly surface: Color.Hsluv
        readonly background: Color.Hsluv
    }
    readonly shadows: {
        readonly button: string
        readonly surface: string
        readonly menu: string
    }
    readonly fonts: {
        readonly normal: string
        readonly monospace: string
    }
}

const hsluvGen = (maxSat: number, luminance: number) =>
    Gen.map3(
        Gen.float(0, 360),
        Gen.float(0, maxSat),
        Gen.always(luminance),
        (h, s, l) => new Color.Hsluv(h, s, l)
    )

const colorsGen = Gen.object({
    primary: hsluvGen(100, 80),
    primaryLight: hsluvGen(100, 80),
    primaryDark: hsluvGen(100, 80),
    secondary: hsluvGen(100, 77),
    secondaryLight: hsluvGen(100, 77),
    secondaryDark: hsluvGen(100, 77),
    background: hsluvGen(20, 46),
    surface: hsluvGen(35, 38),
    onPrimary: hsluvGen(100, 0),
    onSecondary: hsluvGen(100, 0),
    onSurface: hsluvGen(100, 100),
})

const shadowsGen = Gen.always({
    button:
        "0 1px 5px 0 rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.12)",
    surface:
        "0 1px 5px 0 rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.12)",
    menu: "2px 2px 2px rgba(0, 0, 0, 0.45), 0 5px 8px 0 rgba(0, 0, 0, 0.3)",
})

const fontsGen = Gen.always({
    normal: `"Helvetica", "Arial", sans-serif`,
    monospace: `"Courier New", Courier, monospace`,
})

export const random = Gen.object<Theme>({
    color: colorsGen,
    shadows: shadowsGen,
    fonts: fontsGen,
})
