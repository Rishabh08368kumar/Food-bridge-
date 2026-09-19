import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Award,
  Users,
  Utensils,
  Leaf,
  Droplets,
  ShieldCheck,
  CheckCircle2,
  Download,
  Calendar,
  Building,
  DollarSign
} from 'lucide-react';
import { ImpactMetrics, FoodListing } from '../types.ts';

interface ImpactDashboardProps {
  metrics: ImpactMetrics;
  completedListings: FoodListing[];
  onOpenMap: () => void;
}

export const ImpactDashboard: React.FC<ImpactDashboardProps> = ({
  metrics,
  completedListings,
  onOpenMap
}) => {
  const handlePrintAudit = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Hero Social Evaluation Statement */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-8 sm:p-10 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified Social Evaluation & Impact Metrics</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-serif mb-3">
            Quantifiable Proof of Food Rescued
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            Rather than relying on abstract claims, FoodBridge tracks every kilogram from donor to beneficiary.
            Real-time GPS dispatching and photographic delivery sign-offs ensure 100% transparency.
          </p>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={onOpenMap}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs transition-colors shadow-sm cursor-pointer"
            >
              View Real-Time Distribution Map →
            </button>
            <button
              onClick={handlePrintAudit}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors border border-white/20 cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Social Audit Certificate</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5 Core Required Measurable Metrics Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900">Verified Impact Dashboard</h3>
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            Live Audit Stream
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* 1. Food Donated */}
          <div
            id="metric-food-donated"
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition-colors"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <Utensils className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Food Donated
              </p>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                {metrics.foodDonatedKg} <span className="text-lg font-semibold text-slate-500">kg</span>
              </p>
              <p className="text-[11px] text-emerald-600 font-medium mt-1">Direct from commercial kitchens</p>
            </div>
          </div>

          {/* 2. Meals Redistributed */}
          <div
            id="metric-meals-redistributed"
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between hover:border-teal-300 transition-colors"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3">
                <Users className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Meals Redistributed
              </p>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                {metrics.mealsRedistributed}
              </p>
              <p className="text-[11px] text-teal-600 font-medium mt-1">Wholesome, hot & packed portions</p>
            </div>
          </div>

          {/* 3. Food Waste Prevented */}
          <div
            id="metric-food-waste-prevented"
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between hover:border-lime-300 transition-colors"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-lime-50 text-lime-700 flex items-center justify-center mb-3">
                <Leaf className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Food Waste Prevented
              </p>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                {metrics.foodWastePreventedKg} <span className="text-lg font-semibold text-slate-500">kg</span>
              </p>
              <p className="text-[11px] text-lime-700 font-medium mt-1">Diverted 100% from landfills</p>
            </div>
          </div>

          {/* 4. Active Volunteers */}
          <div
            id="metric-active-volunteers"
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-colors"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <Award className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Active Volunteers
              </p>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                {metrics.activeVolunteers}
              </p>
              <p className="text-[11px] text-blue-600 font-medium mt-1">Verified on-demand couriers</p>
            </div>
          </div>

          {/* 5. Successful Deliveries */}
          <div
            id="metric-successful-deliveries"
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between hover:border-purple-300 transition-colors"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Successful Deliveries
              </p>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                {metrics.successfulDeliveries}
              </p>
              <p className="text-[11px] text-purple-600 font-medium mt-1">100% with photo verification</p>
            </div>
          </div>
        </div>
      </div>

      {/* Environmental & Carbon Offsets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">GHG Emissions Prevented</h4>
              <p className="text-[11px] text-slate-500">Methane avoidance calculation</p>
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-800 font-mono">
            {metrics.co2SavedKg} kg CO₂e
          </p>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            Equivalent to avoiding over 800 miles driven by an average passenger car, stopping landfill methane generation.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">Virtual Water Footprint Saved</h4>
              <p className="text-[11px] text-slate-500">Embedded agricultural water</p>
            </div>
          </div>
          <p className="text-3xl font-extrabold text-cyan-800 font-mono">
            {metrics.waterSavedLiters.toLocaleString()} Liters
          </p>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            Preserved irrigation and processing water required to produce grains, dairy, and produce.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">Economic Value Preserved</h4>
              <p className="text-[11px] text-slate-500">Community budget savings</p>
            </div>
          </div>
          <p className="text-3xl font-extrabold text-amber-800 font-mono">
            ${Math.round(metrics.mealsRedistributed * 4.85).toLocaleString()} USD
          </p>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            Direct grocery and meal preparation savings passed onto charity kitchens, orphanages, and shelters.
          </p>
        </div>
      </div>

      {/* Verified Delivery Proofs Audit Trail */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Verifiable Delivery Proofs Feed</h3>
            <p className="text-xs text-slate-500">Photographic and timestamped chain-of-custody records</p>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
            Chain of Custody Verified
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {completedListings.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-200 p-5 bg-slate-50/50 flex flex-col sm:flex-row gap-4"
            >
              {item.deliveryProof?.photoUrl && (
                <img
                  src={item.deliveryProof.photoUrl}
                  alt="Delivery proof"
                  className="w-full sm:w-36 h-36 rounded-xl object-cover border border-slate-200 shadow-xs shrink-0"
                />
              )}
              <div className="space-y-2 flex-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm line-clamp-1">{item.title}</span>
                  <span className="text-emerald-700 font-mono font-bold">{item.quantityKg} kg</span>
                </div>

                <p className="text-slate-600">
                  <span className="font-semibold">Donor:</span> {item.donorName}
                </p>
                <p className="text-slate-600">
                  <span className="font-semibold">Courier:</span> {item.claimedByVolunteer?.name || 'Volunteer Courier'}
                </p>
                <p className="text-slate-600">
                  <span className="font-semibold">Recipient:</span> {item.assignedNgo?.name}
                </p>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Sign-off: {item.deliveryProof?.receiverName}</span>
                  <span className="font-bold text-emerald-700 font-mono">
                    +{item.servingsCount} beneficiaries fed
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
