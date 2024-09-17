/* eslint-disable @typescript-eslint/no-explicit-any */
function toNumber(x) {
    return x;
}
function fromNumber(x) {
    return x;
}
/* eslint-enable */
export const Modifiers = {
    None: fromNumber(0),
    create(shift, alt, ctrl) {
        let x = 0;
        if (shift) {
            x += 1;
        }
        if (alt) {
            x += 2;
        }
        if (ctrl) {
            x += 4;
        }
        return fromNumber(x);
    },
    hasModifiers(self, other) {
        return (toNumber(self) & toNumber(other)) > 0;
    },
    hasShift(x) {
        return (toNumber(x) & 1) > 0;
    },
    hasAlt(x) {
        return (toNumber(x) & 2) > 0;
    },
    hasCtrl(x) {
        return (toNumber(x) & 4) > 0;
    },
    toString(x) {
        return toNumber(x).toString();
    },
    fromString(text) {
        const x = parseInt(text, 10);
        return isNaN(x) ? null : fromNumber(x);
    },
};
const ModifierKeyCodes = [/*Shift*/ 16, /*Ctrl*/ 17, /*Alt*/ 18, /*OS*/ 91];
export const KeyInput = {
    toString(x) {
        return Modifiers.toString(x.modifiers) + "|" + x.code;
    },
    createKey(args) {
        return KeyInput.toString({
            code: args.code,
            modifiers: Modifiers.create(!!args.shift, !!args.alt, !!args.ctrl),
        });
    },
    fromString(text) {
        const parts = text.split("|");
        if (parts.length !== 2) {
            return null;
        }
        const code = parts[1];
        const modifiers = Modifiers.fromString(parts[0]);
        if (modifiers === null) {
            return null;
        }
        return { code, modifiers };
    },
    fromKeyboardEvent(ev) {
        console.log(ev);
        return {
            code: ev.code,
            modifiers: Modifiers.create(ev.shiftKey, ev.altKey, ev.ctrlKey),
        };
    },
};
export function handleKeyCode(system, input) {
    const key = KeyInput.toString(input);
    const msgs = [];
    let layers = system.layers;
    while (layers.isNonEmpty()) {
        if (key in layers.head) {
            const binding = layers.head[key];
            msgs.push(binding.msg);
            if (!binding.passive) {
                break;
            }
        }
        layers = layers.tail;
    }
    return msgs;
}
export function listen(args) {
    function handle(ev) {
        args.handle(KeyInput.fromKeyboardEvent(ev));
    }
    window.addEventListener("keydown", handle);
    return () => {
        window.removeEventListener("keydown", handle);
    };
}
