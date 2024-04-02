import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'], // Tous les modules répertoriés ici seront regroupés dans 'vendor.js'
          'common': ['axios', 'lodash'], // Tous les modules répertoriés ici seront regroupés dans 'common.js'
          'monaco': ['@monaco-editor/react'], // Tous les modules répertoriés ici seront regroupés dans 'monaco.js'
          'babel': ['@babel/core','@babel/preset-react','@babel/standalone'], // Tous les modules répertoriés ici seront regroupés dans 'babel.js'
          'chat': ['./src/components/ChatView','./src/components/ChatSettings'] // Tous les modules répertoriés ici seront regroupés dans 'components.js'
        }
      }
    }
  }
})