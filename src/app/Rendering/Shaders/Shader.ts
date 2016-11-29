module TSPainter {

	export class Attribute {
		public location: number = null;

		constructor(
			public type: number,
            public size: number,

            // I want to do instancing to reduce the size of my vertex buffer, but I don't know how to do it currently.
            // It might also cause issues if certain browsers don't support it.
			public instanced = false 
		) { }

	}

	export class Uniform {
		public location: WebGLUniformLocation = null;
		
		constructor(
			public type: string,
			public value: any
		) { }
	}


	export type AttributeMap = { [s: string]: Attribute }
	export type UniformMap = { [s: string]: Uniform }

    
    export class Shader {
        protected readonly _renderer: Renderer;
        protected          _program: WebGLProgram;
        public readonly attributes: AttributeMap;
		public          uniforms: UniformMap;
        public          batch: Batch;

        public constructor(
			renderer: Renderer,
			vertSrc: string,
			fragSrc: string,
			attributes: AttributeMap = {},
            uniforms: UniformMap = {},
            maxTriangles: number,   // if elementsArray is set to true, then this is counted as squares instead of triangles
            elements = false
		) {
            this._renderer = renderer;
            this._program = this._compileProgram(renderer.gl, vertSrc, fragSrc);
			this.attributes = attributes;
			this.uniforms = uniforms;
			this.bindAttributeLocations();
            this.cacheUniformLocations();


            if (elements === false) {
                this.batch = new Batch(renderer, attributes, maxTriangles);
            }
            else {
                this.batch = new ElementsBatch(renderer, attributes, maxTriangles);
            }
        }


        public activate() {
            this._renderer.gl.useProgram(this._program);
        }


        public bindAttributeLocations() {
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


        public cacheUniformLocations() {
            const gl = this._renderer.gl;
			const uniforms = this.uniforms;
			const program = this._program;
			const keys = Object.keys(uniforms);
			for (let i = 0, ilen = keys.length; i < ilen; i++) {
                uniforms[keys[i]].location = gl.getUniformLocation(program, keys[i]);
			}
        }


        public syncUniforms() {
            const gl = this._renderer.gl;
			const uniforms = this.uniforms;
            const keys = Object.keys(uniforms);

			for (let i = 0, ilen = keys.length; i < ilen; i++) {
				this._syncUniform(uniforms[keys[i]]);
			}
		}


		protected _syncUniform(uniform: Uniform) {
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


        protected _recompileProgram(vertSrc: string, fragSrc: string): boolean {
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


        protected _compileProgram(gl: WebGLRenderingContext, vertSrc: string, fragSrc: string): WebGLProgram {
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


        protected _compileShader(gl: WebGLRenderingContext, src: string, type: number) {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, src);
            gl.compileShader(shader);

            if (gl.getShaderParameter(shader, gl.COMPILE_STATUS) === false) {
                console.error("Failed to compile shader");
                console.warn("ShaderInfoLog: ", gl.getShaderInfoLog(shader));
				console.log(src)
                gl.deleteShader(shader);
                throw new Error();
            }

            return shader;
        }
    }
}