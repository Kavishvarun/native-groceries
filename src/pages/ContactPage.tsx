import { useState, type FormEvent } from 'react'
import { ArrowRight, Clock3, Mail, MapPin, MessageCircle } from 'lucide-react'

export default function ContactPage() {
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSending(true)
    setMessage('')
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.get('name'), email: form.get('email'), topic: form.get('topic'), message: form.get('message') }),
      })
      if (!response.ok) throw new Error('We could not send your note. Please try again.')
      setSent(true)
      formElement.reset()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="inner-page contact-page"><section className="contact-intro"><span className="section-kicker">WE'RE AROUND THE CORNER</span><h1>Come say<br /><em>hello.</em></h1><p>A question, a kind word, a favorite farm we should know about? We would love to hear it.</p></section>
      <section className="contact-layout"><div className="contact-details"><div className="contact-detail"><span><MapPin size={19} /></span><div><strong>Find the market</strong><p>kalasapakkam<br />Thiruvannamalai,Tamil Nadu, India</p></div></div><div className="contact-detail"><span><Clock3 size={19} /></span><div><strong>Come by anytime</strong><p>Monday-Saturday, 8am-8pm<br />Sunday, 9am-2pm</p></div></div><div className="contact-detail"><span><Mail size={19} /></span><div><strong>Write to us</strong><p><a href="mailto:hello@nativegroceries.in">hello@nativegroceries.in</a></p></div></div><div className="contact-detail"><span><MessageCircle size={19} /></span><div><strong>Chat on WhatsApp</strong><p><a href="https://wa.me/919655082236" target="_blank" rel="noreferrer">+91 9655082236</a></p></div></div><div className="contact-photo"><img src="https://images.unsplash.com/photo-1557844352-761f2565b576?auto=format&fit=crop&w=950&q=82" alt="Fresh vegetables at a market" /><span>Fresh from our local markets.</span></div></div>
        <form className="contact-form" onSubmit={submit}><span className="section-kicker">SEND US A NOTE</span><h2>What's on your mind?</h2><div className="form-row"><label>Your name<input name="name" required placeholder="Name" /></label><label>Email address<input name="email" type="email" required placeholder="you@example.com" /></label></div><label>What's this about?<select name="topic" defaultValue="A little question"><option>A little question</option><option>Store partnership</option><option>Product suggestion</option><option>Something else</option></select></label><label>Your note<textarea name="message" rows={5} required minLength={8} placeholder="Tell us a little more..." /></label><button className="solid-button" type="submit" disabled={sending}>{sending ? 'Sending...' : 'Send your note'} <ArrowRight size={16} /></button>{sent && <p className="form-message success-message" role="status">Thanks for reaching out. Your note is with our team.</p>}{message && <p className="form-message" role="alert">{message}</p>}</form></section>
    </div>
  )
}
