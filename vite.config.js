import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import quizWsPlugin from './vite-ws-plugin.js'

// https://vite.dev/config/
export default defineConfig({
  base: '/Technodiaz-QUIZ-/',
  plugins: [react(), tailwindcss(), quizWsPlugin()],
})
