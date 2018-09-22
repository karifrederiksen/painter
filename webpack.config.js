const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin")
const HtmlPlugin = require("html-webpack-plugin")
const CleanPlugin = require("clean-webpack-plugin")
const { resolve } = require("path")

const babelConfig = {
    presets: [["@babel/preset-env", { modules: false }], "@babel/preset-react"],
    plugins: [
        "@babel/plugin-transform-runtime",
        ["babel-plugin-styled-components", { displayName: true }],
        ["babel-plugin-transform-inline-environment-variables", { include: ["NODE_ENV"] }],
    ],
}

module.exports = {
    mode: "development",
    entry: resolve(__dirname, "src/index.ts"),
    output: {
        path: resolve(__dirname, "dist"),
        filename: "[name].js",
    },
    resolve: {
        alias: {
            "webpack-hot-client/client": require.resolve("webpack-hot-client/client"),
        },
        extensions: [".ts", ".tsx", ".js"],
        plugins: [new TsconfigPathsPlugin({ configFile: resolve(__dirname, "tsconfig.json") })],
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
        new CleanPlugin(["dist"]),
        new HtmlPlugin({ template: resolve(__dirname, "src/index.html") }),
    ],
    devtool: "cheap-module-source-map",
    serve: {
        clipboard: true,
        host: "localhost",
        port: 1234,
        compress: true,
        hotClient: true,
    },
}
