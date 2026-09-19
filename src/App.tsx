import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { DistributionMap } from './components/DistributionMap.tsx';
import { VolunteerDashboard } from './components/VolunteerDashboard.tsx';
import { NgoDashboard } from './components/NgoDashboard.tsx';
import { DonorPortal } from './components/DonorPortal.tsx';
import { ImpactDashboard } from './components/ImpactDashboard.tsx';
import { PostFoodModal } from './components/PostFoodModal.tsx';
import { ListingDetailModal } from './components/ListingDetailModal.tsx';
import { FoodListing, DistributionRoute, NGO, Volunteer, ImpactMetrics } from './types.ts';
import {
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  MapPin,
  HeartHandshake
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'map' | 'donor' | 'volunteer' | 'ngo' | 'impact'>('map');
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [routes, setRoutes] = useState<DistributionRoute[]>([]);
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [metrics, setMetrics] = useState<ImpactMetrics>({
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
  });

  const [currentVolunteer, setCurrentVolunteer] = useState<Volunteer | null>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState<boolean>(false);
  const [selectedListing, setSelectedListing] = useState<FoodListing | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'urgent' } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Show Toast
  const showToast = (text: string, type: 'success' | 'info' | 'urgent' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Fetch initial data
  const fetchData = async () => {
    try {
      const [listingsRes, routesRes, ngosRes, volunteersRes, metricsRes] = await Promise.all([
        fetch('/api/listings').then((r) => r.json()),
        fetch('/api/routes').then((r) => r.json()),
        fetch('/api/ngos').then((r) => r.json()),
        fetch('/api/volunteers').then((r) => r.json()),
        fetch('/api/metrics').then((r) => r.json())
      ]);

      setListings(listingsRes);
      setRoutes(routesRes);
      setNgos(ngosRes);
      setVolunteers(volunteersRes);
      setMetrics(metricsRes);
      if (!currentVolunteer && volunteersRes.length > 0) {
        setCurrentVolunteer(volunteersRes[0]);
      }
    } catch (err) {
      console.error('Error fetching initial data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Poll updates every 15s to keep real-time sync
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  // Post Surplus Food (Donor)
  const handlePostFood = async (data: Partial<FoodListing> & { targetNgoId?: string }) => {
    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const newListing = await res.json();
      setListings((prev) => [newListing, ...prev]);
      showToast(`Surplus food posted! Volunteer couriers within 5km notified.`, 'success');
      await fetchData();
    } catch (err) {
      console.error(err);
      showToast('Error posting food listing', 'urgent');
    }
  };

  // Claim Pickup (Volunteer)
  const handleClaimListing = async (listing: FoodListing, volunteerId?: string) => {
    const volId = volunteerId || currentVolunteer?.id || volunteers[0]?.id;
    try {
      const res = await fetch(`/api/listings/${listing.id}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ volunteerId: volId })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Pickup accepted! Navigate to ${listing.donorName} for collection.`, 'info');
        await fetchData();
        setActiveTab('volunteer');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to claim pickup', 'urgent');
    }
  };

  // Food Collected (Volunteer)
  const handlePickupListing = async (
    listingId: string,
    proof: { photoUrl: string; notes: string; verificationCode: string }
  ) => {
    try {
      const res = await fetch(`/api/listings/${listingId}/pickup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proof)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Food pickup verified! Delivery route activated on live map.', 'success');
        await fetchData();
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to verify pickup', 'urgent');
    }
  };

  // Food Delivered (Volunteer / NGO)
  const handleDeliverListing = async (
    listingId: string,
    proof: { photoUrl: string; receiverName: string; beneficiariesServed: number; notes: string }
  ) => {
    try {
      const res = await fetch(`/api/listings/${listingId}/deliver`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proof)
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          `Delivery verified! +100 Contribution Points awarded. Social impact recorded.`,
          'success'
        );
        await fetchData();
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to record delivery', 'urgent');
    }
  };

  // Reset to initial baseline metrics
  const handleResetDemo = async () => {
    try {
      await fetch('/api/reset-demo', { method: 'POST' });
      await fetchData();
      showToast('Demo reset to initial baseline impact metrics: 128kg donated, 356 meals.', 'info');
    } catch (err) {
      console.error(err);
    }
  };

  const completedListings = listings.filter((l) => l.status === 'delivered');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Global Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenPostModal={() => setIsPostModalOpen(true)}
        listings={listings}
        onResetDemo={handleResetDemo}
        onSelectListing={(listing) => {
          setSelectedListing(listing);
        }}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-xs font-semibold ${
              toastMessage.type === 'success'
                ? 'bg-emerald-900 text-white border-emerald-700'
                : toastMessage.type === 'urgent'
                ? 'bg-red-900 text-white border-red-700'
                : 'bg-slate-900 text-white border-slate-700'
            }`}
          >
            {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {toastMessage.type === 'urgent' && <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />}
            {toastMessage.type === 'info' && <HeartHandshake className="w-4 h-4 text-blue-400 shrink-0" />}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mr-2 text-emerald-600" />
            <span className="text-sm font-semibold">Connecting to FoodBridge network...</span>
          </div>
        ) : (
          <>
            {/* TAB 1: Live Distribution Map */}
            {activeTab === 'map' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-serif">
                      Real-Time Distribution Routes
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1">
                      Live tracking of food donors, volunteer couriers, and NGO distribution hubs with GPS route animation.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsPostModalOpen(true)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer"
                    >
                      + Donate Surplus Food
                    </button>
                  </div>
                </div>

                <DistributionMap
                  listings={listings}
                  routes={routes}
                  ngos={ngos}
                  volunteers={volunteers}
                  onSelectListing={(listing) => setSelectedListing(listing)}
                  onClaimListing={(listing) => handleClaimListing(listing)}
                />
              </div>
            )}

            {/* TAB 2: Volunteer Hub */}
            {activeTab === 'volunteer' && currentVolunteer && (
              <VolunteerDashboard
                volunteers={volunteers}
                listings={listings}
                ngos={ngos}
                currentVolunteer={currentVolunteer}
                onClaimListing={handleClaimListing}
                onPickupListing={handlePickupListing}
                onDeliverListing={handleDeliverListing}
                onSwitchVolunteer={(vol) => setCurrentVolunteer(vol)}
              />
            )}

            {/* TAB 3: NGO Hub */}
            {activeTab === 'ngo' && (
              <NgoDashboard ngos={ngos} listings={listings} />
            )}

            {/* TAB 4: Donor Portal */}
            {activeTab === 'donor' && (
              <DonorPortal
                listings={listings}
                onOpenPostModal={() => setIsPostModalOpen(true)}
                onInspectListing={(listing) => setSelectedListing(listing)}
              />
            )}

            {/* TAB 5: Impact & Social Evaluation */}
            {activeTab === 'impact' && (
              <ImpactDashboard
                metrics={metrics}
                completedListings={completedListings}
                onOpenMap={() => setActiveTab('map')}
              />
            )}
          </>
        )}
      </main>

      {/* Post Surplus Food Modal */}
      <PostFoodModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        ngos={ngos}
        onSubmit={handlePostFood}
      />

      {/* Inspect Listing Details Modal */}
      <ListingDetailModal
        listing={selectedListing}
        onClose={() => setSelectedListing(null)}
        onClaim={handleClaimListing}
      />

      {/* Minimal Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-slate-500 text-xs text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} FoodBridge Platform. Connecting surplus food with communities in need.</p>
          <div className="flex items-center gap-4 text-[11px] font-medium text-slate-600">
            <span>Verified Volunteers: <strong>{metrics.activeVolunteers}</strong></span>
            <span>•</span>
            <span>Food Rescued: <strong>{metrics.foodDonatedKg} kg</strong></span>
            <span>•</span>
            <span>Meals Served: <strong>{metrics.mealsRedistributed}</strong></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
