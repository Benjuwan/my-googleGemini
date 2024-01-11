import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // https://github.com/vitejs/vite/issues/1973
  // define: {
  //   'process.env': {}
  // }
})
