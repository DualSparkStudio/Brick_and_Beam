// Test script to demonstrate cryptic Instagram-style URLs
import crypto from 'crypto';

// Function to generate cryptic slug like Instagram's igsh parameter
function generateCrypticSlug(name, id) {
  // Create a completely random string like Instagram's igsh parameter
  const randomString = crypto.randomUUID().replace(/-/g, '').substring(0, 22);
  
  // Create a hash of the room data for additional security
  const secret = process.env.VITE_SLUG_SECRET || 'default-secret-key';
  const hash = crypto.createHash('sha256')
    .update(`${name}-${id}-${secret}-${Date.now()}`)
    .digest('hex')
    .substring(0, 16);
  
  // Combine random string with hash for maximum security
  return `${randomString}${hash}`;
}

// Test examples

const testRooms = [
  { name: 'Deluxe Suite', id: 1 },
  { name: 'Premium Villa', id: 2 },
  { name: 'Ocean View Room', id: 3 },
  { name: 'Garden Cottage', id: 4 },
  { name: 'Mountain Lodge', id: 5 }
]

testRooms.forEach(room => {
  const crypticId = generateCrypticSlug(room.name, room.id)
  const url = `https://riverbreezehomestay.com/room/${room.name}?roomid=${crypticId}`
  
})


