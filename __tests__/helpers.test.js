import formatDate from '../server/helpers/formatDate.js'
import isEmpty from '../server/helpers/isEmpty.js'

describe('Функции-помощники', () => {
  describe('formatDate', () => {
    it('должен форматировать дату в русском формате', () => {
      const dateString = '2025-01-15T10:30:00.000Z'
      const result = formatDate(dateString)
      
      expect(result).toMatch(/15 января 2025 г\. в \d{2}:\d{2}/)
    })

    it('должен корректно форматировать дату с нулевыми минутами', () => {
      const dateString = '2025-12-31T23:00:00.000Z'
      const result = formatDate(dateString)
      
      expect(result).toMatch(/\d{2} (декабря 2025|января 2026) г\. в \d{2}:\d{2}/)
    })

    it('должен форматировать дату начала года', () => {
      const dateString = '2026-01-01T00:00:00.000Z'
      const result = formatDate(dateString)
      
      expect(result).toMatch(/01 января 2026 г\. в \d{2}:\d{2}/)
    })

    it('должен корректно обрабатывать различные месяцы', () => {
      const dates = [
        '2025-02-15T12:00:00.000Z',
        '2025-06-20T15:30:00.000Z',
        '2025-09-10T08:45:00.000Z',
      ]
      
      dates.forEach((dateString) => {
        const result = formatDate(dateString)
        expect(result).toMatch(/\d{2} [а-я]+ \d{4} г\. в \d{2}:\d{2}/)
        expect(result).toContain(' в ')
      })
    })
  })

  describe('isEmpty', () => {
    describe('должен возвращать true для пустых значений', () => {
      it('для null', () => {
        expect(isEmpty(null)).toBe(true)
      })

      it('для undefined', () => {
        expect(isEmpty(undefined)).toBe(true)
      })

      it('для пустой строки', () => {
        expect(isEmpty('')).toBe(true)
      })

      it('для пустого массива', () => {
        expect(isEmpty([])).toBe(true)
      })

      it('для пустого объекта', () => {
        expect(isEmpty({})).toBe(true)
      })

      it('для пустой Map', () => {
        expect(isEmpty(new Map())).toBe(true)
      })

      it('для пустого Set', () => {
        expect(isEmpty(new Set())).toBe(true)
      })
    })

    describe('должен возвращать false для непустых значений', () => {
      it('для непустой строки', () => {
        expect(isEmpty('hello')).toBe(false)
      })

      it('для строки с пробелом', () => {
        expect(isEmpty(' ')).toBe(false)
      })

      it('для массива с элементами', () => {
        expect(isEmpty([1, 2, 3])).toBe(false)
      })

      it('для массива с одним элементом', () => {
        expect(isEmpty([null])).toBe(false)
      })

      it('для объекта со свойствами', () => {
        expect(isEmpty({ key: 'value' })).toBe(false)
      })

      it('для Map с элементами', () => {
        const map = new Map()
        map.set('key', 'value')
        expect(isEmpty(map)).toBe(false)
      })

      it('для Set с элементами', () => {
        const set = new Set()
        set.add(1)
        expect(isEmpty(set)).toBe(false)
      })

      it('для числа 0', () => {
        expect(isEmpty(0)).toBe(false)
      })

      it('для булева значения false', () => {
        expect(isEmpty(false)).toBe(false)
      })

      it('для числа', () => {
        expect(isEmpty(42)).toBe(false)
      })

      it('для булева значения true', () => {
        expect(isEmpty(true)).toBe(false)
      })
    })
  })
})
