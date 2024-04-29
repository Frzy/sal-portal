export function saveToStorage(key: string, model: unknown): void {
  if (typeof window !== 'undefined' && localStorage?.setItem) {
    localStorage.setItem(`_${key}`, JSON.stringify(model))
  }
}
export function getFromStorage<D extends unknown | undefined>(
  key: string,
  defaultValue?: D,
): D | (undefined extends D ? undefined : never) {
  if (typeof window !== 'undefined' && localStorage?.getItem) {
    const value = localStorage.getItem(key === 'UhaulNative' ? key : `_${key}`)

    if (value === null) return defaultValue as undefined extends D ? undefined : never

    return JSON.parse(value) as D
  }

  return defaultValue as undefined extends D ? undefined : never
}
export function removeFromStorage(key: string): void {
  if (typeof window !== 'undefined' && localStorage?.removeItem) {
    localStorage.removeItem(`_${key}`)
  }
}

export function saveToSession(key: string, model: unknown): void {
  if (typeof window !== 'undefined' && sessionStorage?.setItem) {
    sessionStorage.setItem(`_${key}`, JSON.stringify(model))
  }
}
export function getFromSession<D = unknown>(key: string, defaultValue: D): D {
  if (typeof window !== 'undefined' && sessionStorage?.getItem) {
    const value = sessionStorage.getItem(`_${key}`)

    if (value === null) return defaultValue

    return JSON.parse(value) as D
  }

  return defaultValue
}
export function removeFromSession(key: string): void {
  if (typeof window !== 'undefined' && sessionStorage?.removeItem) {
    sessionStorage.removeItem(`_${key}`)
  }
}
