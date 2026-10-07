import { useEffect, useState, type FormEvent } from 'react'
import type { Session } from '@supabase/supabase-js'
import { ArrowRight, Leaf, LockKeyhole, LogOut, Mail, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

type CustomerProfile = {
  customer_id: string
  updates_opt_in: boolean
}

function isCustomerProfile(value: unknown): value is CustomerProfile {
  if (!value || typeof value !== 'object') return false
  const profile = value as Partial<CustomerProfile>
  return typeof profile.customer_id === 'string' && typeof profile.updates_opt_in === 'boolean'
}

export default function LoginPage() {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<CustomerProfile | null>(null)
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [updatesOptIn, setUpdatesOptIn] = useState(false)
  const [savingUpdates, setSavingUpdates] = useState(false)
  const [loading, setLoading] = useState(Boolean(supabase))
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!supabase) return

    let active = true

    async function loadProfile(userId: string) {
      const { data, error: profileError } = await supabase!.from('customer_profiles')
        .select('customer_id, updates_opt_in')
        .eq('user_id', userId)
        .maybeSingle()
      if (!active) return
      if (profileError) {
        setError('We could not load your customer profile. Please try again.')
        return
      }
      if (!isCustomerProfile(data)) {
        setError('Your customer profile is not ready yet. If you just signed up, verify your email and sign in again.')
        return
      }
      setProfile(data)
      setUpdatesOptIn(data.updates_opt_in)
      setError('')
    }

    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return
      if (sessionError) setError(sessionError.message)
      setSession(data.session)
      setLoading(false)
      if (data.session) void loadProfile(data.session.user.id)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return
      setSession(nextSession)
      setProfile(null)
      setError('')
      if (nextSession) window.setTimeout(() => { void loadProfile(nextSession.user.id) }, 0)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase) return
    setError('')
    setMessage('')
    setLoading(true)
    try {
      if (mode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { updates_opt_in: updatesOptIn } },
        })
        if (signUpError) throw signUpError
        if (!data.session) {
          setMessage('Check your email for a verification link. Your customer ID will be ready after you verify and sign in.')
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
        if (signInError) throw signInError
      }
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'We could not complete sign-in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function saveUpdatesPreference() {
    if (!supabase) return
    setSavingUpdates(true)
    setError('')
    setMessage('')
    try {
      const { data, error: preferenceError } = await supabase.rpc('set_customer_updates_opt_in', { enabled: updatesOptIn })
      if (preferenceError) throw preferenceError
      if (!data) throw new Error('Your customer profile was not found. Please sign in again.')
      setProfile((current) => current ? { ...current, updates_opt_in: updatesOptIn } : current)
      setMessage('Your email update preference has been saved.')
    } catch (preferenceError) {
      setError(preferenceError instanceof Error ? preferenceError.message : 'We could not save your preference.')
    } finally {
      setSavingUpdates(false)
    }
  }

  async function signOut() {
    if (!supabase) return
    const { error: signOutError } = await supabase.auth.signOut()
    if (signOutError) setError(signOutError.message)
  }

  return (
    <div className="inner-page login-page"><section className="login-layout">
      <div className="login-aside"><span className="login-leaf"><Leaf size={23} /></span><span className="section-kicker">A NOTE FOR OUR NEIGHBORS</span><h1>Your groceries.<br />Your <em>account.</em></h1><p>Create an account to keep your customer ID and choose whether you’d like email updates from Native Groceries.</p><div className="login-aside-note"><span>NEED A HAND?</span><Link to="/contact">Talk to our team <ArrowRight size={14} /></Link></div></div>
      <div className="login-form-wrap">
        {session ? <>
          <div className="login-icon"><UserRound size={20} /></div><span className="section-kicker">CUSTOMER ACCOUNT</span><h2>Your account</h2><p>{session.user.email}</p>
          {profile ? <div className="customer-account-details">
            <div className="customer-id-card"><span>YOUR CUSTOMER ID</span><strong>{profile.customer_id}</strong></div>
            <label className="updates-opt-in"><input type="checkbox" checked={updatesOptIn} onChange={(event) => setUpdatesOptIn(event.target.checked)} /><span>Email me about new products and store updates.</span></label>
            <button className="solid-button" type="button" disabled={savingUpdates || updatesOptIn === profile.updates_opt_in} onClick={saveUpdatesPreference}>{savingUpdates ? 'Saving...' : 'Save update preference'}</button>
          </div> : loading ? <p role="status">Loading your customer ID...</p> : <p role="alert">{error || 'Customer profile is unavailable.'}</p>}
          {error && <p className="form-message" role="alert">{error}</p>}
          {message && <p className="form-success" role="status">{message}</p>}
          <button className="account-signout" type="button" onClick={signOut}><LogOut size={15} /> Sign out</button>
        </> : <>
          <div className="login-icon">{mode === 'signup' ? <Mail size={20} /> : <LockKeyhole size={20} />}</div><span className="section-kicker">CUSTOMER ACCESS</span><h2>{mode === 'signup' ? 'Create your account' : 'Welcome back'}</h2><p>{mode === 'signup' ? 'Sign up to get your customer ID.' : 'Log in to view your customer ID and preferences.'}</p>
          <form className="auth-form" onSubmit={submit}>
            <label>Email address<input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label>
            <label>Password<input type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" /></label>
            {mode === 'signup' && <label className="updates-opt-in"><input type="checkbox" checked={updatesOptIn} onChange={(event) => setUpdatesOptIn(event.target.checked)} /><span>Email me about new products and store updates. You can change this later.</span></label>}
            <button className="solid-button" type="submit" disabled={loading || !supabase}>{loading ? 'Please wait...' : mode === 'signup' ? 'Create account' : 'Log in'} <ArrowRight size={16} /></button>
            {error && <p className="form-message" role="alert">{error}</p>}
            {message && <p className="form-success" role="status">{message}</p>}
          </form>
          <div className="login-help">{mode === 'signup' ? 'Already have an account?' : 'New to Native Groceries?'} <button className="auth-mode-toggle" type="button" onClick={() => { setMode((current) => current === 'login' ? 'signup' : 'login'); setMessage(''); setError('') }}>{mode === 'signup' ? 'Log in' : 'Create an account'}</button></div>
        </>}
        {!supabase && <div className="auth-configuration-error" role="alert">Customer login is not configured yet. Add the Supabase project URL and publishable key to the Vercel environment settings.</div>}
      </div>
    </section></div>
  )
}
