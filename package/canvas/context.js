import * as OutputShader from "./outputShader";
import * as BrushTextureShader from "./brushTextureGenerator";
import * as TextureShader from "./textureShader";
import * as ClearBlocksShader from "./clearBlocksShader";
import * as BlockHighlightShader from "./blockHighlightShader";
import * as BrushShader from "./brushShader";
import * as BlockRender from "./renderBlockSystem";
import { Blend } from "../webgl";
import { Ok, Err, Vec2, Vec4 } from "../util";
import { RgbLinear } from "color";
import { Texture, createTextureWithFramebuffer, ensureTextureIsBound, } from "./texture";
import * as Render from "./render";
export function create(canvas) {
    const wglArgs = {
        antialias: false,
        depth: false,
        alpha: false,
        premultipliedAlpha: false,
        stencil: false,
        preserveDrawingBuffer: true,
        desynchronized: true,
    };
    const gl = canvas.getContext("webgl", wglArgs);
    if (gl === null) {
        console.error("Failed to initialize WebGL renderer for canvas: ", canvas);
        return new Err("Failed to initialize WebGL");
    }
    const attrs = gl.getContextAttributes();
    if (!(attrs && attrs.desynchronized)) {
        console.warn("Low latency canvas not supported. Boo!");
    }
    const floatLinearFiltering = gl.getExtension("OES_texture_float_linear");
    if (floatLinearFiltering === null) {
        console.warn(`Couldn't enable "OES_texture_float_linear"`);
    }
    const floatTexture = gl.getExtension("OES_texture_float");
    if (floatTexture === null) {
        console.warn(`Couldn't enable "OES_texture_float"`);
    }
    // TODO: check for half-float
    // TODO: check for max textures
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.enable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);
    const { sfact, dfact } = Blend.factorsNormal(gl);
    gl.blendFunc(sfact, dfact);
    const drawpointBatch = BrushShader.Shader.create(gl);
    if (drawpointBatch === null) {
        const msg = "Failed to initialize BrushShader";
        console.error(msg);
        return new Err(msg);
    }
    const brushTextureGenerator = BrushTextureShader.Generator.create(gl);
    if (brushTextureGenerator === null) {
        const msg = "Failed to initialize BrushTextureGenerator";
        console.error(msg);
        return new Err(msg);
    }
    const textureRenderer = TextureShader.Shader.create(gl);
    if (textureRenderer === null) {
        const msg = "Failed to initialize TextureShader";
        console.error(msg);
        return new Err(msg);
    }
    const clearBlocksRenderer = ClearBlocksShader.Shader.create(gl);
    if (clearBlocksRenderer === null) {
        const msg = "Failed to initialize ClearBlocksShader";
        console.error(msg);
        return new Err(msg);
    }
    const outputRenderer = OutputShader.Shader.create(gl);
    if (outputRenderer === null) {
        const msg = "Failed to initialize OutputShader";
        console.error(msg);
        return new Err(msg);
    }
    const blockHighlightShader = BlockHighlightShader.Shader.create(gl);
    if (blockHighlightShader === null) {
        const msg = "Failed to initialize BlockHighlightShader";
        console.error(msg);
        return new Err(msg);
    }
    gl.viewport(0, 0, canvas.width, canvas.height);
    const context = new Context({
        gl,
        brushTextureGenerator,
        drawpointBatch,
        outputRenderer,
        textureRenderer,
        clearBlocksRenderer,
        blockHighlightShader,
        resolution: new Vec2(canvas.width, canvas.height),
    });
    return new Ok([context, gl]);
}
export class Context {
    gl;
    brushTextureGenerator;
    textureRenderer;
    clearBlocksRenderer;
    blockHighlightShader;
    outputRenderer;
    drawpointBatch;
    allTextures;
    textureBindings;
    layerTextureMap;
    internalCanvasSize;
    stroke;
    renderBlockSystem;
    prevLayers;
    brushTexture;
    outputTexture;
    combinedLayers;
    constructor(args) {
        this.gl = args.gl;
        this.brushTextureGenerator = args.brushTextureGenerator;
        this.textureRenderer = args.textureRenderer;
        this.clearBlocksRenderer = args.clearBlocksRenderer;
        this.blockHighlightShader = args.blockHighlightShader;
        this.outputRenderer = args.outputRenderer;
        this.drawpointBatch = args.drawpointBatch;
        this.allTextures = [];
        this.textureBindings = new Array(32).fill([null, 0]);
        this.layerTextureMap = new Map();
        this.internalCanvasSize = args.resolution;
        this.stroke = null;
        this.renderBlockSystem = new BlockRender.RenderBlockSystem(500);
        this.prevLayers = {
            above: [],
            below: [],
            current: null,
        };
        {
            const size = new Vec2(128, 128);
            this.brushTexture = createTextureWithFramebuffer(this.gl, this.allTextures, this.textureBindings, size);
            this.brushTextureGenerator.generateBrushTexture(this.gl, {
                framebuffer: this.brushTexture.framebuffer,
                size: size,
                uniforms: {
                    u_softness: 0,
                },
            });
        }
        this.outputTexture = createTextureWithFramebuffer(this.gl, this.allTextures, this.textureBindings, args.resolution);
        const outFramebuffer = this.outputTexture.framebuffer;
        this.combinedLayers = {
            above: createTextureWithFramebuffer(this.gl, this.allTextures, this.textureBindings, args.resolution),
            below: createTextureWithFramebuffer(this.gl, this.allTextures, this.textureBindings, args.resolution),
            current: createTextureWithFramebuffer(this.gl, this.allTextures, this.textureBindings, args.resolution),
        };
        // initialize background
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, outFramebuffer);
        this.gl.viewport(0, 0, args.resolution.x, args.resolution.y);
        this.gl.clearColor(0.6, 0.6, 0.6, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.outputRenderer.render(this.gl, {
            uniforms: {
                u_resolution: args.resolution,
                u_texture: ensureTextureIsBound(this.gl, this.textureBindings, this.outputTexture),
            },
            blocks: [
                {
                    x0: 0,
                    y0: 0,
                    x1: args.resolution.x,
                    y1: args.resolution.y,
                },
            ],
        });
    }
    addBrushPoints(brushPoints) {
        this.drawpointBatch.addPoints(brushPoints);
        this.renderBlockSystem.addBrushPoints(brushPoints);
    }
    endStroke() {
        const { gl, stroke, prevLayers, internalCanvasSize, textureRenderer, combinedLayers, renderBlockSystem, textureBindings, } = this;
        if (stroke === null || prevLayers.current === null) {
            return;
        }
        gl.viewport(0, 0, internalCanvasSize.x, internalCanvasSize.y);
        textureRenderer.render(gl, {
            framebuffer: combinedLayers.current.framebuffer,
            uniforms: {
                u_opacity: 1,
                u_resolution: internalCanvasSize,
                u_texture: ensureTextureIsBound(gl, textureBindings, stroke),
            },
            blocks: renderBlockSystem.getStrokeBlocks(),
        });
        gl.bindFramebuffer(gl.FRAMEBUFFER, stroke.framebuffer);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        renderBlockSystem.strokeEnded();
    }
    render(args) {
        const { blendMode, nextLayers, resolution, brush } = args;
        const { gl, renderBlockSystem, drawpointBatch, layerTextureMap, allTextures, textureBindings, internalCanvasSize, brushTexture, brushTextureGenerator, prevLayers, combinedLayers, outputTexture, } = this;
        const layersToCombine = new Render.LayersToCombine(prevLayers, nextLayers);
        if (layersToCombine.anyChange) {
            renderBlockSystem.fillAll(args.currentTime, resolution);
        }
        renderBlockSystem.update(args.currentTime);
        const frameBlocks = renderBlockSystem.getFrameBlocks();
        if (frameBlocks.length === 0) {
            return;
        }
        if (drawpointBatch.canFlush) {
            if (nextLayers.current === null) {
                console.warn("Drawpoint batch has data to flush, but no layer is currently selected");
            }
            else {
                let currentLayerTex = layerTextureMap.get(nextLayers.current.id);
                if (currentLayerTex == null) {
                    currentLayerTex = createTextureWithFramebuffer(gl, allTextures, textureBindings, internalCanvasSize);
                    layerTextureMap.set(nextLayers.current.id, currentLayerTex);
                }
                brushTextureGenerator.generateBrushTexture(gl, {
                    framebuffer: brushTexture.framebuffer,
                    size: new Vec2(128, 128),
                    uniforms: {
                        u_softness: Math.max(brush.softness, 0.000001),
                    },
                });
                gl.viewport(0, 0, resolution.x, resolution.y);
                gl.bindFramebuffer(gl.FRAMEBUFFER, currentLayerTex.framebuffer);
                drawpointBatch.flush(gl, {
                    blendMode,
                    uniforms: {
                        u_resolution: resolution,
                        u_texture: ensureTextureIsBound(gl, textureBindings, brushTexture),
                    },
                });
            }
        }
        Render.combineLayers({
            gl,
            resolution,
            allTextures: allTextures,
            layerTextureMap: layerTextureMap,
            textureBindings: textureBindings,
            textureShader: this.textureRenderer,
            layersToRender: layersToCombine,
            textureAbove: combinedLayers.above,
            textureBelow: combinedLayers.below,
            textureCurrent: combinedLayers.current,
        });
        // render to outputTexture
        const outFramebuffer = outputTexture.framebuffer;
        gl.bindFramebuffer(gl.FRAMEBUFFER, outFramebuffer);
        {
            // need to clear the render blocks...
            this.clearBlocksRenderer.render(gl, {
                framebuffer: outFramebuffer,
                uniforms: {
                    u_resolution: resolution,
                    u_rgba: Vec4.fromRgba(new RgbLinear(0.6, 0.6, 0.6), 1),
                },
                blocks: frameBlocks,
            });
        }
        // BELOW
        this.textureRenderer.render(gl, {
            framebuffer: outFramebuffer,
            uniforms: {
                u_opacity: 1,
                u_resolution: resolution,
                u_texture: ensureTextureIsBound(gl, textureBindings, combinedLayers.below),
            },
            blocks: frameBlocks,
        });
        if (nextLayers.current !== null) {
            // CURRENT
            this.textureRenderer.render(gl, {
                framebuffer: outFramebuffer,
                uniforms: {
                    u_opacity: nextLayers.current.opacity,
                    u_resolution: resolution,
                    u_texture: ensureTextureIsBound(gl, textureBindings, combinedLayers.current),
                },
                blocks: frameBlocks,
            });
        }
        // ABOVE
        this.textureRenderer.render(gl, {
            framebuffer: outFramebuffer,
            uniforms: {
                u_opacity: 1,
                u_resolution: resolution,
                u_texture: ensureTextureIsBound(gl, textureBindings, combinedLayers.above),
            },
            blocks: frameBlocks,
        });
        if (args.highlightRenderBlocks) {
            const blockHighlights = renderBlockSystem.getHighlights();
            this.blockHighlightShader.render(gl, {
                framebuffer: outFramebuffer,
                uniforms: {
                    u_resolution: resolution,
                    u_rgba: Vec4.fromRgba(new RgbLinear(0, 0, 1), 1),
                },
                blockHighlights,
            });
        }
        // outputTexture -> canvas
        // I'm not sure if can use block rendering when rendering to canvas - unless there's something I'm missing, it seems that the canvas auto-clears itself before render
        this.outputRenderer.render(gl, {
            uniforms: {
                u_resolution: resolution,
                u_texture: ensureTextureIsBound(gl, textureBindings, outputTexture),
            },
            blocks: frameBlocks,
        });
        gl.flush();
        //gl.finish()
        this.prevLayers = nextLayers;
    }
    dispose() {
        const { gl } = this;
        this.brushTextureGenerator.dispose(gl);
        this.textureRenderer.dispose(gl);
        this.outputRenderer.dispose(gl);
        this.drawpointBatch.dispose(gl);
        for (const x of this.allTextures) {
            gl.deleteTexture(x.texture);
            if (x instanceof Texture) {
                gl.deleteFramebuffer(x.framebuffer);
            }
        }
    }
}
