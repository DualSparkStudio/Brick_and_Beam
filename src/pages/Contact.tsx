import {
    ChatBubbleLeftRightIcon,
    ClockIcon,
    EnvelopeIcon,
    MapPinIcon,
    PaperAirplaneIcon,
    PhoneIcon
} from '@heroicons/react/24/outline'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import FAQ from '../components/FAQ'
import PageHero from '../components/PageHero'
import SEO from '../components/SEO'
import { GOOGLE_MAPS_EMBED_URL } from '../config/brand'
import { PAGE_HERO_IMAGES } from '../config/galleryImages'
import { api } from '../lib/supabase'

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [adminContactInfo, setAdminContactInfo] = useState({
    email: 'info@resortbooking.com',
    phone: '+91 98765 43210',
    name: 'Brick and Beam',
    address: 'Sample Address, City, State, PIN Code',
    phone2: '+91 98765 43211',
    phone3: '+91 98765 43212'
  })

  // Load admin contact info on component mount
  useEffect(() => {
    const loadAdminContactInfo = async () => {
      try {
        const adminInfo = await api.getAdminInfo()
        setAdminContactInfo({
          email: adminInfo.email || 'info@resortbooking.com',
          phone: adminInfo.phone || '+91 98765 43210',
          name: `${adminInfo.first_name} ${adminInfo.last_name}`.trim() || 'Brick and Beam',
          address: adminInfo.address || 'Sample Address, City, State, PIN Code',
          phone2: '+91 98765 43211',
          phone3: '+91 98765 43212'
        })
      } catch (error) {
        // Keep default values if loading fails
      }
    }
    
    loadAdminContactInfo()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      
      // Get SMTP configuration from admin panel
      let smtpConfig = {}
      try {
        smtpConfig = await api.getSmtpConfig()
      } catch (error) {
        // Continue with empty smtpConfig (will use environment variables)
      }
      
      // Send contact form email to admin
      const response = await fetch('/.netlify/functions/send-contact-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contactData: formData,
          adminEmail: adminContactInfo.email,
          smtpConfig: smtpConfig
        })
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || responseData.details || response.statusText)
      }
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      })
      
      toast.success('Thank you for your message! We will get back to you soon.')
    } catch (error: any) {
      console.error('Contact form error:', error)
      toast.error(error.message || 'Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }



  const contactInfo = [
    {
      title: 'Address',
      content: adminContactInfo.address || 'Sample Address, City, State, PIN Code',
      icon: MapPinIcon,
      link: 'https://maps.google.com'
    },
    {
      title: 'Phone',
      content: `${adminContactInfo.phone}${adminContactInfo.phone2 ? `, ${adminContactInfo.phone2}` : ''}${adminContactInfo.phone3 ? `, ${adminContactInfo.phone3}` : ''}`,
      icon: PhoneIcon,
      link: `tel:${adminContactInfo.phone}`
    },
    {
      title: 'Email',
      content: adminContactInfo.email,
      icon: EnvelopeIcon,
      link: `mailto:${adminContactInfo.email}`
    },
    {
      title: 'Check-in/Check-out',
      content: 'Check In: 12:00 PM | Check Out: 10:00 AM',
      icon: ClockIcon,
      link: null
    }
  ]

  const departments = [
    'General Inquiries',
    'Room Reservations',
    'Local Tours & Activities',
    'Transportation',
    'Special Occasions',
    'Group Bookings',
    'Technical Support'
  ]

  return (
    <>
      <SEO 
        title="Contact Brick and Beam - Get in Touch"
        description="Contact Brick and Beam for bookings, inquiries, or support. Reach us via phone, email, or our contact form. We're here to help."
        keywords="contact resort, resort contact, resort booking"
        url="https://resortbooking.com/contact"
      />
      <div className="min-h-screen bg-gray-50">
        <PageHero
          title="Contact Us"
          subtitle="We're here to help make your stay at Brick and Beam perfect. Get in touch with us anytime."
          image={PAGE_HERO_IMAGES.contact}
        />

        {/* Contact Information */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {contactInfo.map((info, index) => (
                <div key={index} className="text-center flex flex-col items-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-dark-blue-800 to-golden-500 rounded-full mb-4">
                    <info.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{info.title}</h3>
                  {info.link ? (
                    <a 
                      href={info.link} 
                      className="text-gray-600 hover:text-blue-800 transition-colors duration-200 text-center"
                    >
                      {info.content}
                    </a>
                  ) : (
                    <p className="text-gray-600 text-center">{info.content}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form & Map */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-dark-blue-800 to-golden-500 rounded-lg flex items-center justify-center mr-4">
                    <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Send us a Message</h2>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="input-field"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="input-field"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                        Subject *
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="input-field"
                      >
                        <option value="">Select a subject</option>
                        {departments.map((dept, index) => (
                          <option key={index} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="input-field resize-none"
                      placeholder="Tell us how we can help you..."
                    ></textarea>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full btn-primary flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <PaperAirplaneIcon className="h-5 w-5 mr-2" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>

                {/* Additional Information */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">What to Expect</h3>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="ml-3 text-sm text-gray-600">We respond to all inquiries within 24 hours</p>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="ml-3 text-sm text-gray-600">Our team is available 7 days a week</p>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="ml-3 text-sm text-gray-600">For urgent matters, call us directly</p>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="ml-3 text-sm text-gray-600">Your information is kept secure and private</p>
                    </div>
                  </div>
                </div>

                {/* Contact Methods */}
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-golden-50 rounded-lg">
                  <p className="text-sm text-gray-700 text-center">
                    <span className="font-semibold">Prefer to talk?</span> Call us at{' '}
                    <a href={`tel:${adminContactInfo.phone}`} className="text-dark-blue-800 font-semibold hover:underline">
                      {adminContactInfo.phone}
                    </a>
                  </p>
                </div>
              </div>

              {/* Map & Additional Info */}
              <div className="space-y-8">
                {/* Map */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                    <iframe 
                      src={GOOGLE_MAPS_EMBED_URL} 
                      width="100%" 
                      height="450" 
                      style={{border: 0}} 
                      allowFullScreen 
                      loading="lazy" 
                      referrerPolicy="no-referrer-when-downgrade"
                      className="w-full h-[450px]"
                    ></iframe>
                  </div>
                </div>

                {/* Quick Contact */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Quick Contact</h3>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <PhoneIcon className="h-6 w-6 text-forest-800 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">Reservations</p>
                        <p className="text-gray-600">{adminContactInfo.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <EnvelopeIcon className="h-6 w-6 text-forest-800 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">Email Support</p>
                        <p className="text-gray-600">{adminContactInfo.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="h-6 w-6 text-forest-800 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">Response Time</p>
                        <p className="text-gray-600">Within 24 hours</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <MapPinIcon className="h-6 w-6 text-forest-800 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">Location</p>
                        <p className="text-gray-600">{adminContactInfo.address || 'Sample Address, City, State, PIN Code'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQ />

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-dark-blue-800 to-golden-500">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Experience Brick and Beam?
            </h2>
            <p className="text-xl text-white/80 mb-8">
              Book your stay today and let us create the perfect Mahabaleshwar experience for you.
            </p>
            <a
              href="/rooms"
              className="inline-block bg-white text-dark-blue-800 font-bold py-4 px-8 rounded-lg hover:bg-gray-100 transition-colors duration-300"
            >
              Book Your Stay
            </a>
          </div>
        </section>
      </div>
    </>
  )
}

export default Contact 
