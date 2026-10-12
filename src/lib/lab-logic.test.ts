import { describe, expect, it } from 'vitest'
import { toCsv, type CsvOptions } from '../lab/entries/csv-export'
import { lineTax } from '../lab/entries/invoice-summary'
import { delays } from '../lab/entries/retry-backoff'

describe('toCsv', () => {
  const es: CsvOptions = { separator: ';', bom: false, protectFormulas: true }

  it('pone entre comillas lo que tiene el separador, comillas o saltos de línea', () => {
    expect(toCsv([['Pérez; Ana', 'Taller "El Rayo"', 'a\nb', 'Pérez, Ana']], es)).toBe(
      '"Pérez; Ana";"Taller ""El Rayo""";"a\nb";Pérez, Ana',
    )
    expect(toCsv([['Pérez, Ana', 'simple']], { ...es, separator: ',' })).toBe('"Pérez, Ana",simple')
  })

  it('usa coma decimal con ";" y punto con ","', () => {
    expect(toCsv([[1250000.5]], es)).toBe('1250000,5')
    expect(toCsv([[1250000.5]], { ...es, separator: ',' })).toBe('1250000.5')
  })

  it('neutraliza fórmulas solo si se pide', () => {
    expect(toCsv([['=1+1', '-5', '@SUMA']], es)).toBe("'=1+1;'-5;'@SUMA")
    expect(toCsv([['=1+1']], { ...es, protectFormulas: false })).toBe('=1+1')
    // Un número negativo no es una fórmula
    expect(toCsv([[-5]], es)).toBe('-5')
  })

  it('añade el BOM y separa filas con CRLF', () => {
    expect(toCsv([['a'], ['b']], { ...es, bom: true })).toBe('﻿a\r\nb')
  })
})

describe('lineTax', () => {
  it('redondea el IVA de cada línea a pesos enteros', () => {
    expect(lineTax(49_332, 5)).toBe(2467) // 2466,6
    expect(lineTax(269_700, 19)).toBe(51_243)
    expect(lineTax(48_500, 0)).toBe(0)
  })
})

describe('delays', () => {
  it('sin jitter duplica la espera hasta el tope', () => {
    expect(delays(5, 1000, 5000, false, Math.random)).toEqual([1000, 2000, 4000, 5000, 5000])
  })

  it('con jitter cada espera queda entre 0 y su máximo', () => {
    const waits = delays(5, 1000, 5000, true, () => 0.5)
    expect(waits).toEqual([500, 1000, 2000, 2500, 2500])
  })
})
