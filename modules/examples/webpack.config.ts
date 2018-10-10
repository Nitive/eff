import * as path from 'path'
import { DefinePlugin, Configuration } from 'webpack'

const mode = 'development'

const config: Configuration = {
  entry: {
    main: [path.join(__dirname, 'app')],
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name]/app.js',
  },
  mode,
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
          },
        },
      },
      {
        test: /\.(eot|woff2|woff|ttf)/,
        use: 'file-loader',
      },
    ],
  },
  plugins: [
    new DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(mode),
    }),
  ],
  resolve: {
    extensions: ['.js', '.json', '.ts', '.tsx'],
  },
}

export default config
