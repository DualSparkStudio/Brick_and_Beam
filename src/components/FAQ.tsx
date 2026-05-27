import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface FAQ {
  id: number;
  question: string;
  answer: string;
  order_num: number;
  is_active: boolean;
}

const FAQ: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .eq('is_active', true)
        .order('order_num', { ascending: true });

      if (error) {
        // Use demo data if API fails
        setFaqs([
          {
            id: 1,
            question: 'What are your check-in and check-out times?',
            answer: `Check-in time is 1:00 PM onwards and check-out time is 10:00 AM. Check-in and check-out times are flexible depending on other bookings. Please contact us for early check-in or late check-out requests.`,
            order: 1,
            is_active: true
          },
          {
            id: 2,
            question: 'Do you provide airport pickup service?',
            answer: 'Yes, we offer airport pickup and drop-off services for an additional fee. Please contact us at least 24 hours in advance to arrange this service.',
            order: 2,
            is_active: true
          },
          {
            id: 3,
            question: 'What amenities are included in the room rate?',
            answer: 'All our rooms include complimentary Wi-Fi, daily housekeeping, toiletries, and a delicious breakfast. Some rooms also feature private balconies with garden views.',
            order: 3,
            is_active: true
          },
          {
            id: 4,
            question: 'Is parking available on-site?',
            answer: 'Yes, we provide free parking for all our guests. The parking area is secure and well-lit for your convenience.',
            order: 4,
            is_active: true
          },
          {
            id: 5,
            question: 'Do you accept pets?',
            answer: 'We love pets! We accept well-behaved pets with prior approval. A small pet fee applies, and we ask that pets be kept on a leash in common areas.',
            order: 5,
            is_active: true
          },
          {
            id: 6,
            question: 'What is your cancellation policy?',
            answer: 'We offer flexible cancellation up to 48 hours before your scheduled arrival. Cancellations made within 48 hours may be subject to a one-night charge.',
            order: 6,
            is_active: true
          }
        ]);
        return;
      }

      setFaqs(data || []);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const toggleFAQ = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <div className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (faqs.length === 0) {
    return null; // Don't render anything if no FAQs
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about your stay at Resort Booking System
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(faq.id)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
              >
                <h3 className="text-lg font-medium text-gray-900 pr-4">
                  {faq.question}
                </h3>
                {expandedId === faq.id ? (
                  <ChevronUpIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
                )}
              </button>
              
              {expandedId === faq.id && (
                <div className="px-6 pb-4">
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Still have questions? We're here to help!
          </p>
          <a
            href="/contact"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Contact Us
          </a>
        </div>
      </div>
    </section>
  );
};

export default FAQ; 
