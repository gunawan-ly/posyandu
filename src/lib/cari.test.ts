import { describe, expect, it } from 'vitest'
import { escapeIlike } from './cari'

describe('escapeIlike', () => {
  it('memberi tanda balik pada %, _, dan \\ tanpa mengubah karakter lain', () => {
    expect(escapeIlike('a%b')).toBe('a\\%b')
    expect(escapeIlike('a_b')).toBe('a\\_b')
    expect(escapeIlike('a\\b')).toBe('a\\\\b')
    expect(escapeIlike('Raka Pratama')).toBe('Raka Pratama')
  })

  it('kombinasi karakter khusus di-escape semua', () => {
    expect(escapeIlike('100%_ok\\')).toBe('100\\%\\_ok\\\\')
    expect(escapeIlike('%_%')).toBe('\\%\\_\\%')
  })

  it('string kosong tetap kosong', () => {
    expect(escapeIlike('')).toBe('')
  })
})
