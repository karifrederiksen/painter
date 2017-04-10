export class Setting {
    constructor(id, value, callbacks = []) {
        this.id = id;
        this.value = value;
        this.callbacks = callbacks;
    }
}
const _settings = {};
export function setValue(id, value) {
    let setting = _settings[id];
    if (setting == null) {
        setting = new Setting(id, value);
        _settings[id] = setting;
    }
    else {
        setting.value = value;
    }
    broadcast(setting);
}
export function getValue(id) {
    return _settings[id] != null ? _settings[id].value : null;
}
export function subscribe(id, callback) {
    let setting = _settings[id];
    if (setting == null) {
        setting = new Setting(id, null);
        _settings[id] = setting;
    }
    setting.callbacks.push(callback);
}
export function unsubscribe(id, callback) {
    const idx = _settings[id].callbacks.indexOf(callback);
    if (idx >= 0) {
        _settings[id].callbacks.splice(idx, 1);
    }
}
function broadcast(setting) {
    const callbacks = setting.callbacks;
    const value = setting.value;
    for (let i = 0, ilen = callbacks.length; i < ilen; i++) {
        callbacks[i](value);
    }
}
export var ID;
(function (ID) {
    ID[ID["CanvasWidth"] = 0] = "CanvasWidth";
    ID[ID["CanvasHeight"] = 1] = "CanvasHeight";
    ID[ID["Gamma"] = 2] = "Gamma";
    ID[ID["ToolId"] = 3] = "ToolId";
    ID[ID["BrushTextureSize"] = 4] = "BrushTextureSize";
    ID[ID["BrushSize"] = 5] = "BrushSize";
    ID[ID["BrushSoftness"] = 6] = "BrushSoftness";
    ID[ID["BrushSpacing"] = 7] = "BrushSpacing";
    ID[ID["BrushDensity"] = 8] = "BrushDensity";
    ID[ID["BrushHue"] = 9] = "BrushHue";
    ID[ID["BrushSaturation"] = 10] = "BrushSaturation";
    ID[ID["BrushValue"] = 11] = "BrushValue";
    ID[ID["BrushAlpha"] = 12] = "BrushAlpha";
    ID[ID["RenderingMaxDrawPoints"] = 13] = "RenderingMaxDrawPoints";
    ID[ID["RenderingBlendMode"] = 14] = "RenderingBlendMode";
})(ID || (ID = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2V0dGluZ3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvRW5naW5lL0dsb2JhbC9TZXR0aW5ncy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFLQSxNQUFNO0lBQ0wsWUFDUSxFQUFVLEVBQ1YsS0FBVSxFQUNWLFlBQXdCLEVBQUU7UUFGMUIsT0FBRSxHQUFGLEVBQUUsQ0FBUTtRQUNWLFVBQUssR0FBTCxLQUFLLENBQUs7UUFDVixjQUFTLEdBQVQsU0FBUyxDQUFpQjtJQUMvQixDQUFDO0NBQ0o7QUFNRCxNQUFNLFNBQVMsR0FBOEIsRUFBRSxDQUFDO0FBTWhELE1BQU0sbUJBQW1CLEVBQVUsRUFBRSxLQUFVO0lBQzlDLElBQUksT0FBTyxHQUFHLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUM1QixFQUFFLENBQUMsQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNyQixPQUFPLEdBQUcsSUFBSSxPQUFPLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ2pDLFNBQVMsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLENBQUM7SUFDekIsQ0FBQztJQUNELElBQUksQ0FBQyxDQUFDO1FBQ0wsT0FBTyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDdkIsQ0FBQztJQUNELFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNwQixDQUFDO0FBTUQsTUFBTSxtQkFBbUIsRUFBVTtJQUNsQyxNQUFNLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLElBQUksR0FBRyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztBQUMzRCxDQUFDO0FBTUQsTUFBTSxvQkFBb0IsRUFBVSxFQUFFLFFBQWtCO0lBQ3ZELElBQUksT0FBTyxHQUFHLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUM1QixFQUFFLENBQUMsQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNyQixPQUFPLEdBQUcsSUFBSSxPQUFPLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2hDLFNBQVMsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLENBQUM7SUFDekIsQ0FBQztJQUNELE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ2xDLENBQUM7QUFNRCxNQUFNLHNCQUFzQixFQUFNLEVBQUUsUUFBa0I7SUFDckQsTUFBTSxHQUFHLEdBQUcsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDdEQsRUFBRSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDZCxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDeEMsQ0FBQztBQUNGLENBQUM7QUFNRCxtQkFBbUIsT0FBZ0I7SUFDbEMsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQztJQUNwQyxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDO0lBQzVCLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLEdBQUcsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDeEQsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3JCLENBQUM7QUFDRixDQUFDO0FBS0QsTUFBTSxDQUFOLElBQVksRUF1Qlg7QUF2QkQsV0FBWSxFQUFFO0lBRWIseUNBQVcsQ0FBQTtJQUNYLDJDQUFZLENBQUE7SUFDWiw2QkFBSyxDQUFBO0lBR0wsK0JBQU0sQ0FBQTtJQUdOLG1EQUFnQixDQUFBO0lBQ2hCLHFDQUFTLENBQUE7SUFDVCw2Q0FBYSxDQUFBO0lBQ2IsMkNBQVksQ0FBQTtJQUNaLDJDQUFZLENBQUE7SUFDWixtQ0FBUSxDQUFBO0lBQ1Isa0RBQWUsQ0FBQTtJQUNmLHdDQUFVLENBQUE7SUFDVix3Q0FBVSxDQUFBO0lBR1YsZ0VBQXNCLENBQUE7SUFDdEIsd0RBQWtCLENBQUE7QUFDbkIsQ0FBQyxFQXZCVyxFQUFFLEtBQUYsRUFBRSxRQXVCYiJ9