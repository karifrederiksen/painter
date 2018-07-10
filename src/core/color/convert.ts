import { Rgb, Color } from "./rgb"
import { Hsv } from "./hsv"
import { toLinear, fromLinear } from "./utility"

export function toGrayScalar(color: Color): number {
    const rgb = color.toRgb()
    const r = toLinear(rgb.r)
    const g = toLinear(rgb.g)
    const b = toLinear(rgb.b)

    return fromLinear(Math.sqrt(0.299 * r * r + 0.587 * g * g + 0.114 * b * b))
}

export function toGray(color: Color): Rgb {
    const gray = toGrayScalar(color)
    return Rgb.make(gray, gray, gray)
}

export function toHsv(color: Color): Hsv {
    const { r, g, b } = color.toRgb()

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const d = max - min
    const s = max === 0 ? 0 : d / max
    const v = max

    let h: number
    switch (max) {
        case min:
            h = 0
            break
        case r:
            h = (g - b) / d + (g < b ? 6 : 0)
            break
        case g:
            h = (b - r) / d + 2
            break
        default:
            h = (r - g) / d + 4
            break
    }
    h /= 6
    return Hsv.make(h, s, v)
}
