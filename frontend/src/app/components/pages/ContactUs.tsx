import { useState } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../../lib/api';
import { Spinner } from '../motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { SplitHeading, useRevealChildren } from '../motion';

export function ContactUs() {
  const revealRef = useRevealChildren(':scope > div > *, :scope > div > div > *');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const r = await api('/contact', { method: 'POST', json: formData });
      toast.success(r.message);
      setSent(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setTimeout(() => setSent(false), 6000);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-gray-50 py-12">
      <div ref={revealRef} className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <SplitHeading as="h1" immediate text="Contact Us" className="mb-4 font-display font-bold text-3xl md:text-5xl tracking-tight text-gray-900" />
          <p className="text-gray-600 max-w-2xl mx-auto">
            Have questions or need assistance? Get in touch with our support team.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-sm text-center aa-lift">
            <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="size-8 text-emerald-600" />
            </div>
            <h3 className="mb-2">Email Us</h3>
            <p className="text-gray-600">info@saadmission.org</p>
            <p className="text-gray-600">support@saadmission.org</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm text-center aa-lift">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="size-8 text-blue-600" />
            </div>
            <h3 className="mb-2">Call Us</h3>
            <p className="text-gray-600">+27 (0) 21 123 4567</p>
            <p className="text-sm text-gray-500">Mon-Fri 8AM-5PM SAST</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm text-center aa-lift">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="size-8 text-purple-600" />
            </div>
            <h3 className="mb-2">Visit Us</h3>
            <p className="text-gray-600">Cape Town, South Africa</p>
            <p className="text-sm text-gray-500">By appointment only</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 max-w-3xl mx-auto">
          <h2 className="mb-6">Send Us a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="phone" className="block mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label htmlFor="subject" className="block mb-2">
                  Subject *
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  <option value="">Select a subject</option>
                  <option value="registration">Registration Inquiry</option>
                  <option value="healthcare">Healthcare Services</option>
                  <option value="education">Education Services</option>
                  <option value="payment">Payment & Contributions</option>
                  <option value="technical">Technical Support</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="message" className="block mb-2">
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={6}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="aa-btn w-full bg-emerald-600 text-white p-4 rounded-lg hover:bg-emerald-700 flex items-center justify-center gap-2"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span key={sent ? 'sent' : sending ? 'sending' : 'idle'} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="flex items-center gap-2">
                  {sending ? <Spinner /> : <Send className="size-5" />}
                  {sent ? 'Message sent — thank you!' : sending ? 'Sending…' : 'Send Message'}
                </motion.span>
              </AnimatePresence>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
