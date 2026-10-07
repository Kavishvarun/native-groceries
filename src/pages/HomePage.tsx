import { useEffect, useState } from 'react'
import { ArrowRight, MapPin, Sprout, Truck, Wheat } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ProductCard } from '../components'
import { type Product } from '../productData'
import './HomePage.css'

const departments = [
  { name: 'Rice & grains', category: 'Rice & Grains', image: 'photo-1586201375761-83865001e31c' },
  { name: 'Wheat & flours', category: 'Wheat & Flours', image: 'photo-1574323347407-f5e1ad6d020b' },
  { name: 'Leafy greens', category: 'Leafy Greens', image: 'photo-1518843875459-f738682238a6' },
  { name: 'Fruits & vegetables', category: 'Vegetables', image: 'photo-1557844352-761f2565b576' },
]

export default function HomePage({ onAdd }: { onAdd: (product: Product) => void }) {
  const [featured, setFeatured] = useState<Product[]>([])
  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/products?page=1&limit=12', { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Unable to load products')))
      .then((data: { items: Product[] }) => setFeatured(data.items))
      .catch(() => undefined)
    return () => controller.abort()
  }, [])

  return (
    <>
      <section className="home-hero">
        <img className="hero-image" src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=2400&q=90" alt="Fresh greens, fruit, and vegetables displayed at a market" />
        <div className="hero-shade" />
        <div className="hero-content"><span className="hero-eyebrow"><span /> EVERYDAY GROCERIES, GROWN CLOSE</span><h1>Native<br />Groceries<span>.</span></h1><p>Fresh greens, seasonal fruits, wheat, and rice from growers and markets across Tamil Nadu.</p><Link className="hero-button" to="/products">Shop fresh groceries <ArrowRight size={17} /></Link></div>
        <aside className="hero-pick-card"><img src="https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=240&q=85" alt="Fresh bananas" /><div><span>THIS WEEK'S PICK</span><strong>Fresh bananas</strong><small>Pollachi harvest</small></div><Link to="/products?category=Fruits" aria-label="Shop fresh fruit"><ArrowRight size={17} /></Link></aside>
      </section>

      <section className="promise-strip" aria-label="Our values"><div><Sprout size={19} /><span>Good things, grown close</span></div><div><Wheat size={19} /><span>Rice, wheat &amp; millets</span></div><div><Truck size={19} /><span>Fresh from local markets</span></div><div className="delivery-range-tag"><MapPin size={15} /><span>Delivery within 5 km</span></div></section>

      <section className="content-section departments-section"><div className="section-heading"><div><span className="section-kicker">FROM OUR TAMIL NADU MARKETS</span><h2>Fresh, useful, local.</h2></div><Link className="text-link" to="/products">Browse all groceries <ArrowRight size={15} /></Link></div>
        <div className="department-grid">{departments.map((department, index) => <Link className="department-tile" to={`/products?category=${encodeURIComponent(department.category)}`} key={department.category}><img src={`https://images.unsplash.com/${department.image}?auto=format&fit=crop&w=750&q=82`} alt="" loading="lazy" /><span className="department-number">0{index + 1}</span><span className="department-name">{department.name}</span><ArrowRight size={17} /></Link>)}</div>
      </section>

      <section className="featured-section"><div className="content-section"><div className="section-heading"><div><span className="section-kicker">PICKED THIS MORNING</span><h2>Fresh from the market.</h2></div><Link className="text-link" to="/products">See all groceries <ArrowRight size={15} /></Link></div>
        <div className="home-product-marquee" aria-label="Fresh groceries continuously browsing across the shelf">
          <div className="home-product-track">
            <div className="home-product-group">{featured.map((product) => <ProductCard key={`primary-${product.id}`} product={product} onAdd={onAdd} />)}</div>
            <div className="home-product-group" aria-hidden="true" inert>{featured.map((product) => <ProductCard key={`repeat-${product.id}`} product={product} onAdd={onAdd} />)}</div>
          </div>
        </div>
      </div></section>
      <section className="local-note content-section"><span className="local-note-mark"><Sprout size={24} /></span><div><span className="section-kicker">ROOTED IN TAMIL NADU</span><h2>Know your farmer.<br />Love your groceries.</h2></div><p>From Cauvery Delta rice to seasonal greens, fruits, and vegetables, we bring everyday essentials from Tamil Nadu growers closer to your table.</p><Link to="/about" aria-label="Read our story" className="round-link"><ArrowRight size={18} /></Link></section>
    </>
  )
}
