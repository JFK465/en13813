import { evaluateConformity } from '../../schemas/deviation.schema'

describe('EN13813 Konformitätsbewertung', () => {
  describe('Einzelwertverfahren (Single Value)', () => {
    it('sollte bestehen wenn alle Werte >= Zielwert', () => {
      const result = evaluateConformity(
        'single_value',
        [25.5, 26.0, 27.2, 25.1],
        25.0
      )

      expect(result.passed).toBe(true)
      expect(result.minValue).toBe(25.1)
      expect(result.details).toContain('Pass=true')
    })

    it('sollte fehlschlagen wenn ein Wert < Zielwert', () => {
      const result = evaluateConformity(
        'single_value',
        [25.5, 24.8, 27.2, 25.1],
        25.0
      )

      expect(result.passed).toBe(false)
      expect(result.minValue).toBe(24.8)
      expect(result.details).toContain('Pass=false')
    })
  })

  describe('Statistisches Verfahren', () => {
    it('sollte k-Faktor basierend auf Stichprobengröße verwenden', () => {
      // n=5, k=2.33 laut EN 13813 Table 12
      const result = evaluateConformity(
        'statistics',
        [26.0, 25.5, 26.2, 25.8, 26.5],
        25.0,
        5
      )

      expect(result.kFactor).toBe(2.33)
      expect(result.passed).toBe(true)
    })

    it('sollte fehlschlagen wenn untere Grenze < Zielwert', () => {
      const result = evaluateConformity(
        'statistics',
        [25.0, 24.5, 25.2, 24.8, 25.5],
        25.0,
        5
      )

      expect(result.passed).toBe(false)
      expect(result.lowerLimit).toBeLessThan(25.0)
    })

    it('sollte fehlschlagen wenn Minwert < 90% des Zielwerts', () => {
      const result = evaluateConformity(
        'statistics',
        [26.0, 25.5, 26.2, 22.0, 26.5], // 22.0 < 90% von 25.0
        25.0,
        5
      )

      expect(result.passed).toBe(false)
      expect(result.minValue).toBe(22.0)
      expect(result.details).toContain('90% threshold')
    })

    it('sollte korrekte k-Faktoren für verschiedene Stichprobengrößen verwenden', () => {
      const testCases = [
        { n: 3, expectedK: 2.63 },
        { n: 5, expectedK: 2.33 },
        { n: 10, expectedK: 1.93 },
        { n: 20, expectedK: 1.83 },
        { n: 100, expectedK: 1.72 },
      ]

      testCases.forEach(({ n, expectedK }) => {
        const values = Array(n).fill(30.0)
        const result = evaluateConformity('statistics', values, 25.0, n)
        expect(result.kFactor).toBe(expectedK)
      })
    })
  })

  describe('Edge Cases', () => {
    it('sollte mit leeren Arrays umgehen', () => {
      expect(() => evaluateConformity('single_value', [], 25.0)).toThrow()
    })

    it('sollte mit negativen Werten umgehen', () => {
      const result = evaluateConformity(
        'single_value',
        [-5, -3, -2, -4],
        -10
      )
      expect(result.passed).toBe(true)
    })

    it('sollte mit sehr großen Stichproben umgehen', () => {
      const values = Array(1000).fill(30.0)
      const result = evaluateConformity('statistics', values, 25.0, 1000)
      expect(result.kFactor).toBe(1.72)
      expect(result.passed).toBe(true)
    })
  })
})