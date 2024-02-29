const path = require('path')
const rules = require('./webpack.rules')
const CopyWebpackPlugin = require('copy-webpack-plugin')
rules.push({
    test: /\.css$/,
    use: [
        { loader: 'style-loader' },
        { loader: 'css-loader' },
        { loader: 'postcss-loader' },
    ],
})
const assets = ['assets']
const copyPlugins = new CopyWebpackPlugin({
    patterns: assets.map((asset) => ({
        from: path.resolve(__dirname, 'src', asset),
        to: path.resolve(__dirname, '.webpack/renderer', asset),
    })),
})
module.exports = {
    module: {
        rules,
    },
    plugins: [copyPlugins],
}
