"use strict";

// plugins
import babel from "rollup-plugin-babel";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";


export default {
	entry: "dist/js/main.js",
	dest: "dist/app.min.js",
	format: "iife",
	moduleName: "MyBundle",
	sourceMap: "inline",
	plugins: [
		resolve({
			jsnext: true,
			main: true,
			browser: true
		}),
		commonjs({
			include: [
				"node_modules/immutable/**",
			],
			namedExports: {
				"node_modules/immutable/dist/immutable.js": [
					"List", 
					"Iterable", 
					"Stack",
					"Record",
					"Set",
					"Map",
					"Range",
					"OrderedMap",
					"Repeat",
					"Seq",
					"Collection"
					]
			}
		}),
		babel({
    		presets: ["es2015-rollup"],
			exclude: "node_modules/**"
		})
	]
};