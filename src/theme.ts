import * as Color from "./color"
import * as Rng from "./rng"

export interface Theme {
    readonly primaryColor: Color.Hsluv
    readonly primaryColorLight: Color.Hsluv
    readonly primaryColorDark: Color.Hsluv
    readonly secondaryColor: Color.Hsluv
    readonly secondaryColorLight: Color.Hsluv
    readonly secondaryColorDark: Color.Hsluv
    readonly onPrimaryColor: Color.Hsluv
    readonly onSecondaryColor: Color.Hsluv
    readonly onSurfaceColor: Color.Hsluv
    readonly bgColor: Color.Hsluv
    readonly surfaceColor: Color.Hsluv
}

interface ThemeBuilder {
    primaryColor: Color.Hsluv
    primaryColorLight: Color.Hsluv
    primaryColorDark: Color.Hsluv
    secondaryColor: Color.Hsluv
    secondaryColorLight: Color.Hsluv
    secondaryColorDark: Color.Hsluv
    onPrimaryColor: Color.Hsluv
    onSecondaryColor: Color.Hsluv
    onSurfaceColor: Color.Hsluv
    bgColor: Color.Hsluv
    surfaceColor: Color.Hsluv
}

const makeBuilder = (): ThemeBuilder => ({
    primaryColor: new Color.Hsluv(0, 0, 80),
    primaryColorLight: new Color.Hsluv(0, 0, 80),
    primaryColorDark: new Color.Hsluv(0, 0, 80),
    secondaryColor: new Color.Hsluv(0, 0, 77),
    secondaryColorLight: new Color.Hsluv(0, 0, 77),
    secondaryColorDark: new Color.Hsluv(0, 0, 77),
    bgColor: new Color.Hsluv(0, 0, 46),
    surfaceColor: new Color.Hsluv(0, 0, 38),
    onPrimaryColor: new Color.Hsluv(0, 0, 0),
    onSecondaryColor: new Color.Hsluv(0, 0, 0),
    onSurfaceColor: new Color.Hsluv(0, 0, 100),
})

function randomizeColors(builder: ThemeBuilder): Theme {
    const rng = new Rng.StatefulWrapper(Rng.seed(1456462772))

    const generate = ({ l }: Color.Hsluv) =>
        new Color.Hsluv(rng.next() * 360, 10 + rng.next() * 50, l)

    builder.primaryColor = generate(builder.primaryColor)
    builder.primaryColorLight = generate(builder.primaryColorLight)
    builder.primaryColorDark = generate(builder.primaryColorDark)
    builder.secondaryColor = generate(builder.secondaryColor)
    builder.secondaryColorLight = generate(builder.secondaryColorLight)
    builder.secondaryColorDark = generate(builder.secondaryColorDark)
    builder.bgColor = generate(builder.bgColor)
    builder.surfaceColor = generate(builder.surfaceColor)
    builder.onPrimaryColor = generate(builder.onPrimaryColor)
    builder.onSecondaryColor = generate(builder.onSecondaryColor)
    builder.onSurfaceColor = generate(builder.onSurfaceColor)

    return builder
}

export const init = randomizeColors(makeBuilder())
