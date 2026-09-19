import React from 'react';
import {
  Utensils,
  MapPin,
  HeartHandshake,
  Building2,
  BarChart3,
  PlusCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { FoodListing } from '../types.ts';

interface HeaderProps {
  activeTab: 'map' | 'donor' | 'volunteer' | 'ngo' | 'impact';
  setActiveTab: (tab: 'map' | 'donor' | 'volunteer' | 'ngo' | 'impact') => void;
  onOpenPostModal: () => void;
  listings: FoodListing[];
  onResetDemo: () => void;
  onSelectListing: (listing: FoodListing) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenPostModal,
  listings,
  onResetDemo,
  onSelectListing
}) => {
  // Find critical listings expiring in less than 90 minutes
  const now = new Date().getTime();
  const criticalListings = listings.filter((l) => {
    if (l.status !== 'available') return false;
    const diff = (new Date(l.expiresAt).getTime() - now) / (1000 * 60);
    return diff > 0 && diff <= 90;
  });

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* 🚨 Emergency Expiry Alert Ribbon */}
      {criticalListings.length > 0 && (
        <div
          id="emergency-expiry-ticker"
          className="bg-red-600 text-white px-4 py-1.5 text-xs sm:text-sm font-medium flex items-center justify-between overflow-hidden shadow-inner"
        >
          <div className="flex items-center gap-2 truncate">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-200" />
            <span className="font-bold tracking-wide uppercase text-amber-200">
              URGENT EXPIRY ALERT ({criticalListings.length}):
            </span>
            <span className="truncate">
              "{criticalListings[0].title}" ({criticalListings[0].quantityKg} kg / {criticalListings[0].servingsCount} meals) requires rapid pickup!
            </span>
          </div>
          <button
            id="rush-pickup-banner-btn"
            onClick={() => {
              onSelectListing(criticalListings[0]);
              setActiveTab('volunteer');
            }}
            className="shrink-0 ml-3 underline decoration-amber-200 hover:text-amber-100 font-bold text-xs uppercase tracking-wider cursor-pointer"
          >
            Rush Pickup →
          </button>
        </div>
      )}

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('map')}
              className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-hidden"
              id="brand-home-btn"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                <Utensils className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-bold tracking-tight text-slate-900 font-serif">
                    FoodBridge
                  </span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                    LIVE
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                  Surplus Food Rescue & Real-Time Distribution
                </p>
              </div>
            </button>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/70">
            <button
              id="nav-tab-map"
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'map'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>Live Route Map</span>
            </button>

            <button
              id="nav-tab-volunteer"
              onClick={() => setActiveTab('volunteer')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'volunteer'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5 text-blue-600" />
              <span>Volunteer Hub</span>
            </button>

            <button
              id="nav-tab-ngo"
              onClick={() => setActiveTab('ngo')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'ngo'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-purple-600" />
              <span>NGO Hub</span>
            </button>

            <button
              id="nav-tab-donor"
              onClick={() => setActiveTab('donor')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'donor'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Utensils className="w-3.5 h-3.5 text-amber-600" />
              <span>Donor Portal</span>
            </button>

            <button
              id="nav-tab-impact"
              onClick={() => setActiveTab('impact')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'impact'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Impact & Audit</span>
            </button>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              id="btn-post-surplus-header"
              onClick={onOpenPostModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Post Surplus Food</span>
              <span className="sm:hidden">Donate</span>
            </button>

            <button
              id="btn-reset-demo"
              onClick={onResetDemo}
              title="Reset metrics and test listings"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden items-center justify-between overflow-x-auto py-2 gap-1 border-t border-slate-100">
          <button
            onClick={() => setActiveTab('map')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              activeTab === 'map' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-600'
            }`}
          >
            Live Map
          </button>
          <button
            onClick={() => setActiveTab('volunteer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              activeTab === 'volunteer' ? 'bg-blue-50 text-blue-800 font-bold' : 'text-slate-600'
            }`}
          >
            Volunteer Hub
          </button>
          <button
            onClick={() => setActiveTab('ngo')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              activeTab === 'ngo' ? 'bg-purple-50 text-purple-800 font-bold' : 'text-slate-600'
            }`}
          >
            NGO Hub
          </button>
          <button
            onClick={() => setActiveTab('donor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              activeTab === 'donor' ? 'bg-amber-50 text-amber-800 font-bold' : 'text-slate-600'
            }`}
          >
            Donor Portal
          </button>
          <button
            onClick={() => setActiveTab('impact')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              activeTab === 'impact' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-600'
            }`}
          >
            Impact
          </button>
        </div>
      </div>
    </header>
  );
};
