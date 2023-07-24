const path = require('path');

module.exports = {
  entry: './src/client/collage.ts', // Entry point for your client-side TypeScript code
  output: {
    filename: 'bundle.js', // Output filename
    path: path.resolve(__dirname, 'src/public/js'), // Output directory - this will place the compiled JavaScript in the 'assets' folder
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
};
