import { lerp } from "../util"

export interface IColor {
    toRgb(): Rgb
    toStyle(): string
}

export class Rgb implements IColor {
    static White = new Rgb(1, 1, 1)
    static Black = new Rgb(0, 0, 0)

    static fromCss(css: string): Rgb | null {
        css = css.replace(/[ \t]/, "")
        if (css.startsWith("rgb(")) return parseRgbCss(css.substr(4, css.length - 5))
        if (css.startsWith("#")) {
            return parseHexCss(css.substr(1))
        }
        return parseHexCss(css)
    }

    constructor(readonly r: number, readonly g: number, readonly b: number) {}

    eq(other: Rgb): boolean {
        return this.r === other.r && this.g === other.g && this.b === other.b
    }

    toRgb(): Rgb {
        return this
    }

    toStyle(): string {
        return `rgb(${floatToByte(this.r)},${floatToByte(this.g)},${floatToByte(this.b)})`
    }

    toLinear(): RgbLinear {
        return new RgbLinear(toLinear(this.r), toLinear(this.g), toLinear(this.b))
    }
}

export class RgbLinear {
    static White = new RgbLinear(1, 1, 1)
    static Black = new RgbLinear(0, 0, 0)

    constructor(readonly r: number, readonly g: number, readonly b: number) {}

    eq(other: RgbLinear): boolean {
        return this.r === other.r && this.g === other.g && this.b === other.b
    }

    mix(pct: number, other: RgbLinear): RgbLinear {
        return new RgbLinear(
            lerp(pct, this.r, other.r),
            lerp(pct, this.g, other.g),
            lerp(pct, this.b, other.b)
        )
    }
}

function toLinear(c: number) {
    if (c > 0.04045) {
        return ((c + 0.055) / 1.055) ** 2.4
    } else {
        return c / 12.92
    }
}

function floatToByte(x: number): number {
    return (x * 255.9999999) | 0
}

function validateRgb(r: number, g: number, b: number): Rgb | null {
    if (isNaN(r) || !isFinite(r)) return null
    if (isNaN(g) || !isFinite(g)) return null
    if (isNaN(b) || !isFinite(b)) return null

    return new Rgb(r, g, b)
}

function parseRgbCss(css: string): Rgb | null {
    const vals = css.split(",")
    if (vals.length !== 3) return null

    const r = Number.parseFloat(vals[0]) / 255
    const g = Number.parseFloat(vals[1]) / 255
    const b = Number.parseFloat(vals[2]) / 255

    return validateRgb(r, g, b)
}

function parseHexCss(css: string): Rgb | null {
    if (css.length === 3) {
        const r = parseHex(css[0]) / 15
        const g = parseHex(css[1]) / 15
        const b = parseHex(css[2]) / 15
        return validateRgb(r, g, b)
    }
    if (css.length === 6) {
        const r = parseHexPair(css[0], css[1])
        const g = parseHexPair(css[2], css[3])
        const b = parseHexPair(css[4], css[5])
        return validateRgb(r, g, b)
    }
    return null
}

function parseHexPair(l: string, r: string): number {
    return (parseHex(l) * 16 + parseHex(r)) / 255
}

function parseHex(hex: string): number {
    const lcHex = hex.toLowerCase()
    return lcHex in hexMap ? hexMap[lcHex] : NaN
}

const hexMap: { readonly [key: string]: number } = {
    "0": 0,
    "1": 1,
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 7,
    "8": 8,
    "9": 9,
    a: 10,
    b: 11,
    c: 12,
    d: 13,
    e: 14,
    f: 15,
}
