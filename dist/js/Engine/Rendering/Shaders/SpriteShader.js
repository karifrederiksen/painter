import { Shader, Attribute, Uniform } from "./Shader";
import { Vec2 } from "../../Math/Vec2";
const SHADER_SPRITE_SHADER_VERT = [
    "precision highp float;",
    "attribute vec2 aPosition;",
    "attribute vec2 aTextureCoord;",
    "uniform vec2 uResolution;",
    "uniform float uScale;",
    "uniform float uRotation;",
    "varying vec2 vTextureCoord;",
    "void main() {",
    "	vTextureCoord = aTextureCoord / uResolution;",
    "   vec2 csCoord = (aPosition / uResolution) * 2.0 - 1.0;",
    "	gl_Position = vec4(csCoord, 0.0, 1.0);",
    "}"
].join("\n");
const SHADER_SPRITE_SHADER_FRAG = [
    "precision highp float;",
    "varying vec2 vTextureCoord;",
    "uniform sampler2D uTexture;",
    "void main() {",
    "	vec4 pixel = texture2D(uTexture, vTextureCoord);",
    "	gl_FragColor = pixel;",
    "}"
].join("\n");
export class SpriteShader extends Shader {
    constructor(renderer) {
        super(renderer, SHADER_SPRITE_SHADER_VERT, SHADER_SPRITE_SHADER_FRAG, {
            aPosition: new Attribute(renderer.gl.FLOAT, 2),
            aTextureCoord: new Attribute(renderer.gl.FLOAT, 2)
        }, {
            uTexture: new Uniform("t", null),
            uResolution: new Uniform("2f", Vec2.create(renderer.canvas.width, renderer.canvas.height)),
            uScale: new Uniform("1f", 1),
            uRotation: new Uniform("1f", 0)
        }, 2);
        this.name = "sprite shader";
    }
    get texture() {
        return this.uniforms["uTexture"].value;
    }
    set texture(value) {
        this.uniforms["uTexture"].value = value;
    }
    get scale() {
        return this.uniforms["uScale"].value;
    }
    set scale(value) {
        this.uniforms["uScale"].value = value;
    }
    get rotation() {
        return this.uniforms["uRotation"].value;
    }
    set rotation(value) {
        this.uniforms["uRotation"].value = value;
    }
    get resolution() {
        return this.uniforms["uResolution"].value;
    }
    set resolution(value) {
        this.uniforms["uResolution"].value = value;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3ByaXRlU2hhZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL0VuZ2luZS9SZW5kZXJpbmcvU2hhZGVycy9TcHJpdGVTaGFkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBR3RELE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUt2QyxNQUFNLHlCQUF5QixHQUFHO0lBQ2pDLHdCQUF3QjtJQUV4QiwyQkFBMkI7SUFDM0IsK0JBQStCO0lBRS9CLDJCQUEyQjtJQUMzQix1QkFBdUI7SUFDdkIsMEJBQTBCO0lBRTFCLDZCQUE2QjtJQUU3QixlQUFlO0lBQ2YsK0NBQStDO0lBQy9DLDBEQUEwRDtJQUMxRCx5Q0FBeUM7SUFDekMsR0FBRztDQUNILENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBSWIsTUFBTSx5QkFBeUIsR0FBRztJQUNqQyx3QkFBd0I7SUFFeEIsNkJBQTZCO0lBRTdCLDZCQUE2QjtJQUU3QixlQUFlO0lBQ2YsbURBQW1EO0lBRW5ELHdCQUF3QjtJQUN4QixHQUFHO0NBQ0gsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFHYixNQUFNLG1CQUFvQixTQUFRLE1BQU07SUFpQ3ZDLFlBQW1CLFFBQWtCO1FBQ3BDLEtBQUssQ0FBQyxRQUFRLEVBQUUseUJBQXlCLEVBQUUseUJBQXlCLEVBQ25FO1lBQ0MsU0FBUyxFQUFFLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUM5QyxhQUFhLEVBQUUsSUFBSSxTQUFTLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1NBQ2xELEVBQ0Q7WUFDQyxRQUFRLEVBQUUsSUFBSSxPQUFPLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQztZQUNoQyxXQUFXLEVBQUUsSUFBSSxPQUFPLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMxRixNQUFNLEVBQUUsSUFBSSxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUM1QixTQUFTLEVBQUUsSUFBSSxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztTQUMvQixFQUNELENBQUMsQ0FDRCxDQUFDO1FBNUNJLFNBQUksR0FBRyxlQUFlLENBQUM7SUE2QzlCLENBQUM7SUEzQ0QsSUFBVyxPQUFPO1FBQ2pCLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEtBQUssQ0FBQztJQUN4QyxDQUFDO0lBQ0QsSUFBVyxPQUFPLENBQUMsS0FBYztRQUNoQyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDekMsQ0FBQztJQUVELElBQVcsS0FBSztRQUNmLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssQ0FBQztJQUN0QyxDQUFDO0lBQ0QsSUFBVyxLQUFLLENBQUMsS0FBYTtRQUM3QixJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDdkMsQ0FBQztJQUVELElBQVcsUUFBUTtRQUNsQixNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxLQUFLLENBQUM7SUFDekMsQ0FBQztJQUNELElBQVcsUUFBUSxDQUFDLEtBQWE7UUFDaEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQzFDLENBQUM7SUFHRCxJQUFXLFVBQVU7UUFDcEIsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUMsS0FBSyxDQUFDO0lBQzNDLENBQUM7SUFDRCxJQUFXLFVBQVUsQ0FBQyxLQUFXO1FBQ2hDLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztJQUM1QyxDQUFDO0NBaUJEIn0=