require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ADMIN_EMAILS = ['udaykumar199881@gmail.com', 'poloju.ganeshchary@gmail.com'];

const COMMUNITIES = [
  { name: 'Aparna Sarovar', address: 'Nallagandla, Hyderabad', lat: 17.4604, lng: 78.3211 },
  { name: 'My Home Bhooja', address: 'Manikonda, Hyderabad', lat: 17.4015, lng: 78.3815 },
  { name: 'Prestige High Fields', address: 'Gachibowli, Hyderabad', lat: 17.4435, lng: 78.3498 },
  { name: 'Mantri Serene', address: 'Gachibowli, Hyderabad', lat: 17.4401, lng: 78.3521 },
  { name: 'Lodha Bellezza', address: 'Kokapet, Hyderabad', lat: 17.4138, lng: 78.3295 },
  { name: 'Indu Fortune Fields', address: 'Kondapur, Hyderabad', lat: 17.4674, lng: 78.3635 },
  { name: 'Aditya Meadows', address: 'Kondapur, Hyderabad', lat: 17.4712, lng: 78.3598 },
  { name: 'NSL Klassik', address: 'Madhapur, Hyderabad', lat: 17.4513, lng: 78.3927 },
  { name: 'Vasavi Signature', address: 'Madhapur, Hyderabad', lat: 17.4532, lng: 78.3891 },
  { name: 'My Home Jewel', address: 'Manikonda, Hyderabad', lat: 17.4002, lng: 78.3774 },
  { name: 'Prestige Falcon City', address: 'Manikonda, Hyderabad', lat: 17.3965, lng: 78.3827 },
  { name: 'Aparna Western Meadows', address: 'Puppalaguda, Hyderabad', lat: 17.3912, lng: 78.3701 },
  { name: 'NCC Urban One', address: 'Kukatpally, Hyderabad', lat: 17.4952, lng: 78.3921 },
  { name: 'Aliens Space Station', address: 'Tellapur, Hyderabad', lat: 17.4775, lng: 78.2987 },
  { name: 'Ramky Towers', address: 'Kompally, Hyderabad', lat: 17.5634, lng: 78.4812 },
  { name: 'Brigade Buena Vista', address: 'Miyapur, Hyderabad', lat: 17.5012, lng: 78.3421 },
  { name: 'Rainbow Vistas Rock Garden', address: 'Miyapur, Hyderabad', lat: 17.4987, lng: 78.3398 },
  { name: 'Suchitra Heights', address: 'Bachupally, Hyderabad', lat: 17.5312, lng: 78.3734 },
  { name: 'My Home Avatar', address: 'Tellapur, Hyderabad', lat: 17.4801, lng: 78.3012 },
  { name: 'Vasavi Rock Gardens', address: 'Banjara Hills, Hyderabad', lat: 17.4156, lng: 78.4482 },
  { name: 'Aparna Cyber Life', address: 'Banjara Hills, Hyderabad', lat: 17.4198, lng: 78.4501 },
  { name: 'KPHB Colony Phase 1', address: 'KPHB, Kukatpally, Hyderabad', lat: 17.4934, lng: 78.3867 },
  { name: 'KPHB Colony Phase 9', address: 'KPHB, Kukatpally, Hyderabad', lat: 17.4978, lng: 78.3891 },
  { name: 'Kondapur Main Residency', address: 'Kondapur, Hyderabad', lat: 17.4689, lng: 78.3612 },
  { name: 'Gachibowli Heights', address: 'Gachibowli, Hyderabad', lat: 17.4412, lng: 78.3487 },
];

const PRODUCT_CATEGORIES = ['Electronics', 'Furniture', 'Kitchen & Appliances', 'Books & Stationery', 'Clothing & Accessories', 'Toys & Games', 'Sports & Fitness', 'Home Decor', 'Groceries & Produce', 'Plants & Gardening', 'Baby & Kids', 'Vehicles & Accessories', 'Other'];
const SERVICE_CATEGORIES = ['Home Repairs', 'Cleaning', 'Tutoring & Coaching', 'Fitness & Wellness', 'Pet Care', 'Beauty & Grooming', 'Photography', 'Music & Arts', 'Transport & Moving', 'IT & Tech Support', 'Other'];

const DELIVERY_PARTNERS = [
  { name: 'Porter', slug: 'porter', enabled: false, apiBaseUrl: 'https://api.porter.in', apiKeyEnvVar: 'PORTER_API_KEY' },
  { name: 'Dunzo', slug: 'dunzo', enabled: false, apiBaseUrl: 'https://api.dunzo.com', apiKeyEnvVar: 'DUNZO_API_KEY' },
  { name: 'Rapido', slug: 'rapido', enabled: false, apiBaseUrl: 'https://api.rapido.bike', apiKeyEnvVar: 'RAPIDO_API_KEY' },
  { name: 'Swiggy Genie', slug: 'swiggy_genie', enabled: false, apiBaseUrl: 'https://api.swiggy.com/genie', apiKeyEnvVar: 'SWIGGY_GENIE_API_KEY' },
];

function toSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function main() {
  console.log('🌱 Seeding database...');

  // Delivery partners
  for (const partner of DELIVERY_PARTNERS) {
    await prisma.deliveryPartner.upsert({ where: { slug: partner.slug }, update: partner, create: partner });
  }
  console.log('✅ Delivery partners seeded');

  // Communities
  for (const c of COMMUNITIES) {
    const slug = toSlug(c.name);
    await prisma.community.upsert({
      where: { slug },
      update: {},
      create: { ...c, slug, status: 'active' },
    });
  }
  console.log(`✅ ${COMMUNITIES.length} communities seeded`);

  // Admin users (created as placeholders; Google OAuth will fill googleId on first login)
  for (const email of ADMIN_EMAILS) {
    await prisma.user.upsert({
      where: { email },
      update: { role: 'admin', aadhaarStatus: 'approved' },
      create: {
        googleId: `seeded_${email}`,
        email,
        name: email.split('@')[0],
        role: 'admin',
        aadhaarStatus: 'approved',
      },
    });
  }
  console.log('✅ Admin users seeded');

  console.log('\n📦 Categories (reference data, not stored in DB — used in frontend dropdowns):');
  console.log('Products:', PRODUCT_CATEGORIES.join(', '));
  console.log('Services:', SERVICE_CATEGORIES.join(', '));
  console.log('\n✅ Seed complete');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
