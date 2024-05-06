export function isPasswordValid(password: string): boolean {
  if (password.length < 4) return false

  return true
}

export function formatCurrency(currency: number): string {
  return new Intl.NumberFormat('en-US', {
    currency: 'USD',
    style: 'currency',
  }).format(currency)
}

export function arrayFill<D = unknown>(n: number, filler: (index: number) => D): D[]
export function arrayFill<D = unknown>(n: number, filler: any): D[]
export function arrayFill<D = unknown>(n: number, filler: any): D[] {
  return Array.from({ length: n }, (e, i) => {
    return typeof filler === 'function' ? filler(i) : filler
  })
}
