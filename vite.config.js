import vue from '@vitejs/plugin-vue'

/**
 * https://vitejs.dev/config/
 * @type {import('vite').UserConfig}
 */
export default {
    resolve: {
      alias: {
          'vue': 'vue/dist/vue.esm-bundler.js'
      },
    },
    plugins: [vue()]
}
