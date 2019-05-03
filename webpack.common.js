/* eslint-disable @typescript-eslint/no-var-requires */
const CleanPlugin = require("clean-webpack-plugin")
const HtmlPlugin = require("html-webpack-plugin")
const ForkTsCheckerPlugin = require("fork-ts-checker-webpack-plugin")
const TerserPlugin = require("terser-webpack-plugin")
const { resolve } = require("path")

const babelConfig = {
    presets: [["@babel/preset-env", { modules: false }], "@babel/preset-react"],
    plugins: [
        "@babel/plugin-transform-runtime",
        ["babel-plugin-styled-components", { displayName: true, pure: true }],
    ],
}

function create(env) {
    const isDev = env !== "production"

    return {
        mode: env,
        entry: resolve(__dirname, "src", "app", "index.tsx"),
        output: {
            path: resolve(__dirname, "dist"),
            filename: "[name]-[hash].js",
            pathinfo: false,
        },
        devtool: isDev ? "cheap-module-eval-source-map" : "source-map",
        optimization: {
            nodeEnv: env,
            minimizer: isDev
                ? []
                : [
                      new TerserPlugin({
                          parallel: true,
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
            extensions: [".mjs", ".js", ".ts", ".tsx", ".json"],
        },
        module: {
            rules: [
                {
                    test: /\.(jsx?|tsx?)$/,
                    exclude: /node_modules/,
                    use: [
                        { loader: "babel-loader", options: babelConfig },
                        {
                            loader: "ts-loader",
                            options: {
                                transpileOnly: true,
                                experimentalWatchApi: true,
                            },
                        },
                    ].filter(Boolean),
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
            new ForkTsCheckerPlugin({
                reportFiles: ["src/**/*.{ts,tsx}"],
            }),
            new HtmlPlugin({ template: resolve(__dirname, "src", "index.html") }),
            new CleanPlugin(["dist"]),
        ],
        serve: {
            clipboard: true,
            host: "localhost",
            port: 6789,
            compress: true,
            hotClient: true,
        },
    }
}
module.exports = { create }
