require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

const fullAttractions = [
  {
    name: 'Pratapgad Fort',
    description: 'Historic fort built by Chhatrapati Shivaji Maharaj, offering panoramic views of the Sahyadri mountains. A significant historical landmark with stunning architecture and rich Maratha history.',
    images: ['https://tripxl.com/blog/wp-content/uploads/2024/10/Pratapgad-Fort-cp.jpg', 'https://cdn1.tripoto.com/media/filter/tst/img/2366547/Image/1726472242_pratapgad_fort_ariel_view_copy.jpg.webp', 'https://www.hoteldreamland.com/wp-content/uploads/2019/07/Pratapgad-Fort-2.jpg', 'https://media.assettype.com/outlooktraveller/import/outlooktraveller/public/uploads/articles/travelnews/2017/03/Pratapgad-featured.jpg?w=1200&h=675&auto=format%2Ccompress&fit=max&enlarge=true'],
    distance: '24 km',
    travel_time: '45 minutes',
    category: 'fort',
    highlights: ['Historic', 'Panoramic Views', 'Architecture', 'Photography', 'Cultural Heritage'],
    best_time: 'October to March',
    is_active: true
  },
  {
    name: 'Venna Lake',
    description: 'Beautiful man-made lake perfect for boating and enjoying scenic views. Surrounded by lush greenery and offering various recreational activities including horse riding and toy train rides.',
    images: ['https://hblimg.mmtcdn.com/content/hubble/img/mahabaleshwar/mmt/activities/m_activities-mahabaleshwar-venna-lake_l_400_640.jpg', 'https://mahabaleshwartourism.in/images/places-to-visit/headers/venna-lake-mahabaleshwar-tourism-entry-fee-timings-holidays-reviews-header.jpg', 'https://static.wixstatic.com/media/ffb7e9_b262a318aa834fefa5a983167f8014be~mv2.png/v1/fill/w_840,h_480,al_c,lg_1,q_90/ffb7e9_b262a318aa834fefa5a983167f8014be~mv2.png', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSH7zuf66Iqqj-7SKenu-zoPsekNuaPaWcwiQ&s'],
    distance: '12 km',
    travel_time: '25 minutes',
    category: 'viewpoint',
    highlights: ['Boating', 'Scenic Views', 'Recreation', 'Photography', 'Family Fun'],
    best_time: 'Year Round',
    is_active: true
  },
  {
    name: 'Mapro Garden',
    description: 'Famous strawberry garden and food park offering delicious local treats, fresh strawberries, and beautiful garden views. Perfect for families and food lovers with various food stalls and shopping options.',
    images: ['https://www.mapro.com/cdn/shop/files/Mapro-Food-Park-1.jpg?v=1666437420&width=1500', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcy4diSL0nGDLcZvHIJoZsJHqonArwW2wt_A&s', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNsdhL8366vuEnZEw5UdOqguDOTnSd6jXjsw&s', 'https://www.mapro.com/cdn/shop/files/WhatsApp_Image_2023-03-05_at_9.53.11_AM.jpg?v=1677993015&width=1500'],
    distance: '8 km',
    travel_time: '15 minutes',
    category: 'park',
    highlights: ['Strawberries', 'Local Food', 'Garden Views', 'Family Fun', 'Shopping'],
    best_time: 'October to May',
    is_active: true
  },
  {
    name: 'Lingmala Waterfall',
    description: 'Stunning waterfall cascading down from a height of 600 feet, creating a mesmerizing natural spectacle. Surrounded by dense forests, it offers a perfect spot for nature photography and relaxation.',
    images: ['https://hblimg.mmtcdn.com/content/hubble/img/Mahabaleshwar/mmt/activities/m_activities_lingmala_waterfall_2_l_331_495.jpg', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTovLgNhlpN9nFjPWiqh_8GAdt4vqFcLuq5oQ&s', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJMNuVNO6C5SNbapk39cKMQtXu-y-ypjtLsg&s', 'https://mahabaleshwartourism.in/images/places-to-visit/headers/lingmala-waterfall-mahabaleshwar-tourism-entry-fee-timings-holidays-reviews-header.jpg'],
    distance: '18 km',
    travel_time: '35 minutes',
    category: 'viewpoint',
    highlights: ['Natural Beauty', 'Photography', 'Trekking', 'Scenic Views', 'Nature Walk'],
    best_time: 'July to September',
    is_active: true
  },
  {
    name: "Elephant's Head Point",
    description: "Famous viewpoint shaped like an elephant's head and trunk, offering breathtaking views of the Sahyadri ranges. One of the most popular sunrise and sunset viewing spots in Mahabaleshwar.",
    images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR61_-ft6FLPFedL7MXJZqIdMsR9ZgxkR3_Uw&s', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSl597qbHYhMx3CcEfORLXtcvjQJ46QQti7Zw&s', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSGu9ekoITdbxj0ARoZM-vbgWpjIh5fOKprnQ&s', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUxTefn9zHIScekm8l7vYNZ4ucyUokrFq8Og&s'],
    distance: '10 km',
    travel_time: '20 minutes',
    category: 'viewpoint',
    highlights: ['Sunrise', 'Sunset', 'Panoramic Views', 'Photography', 'Nature'],
    best_time: 'October to May',
    is_active: true
  },
  {
    name: "Kate's Point",
    description: 'Scenic viewpoint offering spectacular views of the Krishna Valley and Dhom Dam. Named after a British officer daughter, it provides one of the best panoramic views in the region.',
    images: ['https://dynamic-media-cdn.tripadvisor.com/media/photo-o/14/d9/ab/25/lrm-export-134359847325165.jpg?w=1200&h=-1&s=1', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSol9OKltisHYdClSeHrZ2ue1dCG_e6pC0Xhw&s', 'https://mahabaleshwartourism.in/images/places-to-visit/headers/kates-point-mahabaleshwar-header-mahabaleshwar-tourism.jpg.jpg', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSg03-Cz3VEjO_Tv8yXZa1wlP1kV9I8ePlRgg&s'],
    distance: '11 km',
    travel_time: '22 minutes',
    category: 'viewpoint',
    highlights: ['Valley Views', 'Photography', 'Sunset', 'Nature', 'Scenic Beauty'],
    best_time: 'Year Round',
    is_active: true
  },
  {
    name: "Arthur's Seat",
    description: 'One of the highest points in Mahabaleshwar, offering stunning views of the Savitri and Koyna valleys. Named after Sir Arthur Malet, it is perfect for sunrise viewing and photography.',
    images: ['https://d3gw4aml0lneeh.cloudfront.net/assets/locations/16954/DkqXyCFBH4D0.jpg', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNsVW0CNqvFYTRh0tQWmpIgrreP3CLD9mvtQ&s', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTql8Z0fgI2m1as2p1YEGM7bFi9P-6m9nfr6A&s', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzIiKPLgb6nQ158yYgA5kAttYAgPxQHfiaVw&s'],
    distance: '13 km',
    travel_time: '28 minutes',
    category: 'viewpoint',
    highlights: ['Sunrise', 'Valley Views', 'Photography', 'Nature', 'Trekking'],
    best_time: 'October to May',
    is_active: true
  },
  {
    name: 'Panchgani',
    description: 'Beautiful hill station located at an altitude of 1334 meters, famous for its strawberry farms, scenic viewpoints, and pleasant climate. A perfect day trip destination with multiple attractions.',
    images: ['https://s7ap1.scene7.com/is/image/incredibleindia/panchgani-mahabaleshwar-maharashtra-2-attr-hero?qlt=82&ts=1726668900737', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwpV9yzYey9qsQwJKjm3bwvWVvNfUeXGEveA&s', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3-6o07pN0r300glz9Jf2foeqWCOY5MT73tg&s', 'https://hblimg.mmtcdn.com/content/hubble/img/new_dest_imagemar/mmt/activities/m_Panchgani_2_l_800_1200.jpg'],
    distance: '20 km',
    travel_time: '40 minutes',
    category: 'viewpoint',
    highlights: ['Strawberry Farms', 'Viewpoints', 'Shopping', 'Food', 'Nature'],
    best_time: 'Year Round',
    is_active: true
  },
  {
    name: 'Mahabaleshwar Temple',
    description: 'Ancient temple dedicated to Lord Shiva, one of the most sacred places in the region. The temple has a unique architecture and is surrounded by beautiful natural surroundings.',
    images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFzf_cIVV_f-coAtjXw5ZHodpsAHsSywU6sA&s', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqIgiDKMiUFPKKM38gTHTxQ3fN8evwHABMcA&s', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIc9wNd8MSAoBe464vX3GuFvYKJbq6UYnHgg&s', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTnQUWPU6wUPUWqguaq7A0WsnATWd1-0UanAw&s'],
    distance: '14 km',
    travel_time: '30 minutes',
    category: 'temple',
    highlights: ['Religious', 'Architecture', 'Spiritual', 'Photography', 'Cultural'],
    best_time: 'Year Round',
    is_active: true
  },
  {
    name: 'Connaught Peak',
    description: 'Second highest point in Mahabaleshwar offering panoramic views of the surrounding valleys and hills. Named after the Duke of Connaught, it is perfect for sunrise and sunset viewing.',
    images: ['https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2b/39/27/09/caption.jpg?w=900&h=-1&s=1', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSzu0ITzw7s5f3fARJu_pDUHiPcT7yC9wdnww&s', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjCye6oZnf3ZSN0JYdWJKC76fRKVltBs2zsg&s', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSr4OIb55xpFicXFiYkdiRzs4qb_rMuWgijlQ&s'],
    distance: '15 km',
    travel_time: '32 minutes',
    category: 'viewpoint',
    highlights: ['Sunrise', 'Sunset', 'Panoramic Views', 'Photography', 'Trekking'],
    best_time: 'October to May',
    is_active: true
  },
  {
    name: 'Bombay Point',
    description: 'Popular sunset point offering spectacular views of the surrounding valleys. One of the most visited viewpoints in Mahabaleshwar, perfect for evening visits and photography.',
    images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBYSzy-rfpFiC0Uv5OMZMujDcO7URLiWDsSw&s', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDpOiYLW7-awl7ZZAxZ0CTr_iSbrDXSbWWuQ&s', 'https://mahabaleshwartourism.in/images//tourist-places/mumbai-point-sunset-point-mahabaleshwar/mumbai-point-sunset-point-mahabaleshwar-tourism-one-day-city-tour.jpg', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMqLudx1Z9nq8M7GIS7TyryM7mKEJI1Oy-hw&s'],
    distance: '12 km',
    travel_time: '25 minutes',
    category: 'viewpoint',
    highlights: ['Sunset', 'Photography', 'Valley Views', 'Nature', 'Scenic Beauty'],
    best_time: 'Year Round',
    is_active: true
  },
  {
    name: 'Wilson Point',
    description: 'Highest point in Mahabaleshwar, also known as Sunrise Point. Offers breathtaking 360-degree views of the surrounding landscape and is perfect for early morning visits.',
    images: ['https://mahabaleshwartourism.in/images/places-to-visit/headers/wilson-point-sunrise-point-mahabaleshwar-tourism-entry-fee-timings-holidays-reviews-header.jpg', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQrioYAEn9uCOrVczYArlFBgxe7tsRFrT__Qw&s', 'https://res.cloudinary.com/kmadmin/image/upload/v1727355822/kiomoi/Wilson_Point_0803.jpg', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-KgqBdbHHA_iX04x4l-cP0VojV4l7k-Rhxw&s'],
    distance: '16 km',
    travel_time: '35 minutes',
    category: 'viewpoint',
    highlights: ['Sunrise', '360° Views', 'Photography', 'Nature', 'Trekking'],
    best_time: 'October to May',
    is_active: true
  },
  {
    name: 'Table Land',
    description: 'Largest volcanic plateau in Asia, located in Panchgani. Offers stunning views and is perfect for horse riding, paragliding, and enjoying the vast open space.',
    images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSMulxFISV2Z5VGxWKR1iZ70EkNC-B0J2rehg&s', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ3i_KC5S7l9k0okslSZla-EeCgT0Eldo2Vmw&s', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZ3eWXdQUmnumwUR2XlBLtP39Wq8GjkxGQuQ&s', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmTasw5jBneGOVN2CdDIm18t57K-WQvy5drQ&s'],
    distance: '22 km',
    travel_time: '45 minutes',
    category: 'viewpoint',
    highlights: ['Horse Riding', 'Paragliding', 'Photography', 'Adventure', 'Scenic Views'],
    best_time: 'Year Round',
    is_active: true
  },
  {
    name: 'Rajpuri Caves',
    description: 'Ancient caves with natural water pools believed to have religious significance. The caves are surrounded by beautiful natural scenery and offer a unique spiritual experience.',
    images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxiShvFWp2LgTz22voOpXAkWNvIrY_gbbvLA&s', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTgeI26IiQy9RT6QCQSzlyUG0Bwlq77WfFq3A&s', 'https://www.stone-shelter.com/places-to-visit-mahabaleshwar/rajpuri-caves-mahabaleshwar.jpg', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQa-aAaxMSZkDIdvmRePBxFDxAEVF6Q-nP3Yg&s'],
    distance: '26 km',
    travel_time: '50 minutes',
    category: 'viewpoint',
    highlights: ['Religious', 'Natural Pools', 'Spiritual', 'Photography', 'Adventure'],
    best_time: 'Year Round',
    is_active: true
  },
  {
    name: 'Tapola (Mini Kashmir)',
    description: 'Beautiful village located near the Koyna Dam, often called Mini Kashmir due to its stunning natural beauty. Offers boating, water sports, and breathtaking views of the backwaters.',
    images: ['https://mahabaleshwartourism.in/images//tourist-places/tapola-mini-kashmir-mahabaleshwar/tapola-mini-kashmir-mahabaleshwar-tourism-entry-ticket-boating-price.jpg', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4ncrbRgKw9ofHc3v-1wkkChj4piGuSshChA&s', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5GSMgMIP7B6wK_e-gdwqViCFb1yAr--LZZg&s', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNXbQD9hIF9-jOJ2Sb3JCtnhj68FOg3oU9zA&s'],
    distance: '30 km',
    travel_time: '55 minutes',
    category: 'viewpoint',
    highlights: ['Boating', 'Water Sports', 'Scenic Views', 'Photography', 'Nature'],
    best_time: 'Year Round',
    is_active: true
  },
  {
    name: "Chinaman's Falls",
    description: 'Beautiful waterfall cascading through dense forests, creating a serene and picturesque setting. Perfect for nature lovers and photography enthusiasts.',
    images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbJIWWFJxqDiQPfTbKAb0ykdebBG0dnhu-dg&s', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQKeoj0qgQJQLE90It1nrjCF7cGA4qIaI2CPA&s', 'https://mahabaleshwartourism.in/images//tourist-places/chinamans-falls-mahabaleshwar/chinamans-falls-mahabaleshwar-photo-gallery-mahabaleshwar-tourism.jpg.jpg', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRALtfDcfN9_NZs6ijwlQQ7efe7GRsNXtebmA&s'],
    distance: '19 km',
    travel_time: '38 minutes',
    category: 'viewpoint',
    highlights: ['Natural Beauty', 'Photography', 'Trekking', 'Nature Walk', 'Scenic Views'],
    best_time: 'July to September',
    is_active: true
  },
  {
    name: 'Dhobi Waterfall',
    description: 'Picturesque waterfall surrounded by lush greenery, offering a peaceful retreat. The waterfall creates natural pools perfect for a refreshing dip during monsoon season.',
    images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvEPGlimqkDuYCDcMG58YIMabwwCBA2JXQmw&s', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFG8u9cHJPDdXGRwFTKgFcJ9s0amZM01bdJQ&s', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9tt7Z5t3BUcO21iKAgMg-qhRrvBtSprYEMg&s', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5mgn8cXkLEyr5eSQockCdXstv3JX-LoWUGA&s'],
    distance: '17 km',
    travel_time: '35 minutes',
    category: 'viewpoint',
    highlights: ['Natural Beauty', 'Swimming', 'Photography', 'Nature', 'Monsoon'],
    best_time: 'July to September',
    is_active: true
  },
  {
    name: 'Lodwick Point',
    description: 'Scenic viewpoint named after General Lodwick, offering spectacular views of the Krishna Valley. Features a natural rock formation and is perfect for photography.',
    images: ['https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0d/09/77/b6/that-s-the-elephant-trunk.jpg?w=1200&h=-1&s=1', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdB7GMPN1Dwb-_2lVy9G0JrHYmw7KFX4bxDA&s', 'https://backpackersunited.in/_next/image?url=https%3A%2F%2Fbpu-images-v1.s3.eu-north-1.amazonaws.com%2Fuploads%2F1721964627165_4.jpeg&w=1920&q=75', 'https://res.cloudinary.com/kmadmin/image/upload/v1727439570/kiomoi/Lodwick_Point_5039.jpg'],
    distance: '13 km',
    travel_time: '28 minutes',
    category: 'viewpoint',
    highlights: ['Valley Views', 'Photography', 'Rock Formation', 'Nature', 'Scenic Beauty'],
    best_time: 'Year Round',
    is_active: true
  },
  {
    name: 'Needle Hole Point',
    description: 'Unique viewpoint featuring a natural rock formation with a hole, offering stunning views of the surrounding valleys. Also known as Elephant Point due to its shape.',
    images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdeOuOyHwFVFoFEi2mybU9IvICdBP68OviEg&s', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwo40hjmyGZ_5p2rXpHm4l25K6QlZ1qgSI8Q&s', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzyA9A_kEU7ZRgiLNP91e2Uqcf2X8xEgc1Ag&s', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSH-tlOK-_XN1E591zWMxxkOf2mNJuF_8D7Gw&s'],
    distance: '11 km',
    travel_time: '23 minutes',
    category: 'viewpoint',
    highlights: ['Rock Formation', 'Photography', 'Valley Views', 'Nature', 'Unique'],
    best_time: 'Year Round',
    is_active: true
  },
  {
    name: 'Sunset Point',
    description: 'Popular sunset viewing spot offering breathtaking views as the sun sets over the Sahyadri mountains. Perfect for evening visits and capturing beautiful sunset photographs.',
    images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmQl5JydZSbCYTM9ATaCc0mCq3QBpHROK5gA&s', 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/17/bf/3a/37/majestic.jpg?w=900&h=500&s=1', 'https://mahabaleshwartourism.in/images/places-to-visit/headers/mumbai-point-sunset-point-mahabaleshwar-tourism-header.jpg', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbxLl9EsxLmUqTSZO67rCsyuX4EzEP4DNioQ&s'],
    distance: '12 km',
    travel_time: '25 minutes',
    category: 'viewpoint',
    highlights: ['Sunset', 'Photography', 'Mountain Views', 'Nature', 'Scenic Beauty'],
    best_time: 'Year Round',
    is_active: true
  }
]

async function importFull() {
  console.log('🚀 Importing attractions with full details...\n')
  
  console.log('🗑️  Clearing existing data...')
  await supabase.from('attractions').delete().neq('id', 0)
  console.log('✅ Cleared\n')
  
  console.log('📝 Inserting attractions...\n')
  
  for (let i = 0; i < fullAttractions.length; i++) {
    const attr = fullAttractions[i]
    const { error } = await supabase.from('attractions').insert([attr])
    
    if (error) {
      console.error(`❌ ${attr.name}:`, error.message)
    } else {
      console.log(`✅ ${i + 1}. ${attr.name}`)
    }
  }
  
  console.log('\n🎉 Done! Refresh your page.')
}

importFull()
