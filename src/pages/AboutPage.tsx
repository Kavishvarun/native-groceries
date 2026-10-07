import { useRef } from 'react'
import { ArrowLeft, ArrowRight, Heart, Leaf, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import localFestivalOne from '../image/Image 1.jpeg'
import localFestivalTwo from '../image/image 2.jpeg'
import localFestivalThree from '../image/image 3.jpeg'

export default function AboutPage() {
  const galleryRef = useRef<HTMLDivElement>(null)

  function scrollGallery(direction: -1 | 1) {
    galleryRef.current?.scrollBy({ left: direction * 360, behavior: 'smooth' })
  }

  return (
    <div className="inner-page about-page">
      <section className="page-intro"><span className="section-kicker">A LITTLE ABOUT US</span><h1>Good food.<br /><em>Good neighbors.</em></h1><p>We bring Tamil Nadu's everyday groceries and regional favorites a little closer to home.</p></section>
      <section className="about-gallery-section" aria-label="Scenes from our Tamil Nadu community">
        <div className="about-gallery-heading"><div><span className="section-kicker">ROOTED IN OUR HOME</span><h2>Little moments from around here.</h2></div><div className="about-gallery-controls"><button type="button" aria-label="Scroll gallery left" onClick={() => scrollGallery(-1)}><ArrowLeft size={16} /></button><button type="button" aria-label="Scroll gallery right" onClick={() => scrollGallery(1)}><ArrowRight size={16} /></button></div></div>
        <div className="about-gallery" ref={galleryRef} tabIndex={0} aria-label="Scrollable photos of local Tamil Nadu festivals">
          <figure><img src={localFestivalOne} alt="A colorful local temple festival with the community gathered" loading="lazy" /><figcaption>Celebrations that bring neighbors together</figcaption></figure>
          <figure><img src={localFestivalTwo} alt="Temple festival chariot beneath a decorated canopy" loading="lazy" /><figcaption>Traditions woven into everyday life</figcaption></figure>
          <figure><img src={localFestivalThree} alt="A vibrant Tamil Nadu procession and flower-decorated chariots" loading="lazy" /><figcaption>A little of home, wherever you are</figcaption></figure>
        </div>
        <p className="about-gallery-hint">Swipe or scroll to explore <span aria-hidden="true">→</span></p>
      </section>
        <section className="about-story"><div className="about-photo"><img src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1400&q=88" alt="Seasonal produce from local farms" /><span>Picked with care, brought to your neighborhood.</span></div><div className="about-copy"><span className="section-kicker">OUR LITTLE CORNER OF THE WORLD</span><h2>Native to Tamil Nadu.</h2><p>Native Groceries began with a simple thought: the everyday essentials we grew up with should be easy to find, wherever home is.</p><p>We bring together Ponni rice from the Cauvery Delta, wheat and millets from Salem, pulses, Tamil greens, and seasonal fruit and vegetables from growers across the region.</p><Link className="text-link" to="/products">Meet what's on our shelves <ArrowRight size={15} /></Link></div></section>
      <section className="values-section"><div className="section-heading"><div><span className="section-kicker">THE WAY WE LIKE IT</span><h2>Small choices, good roots.</h2></div></div><div className="values-grid"><article><span><Leaf size={21} /></span><h3>Close to the source</h3><p>We make room for nearby growers and makers, and let the seasons lead the way.</p></article><article><span><Heart size={21} /></span><h3>Made with care</h3><p>Good food starts with people who take pride in how it is grown, raised, or made.</p></article><article><span><MapPin size={21} /></span><h3>Here for each other</h3><p>We are your neighborhood market, and we want this place to feel like yours.</p></article></div></section>
      <section className="about-cta"><span className="section-kicker">COME ON IN</span><h2>There's always room<br />at the table.</h2><Link className="hero-button light-button" to="/contact">Say hello <ArrowRight size={16} /></Link></section>
    </div>
  )
}
