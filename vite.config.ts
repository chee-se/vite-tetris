import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // tsconfig の paths（@/* → src/*）を Vite でも使う
    tsconfigPaths: true,
  },
})
