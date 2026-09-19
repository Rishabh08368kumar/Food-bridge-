import React from 'react';
import {
  Utensils,
  PlusCircle,
  Package,
  CheckCircle2,
  Clock,
  Sparkles,
  MapPin,
  Building,
  ShieldCheck,
  TrendingUp,
  FileCheck
} from 'lucide-react';
import { FoodListing } from '../types.ts';
import { CountdownBadge } from './CountdownBadge.tsx';

interface DonorPortalProps {
  listings: FoodListing[];
  onOpenPostModal: () => void;
  onInspectListing: (listing: FoodListing) => void;
}

export const DonorPortal: React.FC<DonorPortalProps> = ({
  listings,
  onOpenPostModal,
  onInspectListing
}) => {
  const activeDonations = listings.filter((l) => l.status !== 'delivered');
  const pastDonations = listings.filter((l) => l.status === 'delivered');

  const totalKgDonated = listings.reduce((acc, l) => acc + l.quantityKg, 0);
  const totalMeals = listings.reduce((acc, l) => acc + l.servingsCount, 0);

  return (
    <div className="space-y-8">
      {/* Donor Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-2xl font-bold shadow-md shrink-0">
              <Utensils className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-slate-900">Food Donor Management Portal</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  Verified Food Safety Donor
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Restaurants, hotels, university hostels, and catering services turn surplus food into life-saving meals.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenPostModal}
            className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md transition-colors cursor-pointer flex items-center gap-2 self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post New Surplus Food</span>
          </button>
        </div>

        {/* Impact summary row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100">
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
              TOTAL SURPLUS DONATED
            </span>
            <span className="text-2xl font-extrabold text-amber-900 font-mono">
              {totalKgDonated} kg
            </span>
            <p className="text-[11px] text-amber-700 mt-0.5">Commercial-grade food diverted from waste</p>
          </div>

          <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-100">
            <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">
              COMMUNITY MEALS CREATED
            </span>
            <span className="text-2xl font-extrabold text-teal-900 font-mono">
              ~{totalMeals} meals
            </span>
            <p className="text-[11px] text-teal-700 mt-0.5">Distributed to verified shelters and dining rooms</p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
              GOOD SAMARITAN LEGAL COMPLIANCE
            </span>
            <span className="text-sm font-bold text-emerald-900 block mt-1">
              ✓ Food Donation Protection Act Compliant
            </span>
            <p className="text-[11px] text-emerald-700 mt-0.5">Automated timestamped quality audit trail</p>
          </div>
        </div>
      </div>

      {/* Active Donations Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <h3 className="text-lg font-bold text-slate-900 mb-2">
          Active Surplus Food Batches ({activeDonations.length})
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          Real-time pickup coordination with verified volunteer couriers
        </p>

        {activeDonations.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <Package className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">No active surplus batches right now.</p>
            <button
              onClick={onOpenPostModal}
              className="mt-3 text-xs font-semibold text-emerald-600 hover:underline cursor-pointer"
            >
              + Post a new donation batch
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {activeDonations.map((listing) => (
              <div
                key={listing.id}
                className="p-5 rounded-2xl border border-slate-200 hover:border-slate-300 bg-slate-50/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 text-sm">{listing.title}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-800 uppercase">
                      {listing.donorType}
                    </span>
                    <CountdownBadge expiresAt={listing.expiresAt} size="sm" />
                  </div>

                  <p className="text-xs text-slate-600">{listing.description}</p>

                  <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                    <span className="font-bold text-slate-900 font-mono">{listing.quantityKg} kg</span>
                    <span>•</span>
                    <span>~{listing.servingsCount} portions</span>
                    <span>•</span>
                    <span className="text-purple-700 font-medium">
                      Assigned NGO: {listing.assignedNgo?.name}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  {listing.status === 'available' && (
                    <div className="text-right">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 block">
                        Waiting for Courier
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono mt-1 block">
                        Code: {listing.verificationCode}
                      </span>
                    </div>
                  )}

                  {listing.status === 'claimed' && (
                    <div className="text-right">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 block">
                        Courier Dispatched
                      </span>
                      <span className="text-[11px] text-slate-600 block mt-1">
                        {listing.claimedByVolunteer?.name} ({listing.claimedByVolunteer?.vehicleType})
                      </span>
                    </div>
                  )}

                  {listing.status === 'in_transit' && (
                    <div className="text-right">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 block">
                        Collected & In Transit
                      </span>
                      <span className="text-[11px] text-slate-500 block mt-1">
                        Heading to shelter
                      </span>
                    </div>
                  )}

                  <button
                    onClick={() => onInspectListing(listing)}
                    className="p-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Donations & Proofs */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <h3 className="text-lg font-bold text-slate-900 mb-1">
          Recent Completed Rescues & ESG Records ({pastDonations.length})
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          Verified delivery proofs for company social responsibility reporting
        </p>

        <div className="space-y-3">
          {pastDonations.map((listing) => (
            <div
              key={listing.id}
              className="p-4 rounded-xl border border-slate-200 flex items-center justify-between gap-4 text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-bold text-slate-900">{listing.title}</span>
                  <span className="text-emerald-700 font-mono font-bold">({listing.quantityKg} kg)</span>
                </div>
                <p className="text-slate-500 mt-1 pl-6">
                  Delivered to {listing.assignedNgo?.name} • Received by {listing.deliveryProof?.receiverName}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  Proof Verified
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
