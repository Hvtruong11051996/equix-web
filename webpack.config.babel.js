const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const inProduction = false;
const hashString = inProduction ? '.[hash:8]' : '';
const localIdentName = inProduction ? '[hash:base64:8]' : '[local]__[hash:base64:5]'

const plugins = inProduction ? [
    new HtmlWebpackPlugin({
        filename: 'index.html',
        template: './src/index.html'
    }),
    new webpack.DefinePlugin({
        'process.env': {
            'NODE_ENV': JSON.stringify('production')
        }
    }),
    // Necessary b/c golden-layout depends on all 3 of these libs via UMD globals
    new webpack.ProvidePlugin({
        React: 'react',
        ReactDOM: 'react-dom',
        $: 'jquery',
        jQuery: 'jquery'
    }),
    new ExtractTextPlugin(`styles${hashString}.css`),
    new CopyWebpackPlugin([{ from: 'public', to: '' }]),
    new UglifyJSPlugin({
        sourceMap: false
    })
] : [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: './src/index.html'
        }),
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('development')
            }
        }),
        // Necessary b/c golden-layout depends on all 3 of these libs via UMD globals
        new webpack.ProvidePlugin({
            React: 'react',
            ReactDOM: 'react-dom',
            $: 'jquery',
            jQuery: 'jquery'
        }),
        new ExtractTextPlugin(`styles${hashString}.css`),
        new CopyWebpackPlugin([{ from: 'public', to: '' }])
    ];
const entry = inProduction ? [
    path.join(__dirname, 'src/index.jsx') // entry point of app
] : [
        'webpack-dev-server/client?http://localhost:8080/', // webpack dev server host and port
        path.join(__dirname, 'src/index.jsx')
    ];
module.exports = () => ({
    entry: entry,
    output: {
        path: path.join(__dirname, '/dist'),
        // publicPath: "/public/",
        filename: `bundle${hashString}.js`
    },
    plugins: plugins,
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                include: path.join(__dirname, 'src'),
                use: [{
                    loader: 'babel-loader',
                    options: {
                        babelrc: false, // Tells webpack not to use the .babelrc file
                        presets: [
                            ['env', {
                                'targets': { node: 'current' } // specify targets here
                            }],
                            'stage-0',
                            'react'
                        ],
                        plugins: [
                            'transform-es2015-block-scoping'
                        ]
                    }
                }]
            },
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: ['babel-loader']
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: ['babel-loader', 'eslint-loader']
            },
            {
                test: /\.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
                loader: `file-loader?name=fonts/[name]${hashString}.[ext]`
            },
            {
                test: /\.module\.css$/,
                loader: `style-loader!css-loader?modules&importLoaders=1&localIdentName=${localIdentName}`
            },
            {
                test: /\.css$/,
                exclude: /\.module\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: 'css-loader'
                })
            },
            {
                test: /\.(png|jpg|jpeg|gif)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 4096
                        }
                    }
                ]
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                loader: 'file-loader?name=/public/img/[name].[ext]'
            }

        ]
    },
    resolve: {
        extensions: ['.js', '.jsx']
    },
    devtool: 'source-map'
});
