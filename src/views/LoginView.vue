<script setup lang="ts">
import { LogIn, TriangleAlert, UserPlus } from '@lucide/vue'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppFooter from '@/components/AppFooter.vue'
import AppNavbar from '@/components/AppNavbar.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/supabase/useAuth'

const route = useRoute()
const router = useRouter()
const { inisialisasi, masuk, daftar } = useAuth()

const mode = ref<'masuk' | 'daftar'>('masuk')
const email = ref('')
const kataSandi = ref('')
const sibuk = ref(false)
const pesanError = ref('')
const pesanInfo = ref('')

onMounted(() => {
  inisialisasi()
})

async function submit() {
  pesanError.value = ''
  pesanInfo.value = ''

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())
  if (!emailValid) {
    pesanError.value = 'Alamat email tidak valid.'
    return
  }
  if (kataSandi.value.length < 6) {
    pesanError.value = 'Kata sandi minimal 6 karakter.'
    return
  }

  sibuk.value = true
  try {
    if (mode.value === 'masuk') {
      await masuk(email.value.trim(), kataSandi.value)
      const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/dashboard'
      await router.replace(redirect)
    } else {
      const data = await daftar(email.value.trim(), kataSandi.value)
      if (data.session) {
        await router.replace('/dashboard')
      } else {
        pesanInfo.value = 'Pendaftaran berhasil. Silakan periksa email Anda untuk konfirmasi, lalu masuk.'
        mode.value = 'masuk'
      }
    }
  } catch (e) {
    const m = e instanceof Error ? e.message : 'Terjadi kesalahan. Coba lagi.'
    pesanError.value = m.replace(/^.*?message:\s*/, '')
  } finally {
    sibuk.value = false
  }
}

const klsInput =
  'border-input bg-background h-10 w-full min-w-0 rounded-md border px-3 py-2 text-base shadow-sm outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3 disabled:pointer-events-none disabled:opacity-50 md:text-sm'
</script>

<template>
  <div class="min-h-screen">
    <AppNavbar />

    <section class="mx-auto flex max-w-md flex-col px-4 py-14 sm:px-6">
      <Card>
        <CardHeader class="text-center">
          <CardTitle class="font-display text-2xl font-normal">
            {{ mode === 'masuk' ? 'Masuk akun kader' : 'Daftar akun kader' }}
          </CardTitle>
          <CardDescription>
            {{ mode === 'masuk'
              ? 'Silakan masuk untuk mengelola data balita.'
              : 'Buat akun untuk mulai mencatat pengukuran balita.' }}
          </CardDescription>
        </CardHeader>

        <CardContent class="gap-5">
          <div
            class="inline-flex w-full rounded-lg border border-emerald-200 bg-emerald-50 p-1"
            role="group"
            aria-label="Mode"
          >
            <button
              type="button"
              :class="mode === 'masuk'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'"
              class="flex-1 rounded-md px-3 py-2 text-sm font-bold transition-colors"
              @click="mode = 'masuk'"
            >
              Masuk
            </button>
            <button
              type="button"
              :class="mode === 'daftar'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'"
              class="flex-1 rounded-md px-3 py-2 text-sm font-bold transition-colors"
              @click="mode = 'daftar'"
            >
              Daftar
            </button>
          </div>

          <form class="space-y-4" @submit.prevent="submit">
            <div>
              <label for="email" class="text-muted-foreground mb-1.5 block text-xs font-bold">
                Email
              </label>
              <input
                id="email"
                v-model="email"
                type="email"
                autocomplete="email"
                placeholder="kader@posyandu.example"
                :class="klsInput"
              />
            </div>

            <div>
              <label for="kata-sandi" class="text-muted-foreground mb-1.5 block text-xs font-bold">
                Kata sandi
              </label>
              <input
                id="kata-sandi"
                v-model="kataSandi"
                type="password"
                autocomplete="current-password"
                placeholder="••••••••"
                :class="klsInput"
              />
            </div>

            <p v-if="pesanInfo" class="text-sm font-medium text-emerald-700" role="status">
              {{ pesanInfo }}
            </p>
            <p v-if="pesanError" class="flex items-start gap-2 text-sm font-medium text-red-600" role="alert">
              <TriangleAlert class="mt-0.5 size-4 shrink-0" />
              {{ pesanError }}
            </p>

            <Button size="lg" class="w-full" :disabled="sibuk" type="submit">
              <component :is="mode === 'masuk' ? LogIn : UserPlus" class="size-4" />
              {{ sibuk ? 'Memproses…' : mode === 'masuk' ? 'Masuk' : 'Daftar' }}
            </Button>
          </form>

          <p class="text-muted-foreground text-xs leading-relaxed">
            Data balita hanya dapat diakses kader yang sudah masuk. Akun dibuat lewat halaman ini.
          </p>
        </CardContent>
      </Card>
    </section>

    <AppFooter />
  </div>
</template>
