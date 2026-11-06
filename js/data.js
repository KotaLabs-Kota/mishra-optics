/* ------------------------------------------------------------------
   Mishra Optics — demo catalogue (frontend only, no backend / DB)
------------------------------------------------------------------- */

const PRODUCTS = [
  {
    id: "aravalli",
    name: "The Aravalli",
    category: "eyeglasses",
    shape: "Round",
    price: 2490,
    compareAt: 2990,
    image: "images/product-aravalli.jpg",
    badge: "Bestseller",
    rating: 4.9,
    reviews: 214,
    material: "Italian acetate",
    size: "Medium · 47–22–145",
    colors: [
      { name: "Tortoise", hex: "#8a5a33" },
      { name: "Honey", hex: "#c08a4e" },
      { name: "Ink", hex: "#20241f" }
    ],
    description:
      "A round, easy-going frame inspired by the ridgelines of the Aravalli hills. Hand-polished Italian acetate keeps it light on the bridge and quietly bold on the face.",
    details: [
      "Hand-polished Italian acetate frame",
      "CR-39 lenses with 100% UV400 protection",
      "Adjustable nose pads for an all-day fit",
      "Includes a hard case, microfibre pouch and lens cloth"
    ]
  },
  {
    id: "kota",
    name: "The Kota",
    category: "eyeglasses",
    shape: "Rectangle",
    price: 2290,
    compareAt: null,
    image: "images/product-kota.jpg",
    badge: "New",
    rating: 4.8,
    reviews: 128,
    material: "Bio-acetate",
    size: "Medium · 49–21–145",
    colors: [
      { name: "Ink", hex: "#20241f" },
      { name: "Tortoise", hex: "#8a5a33" },
      { name: "Crystal", hex: "#cfd6d2" }
    ],
    description:
      "Clean lines, a confident rectangle and a featherweight build. The Kota is the everyday frame that goes from a 9am lecture to a late dinner without missing a beat.",
    details: [
      "Plant-based bio-acetate, made in India",
      "Scratch-resistant demo lenses",
      "Spring hinges for a forgiving fit",
      "Includes a hard case, microfibre pouch and lens cloth"
    ]
  },
  {
    id: "udaipur",
    name: "The Udaipur",
    category: "sunglasses",
    shape: "Aviator",
    price: 2990,
    compareAt: 3490,
    image: "images/product-udaipur.jpg",
    badge: "Bestseller",
    rating: 4.9,
    reviews: 302,
    material: "Gold-tone metal",
    size: "Wide · 58–14–140",
    colors: [
      { name: "Gold / Brown", hex: "#b08a4f" },
      { name: "Silver / Grey", hex: "#9aa3a6" },
      { name: "Black / Green", hex: "#2c3a31" }
    ],
    description:
      "The classic aviator, refined. A feather-light gold-tone frame with warm gradient lenses that take the edge off a Kota afternoon.",
    details: [
      "Lightweight gold-tone metal alloy frame",
      "Polarised gradient lenses, UV400",
      "Silicone nose pads and temple tips",
      "Includes a hard case, microfibre pouch and lens cloth"
    ]
  },
  {
    id: "jaipur",
    name: "The Jaipur",
    category: "sunglasses",
    shape: "Cat-eye",
    price: 2790,
    compareAt: null,
    image: "images/product-jaipur.jpg",
    badge: "New",
    rating: 4.8,
    reviews: 176,
    material: "Italian acetate",
    size: "Medium · 52–18–140",
    colors: [
      { name: "Honey", hex: "#b9793f" },
      { name: "Ink", hex: "#20241f" },
      { name: "Rose", hex: "#c99a8c" }
    ],
    description:
      "A soft cat-eye with a little drama — named for the pink city and made for golden hour. Slightly upswept, never overdone.",
    details: [
      "Hand-polished Italian acetate",
      "Polarised lenses with 100% UV400 protection",
      "Five-barrel hinges for durability",
      "Includes a hard case, microfibre pouch and lens cloth"
    ]
  },
  {
    id: "nilgiri",
    name: "The Nilgiri",
    category: "eyeglasses",
    shape: "Round",
    price: 2190,
    compareAt: null,
    image: "images/product-nilgiri.jpg",
    badge: "New",
    rating: 4.7,
    reviews: 96,
    material: "Bio-acetate",
    size: "Narrow · 45–22–145",
    colors: [
      { name: "Crystal", hex: "#cfd6d2" },
      { name: "Sage", hex: "#8d9c86" },
      { name: "Amber", hex: "#b9793f" }
    ],
    description:
      "Barely-there clarity. A translucent round frame for faces that like their eyewear to whisper, not shout.",
    details: [
      "Plant-based bio-acetate, made in India",
      "Translucent hand-pigmented finish",
      "Lightweight 18g frame",
      "Includes a hard case, microfibre pouch and lens cloth"
    ]
  },
  {
    id: "thar",
    name: "The Thar",
    category: "sunglasses",
    shape: "Square",
    price: 2590,
    compareAt: 2990,
    image: "images/product-thar.jpg",
    badge: "Sale",
    rating: 4.8,
    reviews: 143,
    material: "Italian acetate",
    size: "Wide · 54–20–145",
    colors: [
      { name: "Olive", hex: "#6f7350" },
      { name: "Tortoise", hex: "#8a5a33" },
      { name: "Ink", hex: "#20241f" }
    ],
    description:
      "An oversized square with desert-worn confidence. Deep olive acetate and dark lenses built for long drives and longer summers.",
    details: [
      "Hand-polished Italian acetate",
      "Polarised lenses with 100% UV400 protection",
      "Reinforced five-barrel hinges",
      "Includes a hard case, microfibre pouch and lens cloth"
    ]
  },
];

const LENS_OPTIONS = [
  { id: "single", label: "Single vision", note: "Included", extra: 0 },
  { id: "progressive", label: "Progressive", note: "+ ₹1,200", extra: 1200 },
  { id: "blue", label: "Blue-light filter", note: "+ ₹600", extra: 600 },
  { id: "plano", label: "Non-prescription", note: "Included", extra: 0 }
];

const FACE_SHAPES = {
  Round: {
    tip: "Angular frames add definition to soft curves.",
    product: "kota"
  },
  Oval: {
    tip: "You have the most versatile face shape — almost anything works.",
    product: "aravalli"
  },
  Square: {
    tip: "Curved frames soften a strong jawline beautifully.",
    product: "nilgiri"
  },
  Heart: {
    tip: "Aviator styles balance a wider forehead beautifully.",
    product: "udaipur"
  }
};

const TESTIMONIALS = [
  {
    quote:
      "The Aravalli is the first pair of glasses I've owned that feels like it was made for my face. Three months in and they still look new.",
    name: "Ananya S.",
    city: "Bengaluru",
    product: "The Aravalli"
  },
  {
    quote:
      "Ordered on a Tuesday, wearing them by Thursday. The fit guide was spot on and the packaging felt genuinely premium.",
    name: "Rohan M.",
    city: "Mumbai",
    product: "The Kota"
  },
  {
    quote:
      "I've bought three pairs now. The Udaipur is my favourite, but the Jaipur gets the most compliments. No notes.",
    name: "Meher K.",
    city: "New Delhi",
    product: "The Udaipur"
  }
];

const JOURNAL = [
  {
    tag: "Fit guide",
    title: "How to find the frame that fits your face",
    excerpt: "A two-minute read on proportions, bridge width and why the third number on your frame matters.",
    image: "images/product-nilgiri.jpg",
    read: "4 min read"
  },
  {
    tag: "Care",
    title: "Five habits that quietly ruin your lenses",
    excerpt: "Your shirt is not a lens cloth. Here's the small routine that keeps acetate and coatings like new.",
    image: "images/product-thar.jpg",
    read: "3 min read"
  },
  {
    tag: "Field notes",
    title: "A weekend in Bundi, through a brown lens",
    excerpt: "Stepwells, blue rooftops and the case for travelling with one good pair of sunglasses.",
    image: "images/lifestyle.jpg",
    read: "6 min read"
  }
];

const STORES = [
  {
    city: "Kota",
    label: "Flagship studio",
    address: "12, Rangbari Road, Near Chambal Garden, Kota, Rajasthan 324005",
    hours: "Mon–Sat · 10:30am – 8:30pm",
    phone: "+91 98285 34548"
  },
  {
    city: "Jaipur",
    label: "Pink city studio",
    address: "C-18, Prithviraj Road, C Scheme, Jaipur, Rajasthan 302001",
    hours: "Mon–Sun · 11:00am – 8:00pm",
    phone: "+91 98290 12346"
  }
];

const FAQS = [
  {
    q: "Do I need a prescription to order?",
    a: "You can order frames with non-prescription demo lenses straight away. If you'd like prescription lenses, send your prescription to care@mishraoptics.in or share it with us on WhatsApp and we'll take it from there."
  },
  {
    q: "How do I know my frame size?",
    a: "Every product page lists the lens width, bridge width and temple length in millimetres. As a rule of thumb, your frame should be about as wide as your face at the temples. Our fit finder on the home page is a good starting point too."
  },
  {
    q: "What is your return policy?",
    a: "You have 30 days from delivery to return or exchange any frame, no questions asked. Prescription lenses are made to order, so we ask that you double-check your details before confirming."
  },
  {
    q: "How long does delivery take?",
    a: "Frames ship within 24 hours and usually arrive in 2–5 working days. Prescription orders take an additional 3–5 working days to cut and fit lenses."
  },
  {
    q: "Are your lenses protected against UV?",
    a: "Yes. Every lens we fit — clear, tinted or polarised — blocks 100% of UVA and UVB rays (UV400)."
  }
];

const ANNOUNCEMENTS = [
  "Complimentary shipping on orders above ₹1,999",
  "30-day no-questions returns · 1-year frame warranty",
  "New: The Monsoon Edit — now in store and online"
];


/* Public business details used by the frontend-only contact flow.
   Source: public "Mishra Optician" listing, Kota (Rajasthan).
   Update these values if the business details change. */
const BUSINESS = {
  name: "Mishra Optics",
  whatsapp: "919828534548",
  phoneDisplay: "+91 98285 34548",
  facebook: "https://www.facebook.com/675562649552525/",
  maps: "https://maps.google.com/?q=Mishra+Optician+Rangpur+Road+Kota+Rajasthan",
  email: "care@mishraoptics.in"
};
const WHATSAPP_NUMBER = BUSINESS.whatsapp;
