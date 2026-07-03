import { CreditCardIcon, DocumentTextIcon, ShieldCheckIcon, XCircleIcon } from '@heroicons/react/24/outline';
import PageHero from '../components/PageHero';
import { PAGE_HERO_IMAGES } from '../config/galleryImages';
import { useVilla } from '../contexts/VillaContext';
import { formatPolicyCheckInOut } from '../lib/villa-check-times';
import React, { useMemo } from 'react';

const Policy: React.FC = () => {
  const { checkTimes } = useVilla();

  const policies = useMemo(() => [
    {
      title: 'Guest Consent & General Rules',
      icon: DocumentTextIcon,
      content: [
        {
          subtitle: 'Payment & Food Policy',
          text: '1. Kindly submit the full payment receipt in the Resort office - its mandatory. 2. Outside food is not allowed inside Resort.'
        },
        {
          subtitle: 'Guest Conduct',
          text: 'Please show common courtesy to fellow Resort Guests and our Service Staff. Do not use any foul language and engage in unsafe and offensive behavior.'
        },
        {
          subtitle: 'Swimming Pool Rules',
          text: 'Swimming Pool Time: morning 10 am to 6 pm. Do not allow any beverage and food in swimming pool. Proper clothes must be worn at all times while enjoying the swimming pool of the resort.'
        },
        {
          subtitle: 'Meal Timings',
          text: 'Please don\'t ask for Breakfast or Lunch after the prescribed timings. Breakfast: 9:00 am to 10:30 am, Lunch: 1:00 pm to 2:30 pm, Hi-Tea: 5:00 pm to 6:00 pm, Dinner: 8:30 pm to 10:30 pm. We have buffet system - kindly do not waste our food.'
        },
        {
          subtitle: 'Personal Belongings',
          text: 'Please don\'t leave your belongings unattended. Management will not be responsible for losses.'
        },
        {
          subtitle: 'Discounts & Pricing',
          text: 'Please don\'t ask to argue with our staff for any kind of discount or concession even if you are late.'
        },
        {
          subtitle: 'Alcohol & Pets',
          text: 'Alcohol is allowed inside the villa only. Pet animals are not allowed inside the villa.'
        },
        {
          subtitle: 'Photography & Media',
          text: 'We may photograph, film, videotape, record or otherwise reproduce the image and/or voice of any person who enters the resort and use the same for publicity purposes without payment to any person. Signing of Indemnity Bond is Compulsory.'
        }
      ]
    },
    {
      title: 'For Villa Guests - Check-in/Check-out',
      icon: ShieldCheckIcon,
      content: [
        {
          subtitle: 'Check-in & Check-out Times',
          text: formatPolicyCheckInOut(checkTimes)
        },
        {
          subtitle: 'Intercom Facility',
          text: 'Intercom Facility Available: 9 - Reception, 100 - Security, 222 - Dining. For any queries please call Reception (Extension 9).'
        },
        {
          subtitle: 'Power & Electricity',
          text: 'As our villa is situated away from the city, power cuts can occur. Please co-operate in such circumstances and switch off lights when leaving the villa.'
        }
      ]
    }
  ], [checkTimes]);

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHero
        title="Policies & Terms"
        subtitle="Important information about your stay at Brick and Beam"
        image={PAGE_HERO_IMAGES.policy}
      />

      {/* Policies Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {policies.map((policy, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-dark-blue-800 to-golden-500 rounded-lg flex items-center justify-center mr-4">
                    <policy.icon className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">{policy.title}</h2>
                </div>
                
                <div className="space-y-6">
                  {policy.content.map((item, itemIndex) => (
                    <div key={itemIndex} className="border-l-4 border-golden-300 pl-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {item.subtitle}
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Contact Information */}
          <div className="mt-12 bg-golden-50 rounded-2xl p-8 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Questions About Our Policies?
            </h3>
            <p className="text-gray-700 mb-6">
              If you have any questions about our policies or need clarification on any terms, 
              please don't hesitate to contact us.
            </p>
            <div className="flex justify-center">
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-dark-blue-800 to-golden-500 text-white font-medium rounded-lg hover:opacity-90 transition-colors duration-200"
              >
                Contact Us
              </a>
            </div>
          </div>

          {/* Last Updated */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Last updated: February 2025</p>
            <p className="mt-1">
              These policies are subject to change. Please check back periodically for updates.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Policy;
