/**
 * Generates productsSeed.js with verified unique Pexels URLs per category.
 * Run: node scripts/generateProductsSeed.js
 */
const fs = require("fs");
const path = require("path");
const https = require("https");

const IMAGES_PER_PRODUCT = 3;
const COUNTS = { hoodie: 6, tshirt: 6, jeans: 6, jacket: 6, shoes: 7, watch: 6, cap: 6, shirt: 7 };

/** Candidate Pexels IDs — product/lay-flat/studio shots per category */
const CANDIDATES = {
  hoodie: [
    631986, 767116, 7772640, 994523, 1040945, 1124466, 1183266, 1181396, 1043474, 1040427,
    3760263, 3760264, 4934198, 4934199, 1043473, 1181395, 767115, 1183265, 4934197, 3760262,
    1040426, 1040944, 1124465, 994522, 7772639, 631985,
  ],
  tshirt: [
    1656684, 2983468, 4066293, 5081385, 937481, 985635, 1813947, 1813948, 1926769, 2233348,
    2233360, 6785066, 6785067, 1813946, 1926768, 2233347, 4066292, 5081384, 937480, 985634,
    2983467, 1656683, 2233346, 2233359,
  ],
  jeans: [
    1541094, 4210865, 1598507, 4670080, 1598505, 1598506, 1598508, 1598510, 1598509,
    1541093, 4210864, 4670079, 1598503, 1541092, 4210863, 1082529, 720292, 159888,
    6063525, 6063526, 4676878, 87465, 52583, 3051907, 3051908,
  ],
  jacket: [
    1124468, 768972, 3220616, 3220617, 1300402, 1300403, 6311392, 6311393, 6311394,
    6311395, 6311396, 6311397, 6311398, 1124467, 768971, 3220615, 1300401, 1300400,
    768970, 3220614, 6311391, 1300399, 768969,
  ],
  shoes: [
    2529148, 1464625, 1032110, 298863, 298864, 292999, 293000, 336372, 336374, 336375,
    2525872, 267390, 267391, 267392, 267393, 267394, 267395, 267396, 267397, 1464624,
    2529147, 1032109, 298862, 292998, 293001, 336371, 336376, 2525873,
  ],
  watch: [
    190819, 277390, 277392, 6829337, 6829338, 437037, 437038, 1908198, 997877, 2807201,
    2861105, 1152077, 6982723, 2861106, 2807260, 277389, 437036, 1908197, 277391, 437039,
    6829339, 1908200, 2861107, 2807261,
  ],
  cap: [
    3992785, 912915, 303383, 303385, 2556712, 1126997, 1126998, 1456709, 5848346, 5848348,
    303382, 912914, 1126996, 1456710, 303381, 912913, 35185, 903973, 111816, 2553300,
    3449772, 607810, 742962, 1810944, 1002641, 1002640, 1002639,
    2861336, 1003864, 699462, 699461, 4775082, 5106292, 5106293, 3641050, 1884581, 1884582, 1560424, 1560425,
  ],
  shirt: [
    297933, 265035, 461931, 769749, 769750, 769752, 769753, 769754, 769755, 769756,
    769757, 769758, 769759, 297932, 265034, 461930, 769748, 769751, 297931, 265033,
    461929, 769747, 769760, 769761,
  ],
};

const PRODUCT_TEMPLATES = {
  hoodie: [
    ["Urban Black Oversized Hoodie", "oversized", "Cotton Fleece", "Oversized", 59.99, "Heavyweight French-terry hoodie with dropped shoulders and kangaroo pocket."],
    ["Charcoal Zip Performance Hoodie", "zip-up", "Cotton Blend", "Regular", 64.99, "Moisture-wicking zip hoodie with ribbed cuffs for city layering."],
    ["Heather Grey Pullover Hoodie", "pullover", "Cotton", "Relaxed", 54.99, "Brushed interior pullover with tonal drawcords and minimal embroidery."],
    ["Forest Green Street Hoodie", "streetwear", "Fleece", "Oversized", 62.99, "Deep green fleece with oversized hood and reinforced seams."],
    ["Cream Minimal Logo Hoodie", "minimal", "Organic Cotton", "Regular", 69.99, "Ivory hoodie with subtle tonal logo and double-lined hood."],
    ["Navy Essential Hoodie", "essential", "Cotton Fleece", "Regular", 56.99, "Classic navy pullover with ribbed hem and cuffs."],
  ],
  tshirt: [
    ["White Classic Crew Neck Tee", "crew-neck", "Cotton Jersey", "Regular", 24.99, "Crisp white jersey tee with reinforced neckline."],
    ["Black Urban Graphic Tee", "graphic", "Cotton", "Regular", 29.99, "Black tee with soft-hand screen print chest graphic."],
    ["Olive Relaxed Fit Tee", "relaxed", "Cotton", "Relaxed", 27.99, "Earth-tone tee with dropped shoulder and lightweight drape."],
    ["Navy Breton Striped Tee", "striped", "Cotton", "Slim", 32.99, "Navy-and-white stripes on combed cotton."],
    ["Vintage Wash Grey Tee", "vintage", "Garment-Dyed Cotton", "Regular", 31.99, "Garment-dyed grey with lived-in faded finish."],
    ["Coral Summer V-Neck Tee", "v-neck", "Cotton Blend", "Slim", 26.99, "Lightweight coral V-neck for warm weather."],
  ],
  jeans: [
    ["Indigo Slim Stretch Jeans", "slim", "Stretch Denim", "Slim", 79.99, "Medium-wash slim jeans with comfort stretch."],
    ["Dark Straight Leg Jeans", "straight", "Denim", "Straight", 84.99, "Deep indigo straight-leg with contrast stitching."],
    ["Light Wash Relaxed Jeans", "relaxed", "Cotton Denim", "Relaxed", 89.99, "Vintage light wash with high-rise relaxed fit."],
    ["Black Skinny Coated Jeans", "skinny", "Stretch Denim", "Skinny", 74.99, "Jet-black skinny with coated finish."],
    ["Distressed Ripped Jeans", "distressed", "Denim", "Slim", 92.99, "Strategic distressing and raw hem detail."],
    ["Wide Leg Cropped Jeans", "wide-leg", "Rigid Denim", "Wide", 88.99, "Wide-leg crop with clean raw edge."],
  ],
  jacket: [
    ["Camel Wool Blend Overcoat", "overcoat", "Wool Blend", "Tailored", 189.99, "Structured camel overcoat with notch lapels."],
    ["Black Leather Biker Jacket", "leather", "Faux Leather", "Slim", 149.99, "Asymmetric zip biker with quilted shoulders."],
    ["Olive Utility Field Jacket", "utility", "Cotton Twill", "Regular", 119.99, "Multi-pocket water-resistant utility jacket."],
    ["Navy Quilted Puffer Jacket", "puffer", "Nylon", "Regular", 129.99, "Lightweight packable insulated puffer."],
    ["Blue Denim Trucker Jacket", "denim", "Denim", "Regular", 99.99, "Classic trucker with chest pockets."],
    ["Grey Harrington Jacket", "harrington", "Poly-Cotton", "Slim", 109.99, "Retro Harrington with tartan lining."],
  ],
  shoes: [
    ["White Leather Low Sneakers", "sneakers", "Leather", "True to Size", 89.99, "Minimal white leather cupsole sneakers."],
    ["Black Knit Running Trainers", "trainers", "Knit", "True to Size", 94.99, "Lightweight knit trainers with responsive sole."],
    ["Tan Suede Chelsea Boots", "boots", "Suede", "True to Size", 129.99, "Slip-on Chelsea with elastic side panels."],
    ["Red High-Top Sneakers", "high-top", "Canvas", "True to Size", 79.99, "Bold red high-tops with gum outsole."],
    ["Brown Oxford Dress Shoes", "oxford", "Leather", "True to Size", 119.99, "Polished cap-toe oxfords for smart casual."],
    ["Grey Chunky Dad Sneakers", "dad-sneakers", "Synthetic", "True to Size", 84.99, "Layered panels and chunky rubber sole."],
    ["Navy Canvas Slip-Ons", "slip-on", "Canvas", "True to Size", 49.99, "Memory foam slip-on canvas shoes."],
  ],
  watch: [
    ["Silver Minimalist Dial Watch", "minimal", "Stainless Steel", "Adjustable Strap", 129.99, "Slim silver case with white dial."],
    ["Black Chronograph Sport Watch", "chronograph", "Stainless Steel", "Adjustable Strap", 159.99, "Multi-dial chronograph with tachymeter bezel."],
    ["Rose Gold Mesh Watch", "dress", "Alloy", "Adjustable Mesh", 139.99, "Rose gold mesh bracelet and sunray dial."],
    ["Brown Leather Classic Watch", "classic", "Leather", "Adjustable Strap", 119.99, "Heritage dial with leather band."],
    ["Digital Tactical Watch", "digital", "Silicone", "Adjustable Strap", 69.99, "Rugged digital watch with backlight."],
    ["Gold Skeleton Automatic Watch", "automatic", "Stainless Steel", "Adjustable Strap", 249.99, "Open-heart automatic exhibition case."],
  ],
  cap: [
    ["Black Snapback Cap", "snapback", "Cotton Twill", "Adjustable", 29.99, "Structured snapback with embroidered logo."],
    ["Navy Dad Hat", "dad-hat", "Cotton", "Adjustable", 24.99, "Washed navy unstructured dad hat."],
    ["White Five-Panel Cap", "five-panel", "Cotton", "Adjustable", 26.99, "Clean white cap with tonal embroidery."],
    ["Camo Trucker Cap", "trucker", "Polyester Mesh", "Adjustable", 27.99, "Mesh-back trucker with camo front."],
    ["Beige Corduroy Bucket Hat", "bucket", "Corduroy", "One Size", 32.99, "Soft corduroy bucket with wide brim."],
    ["Red Wool Beanie", "beanie", "Wool Blend", "One Size", 22.99, "Cozy knit beanie with fold-over cuff."],
  ],
  shirt: [
    ["White Slim Dress Shirt", "dress", "Cotton Poplin", "Slim", 49.99, "Crisp poplin with spread collar."],
    ["Light Blue Oxford Shirt", "oxford", "Oxford Cotton", "Regular", 54.99, "Button-down collar oxford cloth shirt."],
    ["Black Linen Resort Shirt", "resort", "Linen", "Relaxed", 59.99, "Breathable camp-collar linen shirt."],
    ["Red Plaid Flannel Shirt", "flannel", "Flannel", "Regular", 44.99, "Brushed flannel in red plaid."],
    ["Striped French Cuff Shirt", "formal", "Cotton", "Tailored", 64.99, "Striped shirt with French cuffs."],
    ["Sage Relaxed Camp Shirt", "camp", "Viscose", "Relaxed", 52.99, "Drapey camp collar in sage green."],
    ["Chambray Work Shirt", "chambray", "Chambray Cotton", "Regular", 48.99, "Indigo chambray with utility chest pockets."],
  ],
};

function pexelsUrl(id) {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=800&h=1000&fit=crop`;
}

function headOk(url) {
  return new Promise((resolve) => {
    const req = https.request(url, { method: "HEAD", timeout: 5000 }, (res) => {
      resolve(res.statusCode >= 200 && res.statusCode < 400);
    });
    req.on("error", () => resolve(false));
    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
}

async function verifyPool(category, ids) {
  const uniqueIds = [...new Set(ids)];
  const valid = [];
  const batchSize = 12;
  for (let i = 0; i < uniqueIds.length; i += batchSize) {
    const batch = uniqueIds.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(async (id) => {
        const url = pexelsUrl(id);
        return (await headOk(url)) ? { id, url } : null;
      })
    );
    valid.push(...results.filter(Boolean));
  }
  console.log(`  ${category}: ${valid.length}/${uniqueIds.length} valid`);
  return valid;
}

async function main() {
  const globalUsed = new Set();
  const pools = {};

  console.log("Verifying image URLs...");
  for (const cat of Object.keys(COUNTS)) {
    const valid = await verifyPool(cat, CANDIDATES[cat]);
    pools[cat] = valid.filter((x) => {
      if (globalUsed.has(x.url)) return false;
      globalUsed.add(x.url);
      return true;
    });
  }

  const products = [];
  let prodNum = 1;

  for (const [category, count] of Object.entries(COUNTS)) {
    const pool = pools[category];
    const needed = count * IMAGES_PER_PRODUCT;
    if (pool.length < needed) {
      console.error(`Not enough valid ${category} images: need ${needed}, have ${pool.length}`);
      process.exit(1);
    }

    const templates = PRODUCT_TEMPLATES[category];
    for (let i = 0; i < count; i++) {
      const [name, subcategory, material, fitType, price, description] = templates[i];
      const imgs = [];
      for (let j = 0; j < IMAGES_PER_PRODUCT; j++) {
        imgs.push(pool.shift().url);
      }

      products.push({
        productId: `prod_${String(prodNum).padStart(3, "0")}`,
        name,
        description,
        brand: "UrbanWear",
        category,
        subcategory,
        material,
        fitType,
        price,
        stock: 25 + ((prodNum * 7) % 75),
        image: imgs[0],
        images: imgs,
        isActive: true,
      });
      prodNum += 1;
    }
  }

  const allUrls = products.flatMap((p) => p.images);
  const unique = new Set(allUrls);
  if (unique.size !== allUrls.length) {
    console.error("DUPLICATE URL DETECTED");
    process.exit(1);
  }

  const fixed = formatAsJs(products);
  const target = path.join(__dirname, "..", "data", "productsSeed.js");
  fs.writeFileSync(target, fixed, "utf8");
  console.log(`\nWrote ${products.length} products, ${unique.size} unique URLs → ${target}`);
}

function formatAsJs(products) {
  const lines = products.map((p) => {
    const imgs = p.images.map((u) => `      "${u}"`).join(",\n");
    return `  {
    productId: "${p.productId}",
    name: "${p.name}",
    description: "${p.description}",
    brand: "${p.brand}",
    category: "${p.category}",
    subcategory: "${p.subcategory}",
    material: "${p.material}",
    fitType: "${p.fitType}",
    price: ${p.price},
    stock: ${p.stock},
    image: "${p.image}",
    images: [
${imgs},
    ],
    isActive: true,
  }`;
  });

  return `/**
 * UrbanWear — 50 premium fashion products
 * ${products.length * 3} unique verified Pexels image URLs (3 per product, zero repeats)
 * Usage: npm run seed:products
 */

const urbanwearProducts = [
${lines.join(",\n")},
];

module.exports = urbanwearProducts;
`;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
