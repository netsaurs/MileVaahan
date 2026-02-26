// ═══════════════════════════════════════════════════════
// MileVaahan — Firebase Cloud Functions
// Auto SEO: sitemap generation + search engine pinging
// ═══════════════════════════════════════════════════════

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fetch = require('node-fetch');
const { Storage } = require('@google-cloud/storage');

admin.initializeApp();
const db = admin.firestore();
const storage = new Storage();
const BUCKET = 'milevaahan.appspot.com';
const SITE_URL = 'https://www.milevaahan.com';

// ══════════════════════════════════════════════════════
// TRIGGER: When a listing is published (status → active)
// ══════════════════════════════════════════════════════
exports.onListingPublished = functions
  .region('asia-south1')
  .firestore
  .document('listings/{listingId}')
  .onWrite(async (change, context) => {
    const before = change.before.exists ? change.before.data() : null;
    const after = change.after.exists ? change.after.data() : null;
    const listingId = context.params.listingId;

    // Only trigger when status changes to 'active'
    if (after && after.status === 'active' && (!before || before.status !== 'active')) {
      console.log(`Listing ${listingId} published. Regenerating sitemap...`);

      try {
        await regenerateSitemap();
        await pingSearchEngines(`${SITE_URL}/pages/car-detail.html?id=${listingId}&slug=${after.slug || ''}`);
        await updateStructuredData(listingId, after);
        console.log(`SEO tasks completed for listing ${listingId}`);
      } catch (err) {
        console.error('SEO tasks failed:', err);
      }
    }

    // Trigger when listing is deleted — remove from sitemap
    if (before && after && before.status === 'active' && after.status !== 'active') {
      await regenerateSitemap();
    }
  });

// ══════════════════════════════════════════════════════
// TRIGGER: When a blog post is published
// ══════════════════════════════════════════════════════
exports.onBlogPublished = functions
  .region('asia-south1')
  .firestore
  .document('blogs/{blogId}')
  .onWrite(async (change, context) => {
    const after = change.after.exists ? change.after.data() : null;
    const blogId = context.params.blogId;

    if (after && after.status === 'published') {
      await regenerateSitemap();
      await pingSearchEngines(`${SITE_URL}/pages/blog-post.html?id=${blogId}&slug=${after.slug || ''}`);
    }
  });

// ══════════════════════════════════════════════════════
// SCHEDULED: Regenerate full sitemap daily
// ══════════════════════════════════════════════════════
exports.scheduledSitemapRegeneration = functions
  .region('asia-south1')
  .pubsub
  .schedule('every 24 hours')
  .onRun(async () => {
    console.log('Scheduled sitemap regeneration...');
    await regenerateSitemap();
  });

// ══════════════════════════════════════════════════════
// HELPER: Generate complete sitemap.xml
// ══════════════════════════════════════════════════════
async function regenerateSitemap() {
  // Fetch all active listings
  const listingsSnap = await db.collection('listings')
    .where('status', '==', 'active')
    .orderBy('createdAt', 'desc')
    .get();

  // Fetch all published blogs
  const blogsSnap = await db.collection('blogs')
    .where('status', '==', 'published')
    .orderBy('publishedAt', 'desc')
    .get();

  // Fetch all approved dealers
  const dealersSnap = await db.collection('dealers')
    .where('status', '==', 'approved')
    .get();

  const today = new Date().toISOString().split('T')[0];

  // Static pages
  const staticPages = [
    { loc: '/', priority: '1.0', changefreq: 'daily' },
    { loc: '/pages/listings.html', priority: '0.9', changefreq: 'hourly' },
    { loc: '/pages/listings.html?type=new', priority: '0.85', changefreq: 'daily' },
    { loc: '/pages/listings.html?type=used', priority: '0.85', changefreq: 'daily' },
    { loc: '/pages/listings.html?type=cpo', priority: '0.85', changefreq: 'daily' },
    { loc: '/pages/dealers.html', priority: '0.8', changefreq: 'daily' },
    { loc: '/pages/blog.html', priority: '0.75', changefreq: 'daily' },
    { loc: '/pages/emi-calculator.html', priority: '0.7', changefreq: 'monthly' },
    { loc: '/pages/compare.html', priority: '0.7', changefreq: 'monthly' },
    { loc: '/pages/valuation.html', priority: '0.7', changefreq: 'monthly' },
    { loc: '/pages/vin-lookup.html', priority: '0.65', changefreq: 'monthly' },
    { loc: '/pages/about.html', priority: '0.5', changefreq: 'monthly' },
    { loc: '/pages/contact.html', priority: '0.5', changefreq: 'monthly' },
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">

`;

  // Add static pages
  staticPages.forEach(page => {
    xml += `  <url>
    <loc>${SITE_URL}${page.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>\n`;
  });

  // Add listing pages
  listingsSnap.forEach(doc => {
    const d = doc.data();
    const slug = d.slug || generateSlug(`${d.year}-${d.make}-${d.model}-${d.city}`);
    const lastmod = d.updatedAt ? d.updatedAt.toDate().toISOString().split('T')[0] : today;
    const title = `${d.year} ${d.make} ${d.model} for Sale in ${d.city}`;

    xml += `  <url>
    <loc>${SITE_URL}/pages/car-detail.html?id=${doc.id}&amp;slug=${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>`;

    if (d.images && d.images[0]) {
      xml += `
    <image:image>
      <image:loc>${d.images[0]}</image:loc>
      <image:title>${title}</image:title>
    </image:image>`;
    }
    xml += `\n  </url>\n`;
  });

  // Add blog pages
  blogsSnap.forEach(doc => {
    const d = doc.data();
    const slug = d.slug || generateSlug(d.title || '');
    const lastmod = d.publishedAt ? d.publishedAt.toDate().toISOString().split('T')[0] : today;
    xml += `  <url>
    <loc>${SITE_URL}/pages/blog-post.html?id=${doc.id}&amp;slug=${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.65</priority>
  </url>\n`;
  });

  // Add dealer profile pages
  dealersSnap.forEach(doc => {
    xml += `  <url>
    <loc>${SITE_URL}/pages/dealer-profile.html?id=${doc.id}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>\n`;
  });

  xml += `</urlset>`;

  // Upload to Firebase Storage (public URL) and save to Firestore for reference
  const file = storage.bucket(BUCKET).file('sitemap.xml');
  await file.save(xml, { contentType: 'application/xml', public: true });

  // Also save metadata
  await db.collection('seo_settings').doc('sitemap').set({
    lastGenerated: admin.firestore.FieldValue.serverTimestamp(),
    totalUrls: listingsSnap.size + blogsSnap.size + dealersSnap.size + staticPages.length,
    listingCount: listingsSnap.size,
    blogCount: blogsSnap.size,
    dealerCount: dealersSnap.size,
  }, { merge: true });

  console.log(`Sitemap generated with ${listingsSnap.size + blogsSnap.size + dealersSnap.size + staticPages.length} URLs`);
  return xml;
}

// ══════════════════════════════════════════════════════
// HELPER: Ping search engines
// ══════════════════════════════════════════════════════
async function pingSearchEngines(url) {
  const sitemapUrl = encodeURIComponent(`${SITE_URL}/sitemap.xml`);
  const pageUrl = encodeURIComponent(url);

  const pings = [
    // Google — GSC API (preferred over ping)
    `https://www.google.com/ping?sitemap=${sitemapUrl}`,
    // Bing
    `https://www.bing.com/ping?sitemap=${sitemapUrl}`,
    // Bing IndexNow (instant indexing)
    `https://api.indexnow.org/indexnow?url=${pageUrl}&key=YOUR_INDEXNOW_KEY`,
    // Google IndexNow
    `https://www.google.com/indexnow?url=${pageUrl}&key=YOUR_INDEXNOW_KEY`,
  ];

  const results = await Promise.allSettled(
    pings.map(pingUrl => fetch(pingUrl, { method: 'GET', timeout: 5000 }))
  );

  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      console.log(`Pinged ${pings[i]}: ${result.value.status}`);
    } else {
      console.warn(`Failed to ping ${pings[i]}:`, result.reason);
    }
  });
}

// ══════════════════════════════════════════════════════
// HELPER: Update JSON-LD Structured Data
// ══════════════════════════════════════════════════════
async function updateStructuredData(listingId, listing) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Car",
    "@id": `${SITE_URL}/pages/car-detail.html?id=${listingId}`,
    "name": `${listing.year} ${listing.make} ${listing.model}`,
    "brand": { "@type": "Brand", "name": listing.make },
    "model": listing.model,
    "vehicleModelDate": String(listing.year),
    "fuelType": listing.fuel,
    "vehicleTransmission": listing.transmission,
    "mileageFromOdometer": {
      "@type": "QuantitativeValue",
      "value": listing.mileage,
      "unitCode": "KMT"
    },
    "color": listing.color,
    "bodyType": listing.bodyType,
    "offers": {
      "@type": "Offer",
      "price": listing.price,
      "priceCurrency": "INR",
      "availability": "https://schema.org/InStock",
      "url": `${SITE_URL}/pages/car-detail.html?id=${listingId}`,
      "seller": {
        "@type": "AutoDealer",
        "name": listing.dealerName,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": listing.city,
          "addressCountry": "IN"
        }
      }
    },
    "description": listing.description,
    "image": listing.images || [],
    "itemCondition": listing.condition === 'new'
      ? "https://schema.org/NewCondition"
      : listing.condition === 'cpo'
      ? "https://schema.org/RefurbishedCondition"
      : "https://schema.org/UsedCondition"
  };

  await db.collection('listings').doc(listingId).update({
    'seo.structuredData': JSON.stringify(schema)
  });
}

// ══════════════════════════════════════════════════════
// HTTP Endpoint: Manual sitemap trigger (admin only)
// ══════════════════════════════════════════════════════
exports.triggerSitemapRegeneration = functions
  .region('asia-south1')
  .https
  .onRequest(async (req, res) => {
    // Verify admin token
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${functions.config().admin.secret}`) {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    try {
      await regenerateSitemap();
      await pingSearchEngines(SITE_URL);
      res.json({ success: true, message: 'Sitemap regenerated and search engines pinged' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

// ══════════════════════════════════════════════════════
// TRIGGER: New dealer approved → send welcome email
// ══════════════════════════════════════════════════════
exports.onDealerApproved = functions
  .region('asia-south1')
  .firestore
  .document('dealers/{dealerId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    if (before.status !== 'approved' && after.status === 'approved') {
      // Send welcome email (integrate with SendGrid/Nodemailer)
      console.log(`Dealer ${after.name} approved. Sending welcome email to ${after.email}`);
      // await sendWelcomeEmail(after.email, after.name);
    }
  });

// Utility
function generateSlug(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

module.exports.regenerateSitemap = regenerateSitemap;
module.exports.pingSearchEngines = pingSearchEngines;
