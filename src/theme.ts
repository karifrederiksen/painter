import * as Color from "./color"
import * as Rng from "./rng"
import { T2 } from "./util"

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

interface ThemeBuilder {
    color: {
        primary: Color.Hsluv
        primaryLight: Color.Hsluv
        primaryDark: Color.Hsluv
        secondary: Color.Hsluv
        secondaryLight: Color.Hsluv
        secondaryDark: Color.Hsluv
        onPrimary: Color.Hsluv
        onSecondary: Color.Hsluv
        onSurface: Color.Hsluv
        surface: Color.Hsluv
        background: Color.Hsluv
    }
    shadows: {
        button: string
        surface: string
        menu: string
    }
    fonts: {
        normal: string
        monospace: string
    }
}

const makeBuilder = (): ThemeBuilder => ({
    color: {
        primary: new Color.Hsluv(0, 100, 80),
        primaryLight: new Color.Hsluv(0, 100, 80),
        primaryDark: new Color.Hsluv(0, 100, 80),
        secondary: new Color.Hsluv(0, 100, 77),
        secondaryLight: new Color.Hsluv(0, 100, 77),
        secondaryDark: new Color.Hsluv(0, 100, 77),
        background: new Color.Hsluv(0, 20, 46),
        surface: new Color.Hsluv(0, 35, 38),
        onPrimary: new Color.Hsluv(0, 100, 0),
        onSecondary: new Color.Hsluv(0, 100, 0),
        onSurface: new Color.Hsluv(0, 100, 100),
    },
    shadows: {
        button:
            "0 1px 5px 0 rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.12)",
        surface:
            "0 1px 5px 0 rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.12)",
        menu: "2px 2px 2px rgba(0, 0, 0, 0.45), 0 5px 8px 0 rgba(0, 0, 0, 0.3)",
    },
    fonts: {
        normal: `"Helvetica", "Arial", sans-serif`,
        monospace: `"Courier New", Courier, monospace`,
    },
})

function randomizeColors(rng_: Rng.Seed, builder: ThemeBuilder): T2<Theme, Rng.Seed> {
    const rng = new Rng.StatefulWrapper(rng_)

    const generate = ({ s, l }: Color.Hsluv) => new Color.Hsluv(rng.next() * 360, rng.next() * s, l)

    builder.color.primary = generate(builder.color.primary)
    builder.color.primaryLight = generate(builder.color.primaryLight)
    builder.color.primaryDark = generate(builder.color.primaryDark)
    builder.color.secondary = generate(builder.color.secondary)
    builder.color.secondaryLight = generate(builder.color.secondaryLight)
    builder.color.secondaryDark = generate(builder.color.secondaryDark)
    builder.color.background = generate(builder.color.background)
    builder.color.surface = generate(builder.color.surface)
    builder.color.onPrimary = generate(builder.color.onPrimary)
    builder.color.onSecondary = generate(builder.color.onSecondary)
    builder.color.onSurface = generate(builder.color.onSurface)

    return [builder, rng.state]
}

export const random = (rng: Rng.Seed) => randomizeColors(rng, makeBuilder())
