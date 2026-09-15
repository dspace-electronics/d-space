'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BLR_ZONES } from '@/lib/mock-data';
import { BLRZone } from '@/lib/types';
import {
  Truck,
  MapPin,
  Clock,
  ShieldCheck,
  Zap,
  ArrowRight,
  Package,
  Search,
  CheckCircle2,
  Navigation,
  PhoneCall,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Cta1 } from '@/components/ui/cta-1';
import { DispatchMap, LocationSelection } from '@/components/map/dispatch-map';

export default function DeliveryPage() {
  const [selectedZone, setSelectedZone] = useState<BLRZone>(BLR_ZONES[0]);
  const [searchPincode, setSearchPincode] = useState('');
  const [pincodeResult, setPincodeResult] = useState<string | null>(null);

  const handlePincodeSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchPincode.trim();
    if (!clean) return;

    const matched = BLR_ZONES.find((z) => z.pincode === clean || z.area.toLowerCase().includes(clean.toLowerCase()) || z.name.toLowerCase().includes(clean.toLowerCase()));
    if (matched) {
      setSelectedZone(matched);
      setPincodeResult(`Found: ${matched.name} (${matched.pincode}) — ${matched.deliveryEtaMinutes} mins ETA`);
    } else {
      setPincodeResult(`Pincode ${clean} is serviced via Standard Porter Express (~60-75 mins).`);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfbfd] dark:bg-[#090a0f] pb-20 font-sans text-neutral-900 dark:text-white antialiased transition-colors duration-200">
      {/* Top Header Section */}
      <section className="border-b border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0e1117]/80 pt-8 sm:pt-12 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start gap-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 dark:border-white/15 bg-neutral-100 dark:bg-white/5 px-3 py-1 text-xs font-mono text-neutral-700 dark:text-neutral-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              <span>BENGALURU FEW-HOUR LOGISTICS</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-neutral-950 dark:text-white">
              Check Delivery Time &amp; Porter Courier Fee
            </h1>

            <p className="max-w-3xl text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Every development board, sensor, and lab tool in stock is ready for immediate dispatch from our
              central New Thippasandra / HAL 3rd Stage warehouse. We partner directly with Porter 2-Wheelers to guarantee
              rapid delivery to your workbench or robotics lab.
            </p>

            {/* Quick Metrics Bar */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-3xl pt-6 border-t border-neutral-200 dark:border-white/10">
              <div className="rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-white/5 p-3.5">
                <span className="text-xs text-neutral-500 dark:text-neutral-400 block font-mono">WAREHOUSE ORIGIN</span>
                <span className="text-sm font-bold text-neutral-950 dark:text-white block mt-0.5">HAL 3rd Stage, BLR</span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400">Dispatches in &lt; 15 mins</span>
              </div>
              <div className="rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-white/5 p-3.5">
                <span className="text-xs text-neutral-500 dark:text-neutral-400 block font-mono">AVG DISPATCH SPEED</span>
                <span className="text-sm font-bold text-neutral-950 dark:text-white block mt-0.5">32 Minutes</span>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400">Across 10 key tech hubs</span>
              </div>
              <div className="rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-white/5 p-3.5">
                <span className="text-xs text-neutral-500 dark:text-neutral-400 block font-mono">FREE SHIPPING BAR</span>
                <span className="text-sm font-bold text-neutral-950 dark:text-white block mt-0.5">Orders &gt; ₹1,499</span>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400">Porter bike fee waived</span>
              </div>
              <div className="rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-white/5 p-3.5">
                <span className="text-xs text-neutral-500 dark:text-neutral-400 block font-mono">PACKAGING SAFETY</span>
                <span className="text-sm font-bold text-neutral-950 dark:text-white block mt-0.5">100% ESD Sealed</span>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400">Anti-static bubble mailers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Interactive Calculator Area */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0e1117] p-6 sm:p-8 shadow-xl dark:shadow-2xl">
          {/* Top Filter and Pincode Search */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-neutral-200 dark:border-white/10">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-[#6366f1]">Step 1</span>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-white mt-0.5">
                Pin Location on Live Map or Select Hub
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Use your current GPS location, click anywhere on the Bengaluru map, or lookup a 6-digit postal code.
              </p>
            </div>

            {/* Pincode Search Input */}
            <form onSubmit={handlePincodeSearch} className="flex items-center gap-2 max-w-md w-full">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Enter 6-digit pincode (e.g. 560103)"
                  value={searchPincode}
                  onChange={(e) => setSearchPincode(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 dark:border-white/15 bg-neutral-50 dark:bg-white/5 pl-9 pr-4 py-2.5 text-xs sm:text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:border-neutral-400 dark:focus:border-white/40 focus:bg-white dark:focus:bg-white/10 focus:outline-none transition-all"
                />
              </div>
              <button
                type="submit"
                className="rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 px-4 py-2.5 text-xs font-bold tracking-tight transition-colors cursor-pointer shrink-0"
              >
                Lookup
              </button>
            </form>
          </div>

          {pincodeResult && (
            <div className="mt-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-4 py-2.5 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{pincodeResult}</span>
            </div>
          )}

          {/* Live Interactive Bengaluru Dispatch Map */}
          <div className="pt-6">
            <DispatchMap
              initialLat={12.9352}
              initialLng={77.6245}
              height="440px"
              title="Bengaluru Live Porter Dispatch & Courier Route Simulator"
              onLocationSelect={(loc: LocationSelection) => {
                const matched = BLR_ZONES.find((z) => loc.area && z.area.toLowerCase().includes(loc.area.toLowerCase()));
                if (matched) {
                  setSelectedZone(matched);
                }
              }}
            />
          </div>

          {/* Zones Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pt-6">
            {BLR_ZONES.map((zone) => {
              const isSelected = selectedZone.id === zone.id;
              return (
                <button
                  key={zone.id}
                  onClick={() => setSelectedZone(zone)}
                  className={`p-3.5 rounded-xl text-left transition-all text-xs cursor-pointer border ${
                    isSelected
                      ? 'bg-neutral-100 dark:bg-white/15 text-neutral-950 dark:text-white border-neutral-300 dark:border-white/40 shadow-sm ring-2 ring-neutral-400/30 dark:ring-white/20'
                      : 'bg-neutral-50/70 hover:bg-neutral-100/80 dark:bg-white/5 dark:hover:bg-white/10 border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold truncate text-neutral-900 dark:text-white">{zone.name}</span>
                    {isSelected ? (
                      <span className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400"></span>
                    ) : (
                      <span className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500">{zone.pincode}</span>
                    )}
                  </div>
                  <span
                    className={`text-[11px] block truncate mb-2 ${
                      isSelected ? 'text-neutral-700 dark:text-neutral-300' : 'text-neutral-500 dark:text-neutral-400'
                    }`}
                  >
                    {zone.popularTechHub}
                  </span>
                  <div className="flex items-center justify-between pt-1 border-t border-neutral-200/80 dark:border-white/10 text-[11px] font-mono">
                    <span className={isSelected ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-neutral-700 dark:text-neutral-300 font-semibold'}>
                      {zone.deliveryEtaMinutes}m ETA
                    </span>
                    <span className={isSelected ? 'text-neutral-700 dark:text-neutral-300' : 'text-neutral-400 dark:text-neutral-500'}>
                      ₹{zone.porterBikeFee}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Zone Detail Card */}
          <div className="mt-8 rounded-2xl border border-neutral-200 dark:border-white/10 bg-neutral-50/60 dark:bg-white/5 p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-md bg-white dark:bg-white/10 border border-neutral-200 dark:border-white/15 px-2 py-0.5 text-xs font-mono text-neutral-700 dark:text-neutral-200">
                    <MapPin className="h-3 w-3 text-[#6366f1]" />
                    <span>Selected Zone: {selectedZone.name}</span>
                  </span>
                  <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">PIN: {selectedZone.pincode}</span>
                </div>

                <h3 className="text-2xl font-bold text-neutral-950 dark:text-white">
                  {selectedZone.area} · {selectedZone.popularTechHub}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-2xl">
                  Dispatched via dedicated Porter 2-Wheeler courier directly from our New Thippasandra Hub (HAL 3rd Stage).
                  Live GPS rider tracking URL generated upon handover.
                </p>
              </div>

              {/* Fee & ETA Badge */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
                <div className="rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0e1117] p-4 text-center sm:text-left min-w-[150px]">
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono block">ESTIMATED ETA</span>
                  <span className="text-2xl font-extrabold text-neutral-950 dark:text-white font-mono block">
                    {selectedZone.deliveryEtaMinutes} mins
                  </span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Under 1 hour</span>
                </div>

                <div className="rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0e1117] p-4 text-center sm:text-left min-w-[150px]">
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono block">PORTER COURIER FEE</span>
                  <span className="text-2xl font-extrabold text-neutral-950 dark:text-white font-mono block">
                    ₹{selectedZone.porterBikeFee}
                  </span>
                  <span className="text-[11px] text-neutral-500 dark:text-neutral-400">Free on orders &gt; ₹1,499</span>
                </div>

                <Link href="/shop" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full h-full py-4 text-sm font-semibold bg-neutral-950 hover:bg-neutral-800 dark:bg-white text-white dark:text-neutral-950 dark:hover:bg-neutral-200 cursor-pointer">
                    <span>Shop &amp; Dispatch</span>
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* SLA Workflow Steps */}
            <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-white/10">
              <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-4">
                Rapid Porter Fulfillment SLA
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0e1117] p-4">
                  <div className="h-8 w-8 rounded-lg bg-neutral-100 dark:bg-white/10 flex items-center justify-center shrink-0 text-neutral-900 dark:text-white font-bold text-xs">
                    01
                  </div>
                  <div>
                    <span className="text-xs font-bold text-neutral-950 dark:text-white block">
                      15-Min Lab Pick &amp; QA Pack
                    </span>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 leading-snug">
                      Parts pulled from ESD racks, pins inspected, and sealed in moisture-barrier anti-static packaging.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0e1117] p-4">
                  <div className="h-8 w-8 rounded-lg bg-neutral-100 dark:bg-white/10 flex items-center justify-center shrink-0 text-neutral-900 dark:text-white font-bold text-xs">
                    02
                  </div>
                  <div>
                    <span className="text-xs font-bold text-neutral-950 dark:text-white block">
                      Porter Rider Handover
                    </span>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 leading-snug">
                      Rider matched at New Thippasandra Hub. Tracking ID and direct rider mobile link sent via SMS and account order history.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0e1117] p-4">
                  <div className="h-8 w-8 rounded-lg bg-neutral-100 dark:bg-white/10 flex items-center justify-center shrink-0 text-neutral-900 dark:text-white font-bold text-xs">
                    03
                  </div>
                  <div>
                    <span className="text-xs font-bold text-neutral-950 dark:text-white block">
                      Few-Hour Workbench Dropoff
                    </span>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 leading-snug">
                      Courier delivers ESD-shielded parcels directly to your office, garage, lab, or co-working space.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ & Hub Details */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Warehouse Card */}
          <div className="rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0e1117] p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Navigation className="h-4 w-4 text-[#6366f1]" />
              <h3 className="text-base font-bold text-neutral-950 dark:text-white">Central Warehouse Location</h3>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
              Dspace operates a 4,500 sq ft temperature-controlled ESD electronics warehouse in New Thippasandra / HAL 3rd Stage,
              optimally situated between Indiranagar, CV Raman Nagar, Old Airport Road, and Koramangala.
            </p>
            <div className="space-y-2 text-xs font-mono bg-neutral-50 dark:bg-white/5 p-3.5 rounded-xl border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-neutral-300">
              <div><strong className="text-neutral-900 dark:text-white">Address:</strong> 1273, First Floor, 2nd Cross, HAL 3rd Stage, New Thippasandra PO, Bengaluru 560075</div>
              <div><strong className="text-neutral-900 dark:text-white">Operating Hours:</strong> 8:30 AM – 9:30 PM (All 7 Days)</div>
              <div><strong className="text-neutral-900 dark:text-white">Support Desk:</strong> +91 80 4920 1100 · logistics@dspace.in</div>
            </div>
          </div>

          {/* Delivery Guarantees */}
          <div className="rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0e1117] p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
              <h3 className="text-base font-bold text-neutral-950 dark:text-white">Hardware Delivery Guarantees</h3>
            </div>
            <ul className="space-y-3 text-xs text-neutral-600 dark:text-neutral-400">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-neutral-900 dark:text-white">Rainproof Protective Envelopes:</strong> High-density poly-mailers ensure complete moisture barrier during monsoon downpours.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-neutral-900 dark:text-white">Pin Protection Foam:</strong> Header pins and delicate DuPont pitch connectors are embedded into high-density conductive foam.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-neutral-900 dark:text-white">Instant Replacement:</strong> Any transit-damaged component is re-dispatched immediately free of charge.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <Cta1
        title="Ready to build your prototype today?"
        description="Browse 36+ verified microcontrollers, high-precision sensors, and bench tools with few-hour delivery."
        buttonText="Explore Hardware Catalog"
        buttonLink="/shop"
        buttonIcon={<ArrowRight className="h-4 w-4" />}
        className="mt-12"
      />
    </div>
  );
}
