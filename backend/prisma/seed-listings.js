require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

const USER_EMAIL = 'poloju.ganeshchary@gmail.com';
const COMMUNITY_NAME = 'Prestige High Fields';

const LISTINGS = [
  // ─── Fruits ────────────────────────────────────────────────────────────────
  {
    title: 'Fresh Alphonso Mangoes',
    description: 'Farm-fresh Alphonso mangoes from Ratnagiri. Sweet, pulpy, no chemicals. Harvested twice a week and delivered fresh. Perfect for eating, milkshakes, and aamras. Packaging: small cardboard trays.\n\nAvailable April–June season only.',
    category: 'Groceries & Produce',
    condition: null,
    type: 'product',
    pricingModel: 'slab',
    moq: 2,
    stockQty: 50,
    fulfillment: { method: 'both' },
    visibility: 'everyone',
    slabs: [
      { fromQty: 2,  toQty: 4,  pricePerUnit: 180, position: 0 },
      { fromQty: 5,  toQty: 9,  pricePerUnit: 160, position: 1 },
      { fromQty: 10, toQty: 19, pricePerUnit: 140, position: 2 },
      { fromQty: 20, toQty: null, pricePerUnit: 120, position: 3 },
    ],
  },
  {
    title: 'Organic Bananas (Yelakki)',
    description: 'Yelakki bananas — small, sweet, and organic. Grown without pesticides in Karnataka. Great for kids and daily snacking. We source directly from the farmer.\n\nSold by the dozen.',
    category: 'Groceries & Produce',
    condition: null,
    type: 'product',
    pricingModel: 'slab',
    moq: 1,
    stockQty: 100,
    fulfillment: { method: 'both' },
    visibility: 'everyone',
    slabs: [
      { fromQty: 1,  toQty: 2,  pricePerUnit: 60,  position: 0 },
      { fromQty: 3,  toQty: 5,  pricePerUnit: 55,  position: 1 },
      { fromQty: 6,  toQty: null, pricePerUnit: 48, position: 2 },
    ],
  },
  {
    title: 'Mixed Seasonal Fruit Basket',
    description: 'Curated seasonal fruit basket — typically includes apples, pears, pomegranates, sapota, and a surprise fruit depending on the week. Sourced from local wholesale market every Monday and Thursday.\n\nGreat for gifting or weekly household stock.',
    category: 'Groceries & Produce',
    condition: null,
    type: 'product',
    pricingModel: 'slab',
    moq: 1,
    stockQty: 20,
    fulfillment: { method: 'both' },
    visibility: 'everyone',
    slabs: [
      { fromQty: 1,  toQty: 2,  pricePerUnit: 350, position: 0 },
      { fromQty: 3,  toQty: 5,  pricePerUnit: 320, position: 1 },
      { fromQty: 6,  toQty: null, pricePerUnit: 290, position: 2 },
    ],
  },
  {
    title: 'Fresh Papaya (Whole)',
    description: 'Ripe, ready-to-eat papayas. Each piece weighs between 800g and 1.2kg. Great for breakfast, salads, and smoothies. Sourced 3 times a week to ensure freshness.\n\nPrice is per piece (not per kg).',
    category: 'Groceries & Produce',
    condition: null,
    type: 'product',
    pricingModel: 'slab',
    moq: 1,
    stockQty: 30,
    fulfillment: { method: 'both' },
    visibility: 'everyone',
    slabs: [
      { fromQty: 1,  toQty: 3,  pricePerUnit: 80,  position: 0 },
      { fromQty: 4,  toQty: 9,  pricePerUnit: 70,  position: 1 },
      { fromQty: 10, toQty: null, pricePerUnit: 60, position: 2 },
    ],
  },

  // ─── Vegetables ────────────────────────────────────────────────────────────
  {
    title: 'Organic Vegetables Box (Weekly)',
    description: 'Weekly subscription box of 8–10 seasonal organic vegetables. Typical contents: tomatoes, onions, carrots, beans, spinach, bottle gourd, capsicum, brinjal. No pesticides, sourced from certified organic farms in Nalgonda.\n\nAvailable every Saturday morning.',
    category: 'Groceries & Produce',
    condition: null,
    type: 'product',
    pricingModel: 'slab',
    moq: 1,
    stockQty: 25,
    fulfillment: { method: 'both' },
    visibility: 'everyone',
    slabs: [
      { fromQty: 1,  toQty: 2,  pricePerUnit: 280, position: 0 },
      { fromQty: 3,  toQty: 5,  pricePerUnit: 250, position: 1 },
      { fromQty: 6,  toQty: 9,  pricePerUnit: 220, position: 2 },
      { fromQty: 10, toQty: null, pricePerUnit: 190, position: 3 },
    ],
  },
  {
    title: 'Farm-Fresh Tomatoes',
    description: 'Desi tomatoes — not the bland hybrid variety. These are country tomatoes with deep red colour and full flavour. Perfect for gravies and chutneys. Sourced from Kothapally farms directly.\n\nSold by kg.',
    category: 'Groceries & Produce',
    condition: null,
    type: 'product',
    pricingModel: 'slab',
    moq: 1,
    stockQty: 80,
    fulfillment: { method: 'both' },
    visibility: 'everyone',
    slabs: [
      { fromQty: 1,  toQty: 4,  pricePerUnit: 40,  position: 0 },
      { fromQty: 5,  toQty: 9,  pricePerUnit: 35,  position: 1 },
      { fromQty: 10, toQty: 19, pricePerUnit: 30,  position: 2 },
      { fromQty: 20, toQty: null, pricePerUnit: 25, position: 3 },
    ],
  },
  {
    title: 'Spinach & Leafy Greens Bundle',
    description: 'Fresh cut spinach, methi, and coriander bundles. Cut fresh every morning and delivered within 3 hours. Washed and cleaned, ready to cook.\n\nBundle = 250g spinach + 100g methi + 50g coriander.',
    category: 'Groceries & Produce',
    condition: null,
    type: 'product',
    pricingModel: 'slab',
    moq: 1,
    stockQty: 40,
    fulfillment: { method: 'both' },
    visibility: 'everyone',
    slabs: [
      { fromQty: 1,  toQty: 2,  pricePerUnit: 55,  position: 0 },
      { fromQty: 3,  toQty: 6,  pricePerUnit: 48,  position: 1 },
      { fromQty: 7,  toQty: null, pricePerUnit: 40, position: 2 },
    ],
  },
  {
    title: 'Onions (Nashik Red)',
    description: 'Premium Nashik red onions — sharp, pungent, long shelf life. Sourced in bulk directly from Nashik traders, so pricing is well below market rate when you buy in quantity.\n\nSold by kg. Minimum 2kg per order.',
    category: 'Groceries & Produce',
    condition: null,
    type: 'product',
    pricingModel: 'slab',
    moq: 2,
    stockQty: 200,
    fulfillment: { method: 'both' },
    visibility: 'everyone',
    slabs: [
      { fromQty: 2,  toQty: 4,  pricePerUnit: 38,  position: 0 },
      { fromQty: 5,  toQty: 9,  pricePerUnit: 32,  position: 1 },
      { fromQty: 10, toQty: 24, pricePerUnit: 27,  position: 2 },
      { fromQty: 25, toQty: null, pricePerUnit: 22, position: 3 },
    ],
  },
  {
    title: 'Potatoes (Agra / Jyoti)',
    description: 'Starchy Jyoti variety potatoes from Agra — the go-to for biryani, curry, and fries. Clean, sorted, and bagged. No mud, no waste. Available year-round.\n\nSold by kg. Great for group buys — price drops significantly at 10kg+.',
    category: 'Groceries & Produce',
    condition: null,
    type: 'product',
    pricingModel: 'slab',
    moq: 2,
    stockQty: 150,
    fulfillment: { method: 'both' },
    visibility: 'everyone',
    slabs: [
      { fromQty: 2,  toQty: 4,  pricePerUnit: 35,  position: 0 },
      { fromQty: 5,  toQty: 9,  pricePerUnit: 30,  position: 1 },
      { fromQty: 10, toQty: 24, pricePerUnit: 25,  position: 2 },
      { fromQty: 25, toQty: null, pricePerUnit: 20, position: 3 },
    ],
  },
  {
    title: 'Green Chillies (Guntur)',
    description: 'Fiery Guntur green chillies — for those who like their food with a real kick. Freshly sourced from Guntur mandis twice a week. Available in small or bulk quantities.\n\nSold by 100g packs.',
    category: 'Groceries & Produce',
    condition: null,
    type: 'product',
    pricingModel: 'slab',
    moq: 1,
    stockQty: 60,
    fulfillment: { method: 'both' },
    visibility: 'everyone',
    slabs: [
      { fromQty: 1,  toQty: 3,  pricePerUnit: 20,  position: 0 },
      { fromQty: 4,  toQty: 9,  pricePerUnit: 16,  position: 1 },
      { fromQty: 10, toQty: null, pricePerUnit: 13, position: 2 },
    ],
  },
];

function toSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function main() {
  console.log('🌱 Seeding listings for poloju.ganeshchary@gmail.com...\n');

  // Find user
  const user = await p.user.findUnique({ where: { email: USER_EMAIL } });
  if (!user) { console.error('User not found'); process.exit(1); }

  // Assign community if not already set
  const community = await p.community.findFirst({ where: { name: COMMUNITY_NAME, status: 'active' } });
  if (!community) { console.error('Community not found'); process.exit(1); }

  if (!user.communityId) {
    await p.user.update({ where: { id: user.id }, data: { communityId: community.id } });
    console.log(`✅ Assigned user to ${COMMUNITY_NAME}`);
  } else {
    console.log(`ℹ️  User already in community: ${user.communityId}`);
  }

  let created = 0;
  for (const item of LISTINGS) {
    const { slabs, ...listingData } = item;

    const listing = await p.listing.create({
      data: {
        ...listingData,
        sellerId: user.id,
        communityId: community.id,
        photos: [],
        status: 'active',
        fulfillment: listingData.fulfillment,
      },
    });

    await p.priceSlab.createMany({
      data: slabs.map(s => ({ ...s, listingId: listing.id })),
    });

    console.log(`  ✅ ${listing.title} — ${slabs.length} price tiers`);
    created++;
  }

  console.log(`\n✅ Seeded ${created} listings`);
  console.log(`   Seller: ${user.name} (${USER_EMAIL})`);
  console.log(`   Community: ${COMMUNITY_NAME}`);
}

main()
  .catch(e => { console.error('❌', e.message); process.exit(1); })
  .finally(() => p.$disconnect());
