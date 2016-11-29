var TSPainter;
(function (TSPainter) {
    /*
        Variation of smoothstep
    
        https://en.wikipedia.org/wiki/Smoothstep#Variations
    */
    TSPainter.SHADER_FUNC_smootherstep = [
        "float smootherstep(float edge0, float edge1, float x) {",
        "	x = clamp((x - edge0)/(edge1 - edge0), 0.0, 1.0);",
        "	return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);",
        "}"
    ].join("\n");
    /*
        GLSL function for converting hsv to rgb.
 
        vec3 hsv2rgb(vec3);
    */
    TSPainter.SHADER_FUNC_hsv2rgb = [
        // TODO: figure out which of the two functions is more correct. They each have slightly different 
        // gradients between primary hues. Sam's looks smoother, so I'm sticking to that for now.
        // https://www.shadertoy.com/view/MsS3Wc - Iñigo Quiles 
        /*'vec3 hsv2rgb(in vec3 c) {',
        '	vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);',
        '	rgb = rgb * rgb * (3.0 - 2.0 * rgb);',
        '	return c.z * mix(vec3(1.0), rgb, c.y);',
        '}',*/
        // http://lolengine.net/blog/2013/07/27/rgb-to-hsv-in-glsl - Sam Hocevar
        "vec3 hsv2rgb(vec3 c) {",
        "	vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);",
        "	vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);",
        "	return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);",
        "}",
        "vec4 hsv2rgb(vec4 c) {",
        "	return vec4(hsv2rgb(c.rgb), c.a);",
        "}",
    ].join("\n");
    /*
        GLSL function for converting rgb to hsv.
    
        vec3 rgb2hsv(vec3);
    */
    TSPainter.SHADER_FUNC_rgb2hsv = [
        // http://lolengine.net/blog/2013/07/27/rgb-to-hsv-in-glsl - Sam Hocevar
        "vec3 rgb2hsv(vec3 c) {",
        "	vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);",
        "	vec4 p = c.g < c.b ? vec4(c.bg, K.wz) : vec4(c.gb, K.xy);",
        "	vec4 q = c.r < p.x ? vec4(p.xyw, c.r) : vec4(c.r, p.yzx);",
        "	float d = q.x - min(q.w, q.y);",
        "	float e = 1.0e-10;",
        "	return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);",
        "}"
    ].join("\n");
    /*
        Defines constants for PI and TAU (2PI)
    */
    TSPainter.SHADER_DEFINE_PI = [
        "\n#ifndef PI",
        "	#define PI 3.14159265359",
        "#endif",
        "#ifndef TAU",
        "	#define TAU 6.283185307179586",
        "#endif\n"
    ].join("\n");
    /*
        RNG
    */
    TSPainter.SHADER_FUNC_rand = [
        "float rand(float n) {",
        "	return fract(sin(n) * 43758.5453123);",
        "}",
        "float rand(vec2 n) {",
        "	return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);",
        "}",
    ].join("\n");
    /*
        pow with vectors
    */
    TSPainter.SHADER_FUNC_pow = [
        "vec2 pow(vec2 vec, float power) {",
        "	return vec2(pow(vec.x, power), pow(vec.y, power));",
        "}",
        "vec3 pow(vec3 vec, float power) {",
        "	return vec3(pow(vec.x, power), pow(vec.y, power), pow(vec.z, power));",
        "}",
        "vec4 pow(vec4 vec, float power) {",
        "	return vec4(pow(vec.x, power), pow(vec.y, power), pow(vec.z, power), pow(vec.w, power));",
        "}",
    ].join("\n");
    /*
        Converts from rgb to greyscale using the values found here
        http://alienryderflex.com/hsp.html
    
        Basic: humans see certain hues more clearly, so simply averaging the rgb values doesn't
        generate a good greyscale. For example in HSV, a fully saturated blue is significantly
        darker than a fully saturated green, and yet if you convert them to greyscale by averaging,
        they will both generate the same tone.
    
        We need to take our human brightness perception into account. To do this we assign r, g,
        and b, separate multipliers that correspond with how brightly we perceive them. These
        multipliers add up to a total of 1.0.
    
        r * 0.299
        g * 0.587
        b * 0.114
 
    */
    TSPainter.SHADER_FUNC_toGreyscale = [
        "float toGreyscale( in vec3 color ) {",
        "	return 0.299 * color.r + 0.587 * color.g + 0.114 * color.b;",
        "}",
        "vec3 toGreyscale( in vec3 color ) {",
        "	return vec3(toGreyscale(color));",
        "}",
        "vec4 toGreyscale( in vec4 color ) {",
        "	return vec4(toGreyscale(color.rgb), color.a);",
        "}",
    ].join("\n");
    /*
        Previously used this to generator my cursor outline.
 
        https://en.wikipedia.org/wiki/Sobel_operator#Alternative_operators
    */
    TSPainter.SHADER_FUNC_sobelOperator = [
        "float sobelOperator() {",
        "	float alpha = 0.0;",
        // top
        "	alpha -= texture2D(uSampler, vTextureCoord + vec2(-stepSize.x,	-stepSize.y)).a * 3.0;",
        "	alpha -= texture2D(uSampler, vTextureCoord + vec2(0.0,			-stepSize.y)).a * 10.0;",
        "	alpha -= texture2D(uSampler, vTextureCoord + vec2(stepSize.x,	-stepSize.y)).a * 3.0;",
        // middle
        "	alpha -= texture2D(uSampler, vTextureCoord + vec2(-stepSize.x,	0.0)).a * 10.0;",
        "	alpha += texture2D(uSampler, vTextureCoord + vec2(0.0,			0.0)).a * 52.0;",
        "	alpha -= texture2D(uSampler, vTextureCoord + vec2(stepSize.x,	0.0)).a * 10.0;",
        // bottom
        "	alpha -= texture2D(uSampler, vTextureCoord + vec2(-stepSize.x,	stepSize.y)).a * 3.0;",
        "	alpha -= texture2D(uSampler, vTextureCoord + vec2(0.0,			stepSize.y)).a * 10.0;",
        "	alpha -= texture2D(uSampler, vTextureCoord + vec2(stepSize.x,	stepSize.y)).a * 3.0;",
        "	return alpha;",
        "}",
    ].join("\n");
})(TSPainter || (TSPainter = {}));
var TSPainter;
(function (TSPainter) {
    class Attribute {
        constructor(type, size, 
            // I want to do instancing to reduce the size of my vertex buffer, but I don't know how to do it currently.
            // It might also cause issues if certain browsers don't support it.
            instanced = false) {
            this.type = type;
            this.size = size;
            this.instanced = instanced;
            this.location = null;
        }
    }
    TSPainter.Attribute = Attribute;
    class Uniform {
        constructor(type, value) {
            this.type = type;
            this.value = value;
            this.location = null;
        }
    }
    TSPainter.Uniform = Uniform;
    class Shader {
        constructor(renderer, vertSrc, fragSrc, attributes = {}, uniforms = {}, maxTriangles, // if elementsArray is set to true, then this is counted as squares instead of triangles
            elements = false) {
            this._renderer = renderer;
            this._program = this._compileProgram(renderer.gl, vertSrc, fragSrc);
            this.attributes = attributes;
            this.uniforms = uniforms;
            this.bindAttributeLocations();
            this.cacheUniformLocations();
            if (elements === false) {
                this.batch = new TSPainter.Batch(renderer, attributes, maxTriangles);
            }
            else {
                this.batch = new TSPainter.ElementsBatch(renderer, attributes, maxTriangles);
            }
        }
        activate() {
            this._renderer.gl.useProgram(this._program);
        }
        bindAttributeLocations() {
            const gl = this._renderer.gl;
            const attributes = this.attributes;
            const keys = Object.keys(attributes);
            const program = this._program;
            // bind locations sequentially starting at 0
            // this means that the sorting of the attributes will determine their locations
            // I don't yet know if their locations matter, though.
            for (let i = 0, ilen = keys.length; i < ilen; i++) {
                gl.bindAttribLocation(program, i, keys[i]);
                attributes[keys[i]].location = i;
            }
        }
        cacheUniformLocations() {
            const gl = this._renderer.gl;
            const uniforms = this.uniforms;
            const program = this._program;
            const keys = Object.keys(uniforms);
            for (let i = 0, ilen = keys.length; i < ilen; i++) {
                uniforms[keys[i]].location = gl.getUniformLocation(program, keys[i]);
            }
        }
        syncUniforms() {
            const gl = this._renderer.gl;
            const uniforms = this.uniforms;
            const keys = Object.keys(uniforms);
            for (let i = 0, ilen = keys.length; i < ilen; i++) {
                this._syncUniform(uniforms[keys[i]]);
            }
        }
        _syncUniform(uniform) {
            const location = uniform.location;
            const value = uniform.value;
            switch (uniform.type) {
                case "b":
                    this._renderer.gl.uniform1i(location, (value === true ? 1 : 0));
                    break;
                case "i1":
                case "1i":
                    this._renderer.gl.uniform1i(location, value);
                    break;
                case "i2":
                case "2i":
                    this._renderer.gl.uniform2i(location, value.x, value.y);
                    break;
                case "i3":
                case "3i":
                    this._renderer.gl.uniform3i(location, value.x, value.y, value.z);
                    break;
                case "i4":
                case "4i":
                    this._renderer.gl.uniform4i(location, value.x, value.y, value.z, value.w);
                    break;
                case "f1":
                case "1f":
                    this._renderer.gl.uniform1f(location, value);
                    break;
                case "f2":
                case "2f":
                    this._renderer.gl.uniform2f(location, value.x, value.y);
                    break;
                case "f3":
                case "3f":
                    this._renderer.gl.uniform3f(location, value.x, value.y, value.z);
                    break;
                case "f4":
                case "4f":
                    this._renderer.gl.uniform4f(location, value.x, value.y, value.z, value.w);
                    break;
                case "mat3":
                    this._renderer.gl.uniformMatrix3fv(location, false, value);
                    break;
                case "t":
                    const idx = this._renderer.textureManager.bindTexture(value, 0);
                    this._renderer.gl.uniform1i(location, idx);
                    break;
                default:
                    console.error("Shader -- unknown uniform type: ", uniform.type, " -- value: ", value);
                    return;
            }
        }
        _recompileProgram(vertSrc, fragSrc) {
            const gl = this._renderer.gl;
            const newProgram = this._compileProgram(gl, vertSrc, fragSrc);
            if (newProgram === null) {
                console.warn("Failed to recompile program.");
                return false;
            }
            gl.deleteProgram(this._program);
            this._program = newProgram;
            return true;
        }
        _compileProgram(gl, vertSrc, fragSrc) {
            const vert = this._compileShader(gl, vertSrc, gl.VERTEX_SHADER);
            const frag = this._compileShader(gl, fragSrc, gl.FRAGMENT_SHADER);
            const program = gl.createProgram();
            gl.attachShader(program, vert);
            gl.attachShader(program, frag);
            gl.linkProgram(program);
            gl.deleteShader(vert);
            gl.deleteShader(frag);
            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                console.error("Failed to link program");
                console.warn("Validate status: ", gl.getProgramParameter(program, gl.VALIDATE_STATUS));
                console.warn("Error: ", gl.getError());
                console.warn("ProgramInfoLog: ", gl.getProgramInfoLog(program));
                gl.deleteProgram(program);
                throw new Error();
            }
            return program;
        }
        _compileShader(gl, src, type) {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, src);
            gl.compileShader(shader);
            if (gl.getShaderParameter(shader, gl.COMPILE_STATUS) === false) {
                console.error("Failed to compile shader");
                console.warn("ShaderInfoLog: ", gl.getShaderInfoLog(shader));
                console.log(src);
                gl.deleteShader(shader);
                throw new Error();
            }
            return shader;
        }
    }
    TSPainter.Shader = Shader;
})(TSPainter || (TSPainter = {}));
var TSPainter;
(function (TSPainter) {
    // Define blend modes
    (function (BlendMode) {
        BlendMode[BlendMode["Normal"] = 0] = "Normal";
        BlendMode[BlendMode["Erase"] = 1] = "Erase";
    })(TSPainter.BlendMode || (TSPainter.BlendMode = {}));
    var BlendMode = TSPainter.BlendMode;
})(TSPainter || (TSPainter = {}));
var TSPainter;
(function (TSPainter) {
    /*
        In the future I'm going to need to support Lab color format as well, and possibly more.
        I'll keep it simple for now, though.
    */
    /*
        Object for containing both RGBA and HSVA values of a color. Useful in places where you
        regularly want to convert between the two formats.
    */
    class ColorConverter {
        constructor() {
            this.rgba = new TSPainter.Vec4();
            this.hsva = new TSPainter.Vec4();
        }
        toHsva() {
            ColorFuncs.rgba2hsva(this.rgba, this.hsva);
        }
        toRgba() {
            ColorFuncs.hsva2rgba(this.hsva, this.rgba);
        }
    }
    TSPainter.ColorConverter = ColorConverter;
    /*
        Generic color functions
    */
    var ColorFuncs;
    (function (ColorFuncs) {
        /*
            Takes RGB values from the first input and puts the HSV equivalent into the second input
    
            Expected ranges
            rgb: [0 : 1] for all values
            hsv: [0 : 1] for all values
        */
        function rgb2hsv(rgb, hsv) {
            var r = rgb.r, g = rgb.g, b = rgb.b, h, max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
            hsv.s = (max == 0 ? 0 : d / max);
            hsv.v = max;
            switch (max) {
                case min:
                    h = 0;
                    break;
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
            hsv.h = h;
        }
        ColorFuncs.rgb2hsv = rgb2hsv;
        /*
            Takes RGBA values from the first input and puts the HSV equivalent into the second input
    
            Expected ranges
            rgba: [0 : 1] for all values
            hsva: [0 : 1] for all values
        */
        function rgba2hsva(rgba, hsva) {
            rgb2hsv(rgba, hsva);
            hsva.a = rgba.a;
        }
        ColorFuncs.rgba2hsva = rgba2hsva;
        /*
            Takes HSV values from the first input and puts the RGB equivalent into the second input
    
            Expected ranges
            hsv: [0 : 1] for all values
            rgb: [0 : 1] for all values
        */
        function hsv2rgb(hsv, rgb) {
            var h = hsv.x, s = hsv.y, v = hsv.z, r, g, b, i, f, p, q, t;
            i = Math.floor(h * 6);
            f = h * 6 - i;
            p = v * (1 - s);
            q = v * (1 - f * s);
            t = v * (1 - (1 - f) * s);
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
                case 5:
                    r = v, g = p, b = q;
                    break;
            }
            rgb.r = r;
            rgb.g = g;
            rgb.b = b;
        }
        ColorFuncs.hsv2rgb = hsv2rgb;
        /*
            Takes HSVA values from the first input and puts the RGB equivalent into the second input
    
            Expected ranges
            hsva: [0 : 1] for all values
            rgba: [0 : 1] for all values
        */
        function hsva2rgba(hsva, rgba) {
            hsv2rgb(hsva, rgba);
            rgba.a = hsva.a;
        }
        ColorFuncs.hsva2rgba = hsva2rgba;
        /*
            Returns the base-10 representation of rgb hex color
        */
        function rgbToHex(rgb) {
            // do I need to floor the numbers before bitwise shifting?
            return (((rgb.r * 255) | 0) << 16)
                + (((rgb.g * 255) | 0) << 8)
                + ((rgb.b * 255) | 0);
        }
        ColorFuncs.rgbToHex = rgbToHex;
        /*
            Returns the base-10 representation of rgba hex color
        */
        function rgbaToHex(rgba) {
            return (((rgba.r * 255) | 0) << 24)
                + (((rgba.g * 255) | 0) << 16)
                + (((rgba.b * 255) | 0) << 8)
                + ((rgba.a * 255) | 0);
        }
        ColorFuncs.rgbaToHex = rgbaToHex;
    })(ColorFuncs || (ColorFuncs = {}));
})(TSPainter || (TSPainter = {}));
/*

*/
var TSPainter;
(function (TSPainter) {
    var Settings;
    (function (Settings) {
        class Setting {
            constructor(id, value, callbacks = []) {
                this.id = id;
                this.value = value;
                this.callbacks = callbacks;
            }
        }
        Settings.Setting = Setting;
        /*
            Object to contain all settings objects
        */
        const _settings = {};
        /*
            Set a new value for a setting and broadcast it to all subscribers
        */
        function setValue(id, value) {
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
        Settings.setValue = setValue;
        /*
            Get the current value of a setting
        */
        function getValue(id) {
            return _settings[id].value;
        }
        Settings.getValue = getValue;
        /*
            Subscribe to a setting with a callback
        */
        function subscribe(id, callback) {
            let setting = _settings[id];
            if (setting == null) {
                setting = new Setting(id, null);
                _settings[id] = setting;
            }
            setting.callbacks.push(callback);
        }
        Settings.subscribe = subscribe;
        /*
            Broadcast a value change to all callbacks
        */
        function broadcast(setting) {
            const callbacks = setting.callbacks;
            const value = setting.value;
            for (let i = 0, ilen = callbacks.length; i < ilen; i++) {
                callbacks[i](value);
            }
        }
        /*
            Define the names of all settings
        */
        (function (ID) {
            // display
            ID[ID["CanvasWidth"] = 0] = "CanvasWidth";
            ID[ID["CanvasHeight"] = 1] = "CanvasHeight";
            ID[ID["Gamma"] = 2] = "Gamma";
            // brush
            ID[ID["BrushSize"] = 3] = "BrushSize";
            ID[ID["BrushSoftness"] = 4] = "BrushSoftness";
            ID[ID["BrushPointSpacing"] = 5] = "BrushPointSpacing";
            ID[ID["BrushHue"] = 6] = "BrushHue";
            ID[ID["BrushSaturation"] = 7] = "BrushSaturation";
            ID[ID["BrushValue"] = 8] = "BrushValue";
            ID[ID["BrushAlpha"] = 9] = "BrushAlpha";
            // rendering
            ID[ID["RenderingMaxDrawPoints"] = 10] = "RenderingMaxDrawPoints";
            ID[ID["RenderingBlendMode"] = 11] = "RenderingBlendMode";
        })(Settings.ID || (Settings.ID = {}));
        var ID = Settings.ID;
    })(Settings = TSPainter.Settings || (TSPainter.Settings = {}));
})(TSPainter || (TSPainter = {}));
/*
    Global object for handling events. I don't yet know how extensively it will be used.

    This event module broadcasts events immediately, as opposed to storing them for later use.
*/
var TSPainter;
(function (TSPainter) {
    var Event;
    (function (Event) {
        /*
            Object contains all the callbacks
        */
        const _callbacks = {};
        /*
            Register a callback to an event id
        */
        function subscribe(id, callback) {
            let callList = _callbacks[id];
            if (callList == null) {
                callList = [];
                _callbacks[id] = callList;
            }
            callList.push(callback);
        }
        Event.subscribe = subscribe;
        /*
            Send an event to all registered callbacks
        */
        function broadcast(id, arg) {
            const callList = _callbacks[id];
            if (callList != null) {
                // Call every callback
                for (let i = 0, ilen = callList.length; i < ilen; i++) {
                    callList[i](arg);
                }
            }
            else {
                // Useful for detecting unused event IDs
                console.warn("Event " + id + " does not have any callbacks associated with it.");
            }
        }
        Event.broadcast = broadcast;
        (function (ID) {
            ID[ID["MOUSE_DOWN"] = 0] = "MOUSE_DOWN";
            ID[ID["MOUSE_UP"] = 1] = "MOUSE_UP";
            ID[ID["MOUSE_MOVE"] = 2] = "MOUSE_MOVE";
            ID[ID["MOUSE_DRAG"] = 3] = "MOUSE_DRAG";
        })(Event.ID || (Event.ID = {}));
        var ID = Event.ID;
    })(Event = TSPainter.Event || (TSPainter.Event = {}));
})(TSPainter || (TSPainter = {}));
/// <reference path="Rendering/Shaders/Common.ts"/>
/// <reference path="Rendering/Shaders/Shader.ts"/>
/// <reference path="Rendering/Consts.ts"/>
/// <reference path="Math/Color.ts"/>
/// <reference path="Global/Settings.ts"/>
/// <reference path="Global/Events.ts"/>
var TSPainter;
(function (TSPainter) {
    // Settings for the app. These should be stored in cookies.
    TSPainter.DEFAULT_SETTINGS = {
        // Display
        CanvasWidth: 1000,
        CanvasHeight: 1000,
        Gamma: 2.2,
        // Brush
        BrushSize: 12,
        BrushPointSpacing: .01,
        BrushSoftness: 0.1,
        BrushHue: .8,
        BrushSaturation: 1,
        BrushValue: 0,
        BrushAlpha: .99,
        // Rendering
        RenderingMaxDrawPoints: 10000,
        RenderingBlendMode: TSPainter.BlendMode.Normal
    };
    TSPainter.dotsPerFrame = 10;
    /*
        Sets the settings values from DEFAULT_SETTINGS
    */
    function initSettings() {
        const keys = Object.keys(TSPainter.DEFAULT_SETTINGS);
        let key;
        for (let i = 0, ilen = keys.length; i < ilen; i++) {
            TSPainter.Settings.setValue(i, TSPainter.DEFAULT_SETTINGS[TSPainter.Settings.ID[i]]);
        }
    }
    let rng;
    let canvas;
    let renderingContext;
    let inputCapture;
    let interpolator;
    let renderingCoordinator;
    let svgContainer;
    let toolbar;
    function init() {
        rng = new TSPainter.RNG(1);
        canvas = TSPainter.getCanvasById("paintingArea");
        canvas.width = TSPainter.Settings.getValue(TSPainter.Settings.ID.CanvasWidth);
        canvas.height = TSPainter.Settings.getValue(TSPainter.Settings.ID.CanvasHeight);
        renderingContext = new TSPainter.CanvRenderingContext(canvas);
        inputCapture = new TSPainter.InputCapture(canvas);
        interpolator = new TSPainter.Interpolator(TSPainter.Settings.getValue(TSPainter.Settings.ID.RenderingMaxDrawPoints), TSPainter.Settings.getValue(TSPainter.Settings.ID.BrushPointSpacing) * renderingContext.brushTexture.width / 100);
        renderingCoordinator = new TSPainter.RenderingCoordinator(_render);
        TSPainter.Settings.subscribe(TSPainter.Settings.ID.BrushPointSpacing, (n) => {
            interpolator.spacingThresholdPx = n * TSPainter.Settings.getValue(TSPainter.Settings.ID.BrushPointSpacing);
        });
        TSPainter.Event.subscribe(TSPainter.Event.ID.MOUSE_MOVE, _onMouseMove);
        TSPainter.Event.subscribe(TSPainter.Event.ID.MOUSE_DRAG, _onMouseDrag);
        TSPainter.Event.subscribe(TSPainter.Event.ID.MOUSE_DOWN, _onMouseDown);
        TSPainter.Event.subscribe(TSPainter.Event.ID.MOUSE_UP, _onMouseUp);
        console.log();
        _drawPoint = new TSPainter.DrawPoint();
        _color = new TSPainter.ColorConverter();
        // setup UI
        svgContainer = TSPainter.getSvgById("uiSvg");
        svgContainer.setAttribute("width", canvas.width.toString());
        svgContainer.setAttribute("height", canvas.height.toString());
        toolbar = new TSPainter.Toolbar(svgContainer);
    }
    let n_ani = 0;
    function animate() {
        generateRandomPoints(interpolator.drawPoints, rng, TSPainter.dotsPerFrame);
        _render();
        if (n_ani < 200) {
            requestAnimationFrame(() => animate());
            n_ani++;
        }
        else {
        }
    }
    let _drawPoint;
    let _color;
    function _updateDrawPoint(data) {
        _drawPoint.x = data.x;
        _drawPoint.y = data.y;
        _drawPoint.scale = data.pressure;
        _drawPoint.size = TSPainter.Settings.getValue(TSPainter.Settings.ID.BrushSize);
        _drawPoint.rotation = 0;
        generateColor(_color, rng);
        _drawPoint.setColor(_color.rgba);
    }
    const _onMouseMove = (data) => { };
    const _onMouseDrag = (data) => {
        _updateDrawPoint(data);
        interpolator.interpolate(_drawPoint);
        render();
    };
    const _onMouseDown = (data) => {
        _updateDrawPoint(data);
        interpolator.setInitialPoint(_drawPoint);
        render();
    };
    const _onMouseUp = (data) => {
        render();
    };
    function render() {
        renderingCoordinator.requestRender();
    }
    const _render = () => {
        if (interpolator.drawPoints.count() > 0) {
            renderingContext.renderDrawPoints(interpolator.drawPoints);
        }
    };
    // Starting point of the application
    function main() {
        initSettings();
        init();
        animate();
    }
    TSPainter.main = main;
    function toCanvasCoordinates(coords) {
    }
    TSPainter.toCanvasCoordinates = toCanvasCoordinates;
    function generateRandomPoints(drawPoints, rng, n) {
        const color = new TSPainter.ColorConverter();
        const colorHsva = color.hsva;
        let x, y, rotation, size;
        let drawPoint;
        for (let i = 0; i < n; i++) {
            x = rng.next() * 1000;
            y = rng.next() * 1000;
            generateColor(color, rng);
            size = 10;
            rotation = rng.next() * Math.PI;
            drawPoint = drawPoints.newPoint();
            drawPoint.setColor(color.rgba);
            drawPoint.x = x;
            drawPoint.y = y;
            drawPoint.size = size;
            drawPoint.rotation = rotation;
        }
    }
    const colortest = 1;
    function generateColor(color, rng) {
        const hsva = color.hsva;
        switch (colortest) {
            case 0:
                hsva.h = rng.next();
                hsva.s = .8 + .2 * rng.next();
                hsva.v = .7 + .3 * rng.next();
                hsva.a = 1;
                break;
            case 1:
                hsva.h = (Date.now() % 1000) / 1000;
                hsva.s = .7;
                hsva.v = 1;
                hsva.a = TSPainter.Settings.getValue(TSPainter.Settings.ID.BrushAlpha);
                hsva.a = hsva.a * .1 + TSPainter.expostep(hsva.a) * .9;
                break;
            case 2:
                hsva.h = TSPainter.Settings.getValue(TSPainter.Settings.ID.BrushHue);
                hsva.s = TSPainter.Settings.getValue(TSPainter.Settings.ID.BrushSaturation);
                hsva.v = TSPainter.Settings.getValue(TSPainter.Settings.ID.BrushValue);
                hsva.a = TSPainter.Settings.getValue(TSPainter.Settings.ID.BrushAlpha);
                hsva.a = hsva.a * .1 + TSPainter.expostep(hsva.a) * .9;
                break;
            default:
                hsva.h = 0;
                hsva.s = 0;
                hsva.v = 0;
                hsva.a = 1;
                break;
        }
        hsva.pow(TSPainter.Settings.getValue(TSPainter.Settings.ID.Gamma));
        color.toRgba();
    }
})(TSPainter || (TSPainter = {}));
window.onload = TSPainter.main;
var TSPainter;
(function (TSPainter) {
    class InputCapture {
        constructor(canvas) {
            this._canvasPos = new TSPainter.Vec2();
            this._data = new TSPainter.InputData();
            this._mouseDown = false;
            this._onMouseDown = (ev) => {
                this._mouseDown = true;
                this.addMousePosition(ev, TSPainter.InputType.Down, TSPainter.InputInterface.Mouse);
                TSPainter.Event.broadcast(TSPainter.Event.ID.MOUSE_DOWN, this._data);
            };
            this._onMouseMove = (ev) => {
                this.addMousePosition(ev, TSPainter.InputType.Move, TSPainter.InputInterface.Mouse);
                TSPainter.Event.broadcast(TSPainter.Event.ID.MOUSE_MOVE, this._data);
                if (this._mouseDown === true) {
                    TSPainter.Event.broadcast(TSPainter.Event.ID.MOUSE_DRAG, this._data);
                }
            };
            this._onMouseUp = (ev) => {
                this._mouseDown = false;
                this.addMousePosition(ev, TSPainter.InputType.Up, TSPainter.InputInterface.Mouse);
                TSPainter.Event.broadcast(TSPainter.Event.ID.MOUSE_UP, this._data);
            };
            this._canvas = canvas;
            this.updateCanvasPosition();
            // TODO: event registration should be moved out of this class I think
            document.addEventListener("mousedown", this._onMouseDown);
            document.addEventListener("mousemove", this._onMouseMove);
            document.addEventListener("mouseup", this._onMouseUp);
        }
        addMousePosition(ev, inputType, interf) {
            const data = this._data;
            const x = ev.clientX - this._canvasPos.x;
            const y = ev.clientY - this._canvasPos.y;
            data.interf = interf;
            data.type = inputType;
            data.setMods(ev.shiftKey, ev.altKey, ev.ctrlKey);
            data.xy(x, y);
        }
        updateCanvasPosition() {
            const bounds = this._canvas.getBoundingClientRect();
            this._canvasPos.xy(bounds.left, bounds.top);
        }
    }
    TSPainter.InputCapture = InputCapture;
})(TSPainter || (TSPainter = {}));
var TSPainter;
(function (TSPainter) {
    // modulus with expected behaviour
    function mod(n, m) { return ((n % m) + m) % m; }
    TSPainter.mod = mod;
    // expects x to be in range [0, 1]
    function smoothstep(x) { return x * x * (3 - 2 * x); }
    TSPainter.smoothstep = smoothstep;
    // expects x to be in range [0, 1]
    function smootherstep(x) { return x * x * x * (x * (x * 6 - 15) + 10); }
    TSPainter.smootherstep = smootherstep;
    // exponentially scale from 0 to 1
    function expostep(x) {
        if (x === 0.0)
            return 0.0;
        return Math.pow(2.718281828459, (1 - (1 / (x * x))));
    }
    TSPainter.expostep = expostep;
    function isPowerOfTwo(width, height) {
        return (width > 0 && (width & (width - 1)) === 0 && height > 0 && (height & (height - 1)) === 0);
    }
    TSPainter.isPowerOfTwo = isPowerOfTwo;
})(TSPainter || (TSPainter = {}));
/// <reference path="Utils.ts"/>
var TSPainter;
(function (TSPainter) {
    class Vec2 {
        constructor(x = 0.0, y = 0.0) {
            this.x = x;
            this.y = y;
        }
        xy(x, y) {
            this.x = x;
            this.y = y;
            return this;
        }
        plus(n) {
            this.x += n;
            this.y += n;
            return this;
        }
        minus(n) {
            this.x -= n;
            this.y -= n;
            return this;
        }
        multiply(n) {
            this.x *= n;
            this.y *= n;
            return this;
        }
        divide(n) {
            this.x /= n;
            this.y /= n;
            return this;
        }
        modulo(n) {
            this.x = TSPainter.mod(this.x, n);
            this.y = TSPainter.mod(this.y, n);
            return this;
        }
        static distance(from, to) {
            return Math.sqrt(Math.pow((to.x - from.x), 2) + Math.pow((to.y - from.y), 2));
        }
        equals(rhs) {
            return this.x === rhs.x && this.y === rhs.y;
        }
        static dot(lhs, rhs) {
            return lhs.x * rhs.x + lhs.y * rhs.y;
        }
        static angle(from, to) {
            return Math.atan2(to.y - from.y, to.x - from.y);
        }
    }
    TSPainter.Vec2 = Vec2;
})(TSPainter || (TSPainter = {}));
/// <reference path = "../Math/Vec2.ts"/>
var TSPainter;
(function (TSPainter) {
    (function (InputInterface) {
        InputInterface[InputInterface["Mouse"] = 0] = "Mouse";
        InputInterface[InputInterface["Keyboard"] = 1] = "Keyboard";
        InputInterface[InputInterface["Pen"] = 2] = "Pen";
        InputInterface[InputInterface["Touch"] = 3] = "Touch";
    })(TSPainter.InputInterface || (TSPainter.InputInterface = {}));
    var InputInterface = TSPainter.InputInterface;
    (function (InputType) {
        // Mouse
        InputType[InputType["Down"] = 0] = "Down";
        InputType[InputType["Up"] = 1] = "Up";
        InputType[InputType["Move"] = 2] = "Move";
        InputType[InputType["Drag"] = 3] = "Drag";
    })(TSPainter.InputType || (TSPainter.InputType = {}));
    var InputType = TSPainter.InputType;
    class InputData extends TSPainter.Vec2 {
        constructor() {
            super(...arguments);
            this.interf = InputInterface.Keyboard;
            this.type = InputType.Down;
            this.whichKey = 0;
            this.x = 0;
            this.y = 0;
            this.shift = false;
            this.alt = false;
            this.ctrl = false;
            this.pressure = 1;
            this.tiltX = 0;
            this.tiltY = 0;
        }
        setMods(shift, alt, ctrl) {
            this.shift = shift;
            this.alt = alt;
            this.ctrl = ctrl;
        }
        setPenData(pressure, tiltX, tiltY) {
            this.pressure = pressure;
            this.tiltX = tiltX;
            this.tiltY = tiltY;
        }
    }
    TSPainter.InputData = InputData;
})(TSPainter || (TSPainter = {}));
var TSPainter;
(function (TSPainter) {
    class Mat3 {
        constructor() {
            this.toIdentity();
        }
        toIdentity() {
            this.a00 = 1;
            this.a01 = 0;
            this.a02 = 0;
            this.a10 = 0;
            this.a11 = 1;
            this.a12 = 0;
            return this;
        }
        setTransforms(x, y, rotation, scale) {
            // rotation
            const cos = Math.cos(rotation);
            const sin = Math.sin(rotation);
            let a00 = cos;
            const a01 = sin;
            const a10 = -sin;
            let a11 = cos;
            // scale
            a00 *= scale;
            a11 *= scale;
            // translation
            const a02 = x;
            const a12 = y;
            // set transforms
            this.a00 = a00;
            this.a01 = a01;
            this.a02 = a02;
            this.a10 = a10;
            this.a11 = a11;
            this.a12 = a12;
            return this;
        }
    }
    TSPainter.Mat3 = Mat3;
})(TSPainter || (TSPainter = {}));
var TSPainter;
(function (TSPainter) {
    class Vec3 {
        constructor(x = 0.0, y = 0.0, z = 0.0) {
            this.x = x;
            this.y = y;
            this.z = z;
        }
        // color
        get h() { return this.x; }
        get s() { return this.y; }
        get v() { return this.z; }
        get r() { return this.x; }
        get g() { return this.y; }
        get b() { return this.z; }
        set h(n) { this.x = n; }
        set s(n) { this.y = n; }
        set v(n) { this.z = n; }
        set r(n) { this.x = n; }
        set g(n) { this.y = n; }
        set b(n) { this.z = n; }
        hsv(h, s, v) {
            this.x = h;
            this.y = s;
            this.z = v;
        }
        rgb(r, g, b) {
            this.x = r;
            this.y = g;
            this.z = b;
        }
        xyz(x, y, z) {
            this.x = x;
            this.y = y;
            this.z = z;
        }
        pow(n) {
            this.x = Math.pow(this.x, n);
            this.y = Math.pow(this.y, n);
            this.z = Math.pow(this.z, n);
        }
    }
    TSPainter.Vec3 = Vec3;
})(TSPainter || (TSPainter = {}));
var TSPainter;
(function (TSPainter) {
    class Vec4 {
        constructor(x = 0.0, y = 0.0, z = 0.0, w = 0.0) {
            this.x = x;
            this.y = y;
            this.z = z;
            this.w = w;
        }
        get width() { return this.z; }
        get height() { return this.w; }
        set width(w) { this.z = w; }
        set height(h) { this.w = h; }
        // color
        get h() { return this.x; }
        get s() { return this.y; }
        get v() { return this.z; }
        get a() { return this.w; }
        get r() { return this.x; }
        get g() { return this.y; }
        get b() { return this.z; }
        set h(n) { this.x = n; }
        set s(n) { this.y = n; }
        set v(n) { this.z = n; }
        set a(n) { this.w = n; }
        set r(n) { this.x = n; }
        set g(n) { this.y = n; }
        set b(n) { this.z = n; }
        hsva(h, s, v, a) {
            this.x = h;
            this.y = s;
            this.z = v;
            this.w = a;
        }
        rgba(r, g, b, a) {
            this.x = r;
            this.y = g;
            this.z = b;
            this.w = a;
        }
        xyzw(x, y, z, w) {
            this.x = x;
            this.y = y;
            this.z = z;
            this.w = w;
        }
        pow(n) {
            this.x = Math.pow(this.x, n);
            this.y = Math.pow(this.y, n);
            this.z = Math.pow(this.z, n);
            this.w = Math.pow(this.w, n);
        }
    }
    TSPainter.Vec4 = Vec4;
})(TSPainter || (TSPainter = {}));
var TSPainter;
(function (TSPainter) {
    /*
        Base class for circular buffers.

        Expected buffer types:
        Array
        TypedArray
    */
    class ICBuffer {
        constructor(size) {
            this.headIdx = 0;
            this._initBuffer(size);
        }
        // determine the next head position
        get nextIdx() { return (this.headIdx + 1) % this.buffer.length; }
        get length() { return this.buffer.length; }
        // add an item to the front
        add(item) {
            this.buffer[this.headIdx = this.nextIdx] = item;
        }
        // move the head forward
        next() { this.headIdx = this.nextIdx; }
    }
    TSPainter.ICBuffer = ICBuffer;
    /*
        General purpose circular buffer
    */
    class CBuffer extends ICBuffer {
        constructor(size) {
            super(size);
        }
        _initBuffer(size) {
            const buf = new Array(size);
            for (let i = 0; i < size; i++) {
                buf[i] = null;
            }
            this.buffer = buf;
        }
    }
    TSPainter.CBuffer = CBuffer;
    /*
        Circular buffer for 32-bit floats
    */
    class CFloatBuffer extends ICBuffer {
        constructor(size) {
            super(size);
        }
        _initBuffer(size) {
            this.buffer = new Float32Array(size);
        }
    }
    TSPainter.CFloatBuffer = CFloatBuffer;
})(TSPainter || (TSPainter = {}));
// http://stackoverflow.com/questions/5306680/move-an-array-element-from-one-array-position-to-another
Array.prototype.move = function (idx, newIdx) {
    if (newIdx >= this.length) {
        var k = newIdx - this.length;
        while ((k--) + 1) {
            this.push(undefined);
        }
    }
    this.splice(newIdx, 0, this.splice(idx, 1)[0]);
    return this;
};
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
if (!Array.prototype.find) {
    Array.prototype.find = function (predicate) {
        if (this === null) {
            throw new TypeError('Array.prototype.find called on null or undefined');
        }
        if (typeof predicate !== 'function') {
            throw new TypeError('predicate must be a function');
        }
        var list = Object(this);
        var length = list.length >>> 0;
        var thisArg = arguments[1];
        var value;
        for (var i = 0; i < length; i++) {
            value = list[i];
            if (predicate.call(thisArg, value, i, list)) {
                return value;
            }
        }
        return undefined;
    };
}
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/of
if (!Array.prototype.of) {
    Array.prototype.of = function (...elements) {
        return Array.prototype.slice.call(elements);
    };
}
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes
if (!Array.prototype.includes) {
    Array.prototype.includes = function (searchElement) {
        var O = Object(this);
        var len = parseInt(O.length) || 0;
        if (len === 0) {
            return false;
        }
        var n = parseInt(arguments[1]) || 0;
        var k;
        if (n >= 0) {
            k = n;
        }
        else {
            k = len + n;
            if (k < 0) {
                k = 0;
            }
        }
        var currentElement;
        while (k < len) {
            currentElement = O[k];
            if (searchElement === currentElement ||
                (searchElement !== searchElement && currentElement !== currentElement)) {
                return true;
            }
            k++;
        }
        return false;
    };
}
// bind F12 to stop code execution in chrome
window.addEventListener('keydown', (e) => {
    if (e.keyCode === 123)
        debugger;
});
var TSPainter;
(function (TSPainter) {
    class Interpolator {
        constructor(initialLength, spacingPx) {
            this.tmpPoint = new TSPainter.DrawPoint();
            this.previousPoint = new TSPainter.DrawPoint();
            this.drawPoints = new TSPainter.DrawPointQueue(initialLength);
            this.spacingThresholdPx = spacingPx;
        }
        setInitialPoint(start) {
            this.previousPoint.copyFrom(start);
            this.drawPoints.addDrawPointClone(start);
        }
        interpolate(end) {
            return this._interpolate(end);
        }
        _passThrough(end) {
            this.drawPoints.addDrawPointClone(end);
        }
        _interpolate(end) {
            const drawPoints = this.drawPoints;
            const spacing = this.spacingThresholdPx;
            const endSpacing = Math.max(spacing * end.scale);
            const start = this.previousPoint;
            const previous = this.drawPoints.getLast();
            let p = .1;
            let dist = TSPainter.Vec2.distance(start, end);
            let count = 0;
            while (dist > endSpacing && p > 0) {
                p = (spacing * start.scale) / dist;
                start.x += p * (end.x - start.x);
                start.y += p * (end.y - start.y);
                start.scale += p * (end.scale - start.scale);
                start.rotation += p * (end.rotation - start.rotation);
                start.red += p * (end.red - start.red);
                start.green += p * (end.green - start.green);
                start.blue += p * (end.blue - start.blue);
                start.alpha += p * (end.alpha - start.alpha);
                dist = TSPainter.Vec2.distance(start, end);
                // add
                if (previous == null || previous.notEqual(start)) {
                    drawPoints.addDrawPointClone(start);
                }
            }
        }
    }
    TSPainter.Interpolator = Interpolator;
})(TSPainter || (TSPainter = {}));
var TSPainter;
(function (TSPainter) {
    // Find a HtmlCanvasElement by its element id. Return null if not found.
    function getCanvasById(id) {
        const element = document.getElementById(id);
        return (element instanceof HTMLCanvasElement) ? element : null;
    }
    TSPainter.getCanvasById = getCanvasById;
    // Find a SVGElement by its element id. Return null if not found.
    function getSvgById(id) {
        const element = document.getElementById(id);
        return (element instanceof SVGElement) ? element : null;
    }
    TSPainter.getSvgById = getSvgById;
    // I should find a way to save JSON as cookies
    // Set a cookie
    function setCookie(cname, cvalue, exDays) {
        const d = new Date();
        d.setTime(d.getTime() + (exDays * 86400000));
        document.cookie = [
            cname, "=", cvalue,
            ";expires=", d.toUTCString(),
            ";path=/"
        ].join("");
    }
    TSPainter.setCookie = setCookie;
    // Get a cookie
    function getCookie(cname) {
        const name = cname + "=";
        const cookieJar = document.cookie.split(";");
        let c = "";
        for (let i = 0, ilen = cookieJar.length; i < ilen; i++) {
            c = cookieJar[i];
            while (c.charAt(0) === " ") {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return null;
    }
    TSPainter.getCookie = getCookie;
})(TSPainter || (TSPainter = {}));
/*
    Pseudo-random number generator
    Meant for testing purposes, so I can get the same pattern every time I test something using random numbers.

    https://en.wikipedia.org/wiki/Xorshift
    Implementation of Xorshift 128
*/
var TSPainter;
(function (TSPainter) {
    class RNG {
        constructor(seed = performance.now()) {
            this.seed(seed);
        }
        seed(n) {
            this.x = n;
            this.y = 0;
            this.z = 0;
            this.w = 0;
            // Discard some initial values
            for (let i = 0; i < 16; i++) {
                this.nextInt();
            }
        }
        nextInt() {
            const t = this.x ^ (this.x << 11);
            this.x = this.y;
            this.y = this.z;
            this.z = this.w;
            this.w ^= (this.w >> 19) ^ t ^ (t >> 8);
            return this.w;
        }
        next() {
            return (this.nextInt() >>> 0) / ((1 << 30) * 2);
        }
    }
    TSPainter.RNG = RNG;
})(TSPainter || (TSPainter = {}));
var TSPainter;
(function (TSPainter) {
    /*
        Batching objects.

        Attributes are declared in the Attributes object passed to the constructor.
        Attributes need to be buffered by an outside function.
        After adding attributes, remember to set the new offset correctly.
    */
    class Batch {
        constructor(renderer, attributes, maxTriangles) {
            this.arrayOffset = 0;
            this._renderer = renderer;
            const gl = renderer.gl;
            const keys = Object.keys(attributes);
            let values = 0;
            for (let i = 0, ilen = keys.length; i < ilen; i++) {
                values += attributes[keys[i]].size;
            }
            this.BATCH_FLOATS_PER_INDEX = values;
            this.BATCH_STRIDE = values * 4;
            this.MAX_VERTICES = maxTriangles * 3;
            this._vertexBuffer = gl.createBuffer();
            this.array = new Float32Array(this.MAX_VERTICES * this.BATCH_FLOATS_PER_INDEX);
            this._attributes = attributes;
        }
        flush() {
            const gl = this._renderer.gl;
            const arrayView = this.array.subarray(0, this.arrayOffset);
            gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, arrayView, gl.DYNAMIC_DRAW);
            const attributes = this._attributes;
            const keys = Object.keys(attributes);
            const stride = this.BATCH_STRIDE;
            let attribOffset = 0;
            let attrib;
            // enable attributes
            for (let i = 0, ilen = keys.length; i < ilen; i++) {
                attrib = attributes[keys[i]];
                gl.vertexAttribPointer(attrib.location, attrib.size, attrib.type, false, stride, attribOffset);
                gl.enableVertexAttribArray(attrib.location);
                attribOffset += attrib.size * 4; // assume 4 byte
            }
            this._draw(gl);
            this.arrayOffset = 0;
        }
        _draw(gl) {
            gl.drawArrays(gl.TRIANGLES, 0, this.arrayOffset / this.BATCH_FLOATS_PER_INDEX);
        }
    }
    TSPainter.Batch = Batch;
    /*
        Uses drawElements instead of drawArrays.

        This means the buffer size is 2/3 the size of the alternative.
        Only one of these should be used as it's too expensive to rebind ELEMENTS_ARRAY_BUFFER to use multiple.
        Use this for the largest batch; DrawPoints.

        TODO: having issues with this only drawing half of a square when drawing 1 at a time.
    */
    class ElementsBatch extends Batch {
        constructor(renderer, attributes, maxElements) {
            super(renderer, attributes, Math.ceil(maxElements * 4 / 3));
            const gl = renderer.gl;
            this._indexBuffer = gl.createBuffer();
            const indexArray = new Uint16Array(this.MAX_VERTICES);
            for (let i = 0, j = 0; i < this.MAX_VERTICES; i += 6, j += 4) {
                indexArray[i + 0] = j + 0;
                indexArray[i + 1] = j + 1;
                indexArray[i + 2] = j + 2;
                indexArray[i + 3] = j + 0;
                indexArray[i + 4] = j + 2;
                indexArray[i + 5] = j + 3;
            }
            this._indexArray = indexArray;
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this._indexArray, gl.STATIC_DRAW);
        }
        _draw(gl) {
            gl.drawElements(gl.TRIANGLES, this.arrayOffset / this.BATCH_FLOATS_PER_INDEX, gl.UNSIGNED_SHORT, 0);
        }
    }
    TSPainter.ElementsBatch = ElementsBatch;
})(TSPainter || (TSPainter = {}));
var TSPainter;
(function (TSPainter) {
    class CanvRenderingContext {
        constructor(canvas) {
            this._renderer = new TSPainter.Renderer(canvas, {
                alpha: true,
                depth: false,
                stencil: false,
                antialias: false,
                premultipliedAlpha: true,
                preserveDrawingBuffer: true,
                failIfMajorPerformanceCaveat: false
            });
            this._shaderManager = new TSPainter.ShaderManager(this._renderer);
            this._textureGenerator = new TSPainter.TextureGenerator(this._renderer, this._shaderManager.brushShader);
            this.layer = new TSPainter.Sprite(new TSPainter.Texture(this._renderer, canvas.width, canvas.height));
            this.brushTexture = new TSPainter.Texture(this._renderer, 1000, 1000);
            this._textureGenerator.generate(this.brushTexture);
            this.blendMode = TSPainter.Settings.getValue(TSPainter.Settings.ID.RenderingBlendMode);
        }
        // Test function
        showBrushTexture() {
            this._renderToCanvas(this.brushTexture);
        }
        renderDrawPoints(drawPoints) {
            const drawPointShader = this._shaderManager.drawPointShader;
            const renderer = this._renderer;
            // render to output texture
            renderer.setBlendMode(this.blendMode);
            drawPointShader.setBrushTexture(this.brushTexture);
            drawPoints.addToBatch(drawPointShader.batch); // todo: ElementsBatch
            renderer.flushShader(drawPointShader, this.layer.texture);
            renderer.setBlendMode(TSPainter.BlendMode.Normal);
            // render output texture to canvas
            const outputShader = this._shaderManager.outputShader;
            const layer = this.layer;
            layer.addToBatch(outputShader.batch);
            outputShader.setResolution(layer.texture.width, layer.texture.height);
            outputShader.setTexture(layer.texture);
            renderer.setViewport(0, 0, layer.texture.width, layer.texture.height);
            renderer.useFrameBuffer(null);
            renderer.clear();
            renderer.flushShader(outputShader, null);
        }
        renderSpriteToTexture(sprite, texture, area) {
            const renderer = this._renderer;
            renderer.useFrameBuffer(texture.framebuffer);
            if (area != null) {
                renderer.setViewport(area.x, area.y, area.width, area.height);
            }
            else {
                renderer.setViewport(0, 0, texture.width, texture.height);
            }
            renderer.renderSprite(this._shaderManager.spriteShader, sprite);
        }
        // testing
        _renderToCanvas(texture) {
            const outputShader = this._shaderManager.outputShader;
            const layer = this.layer;
            const renderer = this._renderer;
            layer.addToBatch(outputShader.batch);
            outputShader.setResolution(layer.texture.width, layer.texture.height);
            outputShader.setTexture(texture);
            renderer.setViewport(0, 0, layer.texture.width, layer.texture.height);
            renderer.flushShader(outputShader, null);
        }
    }
    TSPainter.CanvRenderingContext = CanvRenderingContext;
})(TSPainter || (TSPainter = {}));
var TSPainter;
(function (TSPainter) {
    class DrawPoint extends TSPainter.Vec2 {
        constructor() {
            super(...arguments);
            // size in pixels
            this.size = 0;
            // transforms [0.0 : 1.0]
            this.scale = 1.0;
            this.rotation = 0.0;
            // color [0.0 : 1.0]
            this.red = 0.0;
            this.green = 0.0;
            this.blue = 0.0;
            this.alpha = 1.0;
        }
        setColor(rgba) {
            this.red = rgba.r;
            this.green = rgba.g;
            this.blue = rgba.b;
            this.alpha = rgba.a;
        }
        equals(rhs) {
            return this.x === rhs.x
                && this.y === rhs.y
                && this.size === rhs.size
                && this.scale === rhs.scale
                && this.rotation === rhs.rotation
                && this.red === rhs.red
                && this.green === rhs.green
                && this.blue === rhs.blue
                && this.alpha === rhs.alpha;
        }
        notEqual(rhs) {
            return this.equals(rhs) === false;
        }
        copyFrom(rhs) {
            this.x = rhs.x;
            this.y = rhs.y;
            this.size = rhs.size;
            this.scale = rhs.scale;
            this.rotation = rhs.rotation;
            this.red = rhs.red;
            this.green = rhs.green;
            this.blue = rhs.blue;
            this.alpha = rhs.alpha;
        }
    }
    TSPainter.DrawPoint = DrawPoint;
    class DrawPointQueue {
        constructor(initialLength) {
            this._nextIndex = 0;
            this._colorRgba = new TSPainter.Vec4();
            this._colorHsva = new TSPainter.Vec4();
            const points = new Array(initialLength);
            //populate the whole arrays
            for (let i = 0; i < initialLength; i++) {
                points[i] = new DrawPoint();
            }
            this._points = points;
        }
        isEmpty() {
            return this._nextIndex === 0;
        }
        count() {
            return this._nextIndex;
        }
        purge() {
            this._nextIndex = 0;
        }
        getFirst() {
            return this._points[0];
        }
        getLast() {
            return this._points[this._nextIndex - 1];
        }
        atIndex(index) {
            return (index >= 0 && index < this._nextIndex) ? this._points[index] : null;
        }
        newPoint() {
            if (this._nextIndex + 1 < this._points.length) {
                return this._points[this._nextIndex++];
            }
            return null;
        }
        addDrawPointClone(drawPoint) {
            const point = this.newPoint();
            if (point === null) {
                return;
            }
            point.x = drawPoint.x;
            point.y = drawPoint.y;
            point.size = drawPoint.size;
            point.scale = drawPoint.scale;
            point.rotation = drawPoint.rotation;
            point.red = drawPoint.red;
            point.green = drawPoint.green;
            point.blue = drawPoint.blue;
            point.alpha = drawPoint.alpha;
        }
        addToElementsBatch(batch) {
            const array = batch.array;
            const drawPoints = this._points;
            let offset = batch.arrayOffset;
            let scaledSize = 0;
            let p0 = 0, p1 = 0;
            let drawPoint = null;
            for (let i = 0, ilen = this.count(); i < ilen; i++) {
                drawPoint = drawPoints[i];
                // size
                scaledSize = drawPoint.size * drawPoint.scale;
                // corners locations
                p0 = -scaledSize / 2;
                p1 = p0 + scaledSize;
                // corner 1
                array[offset++] = drawPoint.red;
                array[offset++] = drawPoint.green;
                array[offset++] = drawPoint.blue;
                array[offset++] = drawPoint.alpha;
                array[offset++] = 0;
                array[offset++] = 0;
                array[offset++] = p0;
                array[offset++] = p0;
                array[offset++] = drawPoint.x;
                array[offset++] = drawPoint.y;
                array[offset++] = drawPoint.rotation;
                // corner 2
                array[offset++] = drawPoint.red;
                array[offset++] = drawPoint.green;
                array[offset++] = drawPoint.blue;
                array[offset++] = drawPoint.alpha;
                array[offset++] = 0;
                array[offset++] = 1;
                array[offset++] = p0;
                array[offset++] = p1;
                array[offset++] = drawPoint.x;
                array[offset++] = drawPoint.y;
                array[offset++] = drawPoint.rotation;
                // corner 3
                array[offset++] = drawPoint.red;
                array[offset++] = drawPoint.green;
                array[offset++] = drawPoint.blue;
                array[offset++] = drawPoint.alpha;
                array[offset++] = 1;
                array[offset++] = 1;
                array[offset++] = p1;
                array[offset++] = p1;
                array[offset++] = drawPoint.x;
                array[offset++] = drawPoint.y;
                array[offset++] = drawPoint.rotation;
                // corner 4
                array[offset++] = drawPoint.red;
                array[offset++] = drawPoint.green;
                array[offset++] = drawPoint.blue;
                array[offset++] = drawPoint.alpha;
                array[offset++] = 1;
                array[offset++] = 0;
                array[offset++] = p1;
                array[offset++] = p0;
                array[offset++] = drawPoint.x;
                array[offset++] = drawPoint.y;
                array[offset++] = drawPoint.rotation;
            }
            batch.arrayOffset = offset;
            this.purge();
        }
        addToBatch(batch) {
            const array = batch.array;
            const drawPoints = this._points;
            let offset = batch.arrayOffset;
            let scaledSize = 0;
            let p0 = 0, p1 = 0;
            let drawPoint = null;
            for (let i = 0, ilen = this.count(); i < ilen; i++) {
                drawPoint = drawPoints[i];
                // size
                scaledSize = drawPoint.size * drawPoint.scale;
                // corners locations
                p0 = -scaledSize / 2;
                p1 = p0 + scaledSize;
                // corner 1
                array[offset++] = drawPoint.red;
                array[offset++] = drawPoint.green;
                array[offset++] = drawPoint.blue;
                array[offset++] = drawPoint.alpha;
                array[offset++] = 0;
                array[offset++] = 0;
                array[offset++] = p0;
                array[offset++] = p0;
                array[offset++] = drawPoint.x;
                array[offset++] = drawPoint.y;
                array[offset++] = drawPoint.rotation;
                // corner 2
                array[offset++] = drawPoint.red;
                array[offset++] = drawPoint.green;
                array[offset++] = drawPoint.blue;
                array[offset++] = drawPoint.alpha;
                array[offset++] = 0;
                array[offset++] = 1;
                array[offset++] = p0;
                array[offset++] = p1;
                array[offset++] = drawPoint.x;
                array[offset++] = drawPoint.y;
                array[offset++] = drawPoint.rotation;
                // corner 3
                array[offset++] = drawPoint.red;
                array[offset++] = drawPoint.green;
                array[offset++] = drawPoint.blue;
                array[offset++] = drawPoint.alpha;
                array[offset++] = 1;
                array[offset++] = 0;
                array[offset++] = p1;
                array[offset++] = p0;
                array[offset++] = drawPoint.x;
                array[offset++] = drawPoint.y;
                array[offset++] = drawPoint.rotation;
                // corner 2
                array[offset++] = drawPoint.red;
                array[offset++] = drawPoint.green;
                array[offset++] = drawPoint.blue;
                array[offset++] = drawPoint.alpha;
                array[offset++] = 0;
                array[offset++] = 1;
                array[offset++] = p0;
                array[offset++] = p1;
                array[offset++] = drawPoint.x;
                array[offset++] = drawPoint.y;
                array[offset++] = drawPoint.rotation;
                // corner 3
                array[offset++] = drawPoint.red;
                array[offset++] = drawPoint.green;
                array[offset++] = drawPoint.blue;
                array[offset++] = drawPoint.alpha;
                array[offset++] = 1;
                array[offset++] = 0;
                array[offset++] = p1;
                array[offset++] = p0;
                array[offset++] = drawPoint.x;
                array[offset++] = drawPoint.y;
                array[offset++] = drawPoint.rotation;
                // corner 4
                array[offset++] = drawPoint.red;
                array[offset++] = drawPoint.green;
                array[offset++] = drawPoint.blue;
                array[offset++] = drawPoint.alpha;
                array[offset++] = 1;
                array[offset++] = 1;
                array[offset++] = p1;
                array[offset++] = p1;
                array[offset++] = drawPoint.x;
                array[offset++] = drawPoint.y;
                array[offset++] = drawPoint.rotation;
            }
            batch.arrayOffset = offset;
            this.purge();
        }
    }
    TSPainter.DrawPointQueue = DrawPointQueue;
})(TSPainter || (TSPainter = {}));
var TSPainter;
(function (TSPainter) {
    class Layer {
        constructor(texture, id) {
            this.texture = texture;
            this.id = id;
            this.name = ["Layer ", id].join("");
        }
    }
    TSPainter.Layer = Layer;
})(TSPainter || (TSPainter = {}));
var TSPainter;
(function (TSPainter) {
    class Texture {
        constructor(renderer, width = 100, height = 100) {
            this._renderer = renderer;
            this.width = width;
            this.height = height;
            const gl = renderer.gl;
            this.textureWGL = gl.createTexture();
            this.framebuffer = gl.createFramebuffer();
            this.updateSize();
            renderer.useTextureFrameBuffer(this);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.textureWGL, 0);
        }
        updateSize() {
            const gl = this._renderer.gl;
            gl.bindTexture(gl.TEXTURE_2D, this.textureWGL);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.FLOAT, null);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        }
    }
    TSPainter.Texture = Texture;
})(TSPainter || (TSPainter = {}));
/// <reference path="Texture.ts"/>
/// <reference path="Consts.ts"/>
var TSPainter;
(function (TSPainter) {
    // Set up blend modes
    const BLEND_MODE_VALUES = {};
    BLEND_MODE_VALUES[TSPainter.BlendMode.Normal] = [WebGLRenderingContext.ONE, WebGLRenderingContext.ONE_MINUS_SRC_ALPHA];
    BLEND_MODE_VALUES[TSPainter.BlendMode.Erase] = [WebGLRenderingContext.ZERO, WebGLRenderingContext.ONE_MINUS_SRC_ALPHA];
    class Renderer {
        constructor(canvas, webGlAttributes) {
            this.viewportArea = new TSPainter.Vec4();
            this.textureManager = new TSPainter.TextureManager(this);
            this.currentShader = null;
            this.currentFrameBuffer = null;
            this.canvas = canvas;
            const gl = (canvas.getContext("webgl", webGlAttributes) || canvas.getContext("experimental-webgl", webGlAttributes));
            this.gl = gl;
            if (gl === null) {
                console.error("Failed to get WebGL context.");
                throw new Error();
            }
            gl.enable(gl.BLEND);
            this.setBlendMode(TSPainter.BlendMode.Normal);
            if (gl.getExtension("OES_texture_float") === null) {
                console.error("Failed to enable the OES_texture_float extension");
                throw new Error();
            }
            if (gl.getExtension("OES_texture_float_linear") === null) {
                console.error("Failed to enable the OES_texture_float_linear extension");
                throw new Error();
            }
            this.setViewport(0, 0, canvas.width, canvas.height);
        }
        setBlendMode(mode) {
            const vals = BLEND_MODE_VALUES[mode];
            this.gl.blendFunc(vals[0], vals[1]);
        }
        useFrameBuffer(fb) {
            if (fb === this.currentFrameBuffer)
                return;
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, fb);
            this.currentFrameBuffer = fb;
        }
        useTextureFrameBuffer(texture) {
            this.useFrameBuffer((texture === null) ? null : texture.framebuffer);
        }
        useShader(shader) {
            if (this.currentShader !== shader) {
                shader.activate();
                this.currentShader = shader;
            }
        }
        renderSprite(shader, sprite) {
            this.useShader(shader);
            this.useTextureFrameBuffer(sprite.texture);
            shader.syncUniforms();
            shader.render(sprite);
        }
        flushShader(shader, texture) {
            this.useShader(shader);
            this.useTextureFrameBuffer(texture);
            shader.syncUniforms();
            shader.batch.flush();
        }
        clear() {
            this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        }
        setViewport(x, y, width, height) {
            const vpArea = this.viewportArea;
            if (vpArea.width == width && vpArea.height === height && vpArea.x === x && vpArea.y === y)
                return;
            this.gl.viewport(x, y, width, height);
            vpArea.xyzw(x, y, width, height);
        }
    }
    TSPainter.Renderer = Renderer;
})(TSPainter || (TSPainter = {}));
var TSPainter;
(function (TSPainter) {
    /*
        This object ensures that rendering only has 1 animation frame request active at once.
    */
    class RenderingCoordinator {
        constructor(renderCallback) {
            this._requestId = -1;
            this._render = () => {
                this._renderCallback();
                this._requestId = -1;
            };
            this._renderCallback = renderCallback;
        }
        requestRender() {
            if (this._requestId === -1) {
                this._requestId = requestAnimationFrame(this._render);
            }
        }
        forceRender() {
            // clear timeout if one exists
            if (this._requestId >= 0) {
                cancelAnimationFrame(this._requestId);
            }
            this._render();
        }
    }
    TSPainter.RenderingCoordinator = RenderingCoordinator;
})(TSPainter || (TSPainter = {}));
var TSPainter;
(function (TSPainter) {
    class Sprite {
        constructor(texture) {
            this.position = new TSPainter.Vec2();
            this.scale = 1;
            this.rotation = 0;
            this.crop = null;
            this.texture = texture;
        }
        /*
            Add to a batch object.

            I'm using a batch object because it already contains all the necessary logic for rendering.
        */
        addToBatch(batch) {
            // determine vertex and texture positions
            const x = this.position.x;
            const y = this.position.y;
            const width = this.texture.width;
            const height = this.texture.height;
            const crop = this.crop;
            // don't scale before center calculation
            const centerX = x + width * .5;
            const centerY = y + height * .5;
            const halfWidth = width * this.scale * .5;
            const halfHeight = height * this.scale * .5;
            const vertexX0 = centerX - halfWidth;
            const vertexY0 = centerY - halfHeight;
            const vertexX1 = centerX + halfWidth;
            const vertexY1 = centerY + halfHeight;
            let textureX0;
            let textureY0;
            let textureX1;
            let textureY1;
            if (crop === null) {
                textureX0 = x;
                textureY0 = y;
                textureX1 = textureX0 + width;
                textureY1 = textureY0 + height;
            }
            else {
                // TODO: fix this
                textureX0 = crop.x + x;
                textureY0 = crop.y + y;
                textureX1 = textureX0 + crop.width;
                textureY1 = textureY0 + crop.height;
            }
            // buffer data
            const array = batch.array;
            let offset = batch.arrayOffset;
            array[offset++] = vertexX0;
            array[offset++] = vertexY0;
            array[offset++] = textureX0;
            array[offset++] = textureY0;
            array[offset++] = vertexX0;
            array[offset++] = vertexY1;
            array[offset++] = textureX0;
            array[offset++] = textureY1;
            array[offset++] = vertexX1;
            array[offset++] = vertexY0;
            array[offset++] = textureX1;
            array[offset++] = textureY0;
            array[offset++] = vertexX0;
            array[offset++] = vertexY1;
            array[offset++] = textureX0;
            array[offset++] = textureY1;
            array[offset++] = vertexX1;
            array[offset++] = vertexY0;
            array[offset++] = textureX1;
            array[offset++] = textureY0;
            array[offset++] = vertexX1;
            array[offset++] = vertexY1;
            array[offset++] = textureX1;
            array[offset++] = textureY1;
            batch.arrayOffset = offset;
        }
    }
    TSPainter.Sprite = Sprite;
})(TSPainter || (TSPainter = {}));
var TSPainter;
(function (TSPainter) {
    class BoundTexture {
        constructor(
            // the bound texture
            texture, 
            // the index that the texture is bound to
            textureIndex, 
            // textures with higher priority will be deallocated last
            priority, 
            // time that the texture was bound (in millis)
            time) {
            this.texture = texture;
            this.textureIndex = textureIndex;
            this.priority = priority;
            this.time = time;
        }
        isLessThan(rhs) {
            if (this.priority !== rhs.priority) {
                return this.priority < rhs.priority;
            }
            return this.time < rhs.time;
        }
    }
    TSPainter.BoundTexture = BoundTexture;
    /*
        Manages WebGl's texture bindings in order to minimize the amount of time spent rebinding textures
    */
    class TextureManager {
        constructor(renderer) {
            this.TEXTURE_SLOTS = 32;
            this._activeTextures = 0;
            const textures = new Array(this.TEXTURE_SLOTS);
            for (let i = 0, ilen = this.TEXTURE_SLOTS; i < ilen; i++) {
                textures[i] = new BoundTexture(null, i, 0, 0);
            }
            this._boundTextures = textures;
            this._renderer = renderer;
        }
        bindTexture(texture, priority) {
            let idx = this.getIndexOf(texture);
            let bTex;
            // return if already bound
            if (idx !== -1) {
                bTex = this._boundTextures[idx];
            }
            else {
                // store texture
                if (this._activeTextures < this.TEXTURE_SLOTS) {
                    bTex = this.getNextBoundTexture();
                }
                else {
                    bTex = this.getLowestPriorityBoundTexture();
                }
                // set texture
                bTex.texture = texture;
                idx = this.getIndexOf(texture);
                // bind
                const gl = this._renderer.gl;
                gl.activeTexture(gl.TEXTURE0 + bTex.textureIndex);
                gl.bindTexture(gl.TEXTURE_2D, this._boundTextures[idx].texture.textureWGL);
            }
            // set priority attributes
            bTex.priority = priority;
            bTex.time = Date.now();
            return bTex.textureIndex;
        }
        getNextBoundTexture() {
            return this._boundTextures[this._activeTextures++];
        }
        // uses sequential search
        // TODO: list should be sorted, so use binary search
        getLowestPriorityBoundTexture() {
            const bTextures = this._boundTextures;
            let lowest = bTextures[0];
            for (let i = 1, ilen = bTextures.length; i < ilen; i++) {
                if (lowest.isLessThan(bTextures[i])) {
                    lowest = bTextures[i];
                }
            }
            return lowest;
        }
        getIndexOf(texture) {
            const bTextures = this._boundTextures;
            for (let i = 0, ilen = bTextures.length; i < ilen; i++) {
                if (bTextures[i].texture === texture) {
                    return i;
                }
            }
            return -1;
        }
    }
    TSPainter.TextureManager = TextureManager;
})(TSPainter || (TSPainter = {}));
var TSPainter;
(function (TSPainter) {
    class Toolbar {
        constructor(parent) {
            this._buttons = [];
            this._activeButton = -1;
            this._buttonCallback = (button, ev) => {
                this.clicked(button);
            };
            this._buttonContainer = new TSPainter.WrappedSVG(parent);
            const container = this._buttonContainer;
            const buttons = this._buttons;
            this._background = new TSPainter.WrappedSVGRect(container);
            // Dummy buttons
            buttons.push(new TSPainter.WrappedSVGRect(container));
            buttons.push(new TSPainter.WrappedSVGRect(container));
            buttons.push(new TSPainter.WrappedSVGRect(container));
            buttons.push(new TSPainter.WrappedSVGRect(container));
            buttons.push(new TSPainter.WrappedSVGRect(container));
            buttons.push(new TSPainter.WrappedSVGRect(container));
            buttons.push(new TSPainter.WrappedSVGRect(container));
            buttons.push(new TSPainter.WrappedSVGRect(container));
            buttons.push(new TSPainter.WrappedSVGRect(container));
            const x = 3; // Y padding
            const y = 2; // X padding
            const size = 28; // Width and height. I want to separate them eventually.
            const r = 4; // Corner radius
            const sw = 1; // Stroke width
            container.setX(10).setY(100);
            // Set attributes for the background svg
            this._background
                .setArea(sw, sw, x * 2 + size, (y + size) * buttons.length + y)
                .setR(r)
                .addCSSClass("toolBar");
            // Set attributes for all buttons
            for (let i = 0, ilen = buttons.length; i < ilen; i++) {
                buttons[i]
                    .setArea(sw + x, sw + y + (y + size) * i, size, size)
                    .setR(r)
                    .addCSSClass("toolButton")
                    .setOnClickCallback(this._buttonCallback);
            }
            // Set an arbitrary number to be active
            this.activateButton(0);
        }
        get x() { return Number(this._buttonContainer.getX()); }
        get y() { return Number(this._buttonContainer.getY()); }
        set x(x) { this._buttonContainer.setX(x); }
        set y(y) { this._buttonContainer.setY(y); }
        clicked(button) {
            const buttons = this._buttons;
            for (let i = 0, ilen = buttons.length; i < ilen; i++) {
                if (buttons[i] === button && i !== this._activeButton) {
                    this.activateButton(i);
                }
            }
        }
        activateButton(buttonIdx) {
            const previous = this._activeButton;
            this._buttons[buttonIdx].addCSSClass("toolButtonActive");
            this._buttons[buttonIdx].removeCSSClass("toolButton");
            if (previous >= 0) {
                this._buttons[previous].removeCSSClass("toolButtonActive");
                this._buttons[previous].addCSSClass("toolButton");
            }
            this._activeButton = buttonIdx;
        }
    }
    TSPainter.Toolbar = Toolbar;
})(TSPainter || (TSPainter = {}));
var TSPainter;
(function (TSPainter) {
    class WrappedSVG {
        constructor(parent, element = null) {
            this._area = new TSPainter.Vec4();
            this.CSS_UNIT = "px";
            this.element = element || document.createElementNS(WrappedSVG.URI, "svg");
            parent.appendChild(this.element);
        }
        getX() { return this._area.x; }
        getY() { return this._area.y; }
        getWidth() { return this._area.width; }
        getHeight() { return this._area.height; }
        setX(n) {
            this.element.setAttribute("x", n.toString() + this.CSS_UNIT);
            this._area.x = n;
            return this;
        }
        setY(n) {
            this.element.setAttribute("y", n.toString() + this.CSS_UNIT);
            this._area.y = n;
            return this;
        }
        setWidth(n) {
            this.element.setAttribute("width", n.toString() + this.CSS_UNIT);
            this._area.width = n;
            return this;
        }
        setHeight(n) {
            this.element.setAttribute("height", n.toString() + this.CSS_UNIT);
            this._area.height = n;
            return this;
        }
        setArea(x, y, width, height) {
            this.element.setAttribute("x", x.toString() + this.CSS_UNIT);
            this.element.setAttribute("y", y.toString() + this.CSS_UNIT);
            this.element.setAttribute("width", width.toString() + this.CSS_UNIT);
            this.element.setAttribute("height", height.toString() + this.CSS_UNIT);
            this._area.xyzw(x, y, width, height);
            return this;
        }
        removeCSSClass(cssClass) {
            this.element.classList.remove(cssClass);
            return this;
        }
        addCSSClass(cssClass) {
            this.element.classList.add(cssClass);
            return this;
        }
        setOnClickCallback(c) {
            this.element.addEventListener("mousedown", (ev) => {
                c(this, ev);
            });
            return this;
        }
        setOnMoveCallback(c) {
            this.element.addEventListener("mousemove", (ev) => {
                c(this, ev);
            });
            return this;
        }
        setOnReleaseCallback(c) {
            this.element.addEventListener("mouseup", (ev) => {
                c(this, ev);
            });
            return this;
        }
    }
    WrappedSVG.URI = "http://www.w3.org/2000/svg";
    TSPainter.WrappedSVG = WrappedSVG;
    class WrappedSVGRect extends WrappedSVG {
        constructor(parent) {
            super(parent.element, document.createElementNS(WrappedSVG.URI, "rect"));
        }
        getR() { return this._r; }
        setR(n) {
            this.element.setAttribute("rx", n.toString());
            this.element.setAttribute("ry", n.toString());
            this._r = n;
            return this;
        }
    }
    TSPainter.WrappedSVGRect = WrappedSVGRect;
})(TSPainter || (TSPainter = {}));
/*

    The shader for generating the standard brush texture

*/
var TSPainter;
(function (TSPainter) {
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
        // TODO: pass radius as a uniform
        "	float radius = 1.0 - uSoftness;",
        "	float dist = sqrt(dot(vPosition, vPosition));",
        "	float a = 1.0 - smoothstep(radius, radius + uSoftness, dist);",
        "	gl_FragColor = vec4(vec3(0.0), pow(a, uGamma));",
        "}"
    ].join("\n");
    class DefaultBrushShader extends TSPainter.Shader {
        constructor(renderer, softness) {
            super(renderer, SHADER_BRUSH_VERT, SHADER_BRUSH_FRAG, {
                aPosition: new TSPainter.Attribute(renderer.gl.FLOAT, 2)
            }, {
                uSoftness: new TSPainter.Uniform("1f", TSPainter.Settings.getValue(TSPainter.Settings.ID.BrushSoftness)),
                uGamma: new TSPainter.Uniform("1f", TSPainter.Settings.getValue(TSPainter.Settings.ID.Gamma))
            }, 2);
            this.softnessChangeCallback = (softness) => this.uniforms["uSoftness"].value = softness;
            this.gammaChangeCallback = (gamma) => this.uniforms["uGamma"].value = gamma;
        }
    }
    TSPainter.DefaultBrushShader = DefaultBrushShader;
})(TSPainter || (TSPainter = {}));
/// <reference path="Shader.ts"/>
var TSPainter;
(function (TSPainter) {
    const SHADER_DRAWPOINT_VERT = [
        "precision highp float;",
        TSPainter.SHADER_DEFINE_PI,
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
        "uniform sampler2D uTexture;",
        "void main() {",
        "	float a = texture2D(uTexture, vTextureCoord).a;",
        "	gl_FragColor = vec4(vColor * a);",
        "}",
    ].join("\n");
    class DrawPointShader extends TSPainter.Shader {
        constructor(renderer, texture, maxElements) {
            super(renderer, SHADER_DRAWPOINT_VERT, SHADER_DRAWPOINT_FRAG, {
                aColor: new TSPainter.Attribute(renderer.gl.FLOAT, 4),
                aTextureCoord: new TSPainter.Attribute(renderer.gl.FLOAT, 2),
                aPosition: new TSPainter.Attribute(renderer.gl.FLOAT, 2),
                aCenter: new TSPainter.Attribute(renderer.gl.FLOAT, 2),
                aRotation: new TSPainter.Attribute(renderer.gl.FLOAT, 1),
            }, {
                uTexture: new TSPainter.Uniform("t", texture),
                uResolution: new TSPainter.Uniform("2f", new TSPainter.Vec2())
            }, maxElements, false);
            this.getBrushTexture = () => this._brushTexture;
            this._brushTexture = texture;
            this.setResolution(renderer.canvas.width, renderer.canvas.height);
        }
        setBrushTexture(texture) {
            this.uniforms["uTexture"].value = texture;
            this._brushTexture = texture;
        }
        setResolution(width, height) {
            const resolution = this.uniforms["uResolution"].value;
            resolution.x = width;
            resolution.y = height;
        }
    }
    TSPainter.DrawPointShader = DrawPointShader;
})(TSPainter || (TSPainter = {}));
/// <reference path="Common.ts"/>
/*

    The final shader that the canvas is put through before being displayed.

    All color on the canvas should be in linear color space for better blending,
        so it needs to be converted to gamma before being displayed.

    If necessary, the shader can be expanded later on.

*/
var TSPainter;
(function (TSPainter) {
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
    // Note: function allows us to hardcode the gamma value for better optimization. 
    // Requires recompiling shader every time gamma is changed.
    const SHADER_OUTPUT_SHADER_FRAG = (gamma) => {
        return [
            "precision highp float;",
            "varying vec2 vTextureCoord;",
            "uniform sampler2D uTexture;",
            "void main() {",
            "	vec4 pixel = texture2D(uTexture, vTextureCoord);",
            //"   pixel = mix(pixel, vec4(0.0, 0.0, 1.0, 1.0), 0.5);",
            "	gl_FragColor = pow(pixel, vec4(" + (1 / gamma).toFixed(6) + "));",
            "}"
        ].join("\n");
    };
    class OutputShader extends TSPainter.Shader {
        constructor(renderer, gamma, texture = null) {
            super(renderer, SHADER_OUTPUT_SHADER_VERT, SHADER_OUTPUT_SHADER_FRAG(gamma), {
                aPosition: new TSPainter.Attribute(renderer.gl.FLOAT, 2),
                aTextureCoord: new TSPainter.Attribute(renderer.gl.FLOAT, 2)
            }, {
                uTexture: new TSPainter.Uniform("t", texture),
                uResolution: new TSPainter.Uniform("2f", new TSPainter.Vec2())
            }, 2);
            this.getResolution = () => this.uniforms["uResolution"].value;
            this._gamma = gamma;
            this._texture = texture;
        }
        setTexture(texture) {
            this.uniforms["uTexture"].value = texture;
            this._texture = texture;
        }
        getTexture() {
            return this._texture;
        }
        setGamma(renderer, gamma) {
            if (true === this._recompileProgram(SHADER_OUTPUT_SHADER_VERT, SHADER_OUTPUT_SHADER_FRAG(gamma))) {
                this._gamma = gamma;
            }
        }
        getGamma() {
            return this._gamma;
        }
        setResolution(width, height) {
            this.uniforms["uResolution"].value.x = width;
            this.uniforms["uResolution"].value.y = height;
        }
    }
    TSPainter.OutputShader = OutputShader;
})(TSPainter || (TSPainter = {}));
var TSPainter;
(function (TSPainter) {
    class ShaderManager {
        constructor(renderer) {
            this._onGammaChanged = (value) => {
                this.outputShader.setGamma(this._renderer, value);
            };
            this._onCnavasWidthChanged = (value) => {
                this.spriteShader.setCanvasWidth(value);
            };
            this._onCnavasHeightChanged = (value) => {
                this.spriteShader.setCanvasHeight(value);
            };
            this._renderer = renderer;
            // init default shaders
            this.brushShader = new TSPainter.DefaultBrushShader(renderer, TSPainter.Settings.getValue(TSPainter.Settings.ID.BrushSoftness));
            this.drawPointShader = new TSPainter.DrawPointShader(renderer, null, TSPainter.Settings.getValue(TSPainter.Settings.ID.RenderingMaxDrawPoints));
            this.spriteShader = new TSPainter.SpriteShader(renderer);
            this.outputShader = new TSPainter.OutputShader(renderer, TSPainter.Settings.getValue(TSPainter.Settings.ID.Gamma));
            TSPainter.Settings.subscribe(TSPainter.Settings.ID.Gamma, this._onGammaChanged);
            TSPainter.Settings.subscribe(TSPainter.Settings.ID.CanvasWidth, this._onCnavasWidthChanged);
            TSPainter.Settings.subscribe(TSPainter.Settings.ID.CanvasHeight, this._onCnavasHeightChanged);
            TSPainter.Settings.subscribe(TSPainter.Settings.ID.BrushSoftness, this.brushShader.softnessChangeCallback);
            TSPainter.Settings.subscribe(TSPainter.Settings.ID.Gamma, this.brushShader.gammaChangeCallback);
        }
    }
    TSPainter.ShaderManager = ShaderManager;
})(TSPainter || (TSPainter = {}));
/*
    Used for Texture objects
*/
var TSPainter;
(function (TSPainter) {
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
    // Note: function allows us to hardcode the gamma value for better optimization. 
    // Requires recompiling shader every time gamma is changed.
    const SHADER_SPRITE_SHADER_FRAG = [
        "precision highp float;",
        "varying vec2 vTextureCoord;",
        "uniform sampler2D uTexture;",
        "void main() {",
        "	vec4 pixel = texture2D(uTexture, vTextureCoord);",
        //"	pixel = mix(pixel, vec4(0.0, 0.0, 1.0, 1.0), 0.5);",
        "	gl_FragColor = pixel;",
        "}"
    ].join("\n");
    class SpriteShader extends TSPainter.Shader {
        constructor(renderer) {
            super(renderer, SHADER_SPRITE_SHADER_VERT, SHADER_SPRITE_SHADER_FRAG, {
                aPosition: new TSPainter.Attribute(renderer.gl.FLOAT, 2),
                aTextureCoord: new TSPainter.Attribute(renderer.gl.FLOAT, 2)
            }, {
                uTexture: new TSPainter.Uniform("t", null),
                uResolution: new TSPainter.Uniform("2f", new TSPainter.Vec2()),
                uScale: new TSPainter.Uniform("1f", 1),
                uRotation: new TSPainter.Uniform("1f", 0)
            }, 2);
            this._texture = null;
            this.getTexture = () => this._texture;
            this.getScale = () => this.uniforms["uScale"].value;
            this.getRotation = () => this.uniforms["uRotation"].value;
            this.setResolution(renderer.canvas.width, renderer.canvas.height);
        }
        render(sprite) {
            sprite.addToBatch(this.batch);
            this.setTexture(sprite.texture);
            this.setScale(sprite.scale);
            this.batch.flush();
        }
        setTexture(texture) {
            this.uniforms["uTexture"].value = texture;
            this._texture = texture;
        }
        setScale(scale) {
            this.uniforms["uScale"].value = scale;
        }
        setRotation(rotation) {
            this.uniforms["uRotation"].value = rotation;
        }
        setCanvasWidth(width) {
            this.uniforms["uResolution"].value.x = width;
        }
        setCanvasHeight(height) {
            this.uniforms["uResolution"].value.y = height;
        }
        setResolution(width, height) {
            const resolution = this.uniforms["uResolution"].value;
            resolution.x = width;
            resolution.y = height;
        }
    }
    TSPainter.SpriteShader = SpriteShader;
})(TSPainter || (TSPainter = {}));
var TSPainter;
(function (TSPainter) {
    /*
        Base class for texture generation.
    */
    class TextureGenerator {
        constructor(renderer, standardBrushShader) {
            this._renderer = renderer;
            this._shader = standardBrushShader;
            this._rttBuffer = renderer.gl.createBuffer();
            this._vertexArray = new Float32Array([
                -1, -1,
                -1, 1,
                1, -1,
                1, -1,
                -1, 1,
                1, 1
            ]);
        }
        generate(texture) {
            const renderer = this._renderer;
            const gl = renderer.gl;
            renderer.useShader(this._shader);
            // update uniforms
            this._setUniforms();
            this._shader.syncUniforms();
            // store and change viewport
            const vpw = renderer.viewportArea.width;
            const vph = renderer.viewportArea.height;
            renderer.setViewport(0, 0, texture.width, texture.height);
            // set the framebuffer
            texture.updateSize();
            renderer.useFrameBuffer(texture.framebuffer);
            // buffer the vertices
            gl.bindBuffer(gl.ARRAY_BUFFER, this._rttBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, this._vertexArray, gl.STATIC_DRAW);
            // sync attributes
            const aPosLoc = this._shader.attributes["aPosition"].location;
            gl.vertexAttribPointer(aPosLoc, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(aPosLoc);
            // draw
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            // restore viewport
            renderer.setViewport(0, 0, vpw, vph);
        }
        _setUniforms() { }
    }
    TSPainter.TextureGenerator = TextureGenerator;
})(TSPainter || (TSPainter = {}));
