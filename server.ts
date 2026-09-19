import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { FoodListing, Volunteer, NGO, ImpactMetrics, DistributionRoute } from "./src/types.ts";

const PORT = 3000;
const app = express();
app.use(express.json({ limit: "10mb" }));

// Lazy initialize Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

// In-Memory Database initialized with exact metrics requested:
// Food Donated: 128 kg, Meals Redistributed: 356, Food Waste Prevented: 128 kg, Active Volunteers: 42, Successful Deliveries: 91
let metrics: ImpactMetrics = {
  foodDonatedKg: 128,
  mealsRedistributed: 356,
  foodWastePreventedKg: 128,
  activeVolunteers: 42,
  successfulDeliveries: 91,
  co2SavedKg: 320, // ~2.5 kg CO2e per kg food saved
  waterSavedLiters: 108800, // ~850L water footprint per kg food saved
  beneficiariesServed: 1420,
  activeNGOsCount: 14,
  registeredDonorsCount: 38
};

// Metro Hub Coordinates (Downtown & surrounding neighborhoods)
const BASE_LAT = 37.7749;
const BASE_LNG = -122.4194;

const INITIAL_NGOS: NGO[] = [
  {
    id: "ngo-1",
    name: "Hope Center Shelter & Kitchen",
    type: "Shelter",
    address: "840 Mission Street, SoMa",
    lat: 37.7830,
    lng: -122.4045,
    beneficiariesCount: 180,
    currentDailyNeedKg: 50,
    foodReceivedTodayKg: 28,
    contactPerson: "Sister Angela Davis",
    phone: "+1 (555) 234-5678",
    urgentNeeds: ["Cooked dinner trays", "Fresh milk", "Bread"]
  },
  {
    id: "ngo-2",
    name: "St. Jude Community Dining Room",
    type: "Community Kitchen",
    address: "245 10th Street, Tenderloin",
    lat: 37.7735,
    lng: -122.4140,
    beneficiariesCount: 220,
    currentDailyNeedKg: 65,
    foodReceivedTodayKg: 42,
    contactPerson: "Marcus Vance",
    phone: "+1 (555) 345-6789",
    urgentNeeds: ["Vegetarian proteins", "Rice/Grain bases"]
  },
  {
    id: "ngo-3",
    name: "Golden Gate Youth Haven",
    type: "Orphanage",
    address: "1520 Haight Street, Ashbury",
    lat: 37.7699,
    lng: -122.4467,
    beneficiariesCount: 75,
    currentDailyNeedKg: 30,
    foodReceivedTodayKg: 18,
    contactPerson: "Elena Rodriguez",
    phone: "+1 (555) 456-7890",
    urgentNeeds: ["Fresh fruits", "Sandwiches", "Snacks"]
  },
  {
    id: "ngo-4",
    name: "Sunset Senior Food Pantry",
    type: "Elderly Care",
    address: "1890 Irving Street, Sunset",
    lat: 37.7634,
    lng: -122.4782,
    beneficiariesCount: 110,
    currentDailyNeedKg: 40,
    foodReceivedTodayKg: 20,
    contactPerson: "David Wong",
    phone: "+1 (555) 567-8901",
    urgentNeeds: ["Low-sodium prepared meals", "Soft bakery items"]
  }
];

let ngos: NGO[] = [...INITIAL_NGOS];

const INITIAL_VOLUNTEERS: Volunteer[] = [
  {
    id: "vol-1",
    name: "Sarah Jenkins",
    phone: "+1 (555) 901-2345",
    email: "sarah.j@foodbridge.org",
    vehicle: "Bicycle",
    points: 850,
    deliveriesCompleted: 24,
    activeDeliveryId: "listing-2",
    lat: 37.7785,
    lng: -122.4120,
    rating: 4.95,
    badges: [
      { id: "b1", title: "Hunger Hero", icon: "Award", description: "Completed 20+ food rescues" },
      { id: "b2", title: "Rapid Courier", icon: "Zap", description: "Average delivery under 25 mins" },
      { id: "b3", title: "Zero Waste Champion", icon: "Leaf", description: "Rescued 50kg+ food" }
    ]
  },
  {
    id: "vol-2",
    name: "Rajesh Patel",
    phone: "+1 (555) 902-3456",
    email: "rajesh.p@foodbridge.org",
    vehicle: "Car / Van",
    points: 1240,
    deliveriesCompleted: 38,
    lat: 37.7890,
    lng: -122.4080,
    rating: 5.0,
    badges: [
      { id: "b1", title: "Centurion Rescuer", icon: "Shield", description: "Top volunteer of the month" },
      { id: "b4", title: "Heavy Lifter", icon: "Truck", description: "Transported >100kg batch" }
    ]
  },
  {
    id: "vol-3",
    name: "Chloe Nguyen",
    phone: "+1 (555) 903-4567",
    email: "chloe.n@foodbridge.org",
    vehicle: "Electric Scooter",
    points: 620,
    deliveriesCompleted: 17,
    lat: 37.7650,
    lng: -122.4350,
    rating: 4.88,
    badges: [
      { id: "b2", title: "Eco Rider", icon: "BatteryCharging", description: "100% electric zero-emission transit" }
    ]
  },
  {
    id: "vol-4",
    name: "Carlos Mendez",
    phone: "+1 (555) 904-5678",
    email: "carlos.m@foodbridge.org",
    vehicle: "Motorcycle",
    points: 440,
    deliveriesCompleted: 12,
    lat: 37.7550,
    lng: -122.4200,
    rating: 4.92,
    badges: [
      { id: "b5", title: "Night Shift Guardian", icon: "Moon", description: "Rescued late-night buffet surplus" }
    ]
  }
];

let volunteers: Volunteer[] = [...INITIAL_VOLUNTEERS];

// Helper to generate ISO time relative to now
const now = new Date();
const addHours = (hours: number) => new Date(now.getTime() + hours * 60 * 60 * 1000).toISOString();
const subHours = (hours: number) => new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();

const INITIAL_LISTINGS: FoodListing[] = [
  {
    id: "listing-1",
    title: "Fresh Buffet Surplus: Steamed Basmati Rice, Lentil Curry & Rotis",
    donorName: "Spice Symphony Fine Dining",
    donorType: "restaurant",
    description: "Prepared fresh for evening corporate dinner. Leftover untouched trays, stored in food-grade thermal containers at 68°C.",
    dietaryType: "vegetarian",
    quantityKg: 14,
    servingsCount: 38,
    storageTemp: "hot",
    packagedIn: "catering-pans",
    location: {
      address: "525 Market St, Financial District",
      city: "San Francisco",
      lat: 37.7905,
      lng: -122.4002,
      contactPerson: "Chef Anand Sharma",
      phone: "+1 (555) 111-2233",
      landmark: "Kitchen entrance in rear alleyway (Stevenson St)"
    },
    preparedAt: subHours(1.5),
    expiresAt: addHours(1.2), // Urgent countdown (< 90 mins)
    status: "available",
    priority: "urgent",
    verificationCode: "FB-8821",
    assignedNgo: INITIAL_NGOS[0],
    createdAt: subHours(1)
  },
  {
    id: "listing-2",
    title: "University Hostel Mess: Steamed Veggies, Pasta Bake & Bread Rolls",
    donorName: "Horizon University North Hall Dining",
    donorType: "hostel",
    description: "Dinner shift surplus prepared 1 hour ago. Packaged cleanly into insulated hotel pans. Perfect for family meal distributions.",
    dietaryType: "vegetarian",
    quantityKg: 22,
    servingsCount: 60,
    storageTemp: "hot",
    packagedIn: "insulated-carriers",
    location: {
      address: "650 Parnassus Ave",
      city: "San Francisco",
      lat: 37.7631,
      lng: -122.4580,
      contactPerson: "Dorm Director Linda Meyer",
      phone: "+1 (555) 222-3344",
      landmark: "Loading dock Bay #2"
    },
    preparedAt: subHours(1),
    expiresAt: addHours(2.5),
    status: "in_transit",
    priority: "normal",
    verificationCode: "FB-4192",
    claimedByVolunteer: {
      id: "vol-1",
      name: "Sarah Jenkins",
      phone: "+1 (555) 901-2345",
      points: 850,
      vehicleType: "Bicycle",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
    },
    claimedAt: subHours(0.5),
    pickedUpAt: subHours(0.2),
    assignedNgo: INITIAL_NGOS[1],
    pickupProof: {
      photoUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
      timestamp: subHours(0.2),
      verificationCode: "FB-4192",
      notes: "Food checked with laser thermometer at 64°C. Packed securely in insulated bike panniers."
    },
    createdAt: subHours(1.5)
  },
  {
    id: "listing-3",
    title: "Artisanal Sourdough Loaves, Croissants & Baguettes",
    donorName: "Tartine Rustica Bakery",
    donorType: "supermarket",
    description: "Daily surplus from morning & afternoon batches. Crispy crust, baked today. Packaged in breathable paper bags.",
    dietaryType: "vegan",
    quantityKg: 12,
    servingsCount: 35,
    storageTemp: "ambient",
    packagedIn: "sealed-boxes",
    location: {
      address: "600 Guerrero St, Mission District",
      city: "San Francisco",
      lat: 37.7610,
      lng: -122.4245,
      contactPerson: "Paul Mercier",
      phone: "+1 (555) 333-4455",
      landmark: "Staff side door next to the flour silo"
    },
    preparedAt: subHours(4),
    expiresAt: addHours(5.5),
    status: "available",
    priority: "normal",
    verificationCode: "FB-1920",
    assignedNgo: INITIAL_NGOS[2],
    createdAt: subHours(2)
  },
  {
    id: "listing-4",
    title: "Tech Conference Gala: 40 Packaged Gourmet Chicken & Salad Boxes",
    donorName: "Apex Convention Catering",
    donorType: "catering",
    description: "Individually sealed bento boxes with grilled herb chicken, quinoa salad, and seasonal fruit. Chilled at 4°C in commercial walk-in.",
    dietaryType: "halal",
    quantityKg: 18,
    servingsCount: 45,
    storageTemp: "chilled",
    packagedIn: "individual-containers",
    location: {
      address: "747 Howard St, Moscone Center",
      city: "San Francisco",
      lat: 37.7842,
      lng: -122.4015,
      contactPerson: "Event Lead Rachel Adams",
      phone: "+1 (555) 444-5566",
      landmark: "Service elevator at Loading Gate 3"
    },
    preparedAt: subHours(2),
    expiresAt: addHours(0.8), // CRITICAL EXPIRY (< 50 mins)!
    status: "available",
    priority: "critical",
    verificationCode: "FB-7741",
    assignedNgo: INITIAL_NGOS[0],
    createdAt: subHours(2)
  },
  {
    id: "listing-5",
    title: "Completed: 35 kg Fresh Farmer Market Apples & Stone Fruit",
    donorName: "Civic Center Farmers Collective",
    donorType: "other",
    description: "End of market fresh orchard surplus, crisp and sweet.",
    dietaryType: "vegan",
    quantityKg: 35,
    servingsCount: 100,
    storageTemp: "ambient",
    packagedIn: "sealed-boxes",
    location: {
      address: "1 Dr Carlton B Goodlett Pl",
      city: "San Francisco",
      lat: 37.7792,
      lng: -122.4191,
      contactPerson: "Farmer Jim",
      phone: "+1 (555) 777-8899"
    },
    preparedAt: subHours(6),
    expiresAt: addHours(12),
    status: "delivered",
    priority: "normal",
    verificationCode: "FB-3301",
    claimedByVolunteer: {
      id: "vol-2",
      name: "Rajesh Patel",
      phone: "+1 (555) 902-3456",
      points: 1240,
      vehicleType: "Car / Van"
    },
    assignedNgo: INITIAL_NGOS[1],
    claimedAt: subHours(4),
    pickedUpAt: subHours(3.5),
    deliveredAt: subHours(2.8),
    pickupProof: {
      photoUrl: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80",
      timestamp: subHours(3.5),
      verificationCode: "FB-3301",
      notes: "5 crates loaded into van safely."
    },
    deliveryProof: {
      photoUrl: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&auto=format&fit=crop&q=80",
      timestamp: subHours(2.8),
      receiverName: "Marcus Vance (St. Jude)",
      beneficiariesServed: 100,
      notes: "Received cleanly, distributed during evening community meal line."
    },
    createdAt: subHours(5)
  }
];

let listings: FoodListing[] = [...INITIAL_LISTINGS];

// Live Routes for Map View
function buildActiveRoutes(): DistributionRoute[] {
  const activeRoutes: DistributionRoute[] = [];
  listings.forEach((item) => {
    if (item.status === "in_transit" || item.status === "claimed") {
      const vol = item.claimedByVolunteer;
      const ngo = item.assignedNgo || INITIAL_NGOS[0];
      const donorCoord: [number, number] = [item.location.lat, item.location.lng];
      const ngoCoord: [number, number] = [ngo.lat, ngo.lng];
      const volCoord: [number, number] = [
        (donorCoord[0] + ngoCoord[0]) / 2 + 0.003,
        (donorCoord[1] + ngoCoord[1]) / 2 - 0.002
      ];

      activeRoutes.push({
        id: `route-${item.id}`,
        listingId: item.id,
        title: item.title,
        donorName: item.donorName,
        volunteerName: vol ? vol.name : "Volunteer Dispatched",
        ngoName: ngo.name,
        foodKg: item.quantityKg,
        servings: item.servingsCount,
        donorCoord,
        volunteerCoord: volCoord,
        ngoCoord,
        currentCoord: item.status === "in_transit" ? volCoord : donorCoord,
        status: item.status === "in_transit" ? "in_transit" : "picking_up",
        progressPercent: item.status === "in_transit" ? 65 : 20,
        etaMinutes: item.status === "in_transit" ? 14 : 22,
        urgency: item.priority
      });
    }
  });
  return activeRoutes;
}

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

// 1. Get Listings
app.get("/api/listings", (req: Request, res: Response) => {
  const { status, urgency } = req.query;
  let result = [...listings];
  if (status && status !== "all") {
    result = result.filter((l) => l.status === status);
  }
  if (urgency && urgency !== "all") {
    result = result.filter((l) => l.priority === urgency);
  }
  // Sort with critical/urgent first, then available
  result.sort((a, b) => {
    if (a.status === "available" && b.status !== "available") return -1;
    if (b.status === "available" && a.status !== "available") return 1;
    return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
  });
  res.json(result);
});

// 2. Post Surplus Food (Donor)
app.post("/api/listings", (req: Request, res: Response) => {
  const {
    title,
    donorName,
    donorType,
    description,
    dietaryType,
    quantityKg,
    servingsCount,
    storageTemp,
    packagedIn,
    location,
    preparedAt,
    expiresAt,
    targetNgoId
  } = req.body;

  if (!title || !donorName || !quantityKg || !expiresAt) {
    res.status(400).json({ error: "Missing required food surplus details" });
    return;
  }

  const nowTime = new Date().getTime();
  const expTime = new Date(expiresAt).getTime();
  const diffHours = (expTime - nowTime) / (1000 * 60 * 60);
  const priority = diffHours <= 1.5 ? "critical" : diffHours <= 3 ? "urgent" : "normal";

  // Pick suitable NGO
  let assignedNgo = ngos.find((n) => n.id === targetNgoId);
  if (!assignedNgo) {
    // default to closest or neediest NGO
    assignedNgo = ngos[Math.floor(Math.random() * ngos.length)];
  }

  const newListing: FoodListing = {
    id: `listing-${Date.now()}`,
    title,
    donorName,
    donorType: donorType || "restaurant",
    description: description || "Fresh edible surplus packaged for distribution.",
    dietaryType: dietaryType || "vegetarian",
    quantityKg: Number(quantityKg),
    servingsCount: servingsCount ? Number(servingsCount) : Math.round(Number(quantityKg) * 2.8),
    storageTemp: storageTemp || "ambient",
    packagedIn: packagedIn || "sealed-boxes",
    location: {
      address: location?.address || "100 Market St",
      city: location?.city || "San Francisco",
      lat: location?.lat || (BASE_LAT + (Math.random() - 0.5) * 0.04),
      lng: location?.lng || (BASE_LNG + (Math.random() - 0.5) * 0.04),
      contactPerson: location?.contactPerson || donorName,
      phone: location?.phone || "+1 (555) 000-1122",
      landmark: location?.landmark || ""
    },
    preparedAt: preparedAt || new Date().toISOString(),
    expiresAt,
    status: "available",
    priority,
    verificationCode: `FB-${Math.floor(1000 + Math.random() * 9000)}`,
    assignedNgo,
    createdAt: new Date().toISOString()
  };

  listings.unshift(newListing);
  res.status(201).json(newListing);
});

// 3. Claim Pickup (Volunteer)
app.post("/api/listings/:id/claim", (req: Request, res: Response) => {
  const { id } = req.params;
  const { volunteerId } = req.body;

  const listing = listings.find((l) => l.id === id);
  if (!listing) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }
  if (listing.status !== "available") {
    res.status(400).json({ error: `Listing is already ${listing.status}` });
    return;
  }

  let vol = volunteers.find((v) => v.id === volunteerId) || volunteers[0];

  listing.status = "claimed";
  listing.claimedAt = new Date().toISOString();
  listing.claimedByVolunteer = {
    id: vol.id,
    name: vol.name,
    phone: vol.phone,
    points: vol.points,
    vehicleType: vol.vehicle
  };

  vol.activeDeliveryId = listing.id;

  res.json({ success: true, listing, volunteer: vol });
});

// 4. Food Collected / Picked Up (Volunteer)
app.post("/api/listings/:id/pickup", (req: Request, res: Response) => {
  const { id } = req.params;
  const { photoUrl, notes, verificationCode } = req.body;

  const listing = listings.find((l) => l.id === id);
  if (!listing) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }

  listing.status = "in_transit";
  listing.pickedUpAt = new Date().toISOString();
  listing.pickupProof = {
    photoUrl: photoUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
    timestamp: new Date().toISOString(),
    verificationCode: verificationCode || listing.verificationCode,
    notes: notes || "Food safely inspected, sealed, and loaded."
  };

  res.json({ success: true, listing });
});

// 5. Food Delivered to NGO (Volunteer/NGO confirmation)
app.post("/api/listings/:id/deliver", (req: Request, res: Response) => {
  const { id } = req.params;
  const { photoUrl, receiverName, beneficiariesServed, notes } = req.body;

  const listing = listings.find((l) => l.id === id);
  if (!listing) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }

  const servedCount = Number(beneficiariesServed) || listing.servingsCount;

  listing.status = "delivered";
  listing.deliveredAt = new Date().toISOString();
  listing.deliveryProof = {
    photoUrl: photoUrl || "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&auto=format&fit=crop&q=80",
    timestamp: new Date().toISOString(),
    receiverName: receiverName || listing.assignedNgo?.contactPerson || "NGO Representative",
    beneficiariesServed: servedCount,
    notes: notes || "Food received fresh and distributed to beneficiaries."
  };

  // Update NGO stats
  if (listing.assignedNgo) {
    const ngo = ngos.find((n) => n.id === listing.assignedNgo?.id);
    if (ngo) {
      ngo.foodReceivedTodayKg += listing.quantityKg;
    }
  }

  // Update Volunteer Points (+100 for delivery, +30 urgency bonus)
  if (listing.claimedByVolunteer) {
    const vol = volunteers.find((v) => v.id === listing.claimedByVolunteer?.id);
    if (vol) {
      const bonus = listing.priority === "critical" ? 50 : listing.priority === "urgent" ? 30 : 0;
      vol.points += (100 + bonus);
      vol.deliveriesCompleted += 1;
      vol.activeDeliveryId = undefined;
    }
  }

  // Update Global Impact Metrics
  metrics.foodDonatedKg += listing.quantityKg;
  metrics.foodWastePreventedKg += listing.quantityKg;
  metrics.mealsRedistributed += servedCount;
  metrics.successfulDeliveries += 1;
  metrics.co2SavedKg = Math.round(metrics.foodWastePreventedKg * 2.5);
  metrics.waterSavedLiters = Math.round(metrics.foodWastePreventedKg * 850);
  metrics.beneficiariesServed += servedCount;

  res.json({ success: true, listing, updatedMetrics: metrics });
});

// 6. Impact Metrics Endpoint
app.get("/api/metrics", (req: Request, res: Response) => {
  res.json(metrics);
});

// 7. NGOs Endpoint
app.get("/api/ngos", (req: Request, res: Response) => {
  res.json(ngos);
});

// 8. Volunteers & Leaderboard Endpoint
app.get("/api/volunteers", (req: Request, res: Response) => {
  const sorted = [...volunteers].sort((a, b) => b.points - a.points);
  res.json(sorted);
});

// 9. Active Routes Endpoint (for real-time map)
app.get("/api/routes", (req: Request, res: Response) => {
  res.json(buildActiveRoutes());
});

// 10. AI Smart Food Impact & Safety Assistant (Server-Side Gemini)
app.post("/api/ai/estimate-food-impact", async (req: Request, res: Response) => {
  const { foodTitle, description, quantityKg, donorType } = req.body;

  try {
    const ai = getGenAI();
    if (!ai) {
      // Fallback heuristic if no API key is provided
      const estMeals = Math.round(Number(quantityKg || 5) * 2.8);
      const estCo2 = Math.round(Number(quantityKg || 5) * 2.5);
      res.json({
        estimatedMeals: estMeals,
        co2SavedKg: estCo2,
        shelfLifeHoursRecommendation: "Consume or chill within 2-3 hours",
        storageRecommendation: "Keep hot dishes above 60°C or quickly refrigerate below 4°C in sealed containers",
        dietarySummary: "Nutrient-dense prepared meals suitable for immediate community distribution.",
        handlingChecklist: [
          "Check temperature upon collection",
          "Ensure food containers are labeled and sealed",
          "Distribute to nearest shelter within 90 minutes"
        ]
      });
      return;
    }

    const prompt = `You are a food safety expert and food waste reduction analyst for FoodBridge.
Analyze this surplus food donation:
- Food: "${foodTitle}"
- Donor Type: "${donorType}"
- Description: "${description}"
- Quantity: ${quantityKg} kg

Provide a JSON response with:
1. estimatedMeals (number, approximately meals this quantity provides)
2. co2SavedKg (number, greenhouse emissions prevented)
3. shelfLifeHoursRecommendation (short advice string on safe consumption window)
4. storageRecommendation (string detailing thermal or refrigeration guidelines)
5. dietarySummary (short 1-2 sentence nutritional overview)
6. handlingChecklist (array of 3 brief, actionable food safety checks for the volunteer)

Return strictly valid JSON only.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (err: any) {
    console.error("AI estimation error:", err);
    // Graceful fallback
    const estMeals = Math.round(Number(quantityKg || 5) * 2.8);
    res.json({
      estimatedMeals: estMeals,
      co2SavedKg: Math.round(Number(quantityKg || 5) * 2.5),
      shelfLifeHoursRecommendation: "Consume or chill within 2 hours",
      storageRecommendation: "Seal tightly and transport in thermal carriers",
      dietarySummary: "Surplus meals prepared in commercial kitchen setting.",
      handlingChecklist: [
        "Verify seal integrity",
        "Check sensory freshness (aroma, appearance)",
        "Expedite transfer to beneficiary kitchen"
      ]
    });
  }
});

// 11. Reset to initial demo state
app.post("/api/reset-demo", (req: Request, res: Response) => {
  metrics = {
    foodDonatedKg: 128,
    mealsRedistributed: 356,
    foodWastePreventedKg: 128,
    activeVolunteers: 42,
    successfulDeliveries: 91,
    co2SavedKg: 320,
    waterSavedLiters: 108800,
    beneficiariesServed: 1420,
    activeNGOsCount: 14,
    registeredDonorsCount: 38
  };
  listings = [...INITIAL_LISTINGS];
  volunteers = [...INITIAL_VOLUNTEERS];
  ngos = [...INITIAL_NGOS];
  res.json({ success: true, message: "Demo data refreshed to exact baseline metrics" });
});

// -------------------------------------------------------------
// Server Start & Vite Middleware
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FoodBridge server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
