import { useState, useRef, useEffect } from 'react';
import { Search, Car, Wrench, FileText } from 'lucide-react';
import { vehicles, repairRecords } from '../data/mockData';
import { vehicleDocuments } from '../data/extendedData';

interface GlobalSearchProps {
  onNavigate: (page: string, id?: string) => void;
}

interface SearchResult {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  page: string;
  itemId?: string;
}

export default function GlobalSearch({ onNavigate }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setFocused(false);
        inputRef.current?.blur();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const q = query.toLowerCase().trim();

  const vehicleResults: SearchResult[] = q
    ? vehicles
        .filter(v =>
          v.plateNumber.toLowerCase().includes(q) ||
          v.brand.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q) ||
          v.department.toLowerCase().includes(q)
        )
        .slice(0, 3)
        .map(v => ({
          id: v.id,
          icon: <Car className="w-4 h-4 text-blue-600" />,
          title: v.plateNumber,
          subtitle: `${v.brand} ${v.model} • ${v.department}`,
          page: 'vehicles',
          itemId: v.id,
        }))
    : [];

  const repairResults: SearchResult[] = q
    ? repairRecords
        .filter(r =>
          r.docNumber.toLowerCase().includes(q) ||
          r.repairItems.toLowerCase().includes(q) ||
          r.garage.toLowerCase().includes(q) ||
          r.vehicleId.toLowerCase().includes(q)
        )
        .slice(0, 3)
        .map(r => ({
          id: r.id,
          icon: <Wrench className="w-4 h-4 text-orange-600" />,
          title: r.docNumber,
          subtitle: `${r.repairItems} • ${r.garage}`,
          page: 'repair-management',
          itemId: r.id,
        }))
    : [];

  const docResults: SearchResult[] = q
    ? vehicleDocuments
        .filter(d =>
          d.docNumber.toLowerCase().includes(q) ||
          d.docType.toLowerCase().includes(q) ||
          d.vehicleId.toLowerCase().includes(q)
        )
        .slice(0, 3)
        .map(d => ({
          id: d.id,
          icon: <FileText className="w-4 h-4 text-green-600" />,
          title: d.docNumber,
          subtitle: `${d.docType} • ${d.vehicleId}`,
          page: 'documents',
          itemId: d.id,
        }))
    : [];

  const hasResults = vehicleResults.length > 0 || repairResults.length > 0 || docResults.length > 0;
  const showDropdown = focused && q.length > 0;

  function handleSelect(result: SearchResult) {
    onNavigate(result.page, result.itemId);
    setQuery('');
    setFocused(false);
  }

  return (
    <div ref={containerRef} className="relative flex-1 max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="ค้นหายานพาหนะ, การซ่อม, เอกสาร..."
          className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 border border-transparent rounded-lg focus:outline-none focus:bg-white focus:border-blue-300 transition-all placeholder:text-slate-400"
        />
      </div>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-slate-200 z-50 overflow-hidden">
          {!hasResults && (
            <div className="px-4 py-6 text-center text-sm text-slate-400">
              ไม่พบผลลัพธ์สำหรับ "{query}"
            </div>
          )}

          {vehicleResults.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-semibold text-slate-400 bg-slate-50 border-b border-slate-100">
                ยานพาหนะ
              </div>
              {vehicleResults.map(result => (
                <button
                  key={result.id}
                  onClick={() => handleSelect(result)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-left transition-colors"
                >
                  <span className="flex-shrink-0">{result.icon}</span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-800 truncate">{result.title}</div>
                    <div className="text-xs text-slate-500 truncate">{result.subtitle}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {repairResults.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-semibold text-slate-400 bg-slate-50 border-b border-slate-100">
                การซ่อม
              </div>
              {repairResults.map(result => (
                <button
                  key={result.id}
                  onClick={() => handleSelect(result)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-left transition-colors"
                >
                  <span className="flex-shrink-0">{result.icon}</span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-800 truncate">{result.title}</div>
                    <div className="text-xs text-slate-500 truncate">{result.subtitle}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {docResults.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-semibold text-slate-400 bg-slate-50 border-b border-slate-100">
                เอกสาร
              </div>
              {docResults.map(result => (
                <button
                  key={result.id}
                  onClick={() => handleSelect(result)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-left transition-colors"
                >
                  <span className="flex-shrink-0">{result.icon}</span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-800 truncate">{result.title}</div>
                    <div className="text-xs text-slate-500 truncate">{result.subtitle}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
