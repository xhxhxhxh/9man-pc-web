const path = require('path');
const webpack = require('webpack');
const htmlWebpackPlugin = require('html-webpack-plugin');
// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
    mode: 'development',
    devtool: 'module-source-map',
    entry: ["babel-polyfill", path.join(__dirname,'./src/index.js')],
    output: {
        path: path.join(__dirname,'./dist'),
        filename: 'bundle.js',
    },
    devServer: {
        open: true,
        port: 8082,
        contentBase: 'src',
        hot: true,
        proxy: {
            "/indexapp.php": {
                target: 'https://edu.9man.com',
                pathRewrite: {'^/' : '/'},
                changeOrigin: true
            },
            "/syncshuxe": {
                target: 'https://www2.9man.com',
                pathRewrite: {'^/' : '/'},
                changeOrigin: true
            },
            "/v1": {
                target: 'https://api.9mankid.com/api',
                pathRewrite: {'^/' : '/'},
                changeOrigin: true
            },
            "/admin": {
                target: 'https://api.9mankid.com/uploads',
                pathRewrite: {'^/' : '/'},
                changeOrigin: true
            },
            "/agreement": {
                target: 'https://www.9mankid.com',
                pathRewrite: {'^/' : '/'},
                changeOrigin: true
            },
            "/datas": {
                target: 'https://api.9mankid.com/uploads',
                pathRewrite: {'^/' : '/'},
                changeOrigin: true
            },
            "/emptyRoom": {
                target: 'https://www.9mankid.com:8210',
                pathRewrite: {'^/' : '/'},
                changeOrigin: true,
                secure: false
            },
            "/restartRoom": {
                target: 'https://www.9mankid.com:8210',
                pathRewrite: {'^/' : '/'},
                changeOrigin: true,
                secure: false
            },
        },
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        // new BundleAnalyzerPlugin({ analyzerPort: 8919 }),
        new htmlWebpackPlugin ({
            template: path.join(__dirname,'./src/index.html'),
            filename: 'index.html',
            favicon: './favicon.ico'
        }),

    ],
    module: {
        rules: [
            {test: /\.css$/, use: ['style-loader','css-loader']},
            {
                test: /\.less$/,
                use: [
                        {
                            loader: 'style-loader',
                        },
                        {
                            loader: 'css-loader',
                        },
                        {
                            loader: 'less-loader',
                            options: {modifyVars: {'primary-color': '#f85415'}, javascriptEnabled: true,},
                        }
                    ]
            },
            {test: /\.(jpg|png|gif|bmp|jpeg|cur|ico)$/, use: ['url-loader?limit=30000&name=[hash:8]-[name].[ext]']},
            {test: /\.(ttf|eot|woff|woff2|svg)$/, use: ['url-loader']},
            {test: /\.(mp4)$/, use: ['file-loader?limit=1']},
            {test: /\.js$/, exclude: /node_modules/, use: [{loader: 'babel-loader'}]},
            {test: /\.vue$/, use: [{loader: 'vue-loader'}]},
        ],
    },
    resolve: {
        extensions: ['.js','.vue'],
        alias: {
            '@': path.join(__dirname, './src')
        }
    }
};
