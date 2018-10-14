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
        filename: "[name]-[hash].js",
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
            {
                test: /\.css$/,
                use: [
                    { loader: "style-loader" },
                    { loader: "css-loader", options: { modules: true, importLoaders: 1 } },
                    {
                        loader: "postcss-loader",
                        options: {
                            plugins: [require("autoprefixer"), require("cssnano")()],
                        },
                    },
                ],
            },
        ],
    },
    plugins: [
        new HtmlPlugin({ template: resolve(__dirname, "src/index.html") }),
        new CleanPlugin(["dist"]),
    ],
}
