import * as decode from "../decode"
import * as color from "../color"

describe("Color transforms work according to the sample data", () => {
    const threeNumbers = decode.tuple3(decode.number, decode.number, decode.number)

    const colorSample = decode.object({
        rgb: decode.map(threeNumbers, ([r, g, b]) => new color.Rgb(r, g, b)),
        lch: decode.map(threeNumbers, ([l, c, h]) => new color.Lch(l, c, h)),
        luv: decode.map(threeNumbers, ([l, u, v]) => new color.Luv(l, u, v)),
        xyz: decode.map(threeNumbers, ([x, y, z]) => new color.Xyz(x, y, z)),
        hpluv: decode.map(threeNumbers, ([h, p, l]) => new color.Hpluv(h, p, l)),
        hsluv: decode.map(threeNumbers, ([h, s, l]) => new color.Hsluv(h, s, l)),
    })

    /* tslint:disable-next-line */
    const colorSamplesResults = decode.dictionary(colorSample)(require("./color-samples.json"))

    test("All samples are successfully extracted from the json blob", () => {
        expect(colorSamplesResults.isOk).toBe(true)
    })

    const roughEq = (l: number, r: number) => {
        const marginOfError = 0.00001
        const d = l - r
        return d < marginOfError && d > -marginOfError
    }

    const rgbRoughEq = (l: color.Rgb, r: color.Rgb) =>
        roughEq(l.r, r.r) && roughEq(l.g, r.g) && roughEq(l.b, r.b)

    const samplesRoughEq = (l: ReadonlyArray<color.Rgb>, r: ReadonlyArray<color.Rgb>) => {
        if (l.length !== r.length) return false

        for (let i = 0; i < l.length; i++) {
            if (!rgbRoughEq(l[i], r[i])) {
                //console.log("!", l[i], r[i])
                return false
            }
        }
        return true
    }

    const colorSamples = colorSamplesResults.value!
    const keys = Object.keys(colorSamples)
    const rgbSamples = keys.map(key => colorSamples[key].rgb)

    test("Hex samples transform to the correct RGB", () => {
        const hexSamplesRaw = keys.map(color.Rgb.fromCss)
        expect(hexSamplesRaw.every(x => x !== null)).toBe(true)

        const hexSamples = hexSamplesRaw.map(x => x!)
        expect(samplesRoughEq(rgbSamples, hexSamples)).toBe(true)
    })

    test("XYZ samples transform to the correct RGB", () => {
        const xyzSamples = keys.map(key => color.xyzToRgb(colorSamples[key].xyz))
        expect(samplesRoughEq(rgbSamples, xyzSamples)).toBe(true)
    })

    test("LUV samples transform to the correct RGB", () => {
        const luvSamples = keys.map(key => color.luvToRgb(colorSamples[key].luv))
        expect(samplesRoughEq(rgbSamples, luvSamples)).toBe(true)
    })

    test("LCH samples transform to the correct RGB", () => {
        const lchSamples = keys.map(key => color.lchToRgb(colorSamples[key].lch))
        expect(samplesRoughEq(rgbSamples, lchSamples)).toBe(true)
    })

    test("HSLuv samples transform to the correct RGB", () => {
        const hsluvSamples = keys.map(key => color.hsluvToRgb(colorSamples[key].hsluv))
        expect(samplesRoughEq(rgbSamples, hsluvSamples)).toBe(true)
    })

    test("HPLuv samples transform to the correct RGB", () => {
        const hpluvSamples = keys.map(key => color.hpluvToRgb(colorSamples[key].hpluv))
        expect(samplesRoughEq(rgbSamples, hpluvSamples)).toBe(true)
    })
})
