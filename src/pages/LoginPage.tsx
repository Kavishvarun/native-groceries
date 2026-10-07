import { useState, type FormEvent } from 'react'
import { ArrowRight, Leaf, LockKeyhole } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function LoginPage() {
  const [message, setMessage] = useState('')
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('Store partner sign-in is not connected yet. Please contact us for account access.')
  }

  return (
    <div className="inner-page login-page"><section className="login-layout"><div className="login-aside"><span className="login-leaf"><Leaf size={23} /></span><span className="section-kicker">A NOTE FOR OUR NEIGHBORS</span><h1>Pull up<br />a <em>chair.</em></h1><p>Store partners can sign in here to find their Native Groceries account.</p><div className="login-aside-note"><span>NEED A HAND?</span><Link to="/contact">Talk to our team <ArrowRight size={14} /></Link></div></div>
  <div className="login-form-wrap"><div className="login-icon"><LockKeyhole size={20} /></div><span className="section-kicker">STORE PARTNER ACCESS</span><h2>Welcome back</h2><p>Sign in to your store account.</p><form className="auth-form" onSubmit={submit}><label>Email address<input type="email" autoComplete="email" required placeholder="you@example.com" /></label><label>Password<input type="password" autoComplete="current-password" required placeholder="Your password" /></label><button className="solid-button" type="submit">Log in <ArrowRight size={16} /></button>{message && <p className="form-message" role="status">{message}</p>}</form><div className="login-help">New store partner? <Link to="/contact">Get in touch</Link></div></div></section></div>
  )
}
