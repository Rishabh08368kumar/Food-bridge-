import React from 'react';
import {
  X,
  MapPin,
  Clock,
  Package,
  Building,
  User,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Thermometer,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { FoodListing } from '../types.ts';
import { CountdownBadge } from './CountdownBadge.tsx';

interface ListingDetailModalProps {
  listing: FoodListing | null;
  onClose: () => void;
  onClaim?: (listing: FoodListing) => void;
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({
  listing,
  onClose,
  onClaim
}) => {
  if (!listing) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 uppercase">
              {listing.donorType}
            </span>
            <CountdownBadge expiresAt={listing.expiresAt} size="sm" />
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">{listing.title}</h3>
            <p className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <span>{listing.donorName}</span>
            </p>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            {listing.description}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">WEIGHT</span>
              <span className="text-base font-bold text-slate-900 font-mono">{listing.quantityKg} kg</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">MEALS</span>
              <span className="text-base font-bold text-slate-900 font-mono">~{listing.servingsCount}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">DIET</span>
              <span className="text-xs font-bold text-emerald-700 capitalize">{listing.dietaryType}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">TEMP</span>
              <span className="text-xs font-bold text-blue-700 capitalize">{listing.storageTemp}</span>
            </div>
          </div>

          {/* Location details */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
            <h4 className="font-bold text-slate-900">Pickup Location</h4>
            <p className="text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {listing.location.address}, {listing.location.city}
            </p>
            {listing.location.landmark && (
              <p className="text-slate-500 italic pl-5">Landmark: {listing.location.landmark}</p>
            )}
            <p className="text-slate-700 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              Contact: {listing.location.contactPerson} ({listing.location.phone})
            </p>
          </div>

          {/* NGO destination */}
          {listing.assignedNgo && (
            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 space-y-1.5 text-xs">
              <h4 className="font-bold text-purple-900">Designated Beneficiary NGO</h4>
              <p className="text-purple-800 font-medium">{listing.assignedNgo.name}</p>
              <p className="text-purple-700">{listing.assignedNgo.address}</p>
              <p className="text-purple-600 text-[11px]">
                Serving: {listing.assignedNgo.beneficiariesCount} shelter residents & community beneficiaries
              </p>
            </div>
          )}

          {/* Verification Code */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                HANDOVER VERIFICATION CODE
              </span>
              <span className="text-xl font-mono font-extrabold text-emerald-900">
                {listing.verificationCode}
              </span>
            </div>
            <span className="text-[11px] text-emerald-700 max-w-[200px] text-right">
              Volunteer presents this code to donor upon collection
            </span>
          </div>

          {/* Pickup Proof Photo if available */}
          {listing.pickupProof && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Pickup Photo Proof</span>
              </h4>
              {listing.pickupProof.photoUrl && (
                <img
                  src={listing.pickupProof.photoUrl}
                  alt="Pickup proof"
                  className="w-full h-44 rounded-2xl object-cover border border-slate-200"
                />
              )}
              <p className="text-xs text-slate-600 italic">{listing.pickupProof.notes}</p>
            </div>
          )}

          {/* Delivery Proof Photo if available */}
          {listing.deliveryProof && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Delivery & Beneficiary Sign-Off Proof</span>
              </h4>
              {listing.deliveryProof.photoUrl && (
                <img
                  src={listing.deliveryProof.photoUrl}
                  alt="Delivery proof"
                  className="w-full h-44 rounded-2xl object-cover border border-slate-200"
                />
              )}
              <div className="text-xs text-slate-600 flex items-center justify-between">
                <span>Received by: <strong>{listing.deliveryProof.receiverName}</strong></span>
                <span>Beneficiaries: <strong>{listing.deliveryProof.beneficiariesServed}</strong></span>
              </div>
              <p className="text-xs text-slate-600 italic">{listing.deliveryProof.notes}</p>
            </div>
          )}

          {/* Action button */}
          {listing.status === 'available' && onClaim && (
            <button
              onClick={() => {
                onClaim(listing);
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md transition-colors cursor-pointer"
            >
              Accept This Pickup
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
