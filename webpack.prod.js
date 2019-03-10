const merge = require("webpack-merge")
const common = require("./webpack.common")
const TerserPlugin = require("terser-webpack-plugin")

module.exports = merge(common, {
    mode: "production",
    devtool: "source-map",
    optimization: {
        minimizer: [
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
        nodeEnv: "production",
    },
})
