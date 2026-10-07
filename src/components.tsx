import { useState } from 'react'
import { ArrowRight, ChevronLeft, ChevronRight, Leaf, Menu, Minus, Plus, ShoppingBasket, X } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { currentYear, money, productImage, type Product } from './productData'

const navLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About' },
  { to: '/products', label: 'Products' },
  { to: '/contact', label: 'Contact' },
]

export function SiteHeader({ cartCount }: { cartCount: number }) {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" to="/" aria-label="Native Groceries home" onClick={() => setMenuOpen(false)}>
          <span className="brand-mark"><Leaf size={19} strokeWidth={2.2} /></span>
          <span className="brand-name">Native Groceries<span>.</span></span>
        </Link>
        <button className="mobile-menu-button" type="button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <nav className={`main-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Main navigation">
          {navLinks.map(({ to, label, end }) => <NavLink key={to} to={to} end={end} onClick={() => setMenuOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>{label}</NavLink>)}
          <Link className="nav-cta" to="/products" onClick={() => setMenuOpen(false)}>Shop now <ArrowRight size={15} /></Link>
        </nav>
        <Link className="bag-link" to="/cart" aria-label={`Shopping bag, ${cartCount} items`}><ShoppingBasket size={18} /><span>{cartCount}</span></Link>
      </div>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand-block">
          <Link className="brand footer-brand" to="/"><span className="brand-mark"><Leaf size={18} /></span><span className="brand-name">Native Groceries<span>.</span></span></Link>
          <p>Good food, grown close.<br />A little more local, every day.</p>
        </div>
        <div className="footer-column"><h2>Find your way</h2><Link to="/about">Our story</Link><Link to="/products">Shop products</Link></div>
        <div className="footer-column footer-contact"><h2>Say hello</h2><a href="mailto:hello@nativegroceries.in">hello@nativegroceries.in</a><a href="tel:+919655082236">+91 96550 82236</a><a href="https://wa.me/919655082236" target="_blank" rel="noreferrer">WhatsApp: +91 96550 82236</a><Link to="/contact">Visit our contact page <ArrowRight size={13} /></Link></div>
        <div className="footer-hours"><span className="footer-kicker">COME ON BY</span><strong>Mon-Sat, 8am-8pm</strong><span>Sunday, 9am-2pm</span><span>Thiruvannamalai, Tamil Nadu, India</span></div>
      </div>
      <div className="footer-bottom"><span>© {currentYear} Native Groceries</span><span>Locally rooted. Thoughtfully stocked.</span><Link to="/contact">Contact us</Link></div>
    </footer>
  )
}

type ProductCardProps =
  | { product: Product; onAdd: (product: Product) => void; onOrder?: never }
  | { product: Product; onOrder: (product: Product, quantity: number) => void; onAdd?: never }

export function ProductCard(props: ProductCardProps) {
  const { product } = props
  const [quantity, setQuantity] = useState(1)
  return (
    <article className="product-card">
      <div className="product-image-wrap"><img src={productImage(product)} alt={product.name} loading="lazy" /><span className="product-category">{product.category}</span></div>
      <div className="product-card-info"><div className="product-card-heading"><h3>{product.name}</h3><strong>{money(product.price)}</strong></div><span className="product-meta">/{product.unit} <span>·</span> from {product.supplier}</span>
        {props.onOrder ? <div className="product-order-actions">
          <div className="product-order-quantity" aria-label={`Quantity of ${product.name}`}>
            <button type="button" aria-label={`Remove one ${product.name}`} disabled={quantity <= 1 || product.stock < 1} onClick={() => setQuantity((current) => Math.max(1, current - 1))}><Minus size={13} /></button>
            <span aria-live="polite">{quantity}</span>
            <button type="button" aria-label={`Add one ${product.name}`} disabled={quantity >= product.stock} onClick={() => setQuantity((current) => Math.min(product.stock, current + 1))}><Plus size={13} /></button>
          </div>
          <button className="add-to-bag" type="button" disabled={product.stock < 1} onClick={() => props.onOrder(product, quantity)}><ShoppingBasket size={15} /> {product.stock < 1 ? 'Out of stock' : 'Add to order'}</button>
        </div> : <button className="add-to-bag" type="button" disabled={product.stock < 1} onClick={() => props.onAdd(product)}><ShoppingBasket size={15} /> {product.stock < 1 ? 'Out of stock' : 'Add to bag'}</button>}
      </div>
    </article>
  )
}

export function Pagination({ page, totalPages, total, limit, onPageChange }: { page: number; totalPages: number; total: number; limit: number; onPageChange: (page: number) => void }) {
  const first = total ? (page - 1) * limit + 1 : 0
  return (
    <div className="pagination"><span>Showing <strong>{first}-{Math.min(page * limit, total)}</strong> of <strong>{total}</strong> products</span>
      <div className="page-controls"><button className="page-arrow" type="button" aria-label="Previous page" disabled={page <= 1} onClick={() => onPageChange(page - 1)}><ChevronLeft size={17} /></button>
        {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => <button key={number} className={`page-number ${page === number ? 'active' : ''}`} type="button" aria-current={page === number ? 'page' : undefined} onClick={() => onPageChange(number)}>{number}</button>)}
        <button className="page-arrow" type="button" aria-label="Next page" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}><ChevronRight size={17} /></button>
      </div>
    </div>
  )
}
