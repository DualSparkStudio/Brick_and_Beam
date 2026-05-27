// Test script to demonstrate secure slug generation
import crypto from 'crypto';

// Function to generate secure slug from room name and ID
function generateSecureSlug(name, id) {
  // Create a hash of the room name and ID with a secret
  const secret = process.env.VITE_SLUG_SECRET || 'default-secret-key';
  const hash = crypto.createHash('sha256')
    .update(`${name}-${id}-${secret}`)
    .digest('hex')
    .substring(0, 12);
  
  // Create a clean slug from the name
  const cleanName = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim()
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
  
  // Combine clean name with hash for security
  return `${cleanName}-${hash}`;
}

// Test examples

const testRooms = [
  { name: 'Room No. 1', id: 1 },
  { name: 'Room No. 2', id: 2 },
  { name: 'Deluxe Suite', id: 3 },
  { name: 'Premium Villa', id: 4 },
  { name: 'Ocean View Room', id: 5 }
]

testRooms.forEach(room => {
  const secureSlug = generateSecureSlug(room.name, room.id)
})

