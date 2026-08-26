import { createApp } from 'vue'
import { registerSW } from 'virtual:pwa-register'
import App from './App.vue'
import router from './router'
import './style.css'

// Service worker PWA (auto-update): app shell ter-cache agar bisa dibuka offline.
registerSW({ immediate: true })

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
