import React, { useState } from 'react';
import {
  X,
  PlusCircle,
  Sparkles,
  Utensils,
  Clock,
  MapPin,
  CheckCircle2,
  Package,
  Thermometer,
  ShieldCheck,
  Building2,
  AlertTriangle
} from 'lucide-react';
import { DietaryType, DonorType, FoodListing, NGO, StorageTemp } from '../types.ts';

interface PostFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  ngos: NGO[];
  onSubmit: (listingData: Partial<FoodListing> & { targetNgoId?: string }) => Promise<void>;
}

export const PostFoodModal: React.FC<PostFoodModalProps> = ({
  isOpen,
  onClose,
  ngos,
  onSubmit
}) => {
  const [title, setTitle] = useState('');
  const [donorName, setDonorName] = useState('Golden Dragon Bistro');
  const [donorType, setDonorType] = useState<DonorType>('restaurant');
  const [description, setDescription] = useState(
    'Fresh untouched vegetable fried rice, tofu noodles, and spring rolls packed in food-grade insulated boxes.'
  );
  const [dietaryType, setDietaryType] = useState<DietaryType>('vegetarian');
  const [quantityKg, setQuantityKg] = useState<number>(15);
  const [servingsCount, setServingsCount] = useState<number>(42);
  const [storageTemp, setStorageTemp] = useState<StorageTemp>('hot');
  const [packagedIn, setPackagedIn] = useState('sealed-boxes');
  const [address, setAddress] = useState('420 California St, Financial District');
  const [city, setCity] = useState('San Francisco');
  const [contactPerson, setContactPerson] = useState('Manager Kenji Sato');
  const [phone, setPhone] = useState('+1 (555) 432-8765');
  const [landmark, setLandmark] = useState('Kitchen entrance via basement service bay');
  const [expiryHours, setExpiryHours] = useState<number>(2.5);
  const [targetNgoId, setTargetNgoId] = useState<string>(ngos[0]?.id || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiTips, setAiTips] = useState<any>(null);

  if (!isOpen) return null;

  // Preset fill templates
  const applyPreset = (preset: {
    title: string;
    donorName: string;
    donorType: DonorType;
    desc: string;
    diet: DietaryType;
    kg: number;
    servings: number;
    temp: StorageTemp;
    pack: string;
    hours: number;
  }) => {
    setTitle(preset.title);
    setDonorName(preset.donorName);
    setDonorType(preset.donorType);
    setDescription(preset.desc);
    setDietaryType(preset.diet);
    setQuantityKg(preset.kg);
    setServingsCount(preset.servings);
    setStorageTemp(preset.temp);
    setPackagedIn(preset.pack);
    setExpiryHours(preset.hours);
  };

  const handleAiAnalyze = async () => {
    if (!title) return;
    setAiAnalyzing(true);
    try {
      const res = await fetch('/api/ai/estimate-food-impact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          foodTitle: title,
          description,
          quantityKg,
          donorType
        })
      });
      const data = await res.json();
      setAiTips(data);
      if (data.estimatedMeals) {
        setServingsCount(data.estimatedMeals);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !donorName || !quantityKg) return;

    setIsSubmitting(true);
    try {
      const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000).toISOString();
      await onSubmit({
        title,
        donorName,
        donorType,
        description,
        dietaryType,
        quantityKg: Number(quantityKg),
        servingsCount: Number(servingsCount),
        storageTemp,
        packagedIn,
        location: {
          address,
          city,
          lat: 37.7749 + (Math.random() - 0.5) * 0.03,
          lng: -122.4194 + (Math.random() - 0.5) * 0.03,
          contactPerson,
          phone,
          landmark
        },
        preparedAt: new Date().toISOString(),
        expiresAt,
        targetNgoId
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Post Surplus Food Donation</h3>
              <p className="text-xs text-slate-500">Dispatch nearby volunteers for immediate pickup</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Quick Presets for Rapid Posting */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">
              ⚡ Quick Fill Presets:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() =>
                  applyPreset({
                    title: 'Restaurant Buffet Surplus: Biryani & Dal',
                    donorName: 'Maharaja Palace',
                    donorType: 'restaurant',
                    desc: 'Freshly prepared evening banquet surplus in insulated warming chafers.',
                    diet: 'vegetarian',
                    kg: 16,
                    servings: 45,
                    temp: 'hot',
                    pack: 'catering-pans',
                    hours: 2.0
                  })
                }
                className="p-2 text-left rounded-xl border border-slate-200 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/50 text-[11px] transition-all cursor-pointer"
              >
                <span className="font-bold text-slate-900 block truncate">🥘 Restaurant Buffet</span>
                <span className="text-slate-500">16 kg • 45 meals</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  applyPreset({
                    title: 'Hostel Dining Hall: Steamed Rice & Lentils',
                    donorName: 'Metro Campus Hostel Mess',
                    donorType: 'hostel',
                    desc: 'Fresh student dinner overrun. Stored cleanly in commercial food-grade containers.',
                    diet: 'vegetarian',
                    kg: 24,
                    servings: 65,
                    temp: 'hot',
                    pack: 'insulated-carriers',
                    hours: 3.0
                  })
                }
                className="p-2 text-left rounded-xl border border-slate-200 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/50 text-[11px] transition-all cursor-pointer"
              >
                <span className="font-bold text-slate-900 block truncate">🏫 Hostel Mess</span>
                <span className="text-slate-500">24 kg • 65 meals</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  applyPreset({
                    title: 'Conference Bento Boxes: Gourmet Salads & Wraps',
                    donorName: 'Silicon Summit Catering',
                    donorType: 'catering',
                    desc: 'Individually labeled bento lunches chilled at 3°C.',
                    diet: 'halal',
                    kg: 20,
                    servings: 50,
                    temp: 'chilled',
                    pack: 'individual-containers',
                    hours: 1.5
                  })
                }
                className="p-2 text-left rounded-xl border border-slate-200 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/50 text-[11px] transition-all cursor-pointer"
              >
                <span className="font-bold text-slate-900 block truncate">🍱 Event Catering</span>
                <span className="text-slate-500">20 kg • 50 boxes</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  applyPreset({
                    title: 'Daily Bakery Surplus: Artisan Loaves & Buns',
                    donorName: 'Heritage Bakehouse',
                    donorType: 'supermarket',
                    desc: 'Baked this morning. High quality sourdough, brioche, and whole wheat loaves.',
                    diet: 'vegan',
                    kg: 10,
                    servings: 30,
                    temp: 'ambient',
                    pack: 'sealed-boxes',
                    hours: 8.0
                  })
                }
                className="p-2 text-left rounded-xl border border-slate-200 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/50 text-[11px] transition-all cursor-pointer"
              >
                <span className="font-bold text-slate-900 block truncate">🥖 Bakery Surplus</span>
                <span className="text-slate-500">10 kg • 30 loaves</span>
              </button>
            </div>
          </div>

          {/* Core Food Details */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Surplus Food Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 50 Fresh Buffet Meal Trays (Veg Pulao & Curry)"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Donor Entity Name *</label>
                <input
                  type="text"
                  required
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="e.g. Olive & Thyme Bistro"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Donor Category</label>
                <select
                  value={donorType}
                  onChange={(e) => setDonorType(e.target.value as DonorType)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="restaurant">Restaurant / Bistro</option>
                  <option value="hostel">Hostel / Dormitory Mess</option>
                  <option value="canteen">Corporate / College Canteen</option>
                  <option value="catering">Event / Wedding Catering</option>
                  <option value="supermarket">Bakery / Supermarket</option>
                  <option value="event">Festival / Gathering</option>
                  <option value="other">Other Community Kitchen</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Description & Ingredients</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details on food preparation, allergens, and containment..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            {/* AI Smart Impact button */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-xs font-bold text-emerald-900">
                  AI Smart Safety & Portion Assessor
                </span>
              </div>
              <button
                type="button"
                onClick={handleAiAnalyze}
                disabled={aiAnalyzing || !title}
                className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                {aiAnalyzing ? 'Analyzing...' : 'Assess with Gemini'}
              </button>
            </div>

            {aiTips && (
              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 space-y-1.5">
                <div className="flex items-center justify-between font-bold">
                  <span>Recommendation: {aiTips.shelfLifeHoursRecommendation}</span>
                  <span>Est. CO₂ saved: {aiTips.co2SavedKg} kg</span>
                </div>
                <p className="text-[11px] text-emerald-800">{aiTips.storageRecommendation}</p>
                {aiTips.handlingChecklist && (
                  <ul className="list-disc pl-4 text-[11px] text-emerald-700 space-y-0.5">
                    {aiTips.handlingChecklist.map((tip: string, idx: number) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Weight, Servings, Dietary, Temp */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Quantity (kg) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={quantityKg}
                  onChange={(e) => {
                    const kg = Number(e.target.value);
                    setQuantityKg(kg);
                    setServingsCount(Math.round(kg * 2.8));
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Est. Meals</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={servingsCount}
                  onChange={(e) => setServingsCount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Dietary Type</label>
                <select
                  value={dietaryType}
                  onChange={(e) => setDietaryType(e.target.value as DietaryType)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white"
                >
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="non-veg">Non-Veg</option>
                  <option value="halal">Halal</option>
                  <option value="jain">Jain</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Storage Temp</label>
                <select
                  value={storageTemp}
                  onChange={(e) => setStorageTemp(e.target.value as StorageTemp)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white"
                >
                  <option value="hot">Hot (&gt;60°C)</option>
                  <option value="chilled">Chilled (&lt;4°C)</option>
                  <option value="ambient">Room Temp</option>
                  <option value="frozen">Frozen</option>
                </select>
              </div>
            </div>

            {/* Expiry Window */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  Food Expiry Window (Best Before) *
                </label>
                <span className="text-xs font-bold font-mono text-emerald-700">
                  {expiryHours} hours from now
                </span>
              </div>
              <div className="flex items-center gap-2">
                {[1.0, 2.0, 3.0, 5.0, 8.0].map((hrs) => (
                  <button
                    key={hrs}
                    type="button"
                    onClick={() => setExpiryHours(hrs)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      expiryHours === hrs
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {hrs}h
                  </button>
                ))}
              </div>
            </div>

            {/* Location & Contact */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Pickup Location & Handover
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Street Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Landmark / Gate</label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Prefer Designated Recipient NGO (Optional)
                </label>
                <select
                  value={targetNgoId}
                  onChange={(e) => setTargetNgoId(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-900"
                >
                  <option value="">Auto-match to highest-need nearby shelter</option>
                  {ngos.map((ngo) => (
                    <option key={ngo.id} value={ngo.id}>
                      {ngo.name} ({ngo.beneficiariesCount} people)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isSubmitting ? 'Posting...' : 'Post Surplus & Alert Couriers'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
