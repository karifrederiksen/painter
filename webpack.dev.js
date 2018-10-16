const merge = require("webpack-merge")
const common = require("./webpack.common")

module.exports = merge(common, {
    mode: "development",
    devtool: "eval-source-map",
    optimization: {
        nodeEnv: "development",
    },
    resolve: {
        alias: {
            "webpack-hot-client/client": require.resolve("webpack-hot-client/client"),
        },
    },
    serve: {
        clipboard: true,
        host: "localhost",
        port: 6789,
        compress: true,
        hotClient: true,
    },
})
