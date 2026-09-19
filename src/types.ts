export type FoodStatus = 'available' | 'claimed' | 'picked_up' | 'in_transit' | 'delivered' | 'expired';
export type DietaryType = 'vegetarian' | 'vegan' | 'non-veg' | 'halal' | 'jain';
export type DonorType = 'restaurant' | 'canteen' | 'hostel' | 'catering' | 'supermarket' | 'event' | 'individual' | 'other';
export type StorageTemp = 'hot' | 'chilled' | 'ambient' | 'frozen';

export interface LocationPoint {
  address: string;
  city: string;
  lat: number;
  lng: number;
  contactPerson: string;
  phone: string;
  landmark?: string;
  instructions?: string;
}

export interface FoodListing {
  id: string;
  title: string;
  donorName: string;
  donorType: DonorType;
  description: string;
  dietaryType: DietaryType;
  quantityKg: number;
  servingsCount: number;
  storageTemp: StorageTemp;
  packagedIn: string;
  location: LocationPoint;
  preparedAt: string; // ISO string
  expiresAt: string; // ISO string
  status: FoodStatus;
  priority: 'normal' | 'urgent' | 'critical';
  verificationCode: string;
  claimedByVolunteer?: {
    id: string;
    name: string;
    phone: string;
    points: number;
    vehicleType: string;
    avatarUrl?: string;
  };
  claimedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  assignedNgo?: {
    id: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
    contactPerson: string;
    phone: string;
    beneficiariesCount: number;
  };
  pickupProof?: {
    photoUrl?: string;
    timestamp: string;
    verificationCode: string;
    notes?: string;
  };
  deliveryProof?: {
    photoUrl?: string;
    timestamp: string;
    receiverName: string;
    beneficiariesServed: number;
    notes?: string;
  };
  createdAt: string;
}

export interface Volunteer {
  id: string;
  name: string;
  phone: string;
  email: string;
  vehicle: 'Bicycle' | 'Motorcycle' | 'Car / Van' | 'Electric Scooter' | 'On Foot';
  points: number;
  deliveriesCompleted: number;
  activeDeliveryId?: string;
  lat: number;
  lng: number;
  rating: number;
  badges: {
    id: string;
    title: string;
    icon: string;
    description: string;
  }[];
}

export interface NGO {
  id: string;
  name: string;
  type: 'Shelter' | 'Community Kitchen' | 'Orphanage' | 'Elderly Care' | 'Food Bank';
  address: string;
  lat: number;
  lng: number;
  beneficiariesCount: number;
  currentDailyNeedKg: number;
  foodReceivedTodayKg: number;
  contactPerson: string;
  phone: string;
  urgentNeeds?: string[];
}

export interface DistributionRoute {
  id: string;
  listingId: string;
  title: string;
  donorName: string;
  volunteerName: string;
  ngoName: string;
  foodKg: number;
  servings: number;
  donorCoord: [number, number];
  volunteerCoord: [number, number];
  ngoCoord: [number, number];
  currentCoord: [number, number];
  status: 'picking_up' | 'in_transit' | 'delivered';
  progressPercent: number; // 0 to 100
  etaMinutes: number;
  urgency: 'normal' | 'urgent' | 'critical';
}

export interface ImpactMetrics {
  foodDonatedKg: number;
  mealsRedistributed: number;
  foodWastePreventedKg: number;
  activeVolunteers: number;
  successfulDeliveries: number;
  co2SavedKg: number;
  waterSavedLiters: number;
  beneficiariesServed: number;
  activeNGOsCount: number;
  registeredDonorsCount: number;
}
