import React, { useState } from 'react';
import { 
  FolderOpen, 
  Upload, 
  FileText, 
  Search, 
  Download, 
  Eye, 
  CheckCircle2, 
  FileCheck2 
} from 'lucide-react';
import { Customer } from '../types';

interface DocumentsViewProps {
  customers: Customer[];
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({ customers }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const allDocs = customers.flatMap((c) =>
    c.documents.map((d) => ({
      ...d,
      customerName: c.fullName,
      customerNumber: c.customerNumber,
      phone: c.phone,
    }))
  );

  const filteredDocs = allDocs.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(search.toLowerCase()) ||
      doc.customerName.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || doc.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-blue-600" /> Customer Contract & KYC Document Repository
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            National IDs, Signed Installment Contracts, Utility Bills, Receipts, and Site Installation Photos
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents or customer name..."
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          {['ALL', 'Contract', 'National ID', 'Utility Bill', 'Photo', 'Receipt'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                selectedCategory === cat ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 hover:border-blue-400 transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300 font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{doc.title}</h4>
                  <p className="text-[10px] text-slate-400 font-semibold">{doc.category} • {doc.size}</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">VERIFIED</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-750 text-[11px] space-y-0.5">
              <p className="font-bold text-slate-800 dark:text-slate-200">{doc.customerName}</p>
              <p className="text-slate-500 font-mono text-[10px]">{doc.customerNumber} | {doc.phone}</p>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800 text-slate-400">
              <span className="text-[10px]">Uploaded: {doc.uploadDate}</span>
              <button
                onClick={() => alert(`Downloading ${doc.title}...`)}
                className="flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                <Download className="w-3.5 h-3.5" /> Download
              </button>
            </div>
          </div>
        ))}

        {filteredDocs.length === 0 && (
          <div className="col-span-full p-12 text-center text-slate-400 text-xs">
            No document files match your search filter.
          </div>
        )}
      </div>
    </div>
  );
};
