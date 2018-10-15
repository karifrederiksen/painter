import * as Color from "./index"
import { Decode } from "../util"

describe("Color transforms work according to the sample data", () => {
    const threeNumbers = Decode.tuple3(Decode.number, Decode.number, Decode.number)

    const colorSample = Decode.object({
        rgb: Decode.map(threeNumbers, ([r, g, b]) => new Color.Rgb(r, g, b)),
        lch: Decode.map(threeNumbers, ([l, c, h]) => new Color.Lch(l, c, h)),
        luv: Decode.map(threeNumbers, ([l, u, v]) => new Color.Luv(l, u, v)),
        xyz: Decode.map(threeNumbers, ([x, y, z]) => new Color.Xyz(x, y, z)),
        hpluv: Decode.map(threeNumbers, ([h, p, l]) => new Color.Hpluv(h, p, l)),
        hsluv: Decode.map(threeNumbers, ([h, s, l]) => new Color.Hsluv(h, s, l)),
    })

    /* tslint:disable-next-line */
    const colorSamplesResults = Decode.dictionary(colorSample)(require("./color-samples.json"))

    test("All samples are successfully extracted from the json blob", () => {
        expect(colorSamplesResults.isOk).toBe(true)
    })

    const roughEq = (l: number, r: number) => {
        const marginOfError = 0.00001
        const d = l - r
        return d < marginOfError && d > -marginOfError
    }

    const rgbRoughEq = (l: Color.Rgb, r: Color.Rgb) =>
        roughEq(l.r, r.r) && roughEq(l.g, r.g) && roughEq(l.b, r.b)

    const samplesRoughEq = (l: ReadonlyArray<Color.Rgb>, r: ReadonlyArray<Color.Rgb>) => {
        if (l.length !== r.length) return false

        for (let i = 0; i < l.length; i++) {
            if (!rgbRoughEq(l[i], r[i])) {
                return false
            }
        }
        return true
    }

    const colorSamples = colorSamplesResults.value!
    const keys = Object.keys(colorSamples)
    const rgbSamples = keys.map(key => colorSamples[key].rgb)

    test("Hex samples transform to the correct RGB", () => {
        const hexSamplesRaw = keys.map(Color.Rgb.fromCss)
        expect(hexSamplesRaw.every(x => x !== null)).toBe(true)

        const hexSamples = hexSamplesRaw.map(x => x!)
        expect(samplesRoughEq(rgbSamples, hexSamples)).toBe(true)
    })

    test("XYZ samples transform to the correct RGB", () => {
        const xyzSamples = keys.map(key => Color.xyzToRgb(colorSamples[key].xyz))
        expect(samplesRoughEq(rgbSamples, xyzSamples)).toBe(true)
    })

    test("LUV samples transform to the correct RGB", () => {
        const luvSamples = keys.map(key => Color.luvToRgb(colorSamples[key].luv))
        expect(samplesRoughEq(rgbSamples, luvSamples)).toBe(true)
    })

    test("LCH samples transform to the correct RGB", () => {
        const lchSamples = keys.map(key => Color.lchToRgb(colorSamples[key].lch))
        expect(samplesRoughEq(rgbSamples, lchSamples)).toBe(true)
    })

    test("HSLuv samples transform to the correct RGB", () => {
        const hsluvSamples = keys.map(key => Color.hsluvToRgb(colorSamples[key].hsluv))
        expect(samplesRoughEq(rgbSamples, hsluvSamples)).toBe(true)
    })

    test("HPLuv samples transform to the correct RGB", () => {
        const hpluvSamples = keys.map(key => Color.hpluvToRgb(colorSamples[key].hpluv))
        expect(samplesRoughEq(rgbSamples, hpluvSamples)).toBe(true)
    })
})
