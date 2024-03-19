const path = require('path');

   module.exports = {
     entry: './src/index.js',
     output: {
       path: path.resolve(__dirname, 'dist'),
       filename: 'bundle.js',
     },
     module: {
       rules: [
         {
           test: /\.js$/,
           exclude: /node_modules/,
           use: {
             loader: 'babel-loader',
             options: {
               presets: ['@babel/preset-react'],
             },
           },
         },
       ],
     },
     resolve: {
       fallback: {
         "fs": false,
         "path": false,
         "os": false,
       },
     },
     devServer: {
      client: {
        overlay: false,  // disable full screen overlay
  
        // You can configure more specifically:
        // overlay: {
        //  errors: true,
        //  warnings: false,
        //  runtimeErrors: true,
        //}
      }  
     }
   };