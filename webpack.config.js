const webpack = require('webpack'),
 path = require('path'),
 HtmlWebpackPlugin = require('html-webpack-plugin'),
 {CleanWebpackPlugin} = require('clean-webpack-plugin'),
 CopyWebpackPlugin = require('copy-webpack-plugin'),
 MiniCssExtractPlugin = require('mini-css-extract-plugin'),
 OptimizeCssAssetPlugin = require('optimize-css-assets-webpack-plugin'),
 TerserWebpackPlugin = require('terser-webpack-plugin'),
 {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer'),
 LiveReloadPlugin = require('webpack-livereload-plugin'),
 SpriteLoaderPlugin = require('svg-sprite-loader/plugin');

const isDev = process.env.NODE_ENV === 'development';
const isProd = !isDev;

const optimization = () => {
  const config = {
    // splitChunks: {
    //   chunks: 'all'
    // }
  }

  if (isProd) {
    config.minimizer = [
      // new OptimizeCssAssetPlugin(),
      // new TerserWebpackPlugin()
    ]
  }

  return config;
}

const filename = ext => isDev ? `[name].${ext}` : `[name].[hash].${ext}`

const cssLoaders = extra => {
  const loaders = [{
    loader: MiniCssExtractPlugin.loader,
    options: {
      hrm: true,
      reloadAll: true,
      modules: true
    }
  }, 'css-loader'];

  if (extra) {
    loaders.push(extra);
  }

  return loaders;
};

const jsLoaders = () => {
  const loaders = [{
    loader: 'babel-loader',
    options: {
      presets: [
        '@babel/preset-env'
      ],
      plugins: [
        '@babel/plugin-proposal-class-properties'
      ]
    }
  }];

  if (isDev) {
    loaders.push('eslint-loader');
  }

  return loaders;
}

const plugins = () => {
  const base  = [
    // new webpack.HotModuleReplacementPlugin(),
    new LiveReloadPlugin({
      appendScriptTag: true
    }),
    new HtmlWebpackPlugin({
      template: './pug/index.pug',
      filename: 'index.html',
      chunks: ['home'],
    }),
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, 'src/assets/favicon.ico'),
        to: path.resolve(__dirname, 'dist/assets')
      },
      {
        from: path.resolve(__dirname, 'src/assets/fonts'),
        to: path.resolve(__dirname, 'dist/assets/fonts')
      },
    ]),
    new MiniCssExtractPlugin({
      filename: './assets/css/' + filename('css')
    }),
    new SpriteLoaderPlugin(),
  ]

  return base;
}

module.exports = {
  context: path.resolve(__dirname, 'src'),
  mode: 'development',
  entry: {
    home: './assets/js/home.js',
  },
  output: {
    filename: './assets/js/' + filename('js'),
    path: path.resolve(__dirname, 'dist')
  },
  resolve: {
    extensions: ['.js', '.json'],
    alias: {
      '@js': path.resolve(__dirname, 'src/assets/js'),
      '@js-modules' : path.resolve(__dirname, 'src/assets/js/modules'),
      '@': path.resolve(__dirname, 'src'),
      '@styles' : path.resolve(__dirname, 'src/assets/sass'),
      '@images' : path.resolve(__dirname, 'src/assets/images'),
      '@pics' : path.resolve(__dirname, 'src/assets/pics'),
      '@svg' : path.resolve(__dirname, 'src/assets/icons')
    }
  },
  optimization: optimization(),
  devServer: {
    port: 4200,
    hot: isDev,
    inline: true
  },
  devtool: isDev ? 'source-map' : '',
  plugins: plugins(),
  module: {
    rules: [
      {
        test: /\.pug$/,
        loaders: ['html-loader', 'pug-html-loader'],
      },
      {
        test: /\.css$/,
        use: cssLoaders()
      },
      {
        test: /\.s[ac]ss$/,
        use: cssLoaders('sass-loader')
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        exclude: [
          path.resolve(__dirname, 'src/assets/fonts')
        ],
        use: [{
          loader: 'file-loader',
          options: {
            name: '[path][name].[ext]',
          }
        }]
      },
      {
        test: /\.(ttf|woff|woff2|eot|svg)$/,
        include: path.resolve(__dirname, 'src/assets/fonts'),
        use: [{
          loader: 'file-loader',
          options: {
            type: 'assets/fonts',
            name: '[path][name].[ext]',
          }
        }]
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: jsLoaders()
      },
    ]
  }
}