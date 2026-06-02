const fs = require('fs');
const path = require('path');
const dir = __dirname;

const NAV = `<nav class="nav">
  <a href="index.html" class="nav-logo" style="text-decoration:none">onlyStuff</a>
  <ul class="nav-links">
    <li><a href="how-it-works.html">How it Works</a></li>
    <li><a href="communities.html">Communities</a></li>
    <li><a href="sellers.html">Sell</a></li>
    <li><a href="about.html">About</a></li>
  </ul>
  <div class="nav-actions">
    <a href="https://app.onlystuff.in" class="btn btn-primary nav-cta">Get Started</a>
  </div>
  <button class="nav-hamburger" aria-label="Menu"><span></span><span></span><span></span></button>
</nav>
<div class="nav-drawer">
  <a href="how-it-works.html">How it Works</a>
  <a href="communities.html">Communities</a>
  <a href="sellers.html">Sell on onlyStuff</a>
  <a href="about.html">About</a>
  <a href="https://app.onlystuff.in" class="btn btn-primary">Get Started — Free</a>
</div>`;

const FOOTER = `<footer>
  <div class="container">
    <div class="footer-grid">
      <div>
        <div class="footer-brand-logo">onlyStuff</div>
        <p class="footer-brand-desc">Hyderabad's hyperlocal community marketplace. Buy and sell with Aadhaar-verified neighbours.</p>
      </div>
      <div class="footer-col"><h4>Platform</h4><ul>
        <li><a href="how-it-works.html">How it Works</a></li>
        <li><a href="communities.html">Communities</a></li>
        <li><a href="sellers.html">Sell on onlyStuff</a></li>
      </ul></div>
      <div class="footer-col"><h4>Company</h4><ul>
        <li><a href="about.html">About</a></li>
        <li><a href="mailto:support@onlystuff.in">Contact</a></li>
      </ul></div>
      <div class="footer-col"><h4>Legal</h4><ul>
        <li><a href="#">Privacy Policy</a></li>
        <li><a href="#">Terms of Service</a></li>
      </ul></div>
    </div>
    <div class="footer-bottom">
      <p>© 2026 onlyStuff. Made with ❤️ in Hyderabad.</p>
      <div class="footer-bottom-links">
        <a href="#">Privacy</a><a href="#">Terms</a>
        <a href="mailto:support@onlystuff.in">Support</a>
      </div>
    </div>
  </div>
</footer>
<script src="js/main.js"></script>
</body>
</html>`;

function page(title, desc, body) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta name="description" content="${desc}"/>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>
  <link rel="stylesheet" href="css/style.css"/>
  <style>
    .reveal{opacity:0;transform:translateY(24px);transition:opacity .55s ease,transform .55s ease}
    .reveal.visible{opacity:1;transform:none}
  </style>
  <title>${title}</title>
</head>
<body>
${NAV}
${body}
${FOOTER}`;
}

// ─── index.html ─────────────────────────────────────────────────
const indexBody = `
<section class="hero">
  <div class="container">
    <div class="hero-inner">
      <div class="hero-content">
        <div class="hero-eyebrow"><span class="tag">🏘️ Hyderabad's Community Marketplace</span></div>
        <h1>Buy &amp; sell with people you <span class="grad-text">actually know</span></h1>
        <p class="hero-desc">Every seller on onlyStuff is Aadhaar-verified and lives near you. No scams, no strangers — just your neighbours.</p>
        <div class="hero-btns">
          <a href="https://app.onlystuff.in" class="btn btn-primary btn-lg">Start for Free</a>
          <a href="how-it-works.html" class="btn btn-secondary btn-lg">See How it Works</a>
        </div>
        <div class="hero-social-proof">
          <div class="hero-avatars">
            <div class="hero-avatar-item">R</div>
            <div class="hero-avatar-item">P</div>
            <div class="hero-avatar-item">A</div>
            <div class="hero-avatar-item">S</div>
            <div class="hero-avatar-item">K</div>
          </div>
          <p class="hero-social-text"><strong>500+ residents</strong> already trading in their communities</p>
        </div>
      </div>
      <div class="hero-visual">
        <div class="phone-mockup">
          <div class="phone-notch"></div>
          <div class="phone-screen">
            <div class="phone-status">
              <span class="phone-status-time">9:41</span>
              <div class="phone-status-icons"><span></span><span></span><span></span></div>
            </div>
            <div class="phone-app-header">
              <span class="phone-app-logo">onlyStuff</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </div>
            <div class="phone-search"><div class="phone-search-icon"></div><span>Search your community…</span></div>
            <div class="phone-section-label">Near you · Prestige High Fields</div>
            <div class="phone-cards">
              <div class="phone-card"><div class="phone-card-img c1">💻</div><div class="phone-card-body"><div class="phone-card-title">MacBook Pro 2021</div><div class="phone-card-price">₹85,000</div><div class="phone-card-dist">📍 0.2 km</div></div></div>
              <div class="phone-card"><div class="phone-card-img c2">🛋️</div><div class="phone-card-body"><div class="phone-card-title">IKEA Sofa Set</div><div class="phone-card-price">₹12,000</div><div class="phone-card-dist">📍 Same block</div></div></div>
              <div class="phone-card"><div class="phone-card-img c3">🌿</div><div class="phone-card-body"><div class="phone-card-title">Organic Veggies</div><div class="phone-card-price">From ₹40</div><div class="phone-card-dist">👥 Group Buy</div></div></div>
              <div class="phone-card"><div class="phone-card-img c4">🔧</div><div class="phone-card-body"><div class="phone-card-title">AC Repair</div><div class="phone-card-price">₹350/visit</div><div class="phone-card-dist">📅 Today 3pm</div></div></div>
            </div>
            <div class="phone-bottom-nav">
              <div class="phone-nav-item"><div class="phone-nav-icon active"></div><div class="phone-nav-label active">Buy</div></div>
              <div class="phone-nav-item"><div class="phone-nav-icon inactive"></div><div class="phone-nav-label">Sell</div></div>
              <div class="phone-nav-item"><div class="phone-nav-icon inactive"></div><div class="phone-nav-label">Chat</div></div>
            </div>
          </div>
        </div>
        <div class="phone-badge badge-top"><div class="phone-badge-icon">✅</div><div><div class="phone-badge-text">Aadhaar Verified</div><div class="phone-badge-sub">Every seller verified</div></div></div>
        <div class="phone-badge badge-mid"><div class="phone-badge-icon">👥</div><div><div class="phone-badge-text">Group Buy Live</div><div class="phone-badge-sub">32 / 50 units joined</div></div></div>
        <div class="phone-badge badge-bot"><div class="phone-badge-icon">⭐</div><div><div class="phone-badge-text">4.9 · Ravi K.</div><div class="phone-badge-sub">Your neighbour</div></div></div>
      </div>
    </div>
  </div>
</section>

<div class="stats-bar">
  <div class="stats-inner">
    <div class="stat-item"><div class="stat-num">25+</div><div class="stat-label">Communities</div></div>
    <div class="stat-item"><div class="stat-num">500+</div><div class="stat-label">Verified Users</div></div>
    <div class="stat-item"><div class="stat-num">₹0</div><div class="stat-label">Commission</div></div>
    <div class="stat-item"><div class="stat-num">24h</div><div class="stat-label">Verification SLA</div></div>
  </div>
</div>

<section class="section">
  <div class="container">
    <div class="section-header reveal">
      <span class="tag">Why onlyStuff</span>
      <h2>Commerce built on <span class="grad-text">real trust</span></h2>
      <p>OLX has listings but no community. WhatsApp has community but no commerce. onlyStuff is both.</p>
    </div>
    <div class="features">
      <div class="feature-card reveal"><div class="feature-icon">🛡️</div><h3>Verified Identity</h3><p>Every user completes Aadhaar verification before accessing the platform. You always know who you're dealing with.</p></div>
      <div class="feature-card reveal"><div class="feature-icon">📍</div><h3>Community First</h3><p>Search shows your apartment complex first, then nearby, then city-wide. Closer seller means easier handoff.</p></div>
      <div class="feature-card reveal"><div class="feature-icon">👥</div><h3>Group Buying</h3><p>Pool orders with neighbours to meet MOQ and unlock bulk pricing. One tap to start — anyone can join.</p></div>
      <div class="feature-card reveal"><div class="feature-icon">🗓️</div><h3>Book Local Services</h3><p>Find tutors, plumbers, trainers and more. Smart scheduling with enforced buffer time — never back-to-back.</p></div>
      <div class="feature-card reveal"><div class="feature-icon">💬</div><h3>Built-in Chat</h3><p>Every listing has its own chat thread. Negotiate, share photos, coordinate pickup — no switching apps.</p></div>
      <div class="feature-card reveal"><div class="feature-icon">🚚</div><h3>Flexible Delivery</h3><p>Self-pickup, book a delivery partner at checkout, or arrange directly via chat. You decide.</p></div>
    </div>
  </div>
</section>

<section class="section" style="background:var(--bg)">
  <div class="container">
    <div class="section-header reveal">
      <span class="tag">How it Works</span>
      <h2>Up and running in <span class="grad-text">5 minutes</span></h2>
      <p>No forms, no passwords, no waiting weeks.</p>
    </div>
    <div class="steps-wrap reveal">
      <div class="steps">
        <div class="step"><div class="step-num">1</div><h3>Sign in with Google</h3><p>One tap. No username or password. Ever.</p></div>
        <div class="step"><div class="step-num">2</div><h3>Upload Aadhaar</h3><p>Front and back. Verified within 24 hours.</p></div>
        <div class="step"><div class="step-num">3</div><h3>Join your community</h3><p>Auto-placed by address. New society? Request it.</p></div>
        <div class="step"><div class="step-num">4</div><h3>Buy or sell anything</h3><p>Browse listings, post your own, or start a group buy.</p></div>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-header reveal">
      <span class="tag">Testimonials</span>
      <h2>What residents are saying</h2>
      <p>From Gachibowli to Miyapur — real people, real transactions.</p>
    </div>
    <div class="testimonials">
      <div class="testimonial reveal">
        <div class="testimonial-quote">"</div>
        <div class="testimonial-stars"><span>★</span><span>★</span><span>★</span><span>★</span><span>★</span></div>
        <p class="testimonial-text">Sold my MacBook to a neighbour in the same building within 2 hours. No calls from strangers, no 20km drives. Exactly how it should work.</p>
        <div class="testimonial-author"><div class="testimonial-avatar">R</div><div><div class="testimonial-name">Ravi K.</div><div class="testimonial-community">Prestige High Fields, Gachibowli</div></div></div>
      </div>
      <div class="testimonial reveal">
        <div class="testimonial-quote">"</div>
        <div class="testimonial-stars"><span>★</span><span>★</span><span>★</span><span>★</span><span>★</span></div>
        <p class="testimonial-text">8 families did a group buy on organic vegetables, saved 30%, and got fresh produce the same day. Would never have happened without onlyStuff.</p>
        <div class="testimonial-author"><div class="testimonial-avatar">P</div><div><div class="testimonial-name">Priya S.</div><div class="testimonial-community">Indu Fortune Fields, Kondapur</div></div></div>
      </div>
      <div class="testimonial reveal">
        <div class="testimonial-quote">"</div>
        <div class="testimonial-stars"><span>★</span><span>★</span><span>★</span><span>★</span><span>★</span></div>
        <p class="testimonial-text">Smart scheduling for my photography service is a game-changer. Buffer times are automatic — I never have back-to-back sessions anymore.</p>
        <div class="testimonial-author"><div class="testimonial-avatar">A</div><div><div class="testimonial-name">Arun M.</div><div class="testimonial-community">Brigade Buena Vista, Miyapur</div></div></div>
      </div>
    </div>
  </div>
</section>

<section class="section-sm">
  <div class="container">
    <div class="trust-strip reveal">
      <div class="trust-item"><div class="trust-icon">🔒</div><div><div class="trust-label">Aadhaar Verified</div><div class="trust-sub">Every single user</div></div></div>
      <div class="trust-item"><div class="trust-icon">🆓</div><div><div class="trust-label">Zero Commission</div><div class="trust-sub">Keep 100% of earnings</div></div></div>
      <div class="trust-item"><div class="trust-icon">📍</div><div><div class="trust-label">Hyderabad Only</div><div class="trust-sub">Tight community focus</div></div></div>
      <div class="trust-item"><div class="trust-icon">⭐</div><div><div class="trust-label">Community Vouching</div><div class="trust-sub">Neighbours vouch for sellers</div></div></div>
    </div>
  </div>
</section>

<div class="container">
  <div class="cta-section reveal">
    <h2>Your community is already here</h2>
    <p>25+ apartment complexes across Hyderabad. Find yours — or add it.</p>
    <div class="cta-btns">
      <a href="https://app.onlystuff.in" class="btn btn-white btn-lg">Join onlyStuff — It's Free</a>
      <a href="communities.html" class="btn btn-lg" style="background:rgba(255,255,255,.12);color:#fff;border:1.5px solid rgba(255,255,255,.25)">Browse Communities</a>
    </div>
  </div>
</div>`;

// ─── how-it-works.html ───────────────────────────────────────────
const howBody = `
<div class="page-hero">
  <div class="container">
    <span class="tag">Step by step</span>
    <h1>How <span class="grad-text">onlyStuff</span> works</h1>
    <p>Simple, safe, and built around your community.</p>
  </div>
</div>

<section class="section">
  <div class="container">
    <div class="section-header reveal"><h2>Getting started</h2><p>From sign-up to your first transaction in under 5 minutes.</p></div>
    <div class="steps-wrap reveal">
      <div class="steps">
        <div class="step"><div class="step-num">1</div><h3>Sign in with Google</h3><p>No username or password to create or remember. Your Google account is all you need.</p></div>
        <div class="step"><div class="step-num">2</div><h3>Upload your Aadhaar</h3><p>Clear photo of front and back. Our team verifies within 24 hours — you'll get an email.</p></div>
        <div class="step"><div class="step-num">3</div><h3>Enter your address</h3><p>We match you to your apartment community. If it doesn't exist, you can request it and we'll add it.</p></div>
        <div class="step"><div class="step-num">4</div><h3>Start trading</h3><p>Browse listings nearby, create your own, or start a group buy to unlock bulk pricing.</p></div>
      </div>
    </div>
  </div>
</section>

<section class="section" style="background:var(--bg)">
  <div class="container">
    <div class="section-header reveal"><span class="tag">Buying</span><h2>How buying works</h2></div>
    <div class="features">
      <div class="feature-card reveal"><div class="feature-icon">🔍</div><h3>Community-first search</h3><p>Results show your community's listings first, then nearby, then city-wide. Adjust the radius with a slider — default is 5km.</p></div>
      <div class="feature-card reveal"><div class="feature-icon">👥</div><h3>Group Buying</h3><p>Can't meet the MOQ alone? Start a group buy. Set a target, share the link, and once filled — the order locks and everyone gets the bulk price.</p></div>
      <div class="feature-card reveal"><div class="feature-icon">🚚</div><h3>Flexible delivery</h3><p>Pick up yourself, book Porter or Rapido at checkout, or arrange via chat with the seller. You pick what works.</p></div>
      <div class="feature-card reveal"><div class="feature-icon">🔒</div><h3>Order lifecycle</h3><p>Either party can mark an order closed. A 48-hour dispute window opens. If no issue, it auto-closes and reviews unlock.</p></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-header reveal"><span class="tag">Selling</span><h2>How selling works</h2></div>
    <div class="features">
      <div class="feature-card reveal"><div class="feature-icon">🏷️</div><h3>Slab &amp; MOQ pricing</h3><p>Set a minimum order and up to 5 price tiers. Buyers who can't meet MOQ are prompted to start a group buy — you still get the sale.</p></div>
      <div class="feature-card reveal"><div class="feature-icon">🗓️</div><h3>Service scheduling</h3><p>Set working hours, slot duration, and buffer time. The platform enforces it all. No double bookings, no back-to-back sessions.</p></div>
      <div class="feature-card reveal"><div class="feature-icon">🔁</div><h3>Recurring bookings</h3><p>Buyers can set weekly, bi-weekly, or monthly recurring bookings. Steady income, zero admin overhead.</p></div>
      <div class="feature-card reveal"><div class="feature-icon">📊</div><h3>Order management</h3><p>Confirm orders, manage your service calendar, and close orders when fulfilled — all from the Sell tab.</p></div>
    </div>
  </div>
</section>

<section class="section" style="background:var(--bg)">
  <div class="container">
    <div class="section-header reveal"><span class="tag">FAQ</span><h2>Common questions</h2></div>
    <div class="faq-list reveal">
      <div class="faq-item"><button class="faq-q">Why do I need Aadhaar verification?<span class="faq-icon">+</span></button><div class="faq-a"><p>Aadhaar is the only way to verify every user is a real person. It prevents fake accounts and scams — which is the core of why onlyStuff works where anonymous platforms don't.</p></div></div>
      <div class="faq-item"><button class="faq-q">What if my community isn't listed?<span class="faq-icon">+</span></button><div class="faq-a"><p>During sign-up, enter your address. If it doesn't match a community, you'll be prompted to submit a request. Our team approves it within 24 hours.</p></div></div>
      <div class="faq-item"><button class="faq-q">How does a group buy work exactly?<span class="faq-icon">+</span></button><div class="faq-a"><p>A member starts a group buy on any listing, setting a target quantity. Others join and commit quantities. Once the target is hit, the buy locks. The seller fulfils the combined order. If the target isn't met in 48 hours, it auto-cancels.</p></div></div>
      <div class="faq-item"><button class="faq-q">What happens if I have a problem with an order?<span class="faq-icon">+</span></button><div class="faq-a"><p>Once an order is marked closed, the other party has 48 hours to raise a dispute. Disputes go to our admin queue for manual review. In v1 (P2P payments) we mediate but can't force refunds — we can take action on the account.</p></div></div>
      <div class="faq-item"><button class="faq-q">Is onlyStuff free to use?<span class="faq-icon">+</span></button><div class="faq-a"><p>Completely free — zero commission. We may introduce optional premium features in future, but core buying and selling will always be free.</p></div></div>
    </div>
  </div>
</section>

<div class="container">
  <div class="cta-section reveal">
    <h2>Ready to join your community?</h2>
    <p>Takes 5 minutes. No credit card. No catch.</p>
    <div class="cta-btns">
      <a href="https://app.onlystuff.in" class="btn btn-white btn-lg">Get Started Free</a>
    </div>
  </div>
</div>`;

// ─── communities.html ────────────────────────────────────────────
const commBody = `
<div class="page-hero">
  <div class="container">
    <span class="tag">25+ communities live</span>
    <h1>Find your <span class="grad-text">community</span></h1>
    <p>onlyStuff is live in these Hyderabad apartment communities. Don't see yours? Join and request it.</p>
  </div>
</div>

<section class="section">
  <div class="container">
    ${[
      ['Gachibowli / Financial District / Kokapet', ['Aparna Sarovar|Nallagandla','My Home Bhooja|Manikonda','Prestige High Fields|Gachibowli','Mantri Serene|Gachibowli','Lodha Bellezza|Kokapet','Gachibowli Heights|Gachibowli']],
      ['Kondapur / Madhapur / HITEC City', ['Indu Fortune Fields|Kondapur','Aditya Meadows|Kondapur','Kondapur Main Residency|Kondapur','NSL Klassik|Madhapur','Vasavi Signature|Madhapur']],
      ['Manikonda / Puppalaguda', ['My Home Jewel|Manikonda','Prestige Falcon City|Manikonda','Aparna Western Meadows|Puppalaguda']],
      ['Kukatpally / KPHB', ['NCC Urban One|Kukatpally','KPHB Colony Phase 1|KPHB','KPHB Colony Phase 9|KPHB']],
      ['Miyapur / Chandanagar', ['Brigade Buena Vista|Miyapur','Rainbow Vistas Rock Garden|Miyapur']],
      ['Kompally / Tellapur / Bachupally', ['Aliens Space Station|Tellapur','My Home Avatar|Tellapur','Ramky Towers|Kompally','Suchitra Heights|Bachupally']],
      ['Banjara Hills / Jubilee Hills', ['Vasavi Rock Gardens|Banjara Hills','Aparna Cyber Life|Banjara Hills']],
    ].map(([area, chips]) => `
    <div style="margin-bottom:48px" class="reveal">
      <h2 style="font-size:20px;font-weight:800;margin-bottom:16px;color:var(--text-muted)">${area}</h2>
      <div class="community-section-grid">
        ${chips.map(c => { const [n,a] = c.split('|'); return `<div class="community-chip"><div class="community-chip-name">${n}</div><div class="community-chip-area">${a}</div></div>`; }).join('')}
      </div>
    </div>`).join('')}

    <div class="trust-strip reveal" style="flex-direction:column;align-items:center;text-align:center">
      <div style="font-size:36px;margin-bottom:12px">🏘️</div>
      <h3 style="font-size:20px;font-weight:800;margin-bottom:8px">Don't see your community?</h3>
      <p style="color:var(--text-muted);margin-bottom:20px;max-width:400px">Sign up, enter your address, and submit a request. Added within 24 hours.</p>
      <a href="https://app.onlystuff.in" class="btn btn-primary">Join &amp; Request Your Community</a>
    </div>
  </div>
</section>`;

// ─── sellers.html ─────────────────────────────────────────────────
const sellBody = `
<div class="page-hero">
  <div class="container">
    <span class="tag">💰 Zero commission forever</span>
    <h1>Sell to people who <span class="grad-text">actually trust you</span></h1>
    <p>List products or services for your apartment community. Keep 100% of what you earn.</p>
  </div>
</div>

<section class="section">
  <div class="container">
    <div class="section-header reveal"><h2>Everything a seller needs</h2><p>Built for individuals and small sellers in Hyderabad communities.</p></div>
    <div class="features">
      <div class="feature-card reveal"><div class="feature-icon">🆓</div><h3>Zero Commission</h3><p>We take 0% of your earnings. Every rupee stays with you. Core selling is permanently free.</p></div>
      <div class="feature-card reveal"><div class="feature-icon">👥</div><h3>Built-in Buyers</h3><p>Your verified neighbours are already on the platform. No ad spend needed — your community is your market.</p></div>
      <div class="feature-card reveal"><div class="feature-icon">💲</div><h3>MOQ &amp; Slab Pricing</h3><p>Set a minimum order and up to 5 price tiers. Buyers who can't meet MOQ are prompted to start a group buy.</p></div>
      <div class="feature-card reveal"><div class="feature-icon">🗓️</div><h3>Smart Scheduling</h3><p>Set working hours, slot duration, and buffer time. No back-to-back, no overbooking — ever.</p></div>
      <div class="feature-card reveal"><div class="feature-icon">🔁</div><h3>Recurring Bookings</h3><p>Buyers can set weekly, bi-weekly, or monthly recurring bookings. Steady income, zero admin.</p></div>
      <div class="feature-card reveal"><div class="feature-icon">⭐</div><h3>Build Your Reputation</h3><p>Ratings, community vouching, and an Aadhaar-verified badge. A profile your neighbours genuinely trust.</p></div>
    </div>
  </div>
</section>

<section class="section" style="background:var(--bg)">
  <div class="container">
    <div class="section-header reveal"><span class="tag">What you can sell</span><h2>Products &amp; Services</h2></div>
    <div class="features reveal" style="grid-template-columns:1fr 1fr">
      <div class="feature-card"><div class="feature-icon">📦</div><h3>Products</h3><p style="line-height:2.2">Electronics &nbsp;·&nbsp; Furniture &nbsp;·&nbsp; Clothing &nbsp;·&nbsp; Books &nbsp;·&nbsp; Groceries &nbsp;·&nbsp; Plants &nbsp;·&nbsp; Baby items &nbsp;·&nbsp; Home decor &nbsp;·&nbsp; Vehicles &nbsp;·&nbsp; Toys &nbsp;·&nbsp; Sports &amp; Fitness &nbsp;·&nbsp; Kitchen &amp; Appliances</p></div>
      <div class="feature-card"><div class="feature-icon">🔧</div><h3>Services</h3><p style="line-height:2.2">Home Repairs &nbsp;·&nbsp; Cleaning &nbsp;·&nbsp; Tutoring &nbsp;·&nbsp; Fitness &nbsp;·&nbsp; Pet Care &nbsp;·&nbsp; Beauty &amp; Grooming &nbsp;·&nbsp; Photography &nbsp;·&nbsp; Music &amp; Arts &nbsp;·&nbsp; IT Support &nbsp;·&nbsp; Transport &amp; Moving</p></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-header reveal"><span class="tag">Pricing example</span><h2>Set the price that works for you</h2></div>
    <div class="reveal" style="max-width:560px;margin:0 auto">
      <div class="pricing-card">
        <p style="font-size:13px;color:var(--text-muted);margin-bottom:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px">Example: Organic Vegetable Seller</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <thead><tr style="border-bottom:2px solid var(--border)"><th style="text-align:left;padding:10px 8px;color:var(--text-muted)">Qty</th><th style="text-align:right;padding:10px 8px;color:var(--text-muted)">Price/kg</th><th style="text-align:right;padding:10px 8px;color:var(--text-muted)">Saving</th></tr></thead>
          <tbody>
            <tr style="border-bottom:1px solid var(--border)"><td style="padding:10px 8px">1–4 kg</td><td style="padding:10px 8px;text-align:right;font-weight:600">₹120</td><td style="padding:10px 8px;text-align:right;color:var(--text-light)">—</td></tr>
            <tr style="border-bottom:1px solid var(--border)"><td style="padding:10px 8px">5–9 kg</td><td style="padding:10px 8px;text-align:right;font-weight:600">₹100</td><td style="padding:10px 8px;text-align:right;color:#16a34a">−17%</td></tr>
            <tr><td style="padding:10px 8px">10 kg+</td><td style="padding:10px 8px;text-align:right;font-weight:600">₹85</td><td style="padding:10px 8px;text-align:right;color:#16a34a">−29%</td></tr>
          </tbody>
        </table>
        <p style="font-size:13px;color:var(--text-muted);margin-top:16px">Set MOQ = 5 kg. Buyers below MOQ are prompted to start a group buy — you still get a 5kg+ order.</p>
      </div>
    </div>
  </div>
</section>

<div class="container">
  <div class="cta-section reveal">
    <h2>Start selling in 5 minutes</h2>
    <p>Sign in with Google, verify your identity, and list your first item today.</p>
    <div class="cta-btns">
      <a href="https://app.onlystuff.in" class="btn btn-white btn-lg">Create Your First Listing</a>
    </div>
  </div>
</div>`;

// ─── about.html ───────────────────────────────────────────────────
const aboutBody = `
<div class="page-hero">
  <div class="container">
    <span class="tag">Our story</span>
    <h1>About <span class="grad-text">onlyStuff</span></h1>
    <p>Building the trust layer for neighbourhood commerce.</p>
  </div>
</div>

<section class="section">
  <div class="container" style="max-width:720px">
    <div class="reveal">
      <h2 style="font-size:28px;font-weight:800;margin-bottom:20px">Why we built this</h2>
      <p style="font-size:16px;color:#444;line-height:1.8;margin-bottom:20px">Hyderabad has thousands of apartment communities. Each one is a micro-economy — residents with things to sell, services to offer, and needs to fill. But when someone wants to sell their old laptop or find a reliable tutor, they resort to anonymous platforms where trust is near-impossible to establish.</p>
      <p style="font-size:16px;color:#444;line-height:1.8;margin-bottom:20px">onlyStuff starts with identity. Every user is Aadhaar-verified. Every transaction is between people who live near each other. When you buy from someone on onlyStuff, you know they're a real, verified resident — not an anonymous account from anywhere in the country.</p>
      <p style="font-size:16px;color:#444;line-height:1.8;margin-bottom:48px">We started in Hyderabad because it's home. Our goal is to make onlyStuff the default way apartment communities trade with each other.</p>
    </div>

    <div class="section-header reveal" style="text-align:left;margin-bottom:32px"><h2>Our principles</h2></div>
    <div class="values-grid reveal">
      <div class="value-card"><div class="value-icon">🛡️</div><h3>Trust first</h3><p>Identity verification is not optional. Every user on onlyStuff is who they say they are.</p></div>
      <div class="value-card"><div class="value-icon">🏘️</div><h3>Community first</h3><p>Local discovery, local transactions. Shorter distances, more trust, less friction.</p></div>
      <div class="value-card"><div class="value-icon">🆓</div><h3>Free to start</h3><p>Zero commission. We grow when our communities grow — not before.</p></div>
    </div>

    <div class="reveal" style="margin-top:64px;background:var(--bg-warm);border-radius:var(--radius-lg);padding:40px">
      <h3 style="font-size:20px;font-weight:800;margin-bottom:8px">Get in touch</h3>
      <p style="color:var(--text-muted);margin-bottom:20px">Questions, feedback, or want to bring onlyStuff to your community?</p>
      <a href="mailto:support@onlystuff.in" class="btn btn-primary">support@onlystuff.in</a>
    </div>
  </div>
</section>`;

fs.writeFileSync(path.join(dir, 'index.html'), page('onlyStuff — Your Neighbourhood Marketplace', 'Buy and sell with Aadhaar-verified neighbours in your Hyderabad apartment community.', indexBody));
fs.writeFileSync(path.join(dir, 'how-it-works.html'), page('How it Works — onlyStuff', 'Learn how onlyStuff works — sign in with Google, verify Aadhaar, join your community, and start trading.', howBody));
fs.writeFileSync(path.join(dir, 'communities.html'), page('Communities — onlyStuff', '25+ Hyderabad apartment communities on onlyStuff. Find yours or request a new one.', commBody));
fs.writeFileSync(path.join(dir, 'sellers.html'), page('Sell on onlyStuff — Zero Commission', 'List products and services for your Hyderabad apartment community. No fees, no strangers.', sellBody));
fs.writeFileSync(path.join(dir, 'about.html'), page('About — onlyStuff', 'Building the trust layer for neighbourhood commerce in Hyderabad.', aboutBody));

console.log('5 pages written successfully');
