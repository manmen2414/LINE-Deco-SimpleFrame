const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "index.js",
  },
  resolve: {
    extensions: [".js", ".json", ".css"],
  },
  target: ["web", "es5"],
  module: {
    rules: [
      {
        // Load CSS files. They can be imported into JS files.
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "./src/index.html"),
    }),
  ],
  devServer: {
    static: "./dist", // 静的ファイルを配布するディレクトリを指定
  },
};
