const webpack = require("webpack")
const path = require("path")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const CleanWebpackPlugin = require("clean-webpack-plugin")
const transformInfero = require("ts-transform-inferno").default

module.exports = {
    entry: "./src/index.ts",
    output: {
        path: path.resolve(__dirname, "dist/"),
        filename: "bundle.js",
    },
    resolve: {
        extensions: [".js", ".ts", ".tsx"],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
                // options: {
                //     getCustomTransformers: () => ({
                //         before: [transformInfero()],
                //     }),
                // },
            },
        ],
    },
    devServer: {
        contentBase: "./src/",
        historyApiFallback: true,
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./src/index.html",
            inject: "body",
        }),
        new CleanWebpackPlugin(["dist"]),
    ],
}
