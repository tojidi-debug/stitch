import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/stitch/', // GitHub Pages 배포를 위한 베이스 경로 설정
})
