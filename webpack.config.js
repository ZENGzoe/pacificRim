var package = require('./package.json'),
	CleanWebpackPlugin = require('clean-webpack-plugin'),
	webpack = require('webpack'),
	ExtractTextWebpackPlugin = require('extract-text-webpack-plugin'),
	CopyWebpackPlugin = require('copy-webpack-plugin'),
	HtmlWebpackPlugin = require('html-webpack-plugin'),
	WebpackDevServer = require('webpack-dev-server');

var minify = process.env.ENV == 'prod'; //是否压缩

module.exports = {
	entry : {
		index : './src/js/index.js'
	},
	output : {
		path : __dirname + '/dist',
		filename : 'js/[name].js'
	},
	module : {
		rules : [{
			test : /\.(css|scss)$/,
			use : ExtractTextWebpackPlugin.extract({
				use : [
					'css-loader?-url&-reduceTransforms',
					'postcss-loader',
					'sass-loader'
				]
			})
		}]
	},
	plugins : [
		new CleanWebpackPlugin('./dist'),
		new webpack.BannerPlugin('v' + package.version),
		new ExtractTextWebpackPlugin('css/[name].css'),
		new webpack.ProvidePlugin({
			$: '../lib/zepto.js'
		}),
		new CopyWebpackPlugin([
			{
				from : './src/img',
				to : 'img',
				ignore : ['.gitkeep']
			},{
				from : './src/js/conf.js',
				to : 'js'
			},{
				from : './src/plugin',
				to : 'plugin',
				ignore : ['.gitkeep']
			}
		]),
		new HtmlWebpackPlugin({
			inject : false,
			minify : minify ? {
				collapseWhitespace : true,
				minifyCSS : true,
				minifyJS : true,
				removeComments : true
			} : false,
			template : './src/index.html'
		})
	]
};