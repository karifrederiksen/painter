import { Vec2 } from "./vec2";
export * as Store from "./store";
export * as Decode from "./decode";
export * from "./maybe";
export * from "./result";
export * from "./vec2";
export * from "./vec3";
export * from "./vec4";
export * as FrameStream from "./frameStream";
export * as PerfTracker from "./perfTracker";
export * as CanvasPool from "./canvasPool";
export * as Debug from "./debug";
export * as Bloomfilter from "./bloomFilter";
export function tagged(tag, val) {
    return { tag, val };
}
export class Lazy {
    __fn;
    __isSet = false;
    __value = null;
    constructor(__fn) {
        this.__fn = __fn;
    }
    force() {
        if (!this.__isSet) {
            this.__value = this.__fn();
            this.__isSet = true;
        }
        return this.__value;
    }
}
export class SetOnce {
    __isSet = false;
    __value = null;
    set(value) {
        if (this.__isSet)
            throw new Error("Attempted to re-set a SetOnce");
        this.__value = value;
        this.__isSet = true;
    }
    get value() {
        if (!this.__isSet)
            throw new Error("Attempted to get the value of a SetOnce before it was set");
        return this.__value;
    }
}
export function orDefault(value, def) {
    return value !== undefined ? value : def;
}
export function range(start, end) {
    const length = end - start + 1;
    const arr = new Array(length);
    for (let i = 0; i < length; i++) {
        arr[i] = start + i;
    }
    return arr;
}
export function distance(x0, y0, x1, y1) {
    const x = x1 - x0;
    const y = y1 - y0;
    return Math.sqrt(x * x + y * y);
}
export function lerp(pct, start, end) {
    return start + (end - start) * pct;
}
export function smoothstep(x) {
    return x * x * (3 - x + x);
}
export function clamp(value, min, max) {
    return value < min ? min : value > max ? max : value;
}
export function delay(ms) {
    return new Promise((res) => {
        setTimeout(res, ms);
    });
}
export function stringToInt(text) {
    const x = parseInt(text, 10);
    if (isNaN(x)) {
        return null;
    }
    return x;
}
export function stringToFloat(text) {
    const x = parseFloat(text);
    if (isNaN(x)) {
        return null;
    }
    return x;
}
export function arrUpdate(array, index, value) {
    const newArr = array.slice();
    newArr.splice(index, 1, value);
    return newArr;
}
export function arrInsert(array, index, value) {
    const newArr = array.slice();
    newArr.splice(index, 0, value);
    return newArr;
}
export function arrRemove(array, index) {
    const newArr = array.slice();
    newArr.splice(index, 1);
    return newArr;
}
export var ColorMode;
(function (ColorMode) {
    ColorMode[ColorMode["Hsv"] = 0] = "Hsv";
    ColorMode[ColorMode["Hsluv"] = 1] = "Hsluv";
})(ColorMode || (ColorMode = {}));
export function colorModeToString(type) {
    switch (type) {
        case ColorMode.Hsv:
            return "Hsv";
        case ColorMode.Hsluv:
            return "Hsluv";
    }
}
export const Degrees = {
    fromNumber(x) {
        return x;
    },
    toNumber(x) {
        return x;
    },
};
export const Turns = {
    fromNumber(x) {
        return x;
    },
    toNumber(x) {
        return x;
    },
};
export function turnsToDegrees(turns) {
    return Degrees.fromNumber(Turns.toNumber(turns) * 360);
}
export function turnsFromDegrees(degrees) {
    return Turns.fromNumber(Degrees.toNumber(degrees) / 360);
}
export function turn(turns, center, point) {
    const radians = turns * 360 * (Math.PI / 180);
    const x = Math.cos(radians) * (point.x - center.x) -
        Math.sin(radians) * (point.y - center.y) +
        center.x;
    const y = Math.sin(radians) * (point.x - center.x) +
        Math.cos(radians) * (point.y - center.y) +
        center.y;
    return new Vec2(x, y);
}
export const Pct = {
    fromNumber(x) {
        return x;
    },
    toNumber(pct) {
        return pct;
    },
};
export const Px = {
    fromNumber(x) {
        return x;
    },
    toNumber(px) {
        return px;
    },
};
export const Ms = {
    fromNumber(x) {
        return x;
    },
    toNumber(px) {
        return px;
    },
};
export class Position {
    x;
    y;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
export class Size {
    width;
    height;
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }
}
