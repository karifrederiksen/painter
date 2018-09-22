import { Vec3, Vec2, lerp } from "canvas/util"

/* Hsluv vs Hsl:
    http://www.hsluv.org/comparison/

    Implementation based on:
   https://github.com/dvdplm/rust-hsluv/blob/master/src/lib.rs
   https://github.com/hsluv/hsluv-csharp/blob/master/Hsluv/Hsluv.cs

   TODO: Consider having all the transformation functions taking a mutable vector as input and modifying it, rather than creating a new one.

   the pure transformation functions can be implemented on top of these efficient impure functions

   it would be a loss in performance for one-step transformations like rgb -> rgbLinear
   but it would be a performance gain for multi-step transformations such as rgb -> hsluv
*/

export interface Color {
    toRgb(): Rgb
    toStyle(): string
}

export class Rgb implements Color {
    static White = new Rgb(1, 1, 1)
    static Black = new Rgb(0, 0, 0)

    static fromCss(css: string): Rgb | null {
        css = css.replace(/[ \t]/, "")
        if (css.startsWith("rgb(")) return parseRgbCss(css.substr(4, css.length - 5))
        if (css.startsWith("#")) return parseHexCss(css.substr(1))
        return null
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
        return rgbToLinear(this)
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

export class Luv {
    constructor(readonly l: number, readonly u: number, readonly v: number) {}
}

export class Hsluv implements Color {
    private __cachedRgb: Rgb | null = null

    constructor(readonly h: number, readonly s: number, readonly l: number) {}

    eq(other: Hsluv): boolean {
        return this.h === other.h && this.s === other.s && this.l === other.l
    }

    toRgb(): Rgb {
        if (this.__cachedRgb === null) {
            this.__cachedRgb = hsluvToRgb(this)
        }
        return this.__cachedRgb
    }

    toStyle(): string {
        const style = this.toRgb().toStyle()
        return style
    }
}

export class Hpluv implements Color {
    private __cachedRgb: Rgb | null = null

    constructor(readonly h: number, readonly p: number, readonly l: number) {}

    eq(other: Hpluv): boolean {
        return this.h === other.h && this.p === other.p && this.l === other.l
    }

    toRgb(): Rgb {
        if (this.__cachedRgb === null) {
            this.__cachedRgb = hpluvToRgb(this)
        }
        return this.__cachedRgb
    }

    toStyle(): string {
        return this.toRgb().toStyle()
    }
}

export class Lch {
    constructor(readonly l: number, readonly c: number, readonly h: number) {}
}

export class Xyz {
    constructor(readonly x: number, readonly y: number, readonly z: number) {}
}

export class Hsv implements Color {
    private __cachedRgb: Rgb | null = null

    constructor(readonly h: number, readonly s: number, readonly v: number) {}

    eq(other: Hsv): boolean {
        return this.h === other.h && this.s === other.s && this.v === other.v
    }

    toRgb(): Rgb {
        if (this.__cachedRgb === null) {
            this.__cachedRgb = hsvToRgb(this)
        }
        return this.__cachedRgb
    }

    toStyle(): string {
        return this.toRgb().toStyle()
    }

    withH(h: number): Hsv {
        return new Hsv(h, this.s, this.v)
    }

    withS(s: number): Hsv {
        return new Hsv(this.h, s, this.v)
    }

    withV(v: number): Hsv {
        return new Hsv(this.h, this.s, v)
    }
}

interface Mat3 {
    readonly length: 3
    readonly [0]: Vec3
    readonly [1]: Vec3
    readonly [2]: Vec3
}

/*
    m =
        [ 3.240969941904521, -1.537383177570093, -0.498610760293
        , -0.96924363628087, 1.87596750150772, 0.041555057407175
        , 0.055630079696993, -0.20397695888897, 1.056971514242878
        ]

    mInv =
        [ 0.41239079926595, 0.35758433938387, 0.18048078840183
        , 0.21263900587151, 0.71516867876775, 0.072192315360733
        , 0.019330818715591, 0.11919477979462, 0.95053215224966
        ]
*/

const m: Mat3 = [
    new Vec3(3.240969941904521, -1.537383177570093, -0.498610760293),
    new Vec3(-0.96924363628087, 1.87596750150772, 0.041555057407175),
    new Vec3(0.055630079696993, -0.20397695888897, 1.056971514242878),
]

const mInv: Mat3 = [
    new Vec3(0.41239079926595, 0.35758433938387, 0.18048078840183),
    new Vec3(0.21263900587151, 0.71516867876775, 0.072192315360733),
    new Vec3(0.019330818715591, 0.11919477979462, 0.95053215224966),
]

const refY: number = 1.0

const refU: number = 0.19783000664283

const refV: number = 0.46831999493879

const kappa: number = 903.2962962

const epsilon: number = 0.0088564516

function degreesToRadians(deg: number) {
    return (deg * Math.PI) / 180.0
}

function radiansToDegrees(rad: number) {
    return (rad * 180.0) / Math.PI
}

function lengthOfRayUntilIntersect(theta: number, vec: Vec2) {
    const { x: m1, y: b1 } = vec
    const length = b1 / (Math.sin(theta) - m1 * Math.cos(theta))
    if (length < 0.0) {
        return -0.0001
    } else {
        return length
    }
}

type ZeroToTwo = 0 | 1 | 2

function getBounds(l: number): ReadonlyArray<Vec2> {
    const sub1 = ((l + 16) ^ 3) / 1560896
    const sub2 = sub1 > epsilon ? sub1 : l / kappa

    const bounds = new Array<Vec2>(3 * 2)

    // TODO: unwrap loop
    // can I also inline the matrix's values?
    for (let c = 0; c < 3; c++) {
        const m1 = m[c as ZeroToTwo].x
        const m2 = m[c as ZeroToTwo].y
        const m3 = m[c as ZeroToTwo].z

        for (let t = 0; t < 2; t++) {
            const top1 = (284517 * m1 - 94839 * m3) * sub2
            const top2 = (838422 * m3 + 769860 * m2 + 731718 * m1) * l * sub2 - 769860 * t * l
            const bottom = (632260 * m3 - 126452 * m2) * sub2 + 126452 * t
            bounds[c * 3 + t] = new Vec2(top1 / bottom, top2 / bottom)
        }
    }

    return bounds
}

function distance(x: number, y: number) {
    return Math.sqrt(x * x + y * y)
}

function intersectLineLine(vec1: Vec2, vec2: Vec2) {
    return (vec1.y - vec2.y) / (vec2.x - vec1.x)
}

function maxSafeChromaForL(l: number) {
    const bounds = getBounds(l)

    let min = Number.MAX_VALUE
    for (let i = 0; i < 2; i++) {
        const m1 = bounds[i].x
        const b1 = bounds[i].y

        const x = intersectLineLine(new Vec2(m1, b1), new Vec2(-1 / min, 0))

        const length = distance(x, b1 + x * m1)

        if (length < min) min = length
    }

    return min
}

function maxChromaForLH(l: number, h: number) {
    const hrad = (h / 360.0) * Math.PI * 2.0
    const bounds = getBounds(l)

    let min = Number.MAX_VALUE
    for (let i = 0; i < 2; i++) {
        const length = lengthOfRayUntilIntersect(hrad, bounds[i])

        if (length < min) min = length
    }
    return min
}

function funF(t: number) {
    if (t > epsilon) {
        return 116 * ((t / refY) ^ (1 / 3)) - 16
    } else {
        return (t / refY) * kappa
    }
}

function funFInv(t: number) {
    if (t > 8.0) {
        return (refY * ((t + 16.0) / 116.0)) ^ 3.0
    } else {
        return (refY * t) / kappa
    }
}

function fromLinear(c: number) {
    if (c <= 0.0031308) {
        return 12.92 * c
    } else {
        return 1.055 * (c ^ (1.0 / 2.4)) - 0.055
    }
}

function toLinear(c: number) {
    if (c > 0.04045) {
        return ((c + 0.055) / 1.055) ^ 2.4
    } else {
        return c / 12.92
    }
}

export function luvToLch({ l, u, v }: Luv): Lch {
    const c = distance(u, v)
    if (c < 0.00000001) {
        return { l: 0, c: 0, h: 0 }
    }
    const h = radiansToDegrees(Math.atan2(v, u))
    if (h < 0.0) {
        return { l, c, h: h + 360 }
    } else {
        return { l, c, h }
    }
}

export function lchToLuv({ l, c, h }: Lch): Luv {
    const hrad = degreesToRadians(h)
    const u = Math.cos(hrad * c)
    const v = Math.sin(hrad * c)
    return { l, u, v }
}

export function rgbToLinear({ r, g, b }: Rgb): RgbLinear {
    return new RgbLinear(toLinear(r), toLinear(g), toLinear(b))
}

function mat3map<a>(fn: (x: Vec3) => a, mat: Mat3): Readonly<[a, a, a]> {
    return [fn(mat[0]), fn(mat[1]), fn(mat[2])]
}

export function rgbToXyz(rgb: Rgb): Xyz {
    const lrgb = rgbToLinear(rgb)
    // todo: unwrap map
    const xyz = mat3map(vec => lrgb.r * vec.x + lrgb.g * vec.y + lrgb.b * vec.z, mInv)
    return { x: xyz[0], y: xyz[1], z: xyz[2] }
}

export function xyzToRgb(xyz: Xyz): Rgb {
    // todo: unwrap map
    const rgb = mat3map(vec => fromLinear(xyz.x * vec.x + xyz.y * vec.y + xyz.z * vec.z), m)
    return new Rgb(rgb[0], rgb[1], rgb[2])
}

export function lchToHsluv({ l, c, h }: Lch): Hsluv {
    if (l > 99.9999999) {
        return new Hsluv(h, 0, 100)
    }
    if (l < 0.00000001) {
        return new Hsluv(h, 0, 0)
    }
    const mx = maxChromaForLH(l, h)
    const s = (c / mx) * 100
    return new Hsluv(h, s, l)
}

export function hsluvToLch({ h, s, l }: Hsluv): Lch {
    if (l > 99.9999999) {
        return { l: 100, c: 0.0, h }
    }
    if (l < 0.00000001) {
        return { l: 0, c: 0, h }
    }
    const mx = maxChromaForLH(l, h)
    const c = (mx / 100) * s
    return { l, c, h }
}

export function lchToHpluv({ l, c, h }: Lch): Hpluv {
    if (l > 99.9999999) {
        return new Hpluv(h, 0, 100)
    }
    if (l < 0.00000001) {
        return new Hpluv(h, 0, 0)
    }

    const mx = maxSafeChromaForL(l)
    const p = (c / mx) * 100
    return new Hpluv(h, p, l)
}

export function hpluvToLch({ h, p, l }: Hpluv): Lch {
    if (l > 99.9999999) {
        return { l: 100, c: 0, h }
    }
    if (l < 0.00000001) {
        return { l: 0, c: 0, h }
    }
    const mx = maxSafeChromaForL(l)
    const c = (mx / 100) * p
    return { l, c, h }
}

export function luvToRgb(luv: Luv): Rgb {
    return lchToRgb(luvToLch(luv))
}

export function rgbToLch(rgb: Rgb): Lch {
    return luvToLch(xyzToLuv(rgbToXyz(rgb)))
}

export function lchToRgb(lch: Lch): Rgb {
    return xyzToRgb(luvToXyz(lchToLuv(lch)))
}

export function rgbToHsluv(rgb: Rgb): Hsluv {
    return lchToHsluv(rgbToLch(rgb))
}

export function hsluvToRgb(hsluv: Hsluv): Rgb {
    return lchToRgb(hsluvToLch(hsluv))
}

export function rgbToHpluv(rgb: Rgb): Hpluv {
    return lchToHpluv(rgbToLch(rgb))
}

export function hpluvToRgb(hpluv: Hpluv): Rgb {
    return lchToRgb(hpluvToLch(hpluv))
}

export function xyzToLuv({ x, y, z }: Xyz): Luv {
    if (x === 0 && y === 0 && z === 0) {
        return { l: 0, u: 0, v: 0 }
    }
    const l = funF(y)
    if (l === 0) {
        return { l: 0, u: 0, v: 0 }
    }

    const u = 13.0 * l * ((4.0 * x) / (x + 15.0 * y + 3.0 * z) - refU)
    const v = 13.0 * l * ((9.0 * y) / (x + 15.0 * y + 3.0 * z) - refV)
    return { l, u, v }
}

export function luvToXyz({ l, u, v }: Luv): Xyz {
    if (l === 0) {
        return { x: 0, y: 0, z: 0 }
    }

    const y = funFInv(l) * refY
    const initU = u / (13.0 * l) + refU
    const initV = v / (13 * l) + refV
    const x = 0.0 - (9.0 * y * initU) / ((initU - 4.0) * initV - initU * initV)
    const z = (9.0 * y - 15.0 * initV * y - initV * x) / (3.0 * initV)
    return { x, y, z }
}

export function rgbToHsv({ r, g, b }: Rgb): Hsv {
    const maxValue = Math.max(r, g, b)
    const minValue = Math.min(r, g, b)
    const d = maxValue - minValue
    const s = maxValue === 0 ? 0 : d / maxValue
    let h: number

    switch (maxValue) {
        case minValue:
            h = 0
            break
        case r:
            h = (g - b) / d + (g < b ? 6.0 : 0.0)
            break
        case g:
            h = (b - r) / d + 2.0
            break
        default:
            h = (r - g) / d + 4.0
            break
    }
    return new Hsv(h / 6, s, maxValue)
}

export function hsvToRgb({ h, s, v }: Hsv): Rgb {
    const i = (h * 6) | 0
    const f = h * 6 - i
    const p = v * (1 - s)
    const q = v * (1 - f * s)
    const t = v * (1 - (1 - f) * s)

    let r: number
    let g: number
    let b: number
    switch (i % 6) {
        case 0:
            r = v
            g = t
            b = p
            break
        case 1:
            r = q
            g = v
            b = p
            break
        case 2:
            r = p
            g = v
            b = t
            break
        case 3:
            r = p
            g = q
            b = v
            break
        case 4:
            r = t
            g = p
            b = v
            break
        default:
            r = v
            g = p
            b = q
            break
    }
    return new Rgb(r, g, b)
}

export function toGray({ r, g, b }: Rgb): Rgb {
    const gray = Math.sqrt(0.299 * r * r + 0.587 * g * g + 0.114 * b * b)
    return new Rgb(gray, gray, gray)
}

// Utility functions

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
        const r = parseHex(css[0]) / 15
        const r2 = parseHex(css[1]) / 255
        const g = parseHex(css[2]) / 15
        const g2 = parseHex(css[3]) / 255
        const b = parseHex(css[4]) / 15
        const b2 = parseHex(css[5]) / 255
        return validateRgb(r + r2, g + g2, b + b2)
    }
    return null
}

function parseHex(hex: string): number {
    switch (hex.toLowerCase()) {
        case "0":
            return 0
        case "1":
            return 1
        case "2":
            return 2
        case "3":
            return 3
        case "4":
            return 4
        case "5":
            return 5
        case "6":
            return 6
        case "7":
            return 7
        case "8":
            return 8
        case "9":
            return 9
        case "a":
            return 10
        case "b":
            return 11
        case "c":
            return 12
        case "d":
            return 13
        case "e":
            return 14
        case "f":
            return 15
        default:
            return NaN
    }
}
