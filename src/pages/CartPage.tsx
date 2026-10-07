import { useState, type FormEvent } from 'react'
import { ArrowLeft, ArrowRight, Check, Heart, MessageCircle, Minus, Plus, ShieldCheck, ShoppingBasket, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { CartEntry } from '../cart'
import { money, productImage } from '../productData'
import './CartPage.css'

type PlacedOrder = { orderNumber: string; total: number; whatsappUrl: string }
type BrandPreferenceCategory = {
  label: string
  options: string[]
}

const brandPreferenceCategories: BrandPreferenceCategory[] = [
  { label: 'Chocolate', options: ['Cadbury', 'Nestle', 'KitKat'] },
  { label: 'Juices & drinks', options: ['Coca-Cola', 'Pepsi', 'Maa', 'Maaza', 'Slice'] },
  { label: 'Biscuits', options: ['Parle', 'Britannia', 'Sunfeast'] },
  { label: 'Cookies', options: ['Britannia', 'Sunfeast', 'Oreo', 'Hide & Seek'] },
  { label: 'Dairy products', options: ['Aavin', 'Amul', 'Milky Mist', 'Heritage'] },
]

type CartPageProps = {
  items: CartEntry[]
  onQuantityChange: (productId: string, quantity: number) => void
  onOrderPlaced: () => void
}

export default function CartPage({ items, onQuantityChange, onOrderPlaced }: CartPageProps) {
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [placedOrder, setPlacedOrder] = useState<PlacedOrder | null>(null)
  const [showBrandPreferences, setShowBrandPreferences] = useState(false)
  const [brandPreferences, setBrandPreferences] = useState<Record<string, string[]>>({})
  const [customBrands, setCustomBrands] = useState<Record<string, string>>({})
  const subtotal = items.reduce((total, entry) => total + entry.product.price * entry.quantity, 0)
  const deliveryFee = subtotal === 0 || subtotal >= 50 ? 0 : 40
  const total = subtotal + deliveryFee

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSending(true)
    setError('')
    const form = new FormData(event.currentTarget)
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: form.get('customerName'),
          phone: form.get('phone'),
          address: form.get('address'),
          instructions: form.get('instructions'),
          items: items.map(({ product, quantity }) => ({ productId: product.id, quantity })),
        }),
      })
      const result = await response.json() as PlacedOrder & { error?: string }
      if (!response.ok) throw new Error(result.error ?? 'We could not place your order. Please try again.')
      const itemLines = items.map(({ product, quantity }) =>
        `- ${product.name} x ${quantity} ${product.unit} — ${money(product.price)} each = ${money(product.price * quantity)}`,
      )
      const deliveryNote = form.get('instructions')
      const brandPreferenceLines = brandPreferenceCategories.flatMap(({ label }) => {
        const selectedBrands = brandPreferences[label] ?? []
        const typedBrands = (customBrands[label] ?? '').split(',').map((brand) => brand.trim()).filter(Boolean)
        const selected = [...new Set([...selectedBrands, ...typedBrands])]
        return selected.length ? [`${label}: ${selected.join(', ')}`] : []
      })
      const orderMessage = [
        'Hello Native Groceries! I just placed an order.',
        `Order: ${result.orderNumber}`,
        '',
        `Name: ${form.get('customerName')}`,
        `Phone: ${form.get('phone')}`,
        `Delivery address: ${form.get('address')}`,
        ...(typeof deliveryNote === 'string' && deliveryNote.trim() ? [`Delivery note: ${deliveryNote.trim()}`] : []),
        '',
        'Items:',
        ...itemLines,
        ...(brandPreferenceLines.length ? ['', 'Preferred brands:', ...brandPreferenceLines] : []),
        '',
        `Subtotal: ${money(subtotal)}`,
        `Delivery: ${deliveryFee ? money(deliveryFee) : 'Free'}`,
        `Total: ${money(result.total)} (cash on delivery)`,
      ].join('\n')
      setPlacedOrder({
        orderNumber: result.orderNumber,
        total: result.total,
        whatsappUrl: `https://wa.me/919655082236?text=${encodeURIComponent(orderMessage)}`,
      })
      onOrderPlaced()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'We could not place your order. Please try again.')
    } finally {
      setSending(false)
    }
  }

  if (placedOrder) {
    return <section className="cart-page"><div className="order-confirmation"><span className="order-check"><Check size={24} /></span><span className="section-kicker">ORDER RECEIVED</span><h1>Thank you.<br /><em>It's on its way.</em></h1><p>Your order <strong>{placedOrder.orderNumber}</strong> has been placed. Pay <strong>{money(placedOrder.total)}</strong> by cash on delivery.</p><a className="solid-button continue-button" href={placedOrder.whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle size={16} /> Send order to WhatsApp</a><Link className="text-link" to="/products">Keep browsing <ArrowRight size={16} /></Link></div></section>
  }

  return (
    <div className="cart-page">
      <section className="cart-heading"><div><span className="section-kicker">YOUR NATIVE GROCERIES BAG</span><h1>Your basket</h1><p>{items.length ? `${items.reduce((count, item) => count + item.quantity, 0)} items, picked with care.` : 'A few good things are waiting to come home.'}</p></div><Link className="text-link" to="/products"><ArrowLeft size={15} /> Continue shopping</Link></section>
      {items.length === 0 ? <section className="empty-cart"><span><ShoppingBasket size={24} /></span><h2>Your basket is taking a breather.</h2><p>Browse wheat, rice, greens, and seasonal fruits and vegetables.</p><Link className="solid-button" to="/products">Explore groceries <ArrowRight size={15} /></Link></section> :
        <div className="cart-layout"><section className="cart-items" aria-label="Items in your basket"><div className="cart-list-heading"><h2>Basket items</h2><span>{items.length} products</span></div>
          {items.map(({ product, quantity }) => <article className="cart-item" key={product.id}><img src={productImage(product)} alt={product.name} /><div className="cart-item-main"><span className="cart-item-category">{product.category}</span><h3>{product.name}</h3><p>{product.unit} · {product.supplier}</p><div className="quantity-stepper"><button type="button" aria-label={`Remove one ${product.name}`} onClick={() => onQuantityChange(product.id, quantity - 1)}><Minus size={14} /></button><span aria-label={`${quantity} in basket`}>{quantity}</span><button type="button" aria-label={`Add one ${product.name}`} disabled={quantity >= product.stock} onClick={() => onQuantityChange(product.id, quantity + 1)}><Plus size={14} /></button></div></div><div className="cart-item-end"><strong>{money(product.price * quantity)}</strong><span>{money(product.price)} each</span><button className="remove-item" type="button" aria-label={`Remove ${product.name}`} onClick={() => onQuantityChange(product.id, 0)}><Trash2 size={15} /> Remove</button></div></article>)}
          <Link className="cart-back-link" to="/products"><ArrowLeft size={14} /> Add more groceries</Link>
        </section>
        <aside className="checkout-panel"><div className="checkout-title"><span className="section-kicker">READY WHEN YOU ARE</span><h2>Delivery & total</h2></div><form onSubmit={submit}>
          <label className="checkout-field">Name<input name="customerName" required autoComplete="name" placeholder="Your full name" /></label>
          <label className="checkout-field">Mobile number<input name="phone" type="tel" inputMode="numeric" pattern="[6-9][0-9]{9}" title="Enter a 10-digit Indian mobile number" required placeholder="10-digit mobile number" /></label>
          <label className="checkout-field">Delivery address<textarea name="address" required minLength={12} rows={3} autoComplete="street-address" placeholder="House, street, area, city, PIN code" /></label>
          <label className="checkout-field">Delivery note <span className="optional-label">OPTIONAL</span><input name="instructions" placeholder="Landmark or delivery preference" /></label>
          <section className="brand-preferences">
            <button className="brand-preferences-toggle" type="button" aria-expanded={showBrandPreferences} onClick={() => setShowBrandPreferences((open) => !open)}><Heart size={15} /> Choose favorite brands <span>{showBrandPreferences ? '−' : '+'}</span></button>
            {showBrandPreferences && <div className="brand-preferences-panel"><p>Select the brands you prefer. We will include them with your order on WhatsApp.</p>
              {brandPreferenceCategories.map(({ label, options }) => <fieldset className="brand-preference-group" key={label}>
                <legend>{label}</legend>
                <div className="brand-preference-options">{options.map((brand) => <label key={brand}><input type="checkbox" checked={(brandPreferences[label] ?? []).includes(brand)} onChange={(event) => setBrandPreferences((current) => {
                  const selected = current[label] ?? []
                  return { ...current, [label]: event.target.checked ? [...selected, brand] : selected.filter((item) => item !== brand) }
                })} />{brand}</label>)}</div>
                <input className="custom-brand-input" aria-label={`Other preferred ${label.toLowerCase()} brands`} value={customBrands[label] ?? ''} onChange={(event) => setCustomBrands((current) => ({ ...current, [label]: event.target.value }))} placeholder="Other brands (comma separated)" />
              </fieldset>)}
            </div>}
          </section>
          <div className="payment-choice"><span className="payment-icon"><ShieldCheck size={16} /></span><span><strong>Cash on delivery</strong><small>Pay when your groceries arrive</small></span><span className="payment-selected"><Check size={13} /></span></div>
          <div className="order-totals"><div><span>Subtotal</span><strong>{money(subtotal)}</strong></div><div><span>Delivery</span><strong>{deliveryFee ? money(deliveryFee) : 'Free'}</strong></div><div className="grand-total"><span>Total</span><strong>{money(total)}</strong></div></div>
          {subtotal > 0 && subtotal < 50 && <p className="delivery-hint">Add {money(50 - subtotal)} more for free delivery.</p>}
          {error && <p className="checkout-error" role="alert">{error}</p>}
          <button className="solid-button place-order-button" type="submit" disabled={sending}>{sending ? 'Placing order...' : `Place order · ${money(total)}`} <ArrowRight size={15} /></button>
          <p className="secure-note"><ShieldCheck size={13} /> Your order is confirmed before payment.</p>
        </form></aside></div>}
    </div>
  )
}
