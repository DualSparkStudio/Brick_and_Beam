#!/usr/bin/env node
require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function populateTables() {
  console.log('📝 Populating house_rules and faqs tables...\n')

  // House Rules
  const houseRules = [
    { rule_text: 'Check-in time is 2:00 PM and check-out time is 10:00 AM', order_num: 1, is_active: true },
    { rule_text: 'Smoking is strictly prohibited inside the rooms', order_num: 2, is_active: true },
    { rule_text: 'Pets are not allowed on the premises', order_num: 3, is_active: true },
    { rule_text: 'Please maintain silence after 10:00 PM to respect other guests', order_num: 4, is_active: true },
    { rule_text: 'Guests are responsible for any damage to property during their stay', order_num: 5, is_active: true },
    { rule_text: 'Outside food and alcohol are not permitted', order_num: 6, is_active: true },
    { rule_text: 'Valid ID proof is mandatory at the time of check-in', order_num: 7, is_active: true },
    { rule_text: 'Please use dustbins and help us keep the resort clean', order_num: 8, is_active: true }
  ]

  console.log('Adding house rules...')
  const { data: rulesData, error: rulesError } = await supabase
    .from('house_rules')
    .insert(houseRules)
    .select()

  if (rulesError) {
    console.log('❌ Error adding house rules:', rulesError.message)
  } else {
    console.log(`✅ Added ${rulesData.length} house rules`)
  }

  // FAQs
  const faqs = [
    {
      question: 'What are the check-in and check-out times?',
      answer: 'Check-in is at 2:00 PM and check-out is at 10:00 AM. Early check-in or late check-out may be available upon request, subject to availability and additional charges.',
      category: 'Booking',
      order_num: 1,
      is_active: true
    },
    {
      question: 'Is parking available at the resort?',
      answer: 'Yes, we provide complimentary parking for all our guests. The parking area is secure and monitored.',
      category: 'Amenities',
      order_num: 2,
      is_active: true
    },
    {
      question: 'Do you allow pets?',
      answer: 'Unfortunately, we do not allow pets on the premises to ensure the comfort and safety of all our guests.',
      category: 'Policies',
      order_num: 3,
      is_active: true
    },
    {
      question: 'What is your cancellation policy?',
      answer: 'Cancellations made 7 days or more before check-in receive a full refund. Cancellations within 7 days are subject to a 50% cancellation fee. No refunds for cancellations within 48 hours of check-in.',
      category: 'Policies',
      order_num: 4,
      is_active: true
    },
    {
      question: 'Is WiFi available?',
      answer: 'Yes, complimentary high-speed WiFi is available throughout the property for all guests.',
      category: 'Amenities',
      order_num: 5,
      is_active: true
    },
    {
      question: 'What meals are included?',
      answer: 'Room rates typically include breakfast. Lunch and dinner can be arranged at an additional cost. Please contact us for meal packages and pricing.',
      category: 'Amenities',
      order_num: 6,
      is_active: true
    },
    {
      question: 'Are there any nearby tourist attractions?',
      answer: 'Yes! We are located near several popular attractions including Mahabaleshwar, Panchgani, Pratapgad Fort, and various waterfalls. Check our Tourist Attractions page for more details.',
      category: 'Location',
      order_num: 7,
      is_active: true
    },
    {
      question: 'Do you provide transportation services?',
      answer: 'We can help arrange local transportation and tours. Please contact us in advance to make arrangements.',
      category: 'Services',
      order_num: 8,
      is_active: true
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept cash, credit/debit cards, UPI, and online payments through Razorpay. Advance payment is required to confirm bookings.',
      category: 'Booking',
      order_num: 9,
      is_active: true
    },
    {
      question: 'Is the resort suitable for children?',
      answer: 'Yes, our resort is family-friendly and suitable for children. We have open spaces and activities that children can enjoy.',
      category: 'General',
      order_num: 10,
      is_active: true
    }
  ]

  console.log('Adding FAQs...')
  const { data: faqsData, error: faqsError } = await supabase
    .from('faqs')
    .insert(faqs)
    .select()

  if (faqsError) {
    console.log('❌ Error adding FAQs:', faqsError.message)
  } else {
    console.log(`✅ Added ${faqsData.length} FAQs`)
  }

  console.log('\n✨ Population complete!')
  
  // Verify
  console.log('\n🔍 Verifying data...')
  const { count: rulesCount } = await supabase
    .from('house_rules')
    .select('*', { count: 'exact', head: true })
  
  const { count: faqsCount } = await supabase
    .from('faqs')
    .select('*', { count: 'exact', head: true })

  console.log(`📊 house_rules: ${rulesCount} rows`)
  console.log(`📊 faqs: ${faqsCount} rows`)
}

populateTables()
