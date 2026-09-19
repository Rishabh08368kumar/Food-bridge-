import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Award,
  Zap,
  Leaf,
  Shield,
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  Camera,
  UploadCloud,
  ChevronRight,
  AlertTriangle,
  Phone,
  ArrowRight,
  Sparkles,
  Trophy,
  Star
} from 'lucide-react';
import { FoodListing, Volunteer, NGO } from '../types.ts';
import { CountdownBadge } from './CountdownBadge.tsx';

interface VolunteerDashboardProps {
  volunteers: Volunteer[];
  listings: FoodListing[];
  ngos: NGO[];
  currentVolunteer: Volunteer;
  onClaimListing: (listing: FoodListing, volunteerId: string) => Promise<void>;
  onPickupListing: (listingId: string, proof: { photoUrl: string; notes: string; verificationCode: string }) => Promise<void>;
  onDeliverListing: (listingId: string, proof: { photoUrl: string; receiverName: string; beneficiariesServed: number; notes: string }) => Promise<void>;
  onSwitchVolunteer: (volunteer: Volunteer) => void;
}

export const VolunteerDashboard: React.FC<VolunteerDashboardProps> = ({
  volunteers,
  listings,
  ngos,
  currentVolunteer,
  onClaimListing,
  onPickupListing,
  onDeliverListing,
  onSwitchVolunteer
}) => {
  const [activeStep, setActiveStep] = useState<'pickup' | 'deliver'>('pickup');
  const [verificationInput, setVerificationInput] = useState<string>('');
  const [pickupNotes, setPickupNotes] = useState<string>('Inspected at 65°C, containers sealed intact.');
  const [selectedPhotoProof, setSelectedPhotoProof] = useState<string>(
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'
  );
  const [receiverName, setReceiverName] = useState<string>('Marcus Vance (Shift Coordinator)');
  const [beneficiariesServed, setBeneficiariesServed] = useState<number>(45);
  const [deliveryNotes, setDeliveryNotes] = useState<string>('Unloaded at kitchen door, meals served warm.');
  const [deliveryPhotoProof, setDeliveryPhotoProof] = useState<string>(
    'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&auto=format&fit=crop&q=80'
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Active task for this volunteer
  const activeListing = listings.find(
    (l) =>
      (l.status === 'claimed' || l.status === 'in_transit') &&
      l.claimedByVolunteer?.id === currentVolunteer.id
  );

  // Available listings
  const availableListings = listings.filter((l) => l.status === 'available');

  const handleConfirmPickup = async () => {
    if (!activeListing) return;
    setIsSubmitting(true);
    try {
      await onPickupListing(activeListing.id, {
        verificationCode: verificationInput || activeListing.verificationCode,
        notes: pickupNotes,
        photoUrl: selectedPhotoProof
      });
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelivery = async () => {
    if (!activeListing) return;
    setIsSubmitting(true);
    try {
      await onDeliverListing(activeListing.id, {
        receiverName: receiverName || activeListing.assignedNgo?.contactPerson || 'NGO Staff',
        beneficiariesServed: Number(beneficiariesServed) || activeListing.servingsCount,
        notes: deliveryNotes,
        photoUrl: deliveryPhotoProof
      });
      // Fire celebratory confetti!
      confetti({
        particleCount: 120,
        spread: 100,
        origin: { y: 0.6 }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Volunteer Identity Card & Points Tracker */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-2xl font-bold shadow-md shrink-0">
              {currentVolunteer.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-slate-900">{currentVolunteer.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                  Verified Volunteer Courier
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  {currentVolunteer.vehicle}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                <span>Rating: ★ {currentVolunteer.rating}</span>
                <span>•</span>
                <span>{currentVolunteer.deliveriesCompleted} completed deliveries</span>
              </p>
            </div>
          </div>

          {/* Points & Badges */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-2xl text-center">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                CONTRIBUTION POINTS
              </span>
              <span className="text-2xl font-extrabold text-amber-700 font-mono">
                {currentVolunteer.points} pts
              </span>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2">
              {currentVolunteer.badges.map((badge) => (
                <div
                  key={badge.id}
                  title={`${badge.title}: ${badge.description}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 cursor-default"
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  <span>{badge.title}</span>
                </div>
              ))}
            </div>

            {/* Switch volunteer switcher */}
            <div className="border-l border-slate-200 pl-4">
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Active Courier
              </label>
              <select
                value={currentVolunteer.id}
                onChange={(e) => {
                  const vol = volunteers.find((v) => v.id === e.target.value);
                  if (vol) onSwitchVolunteer(vol);
                }}
                className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                {volunteers.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.vehicle}) - {v.points} pts
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 🚀 Active Mission / Pickup in Progress */}
      {activeListing ? (
        <div id="active-pickup-mission" className="bg-gradient-to-b from-blue-50/70 to-white rounded-3xl p-6 sm:p-8 border border-blue-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-100 pb-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white uppercase tracking-wider mb-2">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                Active Rescue Mission
              </span>
              <h3 className="text-xl font-bold text-slate-900">{activeListing.title}</h3>
              <p className="text-xs text-slate-600 mt-0.5">
                {activeListing.quantityKg} kg surplus • ~{activeListing.servingsCount} meals • {activeListing.dietaryType}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <CountdownBadge expiresAt={activeListing.expiresAt} size="md" />
            </div>
          </div>

          {/* Stepper Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Step 1: Pickup from Donor */}
            <div
              className={`p-5 rounded-2xl border transition-all ${
                activeListing.status === 'claimed'
                  ? 'bg-white border-blue-400 ring-2 ring-blue-100 shadow-sm'
                  : 'bg-emerald-50/60 border-emerald-200 text-slate-600'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                      activeListing.status === 'claimed'
                        ? 'bg-blue-600 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {activeListing.status === 'claimed' ? '1' : '✓'}
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">Step 1: Collect from Donor</h4>
                </div>
                {activeListing.status === 'in_transit' && (
                  <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Collected
                  </span>
                )}
              </div>

              <div className="space-y-1.5 text-xs text-slate-700">
                <p className="font-semibold text-slate-900">{activeListing.donorName}</p>
                <p className="flex items-center gap-1.5 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {activeListing.location.address}
                </p>
                {activeListing.location.landmark && (
                  <p className="text-slate-500 italic">Note: {activeListing.location.landmark}</p>
                )}
                <p className="flex items-center gap-1.5 text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {activeListing.location.contactPerson} ({activeListing.location.phone})
                </p>
              </div>

              {activeListing.status === 'claimed' && (
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Verification Code at Pickup
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={verificationInput || activeListing.verificationCode}
                        onChange={(e) => setVerificationInput(e.target.value)}
                        placeholder="e.g. FB-8821"
                        className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900 w-32 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      />
                      <span className="text-[11px] text-slate-500">
                        Ask donor for 4-digit code to verify handover
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      📸 Pickup Photo Proof & Quality Check
                    </label>
                    <div className="flex items-center gap-3">
                      <img
                        src={selectedPhotoProof}
                        alt="Pickup verification"
                        className="w-14 h-14 rounded-xl object-cover border border-slate-200 shadow-xs"
                      />
                      <div className="space-y-1 text-xs">
                        <select
                          value={selectedPhotoProof}
                          onChange={(e) => setSelectedPhotoProof(e.target.value)}
                          className="px-2 py-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-white"
                        >
                          <option value="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80">
                            Food Trays in Insulated Box
                          </option>
                          <option value="https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80">
                            Loaded Crates in Vehicle
                          </option>
                          <option value="https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80">
                            Fresh Bakery Baskets
                          </option>
                        </select>
                        <p className="text-[11px] text-emerald-600 font-medium">+25 pts for photo proof</p>
                      </div>
                    </div>
                  </div>

                  <button
                    id="btn-confirm-pickup"
                    onClick={handleConfirmPickup}
                    disabled={isSubmitting}
                    className="w-full mt-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Food Collected & Start Delivery</span>
                  </button>
                </div>
              )}
            </div>

            {/* Step 2: Deliver to NGO */}
            <div
              className={`p-5 rounded-2xl border transition-all ${
                activeListing.status === 'in_transit'
                  ? 'bg-white border-emerald-400 ring-2 ring-emerald-100 shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                      activeListing.status === 'in_transit'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-300 text-slate-700'
                    }`}
                  >
                    2
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">Step 2: Deliver to NGO Hub</h4>
                </div>
                <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                  {activeListing.assignedNgo?.beneficiariesCount} Beneficiaries
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-700">
                <p className="font-semibold text-slate-900">{activeListing.assignedNgo?.name}</p>
                <p className="flex items-center gap-1.5 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {activeListing.assignedNgo?.address}
                </p>
                <p className="flex items-center gap-1.5 text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  Contact: {activeListing.assignedNgo?.contactPerson} ({activeListing.assignedNgo?.phone})
                </p>
              </div>

              {activeListing.status === 'in_transit' && (
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Received By (Staff)
                      </label>
                      <input
                        type="text"
                        value={receiverName}
                        onChange={(e) => setReceiverName(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Meals Distributed
                      </label>
                      <input
                        type="number"
                        value={beneficiariesServed}
                        onChange={(e) => setBeneficiariesServed(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      📸 Delivery & Beneficiaries Photo Proof
                    </label>
                    <div className="flex items-center gap-3">
                      <img
                        src={deliveryPhotoProof}
                        alt="Delivery proof"
                        className="w-14 h-14 rounded-xl object-cover border border-slate-200 shadow-xs"
                      />
                      <select
                        value={deliveryPhotoProof}
                        onChange={(e) => setDeliveryPhotoProof(e.target.value)}
                        className="px-2 py-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-white"
                      >
                        <option value="https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&auto=format&fit=crop&q=80">
                          Community Meal Serving Line
                        </option>
                        <option value="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&auto=format&fit=crop&q=80">
                          Volunteers with Shelter Children
                        </option>
                        <option value="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=600&auto=format&fit=crop&q=80">
                          Senior Pantry Distribution
                        </option>
                      </select>
                    </div>
                  </div>

                  <button
                    id="btn-complete-delivery"
                    onClick={handleConfirmDelivery}
                    disabled={isSubmitting}
                    className="w-full mt-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Award className="w-4 h-4" />
                    <span>Complete Delivery & Earn +100 Points</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Available Pickups Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Surplus Food Ready for Rescue ({availableListings.length})
            </h3>
            <p className="text-xs text-slate-500">
              Accept a nearby donation to prevent food waste and nourish shelter beneficiaries
            </p>
          </div>
        </div>

        {availableListings.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <h4 className="font-bold text-slate-900">All surplus food currently claimed or delivered!</h4>
            <p className="text-xs text-slate-500 mt-1">
              Check back soon as restaurants and hostels prepare their evening surplus batches.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {availableListings.map((listing) => (
              <div
                key={listing.id}
                id={`available-card-${listing.id}`}
                className={`bg-white rounded-2xl border p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                  listing.priority === 'critical'
                    ? 'border-red-300 ring-2 ring-red-100'
                    : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 uppercase">
                      {listing.donorType}
                    </span>
                    <CountdownBadge expiresAt={listing.expiresAt} size="sm" />
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm mb-1 leading-snug">
                    {listing.title}
                  </h4>
                  <p className="text-xs text-slate-600 mb-3">{listing.donorName}</p>

                  <div className="bg-slate-50 rounded-xl p-2.5 text-xs grid grid-cols-2 gap-2 mb-3 border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">QUANTITY</span>
                      <span className="font-bold text-slate-900 font-mono">{listing.quantityKg} kg</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">MEALS</span>
                      <span className="font-bold text-slate-900 font-mono">~{listing.servingsCount}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 flex items-center gap-1 mb-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{listing.location.address}</span>
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-700">
                    {listing.priority === 'critical' ? '+150 Pts (Urgent Bonus)' : '+100 Pts'}
                  </span>
                  <button
                    id={`accept-btn-${listing.id}`}
                    onClick={() => onClaimListing(listing, currentVolunteer.id)}
                    className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer"
                  >
                    <span>Accept Pickup</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Volunteer Leaderboard & Recognition */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Volunteer Rescuer Leaderboard</h3>
              <p className="text-xs text-slate-500">Top contributors making zero food waste a reality</p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
            42 Active Volunteers
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {volunteers.map((vol, index) => (
            <div
              key={vol.id}
              className={`py-3.5 px-4 flex items-center justify-between rounded-xl transition-colors ${
                vol.id === currentVolunteer.id ? 'bg-blue-50/70 font-semibold' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0
                      ? 'bg-amber-400 text-slate-900'
                      : index === 1
                      ? 'bg-slate-300 text-slate-800'
                      : index === 2
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {index + 1}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{vol.name}</span>
                    {vol.id === currentVolunteer.id && (
                      <span className="text-[10px] bg-blue-600 text-white font-bold px-1.5 py-0.2 rounded-md">
                        YOU
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500">{vol.vehicle} • {vol.deliveriesCompleted} deliveries</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="font-mono font-bold text-slate-900 text-sm block">
                    {vol.points} pts
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold">Tier 1 Rescuer</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
