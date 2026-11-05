// DEMO DATA: asli detailer ki details milne pe sirf yeh file badalni hai
const shopInfo = {
  name: "ONYX Mobile Detailing",
  phone: "07700 900412",
  phoneLink: "+447700900412",
  whatsapp: "447700900412",
  email: "hello@onyx-demo.co.uk",
  address: "Leeds, Wakefield & Bradford",
  hours: [
    ["Mon – Fri", "7:30 am – 6:00 pm"],
    ["Saturday", "8:00 am – 4:00 pm"],
    ["Sunday", "Closed"],
  ],
  currency: "£",
};

// coverage checker ke liye postcode areas (pehle letters + number range)
const coverageAreas = [
  { prefix: "LS", from: 1, to: 29, name: "Leeds" },
  { prefix: "WF", from: 1, to: 17, name: "Wakefield" },
  { prefix: "BD", from: 1, to: 11, name: "Bradford" },
];

const carSizes = [
  { id: "small", label: "Small", example: "Fiesta, Polo, Corsa", icon: "ph:car-simple-duotone", multiplier: 1 },
  { id: "medium", label: "Medium", example: "Golf, 3 Series, Octavia", icon: "ph:car-profile-duotone", multiplier: 1.15 },
  { id: "large", label: "Large / SUV", example: "X5, Range Rover, vans", icon: "ph:jeep-duotone", multiplier: 1.3 },
];

// packages = services (booking, chatbot aur price board sab isi se)
const services = [
  { id: "wash", icon: "ph:drop-duotone", name: "Maintenance wash", price: 45, time: "1.5 hrs", text: "Snow foam, two-bucket hand wash, wheels, tyres and glass. For cars that are looked after." },
  { id: "valet", icon: "ph:sparkle-duotone", name: "Full valet", price: 120, time: "3.5 hrs", text: "Everything in the wash, plus a deep interior clean: vacuum, steam, plastics, glass and leather." },
  { id: "enhance", icon: "ph:sun-duotone", name: "Gloss enhancement", price: 249, time: "6 hrs", text: "Decontamination and a one-step machine polish that removes most swirls. Finished with sealant." },
  { id: "ceramic", icon: "ph:shield-check-duotone", name: "Ceramic coating", price: 449, time: "1 day", text: "Polish plus a 2-year ceramic coating. Water beads off, dirt struggles to stick, washing takes minutes." },
];

const packageIncludes = {
  wash: ["Snow foam pre-wash", "Two-bucket hand wash", "Wheels & tyres", "Glass outside"],
  valet: ["Everything in the wash", "Vacuum & steam interior", "Plastics & leather", "Glass inside & out"],
  enhance: ["Iron & tar decontamination", "One-step machine polish", "6-month sealant", "Wheels sealed"],
  ceramic: ["Full decontamination", "Machine polish", "2-year ceramic coating", "Aftercare kit"],
};

const addOns = [
  { id: "pet", name: "Pet hair removal", price: 20, icon: "ph:paw-print-duotone" },
  { id: "engine", name: "Engine bay clean", price: 25, icon: "ph:engine-duotone" },
  { id: "glass", name: "Glass coating", price: 30, icon: "ph:drop-half-duotone" },
  { id: "fabric", name: "Fabric protection", price: 35, icon: "ph:shield-duotone" },
  { id: "headlights", name: "Headlight restore", price: 40, icon: "ph:lightbulb-duotone" },
];

// chatbot isi list se jawab deta hai
const carProblems = [
  { id: "swirls", label: "Paint looks dull or swirly", cause: "Swirls are fine scratches from automatic washes and dirty sponges. They scatter light so black and dark paint looks grey.", fix: "A gloss enhancement removes most of them in one day, on your driveway.", service: "enhance", keywords: ["swirl", "dull", "scratch", "faded", "shine", "polish"] },
  { id: "pet", label: "Pet hair everywhere", cause: "Dog hair weaves into carpet and seat fabric, so a normal vacuum only gets the top layer.", fix: "Full valet with the pet hair add-on: rubber brushes, air line and a proper extraction vacuum.", service: "valet", keywords: ["pet", "dog", "hair", "cat"] },
  { id: "droppings", label: "Bird droppings or tree sap", cause: "Both are acidic and etch into the clear coat if left for a few warm days.", fix: "Safe removal and a decontamination wash, then a sealant so the next ones wipe off.", service: "wash", keywords: ["bird", "dropping", "sap", "tree"] },
  { id: "smell", label: "Interior smells", cause: "Usually spilled drinks, food or damp carpets under the mats, plus a dirty cabin filter.", fix: "Full valet with steam clean and odour treatment.", service: "valet", keywords: ["smell", "odour", "odor", "stink", "damp"] },
  { id: "selling", label: "Selling the car soon", cause: "Clean, glossy cars photograph better and sell faster.", fix: "Full valet the day before your photos. Add headlight restore if the lenses are yellow.", service: "valet", keywords: ["sell", "selling", "sale"] },
  { id: "new-car", label: "Protecting a new car", cause: "Even new cars arrive with swirls from the dealer wash, and the paint is at its best now.", fix: "Light polish and a 2-year ceramic coating before the first winter.", service: "ceramic", keywords: ["new car", "ceramic", "coating", "protect"] },
];

function findServiceById(serviceId) {
  return services.find((item) => item.id === serviceId);
}

function formatPrice(amount) {
  return `${shopInfo.currency}${Math.round(amount)}`;
}

// before/after: har tab ek jod hai
const compareSets = [
  { id: "exterior", label: "Exterior", icon: "ph:car-profile-duotone", before: "assets/work/d0-arrive-dirty.webp", after: "assets/work/d2-clean.webp", note: "Golf, 4 months since last wash. Full valet on the driveway, 3 hr 20 min." },
  { id: "wheels", label: "Wheels", icon: "ph:tire-duotone", before: "assets/work/w1-wheel-dirty.webp", after: "assets/work/w2-wheel-clean.webp", note: "Iron remover turns purple where brake dust is bonded to the rim." },
  { id: "interior", label: "Interior", icon: "ph:steering-wheel-duotone", before: "assets/work/i1-interior-dirty.webp", after: "assets/work/i2-interior-clean.webp", note: "Mud, sand and crumbs out of the footwell. Steam on the carpets and sills." },
  { id: "paint", label: "Paint", icon: "ph:sparkle-duotone", before: "assets/work/c1-mitt.webp", after: "assets/work/c2-dry.webp", note: "Two-bucket wash with a fresh mitt, dried with a plush towel, never a chamois." },
];

const workSteps = [
  { title: "Book online", icon: "ph:calendar-check-duotone", text: "Pick a package and a slot. We text you the day before." },
  { title: "We pull up outside", icon: "ph:van-duotone", text: "Our van carries its own water and power. You don't need to lend us anything." },
  { title: "Detailed on your driveway", icon: "ph:sparkle-duotone", text: "Work from home, we'll knock if we need anything." },
  { title: "Inspect it together", icon: "ph:check-circle-duotone", text: "Walk round the car with us, then pay by card or bank transfer." },
];

const shopPromises = [
  { icon: "ph:van-duotone", title: "We come to you", text: "Home, work or roadside" },
  { icon: "ph:drop-duotone", title: "Own water & power", text: "650 L tank, quiet generator" },
  { icon: "ph:shield-check-duotone", title: "Fully insured", text: "Public liability cover" },
  { icon: "ph:hand-coins-duotone", title: "Price before we start", text: "No surprise extras" },
];

// "what's in the van" section
const vanSpecs = [
  { icon: "ph:drop-duotone", value: "650 L", label: "Filtered water tank" },
  { icon: "ph:lightning-duotone", value: "Silent", label: "Inverter generator" },
  { icon: "ph:wind-duotone", value: "Heated", label: "Pressure washer & air line" },
  { icon: "ph:flask-duotone", value: "pH neutral", label: "Shampoos safe on coatings" },
];

const marqueeWords = ["We come to you", "Own water & power", "Fully insured", "Two-bucket hand wash", "Ceramic certified", "Pay when it's done"];

const shopFaqs = [
  { q: "Do I need to provide water or electricity?", a: "No. The van carries 650 litres of filtered water and a quiet generator, so we can work on the street, at your office or on a driveway with no outside tap." },
  { q: "What if it rains?", a: "Light rain is fine for washes and interiors. For polishing and ceramic coatings we need it dry, so we'll move your booking for free if the forecast is bad." },
  { q: "Do I need to be at home?", a: "Only at the start and the end. Leave us the keys if we're doing the interior, and we'll walk round the car with you when it's done." },
  { q: "How long does a ceramic coating last?", a: "Our standard coating is rated for 2 years with a maintenance wash every few weeks. We give you an aftercare kit and a guide." },
  { q: "Which areas do you cover?", a: "Leeds, Wakefield and Bradford postcodes. Use the checker on this page, or message us if you're just outside." },
];

// SAMPLE reviews sirf demo ke liye. Live karne se pehle asli Google reviews lagana.
const sampleReviews = [
  { name: "James W.", car: "VW Golf", service: "Full valet", rating: 5, text: "Turned up at 8 on the dot, no hose or plug needed. The car looked better than when I bought it." },
  { name: "Hannah P.", car: "Ford Kuga", service: "Pet hair", rating: 5, text: "Two labradors and three years of hair. I honestly thought the boot carpet was grey. It's black." },
  { name: "Raj M.", car: "BMW 3 Series", service: "Ceramic", rating: 5, text: "Six weeks on and the rain still beads straight off. Washing it now takes ten minutes." },
  { name: "Emma L.", car: "Mini Cooper", service: "Wash", rating: 5, text: "Booked on my phone, they did it outside my office while I was in meetings." },
  { name: "Chris D.", car: "Audi A4", service: "Enhancement", rating: 4, text: "Most of the swirls gone and the black paint is deep again. A couple of deeper scratches are still there, as they warned." },
  { name: "Sophie T.", car: "Kia Sportage", service: "Full valet", rating: 5, text: "Got it ready for sale. Sold in four days with the photos I took on my driveway straight after." },
];

const bookingSlots = ["07:30", "09:00", "11:00", "13:00", "15:00"];
