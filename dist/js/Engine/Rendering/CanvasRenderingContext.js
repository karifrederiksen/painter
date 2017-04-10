import { BlendMode } from "./Consts";
import { Renderer } from "./Renderer";
import { LayerStack } from "./Layers/LayerStack";
import { LayersRenderer } from "./Layers/LayersRenderer";
import { addDrawPointToBatch } from "./DrawPoints";
import * as Settings from "../Global/Settings";
export class CanvRenderingContext {
    constructor(canvas) {
        console.assert(canvas != null, `Canvas is ${canvas}`);
        this.renderer = new Renderer(canvas, {
            alpha: true,
            depth: false,
            stencil: false,
            antialias: false,
            premultipliedAlpha: true,
            preserveDrawingBuffer: true,
            failIfMajorPerformanceCaveat: false
        });
        this.layerStack = new LayerStack(this.renderer);
        this.layerStack.newLayer(0);
        this.layerStack.newLayer(1);
        this.layer = this.layerStack.stack[0];
        this.layer.texture.updateSize();
        this._layersRenderer = new LayersRenderer(this.renderer, this.layerStack);
        this.blendMode = Settings.getValue(Settings.ID.RenderingBlendMode);
    }
    renderDrawPoints(drawPoints, brushTexture) {
        console.assert(drawPoints != null, `DrawPoints is ${drawPoints}`);
        console.assert(brushTexture != null, `BrushTexture is ${brushTexture}`);
        const drawPointShader = this.renderer.shaders.drawPointShader;
        const renderer = this.renderer;
        const layer = this.layer;
        renderer.blendMode = this.blendMode;
        drawPointShader.brushTexture = brushTexture;
        addDrawPointToBatch(drawPoints, drawPointShader.batch);
        renderer.flushShaderToTexture(drawPointShader, layer.texture);
        this.renderLayers();
    }
    renderLayers() {
        const renderer = this.renderer;
        const spriteShader = renderer.shaders.spriteShader;
        const outputShader = renderer.shaders.outputShader;
        const layersRenderer = this._layersRenderer;
        const combinedLayers = this._layersRenderer.combinedLayers;
        const blendMode = renderer.blendMode;
        renderer.blendMode = BlendMode.Normal;
        layersRenderer.update(this.layer);
        layersRenderer.render();
        combinedLayers.addToBatch(outputShader.batch);
        outputShader.resolution = combinedLayers.texture.size;
        outputShader.texture = combinedLayers.texture;
        renderer.setViewport(0, 0, renderer.canvas.width, renderer.canvas.height);
        renderer.useFrameBuffer(null);
        renderer.clear();
        renderer.flushShaderToTexture(outputShader, null);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2FudmFzUmVuZGVyaW5nQ29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9FbmdpbmUvUmVuZGVyaW5nL0NhbnZhc1JlbmRlcmluZ0NvbnRleHQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUNyQyxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBRXRDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUNqRCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFFekQsT0FBTyxFQUFhLG1CQUFtQixFQUFFLE1BQU0sY0FBYyxDQUFBO0FBQzdELE9BQU8sS0FBSyxRQUFRLE1BQU0sb0JBQW9CLENBQUM7QUFFL0MsTUFBTTtJQVdMLFlBQVksTUFBeUI7UUFDcEMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLElBQUksSUFBSSxFQUFFLGFBQWEsTUFBTSxFQUFFLENBQUMsQ0FBQztRQUN0RCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksUUFBUSxDQUFDLE1BQU0sRUFBRTtZQUNwQyxLQUFLLEVBQUUsSUFBSTtZQUNYLEtBQUssRUFBRSxLQUFLO1lBQ1osT0FBTyxFQUFFLEtBQUs7WUFDZCxTQUFTLEVBQUUsS0FBSztZQUNoQixrQkFBa0IsRUFBRSxJQUFJO1lBQ3hCLHFCQUFxQixFQUFFLElBQUk7WUFDM0IsNEJBQTRCLEVBQUUsS0FBSztTQUNuQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUVoRCxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1QixJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1QixJQUFJ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