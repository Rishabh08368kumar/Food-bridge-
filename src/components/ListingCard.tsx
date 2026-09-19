import React from 'react';
import {
  MapPin,
  Utensils,
  Package,
  Thermometer,
  ShieldCheck,
  ChevronRight,
  UserCheck,
  Building,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import { FoodListing } from '../types.ts';
import { CountdownBadge } from './CountdownBadge.tsx';

interface ListingCardProps {
  listing: FoodListing;
  onClaim?: (listing: FoodListing) => void;
  onViewOnMap?: (listing: FoodListing) => void;
  onInspect?: (listing: FoodListing) => void;
  isVolunteerLoggedIn?: boolean;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  onClaim,
  onViewOnMap,
  onInspect,
  isVolunteerLoggedIn = true
}) => {
  const isAvailable = listing.status === 'available';
  const isInTransit = listing.status === 'in_transit' || listing.status === 'claimed';
  const isDelivered = listing.status === 'delivered';

  const getDietaryBadgeColor = (type: string) => {
    switch (type) {
      case 'vegan':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'vegetarian':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'halal':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getDonorTypeBadge = (type: string) => {
    switch (type) {
      case 'restaurant':
        return 'Restaurant';
      case 'hostel':
        return 'Hostel Mess';
      case 'canteen':
        return 'Campus Canteen';
      case 'catering':
        return 'Event Catering';
      case 'supermarket':
        return 'Bakery / Market';
      default:
        return 'Food Donor';
    }
  };

  return (
    <div
      id={`listing-card-${listing.id}`}
      className={`rounded-2xl border transition-all duration-200 bg-white flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
        listing.priority === 'critical' && isAvailable
          ? 'border-red-300 ring-2 ring-red-100'
          : listing.priority === 'urgent' && isAvailable
          ? 'border-amber-300'
          : 'border-slate-200'
      }`}
    >
      <div className="p-5">
        {/* Top Meta Bar */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 uppercase tracking-wide border border-slate-200">
              {getDonorTypeBadge(listing.donorType)}
            </span>
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border capitalize ${getDietaryBadgeColor(
                listing.dietaryType
              )}`}
            >
              {listing.dietaryType}
            </span>
            <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
              <Thermometer className="w-3 h-3 text-slate-400" />
              {listing.storageTemp}
            </span>
          </div>

          <div className="shrink-0">
            <CountdownBadge expiresAt={listing.expiresAt} size="sm" />
          </div>
        </div>

        {/* Title & Donor Name */}
        <h3 className="font-semibold text-slate-900 text-base leading-snug mb-1 line-clamp-2">
          {listing.title}
        </h3>
        <p className="text-xs font-medium text-slate-600 mb-3 flex items-center gap-1.5">
          <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{listing.donorName}</span>
        </p>

        <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
          {listing.description}
        </p>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-semibold text-slate-500">Quantity</p>
              <p className="text-sm font-bold text-slate-900 font-mono">{listing.quantityKg} kg</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-semibold text-slate-500">Meals Approx</p>
              <p className="text-sm font-bold text-slate-900 font-mono">~{listing.servingsCount} meals</p>
            </div>
          </div>
        </div>

        {/* Address & NGO Target */}
        <div className="space-y-1.5 text-xs text-slate-600">
          <div className="flex items-start gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
            <span className="truncate font-medium">{listing.location.address}</span>
          </div>

          {listing.assignedNgo && (
            <div className="flex items-start gap-1.5 text-purple-700 bg-purple-50 px-2 py-1 rounded-md border border-purple-100">
              <Building className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span className="truncate font-medium">
                Destination: {listing.assignedNgo.name} ({listing.assignedNgo.beneficiariesCount} people)
              </span>
            </div>
          )}

          {listing.claimedByVolunteer && (
            <div className="flex items-center gap-1.5 text-blue-700 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
              <UserCheck className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate font-medium">
                Volunteer: {listing.claimedByVolunteer.name} ({listing.claimedByVolunteer.vehicleType})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
        {isAvailable && (
          <>
            {onViewOnMap && (
              <button
                id={`btn-view-map-${listing.id}`}
                onClick={() => onViewOnMap(listing)}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                View on Map
              </button>
            )}

            {onClaim && (
              <button
                id={`btn-claim-pickup-${listing.id}`}
                onClick={() => onClaim(listing)}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer"
              >
                <span>Accept Pickup</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </>
        )}

        {isInTransit && (
          <div className="flex items-center justify-between w-full">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
              {listing.status === 'in_transit' ? 'In Transit to NGO' : 'Volunteer Assigned'}
            </span>
            {onInspect && (
              <button
                id={`btn-track-route-${listing.id}`}
                onClick={() => onInspect(listing)}
                className="text-xs font-semibold text-blue-700 hover:text-blue-900 underline cursor-pointer"
              >
                Track Live →
              </button>
            )}
          </div>
        )}

        {isDelivered && (
          <div className="flex items-center justify-between w-full">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Delivered & Verified
            </span>
            {onInspect && (
              <button
                id={`btn-view-proof-${listing.id}`}
                onClick={() => onInspect(listing)}
                className="text-xs font-semibold text-slate-700 hover:text-slate-900 underline cursor-pointer"
              >
                View Delivery Proof
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
