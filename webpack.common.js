/* eslint-disable @typescript-eslint/no-var-requires */
const { CleanWebpackPlugin } = require("clean-webpack-plugin")
const HtmlPlugin = require("html-webpack-plugin")
const ForkTsCheckerPlugin = require("fork-ts-checker-webpack-plugin")
const TerserPlugin = require("terser-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const { resolve } = require("path")

function create(env) {
    const isDev = env !== "production"

    return {
        mode: env,
        entry: resolve(__dirname, "src", "ui", "index.ts"),
        output: {
            path: resolve(__dirname, "dist", env),
            filename: isDev ? "[name].js" : "[name]-[hash].js",
            pathinfo: false,
        },
        devtool: isDev ? "cheap-module-eval-source-map" : "source-map",
        optimization: {
            nodeEnv: env,
            minimizer: isDev
                ? []
                : [
                      new TerserPlugin({
                          terserOptions: {
                              compress: {
                                  drop_console: true,
                                  unsafe_math: true,
                                  unsafe_undefined: true,
                              },
                              ie8: false,
                              safari10: false,
                              keep_classnames: false,
                          },
                          sourceMap: true,
                      }),
                  ],
        },
        resolve: {
            extensions: [".mjs", ".js", ".ts", ".json"],
        },
        module: {
            rules: [
                {
                    test: /\.(js?|ts?)$/,
                    exclude: /node_modules/,
                    use: [
                        {
                            loader: "ts-loader",
                            options: { transpileOnly: true },
                        },
                    ],
                },
                {
                    test: /\.s?css$/,
                    use: [
                        { loader: MiniCssExtractPlugin.loader, options: { hmr: isDev } },
                        {
                            loader: "css-loader",
                            options: {
                                sourceMap: true,
                                localsConvention: "camelCase",
                                modules: {
                                    mode: "local",
                                    localIdentName: "[path][name]__[local]",
                                    context: resolve(__dirname, "src"),
                                },
                            },
                        },
                        { loader: "sass-loader", options: { sourceMap: true } },
                    ],
                },
            ],
        },
        plugins: [
            new ForkTsCheckerPlugin({
                reportFiles: ["src/**/*.ts"],
            }),
            new MiniCssExtractPlugin({
                filename: isDev ? "[name].css" : "[name]-[hash].css",
            }),
            new HtmlPlugin({ template: resolve(__dirname, "src", "index.html") }),
            new CleanWebpackPlugin(),
        ],
    }
}
module.exports = { create }
