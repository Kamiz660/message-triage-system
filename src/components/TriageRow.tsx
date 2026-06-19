import React, { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ComplaintMessage } from '../types';
import { getRelativeTimeString, COMPLAINT_CATEGORIES, ASSIGNED_OFFICERS } from '../data';
import { 
  AlertTriangle, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  User, 
  Tag, 
  Clock, 
  FileText, 
  History, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const InlinePicker = ({
  type,
  currentValue,
  options,
  onSelect,
  onClose
}: {
  type: string;
  currentValue: string;
  options: string[];
  onSelect: (val: string) => void;
  onClose: () => void;
}) => {
  const [search, setSearch] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));

  const handleConfirm = (val: string) => {
    if (!val.trim()) return;
    onSelect(val.trim());
    onClose();
  };

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-[2px] cursor-auto"
         onClick={(e) => { e.stopPropagation(); onClose(); }}
         onKeyDown={(e) => { if (e.key === 'Escape') onClose(); e.stopPropagation(); }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden flex flex-col text-sm"
      >
        <div className="p-3 border-b border-gray-100 bg-slate-50 flex-shrink-0 flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-gray-800 text-center">Assign {type.toLowerCase()}</h3>
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 flex-grow focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            placeholder={`Search or add new...`}
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleConfirm(search || currentValue);
            }}
          />
        </div>
        <div className="max-h-64 overflow-y-auto p-1.5 scrollbar-thin space-y-0.5">
          {filtered.map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => handleConfirm(opt)}
              className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded-lg text-gray-800 font-medium select-none cursor-pointer"
            >
              {opt}
            </button>
          ))}
          {search && !filtered.some(o => o.toLowerCase() === search.toLowerCase()) && (
            <button
              type="button"
              onClick={() => handleConfirm(search)}
              className="w-full text-left px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-700 font-bold select-none cursor-pointer"
            >
              + Create Tag: "{search}"
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

const SlidingStatusToggle = ({
  status,
  onToggle
}: {
  status: 'unresolved' | 'resolved';
  onToggle: (event: React.MouseEvent | React.KeyboardEvent) => void;
}) => {
  const isUnresolved = status === 'unresolved';
  const containerWidth = 128; // slightly wider to fit labels perfectly

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      onToggle(e);
    }
  };

  return (
    <div 
      role="switch"
      aria-checked={!isUnresolved}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={(e) => {
        e.stopPropagation();
        onToggle(e);
      }}
      className={`relative h-9 rounded-full border cursor-pointer flex items-center select-none overflow-hidden transition-all duration-350 shadow-xs hover:scale-[1.02] active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1 p-1 shrink-0 box-border
        ${isUnresolved 
          ? 'bg-orange-50/80 border-orange-200/80 hover:bg-orange-100/80 hover:border-orange-300 justify-start' 
          : 'bg-teal-50/80 border-teal-200/80 hover:bg-teal-100/80 hover:border-teal-300 justify-end'}
      `}
      style={{ width: `${containerWidth}px` }}
      title="Click to toggle status (Or press Spacebar)"
    >
      {/* Sliding background layer */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          backgroundColor: isUnresolved ? 'rgba(255, 237, 213, 0.4)' : 'rgba(204, 251, 241, 0.4)'
        }}
        transition={{ duration: 0.2 }}
      />

      {/* Label Text - sliding/fading depending on state using absolute positioning */}
      <div className="absolute inset-0 pointer-events-none text-[9px] font-extrabold tracking-wider font-sans select-none">
        <motion.span 
          animate={{ 
            opacity: isUnresolved ? 0 : 1,
            x: isUnresolved ? -8 : 0
          }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-700"
        >
          RESOLVED
        </motion.span>
        
        <motion.span 
          animate={{ 
            opacity: isUnresolved ? 1 : 0,
            x: isUnresolved ? 0 : 8
          }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-700"
        >
          UNRESOLVED
        </motion.span>
      </div>

      {/* Sliding knob with spring physics */}
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 450, damping: 28 }}
        className="relative z-10 w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center border border-white shrink-0"
      >
        {isUnresolved ? (
          <AlertTriangle className="w-3.5 h-3.5 text-orange-600 animate-pulse" />
        ) : (
          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
        )}
      </motion.div>
    </div>
  );
};

interface TriageRowProps {
  complaint: ComplaintMessage;
  uniqueCategories: string[];
  uniqueOfficers: string[];
  isExpanded: boolean;
  isFocused: boolean;
  onToggleExpand: () => void;
  onToggleStatus: (id: string, event?: React.MouseEvent | React.KeyboardEvent) => void;
  onUpdateCategory: (id: string, category: string) => void;
  onUpdateOfficer: (id: string, officer: string) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  currentTime: string;
}

export const TriageRow: React.FC<TriageRowProps> = ({
  complaint,
  uniqueCategories,
  uniqueOfficers,
  isExpanded,
  isFocused,
  onToggleExpand,
  onToggleStatus,
  onUpdateCategory,
  onUpdateOfficer,
  onUpdateNotes,
  currentTime
}) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const notesTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [localNotes, setLocalNotes] = React.useState(complaint.notes || '');
  const [isSavingNotes, setIsSavingNotes] = React.useState(false);
  const [popoverState, setPopoverState] = React.useState<'category' | 'officer' | null>(null);

  // Sync internal notes state when complaint notes change
  useEffect(() => {
    setLocalNotes(complaint.notes || '');
  }, [complaint.notes]);

  // Handle auto-saving notes after typing pauses
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    setLocalNotes(newVal);
    setIsSavingNotes(true);

    if (notesTimeoutRef.current) {
      clearTimeout(notesTimeoutRef.current);
    }

    notesTimeoutRef.current = setTimeout(() => {
      onUpdateNotes(complaint.id, newVal);
      setIsSavingNotes(false);
    }, 1000); // 1 sec debounce
  };

  useEffect(() => {
    return () => {
      if (notesTimeoutRef.current) {
        clearTimeout(notesTimeoutRef.current);
      }
    };
  }, []);

  // Keyboard accessibility
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // If typing in forms Inside expanded area, let keyboard write normally
    if (document.activeElement?.tagName === 'INPUT' || 
        document.activeElement?.tagName === 'TEXTAREA' || 
        document.activeElement?.tagName === 'SELECT') {
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      onToggleExpand();
    } else if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      onToggleStatus(complaint.id, e);
    }
  };

  const isUnresolved = complaint.status === 'unresolved';

  return (
    <div
      ref={rowRef}
      id={`row-${complaint.id}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={`group relative flex flex-col rounded-lg border transition-all duration-200 outline-none select-none shadow-sm
        ${isFocused ? 'ring-2 ring-blue-600 border-gray-200' : 'border-gray-100 hover:border-gray-200'}
        ${isExpanded ? 'bg-white border-gray-200 ring-1 ring-gray-100 shadow-md' : 'bg-white hover:bg-slate-50/70'}
        ${!isExpanded && !isUnresolved ? 'opacity-70 saturate-50' : 'opacity-100'}
      `}
    >
      {/* Keyboard hotkey quick badges on focused row */}
      {isFocused && !isExpanded && (
        <div className="absolute top-2 right-4 flex items-center gap-1.5 pointer-events-none text-[10px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
          <span>[Enter] Expand</span>
          <span className="text-gray-300">•</span>
          <span>[Space] Toggle Status</span>
        </div>
      )}

      {/* Row Header Layout: Metadata, Message, and Action Status Pill */}
      <div 
        onClick={(e) => {
          // If they click on the status pill or category change specifically, don't trigger expand
          const target = e.target as HTMLElement;
          if (target.closest('.status-click-zone') || target.closest('.no-row-trigger') || target.closest('select') || target.closest('button')) {
            return;
          }
          onToggleExpand();
        }}
        className="flex flex-col md:flex-row md:items-center py-3.5 px-4 md:py-4 md:px-5 gap-3 md:gap-4 cursor-pointer"
      >
        {/* LEFT: Metadata */}
        <div className="w-full md:w-44 flex md:flex-col items-center md:items-start justify-between md:justify-center shrink-0">
          <span className="font-mono text-sm font-semibold tracking-tight text-gray-700 bg-gray-100 text-gray-800 px-2 py-0.5 md:p-0 md:bg-transparent rounded md:rounded-none">
            {complaint.sender}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
            <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span title={new Date(complaint.timestamp).toLocaleString()}>
              {getRelativeTimeString(complaint.timestamp, currentTime)}
            </span>
          </div>
        </div>

        {/* CENTER: Message body (truncated) */}
        <div className="flex-1 min-w-0 pr-2 relative">

          <div className="flex flex-wrap gap-2 items-center mb-2">
            {/* Category badge */}
            <div className="relative isolate">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setPopoverState(popoverState === 'category' ? null : 'category');
                }}
                className={`no-row-trigger inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border cursor-pointer hover:ring-2 ring-offset-1 transition-all
                  ${complaint.category === 'Unassigned' 
                    ? 'bg-gray-100/80 text-gray-600 border-gray-200 ring-gray-300' 
                    : 'bg-indigo-50 text-indigo-700 border-indigo-100 ring-indigo-300'}
                `}
              >
                <Tag className="w-3 h-3" />
                {complaint.category}
              </button>
              <AnimatePresence>
                {popoverState === 'category' && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.15 }}
                    className="no-row-trigger absolute top-full mt-1 left-0"
                  >
                    <InlinePicker
                      type="Category"
                      currentValue={complaint.category}
                      options={uniqueCategories}
                      onSelect={(val) => { onUpdateCategory(complaint.id, val); setPopoverState(null); }}
                      onClose={() => setPopoverState(null)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Officer badge */}
            <div className="relative isolate">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setPopoverState(popoverState === 'officer' ? null : 'officer');
                }}
                className={`no-row-trigger inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border cursor-pointer hover:ring-2 ring-offset-1 transition-all
                  ${complaint.assignedOfficer === 'Unassigned' 
                    ? 'bg-gray-100/80 text-gray-500 border-gray-200 ring-gray-300' 
                    : 'bg-teal-50 text-teal-700 border-teal-100 ring-teal-300'}
                `}
              >
                <User className="w-3 h-3" />
                {complaint.assignedOfficer.split(' (')[0]}
              </button>
              <AnimatePresence>
                {popoverState === 'officer' && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.15 }}
                    className="no-row-trigger absolute top-full mt-1 left-0"
                  >
                    <InlinePicker
                      type="Officer"
                      currentValue={complaint.assignedOfficer}
                      options={uniqueOfficers}
                      onSelect={(val) => { onUpdateOfficer(complaint.id, val); setPopoverState(null); }}
                      onClose={() => setPopoverState(null)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Staff note indicator */}
            {complaint.notes && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 border border-orange-100">
                <FileText className="w-3 h-3" />
                Has Note
              </span>
            )}
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)]">
            <p className={`text-[13px] text-slate-800 leading-relaxed font-normal
              ${isExpanded ? 'font-medium' : 'line-clamp-2'}
            `}>
              {complaint.text}
            </p>
          </div>
        </div>

        {/* RIGHT: Status Sliding Switch */}
        <div className="status-click-zone shrink-0 self-end md:self-center mt-1.5 md:mt-0">
          <SlidingStatusToggle
            status={complaint.status}
            onToggle={(e) => onToggleStatus(complaint.id, e)}
          />
        </div>

        {/* Collapse toggle arrow */}
        <div className="hidden md:flex items-center justify-center text-gray-400 w-6">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      {/* Expanded Row Content Details */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-gray-100 bg-slate-50/60"
          >
            <div className="p-4 md:p-5 flex flex-col lg:flex-row gap-5 md:gap-6">
              
              {/* Left detail zone: Full complaint body & Audit log */}
              <div className="flex-1 flex flex-col gap-5">
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">Full message text</h4>
                  <div className="bg-white p-4 rounded-lg border border-gray-200 text-sm text-gray-800 font-normal leading-relaxed shadow-xs whitespace-pre-wrap select-text selection:bg-blue-100">
                    {complaint.text}
                  </div>
                </div>

                {/* Audit & Triage History */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <History className="w-4 h-4 text-gray-500" />
                    <h4 className="text-sm font-semibold text-gray-800">Triage history logs</h4>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-100 p-3 shadow-xs font-mono text-[11px] text-gray-600 space-y-2">
                    {complaint.history.map((log) => (
                      <div key={log.id} className="flex items-start gap-2 border-b border-gray-100 last:border-0 pb-1.5 last:pb-0">
                        <span className="text-gray-400 shrink-0 select-none">[{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}]</span>
                        <span className="text-blue-700 font-medium select-none">{log.user}:</span>
                        <span className="text-gray-700 font-normal">{log.action}</span>
                      </div>
                    ))}
                    {complaint.history.length === 0 && (
                      <div className="text-gray-400 italic">No history logged yet.</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right detail zone: Interactive manual triage tags controls */}
              <div className="w-full lg:w-80 flex flex-col gap-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm shrink-0 select-text">
                <h4 className="text-sm font-semibold text-gray-800 mb-2 border-b border-gray-100 pb-2">
                  Manual classification controls
                </h4>

                {/* Tag Category Option */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor={`cat-select-${complaint.id}`} className="text-xs font-semibold text-gray-600 flex items-center gap-1.5 select-none">
                    <Tag className="w-3.5 h-3.5 text-gray-400" />
                    Complaint Category
                  </label>
                  <select
                    id={`cat-select-${complaint.id}`}
                    value={complaint.category}
                    onChange={(e) => onUpdateCategory(complaint.id, e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg py-1.5 px-3 text-sm font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                  >
                    {COMPLAINT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tag Officer Option */}
                <div className="flex flex-col gap-1.5 mt-1">
                  <label htmlFor={`off-select-${complaint.id}`} className="text-xs font-semibold text-gray-600 flex items-center gap-1.5 select-none">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    Assigned Officer
                  </label>
                  <select
                    id={`off-select-${complaint.id}`}
                    value={complaint.assignedOfficer}
                    onChange={(e) => onUpdateOfficer(complaint.id, e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg py-1.5 px-3 text-sm font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                  >
                    {ASSIGNED_OFFICERS.map((off) => (
                      <option key={off} value={off}>
                        {off}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Notes Input option */}
                <div className="flex flex-col gap-1.5 mt-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor={`notes-${complaint.id}`} className="text-xs font-semibold text-gray-600 flex items-center gap-1.5 select-none">
                      <FileText className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
                      Staff Handover Notes
                    </label>
                    <span className="text-[10px] text-gray-400 font-mono" aria-live="polite">
                      {isSavingNotes ? 'Saving...' : 'Auto-saved'}
                    </span>
                  </div>
                  <textarea
                    id={`notes-${complaint.id}`}
                    aria-label={`Staff Handover Notes for complaint ${complaint.id}`}
                    rows={3}
                    placeholder="E.g., Spoke with resident, crew dispatched or pending approval..."
                    value={localNotes}
                    onChange={handleNotesChange}
                    className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-gray-200 shadow-sm rounded-lg p-2 text-sm text-gray-800 leading-relaxed focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                {/* Active Shortcut Reminder in expanded state */}
                <div className="mt-2 pt-2 border-t border-gray-100 text-[10px] text-gray-400 font-mono leading-normal select-none">
                  <p>• Press <kbd className="px-1 py-0.5 bg-gray-100 text-gray-600 rounded border">Space</kbd> to toggle Resolve status.</p>
                  <p className="mt-0.5">• Active edits auto-log to history trail.</p>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
