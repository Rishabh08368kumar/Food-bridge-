import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Navigation,
  Clock,
  Package,
  Building,
  User,
  ShieldCheck,
  Play,
  Pause,
  Layers,
  MapPin,
  Flame,
  ArrowRight,
  Maximize2
} from 'lucide-react';
import { FoodListing, DistributionRoute, NGO, Volunteer } from '../types.ts';

interface DistributionMapProps {
  listings: FoodListing[];
  routes: DistributionRoute[];
  ngos: NGO[];
  volunteers: Volunteer[];
  onSelectListing: (listing: FoodListing) => void;
  onClaimListing?: (listing: FoodListing) => void;
}

export const DistributionMap: React.FC<DistributionMapProps> = ({
  listings,
  routes,
  ngos,
  volunteers,
  onSelectListing,
  onClaimListing
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routesLayerRef = useRef<L.LayerGroup | null>(null);

  const [selectedRoute, setSelectedRoute] = useState<DistributionRoute | null>(null);
  const [selectedListing, setSelectedListing] = useState<FoodListing | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'routes' | 'donors' | 'ngos'>('all');
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [simulationProgress, setSimulationProgress] = useState<number>(0.35); // 0 to 1

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // already initialized

    // Center around San Francisco Metro Hub
    const map = L.map(mapContainerRef.current, {
      center: [37.7749, -122.42],
      zoom: 13,
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // High quality OpenStreetMap / CartoDB Voyager tiles (clean, light, high-contrast)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      maxZoom: 19
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    routesLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Simulation loop for in-transit courier movement
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setSimulationProgress((prev) => {
        const next = prev + 0.015;
        return next > 0.98 ? 0.05 : next;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [isSimulating]);

  // Render Markers and Polylines
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !markersLayerRef.current || !routesLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    routesLayerRef.current.clearLayers();

    // 1. NGO Hubs
    if (filterType === 'all' || filterType === 'ngos') {
      ngos.forEach((ngo) => {
        const iconHtml = `
          <div class="relative flex items-center justify-center">
            <div class="w-8 h-8 rounded-xl bg-purple-600 border-2 border-white shadow-md flex items-center justify-center text-white text-xs font-bold transform hover:scale-110 transition-transform">
              🏢
            </div>
            <div class="absolute -bottom-5 px-1.5 py-0.5 bg-purple-900/90 text-white rounded text-[9px] font-semibold whitespace-nowrap shadow-sm pointer-events-none">
              ${ngo.name.split(' ')[0]} Hub
            </div>
          </div>
        `;
        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-leaflet-marker',
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const marker = L.marker([ngo.lat, ngo.lng], { icon: customIcon });
        marker.bindPopup(`
          <div class="p-2 min-w-[200px] text-slate-900">
            <span class="text-[10px] font-bold text-purple-700 uppercase tracking-wider">NGO Distribution Hub</span>
            <h4 class="font-bold text-sm text-slate-900">${ngo.name}</h4>
            <p class="text-xs text-slate-600 mt-0.5">${ngo.address}</p>
            <div class="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-medium">
              <span>Beneficiaries:</span>
              <span class="font-bold text-purple-700">${ngo.beneficiariesCount} people</span>
            </div>
            <div class="mt-1 flex items-center justify-between text-xs">
              <span>Today's Intake:</span>
              <span class="font-bold text-emerald-600">${ngo.foodReceivedTodayKg} / ${ngo.currentDailyNeedKg} kg</span>
            </div>
          </div>
        `);
        markersLayerRef.current?.addLayer(marker);
      });
    }

    // 2. Surplus Donors (Available and In-Transit)
    if (filterType === 'all' || filterType === 'donors') {
      listings.forEach((listing) => {
        const isUrgent = listing.priority === 'critical' || listing.priority === 'urgent';
        const isAvailable = listing.status === 'available';

        const iconBg = isUrgent && isAvailable ? 'bg-red-600 ring-4 ring-red-200 animate-pulse' : isAvailable ? 'bg-emerald-600' : 'bg-blue-600';

        const iconHtml = `
          <div class="relative flex items-center justify-center cursor-pointer">
            <div class="w-8 h-8 rounded-xl ${iconBg} border-2 border-white shadow-md flex items-center justify-center text-white text-xs font-bold transform hover:scale-110 transition-transform">
              🍱
            </div>
            <div class="absolute -bottom-5 px-1.5 py-0.5 bg-slate-900/90 text-white rounded text-[9px] font-semibold whitespace-nowrap shadow-sm pointer-events-none">
              ${listing.quantityKg}kg (${listing.servingsCount} meals)
            </div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-leaflet-marker',
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const marker = L.marker([listing.location.lat, listing.location.lng], { icon: customIcon });
        marker.on('click', () => {
          setSelectedListing(listing);
        });

        marker.bindPopup(`
          <div class="p-2 min-w-[220px] text-slate-900">
            <div class="flex items-center justify-between gap-1 mb-1">
              <span class="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">${listing.donorType}</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded font-bold ${isUrgent ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}">
                ${listing.priority.toUpperCase()}
              </span>
            </div>
            <h4 class="font-bold text-sm text-slate-900 leading-snug">${listing.title}</h4>
            <p class="text-xs text-slate-600 mt-1">${listing.donorName}</p>
            <div class="mt-2 p-2 bg-slate-50 rounded-lg text-xs grid grid-cols-2 gap-1 border border-slate-100">
              <div>
                <span class="text-slate-500 block text-[10px]">WEIGHT</span>
                <span class="font-bold text-slate-900">${listing.quantityKg} kg</span>
              </div>
              <div>
                <span class="text-slate-500 block text-[10px]">MEALS</span>
                <span class="font-bold text-slate-900">~${listing.servingsCount}</span>
              </div>
            </div>
            ${
              isAvailable
                ? `<div class="mt-2 text-center text-xs font-semibold text-emerald-700">Click listing card below to accept pickup</div>`
                : `<div class="mt-2 text-xs font-semibold text-blue-600">${listing.status.replace('_', ' ').toUpperCase()}</div>`
            }
          </div>
        `);

        markersLayerRef.current?.addLayer(marker);
      });
    }

    // 3. Active Real-Time Routes & Animated Courier Vehicles
    if (filterType === 'all' || filterType === 'routes') {
      routes.forEach((route) => {
        const isSelected = selectedRoute?.id === route.id;

        // Polyline points: Donor -> Volunteer (interpolated) -> NGO
        const start = route.donorCoord;
        const end = route.ngoCoord;

        // Interpolate live moving position
        const t = Math.min(Math.max(simulationProgress, 0.05), 0.95);
        const liveLat = start[0] + (end[0] - start[0]) * t;
        const liveLng = start[1] + (end[1] - start[1]) * t;

        // Draw Route Line
        const polyline = L.polyline([start, [liveLat, liveLng], end], {
          color: route.urgency === 'critical' ? '#dc2626' : '#2563eb',
          weight: isSelected ? 5 : 4,
          opacity: 0.85,
          dashArray: '8, 8',
          lineCap: 'round'
        });

        polyline.on('click', () => {
          setSelectedRoute(route);
        });

        routesLayerRef.current?.addLayer(polyline);

        // Moving Courier Vehicle Marker
        const vehicleHtml = `
          <div class="relative flex items-center justify-center">
            <div class="w-9 h-9 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center text-white text-sm font-bold animate-pulse">
              🚴
            </div>
            <div class="absolute -top-6 px-2 py-0.5 bg-blue-900 text-white rounded-md text-[10px] font-bold shadow-md whitespace-nowrap">
              ${route.volunteerName.split(' ')[0]} • ETA ${Math.max(2, Math.round(route.etaMinutes * (1 - t)))}m
            </div>
          </div>
        `;

        const vehicleIcon = L.divIcon({
          html: vehicleHtml,
          className: 'custom-leaflet-marker',
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        });

        const vehicleMarker = L.marker([liveLat, liveLng], { icon: vehicleIcon });
        vehicleMarker.on('click', () => {
          setSelectedRoute(route);
        });
        routesLayerRef.current?.addLayer(vehicleMarker);
      });
    }
  }, [listings, routes, ngos, filterType, simulationProgress, selectedRoute]);

  // Center on route if selected
  const handleFocusRoute = (route: DistributionRoute) => {
    setSelectedRoute(route);
    if (mapInstanceRef.current) {
      const bounds = L.latLngBounds([route.donorCoord, route.ngoCoord]);
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  };

  return (
    <div id="section-distribution-map" className="relative w-full h-[calc(100vh-10rem)] min-h-[550px] rounded-3xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
      {/* Leaflet Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Map Filter & Simulation Controls Bar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-2 py-1.5 rounded-2xl shadow-sm border border-slate-200 pointer-events-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filterType === 'all'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            All Layers
          </button>
          <button
            onClick={() => setFilterType('routes')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
              filterType === 'routes'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Navigation className="w-3 h-3" />
            <span>Active Routes ({routes.length})</span>
          </button>
          <button
            onClick={() => setFilterType('donors')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
              filterType === 'donors'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Package className="w-3 h-3" />
            <span>Food Surplus ({listings.filter((l) => l.status === 'available').length})</span>
          </button>
          <button
            onClick={() => setFilterType('ngos')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
              filterType === 'ngos'
                ? 'bg-purple-600 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Building className="w-3 h-3" />
            <span>NGO Hubs ({ngos.length})</span>
          </button>
        </div>

        {/* Live Simulation Control */}
        <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-sm border border-slate-200 pointer-events-auto">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold text-slate-700">Live GPS Simulation</span>
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            title={isSimulating ? 'Pause GPS movement' : 'Resume GPS movement'}
          >
            {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-600" />}
          </button>
        </div>
      </div>

      {/* Map Legend Overlay (Bottom Left) */}
      <div className="absolute bottom-4 left-4 z-10 hidden sm:flex items-center gap-3 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-sm border border-slate-200 text-xs text-slate-700">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-emerald-600"></span>
          <span className="font-medium">Surplus Food Donors</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-blue-600"></span>
          <span className="font-medium">Active Couriers</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-purple-600"></span>
          <span className="font-medium">NGO Hubs</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-5 h-1 bg-blue-500 border-b border-blue-500 border-dashed"></span>
          <span className="font-medium">Live Transit Route</span>
        </div>
      </div>

      {/* Floating Active Route Tracker Card (Bottom Right / Side) */}
      {routes.length > 0 && (
        <div className="absolute bottom-4 right-4 z-10 max-w-sm w-full bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5 text-blue-700 font-bold text-xs">
              <Navigation className="w-3.5 h-3.5" />
              <span>LIVE DISTRIBUTION ROUTE</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
              IN TRANSIT
            </span>
          </div>

          {routes.map((route) => (
            <div key={route.id} className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 truncate max-w-[200px]">{route.title}</span>
                <span className="text-emerald-700 font-bold font-mono">{route.foodKg} kg</span>
              </div>

              {/* Waypoints line */}
              <div className="flex items-center gap-2 text-[11px] text-slate-600 py-1">
                <span className="font-medium text-slate-900 truncate">{route.donorName}</span>
                <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="font-medium text-purple-700 truncate">{route.ngoName}</span>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1">
                  <span>Courier: {route.volunteerName}</span>
                  <span className="text-blue-700 font-mono">
                    ETA ~{Math.max(3, Math.round(route.etaMinutes * (1 - simulationProgress)))} mins
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.round(simulationProgress * 100)}%` }}
                  />
                </div>
              </div>

              <div className="pt-1 flex items-center justify-end">
                <button
                  onClick={() => handleFocusRoute(route)}
                  className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
                >
                  <Maximize2 className="w-3 h-3" />
                  <span>Zoom to Route</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
