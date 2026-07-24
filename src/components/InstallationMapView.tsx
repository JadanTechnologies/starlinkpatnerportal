import React, { useState } from 'react';
import { MapPin, Navigation, Copy, Check, Radio, Layers, ExternalLink, ShieldAlert, Sparkles } from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { Customer } from '../types';

interface InstallationMapViewProps {
  customer: Customer;
}

export const InstallationMapView: React.FC<InstallationMapViewProps> = ({ customer }) => {
  const [copied, setCopied] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [mapTypeId, setMapTypeId] = useState<'roadmap' | 'satellite' | 'hybrid'>('roadmap');

  // Parse GPS coordinates safely
  const parseCoordinates = (coordStr: string): { lat: number; lng: number } => {
    try {
      if (!coordStr) return { lat: 9.0765, lng: 7.3986 }; // Default Abuja, Nigeria
      const parts = coordStr.split(',').map((p) => parseFloat(p.trim()));
      if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        return { lat: parts[0], lng: parts[1] };
      }
    } catch {
      // Fallback
    }
    return { lat: 9.0765, lng: 7.3986 };
  };

  const center = parseCoordinates(customer.gpsCoordinates);

  const API_KEY =
    process.env.GOOGLE_MAPS_PLATFORM_KEY ||
    (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
    (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
    '';

  const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

  const handleCopyCoords = () => {
    navigator.clipboard.writeText(`${center.lat}, ${center.lng}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(`${customer.installationAddress}, ${customer.town}, ${customer.lga}, ${customer.state}, Nigeria`);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${center.lat},${center.lng}`;

  return (
    <div className="space-y-4">
      {/* Top Controls & Specs Header */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Installation Site GPS & Map Coordinates
            </h3>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {customer.installationAddress}, {customer.town}, {customer.lga}, {customer.state}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopyCoords}
            className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1.5 shadow-2xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Coords Copied!' : 'Copy GPS'}</span>
          </button>

          <button
            onClick={handleCopyAddress}
            className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1.5 shadow-2xs"
          >
            {copiedAddress ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedAddress ? 'Address Copied!' : 'Copy Address'}</span>
          </button>

          <a
            href={googleMapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition flex items-center gap-1.5 shadow-xs"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Navigate in Google Maps</span>
            <ExternalLink className="w-3 h-3 opacity-80" />
          </a>
        </div>
      </div>

      {/* Map View Area */}
      <div className="relative w-full h-[320px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-md">
        {hasValidKey ? (
          <APIProvider apiKey={API_KEY} version="weekly">
            <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-1 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setMapTypeId('roadmap')}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition ${
                  mapTypeId === 'roadmap'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Map
              </button>
              <button
                onClick={() => setMapTypeId('satellite')}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition ${
                  mapTypeId === 'satellite'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Satellite
              </button>
              <button
                onClick={() => setMapTypeId('hybrid')}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition ${
                  mapTypeId === 'hybrid'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Hybrid
              </button>
            </div>

            <Map
              defaultCenter={center}
              defaultZoom={14}
              mapTypeId={mapTypeId}
              mapId="INSTALLATION_SITE_MAP"
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              style={{ width: '100%', height: '100%' }}
            >
              <AdvancedMarker position={center} title={`${customer.fullName} - ${customer.starlink.dishKitNumber}`}>
                <Pin background="#2563eb" glyphColor="#ffffff" borderColor="#1e40af" />
              </AdvancedMarker>
            </Map>
          </APIProvider>
        ) : (
          /* Interactive Fallback Map Display when API Key is pending */
          <div className="w-full h-full bg-slate-900 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Map Grid Background */}
            <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px] opacity-25"></div>
            
            <div className="z-10 text-center max-w-md space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/30 border border-blue-500/50 flex items-center justify-center mx-auto text-blue-400 animate-pulse">
                <Radio className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-sm font-extrabold text-white">
                  Field Location: {customer.fullName} Starlink Site
                </h4>
                <p className="text-xs text-blue-200 mt-0.5 font-mono">
                  GPS: {center.lat}, {center.lng} • {customer.town}, {customer.state}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700 text-[11px] text-slate-300 space-y-1 text-left">
                <p className="font-bold text-amber-400 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> Interactive Map API Key Configuration:
                </p>
                <p>
                  To render the live Google Maps canvas directly, add <code className="text-blue-300 font-bold">GOOGLE_MAPS_PLATFORM_KEY</code> under <strong>Settings (⚙️) → Secrets</strong> in AI Studio.
                </p>
              </div>

              <a
                href={googleMapsDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg transition"
              >
                <Navigation className="w-4 h-4" />
                <span>Open Direct GPS Navigation in Google Maps</span>
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Field Technician Site Reference Box */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Assigned Technician</span>
          <span className="font-bold text-slate-900 dark:text-white">{customer.starlink.installationTechnician || 'Engr. Jadan'}</span>
        </div>
        <div className="p-3 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Dish Serial / Kit #</span>
          <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">{customer.starlink.dishKitNumber}</span>
        </div>
        <div className="p-3 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Customer Phone</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">{customer.phone}</span>
        </div>
      </div>
    </div>
  );
};
