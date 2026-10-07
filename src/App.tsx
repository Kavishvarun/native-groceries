import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { SiteFooter, SiteHeader } from './components'
import { readCart, writeCart, type CartEntry } from './cart'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import CartPage from './pages/CartPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ProductsPage from './pages/ProductsPage'
import { type Product } from './productData'
import './App.css'
import './productCardLayout.css'

function App() {
  const [cart, setCart] = useState<CartEntry[]>(readCart)
  const cartCount = cart.reduce((total, entry) => total + entry.quantity, 0)

  useEffect(() => writeCart(cart), [cart])

  useEffect(() => {
    if (cart.length === 0) return
    const controller = new AbortController()
    fetch('/api/products?limit=50', { signal: controller.signal })
      .then((response) => response.ok ? response.json() as Promise<{ items: Product[] }> : Promise.reject(new Error('Unable to refresh cart products')))
      .then(({ items }) => {
        const productsById = new Map(items.map((product) => [product.id, product]))
        const productsBySku = new Map(items.map((product) => [product.sku, product]))
        setCart((current) => current.flatMap((entry) => {
          const product = productsById.get(entry.product.id) ?? productsBySku.get(entry.product.sku)
          return product ? [{ product, quantity: Math.min(entry.quantity, product.stock) }] : []
        }))
      })
      .catch(() => undefined)
    return () => controller.abort()
  }, [cart.length])

  function addQuantityToBag(product: Product, quantity: number) {
    if (quantity <= 0 || product.stock <= 0) return
    setCart((current) => {
      const existing = current.find((entry) => entry.product.id === product.id)
      if (!existing) return [...current, { product, quantity: Math.min(quantity, product.stock) }]
      if (existing.quantity >= product.stock) return current
      return current.map((entry) => entry.product.id === product.id ? { product, quantity: Math.min(entry.quantity + quantity, product.stock) } : entry)
    })
  }

  function addToBag(product: Product) {
    addQuantityToBag(product, 1)
  }

  function updateQuantity(productId: string, quantity: number) {
    setCart((current) => current.flatMap((entry) => {
      if (entry.product.id !== productId) return [entry]
      if (quantity <= 0) return []
      return [{ ...entry, quantity: Math.min(quantity, entry.product.stock) }]
    }))
  }

  return (
    <div className="site-shell">
      <SiteHeader cartCount={cartCount} />
      <main className="site-main">
        <Routes>
          <Route path="/" element={<HomePage onAdd={addToBag} />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/products" element={<ProductsPage items={cart} onAdd={addQuantityToBag} />} />
          <Route path="/cart" element={<CartPage items={cart} onQuantityChange={updateQuantity} onOrderPlaced={() => setCart([])} />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <SiteFooter />
    </div>
  )
}

export default App
