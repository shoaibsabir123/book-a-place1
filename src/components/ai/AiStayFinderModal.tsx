import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Send, 
  Building2, 
  MapPin, 
  Compass, 
  Calendar, 
  CheckCircle, 
  Download,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Property } from '../../types';

interface AiStayFinderModalProps {
  onClose: () => void;
  onSelectPropertyByTitle?: (title: string) => void;
}

export const AiStayFinderModal: React.FC<AiStayFinderModalProps> = ({
  onClose,
  onSelectPropertyByTitle
}) => {
  const { formatPrice } = useAuth();
  const [prompt, setPrompt] = useState(
    'I need a furnished room in Lahore near a business district for 30 days, with reliable Wi-Fi, a private bathroom, and a monthly budget of PKR 45,000.'
  );
  const [destination, setDestination] = useState('Lahore');
  const [budget, setBudget] = useState('45000');
  const [guests, setGuests] = useState(1);
  const [stayType, setStayType] = useState('Working Professional');

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [itineraryResult, setItineraryResult] = useState<any>(null);
  const [isGeneratingItinerary, setIsGeneratingItinerary] = useState(false);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setResult(null);
    setItineraryResult(null);

    try {
      const response = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          destination,
          budget,
          guests,
          stayType
        })
      });

      const resData = await response.json();
      if (resData.success && resData.data) {
        setResult(resData.data);
      } else if (resData.fallback) {
        setResult(resData.fallback);
      }
    } catch (err) {
      console.error('AI generate error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateItinerary = async (placeName: string) => {
    setIsGeneratingItinerary(true);
    try {
      const res = await fetch('/api/ai/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: destination || 'Pakistan',
          days: 3,
          propertyName: placeName,
          style: stayType || 'Cultural & Business'
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setItineraryResult(data.data);
      }
    } catch (err) {
      console.error('Itinerary error:', err);
    } finally {
      setIsGeneratingItinerary(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl border border-slate-200 relative my-4">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0B192C] via-[#047857] to-[#0B192C] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base">AI Stay Specialist & Concierge</h3>
              <p className="text-[11px] text-emerald-200">Powered by Google Gemini 3.8 Flash</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Query Form */}
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Describe your accommodation needs in Pakistan:
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                className="w-full text-xs p-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 transition-colors"
                placeholder="E.g., Need a 2-bedroom apartment in Islamabad F-7 for a family of 4 with generator backup and kitchen for 5 days..."
                required
              />
            </div>

            {/* Constraints Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">City</label>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold cursor-pointer"
                >
                  <option value="Islamabad">Islamabad</option>
                  <option value="Lahore">Lahore</option>
                  <option value="Karachi">Karachi</option>
                  <option value="Murree">Murree</option>
                  <option value="Hunza">Hunza</option>
                  <option value="Skardu">Skardu</option>
                  <option value="Peshawar">Peshawar</option>
                  <option value="Multan">Multan</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Budget (PKR)</label>
                <input
                  type="text"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 font-mono font-semibold"
                  placeholder="PKR"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Guests</label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold cursor-pointer"
                >
                  <option value={1}>1 Solo</option>
                  <option value={2}>2 Guests</option>
                  <option value={4}>4 Family</option>
                  <option value={6}>6+ Group</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Profile</label>
                <select
                  value={stayType}
                  onChange={(e) => setStayType(e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold cursor-pointer"
                >
                  <option value="Working Professional">Corporate</option>
                  <option value="Student Living">Student</option>
                  <option value="Family Comfort">Family</option>
                  <option value="Tourist / Explorer">Tourist</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{isLoading ? 'Analyzing Stays with Gemini...' : 'Analyze & Recommend Stays'}</span>
              </button>
            </div>
          </form>

          {/* Results Display */}
          {result && (
            <div className="border-t border-slate-200 pt-5 space-y-5 animate-in fade-in">
              <div>
                <h4 className="font-extrabold text-base text-slate-900">{result.headline}</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{result.overview}</p>
              </div>

              {/* Matched Options */}
              <div className="space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Top Recommended Stays:
                </span>
                {result.matchedOptions?.map((opt: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h5 className="font-bold text-sm text-slate-900">{opt.title}</h5>
                        <p className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {opt.neighborhood}, {opt.city} • <span className="font-semibold">{opt.category}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-slate-900">
                          {formatPrice(opt.estimatedPricePkr)}
                        </span>
                        <span className="text-[10px] text-slate-500 block">{opt.rateType || 'per night'}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600">{opt.suitabilityReason}</p>

                    {opt.highlights && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {opt.highlights.map((h: string, hIdx: number) => (
                          <span key={hIdx} className="text-[10px] font-medium bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-700">
                            ✓ {h}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="pt-2 flex gap-2">
                      <button
                        onClick={() => handleCreateItinerary(opt.title)}
                        disabled={isGeneratingItinerary}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                      >
                        <Compass className="w-3.5 h-3.5" />
                        <span>Generate Itinerary for this stay</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tradeoffs & Local Advice */}
              {result.tradeOffs && (
                <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900">
                  <strong>Budget vs Comfort Analysis: </strong> {result.tradeOffs}
                </div>
              )}

              {result.localTips && (
                <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900">
                  <strong className="block mb-1">Local Travel Tips for Pakistan:</strong>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {result.localTips.map((tip: string, tIdx: number) => (
                      <li key={tIdx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Day-by-Day Itinerary Preview if generated */}
              {itineraryResult && (
                <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3 animate-in fade-in">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <Compass className="w-4 h-4" />
                    <span>{itineraryResult.tripTitle}</span>
                  </div>
                  <div className="space-y-3 text-xs">
                    {itineraryResult.days?.map((d: any) => (
                      <div key={d.dayNumber} className="border-l-2 border-emerald-500 pl-3 space-y-1">
                        <p className="font-bold text-slate-200">Day {d.dayNumber}: {d.theme}</p>
                        <p className="text-slate-400"><strong>Morning:</strong> {d.morning}</p>
                        <p className="text-slate-400"><strong>Afternoon:</strong> {d.afternoon}</p>
                        <p className="text-slate-400"><strong>Evening:</strong> {d.evening}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
