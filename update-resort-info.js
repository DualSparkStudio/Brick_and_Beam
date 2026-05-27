// Script to update resort information across the codebase
// Run with: node update-resort-info.js

const fs = require('fs');
const path = require('path');

const replacements = [
  {
    old: 'Grand Valley Resort Bhilar Annex - A Hilltop Heaven',
    new: 'Resort Booking System'
  },
  {
    old: 'Grand Valley Resort',
    new: 'Resort Booking System'
  },
  {
    old: 'Bhilar Annex - A Hilltop Heaven',
    new: 'Your Perfect Getaway'
  },
  {
    old: 'Grand Valley Resort Team',
    new: 'Resort Booking System'
  }
];

const filesToUpdate = [
  'src/components/Layout.tsx',
  'src/pages/Home.tsx',
  'src/pages/About.tsx',
  'src/pages/Contact.tsx',
  'src/pages/Features.tsx',
  'src/pages/Gallery.tsx',
  'src/pages/TouristAttractions.tsx',
  'index.html'
];

function updateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;

    replacements.forEach(({ old, new: newText }) => {
      if (content.includes(old)) {
        content = content.replace(new RegExp(old, 'g'), newText);
        updated = true;
      }
    });

    if (updated) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Updated: ${filePath}`);
    } else {
      console.log(`- No changes: ${filePath}`);
    }
  } catch (error) {
    console.error(`✗ Error updating ${filePath}:`, error.message);
  }
}

console.log('Starting resort information update...\n');

filesToUpdate.forEach(updateFile);

console.log('\nUpdate complete!');
