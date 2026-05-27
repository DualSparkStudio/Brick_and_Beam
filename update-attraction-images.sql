-- Update Tourist Attractions with new images
-- Run this script in your Supabase SQL Editor after running the migration

-- Update Pratapgad Fort images
UPDATE tourist_attractions
SET images = ARRAY[
  'https://tripxl.com/blog/wp-content/uploads/2024/10/Pratapgad-Fort-cp.jpg',
  'https://cdn1.tripoto.com/media/filter/tst/img/2366547/Image/1726472242_pratapgad_fort_ariel_view_copy.jpg.webp',
  'https://www.hoteldreamland.com/wp-content/uploads/2019/07/Pratapgad-Fort-2.jpg',
  'https://media.assettype.com/outlooktraveller/import/outlooktraveller/public/uploads/articles/travelnews/2017/03/Pratapgad-featured.jpg?w=1200&h=675&auto=format%2Ccompress&fit=max&enlarge=true'
]
WHERE LOWER(name) LIKE '%pratapgad%' OR LOWER(name) LIKE '%pratap%';

-- Update Venna Lake images
UPDATE tourist_attractions
SET images = ARRAY[
  'https://hblimg.mmtcdn.com/content/hubble/img/mahabaleshwar/mmt/activities/m_activities-mahabaleshwar-venna-lake_l_400_640.jpg',
  'https://mahabaleshwartourism.in/images/places-to-visit/headers/venna-lake-mahabaleshwar-tourism-entry-fee-timings-holidays-reviews-header.jpg',
  'https://static.wixstatic.com/media/ffb7e9_b262a318aa834fefa5a983167f8014be~mv2.png/v1/fill/w_840,h_480,al_c,lg_1,q_90/ffb7e9_b262a318aa834fefa5a983167f8014be~mv2.png',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSH7zuf66Iqqj-7SKenu-zoPsekNuaPaWcwiQ&s'
]
WHERE LOWER(name) LIKE '%venna%' OR LOWER(name) LIKE '%vena%';

-- Update Mapro Garden images
UPDATE tourist_attractions
SET images = ARRAY[
  'https://www.mapro.com/cdn/shop/files/Mapro-Food-Park-1.jpg?v=1666437420&width=1500',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcy4diSL0nGDLcZvHIJoZsJHqonArwW2wt_A&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNsdhL8366vuEnZEw5UdOqguDOTnSd6jXjsw&s',
  'https://www.mapro.com/cdn/shop/files/WhatsApp_Image_2023-03-05_at_9.53.11_AM.jpg?v=1677993015&width=1500'
]
WHERE LOWER(name) LIKE '%mapro%';

-- Update Lingmala Waterfall images
UPDATE tourist_attractions
SET images = ARRAY[
  'https://hblimg.mmtcdn.com/content/hubble/img/Mahabaleshwar/mmt/activities/m_activities_lingmala_waterfall_2_l_331_495.jpg',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTovLgNhlpN9nFjPWiqh_8GAdt4vqFcLuq5oQ&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJMNuVNO6C5SNbapk39cKMQtXu-y-ypjtLsg&s',
  'https://mahabaleshwartourism.in/images/places-to-visit/headers/lingmala-waterfall-mahabaleshwar-tourism-entry-fee-timings-holidays-reviews-header.jpg'
]
WHERE LOWER(name) LIKE '%lingmala%';

-- Update Elephant's Head Point images
UPDATE tourist_attractions
SET images = ARRAY[
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR61_-ft6FLPFedL7MXJZqIdMsR9ZgxkR3_Uw&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSl597qbHYhMx3CcEfORLXtcvjQJ46QQti7Zw&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSGu9ekoITdbxj0ARoZM-vbgWpjIh5fOKprnQ&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUxTefn9zHIScekm8l7vYNZ4ucyUokrFq8Og&s'
]
WHERE LOWER(name) LIKE '%elephant%head%' OR LOWER(name) LIKE '%elephants%head%';

-- Update Kate's Point images
UPDATE tourist_attractions
SET images = ARRAY[
  'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/14/d9/ab/25/lrm-export-134359847325165.jpg?w=1200&h=-1&s=1',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSol9OKltisHYdClSeHrZ2ue1dCG_e6pC0Xhw&s',
  'https://mahabaleshwartourism.in/images/places-to-visit/headers/kates-point-mahabaleshwar-header-mahabaleshwar-tourism.jpg.jpg',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSg03-Cz3VEjO_Tv8yXZa1wlP1kV9I8ePlRgg&s'
]
WHERE LOWER(name) LIKE '%kate%point%' OR LOWER(name) LIKE '%kates%point%';

-- Update Arthur's Seat images
UPDATE tourist_attractions
SET images = ARRAY[
  'https://d3gw4aml0lneeh.cloudfront.net/assets/locations/16954/DkqXyCFBH4D0.jpg',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNsVW0CNqvFYTRh0tQWmpIgrreP3CLD9mvtQ&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTql8Z0fgI2m1as2p1YEGM7bFi9P-6m9nfr6A&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzIiKPLgb6nQ158yYgA5kAttYAgPxQHfiaVw&s'
]
WHERE LOWER(name) LIKE '%arthur%seat%' OR LOWER(name) LIKE '%arthurs%seat%';

-- Update Panchgani images
UPDATE tourist_attractions
SET images = ARRAY[
  'https://s7ap1.scene7.com/is/image/incredibleindia/panchgani-mahabaleshwar-maharashtra-2-attr-hero?qlt=82&ts=1726668900737',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwpV9yzYey9qsQwJKjm3bwvWVvNfUeXGEveA&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3-6o07pN0r300glz9Jf2foeqWCOY5MT73tg&s',
  'https://hblimg.mmtcdn.com/content/hubble/img/new_dest_imagemar/mmt/activities/m_Panchgani_2_l_800_1200.jpg'
]
WHERE LOWER(name) LIKE '%panchgani%';

-- Update Mahabaleshwar Temple images
UPDATE tourist_attractions
SET images = ARRAY[
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFzf_cIVV_f-coAtjXw5ZHodpsAHsSywU6sA&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqIgiDKMiUFPKKM38gTHTxQ3fN8evwHABMcA&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIc9wNd8MSAoBe464vX3GuFvYKJbq6UYnHgg&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTnQUWPU6wUPUWqguaq7A0WsnATWd1-0UanAw&s'
]
WHERE LOWER(name) LIKE '%mahabaleshwar%temple%';

-- Update Connaught Peak images
UPDATE tourist_attractions
SET images = ARRAY[
  'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2b/39/27/09/caption.jpg?w=900&h=-1&s=1',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSzu0ITzw7s5f3fARJu_pDUHiPcT7yC9wdnww&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjCye6oZnf3ZSN0JYdWJKC76fRKVltBs2zsg&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSr4OIb55xpFicXFiYkdiRzs4qb_rMuWgijlQ&s'
]
WHERE LOWER(name) LIKE '%connaught%peak%' OR LOWER(name) LIKE '%connaught%';

-- Update Bombay Point images
UPDATE tourist_attractions
SET images = ARRAY[
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBYSzy-rfpFiC0Uv5OMZMujDcO7URLiWDsSw&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDpOiYLW7-awl7ZZAxZ0CTr_iSbrDXSbWWuQ&s',
  'https://mahabaleshwartourism.in/images//tourist-places/mumbai-point-sunset-point-mahabaleshwar/mumbai-point-sunset-point-mahabaleshwar-tourism-one-day-city-tour.jpg',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMqLudx1Z9nq8M7GIS7TyryM7mKEJI1Oy-hw&s'
]
WHERE LOWER(name) LIKE '%bombay%point%' OR LOWER(name) LIKE '%mumbai%point%';

-- Update Wilson Point images
UPDATE tourist_attractions
SET images = ARRAY[
  'https://mahabaleshwartourism.in/images/places-to-visit/headers/wilson-point-sunrise-point-mahabaleshwar-tourism-entry-fee-timings-holidays-reviews-header.jpg',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQrioYAEn9uCOrVczYArlFBgxe7tsRFrT__Qw&s',
  'https://res.cloudinary.com/kmadmin/image/upload/v1727355822/kiomoi/Wilson_Point_0803.jpg',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-KgqBdbHHA_iX04x4l-cP0VojV4l7k-Rhxw&s'
]
WHERE LOWER(name) LIKE '%wilson%point%';

-- Update Table Land images
UPDATE tourist_attractions
SET images = ARRAY[
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSMulxFISV2Z5VGxWKR1iZ70EkNC-B0J2rehg&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ3i_KC5S7l9k0okslSZla-EeCgT0Eldo2Vmw&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZ3eWXdQUmnumwUR2XlBLtP39Wq8GjkxGQuQ&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmTasw5jBneGOVN2CdDIm18t57K-WQvy5drQ&s'
]
WHERE LOWER(name) LIKE '%table%land%';

-- Update Rajpuri Caves images
UPDATE tourist_attractions
SET images = ARRAY[
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxiShvFWp2LgTz22voOpXAkWNvIrY_gbbvLA&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTgeI26IiQy9RT6QCQSzlyUG0Bwlq77WfFq3A&s',
  'https://www.stone-shelter.com/places-to-visit-mahabaleshwar/rajpuri-caves-mahabaleshwar.jpg',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQa-aAaxMSZkDIdvmRePBxFDxAEVF6Q-nP3Yg&s'
]
WHERE LOWER(name) LIKE '%rajpuri%cave%';

-- Update Tapola (Mini Kashmir) images
UPDATE tourist_attractions
SET images = ARRAY[
  'https://mahabaleshwartourism.in/images//tourist-places/tapola-mini-kashmir-mahabaleshwar/tapola-mini-kashmir-mahabaleshwar-tourism-entry-ticket-boating-price.jpg',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4ncrbRgKw9ofHc3v-1wkkChj4piGuSshChA&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5GSMgMIP7B6wK_e-gdwqViCFb1yAr--LZZg&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNXbQD9hIF9-jOJ2Sb3JCtnhj68FOg3oU9zA&s'
]
WHERE LOWER(name) LIKE '%tapola%' OR LOWER(name) LIKE '%mini%kashmir%';

-- Update Chinaman's Falls images
UPDATE tourist_attractions
SET images = ARRAY[
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbJIWWFJxqDiQPfTbKAb0ykdebBG0dnhu-dg&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQKeoj0qgQJQLE90It1nrjCF7cGA4qIaI2CPA&s',
  'https://mahabaleshwartourism.in/images//tourist-places/chinamans-falls-mahabaleshwar/chinamans-falls-mahabaleshwar-photo-gallery-mahabaleshwar-tourism.jpg.jpg',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRALtfDcfN9_NZs6ijwlQQ7efe7GRsNXtebmA&s'
]
WHERE LOWER(name) LIKE '%chinaman%fall%' OR LOWER(name) LIKE '%chinamans%fall%';

-- Update Dhobi Waterfall images
UPDATE tourist_attractions
SET images = ARRAY[
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvEPGlimqkDuYCDcMG58YIMabwwCBA2JXQmw&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFG8u9cHJPDdXGRwFTKgFcJ9s0amZM01bdJQ&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9tt7Z5t3BUcO21iKAgMg-qhRrvBtSprYEMg&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5mgn8cXkLEyr5eSQockCdXstv3JX-LoWUGA&s'
]
WHERE LOWER(name) LIKE '%dhobi%waterfall%';

-- Update Lodwick Point images
UPDATE tourist_attractions
SET images = ARRAY[
  'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0d/09/77/b6/that-s-the-elephant-trunk.jpg?w=1200&h=-1&s=1',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdB7GMPN1Dwb-_2lVy9G0JrHYmw7KFX4bxDA&s',
  'https://backpackersunited.in/_next/image?url=https%3A%2F%2Fbpu-images-v1.s3.eu-north-1.amazonaws.com%2Fuploads%2F1721964627165_4.jpeg&w=1920&q=75',
  'https://res.cloudinary.com/kmadmin/image/upload/v1727439570/kiomoi/Lodwick_Point_5039.jpg'
]
WHERE LOWER(name) LIKE '%lodwick%point%' OR LOWER(name) LIKE '%lodwik%point%';

-- Update Needle Hole Point images
UPDATE tourist_attractions
SET images = ARRAY[
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdeOuOyHwFVFoFEi2mybU9IvICdBP68OviEg&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwo40hjmyGZ_5p2rXpHm4l25K6QlZ1qgSI8Q&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzyA9A_kEU7ZRgiLNP91e2Uqcf2X8xEgc1Ag&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSH-tlOK-_XN1E591zWMxxkOf2mNJuF_8D7Gw&s'
]
WHERE LOWER(name) LIKE '%needle%hole%point%';

-- Update Sunset Point images
UPDATE tourist_attractions
SET images = ARRAY[
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmQl5JydZSbCYTM9ATaCc0mCq3QBpHROK5gA&s',
  'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/17/bf/3a/37/majestic.jpg?w=900&h=500&s=1',
  'https://mahabaleshwartourism.in/images/places-to-visit/headers/mumbai-point-sunset-point-mahabaleshwar-tourism-header.jpg',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbxLl9EsxLmUqTSZO67rCsyuX4EzEP4DNioQ&s'
]
WHERE LOWER(name) LIKE '%sunset%point%';

-- Also update attractions table if it exists (for backward compatibility)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'attractions') THEN
        -- Update Pratapgad Fort images
        UPDATE attractions
        SET images = ARRAY[
          'https://tripxl.com/blog/wp-content/uploads/2024/10/Pratapgad-Fort-cp.jpg',
          'https://cdn1.tripoto.com/media/filter/tst/img/2366547/Image/1726472242_pratapgad_fort_ariel_view_copy.jpg.webp',
          'https://www.hoteldreamland.com/wp-content/uploads/2019/07/Pratapgad-Fort-2.jpg',
          'https://media.assettype.com/outlooktraveller/import/outlooktraveller/public/uploads/articles/travelnews/2017/03/Pratapgad-featured.jpg?w=1200&h=675&auto=format%2Ccompress&fit=max&enlarge=true'
        ]
        WHERE LOWER(name) LIKE '%pratapgad%' OR LOWER(name) LIKE '%pratap%';

        -- Update Venna Lake images
        UPDATE attractions
        SET images = ARRAY[
          'https://hblimg.mmtcdn.com/content/hubble/img/mahabaleshwar/mmt/activities/m_activities-mahabaleshwar-venna-lake_l_400_640.jpg',
          'https://mahabaleshwartourism.in/images/places-to-visit/headers/venna-lake-mahabaleshwar-tourism-entry-fee-timings-holidays-reviews-header.jpg',
          'https://static.wixstatic.com/media/ffb7e9_b262a318aa834fefa5a983167f8014be~mv2.png/v1/fill/w_840,h_480,al_c,lg_1,q_90/ffb7e9_b262a318aa834fefa5a983167f8014be~mv2.png',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSH7zuf66Iqqj-7SKenu-zoPsekNuaPaWcwiQ&s'
        ]
        WHERE LOWER(name) LIKE '%venna%' OR LOWER(name) LIKE '%vena%';

        -- Update Mapro Garden images
        UPDATE attractions
        SET images = ARRAY[
          'https://www.mapro.com/cdn/shop/files/Mapro-Food-Park-1.jpg?v=1666437420&width=1500',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcy4diSL0nGDLcZvHIJoZsJHqonArwW2wt_A&s',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNsdhL8366vuEnZEw5UdOqguDOTnSd6jXjsw&s',
          'https://www.mapro.com/cdn/shop/files/WhatsApp_Image_2023-03-05_at_9.53.11_AM.jpg?v=1677993015&width=1500'
        ]
        WHERE LOWER(name) LIKE '%mapro%';

        -- Update Lingmala Waterfall images
        UPDATE attractions
        SET images = ARRAY[
          'https://hblimg.mmtcdn.com/content/hubble/img/Mahabaleshwar/mmt/activities/m_activities_lingmala_waterfall_2_l_331_495.jpg',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTovLgNhlpN9nFjPWiqh_8GAdt4vqFcLuq5oQ&s',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJMNuVNO6C5SNbapk39cKMQtXu-y-ypjtLsg&s',
          'https://mahabaleshwartourism.in/images/places-to-visit/headers/lingmala-waterfall-mahabaleshwar-tourism-entry-fee-timings-holidays-reviews-header.jpg'
        ]
        WHERE LOWER(name) LIKE '%lingmala%';

        -- Update Elephant's Head Point images
        UPDATE attractions
        SET images = ARRAY[
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR61_-ft6FLPFedL7MXJZqIdMsR9ZgxkR3_Uw&s',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSl597qbHYhMx3CcEfORLXtcvjQJ46QQti7Zw&s',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSGu9ekoITdbxj0ARoZM-vbgWpjIh5fOKprnQ&s',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUxTefn9zHIScekm8l7vYNZ4ucyUokrFq8Og&s'
        ]
        WHERE LOWER(name) LIKE '%elephant%head%' OR LOWER(name) LIKE '%elephants%head%';

        -- Update Kate's Point images
        UPDATE attractions
        SET images = ARRAY[
          'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/14/d9/ab/25/lrm-export-134359847325165.jpg?w=1200&h=-1&s=1',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSol9OKltisHYdClSeHrZ2ue1dCG_e6pC0Xhw&s',
          'https://mahabaleshwartourism.in/images/places-to-visit/headers/kates-point-mahabaleshwar-header-mahabaleshwar-tourism.jpg.jpg',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSg03-Cz3VEjO_Tv8yXZa1wlP1kV9I8ePlRgg&s'
        ]
        WHERE LOWER(name) LIKE '%kate%point%' OR LOWER(name) LIKE '%kates%point%';

        -- Update Arthur's Seat images
        UPDATE attractions
        SET images = ARRAY[
          'https://d3gw4aml0lneeh.cloudfront.net/assets/locations/16954/DkqXyCFBH4D0.jpg',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNsVW0CNqvFYTRh0tQWmpIgrreP3CLD9mvtQ&s',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTql8Z0fgI2m1as2p1YEGM7bFi9P-6m9nfr6A&s',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzIiKPLgb6nQ158yYgA5kAttYAgPxQHfiaVw&s'
        ]
        WHERE LOWER(name) LIKE '%arthur%seat%' OR LOWER(name) LIKE '%arthurs%seat%';

        -- Update Panchgani images
        UPDATE attractions
        SET images = ARRAY[
          'https://s7ap1.scene7.com/is/image/incredibleindia/panchgani-mahabaleshwar-maharashtra-2-attr-hero?qlt=82&ts=1726668900737',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwpV9yzYey9qsQwJKjm3bwvWVvNfUeXGEveA&s',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3-6o07pN0r300glz9Jf2foeqWCOY5MT73tg&s',
          'https://hblimg.mmtcdn.com/content/hubble/img/new_dest_imagemar/mmt/activities/m_Panchgani_2_l_800_1200.jpg'
        ]
        WHERE LOWER(name) LIKE '%panchgani%';

        -- Update Mahabaleshwar Temple images
        UPDATE attractions
        SET images = ARRAY[
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFzf_cIVV_f-coAtjXw5ZHodpsAHsSywU6sA&s',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqIgiDKMiUFPKKM38gTHTxQ3fN8evwHABMcA&s',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIc9wNd8MSAoBe464vX3GuFvYKJbq6UYnHgg&s',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTnQUWPU6wUPUWqguaq7A0WsnATWd1-0UanAw&s'
        ]
        WHERE LOWER(name) LIKE '%mahabaleshwar%temple%';

        -- Update Connaught Peak images
        UPDATE attractions
        SET images = ARRAY[
          'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2b/39/27/09/caption.jpg?w=900&h=-1&s=1',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSzu0ITzw7s5f3fARJu_pDUHiPcT7yC9wdnww&s',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjCye6oZnf3ZSN0JYdWJKC76fRKVltBs2zsg&s',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSr4OIb55xpFicXFiYkdiRzs4qb_rMuWgijlQ&s'
        ]
        WHERE LOWER(name) LIKE '%connaught%peak%' OR LOWER(name) LIKE '%connaught%';

        -- Update Bombay Point images
        UPDATE attractions
        SET images = ARRAY[
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBYSzy-rfpFiC0Uv5OMZMujDcO7URLiWDsSw&s',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDpOiYLW7-awl7ZZAxZ0CTr_iSbrDXSbWWuQ&s',
          'https://mahabaleshwartourism.in/images//tourist-places/mumbai-point-sunset-point-mahabaleshwar/mumbai-point-sunset-point-mahabaleshwar-tourism-one-day-city-tour.jpg',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMqLudx1Z9nq8M7GIS7TyryM7mKEJI1Oy-hw&s'
        ]
        WHERE LOWER(name) LIKE '%bombay%point%' OR LOWER(name) LIKE '%mumbai%point%';

        -- Update Wilson Point images
        UPDATE attractions
        SET images = ARRAY[
          'https://mahabaleshwartourism.in/images/places-to-visit/headers/wilson-point-sunrise-point-mahabaleshwar-tourism-entry-fee-timings-holidays-reviews-header.jpg',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQrioYAEn9uCOrVczYArlFBgxe7tsRFrT__Qw&s',
          'https://res.cloudinary.com/kmadmin/image/upload/v1727355822/kiomoi/Wilson_Point_0803.jpg',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-KgqBdbHHA_iX04x4l-cP0VojV4l7k-Rhxw&s'
        ]
        WHERE LOWER(name) LIKE '%wilson%point%';

        -- Update Table Land images
        UPDATE attractions
        SET images = ARRAY[
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSMulxFISV2Z5VGxWKR1iZ70EkNC-B0J2rehg&s',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ3i_KC5S7l9k0okslSZla-EeCgT0Eldo2Vmw&s',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZ3eWXdQUmnumwUR2XlBLtP39Wq8GjkxGQuQ&s',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmTasw5jBneGOVN2CdDIm18t57K-WQvy5drQ&s'
        ]
        WHERE LOWER(name) LIKE '%table%land%';

        -- Update Rajpuri Caves images
        UPDATE attractions
        SET images = ARRAY[
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxiShvFWp2LgTz22voOpXAkWNvIrY_gbbvLA&s',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTgeI26IiQy9RT6QCQSzlyUG0Bwlq77WfFq3A&s',
          'https://www.stone-shelter.com/places-to-visit-mahabaleshwar/rajpuri-caves-mahabaleshwar.jpg',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQa-aAaxMSZkDIdvmRePBxFDxAEVF6Q-nP3Yg&s'
        ]
        WHERE LOWER(name) LIKE '%rajpuri%cave%';

        -- Update Tapola (Mini Kashmir) images
        UPDATE attractions
        SET images = ARRAY[
          'https://mahabaleshwartourism.in/images//tourist-places/tapola-mini-kashmir-mahabaleshwar/tapola-mini-kashmir-mahabaleshwar-tourism-entry-ticket-boating-price.jpg',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4ncrbRgKw9ofHc3v-1wkkChj4piGuSshChA&s',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5GSMgMIP7B6wK_e-gdwqViCFb1yAr--LZZg&s',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNXbQD9hIF9-jOJ2Sb3JCtnhj68FOg3oU9zA&s'
        ]
        WHERE LOWER(name) LIKE '%tapola%' OR LOWER(name) LIKE '%mini%kashmir%';

        -- Update Chinaman's Falls images
        UPDATE attractions
        SET images = ARRAY[
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbJIWWFJxqDiQPfTbKAb0ykdebBG0dnhu-dg&s',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQKeoj0qgQJQLE90It1nrjCF7cGA4qIaI2CPA&s',
          'https://mahabaleshwartourism.in/images//tourist-places/chinamans-falls-mahabaleshwar/chinamans-falls-mahabaleshwar-photo-gallery-mahabaleshwar-tourism.jpg.jpg',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRALtfDcfN9_NZs6ijwlQQ7efe7GRsNXtebmA&s'
        ]
        WHERE LOWER(name) LIKE '%chinaman%fall%' OR LOWER(name) LIKE '%chinamans%fall%';

        -- Update Dhobi Waterfall images
        UPDATE attractions
        SET images = ARRAY[
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvEPGlimqkDuYCDcMG58YIMabwwCBA2JXQmw&s',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFG8u9cHJPDdXGRwFTKgFcJ9s0amZM01bdJQ&s',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9tt7Z5t3BUcO21iKAgMg-qhRrvBtSprYEMg&s',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5mgn8cXkLEyr5eSQockCdXstv3JX-LoWUGA&s'
        ]
        WHERE LOWER(name) LIKE '%dhobi%waterfall%';

        -- Update Lodwick Point images
        UPDATE attractions
        SET images = ARRAY[
          'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0d/09/77/b6/that-s-the-elephant-trunk.jpg?w=1200&h=-1&s=1',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdB7GMPN1Dwb-_2lVy9G0JrHYmw7KFX4bxDA&s',
          'https://backpackersunited.in/_next/image?url=https%3A%2F%2Fbpu-images-v1.s3.eu-north-1.amazonaws.com%2Fuploads%2F1721964627165_4.jpeg&w=1920&q=75',
          'https://res.cloudinary.com/kmadmin/image/upload/v1727439570/kiomoi/Lodwick_Point_5039.jpg'
        ]
        WHERE LOWER(name) LIKE '%lodwick%point%' OR LOWER(name) LIKE '%lodwik%point%';

        -- Update Needle Hole Point images
        UPDATE attractions
        SET images = ARRAY[
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdeOuOyHwFVFoFEi2mybU9IvICdBP68OviEg&s',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwo40hjmyGZ_5p2rXpHm4l25K6QlZ1qgSI8Q&s',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzyA9A_kEU7ZRgiLNP91e2Uqcf2X8xEgc1Ag&s',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSH-tlOK-_XN1E591zWMxxkOf2mNJuF_8D7Gw&s'
        ]
        WHERE LOWER(name) LIKE '%needle%hole%point%';

        -- Update Sunset Point images
        UPDATE attractions
        SET images = ARRAY[
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmQl5JydZSbCYTM9ATaCc0mCq3QBpHROK5gA&s',
          'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/17/bf/3a/37/majestic.jpg?w=900&h=500&s=1',
          'https://mahabaleshwartourism.in/images/places-to-visit/headers/mumbai-point-sunset-point-mahabaleshwar-tourism-header.jpg',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbxLl9EsxLmUqTSZO67rCsyuX4EzEP4DNioQ&s'
        ]
        WHERE LOWER(name) LIKE '%sunset%point%';
    END IF;
END $$;

-- Verify the updates
SELECT name, images FROM tourist_attractions 
WHERE LOWER(name) LIKE '%pratapgad%' OR LOWER(name) LIKE '%pratap%' 
   OR LOWER(name) LIKE '%venna%' OR LOWER(name) LIKE '%vena%'
   OR LOWER(name) LIKE '%mapro%'
   OR LOWER(name) LIKE '%lingmala%'
   OR LOWER(name) LIKE '%elephant%head%' OR LOWER(name) LIKE '%elephants%head%'
   OR LOWER(name) LIKE '%kate%point%' OR LOWER(name) LIKE '%kates%point%'
   OR LOWER(name) LIKE '%arthur%seat%' OR LOWER(name) LIKE '%arthurs%seat%'
   OR LOWER(name) LIKE '%panchgani%'
   OR LOWER(name) LIKE '%mahabaleshwar%temple%'
   OR LOWER(name) LIKE '%connaught%peak%' OR LOWER(name) LIKE '%connaught%'
   OR LOWER(name) LIKE '%bombay%point%' OR LOWER(name) LIKE '%mumbai%point%'
   OR LOWER(name) LIKE '%wilson%point%'
   OR LOWER(name) LIKE '%table%land%'
   OR LOWER(name) LIKE '%rajpuri%cave%'
   OR LOWER(name) LIKE '%tapola%' OR LOWER(name) LIKE '%mini%kashmir%'
   OR LOWER(name) LIKE '%chinaman%fall%' OR LOWER(name) LIKE '%chinamans%fall%'
   OR LOWER(name) LIKE '%dhobi%waterfall%'
   OR LOWER(name) LIKE '%lodwick%point%' OR LOWER(name) LIKE '%lodwik%point%'
   OR LOWER(name) LIKE '%needle%hole%point%'
   OR LOWER(name) LIKE '%sunset%point%';
