import * as Color from "color";
import { Generators as Gen } from "../rng";
const styleMap = {
    "--color-primary": (theme) => theme.color.primary.toStyle(),
    "--color-primaryLight": (theme) => theme.color.primaryLight.toStyle(),
    "--color-primaryDark": (theme) => theme.color.primaryDark.toStyle(),
    "--color-secondary": (theme) => theme.color.secondary.toStyle(),
    "--color-secondaryLight": (theme) => theme.color.secondaryLight.toStyle(),
    "--color-secondaryDark": (theme) => theme.color.secondaryDark.toStyle(),
    "--color-onPrimary": (theme) => theme.color.onPrimary.toStyle(),
    "--color-onSecondary": (theme) => theme.color.onSecondary.toStyle(),
    "--color-onSurface": (theme) => theme.color.onSurface.toStyle(),
    "--color-surface": (theme) => theme.color.surface.toStyle(),
    "--color-background": (theme) => theme.color.background.toStyle(),
    "--shadows-button": (theme) => theme.shadows.button,
    "--shadows-menu": (theme) => theme.shadows.menu,
    "--shadows-surface": (theme) => theme.shadows.surface,
    "--fonts-monospace": (theme) => theme.fonts.monospace,
    "--fonts-normal": (theme) => theme.fonts.normal,
};
export function updateDiff(prevTheme, nextTheme) {
    for (const propName in styleMap) {
        const toStyle = styleMap[propName];
        const prevValue = toStyle(prevTheme);
        const nextValue = toStyle(nextTheme);
        if (prevValue === nextValue) {
            continue;
        }
        document.body.style.setProperty(propName, nextValue);
    }
}
export function updateAll(theme) {
    for (const propName in styleMap) {
        const toStyle = styleMap[propName];
        document.body.style.setProperty(propName, toStyle(theme));
    }
}
const hsluvGen = (maxSat, luminance) => Gen.map3(Gen.float(0, 360), Gen.float(0, maxSat), Gen.always(luminance), (h, s, l) => new Color.Hsluv(h, s, l));
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
});
const shadowsGen = Gen.always({
    button: "0 1px 5px 0 rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.12)",
    surface: "0 1px 5px 0 rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.12)",
    menu: "2px 2px 2px rgba(0, 0, 0, 0.45), 0 5px 8px 0 rgba(0, 0, 0, 0.3)",
});
const fontsGen = Gen.always({
    normal: `"Helvetica", "Arial", sans-serif`,
    monospace: `"Courier New", Courier, monospace`,
});
export const random = Gen.object({
    color: colorsGen,
    shadows: shadowsGen,
    fonts: fontsGen,
});
