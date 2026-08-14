import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'

const app = createApp(App).use(router)

// Pulihkan rute yang disimpan 404.html (deep-link di GitHub Pages) setelah rute awal siap.
router.isReady().then(() => {
  const tersimpan = sessionStorage.getItem('redirect-pages')
  if (tersimpan) {
    sessionStorage.removeItem('redirect-pages')
    router.replace(tersimpan)
  }
})

app.mount('#app')
