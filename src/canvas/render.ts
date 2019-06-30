import * as Layers from "./layers"
import { Vec2, PushOnlyArray } from "../util"
import { TextureId, Texture, createTextureWithFramebuffer } from "./texture"
import { Shader as TextureShader } from "./textureShader"

/*
 * Bind any new layers to their own textures
 * Determine which layers are above and what layers are below
 * Render brush inputs to StrokeTexture
 * Calculate size of StrokeTexture based on brush inputs
 * Render above layers to the AboveTexture (when layers change)
 * Render below layers to the BelowTexture (when layers change)
 * Render brush texture to BrushOutlineTexture (when brush change)
 * Render (BelowTexture, LayerTexture, StrokeTexture, AboveTexture, BrushOutlineTexture) to OutputTexture
 * Render OutputTexture to canvas (with transforms and in sRGB)
 */

export interface LayersToCombine {
    readonly above: null | Layers.CollectedLayer[]
    readonly below: null | Layers.CollectedLayer[]
    readonly current: null | Layers.CollectedLayer
}

export function getLayersToCombine(
    prevLayers: Layers.SplitLayers,
    nextLayers: Layers.SplitLayers
): LayersToCombine {
    const nextAbove = nextLayers.above
    const nextBelow = nextLayers.below

    let above: null | Layers.CollectedLayer[] = null
    let below: null | Layers.CollectedLayer[] = null

    if (layersAreDifferent(prevLayers.above, nextAbove)) {
        above = []
        for (let i = 0; i < nextAbove.length; i++) {
            const layer = nextAbove[i]
            if (layer.opacity !== 0) {
                above.push(layer)
            }
        }
    }

    if (layersAreDifferent(prevLayers.below, nextBelow)) {
        below = []
        for (let i = nextBelow.length - 1; i >= 0; i--) {
            const layer = nextBelow[i]
            if (layer.opacity !== 0) {
                below.push(layer)
            }
        }
    }

    return { above, below, current: nextLayers.current }
}

function layersAreDifferent(
    prev: readonly Layers.CollectedLayer[],
    next: readonly Layers.CollectedLayer[]
): boolean {
    if (prev.length !== next.length) {
        return true
    }
    for (let i = 0; i < next.length; i++) {
        if (prev[i].id !== next[i].id) {
            return true
        }
    }
    return false
}

export interface CombineLayersArgs {
    readonly gl: WebGLRenderingContext
    readonly resolution: Vec2
    readonly allTextures: PushOnlyArray<Texture>
    readonly layersToRender: LayersToCombine
    readonly textureShader: TextureShader
    readonly textureBindings: (readonly [TextureId | null, number])[]
    readonly layerTextureMap: Map<Layers.Id, Texture>
    readonly textureAbove: Texture
    readonly textureBelow: Texture
    readonly textureCurrent: Texture
}

export function combineLayers(args: CombineLayersArgs): void {
    const {
        gl,
        allTextures,
        resolution,
        layersToRender,
        textureShader,
        textureBindings,
        layerTextureMap,
    } = args

    const layersAbove = layersToRender.above
    const layersBelow = layersToRender.below
    const layersCurrent = layersToRender.current

    gl.clearColor(0, 0, 0, 0)

    if (layersAbove !== null) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, args.textureAbove.framebuffer)
        gl.clear(gl.COLOR_BUFFER_BIT)
        for (let i = 0; i < layersAbove.length; i++) {
            const layer = layersAbove[i]
            let texture = layerTextureMap.get(layer.id)
            if (texture == null) {
                texture = createTextureWithFramebuffer(gl, allTextures, textureBindings, resolution)
                layerTextureMap.set(layer.id, texture)
            }
            textureShader.render(gl, {
                blocks: [
                    {
                        x0: 0,
                        y0: 0,
                        x1: resolution.x,
                        y1: resolution.y,
                    },
                ],
                framebuffer: args.textureAbove.framebuffer,
                uniforms: {
                    u_opacity: layer.opacity,
                    u_resolution: resolution,
                    u_texture: ensureTextureIsBound(gl, textureBindings, texture),
                },
            })
        }
    }

    if (layersBelow !== null) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, args.textureBelow.framebuffer)
        gl.clear(gl.COLOR_BUFFER_BIT)
        for (let i = 0; i < layersBelow.length; i++) {
            const layer = layersBelow[i]
            let texture = layerTextureMap.get(layer.id)
            if (texture == null) {
                texture = createTextureWithFramebuffer(gl, allTextures, textureBindings, resolution)
                layerTextureMap.set(layer.id, texture)
            }
            textureShader.render(gl, {
                blocks: [
                    {
                        x0: 0,
                        y0: 0,
                        x1: resolution.x,
                        y1: resolution.y,
                    },
                ],
                framebuffer: args.textureBelow.framebuffer,
                uniforms: {
                    u_opacity: layer.opacity,
                    u_resolution: resolution,
                    u_texture: ensureTextureIsBound(gl, textureBindings, texture),
                },
            })
        }
    }

    if (layersCurrent !== null) {
        let texture = layerTextureMap.get(layersCurrent.id)
        if (texture == null) {
            texture = createTextureWithFramebuffer(gl, allTextures, textureBindings, resolution)
            layerTextureMap.set(layersCurrent.id, texture)
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, args.textureCurrent.framebuffer)
        gl.clear(gl.COLOR_BUFFER_BIT)
        textureShader.render(gl, {
            blocks: [
                {
                    x0: 0,
                    y0: 0,
                    x1: resolution.x,
                    y1: resolution.y,
                },
            ],
            framebuffer: args.textureCurrent.framebuffer,
            uniforms: {
                u_opacity: layersCurrent.opacity,
                u_resolution: resolution,
                u_texture: ensureTextureIsBound(gl, textureBindings, texture),
            },
        })
    }
}

function ensureTextureIsBound(
    gl: WebGLRenderingContext,
    textureBindings: (readonly [TextureId | null, number])[],
    { texture, id }: Texture
): number {
    for (let i = 0; i < textureBindings.length; i++) {
        if (textureBindings[i][0] === id) {
            gl.activeTexture(gl.TEXTURE0 + i)
            return i
        }
    }

    // Texture isn't bound yet. We need to find an open binding

    for (let i = 0; i < textureBindings.length; i++) {
        if (textureBindings[i][0] === null) {
            gl.activeTexture(gl.TEXTURE0 + i)
            gl.bindTexture(gl.TEXTURE_2D, texture)
            textureBindings[i] = [id, performance.now()]
            return i
        }
    }

    // There is no open binding. We need to replace something that's already bound.
    {
        let minTime = Number.MAX_VALUE
        let minTimeIdx = 0
        for (let i = 0; i < textureBindings.length; i++) {
            const time = textureBindings[i][1]
            if (time < minTime) {
                minTime = time
                minTimeIdx = i
            }
        }
        gl.activeTexture(gl.TEXTURE0 + minTimeIdx)
        gl.bindTexture(gl.TEXTURE_2D, texture)
        textureBindings[minTimeIdx] = [id, performance.now()]
        return minTimeIdx
    }
}
