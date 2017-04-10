export class InputPositionData {
    constructor(position, pressure, tilt) {
        this.position = position;
        this.pressure = pressure;
        this.tilt = tilt;
        Object.freeze(this);
    }
}
export class InputMods {
    constructor(shift, alt, ctrl) {
        this.shift = shift;
        this.alt = alt;
        this.ctrl = ctrl;
        Object.freeze(this);
    }
}
export class InputData {
    constructor(source, whichKey, type, mods, positionData) {
        this.source = source;
        this.whichKey = whichKey;
        this.type = type;
        this.mods = mods;
        this.positionData = positionData;
        Object.freeze(this);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW5wdXREYXRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL0VuZ2luZS9JbnB1dC9JbnB1dERhdGEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBaUJBLE1BQU07SUFDTCxZQUNRLFFBQWMsRUFDZCxRQUFnQixFQUNoQixJQUFVO1FBRlYsYUFBUSxHQUFSLFFBQVEsQ0FBTTtRQUNkLGFBQVEsR0FBUixRQUFRLENBQVE7UUFDaEIsU0FBSSxHQUFKLElBQUksQ0FBTTtRQUVqQixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3JCLENBQUM7Q0FDRDtBQUdELE1BQU07SUFDTCxZQUNRLEtBQWMsRUFDZCxHQUFZLEVBQ1osSUFBYTtRQUZiLFVBQUssR0FBTCxLQUFLLENBQVM7UUFDZCxRQUFHLEdBQUgsR0FBRyxDQUFTO1FBQ1osU0FBSSxHQUFKLElBQUksQ0FBUztRQUVwQixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3JCLENBQUM7Q0FDRDtBQUVELE1BQU07SUFDTCxZQUNRLE1BQW1CLEVBQ25CLFFBQWdCLEVBQ2hCLElBQWUsRUFDZixJQUFlLEVBQ2YsWUFBK0I7UUFKL0IsV0FBTSxHQUFOLE1BQU0sQ0FBYTtRQUNuQixhQUFRLEdBQVIsUUFBUSxDQUFRO1FBQ2hCLFNBQUksR0FBSixJQUFJLENBQVc7UUFDZixTQUFJLEdBQUosSUFBSSxDQUFXO1FBQ2YsaUJBQVksR0FBWixZQUFZLENBQW1CO1FBRXRDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDckIsQ0FBQztDQUNEIn0=