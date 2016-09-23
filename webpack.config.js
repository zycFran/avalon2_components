var webpack = require('webpack');

var path = require('path');

function heredoc(fn) {
    return fn.toString().replace(/^[^\/]+\/\*!?\s?/, '').
        replace(/\*\/[^\/]+$/, '').trim().replace(/>\s*</g, '><')
}
var api = heredoc(function () {
    /*
     avalon的分页组件
     getHref: 生成页面的href
     getTitle: 生成页面的title
     showPages: 5 显示页码的个数
     totalPages: 15, 总数量
     currentPage: 1, 当前面
     firstText: 'First',
     prevText: 'Previous',
     nextText: 'Next',
     lastText: 'Last',
     onPageClick: 点击页码的回调

     使用
     兼容IE6-8
     <wbr ms-widget="[{is:'ms-pager'}, @config]"/>
     只支持现代浏览器(IE9+)
     <ms-pager ms-widget="@config">
     </ms-pager>
     */
})
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var cssExtractor = new ExtractTextPlugin('/[name].css');

module.exports = {
    entry: {
        index: './test'
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].js',
        libraryTarget: 'umd',
        library: 'avalon',
        publicPath: '/fake_avalon2/dist/'
    }, //页面引用的文件

    module: {
        loaders: [
            { test: /\.css$/, loader: 'style!css' },
            {
                test: /\.(png|jpg)$/,
                loader: "url?limit=10000&name=./images/[name].[ext]!image-webpack"
            },
            {
                test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
                loader: 'file-loader'
            },
            {test: /\.html$/, loader: 'raw!html-minify'}
            //{ test: /\.css$/, loader: ExtractTextPlugin.extract("style", "css!postcss") },
            //{ test: /\.scss$/, loader: ExtractTextPlugin.extract("style", "css!postcss!sass")  },
            //{ test: /\.(png|jpg)$/, loader: "url?limit=10000&name=./images/[name].[ext]!image-webpack" },
            //{ test: /\.json$/, loader: "json" },
            //{ test: /\.html$/, loader: "html!html-minify" }
        ]
    },

    'html-minify-loader': {
        empty: true, // KEEP empty attributes
        cdata: true, // KEEP CDATA from scripts
        comments: true, // KEEP comments
        dom: {// options of !(htmlparser2)[https://github.com/fb55/htmlparser2]
            lowerCaseAttributeNames: false, // do not call .toLowerCase for each attribute name (Angular2 use camelCase attributes)
        }
    },
    plugins: [
        new webpack.BannerPlugin('分页 by 司徒正美\n' + api),
        cssExtractor
    ],
    resolve: {
        extensions: ['.js', '', '.css']
    }
}