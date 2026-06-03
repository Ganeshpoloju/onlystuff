require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

// Free Unsplash images — stable source URLs, no API key needed
const PHOTOS = {
  'Crispy Veg Manchurian (Evening)': [
    'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=600&q=80',
    'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80',
  ],
  'Paneer Tikka (Tandoor)': [
    'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&q=80',
    'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&q=80',
  ],
  'Samosa Platter (Homemade)': [
    'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80',
    'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600&q=80',
  ],
  'Corn & Cheese Cutlets': [
    'https://images.unsplash.com/photo-1625938144755-652e08e359b7?w=600&q=80',
    'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=600&q=80',
  ],
  'Mirchi Bajji (Hyderabadi)': [
    'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80',
    'https://images.unsplash.com/photo-1574484284002-952d92456975?w=600&q=80',
  ],
  'Chicken 65 (Restaurant Style)': [
    'https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?w=600&q=80',
    'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=600&q=80',
  ],
  'Mutton Seekh Kebab': [
    'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&q=80',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80',
  ],
  'Fish Fry (Rohu / Pomfret)': [
    'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=600&q=80',
    'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80',
  ],
  'Chicken Wings (BBQ & Peri-Peri)': [
    'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=600&q=80',
    'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&q=80',
  ],
  'Prawns Fry (Tawa Style)': [
    'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80',
    'https://images.unsplash.com/photo-1559742811-822873691df8?w=600&q=80',
  ],
};

async function main() {
  console.log('📸 Adding photos to seeded listings...\n');
  let updated = 0;
  for (const [title, photos] of Object.entries(PHOTOS)) {
    const result = await p.listing.updateMany({
      where: { title, status: 'active' },
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
