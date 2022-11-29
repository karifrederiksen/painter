import * as Brush from "./brush";
import * as Camera from "./camera";
import { Blend } from "../webgl";
import { tagged } from "../util";
export class Sender {
    sendMessage;
    brush;
    eraser;
    camera;
    constructor(sendMessage) {
        this.sendMessage = sendMessage;
        this.brush = new Brush.Sender((msg) => sendMessage(tagged("BrushMsg", msg)));
        this.eraser = new Brush.Sender((msg) => sendMessage(tagged("EraserMsg", msg)));
        this.camera = new Camera.Sender((msg) => sendMessage(tagged("CameraMsg", msg)));
    }
    setTool = (type) => this.sendMessage(tagged("SetToolMsg", type));
}
export const init = {
    brush: Brush.init,
    eraser: Brush.init,
    camera: Camera.init,
    current: "Brush",
};
export function update(tool, msg) {
    switch (msg.tag) {
        case "SetToolMsg":
            switch (msg.val) {
                case "Brush":
                    return { ...tool, current: "Brush" };
                case "Eraser":
                    return { ...tool, current: "Eraser" };
                case "Move":
                    return { ...tool, current: "Move" };
                case "Zoom":
                    return { ...tool, current: "Zoom" };
                case "Rotate":
                    return { ...tool, current: "Rotate" };
                default: {
                    const never = msg;
                    throw { "unexpected tool type: ": msg };
                }
            }
        case "BrushMsg":
            return { ...tool, brush: Brush.update(tool.brush, msg.val) };
        case "EraserMsg":
            return { ...tool, eraser: Brush.update(tool.eraser, msg.val) };
        case "CameraMsg":
            return { ...tool, camera: Camera.update(tool.camera, msg.val) };
        default: {
            const never = msg;
            throw { "unexpected msg": msg };
        }
    }
}
export function onClick(tool, ephemeral_, pointer) {
    const ephemeral = syncEphemeral(tool, ephemeral_);
    switch (ephemeral.tag) {
        case "Brush": {
            const [value, brushPoint] = Brush.onClick(tool.brush, tool.camera, pointer);
            return [tool, tagged("Brush", value), [brushPoint]];
        }
        case "Eraser": {
            const [value, brushPoint] = Brush.onClick(tool.eraser, tool.camera, pointer);
            return [tool, tagged("Eraser", value), [brushPoint]];
        }
        case "Move": {
            if (ephemeral.val !== null) {
                return [tool, ephemeral, []];
            }
            const dragState = {
                clickPoint: pointer,
                prevPoint: pointer,
                originalScale: tool.camera.zoomPct,
            };
            const camera = Camera.moveUpdate(tool.camera, dragState, pointer);
            return [{ ...tool, camera }, tagged("Move", dragState), []];
        }
        case "Zoom": {
            if (ephemeral.val !== null) {
                return [tool, ephemeral, []];
            }
            const dragState = {
                clickPoint: pointer,
                prevPoint: pointer,
                originalScale: tool.camera.zoomPct,
            };
            const camera = Camera.zoomUpdate(tool.camera, dragState, pointer);
            return [{ ...tool, camera }, tagged("Zoom", dragState), []];
        }
        case "Rotate": {
            if (ephemeral.val !== null) {
                return [tool, ephemeral, []];
            }
            const dragState = {
                clickPoint: pointer,
                prevPoint: pointer,
                originalScale: tool.camera.zoomPct,
            };
            const camera = Camera.rotateUpdate(tool.camera, dragState, pointer);
            return [{ ...tool, camera }, tagged("Rotate", dragState), []];
        }
        default: {
            const never = ephemeral;
            throw { "unxpected state": ephemeral };
        }
    }
}
export function onDrag(tool, ephemeral_, pointers) {
    const ephemeral = syncEphemeral(tool, ephemeral_);
    switch (ephemeral.tag) {
        case "Brush": {
            const [value, brushPoints] = Brush.onDrag(tool.brush, tool.camera, ephemeral.val, pointers);
            return [tool, tagged("Brush", value), brushPoints];
        }
        case "Eraser": {
            const [value, brushPoints] = Brush.onDrag(tool.eraser, tool.camera, ephemeral.val, pointers);
            return [tool, tagged("Eraser", value), brushPoints];
        }
        case "Move": {
            if (ephemeral.val === null) {
                return [tool, ephemeral, []];
            }
            const pointer = pointers[pointers.length - 1];
            const camera = Camera.moveUpdate(tool.camera, ephemeral.val, pointer);
            const dragState = {
                clickPoint: ephemeral.val.clickPoint,
                prevPoint: pointer,
                originalScale: ephemeral.val.originalScale,
            };
            return [{ ...tool, camera }, tagged("Move", dragState), []];
        }
        case "Zoom": {
            if (ephemeral.val === null) {
                return [tool, ephemeral, []];
            }
            const pointer = pointers[pointers.length - 1];
            const camera = Camera.zoomUpdate(tool.camera, ephemeral.val, pointer);
            const dragState = {
                clickPoint: ephemeral.val.clickPoint,
                prevPoint: pointer,
                originalScale: ephemeral.val.originalScale,
            };
            return [{ ...tool, camera }, tagged("Zoom", dragState), []];
        }
        case "Rotate": {
            if (ephemeral.val === null) {
                return [tool, ephemeral, []];
            }
            const pointer = pointers[pointers.length - 1];
            const camera = Camera.rotateUpdate(tool.camera, ephemeral.val, pointer);
            const dragState = {
                clickPoint: ephemeral.val.clickPoint,
                prevPoint: pointer,
                originalScale: ephemeral.val.originalScale,
            };
            return [{ ...tool, camera }, tagged("Rotate", dragState), []];
        }
        default: {
            const never = ephemeral;
            throw { "unxpected state": ephemeral };
        }
    }
}
export function onRelease(tool, ephemeral_, pointer) {
    const ephemeral = syncEphemeral(tool, ephemeral_);
    switch (ephemeral.tag) {
        case "Brush": {
            const [value, brushPoints] = Brush.onRelease();
            return [tool, tagged("Brush", value), brushPoints];
        }
        case "Eraser": {
            const [value, brushPoints] = Brush.onRelease();
            return [tool, tagged("Eraser", value), brushPoints];
        }
        case "Move": {
            if (ephemeral.val === null) {
                return [tool, ephemeral, []];
            }
            const camera = Camera.moveUpdate(tool.camera, ephemeral.val, pointer);
            return [{ ...tool, camera }, tagged("Move", null), []];
        }
        case "Zoom": {
            if (ephemeral.val === null) {
                return [tool, ephemeral, []];
            }
            const camera = Camera.zoomUpdate(tool.camera, ephemeral.val, pointer);
            return [{ ...tool, camera }, tagged("Zoom", null), []];
        }
        case "Rotate": {
            if (ephemeral.val === null) {
                return [tool, ephemeral, []];
            }
            const camera = Camera.rotateUpdate(tool.camera, ephemeral.val, pointer);
            return [{ ...tool, camera }, tagged("Rotate", null), []];
        }
        default: {
            const never = ephemeral;
            throw { "unxpected state": ephemeral };
        }
    }
}
export function onFrame(tool, state, currentTime) {
    const ephemeral = syncEphemeral(tool, state);
    switch (ephemeral.tag) {
        case "Brush": {
            const [value, brushPoints] = Brush.onFrame(tool.brush, ephemeral.val, currentTime);
            if (value === ephemeral.val && brushPoints.length === 0) {
                return [ephemeral, brushPoints];
            }
            else {
                return [tagged("Brush", value), brushPoints];
            }
        }
        case "Eraser": {
            const [value, brushPoints] = Brush.onFrame(tool.eraser, ephemeral.val, currentTime);
            if (value === ephemeral.val && brushPoints.length === 0) {
                return [ephemeral, brushPoints];
            }
            else {
                return [tagged("Eraser", value), brushPoints];
            }
        }
        default:
            return [ephemeral, []];
    }
}
export var EphemeralStateType;
(function (EphemeralStateType) {
    EphemeralStateType[EphemeralStateType["BrushState"] = 0] = "BrushState";
    EphemeralStateType[EphemeralStateType["EraserState"] = 1] = "EraserState";
    EphemeralStateType[EphemeralStateType["MoveState"] = 2] = "MoveState";
    EphemeralStateType[EphemeralStateType["ZoomState"] = 3] = "ZoomState";
    EphemeralStateType[EphemeralStateType["RotateState"] = 4] = "RotateState";
})(EphemeralStateType || (EphemeralStateType = {}));
export function initEphemeral() {
    return tagged("Brush", Brush.initTempState());
}
function syncEphemeral(tool, ephemeral) {
    if (ephemeral.tag === tool.current) {
        return ephemeral;
    }
    switch (tool.current) {
        case "Brush":
            return tagged("Brush", Brush.initTempState());
        case "Eraser":
            return tagged("Eraser", Brush.initTempState());
        case "Move":
            return tagged("Move", null);
        case "Rotate":
            return tagged("Rotate", null);
        case "Zoom":
            return tagged("Zoom", null);
        default: {
            const never = tool.current;
            throw { "Unknown tool type: ": tool.current };
        }
    }
}
export function getBlendMode(tool) {
    switch (tool.current) {
        case "Brush":
            return Blend.Mode.Normal;
        case "Eraser":
            return Blend.Mode.Erase;
        default:
            return Blend.Mode.Normal;
    }
}
export function getSoftness(tool) {
    switch (tool.current) {
        case "Brush":
            return tool.brush.softness;
        case "Eraser":
            return tool.eraser.softness;
        default:
            return 0;
    }
}
