const merge = require("webpack-merge")
const common = require("./webpack.common")
const UglifyJsPlugin = require("uglifyjs-webpack-plugin")

module.exports = merge(common, {
    mode: "production",
    devtool: "source-map",
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                uglifyOptions: {
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
