<script setup lang="ts">
import { LogIn, TriangleAlert } from '@lucide/vue'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppFooter from '@/components/AppFooter.vue'
import AppNavbar from '@/components/AppNavbar.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/supabase/useAuth'

const route = useRoute()
const router = useRouter()
const { inisialisasi, masuk } = useAuth()

const email = ref('')
const kataSandi = ref('')
const sibuk = ref(false)
const pesanError = ref('')

onMounted(() => {
  inisialisasi()
})

async function submit() {
  pesanError.value = ''

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
    await masuk(email.value.trim(), kataSandi.value)
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/dashboard'
    await router.replace(redirect)
  } catch (e) {
    pesanError.value = e instanceof Error ? e.message : 'Terjadi kesalahan. Coba lagi.'
  } finally {
    sibuk.value = false
  }
}

const klsInput =
  'border-input bg-background h-12 md:h-10 w-full min-w-0 rounded-md border px-3 py-2 text-base shadow-sm outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3 disabled:pointer-events-none disabled:opacity-50 md:text-sm'
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <AppNavbar />

    <section class="mx-auto flex w-full max-w-md flex-col px-4 py-14 sm:px-6">
      <Card>
        <CardHeader class="text-center">
          <CardTitle class="font-display text-2xl font-normal">Masuk akun kader</CardTitle>
          <CardDescription>
            Data posyandu hanya dapat diakses kader terdaftar.
          </CardDescription>
        </CardHeader>

        <CardContent class="flex flex-col gap-5">
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

            <p v-if="pesanError" class="flex items-start gap-2 text-sm font-medium text-red-600" role="alert">
              <TriangleAlert class="mt-0.5 size-4 shrink-0" />
              {{ pesanError }}
            </p>

            <Button size="lg" class="w-full" :disabled="sibuk" type="submit">
              <LogIn class="size-4" />
              {{ sibuk ? 'Memproses…' : 'Masuk' }}
            </Button>
          </form>

          <p class="text-muted-foreground text-xs leading-relaxed">
            Data posyandu bersifat privat. Akun kader diberikan langsung oleh pengelola posyandu —
            pendaftaran mandiri tidak tersedia.
          </p>
        </CardContent>
      </Card>
    </section>

    <AppFooter />
  </div>
</template>
