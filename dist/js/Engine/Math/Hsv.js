import { Rgbaa } from "./Rgb";
export class Hsva {
    constructor(h = 0.0, s = 0.0, v = 0.0, a = 0.0) {
        this.h = h;
        this.s = s;
        this.v = v;
        this.a = a;
        Object.freeze(this);
    }
    withRGB(r, g, b) {
        return new Hsva(r, g, b, this.a);
    }
    multipliedByAlpha(a) {
        return new Hsva(a * this.h, a * this.s, a * this.v, a);
    }
    pow(n) {
        return new Hsva(Math.pow(this.h, n), Math.pow(this.s, n), Math.pow(this.v, n), Math.pow(this.a, n));
    }
    toRgba() {
        const h = this.h;
        const s = this.s;
        const v = this.v;
        const i = Math.floor(h * 6);
        const f = h * 6 - i;
        const p = v * (1 - s);
        const q = v * (1 - f * s);
        const t = v * (1 - (1 - f) * s);
        let r;
        let g;
        let b;
        switch (i % 6) {
            case 0:
                r = v, g = t, b = p;
                break;
            case 1:
                r = q, g = v, b = p;
                break;
            case 2:
                r = p, g = v, b = t;
                break;
            case 3:
                r = p, g = q, b = v;
                break;
            case 4:
                r = t, g = p, b = v;
                break;
            default:
                r = v, g = p, b = q;
                break;
        }
        return new Rgbaa(r, g, b, this.a);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSHN2LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL0VuZ2luZS9NYXRoL0hzdi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sT0FBTyxDQUFDO0FBRTlCLE1BQU07SUFDTCxZQUNRLElBQUksR0FBRyxFQUNQLElBQUksR0FBRyxFQUNQLElBQUksR0FBRyxFQUNQLElBQUksR0FBRztRQUhQLE1BQUMsR0FBRCxDQUFDLENBQU07UUFDUCxNQUFDLEdBQUQsQ0FBQyxDQUFNO1FBQ1AsTUFBQyxHQUFELENBQUMsQ0FBTTtRQUNQLE1BQUMsR0FBRCxDQUFDLENBQU07UUFFZCxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3JCLENBQUM7SUFFTSxPQUFPLENBQUMsQ0FBUyxFQUFFLENBQVMsRUFBRSxDQUFTO1FBQzdDLE1BQU0sQ0FBQyxJQUFJLElBQUksQ0FDZCxDQUFDLEVBQ0QsQ0FBQyxFQUNELENBQUMsRUFDRCxJQUFJLENBQUMsQ0FBQyxDQUNOLENBQUM7SUFDSCxDQUFDO0lBR00saUJBQWlCLENBQUMsQ0FBUztRQUNqQyxNQUFNLENBQUMsSUFBSSxJQUFJLENBQ2QsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEVBQ1YsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEVBQ1YsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEVBQ1YsQ0FBQyxDQUNELENBQUM7SUFDSCxDQUFDO0lBR00sR0FBRyxDQUFDLENBQVM7UUFDbkIsTUFBTSxDQUFDLElBQUksSUFBSSxDQUNkLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDbkIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUNuQixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ25CLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FDbkIsQ0FBQztJQUNILENBQUM7SUFFTSxNQUFNO1FBQ1osTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNqQixNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ2pCLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDNUIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDcEIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3RCLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDMUIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBRWhDLElBQUksQ0FBUyxDQUFDO1FBQ2QsSUFBSSxDQUFTLENBQUM7UUFDZCxJQUFJLENBQVMsQ0FBQztRQUNkLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2YsS0FBSyxDQUFDO2dCQUNMLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNwQixLQUFLLENBQUM7WUFDUCxLQUFLLENBQUM7Z0JBQ0wsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ3BCLEtBQUssQ0FBQztZQUNQLEtBQUssQ0FBQztnQkFDTCxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDcEIsS0FBSyxDQUFDO1lBQ1AsS0FBSyxDQUFDO2dCQUNMLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNwQixLQUFLLENBQUM7WUFDUCxLQUFLLENBQUM7Z0JBQ0wsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ3BCLEtBQUssQ0FBQztZQUNQO2dCQUNDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNwQixLQUFLLENBQUM7UUFDUixDQUFDO1FBQ0QsTUFBTSxDQUFDLElBQUksS0FBSyxDQUNmLENBQUMsRUFDRCxDQUFDLEVBQ0QsQ0FBQyxFQUNELElBQUksQ0FBQyxDQUFDLENBQ04sQ0FBQztJQUNILENBQUM7Q0FDRCJ9