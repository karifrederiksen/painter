"use strict";

// plugins
import babel from "rollup-plugin-babel";
//import eslint from "rollup-plugin-eslint";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
//import uglify from "rollup-plugin-uglify";


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
		commonjs(),
		babel({
    		presets: ["es2015-rollup"],
			exclude: "node_modules/**"
		})
	]
};