import { Shader, Attribute, Uniform } from "./Shader";
const SHADER_BRUSH_VERT = [
    "precision highp float;",
    "attribute vec2 aPosition;",
    "varying vec2 vPosition;",
    "void main() {",
    "	vPosition = aPosition;",
    "	gl_Position = vec4(aPosition, 0.0, 1.0);",
    "}"
].join("\n");
const SHADER_BRUSH_FRAG = [
    "precision highp float;",
    "varying vec2 vPosition;",
    "uniform float uSoftness;",
    "uniform float uGamma;",
    "void main() {",
    "	float radius = 1.0 - uSoftness;",
    "	float dist = sqrt(dot(vPosition, vPosition));",
    "	float a = 1.0 - smoothstep(radius, radius + uSoftness, dist);",
    "	gl_FragColor = vec4(vec3(0.0), pow(a, uGamma));",
    "}"
].join("\n");
export class DefaultBrushShader extends Shader {
    constructor(renderer, softness, gamma) {
        super(renderer, SHADER_BRUSH_VERT, SHADER_BRUSH_FRAG, {
            aPosition: new Attribute(renderer.gl.FLOAT, 2)
        }, {
            uSoftness: new Uniform("1f", softness),
            uGamma: new Uniform("1f", gamma)
        }, 2);
        this.name = "brush shader";
    }
    set softness(texture) {
        this.uniforms["uSoftness"].value = texture;
    }
    get softness() {
        return this.uniforms["uSoftness"].value;
    }
    set gamma(texture) {
        this.uniforms["uGamma"].value = texture;
    }
    get gamma() {
        return this.uniforms["uGamma"].value;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVmYXVsdEJydXNoU2hhZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL0VuZ2luZS9SZW5kZXJpbmcvU2hhZGVycy9EZWZhdWx0QnJ1c2hTaGFkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBUXRELE1BQU0saUJBQWlCLEdBQUc7SUFDekIsd0JBQXdCO0lBRXhCLDJCQUEyQjtJQUUzQix5QkFBeUI7SUFFekIsZUFBZTtJQUNmLHlCQUF5QjtJQUN6QiwyQ0FBMkM7SUFDM0MsR0FBRztDQUNILENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBRWIsTUFBTSxpQkFBaUIsR0FBRztJQUN6Qix3QkFBd0I7SUFFeEIseUJBQXlCO0lBRXpCLDBCQUEwQjtJQUMxQix1QkFBdUI7SUFFdkIsZUFBZTtJQUVmLGtDQUFrQztJQUNsQyxnREFBZ0Q7SUFDaEQsZ0VBQWdFO0lBRWhFLGtEQUFrRDtJQUNsRCxHQUFHO0NBQ0gsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFHYixNQUFNLHlCQUEwQixTQUFRLE1BQU07SUFtQjdDLFlBQVksUUFBa0IsRUFBRSxRQUFnQixFQUFFLEtBQWE7UUFDOUQsS0FBSyxDQUFDLFFBQVEsRUFBRSxpQkFBaUIsRUFBRSxpQkFBaUIsRUFDbkQ7WUFDQyxTQUFTLEVBQUUsSUFBSSxTQUFTLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1NBQzlDLEVBQ0Q7WUFDQyxTQUFTLEVBQUUsSUFBSSxPQUFPLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQztZQUN0QyxNQUFNLEVBQUUsSUFBSSxPQUFPLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQztTQUNoQyxFQUNELENBQUMsQ0FDRCxDQUFDO1FBM0JJLFNBQUksR0FBRyxjQUFjLENBQUM7SUE2QjdCLENBQUM7SUEzQkQsSUFBVyxRQUFRLENBQUMsT0FBZTtRQUNsQyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUM7SUFDNUMsQ0FBQztJQUNELElBQVcsUUFBUTtRQUNsQixNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxLQUFLLENBQUM7SUFDekMsQ0FBQztJQUVELElBQVcsS0FBSyxDQUFDLE9BQWU7UUFDL0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDO0lBQ3pDLENBQUM7SUFDRCxJQUFXLEtBQUs7UUFDZixNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLENBQUM7SUFDdEMsQ0FBQztDQWdCRCJ9