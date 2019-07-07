import * as Color from "color"
import { Generators as Gen } from "../rng"

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
        readonly monospace: string
        readonly normal: string
    }
}

const styleMap = {
    "--color-primary": (theme: Theme) => theme.color.primary.toStyle(),
    "--color-primaryLight": (theme: Theme) => theme.color.primaryLight.toStyle(),
    "--color-primaryDark": (theme: Theme) => theme.color.primaryDark.toStyle(),
    "--color-secondary": (theme: Theme) => theme.color.secondary.toStyle(),
    "--color-secondaryLight": (theme: Theme) => theme.color.secondaryLight.toStyle(),
    "--color-secondaryDark": (theme: Theme) => theme.color.secondaryDark.toStyle(),
    "--color-onPrimary": (theme: Theme) => theme.color.onPrimary.toStyle(),
    "--color-onSecondary": (theme: Theme) => theme.color.onSecondary.toStyle(),
    "--color-onSurface": (theme: Theme) => theme.color.onSurface.toStyle(),
    "--color-surface": (theme: Theme) => theme.color.surface.toStyle(),
    "--color-background": (theme: Theme) => theme.color.background.toStyle(),

    "--shadows-button": (theme: Theme) => theme.shadows.button,
    "--shadows-menu": (theme: Theme) => theme.shadows.menu,
    "--shadows-surface": (theme: Theme) => theme.shadows.surface,

    "--fonts-monospace": (theme: Theme) => theme.fonts.monospace,
    "--fonts-normal": (theme: Theme) => theme.fonts.normal,
} as const

export function updateDiff(prevTheme: Theme, nextTheme: Theme): void {
    for (const propName in styleMap) {
        if (!styleMap.hasOwnProperty(propName)) {
            continue
        }

        const toStyle = styleMap[propName as keyof typeof styleMap]
        const prevValue = toStyle(prevTheme)
        const nextValue = toStyle(nextTheme)

        if (prevValue === nextValue) {
            continue
        }

        document.body.style.setProperty(propName, nextValue)
    }
}

export function updateAll(theme: Theme): void {
    for (const propName in styleMap) {
        if (!styleMap.hasOwnProperty(propName)) {
            continue
        }

        const toStyle = styleMap[propName as keyof typeof styleMap]
        document.body.style.setProperty(propName, toStyle(theme))
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
    primaryLight: hsluvGen(100, 90),
    primaryDark: hsluvGen(100, 70),
    secondary: hsluvGen(70, 77),
    secondaryLight: hsluvGen(70, 87),
    secondaryDark: hsluvGen(70, 67),
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
