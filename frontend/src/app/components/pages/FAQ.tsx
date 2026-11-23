import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { SplitHeading, useRevealChildren, EASE } from '../motion';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export function FAQ() {
  const revealRef = useRevealChildren(':scope > div > *, :scope > div > div > *');
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const faqs: FAQItem[] = [
    {
      category: 'general',
      question: 'What is African Admission?',
      answer: 'African Admission is a community platform that enables foreign nationals in South Africa to access private healthcare and education services through affordable monthly contributions. Members pool resources to access quality private hospitals and schools.',
    },
    {
      category: 'general',
      question: 'Who can join?',
      answer: 'Any foreign national living in South Africa with valid identification (passport or permit) can register for our services. We welcome all nationalities seeking access to quality healthcare and education.',
    },
    {
      category: 'registration',
      question: 'How do I register?',
      answer: 'Click on the "Register" button in the navigation menu, select the services you need (healthcare, education, or both), fill in your personal details including your passport or permit number, and create a secure password.',
    },
    {
      category: 'registration',
      question: 'What documents do I need to register?',
      answer: 'You will need a valid passport or permit number, proof of address in South Africa, and contact information. Additional documents may be required when accessing specific services.',
    },
    {
      category: 'payment',
      question: 'How much are the monthly contributions?',
      answer: 'Contribution amounts vary based on the services you select. Healthcare-only is R800/month, Education-only is R900/month, and Both Services is R1,500/month. These contributions give you access to the respective services when needed.',
    },
    {
      category: 'payment',
      question: 'When are payments due?',
      answer: 'Monthly contributions are due on the 1st of each month. You can set up automatic payments or make manual payments through your member dashboard.',
    },
    {
      category: 'payment',
      question: 'What payment methods are accepted?',
      answer: 'We accept bank transfers, debit cards, and major credit cards. All payments are processed securely through our payment gateway.',
    },
    {
      category: 'healthcare',
      question: 'What healthcare services are covered?',
      answer: 'Members have access to private hospitals and clinics for emergency care, general consultations, specialist referrals, diagnostic tests, and prescription medication. This is not insurance but facilitated access to private healthcare facilities.',
    },
    {
      category: 'healthcare',
      question: 'How do I access healthcare services?',
      answer: 'Log into your dashboard to find participating healthcare facilities. Present your membership card (available in your dashboard) when visiting a facility. Your monthly contribution covers the access fee.',
    },
    {
      category: 'education',
      question: 'What grades are covered for education?',
      answer: 'We facilitate registration for private schools covering Grades 2-7 and Grades 9-12. We work with partner schools across South Africa to provide quality education access.',
    },
    {
      category: 'education',
      question: 'When can I register my child for school?',
      answer: 'School registration typically opens in September for the following year. For 2025, confirmations of placements should be made between 17 September - 30 September 2025. Contact us for specific school deadlines.',
    },
    {
      category: 'education',
      question: 'How do I find participating schools?',
      answer: 'Use the "Find a School" feature in the navigation menu to browse our network of partner private schools. You can filter by location, grades offered, and other criteria.',
    },
    {
      category: 'support',
      question: 'What if I need to cancel my membership?',
      answer: 'You can cancel your membership at any time by contacting our support team. Please note that contributions are non-refundable but cancellation will take effect from the following month.',
    },
    {
      category: 'support',
      question: 'How can I get help?',
      answer: 'Contact us through the "Contact Us" page, email us at support@saadmission.org, or call +27 (0) 21 123 4567 during business hours (Mon-Fri 8AM-5PM SAST). We are here to help!',
    },
  ];

  const categories = [
    { id: 'all', label: 'All Questions' },
    { id: 'general', label: 'General' },
    { id: 'registration', label: 'Registration' },
    { id: 'payment', label: 'Payments' },
    { id: 'healthcare', label: 'Healthcare' },
    { id: 'education', label: 'Education' },
    { id: 'support', label: 'Support' },
  ];

  const filteredFaqs = selectedCategory === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

  return (
    <div className="bg-gray-50 py-12">
      <div ref={revealRef} className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="bg-emerald-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="size-8 text-white" />
          </div>
          <SplitHeading as="h1" immediate text="Frequently Asked Questions" className="mb-4 font-display font-bold text-3xl md:text-5xl tracking-tight text-gray-900" />
          <p className="text-gray-600">
            Find answers to common questions about our services
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8 flex flex-wrap gap-3 justify-center">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => { setSelectedCategory(category.id); setOpenIndex(null); }}
              className={`relative px-4 py-2 rounded-full transition-colors duration-300 ${
                selectedCategory === category.id
                  ? 'text-white'
                  : 'bg-white text-gray-700 hover:bg-emerald-50'
              }`}
            >
              {selectedCategory === category.id && (
                <motion.span layoutId="faq-cat" className="absolute inset-0 rounded-full bg-emerald-600 shadow-lg shadow-emerald-600/25" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
              )}
              <span className="relative">{category.label}</span>
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {filteredFaqs.map((faq, index) => (
            <div key={faq.question} className={`bg-white rounded-xl shadow-sm overflow-hidden ring-1 transition-shadow duration-500 ${openIndex === index ? 'ring-emerald-200 shadow-lg shadow-emerald-900/5' : 'ring-transparent'}`}>
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full p-6 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
              >
                <span className="pr-8">{faq.question}</span>
                <motion.span animate={{ rotate: openIndex === index ? 180 : 0 }} transition={{ duration: 0.4, ease: EASE }} className="flex-shrink-0">
                  <ChevronDown className={`size-5 ${openIndex === index ? 'text-emerald-600' : 'text-gray-400'}`} />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.45, ease: EASE }}
                  >
                    <div className="px-6 pb-6 text-gray-600">{faq.answer}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Still Need Help */}
        <div className="mt-12 bg-emerald-50 rounded-lg p-8 text-center">
          <h3 className="mb-3">Still have questions?</h3>
          <p className="text-gray-600 mb-6">
            Our support team is here to help you with any additional questions.
          </p>
          <Link to="/contact" className="aa-btn inline-block bg-emerald-600 text-white px-8 py-3 rounded-lg hover:bg-emerald-700">
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
