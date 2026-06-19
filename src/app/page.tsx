"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ComplaintMessage, Stats } from '../types';
import { 
  INITIAL_COMPLAINTS, 
  COMPLAINT_CATEGORIES, 
  ASSIGNED_OFFICERS, 
  formatDateLabel,
  getRelativeTimeString 
} from '../data';
import { TriageRow } from '../components/TriageRow';
import { 
  Inbox, 
  Search, 
  PlusCircle, 
  RotateCcw, 
  Keyboard, 
  CheckCircle2, 
  AlertTriangle, 
  Filter, 
  Tag, 
  User, 
  Check, 
  Clock, 
  ShieldAlert, 
  HelpCircle,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Static simulation templates for new WhatsApp messages
const SIMULATION_TEMPLATES = [
  {
    text: "Water supply not received in high density apartments block F since morning. Called local valve chamber helper but no answer.",
    category: "Water Supply",
    sender: "+91 97721 88301"
  },
  {
    text: "Severe electrical sparkling observed on overhead cable splice outside Metro Gate C. Sparks falling on parked scooters below!",
    category: "Electricity & Lighting",
    sender: "+91 80554 99112"
  },
  {
    text: "Deep open manhole under high water levels on Outer Road. Unmarked and extremely risky for night commuter driving.",
    category: "Drainage & Sewerage",
    sender: "+91 74011 22933"
  },
  {
    text: "Huge pile of putrid fish market scrap dumped in public bin near school bus stop. Bad odor is causing dizziness.",
    category: "Sanitation & Waste",
    sender: "+91 99881 77334"
  },
  {
    text: "Dangerous rogue bull wandering inside residential park area, blocking pathways and charging at senior citizens.",
    category: "Stray Animals",
    sender: "+91 93220 55110"
  },
  {
    text: "Main road intersection signal lights stopped working. Serious traffic gridlock, drivers Honking non-stop.",
    category: "Roads & Potholes",
    sender: "+91 94103 44005"
  }
];

export default function App() {
  // Application Data state
  const [complaints, setComplaints] = useState<ComplaintMessage[]>(() => {
    // Try to load from localStorage
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('message_triage_dashboard_data');
      if (cached) return JSON.parse(cached);
    }
    return INITIAL_COMPLAINTS;
  });

  // UI Filter states
  const [statusFilter, setStatusFilter] = useState<'all' | 'unresolved' | 'resolved'>('unresolved'); // Unresolved defaults as primary focus
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedOfficer, setSelectedOfficer] = useState('All');

  // Interactive layout states
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [showSimulator, setShowSimulator] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState<string | null>(null);

  const [delayedOutIds, setDelayedOutIds] = useState<Set<string>>(new Set());
  const [dateFilter, setDateFilter] = useState<'Today' | 'Yesterday' | 'Older'>('Today');

  // System local virtual clock state (fixed anchor matching current local time + relative ticking)
  const [currentTime, setCurrentTime] = useState<string>('2026-06-15T04:27:30-07:00');

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set([...COMPLAINT_CATEGORIES, ...complaints.map(c => c.category)]));
  }, [complaints]);

  const uniqueOfficers = useMemo(() => {
    return Array.from(new Set([...ASSIGNED_OFFICERS, ...complaints.map(c => c.assignedOfficer)]));
  }, [complaints]);

  // Trigger cache persistency on edit
  useEffect(() => {
    localStorage.setItem('message_triage_dashboard_data', JSON.stringify(complaints));
  }, [complaints]);

  // Virtual Ticking Clock to simulate live backend flow
  useEffect(() => {
    const startObj = new Date(currentTime);
    const interval = setInterval(() => {
      startObj.setSeconds(startObj.getSeconds() + 1);
      setCurrentTime(startObj.toISOString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Compute Stats - derived state
  const stats = useMemo<Stats>(() => {
    const unresolved = complaints.filter(c => c.status === 'unresolved').length;
    const resolved = complaints.filter(c => c.status === 'resolved').length;
    const todayCount = complaints.filter(c => {
      return formatDateLabel(c.timestamp, currentTime) === 'Today';
    }).length;

    return {
      total: complaints.length,
      unresolved,
      resolved,
      todayCount
    };
  }, [complaints, currentTime]);

  // Handle Quick Actions/Toggles
  const toggleStatus = (id: string, event?: React.MouseEvent | React.KeyboardEvent) => {
    if (event) {
      event.stopPropagation();
    }
    
    setComplaints(prev => prev.map(comp => {
      if (comp.id === id) {
        const nextStatus = comp.status === 'unresolved' ? 'resolved' : 'unresolved';
        
        // Feature: Delay exit so user sees the resolved status pill briefly before it sorts/filters away
        setDelayedOutIds(prevSet => new Set(prevSet).add(id));
        setTimeout(() => {
          setDelayedOutIds(currSet => {
            const nextSet = new Set(currSet);
            nextSet.delete(id);
            return nextSet;
          });
        }, 1000);

        // Log action to history trace
        const newLog = {
          id: `h-toggle-${Date.now()}`,
          timestamp: currentTime,
          action: `Status marked as ${nextStatus.toUpperCase()}`,
          user: 'Officer (Triage Board)'
        };

        // Trigger brief success toast
        showToast(`Complaint from ${comp.sender} marked as ${nextStatus}`);

        return {
          ...comp,
          status: nextStatus,
          history: [newLog, ...comp.history]
        };
      }
      return comp;
    }));
  };

  const updateCategory = (id: string, newCategory: string) => {
    setComplaints(prev => prev.map(comp => {
      if (comp.id === id) {
        const newLog = {
          id: `h-cat-${Date.now()}`,
          timestamp: currentTime,
          action: `Category manually classified to: ${newCategory}`,
          user: 'Staff Triage Operator'
        };
        showToast(`Updated Category to: ${newCategory}`);
        return {
          ...comp,
          category: newCategory,
          history: [newLog, ...comp.history]
        };
      }
      return comp;
    }));
  };

  const updateOfficer = (id: string, newOfficer: string) => {
    setComplaints(prev => prev.map(comp => {
      if (comp.id === id) {
        const newLog = {
          id: `h-off-${Date.now()}`,
          timestamp: currentTime,
          action: `Complaint assigned to: ${newOfficer}`,
          user: 'Staff Triage Operator'
        };
        showToast(`Assigned Officer: ${newOfficer}`);
        return {
          ...comp,
          assignedOfficer: newOfficer,
          history: [newLog, ...comp.history]
        };
      }
      return comp;
    }));
  };

  const updateNotes = (id: string, newNotes: string) => {
    setComplaints(prev => prev.map(comp => {
      if (comp.id === id) {
        const newLog = {
          id: `h-notes-${Date.now()}`,
          timestamp: currentTime,
          action: `Handover notes updated`,
          user: 'Staff Triage Operator'
        };
        return {
          ...comp,
          notes: newNotes,
          history: [newLog, ...comp.history] // preserve history logs
        };
      }
      return comp;
    }));
  };

  // Trigger transient toaster alert
  const showToast = (message: string) => {
    setShowSuccessToast(message);
    setTimeout(() => {
      setShowSuccessToast(null);
    }, 3000);
  };

  // Simulates a fresh WhatsApp incoming notification
  const simulateNewIncoming = () => {
    const randomIndex = Math.floor(Math.random() * SIMULATION_TEMPLATES.length);
    const template = SIMULATION_TEMPLATES[randomIndex];
    
    const uniqueId = `incoming-${Date.now()}`;
    // Simulate slight custom sender details
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const mobileNum = `${template.sender.substring(0, 11)} ${randomSuffix}`;

    const newArrival: ComplaintMessage = {
      id: uniqueId,
      sender: mobileNum,
      text: template.text,
      timestamp: currentTime, // Received just now virtual time
      status: 'unresolved',
      category: template.category,
      assignedOfficer: 'Unassigned',
      history: [
        {
          id: `h-sim-recv-${Date.now()}`,
          timestamp: currentTime,
          action: 'Complaint received via WhatsApp Public Feed API',
          user: 'System Webhook'
        }
      ]
    };

    setComplaints(prev => [newArrival, ...prev]);
    showToast(`New WhatsApp complaint received from ${mobileNum}`);
    // Auto expand newly arrived message for rapid triage
    setExpandedId(uniqueId);
    setFocusedId(uniqueId);
    
    // Auto scroll to active simulation section
    setTimeout(() => {
      const element = document.getElementById(`row-${uniqueId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 150);
  };

  const resetToDefaultDataset = () => {
    if (window.confirm("Restore original government simulation messages? All custom edits will be reset.")) {
      setComplaints(INITIAL_COMPLAINTS);
      setExpandedId(null);
      setFocusedId(null);
      showToast("Triage board reset to original master data.");
    }
  };

  // Filter complaints based on search queries and category tags
  const processedComplaints = useMemo(() => {
    return complaints.filter(comp => {
      // 1. Status Tab filter (with intentional delay bypass)
      const isDelayed = delayedOutIds.has(comp.id);
      if (!isDelayed) {
        if (statusFilter !== 'all' && comp.status !== statusFilter) {
          return false;
        }
      }

      // 2. Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const textMatch = comp.text.toLowerCase().includes(query);
        const phoneMatch = comp.sender.includes(query);
        const categoryMatch = comp.category.toLowerCase().includes(query);
        const officerMatch = comp.assignedOfficer.toLowerCase().includes(query);
        if (!textMatch && !phoneMatch && !categoryMatch && !officerMatch) {
          return false;
        }
      }

      // 3. Category Filter
      if (selectedCategory !== 'All' && comp.category !== selectedCategory) {
        return false;
      }

      // 4. Assigned Officer Filter
      if (selectedOfficer !== 'All' && comp.assignedOfficer !== selectedOfficer) {
        return false;
      }

      return true;
    });
  }, [complaints, statusFilter, searchQuery, selectedCategory, selectedOfficer]);

  // Group Complaints by Date: Today, Yesterday, Older
  // Deep rule: "Default sort: Unresolved first, then newest first."
  const groupedComplaints = useMemo(() => {
    const groups: {
      Today: ComplaintMessage[];
      Yesterday: ComplaintMessage[];
      Older: ComplaintMessage[];
    } = {
      Today: [],
      Yesterday: [],
      Older: []
    };

    // First sort the matched elements by Unresolved First, then newest timestamp first
    const sortedCopy = [...processedComplaints].sort((a, b) => {
      // Treat delayed items as their PREVIOUS status for sorting purposes
      const statusA = delayedOutIds.has(a.id) ? (a.status === 'unresolved' ? 'resolved' : 'unresolved') : a.status;
      const statusB = delayedOutIds.has(b.id) ? (b.status === 'unresolved' ? 'resolved' : 'unresolved') : b.status;

      // Unresolved first
      if (statusA === 'unresolved' && statusB === 'resolved') return -1;
      if (statusA === 'resolved' && statusB === 'unresolved') return 1;
      
      // Then newest first
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    // Distribute into respective Date categories
    sortedCopy.forEach(comp => {
      const label = formatDateLabel(comp.timestamp, currentTime);
      groups[label].push(comp);
    });

    return groups;
  }, [processedComplaints, currentTime, delayedOutIds]);

  const hasAnyMatchingItems = processedComplaints.length > 0;

  // Flattened active list for keyboard up/down navigation
  const activeFlattenedIds = useMemo(() => {
    // Keyboard lists now only apply to the visible grouped date tab
    return groupedComplaints[dateFilter].map(comp => comp.id);
  }, [groupedComplaints, dateFilter]);

  // Handle global keyboard shortcuts to expedite scanning
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      // If typing in filter or edit input, ignore shortcut overrides
      if (document.activeElement?.tagName === 'INPUT' || 
          document.activeElement?.tagName === 'TEXTAREA' || 
          document.activeElement?.tagName === 'SELECT') {
        if (e.key === 'Escape') {
          (document.activeElement as HTMLElement).blur();
        }
        return;
      }

      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        // Move focus down
        if (activeFlattenedIds.length === 0) return;
        if (!focusedId) {
          setFocusedId(activeFlattenedIds[0]);
        } else {
          const idx = activeFlattenedIds.indexOf(focusedId);
          if (idx < activeFlattenedIds.length - 1) {
            const nextId = activeFlattenedIds[idx + 1];
            setFocusedId(nextId);
            scrollToRow(nextId);
          }
        }
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        // Move focus up
        if (activeFlattenedIds.length === 0) return;
        if (!focusedId) {
          setFocusedId(activeFlattenedIds[activeFlattenedIds.length - 1]);
        } else {
          const idx = activeFlattenedIds.indexOf(focusedId);
          if (idx > 0) {
            const prevId = activeFlattenedIds[idx - 1];
            setFocusedId(prevId);
            scrollToRow(prevId);
          }
        }
      } else if (e.key === ' ' || e.key === 's') {
        // Toggle active row status
        if (focusedId) {
          e.preventDefault();
          toggleStatus(focusedId);
        }
      } else if (e.key === 'Enter' || e.key === 'o') {
        // Expand active row
        if (focusedId) {
          e.preventDefault();
          setExpandedId(prev => prev === focusedId ? null : focusedId);
        }
      } else if (e.key === 'Escape') {
        // Clear focus or collapse rows
        e.preventDefault();
        setExpandedId(null);
        setFocusedId(null);
        setSearchQuery('');
        setSelectedCategory('All');
        setSelectedOfficer('All');
      } else if (e.key === '?') {
        e.preventDefault();
        setShowShortcutsHelp(prev => !prev);
      } else if (e.key === 'w' || e.key === 'i') {
        // Instant simulator inbound shortcut
        e.preventDefault();
        simulateNewIncoming();
      }
    };

    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, [activeFlattenedIds, focusedId, currentTime, complaints]);

  const scrollToRow = (id: string) => {
    setTimeout(() => {
      const element = document.getElementById(`row-${id}`);
      if (element) {
        // Smooth scroll focused row if out of viewport view bounds
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 30);
  };

  const getDayUnresolvedCount = (list: ComplaintMessage[]) => {
    return list.filter(item => item.status === 'unresolved').length;
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#1F2937] antialiased pb-24 font-sans select-none tracking-normal">
      
      {/* 1. TOP UTILITY STATUS BAR */}
      <header className="relative md:sticky md:top-0 z-40 bg-white border-b border-gray-200 shadow-xs px-4 sm:px-6 py-2.5 md:py-3.5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
          
          {/* Brand Titles */}
          <div className="flex items-center gap-3">
            <div className="bg-[#2563EB] text-white p-2 rounded-lg flex items-center justify-center shrink-0">
              <Inbox className="w-5.5 h-5.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-sans text-[10px] font-bold bg-orange-500 text-white px-2 py-0.5 rounded tracking-wider uppercase select-none">
                  WhatsApp Direct
                </span>
                <span className="font-sans text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded tracking-wider uppercase select-none">
                  Gov-Intranet
                </span>
              </div>
              <h1 className="text-xl font-bold font-display tracking-tight text-gray-900 mt-0.5">
                Message Triage System
              </h1>
            </div>
          </div>

          {/* Real-time Triage Status HUD */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 md:self-end">
            {/* Live ticking virtual time reference */}
            <div className="bg-slate-100 border border-slate-200 hover:border-slate-300 py-1.5 px-3 rounded-lg flex items-center gap-2 text-xs text-gray-600">
              <Clock className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="font-mono font-bold tracking-tight">
                {new Date(currentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
              </span>
              <span className="text-gray-300 select-none font-normal">|</span>
              <span className="font-mono text-gray-500 font-medium">15 Jun 2026</span>
            </div>

            {/* Inbound Stats */}
            <div className="bg-amber-50/80 border border-amber-200 py-1.5 px-3 rounded-lg flex items-center gap-2.5 text-xs text-amber-900 font-medium shadow-xs">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping absolute" />
              <div className="w-2 h-2 rounded-full bg-amber-500 relative" />
              <span>
                <b className="font-mono font-bold">{stats.unresolved}</b> UNRESOLVED
              </span>
            </div>

            <div className="bg-emerald-50 border border-emerald-100 py-1.5 px-3 rounded-lg flex items-center gap-2 text-xs text-emerald-800 font-medium shadow-xs">
              <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" />
              <span>
                <b className="font-mono font-bold">{stats.resolved}</b> RESOLVED
              </span>
            </div>

            <button
              onClick={() => setShowShortcutsHelp(true)}
              className="hidden md:inline-flex bg-white hover:bg-slate-100 border border-gray-300 p-2 rounded-lg text-gray-600 shadow-xs hover:text-gray-900 transition-colors"
              title="View Triage Keyboard Shortcuts [?]"
            >
              <Keyboard className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 mt-6">
        
        {/* SUCCESS TOASTS DISPLAY */}
        <AnimatePresence>
          {showSuccessToast && (
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs py-3 px-4 rounded-lg shadow-xl flex items-center gap-3 border border-gray-800"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{showSuccessToast}</span>
              <button 
                onClick={() => setShowSuccessToast(null)} 
                className="text-gray-400 hover:text-white ml-2 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 2. EMERGENCY INBOUND SIMULATOR BOARD (ELEGANT DRAWER MOCKUP) */}
        <div className="mb-6 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs select-text">
          <div 
            onClick={() => setShowSimulator(!showSimulator)} 
            className="flex items-center justify-between px-5 py-3 cursor-pointer bg-slate-50 hover:bg-slate-100 border-b border-slate-200 select-none"
          >
            <div className="flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold font-mono uppercase tracking-wider text-gray-600">
                Inbound WhatsApp Simulation Hub
              </span>
              <span className="bg-slate-200 text-slate-800 text-[10px] font-mono px-1.5 py-0.2 rounded select-none shrink-0">
                Dev Tool
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="hidden sm:inline text-[11px] text-gray-400 font-medium">
                {showSimulator ? "Hide simulation panel" : "Expand to trigger new mock WhatsApp messages"}
              </span>
              <span className="text-gray-400 font-mono text-[11px]">
                {showSimulator ? " [Collapse] " : " [Expand] "}
              </span>
            </div>
          </div>

          <AnimatePresence>
            {showSimulator && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden bg-white p-5 border-t border-gray-100"
              >
                <p className="text-xs text-gray-500 leading-relaxed mb-4 max-w-3xl select-none">
                  This system operates under simulated low-bandwidth conditions, receiving direct citizen texts from WhatsApp. Use these tools to spawn high-urgency notifications and evaluate how the triage algorithm sorts them dynamically.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <button
                    onClick={simulateNewIncoming}
                    className="flex items-center justify-center gap-2.5 bg-blue-600 text-white hover:bg-blue-700 py-3 px-4 rounded-lg text-xs font-bold tracking-wide shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer select-none"
                  >
                    <PlusCircle className="w-4 h-4 shrink-0" />
                    <span>SPAWN RANDOM WHATSAPP</span>
                  </button>

                  <button
                    onClick={resetToDefaultDataset}
                    className="flex items-center justify-center gap-2.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-4 rounded-lg text-xs font-bold tracking-wide shadow-xs hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer select-none"
                  >
                    <RotateCcw className="w-1.5 h-3.5 shrink-0" />
                    <span>RESTORE ORIGINAL MASTER GRID</span>
                  </button>

                  <div className="col-span-1 sm:col-span-2 md:col-span-1 bg-slate-100 p-2.5 rounded-lg border border-slate-200/60 flex items-center justify-between text-xs font-mono text-gray-600 gap-2">
                    <span className="font-semibold select-none">Simulation Pool:</span>
                    <span className="bg-white px-2 py-0.5 rounded border text-gray-800 font-bold select-all">
                      {SIMULATION_TEMPLATES.length} pre-built cases
                    </span>
                  </div>
                </div>

                {/* Quick Shortcuts Hint inside active simulation */}
                <div className="mt-4 pt-3 border-t border-gray-200 flex flex-wrap gap-x-6 gap-y-1.5 text-[11px] text-gray-600 font-mono select-none">
                  <span className="font-semibold">Keyboard Key Shortcuts active globally:</span>
                  <span><kbd className="px-1 py-0.5 bg-gray-100 text-gray-800 rounded border border-gray-300 font-sans font-bold">[j]</kbd> / <kbd className="px-1 py-0.5 bg-gray-100 text-gray-800 rounded border border-gray-300 font-sans font-bold">[↓]</kbd> Move Down</span>
                  <span><kbd className="px-1 py-0.5 bg-gray-100 text-gray-800 rounded border border-gray-300 font-sans font-bold">[k]</kbd> / <kbd className="px-1 py-0.5 bg-gray-100 text-gray-800 rounded border border-gray-300 font-sans font-bold">[↑]</kbd> Move Up</span>
                  <span><kbd className="px-1 py-0.5 bg-gray-100 text-gray-800 rounded border border-gray-300 font-sans font-bold">[Space]</kbd> Toggle Status</span>
                  <span><kbd className="px-1 py-0.5 bg-gray-100 text-gray-800 rounded border border-gray-300 font-sans font-bold">[Enter]</kbd> Expand Row</span>
                  <span><kbd className="px-1 py-0.5 bg-gray-100 text-gray-800 rounded border border-gray-300 font-sans font-bold">[ESC]</kbd> Clear</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>


        {/* 3. CORE FILTER & SEARCH BAR BLOCK (STICKY SUB-HEADER) */}
        <div className="sticky top-0 md:top-[73px] z-30 bg-white border border-gray-200 rounded-lg p-3 sm:p-4 shadow-xs mb-6 select-text">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* LARGE PILL FILTERS (ALL, UNRESOLVED, RESOLVED) */}
            <div className="flex items-center gap-1 sm:gap-1.5 bg-gray-50 p-1 sm:p-1.5 rounded-lg border border-gray-200 self-start overflow-x-auto w-full sm:w-auto scrollbar-hide shrink-0">
              <button
                type="button"
                aria-label="Show unresolved items"
                onClick={() => {
                  setStatusFilter('unresolved');
                  setFocusedId(null);
                }}
                className={`flex shrink-0 items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-semibold transition-all cursor-pointer outline-none focus:ring-2 focus:ring-blue-500
                  ${statusFilter === 'unresolved' 
                    ? 'bg-orange-100 text-orange-700 shadow-sm ring-1 ring-orange-200 focus:outline-none' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}
                `}
              >
                <span>Unresolved</span>
                <span className="bg-white/60 px-1.5 py-0.5 rounded text-[11px] ml-1">{complaints.filter(c => c.status === 'unresolved').length}</span>
              </button>

              <button
                type="button"
                aria-label="Show all items"
                onClick={() => {
                  setStatusFilter('all');
                  setFocusedId(null);
                }}
                className={`flex shrink-0 items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-semibold transition-all cursor-pointer outline-none focus:ring-2 focus:ring-blue-500
                  ${statusFilter === 'all' 
                    ? 'bg-blue-100 text-blue-700 shadow-sm ring-1 ring-blue-200 focus:outline-none' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}
                `}
              >
                <span>All Inbox</span>
                <span className="bg-white/60 px-1.5 py-0.5 rounded text-[11px] ml-1">{complaints.length}</span>
              </button>

              <button
                type="button"
                aria-label="Show resolved items"
                onClick={() => {
                  setStatusFilter('resolved');
                  setFocusedId(null);
                }}
                className={`flex shrink-0 items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-semibold transition-all cursor-pointer outline-none focus:ring-2 focus:ring-blue-500
                  ${statusFilter === 'resolved' 
                    ? 'bg-emerald-100 text-emerald-700 shadow-sm ring-1 ring-emerald-200' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}
                `}
              >
                <span>Resolved</span>
                <span className="bg-white/60 px-1.5 py-0.5 rounded text-[11px] ml-1">{complaints.filter(c => c.status === 'resolved').length}</span>
              </button>
            </div>

            {/* INTEGRATED RAPID KEYWORD SEARCH FILTER */}
            <div className="flex-1 w-full lg:max-w-md flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                <input
                  type="text"
                  aria-label="Search items"
                  placeholder="Scan phone numbers, complaints, departments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white border border-gray-200 rounded-lg pl-10 pr-9 py-2.5 text-sm text-gray-800 placeholder-gray-400 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1 rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Clear filter keywords"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* ADVANCED CLASSIFICATION SELECTORS IN FILTER BAR (TO HELP STAFF COGNITIVE TRIAGE) */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 pt-3 border-t border-gray-100 text-sm font-medium select-none text-gray-600">
            <span className="font-semibold text-gray-800">
              Secondary filters:
            </span>

            {/* Filter class tag category */}
            <div className="flex items-center gap-1.5">
              <label htmlFor="top-category-select" className="sr-only">Category</label>
              <span aria-hidden="true" className="font-medium text-gray-600">Category:</span>
              <select
                id="top-category-select"
                aria-label="Filter by Category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-50 border border-gray-200 rounded-lg px-2 py-1 text-sm text-gray-800 font-medium cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
              >
                <option value="All">All Categories</option>
                {uniqueCategories.filter(c => c !== 'Unassigned').map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Filter by target assigned officer */}
            <div className="flex items-center gap-1.5">
              <label htmlFor="top-officer-select" className="sr-only">Officer</label>
              <span aria-hidden="true" className="font-medium text-gray-600">Officer:</span>
              <select
                id="top-officer-select"
                aria-label="Filter by Officer"
                value={selectedOfficer}
                onChange={(e) => setSelectedOfficer(e.target.value)}
                className="bg-slate-50 border border-gray-200 rounded-lg px-2 py-1 text-sm text-gray-800 font-medium cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
              >
                <option value="All">All Officers</option>
                {uniqueOfficers.filter(c => c !== 'Unassigned').map(off => (
                  <option key={off} value={off}>{off.split(' (')[0]}</option>
                ))}
              </select>
            </div>

            {(searchQuery || selectedCategory !== 'All' || selectedOfficer !== 'All') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSelectedOfficer('All');
                }}
                className="text-xs text-blue-700 hover:text-blue-900 hover:underline flex items-center gap-1 font-bold cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
                aria-label="Reset secondary tags"
              >
                Reset tags
              </button>
            )}

            {/* Active filters status indicators */}
            <div className="ml-auto font-mono text-[11px] text-gray-500">
              Showing <b className="text-gray-900 font-bold">{processedComplaints.length}</b> of {complaints.length} items
            </div>
          </div>

        </div>

        {/* 4. MAIN CONTENT AREA: MESSAGES GRID GROUPED BY DATE */}
        <div className="select-text space-y-6">
          
          {/* DATE GROUP TOGGLES */}
          <div className="flex flex-wrap items-center gap-4 md:gap-6 border-b border-gray-200 select-none">
            {(['Today', 'Yesterday', 'Older'] as const).map(tab => {
              const count = groupedComplaints[tab].length;
              const isActive = dateFilter === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setDateFilter(tab);
                    setFocusedId(null);
                  }}
                  className={`relative pb-3 flex items-center gap-2 cursor-pointer font-sans transition-colors focus:outline-none focus:ring-0
                    ${isActive ? 'text-gray-900 font-bold' : 'text-gray-400 hover:text-gray-600 font-medium'}
                  `}
                >
                  <span className="uppercase tracking-wider text-xs">{tab}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold transition-colors
                    ${isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500 opacity-60'}
                  `}>
                    {count}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-blue-600 rounded-t-sm"
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="relative min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${statusFilter}-${selectedCategory}-${selectedOfficer}-${dateFilter}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10, transition: { duration: 0.1 } }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="space-y-3 w-full"
              >
                {groupedComplaints[dateFilter].length > 0 ? (
                  groupedComplaints[dateFilter].map(complaint => (
                    <TriageRow
                      key={complaint.id}
                      complaint={complaint}
                      uniqueCategories={uniqueCategories}
                      uniqueOfficers={uniqueOfficers}
                      isExpanded={expandedId === complaint.id}
                      isFocused={focusedId === complaint.id}
                      onToggleExpand={() => {
                        setExpandedId(prev => prev === complaint.id ? null : complaint.id);
                        setFocusedId(complaint.id);
                      }}
                      onToggleStatus={toggleStatus}
                      onUpdateCategory={updateCategory}
                      onUpdateOfficer={updateOfficer}
                      onUpdateNotes={updateNotes}
                      currentTime={currentTime}
                    />
                  ))
                ) : (
                  <div className="bg-white border border-gray-200 rounded-lg p-12 text-center max-w-xl mx-auto shadow-xs select-none">
                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                      <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900 font-sans tracking-tight">
                      No {dateFilter.toLowerCase()} {statusFilter !== 'all' ? statusFilter : ''} messages
                    </h3>
                    <p className="text-xs text-gray-500 mt-2 leading-relaxed max-w-sm mx-auto">
                      All caught up. No tickets found matching the specified parameters in this period.
                    </p>

                    {(statusFilter !== 'all' || searchQuery || selectedCategory !== 'All' || selectedOfficer !== 'All') && (
                      <div className="mt-6 pt-5 border-t border-gray-100 flex flex-col gap-2 items-center">
                        <span className="text-[11px] text-gray-400 font-medium font-mono uppercase">
                          Active Constraints:
                        </span>
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          {statusFilter !== 'all' && (
                            <span className="bg-slate-100 text-slate-800 text-[11px] px-2.5 py-1 rounded border font-semibold">
                              Filter: {statusFilter.toUpperCase()}
                            </span>
                          )}
                          {searchQuery && (
                            <span className="bg-slate-100 text-slate-800 text-[11px] px-2.5 py-1 rounded border font-semibold">
                              Search: "{searchQuery}"
                            </span>
                          )}
                          {selectedCategory !== 'All' && (
                            <span className="bg-slate-100 text-slate-800 text-[11px] px-2.5 py-1 rounded border font-semibold">
                              Category: {selectedCategory}
                            </span>
                          )}
                          {selectedOfficer !== 'All' && (
                            <span className="bg-slate-100 text-slate-800 text-[11px] px-2.5 py-1 rounded border font-semibold">
                              Officer: {selectedOfficer}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            setStatusFilter('all');
                            setSearchQuery('');
                            setSelectedCategory('All');
                            setSelectedOfficer('All');
                            setFocusedId(null);
                          }}
                          className="mt-3 text-xs text-blue-600 hover:text-blue-800 hover:underline font-bold tracking-tight cursor-pointer"
                        >
                          Reset all filters
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

      </main>

      {/* 6. SYSTEM FLOATING SHORTCUT HELPER PORTAL */}
      <AnimatePresence>
        {showShortcutsHelp && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-gray-200 rounded-lg p-6 shadow-2xl max-w-md w-full relative select-text"
            >
              <button
                onClick={() => setShowShortcutsHelp(false)}
                className="absolute top-4 right-4 text-gray-450 hover:text-gray-700 p-1 cursor-pointer"
                title="Close shortcuts help dialog"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <Keyboard className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800 font-mono">
                  Triage Hotkeys Panel
                </h3>
              </div>

              <p className="text-xs text-gray-500 leading-relaxed mb-4">
                This system is built from the ground up to allow rapid, keyboard-to-screen triage workflows. Work without a mouse to expedite citizen ticket processing:
              </p>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between border-b pb-1.5 border-gray-100">
                  <span className="text-gray-600 font-medium">Navigate down list:</span>
                  <span className="font-mono bg-slate-100 border px-2 py-0.5 rounded text-gray-800 font-bold">
                    ArrowDown or [j]
                  </span>
                </div>
                <div className="flex items-center justify-between border-b pb-1.5 border-gray-100">
                  <span className="text-gray-600 font-medium">Navigate up list:</span>
                  <span className="font-mono bg-slate-100 border px-2 py-0.5 rounded text-gray-800 font-bold">
                    ArrowUp or [k]
                  </span>
                </div>
                <div className="flex items-center justify-between border-b pb-1.5 border-gray-100">
                  <span className="text-gray-600 font-medium">Expand/Collapse highlighted message:</span>
                  <span className="font-mono bg-slate-100 border px-2 py-0.5 rounded text-gray-800 font-bold">
                    Enter or [o]
                  </span>
                </div>
                <div className="flex items-center justify-between border-b pb-1.5 border-gray-100">
                  <span className="text-gray-600 font-medium">Toggle Status (Resolved / Unresolved):</span>
                  <span className="font-mono bg-slate-100 border px-2 py-0.5 rounded text-gray-800 font-bold">
                    Spacebar or [s]
                  </span>
                </div>
                <div className="flex items-center justify-between border-b pb-1.5 border-gray-100">
                  <span className="text-gray-600 font-medium">Instantly spawn dynamic inbound ticket:</span>
                  <span className="font-mono bg-slate-100 border px-2 py-0.5 rounded text-gray-800 font-bold">
                    [w] or [i]
                  </span>
                </div>
                <div className="flex items-center justify-between border-b pb-1.5 border-gray-100">
                  <span className="text-gray-600 font-medium">Reset Filters / Collapse all focus:</span>
                  <span className="font-mono bg-slate-100 border px-2 py-0.5 rounded text-gray-800 font-bold">
                    Escape
                  </span>
                </div>
              </div>

              <div className="mt-5 bg-blue-50 text-blue-800 rounded-lg p-3 text-[11px] leading-relaxed">
                <b>Pro-Tip:</b> Select a row by pressing standard <b>Tab</b>, then use up/down arrows to zip fast!
              </div>

              <button
                onClick={() => setShowShortcutsHelp(false)}
                className="mt-4 w-full bg-slate-900 text-white hover:bg-slate-800 py-2.5 rounded-lg text-xs font-bold font-mono uppercase cursor-pointer"
              >
                Dismiss Help Panel
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FOOTER SECTION info */}
      <footer className="mt-12 py-6 border-t border-gray-200 text-center text-xs text-gray-400 font-mono select-none">
        <p>Message Triage Dashboard v2.4.1 • WhatsApp Internal Government Portal</p>
        <p className="mt-1">Designed for speed, minimal fatigue, and instant decision making.</p>
      </footer>

    </div>
  );
}
