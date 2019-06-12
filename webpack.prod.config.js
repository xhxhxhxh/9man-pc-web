const path = require('path');
const webpack = require('webpack');
const htmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin'); //抽离css
const extractCSS = new ExtractTextWebpackPlugin({filename: 'css/awesome.css',allChunks: true});
const extractLESS = new ExtractTextWebpackPlugin({filename: 'css/reset.css',allChunks: true});
const extractLESSOfVue = new ExtractTextWebpackPlugin({filename: 'css/index.css',allChunks: true});
// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const PrerenderSPAPlugin = require('prerender-spa-plugin');//spa工具
const Renderer = PrerenderSPAPlugin.PuppeteerRenderer;

module.exports = {
    mode: 'production',
    entry: path.join(__dirname,'./src/index.js'),
    output: {
        path: path.join(__dirname,'./dist'),
        filename: 'js/bundle.js',
        // publicPath: './'
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        // new BundleAnalyzerPlugin({ analyzerPort: 8919 }),
        new htmlWebpackPlugin ({
            template: path.join(__dirname,'./src/index.html'),
            filename: 'index.html',
            favicon: './favicon.ico'
        }),
        new webpack.ContextReplacementPlugin(
            /moment[/\\]locale$/,
            /zh-cn/,
        ),
        // new ExtractTextWebpackPlugin({ //3、 在plugins中配置属性
        //     filename: 'css/9manChild.min.css' // 配置提取出来的css名称
        // })
        extractCSS,
        extractLESS,
        extractLESSOfVue,
        //spa渲染
        // new PrerenderSPAPlugin({
        //     staticDir: path.join(__dirname, 'dist'),
        //     routes: [ '/'],
        //     renderer: new Renderer({
        //         // renderAfterDocumentEvent: 'render-event',
        //         // renderAfterTime: 5000
        //     })
        // })
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                use: extractCSS.extract({
                    fallback: "style-loader",
                    use: "css-loader"
                })
            },
            {
                test: /\.less$/,
                use: extractLESS.extract({ // 2、使用ExtractTextWebpackPlugin
                    fallback: {// 不提取的时候，使用什么样的配置来处理css
                        loader: 'style-loader',
                        options: {
                            singleton: true
                        }
                    },
                    use: [
                        {
                            loader: 'css-loader', // translates CSS into CommonJS
                        },
                        {
                            loader: 'less-loader', // compiles Less to CSS
                            options: {modifyVars: {'primary-color': '#FCC93A'}, javascriptEnabled: true},
                        }]
                })
            },
            {test: /\.(jpg|png|gif|bmp|jpeg)$/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit: 30000,
                        name: '[hash:8]-[name].[ext]',
                        outputPath: 'images',
                    }
                }]},
            {test: /\.(ttf|eot|svg|woff|woff2)$/, use: ['url-loader']},
            {test: /\.js$/, use: 'babel-loader', exclude: /node_modules/},
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    //extractCSS: true,
                    loaders: {
                        css: extractLESSOfVue.extract({
                            use: 'css-loader',
                            fallback: 'vue-style-loader',
                        }),
                        less: extractLESSOfVue.extract({
                            use: ['css-loader','less-loader'],
                            fallback: 'vue-style-loader',
                            publicPath: '../'
                        })
                    },
                }
            },
        ],
    },
    resolve: {
        extensions: ['.js','.vue'],
        alias: {
            '@': path.join(__dirname, './src')
        }
    }
};
