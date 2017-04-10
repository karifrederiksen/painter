import { Shader, Attribute, Uniform } from "./Shader";
import { Vec2 } from "../../Math/Vec2";
import { SHADER_DEFINE_PI } from "./Common";
const SHADER_DRAWPOINT_VERT = [
    "precision highp float;",
    SHADER_DEFINE_PI,
    "attribute vec4 aColor;",
    "attribute vec2 aTextureCoord;",
    "attribute vec2 aPosition;",
    "attribute vec2 aCenter;",
    "attribute float aRotation;",
    "uniform vec2 uResolution;",
    "varying vec4 vColor;",
    "varying vec2 vTextureCoord;",
    "void main() {",
    "	vColor = vec4(aColor.rgb * aColor.a, aColor.a);",
    "	vTextureCoord = aTextureCoord;",
    "	float rotation = aRotation;",
    "	float c = cos(rotation);",
    "	float s = sin(rotation);",
    "	vec2 rotatedPos = vec2(aPosition.x * c + aPosition.y * s, aPosition.x * -s + aPosition.y * c);",
    "	vec2 pos = aCenter + rotatedPos;",
    "	pos /= uResolution;",
    "	pos.x = pos.x * 2.0 - 1.0;",
    "	pos.y = pos.y * -2.0 + 1.0;",
    "	gl_Position = vec4(pos, 0.0, 1.0);",
    "}",
].join("\n");
const SHADER_DRAWPOINT_FRAG = [
    "precision highp float;",
    "varying vec4 vColor;",
    "varying vec2 vTextureCoord;",
    "uniform sampler2D uBrushTexture;",
    "void main() {",
    "	float a = texture2D(uBrushTexture, vTextureCoord).a;",
    "	gl_FragColor = vec4(vColor * a);",
    "}",
].join("\n");
export class DrawPointShader extends Shader {
    constructor(renderer, texture, maxElements) {
        super(renderer, SHADER_DRAWPOINT_VERT, SHADER_DRAWPOINT_FRAG, {
            aColor: new Attribute(renderer.gl.FLOAT, 4),
            aTextureCoord: new Attribute(renderer.gl.FLOAT, 2),
            aPosition: new Attribute(renderer.gl.FLOAT, 2),
            aCenter: new Attribute(renderer.gl.FLOAT, 2),
            aRotation: new Attribute(renderer.gl.FLOAT, 1),
        }, {
            uBrushTexture: new Uniform("t", texture),
            uResolution: new Uniform("2f", null)
        }, maxElements, false);
        this.name = "drawpoint shader";
        this.resolution = Vec2.create(renderer.canvas.width, renderer.canvas.height);
    }
    set brushTexture(texture) {
        this.uniforms["uBrushTexture"].value = texture;
    }
    get brushTexture() {
        return this.uniforms["uBrushTexture"].value;
    }
    get resolution() {
        return this.uniforms["uResolution"].value;
    }
    set resolution(value) {
        this.uniforms["uResolution"].value = value;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRHJhd1BvaW50U2hhZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL0VuZ2luZS9SZW5kZXJpbmcvU2hhZGVycy9EcmF3UG9pbnRTaGFkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLE1BQU0sVUFBVSxDQUFBO0FBSXJELE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUN2QyxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFNUMsTUFBTSxxQkFBcUIsR0FBRztJQUM3Qix3QkFBd0I7SUFFeEIsZ0JBQWdCO0lBRWhCLHdCQUF3QjtJQUN4QiwrQkFBK0I7SUFDL0IsMkJBQTJCO0lBQzNCLHlCQUF5QjtJQUN6Qiw0QkFBNEI7SUFFNUIsMkJBQTJCO0lBRTNCLHNCQUFzQjtJQUN0Qiw2QkFBNkI7SUFFN0IsZUFBZTtJQUNmLGtEQUFrRDtJQUNsRCxpQ0FBaUM7SUFFakMsOEJBQThCO0lBQzlCLDJCQUEyQjtJQUMzQiwyQkFBMkI7SUFDM0IsaUdBQWlHO0lBRWpHLG1DQUFtQztJQUNuQyxzQkFBc0I7SUFDdEIsNkJBQTZCO0lBQzdCLDhCQUE4QjtJQUU5QixxQ0FBcUM7SUFDckMsR0FBRztDQUNILENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBR2IsTUFBTSxxQkFBcUIsR0FBRztJQUM3Qix3QkFBd0I7SUFFeEIsc0JBQXNCO0lBQ3RCLDZCQUE2QjtJQUU3QixrQ0FBa0M7SUFFbEMsZUFBZTtJQUNmLHVEQUF1RDtJQUN2RCxtQ0FBbUM7SUFDbkMsR0FBRztDQUNILENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBSWIsTUFBTSxzQkFBdUIsU0FBUSxNQUFNO0lBb0IxQyxZQUFZLFFBQWtCLEVBQUUsT0FBZ0IsRUFBRSxXQUFtQjtRQUNwRSxLQUFLLENBQUMsUUFBUSxFQUFFLHFCQUFxQixFQUFFLHFCQUFxQixFQUMzRDtZQUNDLE1BQU0sRUFBRSxJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDM0MsYUFBYSxFQUFFLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUNsRCxTQUFTLEVBQUUsSUFBSSxTQUFTLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQzlDLE9BQU8sRUFBRSxJQUFJLFNBQVMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDNUMsU0FBUyxFQUFFLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztTQUM5QyxFQUNEO1lBQ0MsYUFBYSxFQUFFLElBQUksT0FBTyxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUM7WUFDeEMsV0FBVyxFQUFFLElBQUksT0FBTyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUM7U0FDcEMsRUFDRCxXQUFXLEVBQ1gsS0FBSyxDQUNMLENBQUM7UUFqQ0ksU0FBSSxHQUFHLGtCQUFrQixDQUFDO1FBa0NoQyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUM5RSxDQUFDO0lBaENELElBQVcsWUFBWSxDQUFDLE9BQWdCO1FBQ3ZDLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQztJQUNoRCxDQUFDO0lBQ0QsSUFBVyxZQUFZO1FBQ3RCLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxDQUFDLEtBQUssQ0FBQztJQUM3QyxDQUFDO0lBRUQsSUFBVyxVQUFVO1FBQ3BCLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDLEtBQUssQ0FBQztJQUMzQyxDQUFDO0lBQ0QsSUFBVyxVQUFVLENBQUMsS0FBVztRQUNoQyxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDNUMsQ0FBQztDQXFCRCJ9