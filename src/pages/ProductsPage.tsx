import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Check, ChevronLeft, ChevronRight, MessageCircle, Plus, Search, SlidersHorizontal, Trash2, X } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import type { CartEntry } from '../cart'
import { Pagination, ProductCard } from '../components'
import { categories, money, type Product, type ProductPage } from '../productData'

const emptyPage: ProductPage = { items: [], page: 1, limit: 8, total: 0, totalPages: 1 }

type CustomOrderItem = {
  name: string
  quantity: number
  unit: string
  details: string
}

export default function ProductsPage({ items, onAdd }: { items: CartEntry[]; onAdd: (product: Product, quantity: number) => void }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedCategory = searchParams.get('category') ?? 'All groceries'
  const category = categories.includes(requestedCategory) ? requestedCategory : 'All groceries'
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('name-asc')
  const [availability, setAvailability] = useState('all')
  const [result, setResult] = useState<ProductPage>(emptyPage)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectionNotice, setSelectionNotice] = useState<{ name: string; quantity: number; unit: string; stockLimitReached: boolean } | null>(null)
  const [customItems, setCustomItems] = useState<CustomOrderItem[]>([])
  const [showCustomForm, setShowCustomForm] = useState(false)
  const categoryListRef = useRef<HTMLDivElement>(null)
  const [categoryScroll, setCategoryScroll] = useState({ left: false, right: false })

  function updateCategoryScroll() {
    const list = categoryListRef.current
    if (!list) return
    setCategoryScroll({
      left: list.scrollLeft > 0,
      right: list.scrollLeft + list.clientWidth < list.scrollWidth - 1,
    })
  }

  useEffect(() => {
    const controller = new AbortController()
    const params = new URLSearchParams({ page: String(page), limit: '8', search })
    if (category !== 'All groceries') params.set('category', category)
    params.set('sort', sort)
    if (availability === 'in-stock') params.set('availability', availability)
    fetch(`/api/products?${params}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('We could not load the market right now.')
        return response.json() as Promise<ProductPage>
      })
      .then(setResult)
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) setError(requestError instanceof Error ? requestError.message : 'Unable to load products.')
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [page, search, category, sort, availability])

  useEffect(() => {
    updateCategoryScroll()
    window.addEventListener('resize', updateCategoryScroll)
    return () => window.removeEventListener('resize', updateCategoryScroll)
  }, [])

  useEffect(() => {
    if (!selectionNotice) return
    const timeout = window.setTimeout(() => setSelectionNotice(null), 4500)
    return () => window.clearTimeout(timeout)
  }, [selectionNotice])

  function chooseCategory(nextCategory: string) {
    setLoading(true)
    setError('')
    setPage(1)
    setSearchParams(nextCategory === 'All groceries' ? {} : { category: nextCategory })
  }

  function scrollCategories(direction: -1 | 1) {
    categoryListRef.current?.scrollBy({ left: direction * 220, behavior: 'smooth' })
  }

  function updateSort(value: string) {
    setLoading(true)
    setError('')
    setPage(1)
    setSort(value)
  }

  function updateAvailability(value: string) {
    setLoading(true)
    setError('')
    setPage(1)
    setAvailability(value)
  }

  const itemCount = items.reduce((count, entry) => count + entry.quantity, 0)
  const subtotal = items.reduce((total, entry) => total + entry.product.price * entry.quantity, 0)
  const customItemCount = customItems.reduce((count, item) => count + item.quantity, 0)

  function selectProduct(product: Product, quantity: number) {
    const selectedQuantity = items.find((entry) => entry.product.id === product.id)?.quantity ?? 0
    const addedQuantity = Math.min(quantity, Math.max(0, product.stock - selectedQuantity))
    if (addedQuantity === 0) {
      setSelectionNotice({ name: product.name, quantity: selectedQuantity, unit: product.unit, stockLimitReached: true })
      return
    }
    onAdd(product, addedQuantity)
    setSelectionNotice({ name: product.name, quantity: addedQuantity, unit: product.unit, stockLimitReached: false })
  }

  function addCustomItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const name = String(form.get('itemName') ?? '').trim()
    const quantity = Number(form.get('quantity'))
    const unit = String(form.get('unit') ?? 'each')
    const details = String(form.get('details') ?? '').trim()
    if (!name || !Number.isInteger(quantity) || quantity < 1) return
    setCustomItems((current) => [...current, { name, quantity, unit, details }])
    setSelectionNotice({ name, quantity, unit, stockLimitReached: false })
    event.currentTarget.reset()
    setShowCustomForm(false)
  }

  function orderOnWhatsApp() {
    if (items.length === 0 && customItems.length === 0) return
    const message = [
      'Hello Native Groceries! I would like to order these items:',
      ...items.map(({ product, quantity }) =>
        `- ${product.name} x ${quantity} ${product.unit} — ${money(product.price)} each = ${money(product.price * quantity)}`,
      ),
      ...(customItems.length ? ['', 'Custom product requests (please confirm availability and price):', ...customItems.map(({ name, quantity, unit, details }) => `- ${name} x ${quantity} ${unit}${details ? ` — ${details}` : ''}`)] : []),
      '',
      `Subtotal for listed products: ${money(subtotal)}`,
      ...(customItems.length ? ['Custom items are not included in the subtotal; please confirm their prices.'] : []),
    ].join('\n')
    const url = `https://wa.me/919655082236?text=${encodeURIComponent(message)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="inner-page products-page">
      {selectionNotice && <aside className="product-selection-toast" role="status" aria-live="polite">
        <span className="product-selection-check"><Check size={17} /></span>
        <div><strong>{selectionNotice.stockLimitReached ? 'Stock limit reached' : 'Product selected'}</strong><span>{selectionNotice.name} · Quantity: {selectionNotice.quantity} {selectionNotice.unit}</span></div>
        <button type="button" aria-label="Dismiss notification" onClick={() => setSelectionNotice(null)}><X size={17} /></button>
      </aside>}
      <section className="products-intro"><div><span className="section-kicker">FROM TAMIL NADU TO YOUR TABLE</span><h1>Everyday<br /><em>groceries.</em></h1><p>Shop rice, wheat, chocolate, fresh dairy, leafy greens, fruits, vegetables, and everyday essentials.</p></div><div className="products-intro-stamp"><span>ROOTED</span><strong>close<br />to home</strong><span>MADE WITH CARE</span></div></section>
      <section className="catalog-section" aria-label="Product catalog">
        <div className="custom-product-request">
          <div><strong>Looking for something else?</strong><span>Request an item that isn't listed in our catalog.</span></div>
          <button className="custom-request-toggle" type="button" aria-expanded={showCustomForm} onClick={() => setShowCustomForm((open) => !open)}><Plus size={15} /> Request a product</button>
        </div>
        {showCustomForm && <form className="custom-request-form" onSubmit={addCustomItem}>
          <label>Product name<input name="itemName" required maxLength={80} placeholder="What would you like to order?" /></label>
          <label>Quantity<input name="quantity" type="number" min="1" max="99" defaultValue="1" required /></label>
          <label>Unit<select name="unit" defaultValue="each"><option value="each">Each</option><option value="pack">Pack</option><option value="kg">Kg</option><option value="g">Grams</option><option value="L">Litres</option><option value="ml">Millilitres</option></select></label>
          <label className="custom-request-details">Details (optional)<input name="details" maxLength={120} placeholder="Brand, size, or preference" /></label>
          <button className="solid-button" type="submit">Add request</button>
        </form>}
        <div className="catalog-toolbar">
          <div className="category-scroll-control">
            <button className="category-scroll-button" type="button" aria-label="Scroll categories left" disabled={!categoryScroll.left} onClick={() => scrollCategories(-1)}><ChevronLeft size={16} /></button>
            <div className="category-tabs" aria-label="Filter by category" ref={categoryListRef} onScroll={updateCategoryScroll}>{categories.map((item) => <button key={item} type="button" aria-pressed={category === item} className={`category-tab ${category === item ? 'active' : ''}`} onClick={() => chooseCategory(item)}>{item}</button>)}</div>
            <button className="category-scroll-button" type="button" aria-label="Scroll categories right" disabled={!categoryScroll.right} onClick={() => scrollCategories(1)}><ChevronRight size={16} /></button>
          </div>
          <div className="catalog-tools">
            <label className="catalog-select"><SlidersHorizontal size={14} /><span>Filter</span><select aria-label="Filter products by availability" value={availability} onChange={(event) => updateAvailability(event.target.value)}><option value="all">All products</option><option value="in-stock">In stock</option></select></label>
            <label className="catalog-select"><span>Sort</span><select aria-label="Sort products" value={sort} onChange={(event) => updateSort(event.target.value)}><option value="name-asc">Name: A to Z</option><option value="name-desc">Name: Z to A</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option></select></label>
            <label className="catalog-search"><Search size={17} /><input aria-label="Search products" placeholder="Find something good..." value={search} onChange={(event) => { setLoading(true); setError(''); setSearch(event.target.value); setPage(1) }} /></label>
          </div>
        </div>
        <div className="catalog-result-line"><span>{loading ? 'Gathering the good stuff...' : `${result.total} ${result.total === 1 ? 'good thing' : 'good things'} to browse`}</span>{(category !== 'All groceries' || availability !== 'all') && <button type="button" onClick={() => { if (category !== 'All groceries') chooseCategory('All groceries'); updateAvailability('all') }}>Clear filters <span aria-hidden="true">×</span></button>}</div>
        {error ? <div className="catalog-state error-message">{error}</div> : loading ? <div className="catalog-state">Finding today's good things...</div> : result.items.length === 0 ? <div className="catalog-state">Nothing on this shelf matches yet. Try another search.</div> : <div className="product-grid catalog-grid">{result.items.map((product: Product) => <ProductCard key={product.id} product={product} onOrder={selectProduct} />)}</div>}
        {(items.length > 0 || customItems.length > 0) && <aside className="catalog-order-summary" aria-live="polite"><div><strong>{itemCount + customItemCount} {(itemCount + customItemCount) === 1 ? 'item' : 'items'} selected</strong><span>Listed products: {money(subtotal)}{customItems.length ? ' · custom item prices confirmed on WhatsApp' : ''}</span></div>{items.length > 0 && <Link to="/cart">Review listed products</Link>}<button className="solid-button" type="button" onClick={orderOnWhatsApp}><MessageCircle size={16} /> Send all items on WhatsApp</button>
          {customItems.length > 0 && <ul className="custom-order-items">{customItems.map((item, index) => <li key={`${item.name}-${index}`}><span>{item.name} × {item.quantity} {item.unit}{item.details ? ` — ${item.details}` : ''}</span><button type="button" aria-label={`Remove ${item.name} custom request`} onClick={() => setCustomItems((current) => current.filter((_, itemIndex) => itemIndex !== index))}><Trash2 size={14} /></button></li>)}</ul>}
        </aside>}
        {!loading && !error && result.total > 0 && <Pagination page={result.page} totalPages={result.totalPages} total={result.total} limit={result.limit} onPageChange={(nextPage) => { setLoading(true); setPage(nextPage) }} />}
      </section>
    </div>
  )
}
