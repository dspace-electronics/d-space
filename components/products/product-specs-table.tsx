'use client';

import React from 'react';
import { Download, ExternalLink, Cpu } from 'lucide-react';

interface ProductSpecsTableProps {
  specs: Record<string, string>;
  datasheetUrl?: string;
  pinoutUrl?: string;
}

export function ProductSpecsTable({ specs, datasheetUrl, pinoutUrl }: ProductSpecsTableProps) {
  const specEntries = Object.entries(specs);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-200 dark:border-white/10">
        <div>
          <h3 className="text-base font-bold text-neutral-950 dark:text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#6366f1]" />
            Hardware Engineering Specifications
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Verified laboratory electrical parameters and logic tolerances.
          </p>
        </div>

        {datasheetUrl && (
          <a
            href={datasheetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-neutral-200 dark:border-white/10 hover:border-neutral-300 dark:hover:border-white/20 bg-white hover:bg-neutral-50 dark:bg-[#0e1117] dark:hover:bg-white/5 text-xs font-semibold text-neutral-900 dark:text-white transition-colors self-start sm:self-auto shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-[#6366f1]" />
            <span>Official Datasheet (PDF)</span>
            <ExternalLink className="w-3 h-3 text-neutral-400" />
          </a>
        )}
      </div>

      <div className="border border-neutral-200 dark:border-white/10 rounded-2xl overflow-hidden bg-white dark:bg-[#0e1117] shadow-sm">
        <table className="w-full text-left border-collapse text-xs">
          <tbody>
            {specEntries.map(([key, val], idx) => (
              <tr
                key={key}
                className={`border-b border-neutral-100 dark:border-white/5 last:border-b-0 ${
                  idx % 2 === 0 ? 'bg-neutral-50/50 dark:bg-white/[0.02]' : 'bg-transparent'
                } hover:bg-neutral-100/60 dark:hover:bg-white/5 transition-colors`}
              >
                <td className="py-3 px-4 font-semibold text-neutral-700 dark:text-neutral-300 w-1/3 border-r border-neutral-100 dark:border-white/5">
                  {key}
                </td>
                <td className="py-3 px-4 font-mono text-neutral-950 dark:text-white font-medium">{val}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
