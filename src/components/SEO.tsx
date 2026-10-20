import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

const SEO: React.FC<SEOProps> = ({
  title = "Brick and Beam - Luxury Villa Stay",
  description = "Experience luxury at Brick and Beam, a private 4BHK villa in Bhilar, Mahabaleshwar featuring a private pool, valley views, and refined premium comforts.",
  keywords = "Brick and Beam, luxury villa Mahabaleshwar, 4BHK villa Bhilar, private pool villa, Panchgani villa stay, luxury homestay Maharashtra, holiday villa booking",
  image = "https://brickandbeamvilla.netlify.app/images/hero/cover-dusk.png",
  url = "https://brickandbeamvilla.netlify.app",
  type = "website"
}) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Brick and Beam" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Canonical */}
      <link rel="canonical" href={url} />
    </Helmet>
  );
};

export default SEO;
