require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

const USER_EMAIL = 'poloju.ganeshchary@gmail.com';
const COMMUNITY_NAME = 'Prestige High Fields';

const LISTINGS = [
  // ─── Veg Starters ──────────────────────────────────────────────────────────
  {
    title: 'Crispy Veg Manchurian (Evening)',
    description: 'Crispy fried veg Manchurian balls tossed in a tangy Indo-Chinese sauce. Made fresh every evening from 5pm–8pm. Each serving is 8 pieces.\n\nOrder by 4:30pm for evening delivery. Best enjoyed hot — we pack in heat-retaining containers.',
    category: 'Groceries & Produce',
    type: 'product',
    pricingModel: 'slab',
    moq: 1,
    stockQty: 30,
    fulfillment: { method: 'both' },
    visibility: 'everyone',
    slabs: [
      { fromQty: 1,  toQty: 2,  pricePerUnit: 120, position: 0 },
      { fromQty: 3,  toQty: 5,  pricePerUnit: 110, position: 1 },
      { fromQty: 6,  toQty: 9,  pricePerUnit: 100, position: 2 },
      { fromQty: 10, toQty: null, pricePerUnit: 90, position: 3 },
    ],
  },
  {
    title: 'Paneer Tikka (Tandoor)',
    description: 'Marinated cottage cheese cubes grilled in a tandoor oven. Served with mint chutney and onion rings. Each plate is 6 pieces of paneer tikka.\n\nMade to order — allow 20 minutes. Available 5pm–9pm daily.',
    category: 'Groceries & Produce',
    type: 'product',
    pricingModel: 'slab',
    moq: 1,
    stockQty: 25,
    fulfillment: { method: 'both' },
    visibility: 'everyone',
    slabs: [
      { fromQty: 1,  toQty: 2,  pricePerUnit: 180, position: 0 },
      { fromQty: 3,  toQty: 5,  pricePerUnit: 160, position: 1 },
      { fromQty: 6,  toQty: null, pricePerUnit: 140, position: 2 },
    ],
  },
  {
    title: 'Samosa Platter (Homemade)',
    description: 'Classic Hyderabadi-style samosas with a spiced potato and pea filling. Fried fresh every evening. Served with tamarind chutney and green chutney.\n\nEach plate = 4 samosas. Made in a home kitchen — no preservatives, no frozen filling.',
    category: 'Groceries & Produce',
    type: 'product',
    pricingModel: 'slab',
    moq: 1,
    stockQty: 50,
    fulfillment: { method: 'both' },
    visibility: 'everyone',
    slabs: [
      { fromQty: 1,  toQty: 3,  pricePerUnit: 60,  position: 0 },
      { fromQty: 4,  toQty: 8,  pricePerUnit: 55,  position: 1 },
      { fromQty: 9,  toQty: null, pricePerUnit: 48, position: 2 },
    ],
  },
  {
    title: 'Corn & Cheese Cutlets',
    description: 'Golden-fried corn and cheese cutlets — crispy outside, gooey inside. A crowd favourite for kids and adults alike. Each serving is 4 cutlets with sriracha mayo dip.\n\nAvailable weekends 4pm–7pm. Pre-order recommended for groups.',
    category: 'Groceries & Produce',
    type: 'product',
    pricingModel: 'slab',
    moq: 1,
    stockQty: 20,
    fulfillment: { method: 'both' },
    visibility: 'everyone',
    slabs: [
      { fromQty: 1,  toQty: 2,  pricePerUnit: 90,  position: 0 },
      { fromQty: 3,  toQty: 6,  pricePerUnit: 80,  position: 1 },
      { fromQty: 7,  toQty: null, pricePerUnit: 70, position: 2 },
    ],
  },
  {
    title: 'Mirchi Bajji (Hyderabadi)',
    description: 'The iconic Hyderabadi street snack — long green chillies stuffed with tangy tamarind-onion filling, dipped in besan batter and deep fried. Served hot with coconut chutney.\n\nEach serving = 4 bajjis. Evenings only, 4pm–8pm.',
    category: 'Groceries & Produce',
    type: 'product',
    pricingModel: 'slab',
    moq: 1,
    stockQty: 40,
    fulfillment: { method: 'both' },
    visibility: 'everyone',
    slabs: [
      { fromQty: 1,  toQty: 3,  pricePerUnit: 50,  position: 0 },
      { fromQty: 4,  toQty: 8,  pricePerUnit: 45,  position: 1 },
      { fromQty: 9,  toQty: null, pricePerUnit: 40, position: 2 },
    ],
  },

  // ─── Non-Veg Starters ──────────────────────────────────────────────────────
  {
    title: 'Chicken 65 (Restaurant Style)',
    description: 'Spicy, crispy Andhra-style Chicken 65 — deep fried with curry leaves, dried chillies, and a signature red marinade. Each serving is 8 pieces.\n\nMade in a professional kitchen. Available daily 5pm–9pm. Order before 4pm for guaranteed delivery.',
    category: 'Groceries & Produce',
    type: 'product',
    pricingModel: 'slab',
    moq: 1,
    stockQty: 30,
    fulfillment: { method: 'both' },
    visibility: 'everyone',
    slabs: [
      { fromQty: 1,  toQty: 2,  pricePerUnit: 220, position: 0 },
      { fromQty: 3,  toQty: 5,  pricePerUnit: 200, position: 1 },
      { fromQty: 6,  toQty: 9,  pricePerUnit: 180, position: 2 },
      { fromQty: 10, toQty: null, pricePerUnit: 160, position: 3 },
    ],
  },
  {
    title: 'Mutton Seekh Kebab',
    description: 'Juicy minced mutton seekh kebabs grilled over charcoal. Each serving is 4 pieces served with roomali roti and mint raita.\n\nFreshly made every evening. Limited to 20 orders per day — first come first served. Order by 4pm.',
    category: 'Groceries & Produce',
    type: 'product',
    pricingModel: 'slab',
    moq: 1,
    stockQty: 20,
    fulfillment: { method: 'both' },
    visibility: 'everyone',
    slabs: [
      { fromQty: 1,  toQty: 2,  pricePerUnit: 280, position: 0 },
      { fromQty: 3,  toQty: 5,  pricePerUnit: 260, position: 1 },
      { fromQty: 6,  toQty: null, pricePerUnit: 240, position: 2 },
    ],
  },
  {
    title: 'Fish Fry (Rohu / Pomfret)',
    description: 'Andhra-style spiced fish fry — marinated in red chilli, turmeric, ginger-garlic paste and shallow fried. Choice of Rohu or Pomfret. Each serving is 2 pieces.\n\nFresh fish sourced daily from LB Nagar market. Available Fri–Sun evenings only.',
    category: 'Groceries & Produce',
    type: 'product',
    pricingModel: 'slab',
    moq: 1,
    stockQty: 15,
    fulfillment: { method: 'both' },
    visibility: 'everyone',
    slabs: [
      { fromQty: 1,  toQty: 2,  pricePerUnit: 200, position: 0 },
      { fromQty: 3,  toQty: 5,  pricePerUnit: 180, position: 1 },
      { fromQty: 6,  toQty: null, pricePerUnit: 160, position: 2 },
    ],
  },
  {
    title: 'Chicken Wings (BBQ & Peri-Peri)',
    description: 'Crispy chicken wings available in two flavours — classic BBQ or fiery Peri-Peri. Each serving is 6 wings. Made in a home kitchen with restaurant-quality equipment.\n\nAvailable Tue, Thu, Sat, Sun 5pm–8pm.',
    category: 'Groceries & Produce',
    type: 'product',
    pricingModel: 'slab',
    moq: 1,
    stockQty: 25,
    fulfillment: { method: 'both' },
    visibility: 'everyone',
    slabs: [
      { fromQty: 1,  toQty: 2,  pricePerUnit: 250, position: 0 },
      { fromQty: 3,  toQty: 5,  pricePerUnit: 230, position: 1 },
      { fromQty: 6,  toQty: null, pricePerUnit: 210, position: 2 },
    ],
  },
  {
    title: 'Prawns Fry (Tawa Style)',
    description: 'Jumbo prawns marinated in Hyderabadi spices and cooked on a hot tawa with onions and peppers. Each serving is 6 prawns. Clean, deveined, restaurant grade.\n\nAvailable daily 5:30pm–8:30pm. Pre-order for groups of 5+ servings.',
    category: 'Groceries & Produce',
    type: 'product',
    pricingModel: 'slab',
    moq: 1,
    stockQty: 20,
    fulfillment: { method: 'both' },
    visibility: 'everyone',
    slabs: [
      { fromQty: 1,  toQty: 2,  pricePerUnit: 320, position: 0 },
      { fromQty: 3,  toQty: 5,  pricePerUnit: 290, position: 1 },
      { fromQty: 6,  toQty: null, pricePerUnit: 260, position: 2 },
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
