import React, { useState } from 'react';
import {
  Building2,
  Users,
  PackageCheck,
  Truck,
  PlusCircle,
  Clock,
  Phone,
  CheckCircle2,
  AlertCircle,
  HeartHandshake
} from 'lucide-react';
import { NGO, FoodListing } from '../types.ts';

interface NgoDashboardProps {
  ngos: NGO[];
  listings: FoodListing[];
  onSelectNgo?: (ngo: NGO) => void;
}

export const NgoDashboard: React.FC<NgoDashboardProps> = ({ ngos, listings }) => {
  const [selectedNgoId, setSelectedNgoId] = useState<string>(ngos[0]?.id || '');
  const [newNeedText, setNewNeedText] = useState<string>('');
  const [customRequests, setCustomRequests] = useState<{ id: string; ngoName: string; text: string; time: string }[]>([
    {
      id: 'req-1',
      ngoName: 'Hope Center Shelter & Kitchen',
      text: 'Urgent: Expecting 40 additional dinner beneficiaries tonight. Seeking hearty cooked rice, lentils, or pasta.',
      time: '35 mins ago'
    },
    {
      id: 'req-2',
      ngoName: 'Golden Gate Youth Haven',
      text: 'Seeking fresh fruits (apples, bananas) and shelf-stable snacks for after-school youth program.',
      time: '2 hours ago'
    }
  ]);

  const selectedNgo = ngos.find((n) => n.id === selectedNgoId) || ngos[0];

  // Incoming deliveries for this NGO
  const incomingDeliveries = listings.filter(
    (l) =>
      (l.status === 'in_transit' || l.status === 'claimed') &&
      l.assignedNgo?.id === selectedNgo?.id
  );

  // Delivered items for this NGO
  const completedDeliveries = listings.filter(
    (l) => l.status === 'delivered' && l.assignedNgo?.id === selectedNgo?.id
  );

  const handlePostNeed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNeedText.trim()) return;

    setCustomRequests([
      {
        id: `req-${Date.now()}`,
        ngoName: selectedNgo.name,
        text: newNeedText,
        time: 'Just now'
      },
      ...customRequests
    ]);
    setNewNeedText('');
  };

  return (
    <div className="space-y-8">
      {/* NGO Hub Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-purple-600 text-white flex items-center justify-center text-2xl font-bold shadow-md shrink-0">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{selectedNgo?.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                  {selectedNgo?.type}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {selectedNgo?.address} • Contact: {selectedNgo?.contactPerson} ({selectedNgo?.phone})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Select Distribution Center
              </label>
              <select
                value={selectedNgoId}
                onChange={(e) => setSelectedNgoId(e.target.value)}
                className="text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
              >
                {ngos.map((ngo) => (
                  <option key={ngo.id} value={ngo.id}>
                    {ngo.name} ({ngo.beneficiariesCount} people)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Capacity & Meals Intake Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100">
            <div className="flex items-center gap-2 text-purple-700 text-xs font-semibold mb-1">
              <Users className="w-4 h-4" />
              <span>REGULAR BENEFICIARIES</span>
            </div>
            <p className="text-2xl font-bold text-purple-900 font-mono">
              {selectedNgo?.beneficiariesCount} people
            </p>
            <p className="text-[11px] text-purple-700 mt-0.5">Shelter residents & evening meal line</p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
            <div className="flex items-center gap-2 text-emerald-700 text-xs font-semibold mb-1">
              <PackageCheck className="w-4 h-4" />
              <span>FOOD RECEIVED TODAY</span>
            </div>
            <p className="text-2xl font-bold text-emerald-900 font-mono">
              {selectedNgo?.foodReceivedTodayKg} kg
            </p>
            <p className="text-[11px] text-emerald-700 mt-0.5">
              Daily target: {selectedNgo?.currentDailyNeedKg} kg (
              {Math.round(((selectedNgo?.foodReceivedTodayKg || 0) / (selectedNgo?.currentDailyNeedKg || 1)) * 100)}% met)
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100">
            <div className="flex items-center gap-2 text-blue-700 text-xs font-semibold mb-1">
              <Truck className="w-4 h-4" />
              <span>INCOMING SHIPMENTS</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 font-mono">
              {incomingDeliveries.length} in transit
            </p>
            <p className="text-[11px] text-blue-700 mt-0.5">Verified couriers en route</p>
          </div>
        </div>
      </div>

      {/* Incoming Deliveries Live Ticker */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <h3 className="text-lg font-bold text-slate-900 mb-2">Live Incoming Shipments</h3>
        <p className="text-xs text-slate-500 mb-6">
          Track volunteer couriers heading to {selectedNgo?.name} with rescued food
        </p>

        {incomingDeliveries.length === 0 ? (
          <div className="p-6 bg-slate-50 rounded-2xl text-center border border-dashed border-slate-200">
            <PackageCheck className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-600">No active shipments in transit right now.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              New deliveries will appear automatically as volunteers accept pickups.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {incomingDeliveries.map((delivery) => (
              <div
                key={delivery.id}
                className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white uppercase">
                      IN TRANSIT
                    </span>
                    <span className="text-xs font-bold text-slate-900">{delivery.title}</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    From: <span className="font-semibold">{delivery.donorName}</span> • Courier:{' '}
                    <span className="font-semibold">{delivery.claimedByVolunteer?.name}</span> ({delivery.claimedByVolunteer?.vehicleType})
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {delivery.quantityKg} kg • ~{delivery.servingsCount} meals • {delivery.storageTemp} storage
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs font-bold text-blue-700 block">ETA ~14 mins</span>
                    <span className="text-[10px] text-slate-500">GPS Live tracking</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Broadcast Food Requirements to Donors & Community */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Post Food Request */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <HeartHandshake className="w-5 h-5 text-purple-600" />
            <h3 className="text-base font-bold text-slate-900">Broadcast Urgent Food Need</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Let nearby catering services, canteens, and restaurants know your immediate food requirements.
          </p>

          <form onSubmit={handlePostNeed} className="space-y-4">
            <div>
              <textarea
                rows={3}
                value={newNeedText}
                onChange={(e) => setNewNeedText(e.target.value)}
                placeholder="e.g. Expecting 50 additional guests tonight at our dining hall. Need rice, cooked vegetables, or bread."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Broadcast Need to Nearby Donors</span>
            </button>
          </form>
        </div>

        {/* Community Needs Bulletin */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-1">Active Community Needs Bulletin</h3>
          <p className="text-xs text-slate-500 mb-4">Live requests from local shelters & food banks</p>

          <div className="space-y-3">
            {customRequests.map((req) => (
              <div key={req.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900">{req.ngoName}</span>
                  <span className="text-[10px] text-slate-400">{req.time}</span>
                </div>
                <p className="text-slate-600 leading-relaxed">{req.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
