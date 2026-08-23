import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'
import globals from 'globals'

export default tseslint.config(
  // Abaikan artefak build & dependensi
  { ignores: ['dist/', 'node_modules/', 'graphify-out/', 'coverage/'] },

  // Dasar JS + TS (tanpa type-checking agar lint tetap cepat)
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Vue: aturan esensial + gaya recommended (flat config)
  ...pluginVue.configs['flat/recommended'],

  // Parser TS untuk isi blok <script lang="ts"> pada file .vue
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: { parser: tseslint.parser, extraFileExtensions: ['.vue'] },
    },
  },

  {
    files: ['**/*.{ts,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser },
    },
    rules: {
      // Konvensi repo: longgarkan aturan format murni (prettier belum dipasang)
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/html-self-closing': 'off',
      'vue/html-indent': 'off',
      'vue/html-closing-bracket-newline': 'off',
      'vue/first-attribute-linebreak': 'off',
      'vue/block-order': ['error', { order: ['script', 'template', 'style'] }],
    },
  },

  // Komponen vendor shadcn-vue (src/components/ui/): nama satu-kata disengaja,
  // prop opsional tanpa default adalah pola baku pustakanya.
  {
    files: ['src/components/ui/**'],
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/require-default-prop': 'off',
    },
  },

  // Komponen pembantu satu-kata milik sendiri; bukan elemen HTML sehingga
  // risiko bentrok nama nihil, dan sudah dipakai luas (13 file).
  {
    files: ['src/components/Reveal.vue', 'src/components/Skeleton.vue'],
    rules: { 'vue/multi-word-component-names': 'off' },
  },

  // File test & config Node: boleh akses global Node
  {
    files: ['**/*.test.ts', 'vite.config.ts', 'eslint.config.ts'],
    languageOptions: { globals: { ...globals.node } },
  },
)
