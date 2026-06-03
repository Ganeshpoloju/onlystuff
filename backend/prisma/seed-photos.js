require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

// Free Unsplash images — stable source URLs, no API key needed
const PHOTOS = {
  'Fresh Alphonso Mangoes': [
    'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&q=80',
    'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=600&q=80',
  ],
  'Organic Bananas (Yelakki)': [
    'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&q=80',
    'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=600&q=80',
  ],
  'Mixed Seasonal Fruit Basket': [
    'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&q=80',
    'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=600&q=80',
  ],
  'Fresh Papaya (Whole)': [
    'https://images.unsplash.com/photo-1617112848923-cc2234396a8d?w=600&q=80',
    'https://images.unsplash.com/photo-1526318472351-c75fcf070305?w=600&q=80',
  ],
  'Organic Vegetables Box (Weekly)': [
    'https://images.unsplash.com/photo-1557844352-761f2565b576?w=600&q=80',
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&q=80',
  ],
  'Farm-Fresh Tomatoes': [
    'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=600&q=80',
    'https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?w=600&q=80',
  ],
  'Spinach & Leafy Greens Bundle': [
    'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&q=80',
    'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=600&q=80',
  ],
  'Onions (Nashik Red)': [
    'https://images.unsplash.com/photo-1508747703725-719777637510?w=600&q=80',
    'https://images.unsplash.com/photo-1582515073490-39981397c445?w=600&q=80',
  ],
  'Potatoes (Agra / Jyoti)': [
    'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&q=80',
    'https://images.unsplash.com/photo-1590165482129-1b8b27698780?w=600&q=80',
  ],
  'Green Chillies (Guntur)': [
    'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=600&q=80',
    'https://images.unsplash.com/photo-1598512752271-33f913a5af13?w=600&q=80',
  ],
};

async function main() {
  console.log('📸 Adding photos to seeded listings...\n');
  let updated = 0;
  for (const [title, photos] of Object.entries(PHOTOS)) {
    const result = await p.listing.updateMany({
      where: { title, photos: { equals: [] } },
      data: { photos },
    });
    if (result.count > 0) {
      console.log(`  ✅ ${title} — ${photos.length} photos`);
      updated++;
    } else {
      console.log(`  ⚠️  ${title} — skipped (already has photos or not found)`);
    }
  }
  console.log(`\n✅ Updated ${updated} listings`);
  await p.$disconnect();
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
