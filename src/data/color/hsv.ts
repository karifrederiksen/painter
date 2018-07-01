import { Rgb, Color } from "./rgb"
import { SetOnce } from ".."

export class Hsv implements Color {
    static make(h: number, s: number, v: number): Hsv {
        return new Hsv(h, s, v)
    }

    private memoedRgb: Rgb | null

    private constructor(readonly h: number, readonly s: number, readonly v: number) {
        this.memoedRgb = null
    }

    with(
        args: Readonly<{
            h?: number
            s?: number
            v?: number
        }>
    ): Hsv {
        return new Hsv(
            args.h !== undefined ? args.h : this.h,
            args.s !== undefined ? args.s : this.s,
            args.v !== undefined ? args.v : this.v
        )
    }

    mapHue(fn: (val: number) => number): Hsv {
        return new Hsv(fn(this.h), this.s, this.v)
    }

    mapSaturation(fn: (val: number) => number): Hsv {
        return new Hsv(this.h, fn(this.s), this.v)
    }

    mapValue(fn: (val: number) => number): Hsv {
        return new Hsv(this.h, this.s, fn(this.v))
    }

    eq(other: Hsv): boolean {
        return this.h === other.h && this.s === other.s && this.v === other.v
    }

    toRgb(): Rgb {
        if (this.memoedRgb !== null) return this.memoedRgb

        const { h, s, v } = this
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
        const rgb = Rgb.makeFromLinear(r, g, b)
        this.memoedRgb = rgb
        return rgb
    }

    toString(): string {
        return "Hsv( h: " + this.h + ", s: " + this.s + ", v: " + this.v + " )"
    }
}
