#!/usr/bin/env node

/**
 * Script to help submit sitemap to Google Search Console
 * 
 * Instructions:
 * 1. Go to https://search.google.com/search-console
 * 2. Add your property (riverbreezehomestay.com)
 * 3. Verify ownership (usually via DNS record or HTML file)
 * 4. Once verified, go to Sitemaps section
 * 5. Submit: https://riverbreezehomestay.com/sitemap.xml
 * 
 * This script will also help you check if your sitemap is accessible
 */

const https = require('https');
const http = require('http');

const DOMAIN = 'riverbreezehomestay.com';
const SITEMAP_URL = `https://${DOMAIN}/sitemap.xml`;
const ROBOTS_URL = `https://${DOMAIN}/robots.txt`;


// Check if sitemap is accessible
function checkUrl(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    client.get(url, (res) => {
      if (res.statusCode === 200) {
        resolve(true);
      } else {
        resolve(false);
      }
    }).on('error', (err) => {
      resolve(false);
    });
  });
}

async function runChecks() {
  
  const sitemapAccessible = await checkUrl(SITEMAP_URL);
  const robotsAccessible = await checkUrl(ROBOTS_URL);
  
  
  if (!sitemapAccessible) {
  }
  
  if (!robotsAccessible) {
  }
  
  if (sitemapAccessible && robotsAccessible) {
  }
  
}

runChecks().catch(() => {});
