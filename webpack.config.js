const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin")
const HtmlPlugin = require("html-webpack-plugin")
const CleanPlugin = require("clean-webpack-plugin")

const { resolve } = require("path")

module.exports = {
    mode: "development",
    entry: resolve(__dirname, "src/index.ts"),
    output: {
        path: resolve(__dirname, "dist"),
        filename: "[name].js",
    },
    resolve: {
        alias: {
            "webpack-hot-client/client": require.resolve("webpack-hot-client"),
        },
        extensions: [".ts", ".tsx"],
        plugins: [new TsconfigPathsPlugin({ configFile: resolve(__dirname, "tsconfig.json") })],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "babel-loader!ts-loader",
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
        content: "dist",
        compress: true,
        hotClient: false,
    },
}
