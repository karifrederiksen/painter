import { Shader, Attribute, Uniform } from "./Shader";
import { Vec2 } from "../../Math/Vec2";
const SHADER_OUTPUT_SHADER_VERT = [
    "precision highp float;",
    "attribute vec2 aPosition;",
    "attribute vec2 aTextureCoord;",
    "uniform vec2 uResolution;",
    "varying vec2 vTextureCoord;",
    "void main() {",
    "	vTextureCoord = aTextureCoord / uResolution;",
    "   vec2 csCoord = (aPosition / uResolution) * 2.0 - 1.0;",
    "	gl_Position = vec4(csCoord, 0.0, 1.0);",
    "}"
].join("\n");
function SHADER_OUTPUT_SHADER_FRAG(gamma) {
    return [
        "precision highp float;",
        "varying vec2 vTextureCoord;",
        "uniform sampler2D uTexture;",
        "void main() {",
        "	vec4 pixel = texture2D(uTexture, vTextureCoord);",
        "	gl_FragColor = pow(pixel, vec4(" + (1 / gamma).toFixed(6) + "));",
        "}"
    ].join("\n");
}
;
export class OutputShader extends Shader {
    constructor(renderer, gamma, texture = null) {
        super(renderer, SHADER_OUTPUT_SHADER_VERT, SHADER_OUTPUT_SHADER_FRAG(gamma), {
            aPosition: new Attribute(renderer.gl.FLOAT, 2),
            aTextureCoord: new Attribute(renderer.gl.FLOAT, 2)
        }, {
            uTexture: new Uniform("t", texture),
            uResolution: new Uniform("2f", Vec2.create())
        }, 2);
        this.name = "output shader";
        this._gamma = gamma;
    }
    get gamma() {
        return this._gamma;
    }
    set gamma(value) {
        if (true === this._recompileProgram(SHADER_OUTPUT_SHADER_VERT, SHADER_OUTPUT_SHADER_FRAG(value))) {
            this._gamma = value;
        }
    }
    get texture() {
        return this.uniforms["uTexture"].value;
    }
    set texture(value) {
        this.uniforms["uTexture"].value = value;
    }
    get resolution() {
        return this.uniforms["uResolution"].value;
    }
    set resolution(value) {
        this.uniforms["uResolution"].value = value;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3V0cHV0U2hhZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL0VuZ2luZS9SZW5kZXJpbmcvU2hhZGVycy9PdXRwdXRTaGFkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBR3RELE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQVl2QyxNQUFNLHlCQUF5QixHQUFHO0lBQ2pDLHdCQUF3QjtJQUV4QiwyQkFBMkI7SUFDM0IsK0JBQStCO0lBRS9CLDJCQUEyQjtJQUUzQiw2QkFBNkI7SUFFN0IsZUFBZTtJQUNmLCtDQUErQztJQUMvQywwREFBMEQ7SUFDMUQseUNBQXlDO0lBQ3pDLEdBQUc7Q0FDSCxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUliLG1DQUFtQyxLQUFhO0lBQy9DLE1BQU0sQ0FBQztRQUNOLHdCQUF3QjtRQUV4Qiw2QkFBNkI7UUFFN0IsNkJBQTZCO1FBRTdCLGVBQWU7UUFDZixtREFBbUQ7UUFFbkQsa0NBQWtDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUs7UUFDbkUsR0FBRztLQUNILENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2QsQ0FBQztBQUFBLENBQUM7QUFHRixNQUFNLG1CQUFvQixTQUFRLE1BQU07SUErQnZDLFlBQVksUUFBa0IsRUFBRSxLQUFhLEVBQUUsVUFBbUIsSUFBSTtRQUNyRSxLQUFLLENBQUMsUUFBUSxFQUFFLHlCQUF5QixFQUFFLHlCQUF5QixDQUFDLEtBQUssQ0FBQyxFQUMxRTtZQUNDLFNBQVMsRUFBRSxJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDOUMsYUFBYSxFQUFFLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztTQUNsRCxFQUNEO1lBQ0MsUUFBUSxFQUFFLElBQUksT0FBTyxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUM7WUFDbkMsV0FBVyxFQUFFLElBQUksT0FBTyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7U0FDN0MsRUFDRCxDQUFDLENBQ0QsQ0FBQztRQXZDSSxTQUFJLEdBQUcsZUFBZSxDQUFDO1FBd0M3QixJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztJQUNyQixDQUFDO0lBdENELElBQVcsS0FBSztRQUNmLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO0lBQ3BCLENBQUM7SUFDRCxJQUFXLEtBQUssQ0FBQyxLQUFhO1FBQzdCLEVBQUUsQ0FBQyxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsaUJBQWlCLENBQUMseUJBQXlCLEVBQUUseUJBQXlCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbEcsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7UUFDckIsQ0FBQztJQUNGLENBQUM7SUFFRCxJQUFXLE9BQU87UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsS0FBSyxDQUFDO0lBQ3hDLENBQUM7SUFDRCxJQUFXLE9BQU8sQ0FBQyxLQUFjO1FBQ2hDLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztJQUN6QyxDQUFDO0lBR0QsSUFBVyxVQUFVO1FBQ3BCLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDLEtBQUssQ0FBQztJQUMzQyxDQUFDO0lBQ0QsSUFBVyxVQUFVLENBQUMsS0FBVztRQUNoQyxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDNUMsQ0FBQztDQWlCRCJ9