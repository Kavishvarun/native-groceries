import type { Product } from './productData'

export type CartEntry = {
  product: Product
  quantity: number
}

const storageKey = 'native-groceries-cart'

function isCartEntry(value: unknown): value is CartEntry {
  if (!value || typeof value !== 'object') return false
  const entry = value as Partial<CartEntry>
  return Boolean(
    entry.product &&
    typeof entry.product.id === 'string' &&
    typeof entry.product.name === 'string' &&
    typeof entry.product.price === 'number' &&
    typeof entry.product.stock === 'number' &&
    Number.isInteger(entry.quantity) &&
    entry.quantity! > 0,
  )
}

export function readCart(): CartEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(storageKey) ?? '[]')
    return Array.isArray(value) ? value.filter(isCartEntry) : []
  } catch {
    return []
  }
}

export function writeCart(cart: CartEntry[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(cart))
  } catch {
    // Keep the in-memory cart usable when storage is unavailable.
  }
}
