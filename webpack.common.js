const CleanPlugin = require("clean-webpack-plugin")
const HtmlPlugin = require("html-webpack-plugin")
const { resolve } = require("path")

const babelConfig = {
    presets: [["@babel/preset-env", { modules: false }], "@babel/preset-react"],
    plugins: [
        "@babel/plugin-transform-runtime",
        ["babel-plugin-styled-components", { displayName: true }],
    ],
}

module.exports = {
    entry: resolve(__dirname, "src/ui/index.tsx"),
    output: {
        path: resolve(__dirname, "dist"),
        filename: "[name].js",
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
    },
    module: {
        rules: [
            {
                test: /\.js/,
                exclude: /node_modules/,
                use: [{ loader: "babel-loader", options: babelConfig }],
            },
            {
                test: /\.tsx?$/,
                use: [{ loader: "babel-loader", options: babelConfig }, { loader: "ts-loader" }],
            },
        ],
    },
    plugins: [
        new HtmlPlugin({ template: resolve(__dirname, "src/index.html") }),
        new CleanPlugin(["dist"]),
    ],
}
