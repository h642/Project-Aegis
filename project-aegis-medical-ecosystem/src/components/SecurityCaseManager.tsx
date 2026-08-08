import React, { useState, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Shield, 
  Lock, 
  FileDown, 
  Plus, 
  Clock, 
  Cpu, 
  User, 
  Building2, 
  AlertTriangle, 
  Search, 
  CheckCircle2, 
  HelpCircle, 
  Filter, 
  FileText, 
  Radio, 
  Activity, 
  Layers, 
  ExternalLink,
  MessageSquare,
  Sparkles,
  ChevronRight,
  Info
} from 'lucide-react';

export type CaseStatus = 'Needs Review' | 'Suspected' | 'Verified';
export type RoleScope = 'All' | 'User' | 'Admin' | 'Authority' | 'Hospital' | 'Investigator';

export interface InvestigatorNote {
  id: string;
  author: string;
  role: string;
  text: string;
  timestamp: string;
}

export interface SecurityCase {
  id: string;
  timestamp: string;
  detectionScore: number; // e.g. 96.8
  event: string;
  deviceHash: string;
  firmwareVersion?: string;
  assignedRole: RoleScope;
  status: CaseStatus;
  explanation: string;
  notes: InvestigatorNote[];
  vitalsAtEvent?: {
    heartRateBpm: number;
    spO2Percent: number;
    gForceMagnitude: number;
  };
}

const INITIAL_CASES: SecurityCase[] = [
  {
    id: 'CASE-2026-8891',
    timestamp: '2026-08-07T09:14:22Z',
    detectionScore: 96.8,
    event: 'High-G Impact & Post-Kinematic Unresponsiveness',
    deviceHash: '0x8f2a7b3e91bc44a101f2983c8a91',
    firmwareVersion: 'v4.12.0-aegis',
    assignedRole: 'Authority',
    status: 'Needs Review',
    explanation: 'Primary accelerometer logged a 7.4G tri-axial deceleration spike consistent with a hard fall impact. Secondary photoplethysmography (PPG) detected transient tachycardia (138 BPM) followed by sudden physical immobility lasting > 45 seconds. Vocal prompt went unanswered.',
    vitalsAtEvent: { heartRateBpm: 138, spO2Percent: 94, gForceMagnitude: 7.4 },
    notes: [
      {
        id: 'note-1',
        author: 'Capt. M. Vance',
        role: 'Dispatch Officer',
        text: 'Initial alert triaged via automated dispatch pipeline. EMS squad #42 routed to last known GPS coordinates.',
        timestamp: '2026-08-07T09:16:05Z'
      }
    ]
  },
  {
    id: 'CASE-2026-8892',
    timestamp: '2026-08-07T08:45:10Z',
    detectionScore: 92.4,
    event: 'Acute Arrhythmia & Rapid Pulse Oscillations',
    deviceHash: '0x3c9902ff71ab32d18809cde32811',
    firmwareVersion: 'v4.11.8-aegis',
    assignedRole: 'Hospital',
    status: 'Verified',
    explanation: 'SpO2 telemetry dipped below 88% while optical pulse telemetry rapidly oscillated between 45 BPM and 152 BPM within 12 seconds. Automated AI triage flagged possible acute ventricular flutter episode.',
    vitalsAtEvent: { heartRateBpm: 152, spO2Percent: 87, gForceMagnitude: 1.0 },
    notes: [
      {
        id: 'note-2',
        author: 'Dr. S. Nair',
        role: 'Attending Cardiologist',
        text: 'Patient telehealth call completed. Confirmed onset of presyncope symptoms. Admitted for telemetry monitoring.',
        timestamp: '2026-08-07T08:52:30Z'
      }
    ]
  },
  {
    id: 'CASE-2026-8893',
    timestamp: '2026-08-07T07:20:00Z',
    detectionScore: 84.1,
    event: 'Panic SOS Trigger & Rapid Velocity Geofence Exit',
    deviceHash: '0x1d4400a120ce99120042fb1892aa',
    firmwareVersion: 'v4.12.0-aegis',
    assignedRole: 'User',
    status: 'Suspected',
    explanation: 'Hardware emergency tactile switch sustained 3-second compression. Rapid speed vector (>85 km/h) recorded outside designated safe zone within 90 seconds of SOS activation.',
    vitalsAtEvent: { heartRateBpm: 112, spO2Percent: 98, gForceMagnitude: 1.8 },
    notes: [
      {
        id: 'note-3',
        author: 'E. Rodriguez',
        role: 'Family Guardian',
        text: 'Attempted phone check-in. User requested callback; verifying if accidental trigger during commute.',
        timestamp: '2026-08-07T07:25:12Z'
      }
    ]
  },
  {
    id: 'CASE-2026-8894',
    timestamp: '2026-08-07T06:12:45Z',
    detectionScore: 98.2,
    event: 'Multi-Axis Kinematic Crash & Vehicle Deceleration',
    deviceHash: '0x9e31a0211bc9942a1982348aa210',
    firmwareVersion: 'v4.12.1-aegis',
    assignedRole: 'Investigator',
    status: 'Verified',
    explanation: 'Sensors recorded an 11.2G downward force combined with 8.9G lateral angular velocity. High-speed crash algorithm confirmed catastrophic kinetic event.',
    vitalsAtEvent: { heartRateBpm: 145, spO2Percent: 91, gForceMagnitude: 11.2 },
    notes: [
      {
        id: 'note-4',
        author: 'Det. H. Miller',
        role: 'Lead Investigator',
        text: 'Traffic collision verified at Highway 101 KM 42. Vehicle rescue team on site. Case locked for evidence packet.',
        timestamp: '2026-08-07T06:30:00Z'
      }
    ]
  },
  {
    id: 'CASE-2026-8895',
    timestamp: '2026-08-07T05:05:18Z',
    detectionScore: 78.5,
    event: 'Erratic Optical Telemetry & Hardware Contact Fault',
    deviceHash: '0x5501fa00213398c110298e10221a',
    firmwareVersion: 'v4.10.2-aegis',
    assignedRole: 'Admin',
    status: 'Needs Review',
    explanation: 'Pulse sensor emitted non-physiological values (0 BPM alternating with 240 BPM) while accelerometer baseline remained steady (1.0G). Diagnostic flags indicate skin-contact sensor detachment.',
    vitalsAtEvent: { heartRateBpm: 0, spO2Percent: 0, gForceMagnitude: 1.0 },
    notes: [
      {
        id: 'note-5',
        author: 'T. Kowalski',
        role: 'SysAdmin Engineer',
        text: 'Firmware diagnostic ping sent. Hardware lead requested sensor recalibration or strap replacement.',
        timestamp: '2026-08-07T05:20:00Z'
      }
    ]
  }
];

export function SecurityCaseManager() {
  const [cases, setCases] = useState<SecurityCase[]>(INITIAL_CASES);
  const [selectedCaseId, setSelectedCaseId] = useState<string>(INITIAL_CASES[0].id);
  const [roleFilter, setRoleFilter] = useState<RoleScope>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | CaseStatus>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // New Note Form State
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteAuthor, setNewNoteAuthor] = useState('Security Officer');
  const [newNoteRole, setNewNoteRole] = useState('Investigator');
  const [exportFormat, setExportFormat] = useState<'txt' | 'json' | 'pdf'>('pdf');

  // Filtered cases list
  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      const matchesRole = roleFilter === 'All' || c.assignedRole === roleFilter;
      const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
      const matchesSearch = searchQuery === '' || 
        c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.deviceHash.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesRole && matchesStatus && matchesSearch;
    });
  }, [cases, roleFilter, statusFilter, searchQuery]);

  // Selected Case Object
  const selectedCase = useMemo(() => {
    return cases.find(c => c.id === selectedCaseId) || cases[0];
  }, [cases, selectedCaseId]);

  // Handle status update
  const handleUpdateStatus = (newStatus: CaseStatus) => {
    setCases(prevCases => prevCases.map(c => {
      if (c.id === selectedCaseId) {
        return { ...c, status: newStatus };
      }
      return c;
    }));
  };

  // Handle adding an investigator note
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const createdNote: InvestigatorNote = {
      id: `note-${Date.now()}`,
      author: newNoteAuthor.trim() || 'Reviewer',
      role: newNoteRole,
      text: newNoteText.trim(),
      timestamp: new Date().toISOString()
    };

    setCases(prevCases => prevCases.map(c => {
      if (c.id === selectedCaseId) {
        return {
          ...c,
          notes: [createdNote, ...c.notes]
        };
      }
      return c;
    }));

    setNewNoteText('');
  };

  // Handle Export Evidence Brief Download
  const handleExportBrief = () => {
    if (!selectedCase) return;

    if (exportFormat === 'pdf') {
      const doc = new jsPDF();

      // Header Banner
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(10, 10, 190, 26, 'F');
      
      doc.setTextColor(6, 182, 212); // cyan-400
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('AEGIS-ONE SECURITY INCIDENT & EVIDENCE BRIEF', 15, 21);

      doc.setFontSize(8);
      doc.setTextColor(16, 185, 129); // emerald-400
      doc.text('AUDIT STAMP: DETECTION MODEL UNCHANGED / UNALTERED', 15, 29);

      let y = 45;

      // Section 1: Case Identification & Metadata
      doc.setFillColor(241, 245, 249);
      doc.rect(10, y - 5, 190, 8, 'F');
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('1. Case Identification & Metadata', 13, y);
      y += 8;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Case Reference ID : ${selectedCase.id}`, 15, y); y += 5;
      doc.text(`Event Timestamp   : ${selectedCase.timestamp}`, 15, y); y += 5;
      doc.text(`Scope Role        : ${selectedCase.assignedRole}`, 15, y); y += 5;
      doc.text(`Current Status    : ${selectedCase.status}`, 15, y); y += 10;

      // Section 2: Telemetry & Model Inference
      doc.setFillColor(241, 245, 249);
      doc.rect(10, y - 5, 190, 8, 'F');
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('2. Telemetry & Model Inference', 13, y);
      y += 8;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Event Description : ${selectedCase.event}`, 15, y); y += 5;
      doc.text(`Confidence Score  : ${selectedCase.detectionScore}%`, 15, y); y += 5;
      doc.text(`Hardware Hash     : ${selectedCase.deviceHash}`, 15, y); y += 5;
      doc.text(`Firmware Build    : ${selectedCase.firmwareVersion || 'v4.12.0'}`, 15, y); y += 5;
      doc.text(`Recorded Vitals   : HR ${selectedCase.vitalsAtEvent?.heartRateBpm || 'N/A'} BPM  |  SpO2 ${selectedCase.vitalsAtEvent?.spO2Percent || 'N/A'}%  |  Kinematics ${selectedCase.vitalsAtEvent?.gForceMagnitude || 'N/A'}G`, 15, y); y += 10;

      // Section 3: Model Explanation
      doc.setFillColor(241, 245, 249);
      doc.rect(10, y - 5, 190, 8, 'F');
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('3. Model Detection Explanation', 13, y);
      y += 8;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const expLines = doc.splitTextToSize(selectedCase.explanation, 180);
      doc.text(expLines, 15, y);
      y += (expLines.length * 4.5) + 8;

      // Section 4: Investigator Notes & Audit Trail
      if (y > 230) {
        doc.addPage();
        y = 20;
      }

      doc.setFillColor(241, 245, 249);
      doc.rect(10, y - 5, 190, 8, 'F');
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('4. Persistent Investigator Notes & Audit Trail', 13, y);
      y += 8;

      doc.setFontSize(9);
      if (selectedCase.notes.length === 0) {
        doc.setFont('helvetica', 'italic');
        doc.text('(No reviewer notes submitted yet)', 15, y);
        y += 8;
      } else {
        selectedCase.notes.forEach((n, idx) => {
          if (y > 260) {
            doc.addPage();
            y = 20;
          }
          doc.setFont('helvetica', 'bold');
          doc.text(`[Note #${idx + 1}] ${n.author} (${n.role}) - ${new Date(n.timestamp).toLocaleString()}`, 15, y);
          y += 4.5;
          doc.setFont('helvetica', 'normal');
          const noteLines = doc.splitTextToSize(`"${n.text}"`, 175);
          doc.text(noteLines, 20, y);
          y += (noteLines.length * 4.5) + 5;
        });
      }

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`Official Aegis Care Evidence Brief • Generated on ${new Date().toLocaleString()}`, 15, 285);

      doc.save(`Evidence_Brief_${selectedCase.id}.pdf`);

    } else if (exportFormat === 'json') {
      const exportObject = {
        exportMetadata: {
          generatedAt: new Date().toISOString(),
          system: 'AEGIS Security Case Manager & Triage Hub',
          auditDeclaration: 'DETECTION MODEL UNCHANGED / UNALTERED. Reviewer updates strictly serve as an annotation and audit layer over raw telemetry.'
        },
        caseDetails: {
          caseReferenceId: selectedCase.id,
          timestamp: selectedCase.timestamp,
          scopeRole: selectedCase.assignedRole,
          investigationStatus: selectedCase.status,
          modelDetectionConfidenceScore: `${selectedCase.detectionScore}%`,
          deviceHardwareHash: selectedCase.deviceHash,
          firmwareVersion: selectedCase.firmwareVersion || 'v4.12.0',
          eventTitle: selectedCase.event,
          vitalsAtEvent: selectedCase.vitalsAtEvent,
          aiModelExplanation: selectedCase.explanation
        },
        reviewerNotes: selectedCase.notes
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObject, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `Evidence_Brief_${selectedCase.id}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } else {
      // Clean Plain Text Brief
      const notesFormatted = selectedCase.notes.length > 0 
        ? selectedCase.notes.map((n, idx) => `  [Note #${idx + 1}] ${n.author} (${n.role}) @ ${n.timestamp}\n  "${n.text}"`).join('\n\n')
        : '  (No reviewer notes submitted yet)';

      const textContent = `================================================================================
AEGIS-ONE SECURITY INCIDENT & EVIDENCE BRIEF
================================================================================
CRITICAL AUDIT STAMP: DETECTION MODEL UNCHANGED / UNALTERED
Notice: Reviewer status updates and investigator notes serve strictly as an 
annotation and audit layer over the telemetry payload. Inference weights are unaltered.
================================================================================

1. CASE IDENTIFICATION & METADATA
--------------------------------------------------------------------------------
Case Reference ID : ${selectedCase.id}
Event Timestamp   : ${selectedCase.timestamp}
Scope / Role      : ${selectedCase.assignedRole}
Current Status    : ${selectedCase.status}

2. TELEMETRY & MODEL INFERENCE
--------------------------------------------------------------------------------
Event Description : ${selectedCase.event}
Confidence Score  : ${selectedCase.detectionScore}%
Hardware Hash     : ${selectedCase.deviceHash}
Firmware Build    : ${selectedCase.firmwareVersion || 'v4.12.0'}
Recorded Vitals   : HR: ${selectedCase.vitalsAtEvent?.heartRateBpm || 'N/A'} BPM | SpO2: ${selectedCase.vitalsAtEvent?.spO2Percent || 'N/A'}% | Kinematics: ${selectedCase.vitalsAtEvent?.gForceMagnitude || 'N/A'}G

3. MODEL DETECTION EXPLANATION
--------------------------------------------------------------------------------
${selectedCase.explanation}

4. PERSISTENT INVESTIGATOR NOTES & AUDIT TRAIL
--------------------------------------------------------------------------------
${notesFormatted}

================================================================================
End of Official Evidence Brief. Generated at ${new Date().toISOString()}
================================================================================`;

      const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', url);
      downloadAnchor.setAttribute('download', `Evidence_Brief_${selectedCase.id}.txt`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      URL.revokeObjectURL(url);
    }
  };

  // Status Badge Helper
  const renderStatusBadge = (status: CaseStatus, size: 'sm' | 'md' = 'sm') => {
    switch (status) {
      case 'Verified':
        return (
          <span className={`inline-flex items-center gap-1.5 font-medium rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 ${size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Verified
          </span>
        );
      case 'Suspected':
        return (
          <span className={`inline-flex items-center gap-1.5 font-medium rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 ${size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            Suspected
          </span>
        );
      case 'Needs Review':
      default:
        return (
          <span className={`inline-flex items-center gap-1.5 font-medium rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 ${size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}>
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            Needs Review
          </span>
        );
    }
  };

  const roleScopesList: RoleScope[] = ['All', 'User', 'Admin', 'Authority', 'Hospital', 'Investigator'];
  const statusFiltersList: ('All' | CaseStatus)[] = ['All', 'Needs Review', 'Suspected', 'Verified'];

  return (
    <div className="w-full space-y-6 text-slate-100 font-sans">
      
      {/* Top System Header Banner & Integrity Assurance */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 p-5 md:p-6 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  Security Case Management & Triage Hub
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                    LIVE INCIDENT ENGINE
                  </span>
                </h1>
                <p className="text-xs md:text-sm text-slate-400">
                  Role-scoped incident verification, persistent investigator notes, and forensic evidence package generator.
                </p>
              </div>
            </div>
          </div>

          {/* CRITICAL INTEGRITY BADGE: Model Unchanged */}
          <div className="flex items-center gap-3 p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 tracking-wide uppercase">
                <ShieldCheck className="w-4 h-4" />
                Detection Model Unchanged / Unaltered
              </div>
              <p className="text-[11px] text-slate-300 leading-tight">
                Reviewer annotations & status edits function strictly as an audit layer. Weights & parameters remain read-only.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Role Scopes & Status Filter Toolbar */}
      <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-4 space-y-4 backdrop-blur-md">
        
        {/* Role Scope Tabs */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Role Scope Filter:
            </label>
            <span className="text-xs font-mono text-cyan-400">
              Filtered Records ({filteredCases.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {roleScopesList.map(role => {
              const isActive = roleFilter === role;
              const count = role === 'All' 
                ? cases.length 
                : cases.filter(c => c.assignedRole === role).length;

              return (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-2 border ${
                    isActive
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:border-slate-600'
                  }`}
                >
                  <span>{role}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isActive ? 'bg-cyan-500/30 text-cyan-100' : 'bg-slate-700 text-slate-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search & Status Sub-filters Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-3 border-t border-slate-800">
          
          {/* Status Sub-filter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-slate-500" /> Status:
            </span>
            {statusFiltersList.map(st => {
              const isActive = statusFilter === st;
              return (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-md text-xs transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-700 text-white font-semibold border border-slate-600'
                      : 'bg-slate-800/40 text-slate-400 hover:text-slate-300'
                  }`}
                >
                  {st}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search Case ID, Event, Hash..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/70 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30"
            />
          </div>
        </div>

      </div>

      {/* Main Grid: Cases Master List & Selected Case Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Cases List (Master) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-cyan-400" />
              Security Incidents ({filteredCases.length})
            </h3>
            <span className="text-[11px] text-slate-500">Select case for details</span>
          </div>

          {filteredCases.length === 0 ? (
            <div className="p-8 text-center rounded-xl border border-dashed border-slate-800 bg-slate-900/40 text-slate-500 space-y-2">
              <AlertTriangle className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-sm">No security cases match current filters.</p>
              <button 
                onClick={() => { setRoleFilter('All'); setStatusFilter('All'); setSearchQuery(''); }}
                className="text-xs text-cyan-400 underline hover:text-cyan-300"
              >
                Reset all filters
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-h-[750px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
              {filteredCases.map((caseItem) => {
                const isSelected = caseItem.id === selectedCaseId;

                return (
                  <div
                    key={caseItem.id}
                    onClick={() => setSelectedCaseId(caseItem.id)}
                    className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer relative overflow-hidden backdrop-blur-md ${
                      isSelected
                        ? 'bg-slate-900/90 border-cyan-500/80 shadow-[0_0_20px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/40'
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/70'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 to-cyan-600" />
                    )}

                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded">
                          {caseItem.id}
                        </span>
                        <span className="text-[11px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/50 flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          {caseItem.assignedRole}
                        </span>
                      </div>
                      {renderStatusBadge(caseItem.status, 'sm')}
                    </div>

                    <h4 className="text-sm font-semibold text-slate-100 mb-2 line-clamp-1">
                      {caseItem.event}
                    </h4>

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {new Date(caseItem.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400">Confidence:</span>
                        <span className={`font-mono text-xs font-bold ${
                          caseItem.detectionScore > 90 ? 'text-emerald-400' : 'text-amber-400'
                        }`}>
                          {caseItem.detectionScore}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Case Detail & Evidence Brief Generator */}
        <div className="lg:col-span-7 space-y-5">
          {selectedCase ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 md:p-6 shadow-2xl backdrop-blur-xl space-y-6">
              
              {/* Header section with status selector */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950 px-2.5 py-0.5 rounded border border-cyan-800">
                      {selectedCase.id}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(selectedCase.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    {selectedCase.event}
                  </h2>
                </div>

                {/* Export Evidence Brief Button */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex rounded-lg border border-slate-700 bg-slate-950 p-0.5">
                    <button
                      onClick={() => setExportFormat('pdf')}
                      className={`px-2 py-1 text-xs font-mono rounded ${exportFormat === 'pdf' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'}`}
                    >
                      .PDF
                    </button>
                    <button
                      onClick={() => setExportFormat('txt')}
                      className={`px-2 py-1 text-xs font-mono rounded ${exportFormat === 'txt' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'}`}
                    >
                      .TXT
                    </button>
                    <button
                      onClick={() => setExportFormat('json')}
                      className={`px-2 py-1 text-xs font-mono rounded ${exportFormat === 'json' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'}`}
                    >
                      .JSON
                    </button>
                  </div>

                  <button
                    onClick={handleExportBrief}
                    className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all active:scale-95"
                  >
                    <FileDown className="w-4 h-4" />
                    Export Evidence Brief
                  </button>
                </div>
              </div>

              {/* Status Update Control Layer (Constraint 1: Strictly Annotation Layer) */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-cyan-400" />
                    Investigation Reviewer Status:
                  </label>
                  {renderStatusBadge(selectedCase.status, 'md')}
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  {(['Needs Review', 'Suspected', 'Verified'] as CaseStatus[]).map((st) => {
                    const isCurrent = selectedCase.status === st;
                    return (
                      <button
                        key={st}
                        onClick={() => handleUpdateStatus(st)}
                        className={`py-2 px-3 rounded-lg text-xs font-medium transition-all duration-150 flex items-center justify-center gap-1.5 border ${
                          isCurrent
                            ? st === 'Verified'
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                              : st === 'Suspected'
                              ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                              : 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        {st === 'Verified' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {st === 'Suspected' && <AlertTriangle className="w-3.5 h-3.5" />}
                        {st === 'Needs Review' && <HelpCircle className="w-3.5 h-3.5" />}
                        {st}
                      </button>
                    );
                  })}
                </div>
                
                <p className="text-[11px] text-slate-400 flex items-center gap-1 font-mono pt-1">
                  <Info className="w-3 h-3 text-cyan-400 shrink-0" />
                  Status changes are saved to persistent audit ledger. Underlying telemetry remains immutable.
                </p>
              </div>

              {/* Hardware & Detection Metadata Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Hardware Telemetry Card */}
                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-2">
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-cyan-400" /> Device & Hardware Hash
                  </span>
                  <div className="font-mono text-xs text-cyan-300 bg-slate-900 p-2 rounded border border-slate-800 break-all">
                    {selectedCase.deviceHash}
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <span>Scope Role: <strong className="text-slate-200">{selectedCase.assignedRole}</strong></span>
                    <span>Firmware: <strong className="text-slate-200">{selectedCase.firmwareVersion || 'v4.12.0'}</strong></span>
                  </div>
                </div>

                {/* AI Detection Confidence Card */}
                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Model Detection Score
                    </span>
                    <span className="font-mono text-sm font-bold text-cyan-300">
                      {selectedCase.detectionScore}%
                    </span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${selectedCase.detectionScore}%` }}
                    />
                  </div>

                  {selectedCase.vitalsAtEvent && (
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>HR: <strong className="text-white">{selectedCase.vitalsAtEvent.heartRateBpm} BPM</strong></span>
                      <span>SpO2: <strong className="text-white">{selectedCase.vitalsAtEvent.spO2Percent}%</strong></span>
                      <span>Impact: <strong className="text-white">{selectedCase.vitalsAtEvent.gForceMagnitude}G</strong></span>
                    </div>
                  )}
                </div>
              </div>

              {/* Natural Language Explanation Text */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  Model Incident Explanation & Kinematic Vector:
                </h4>
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 leading-relaxed font-sans">
                  {selectedCase.explanation}
                </div>
              </div>

              {/* Investigator Notes Section */}
              <div className="space-y-4 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                    Investigator Persistent Notes ({selectedCase.notes.length}):
                  </h4>
                  <span className="text-[11px] text-slate-500">Persisted across case switches</span>
                </div>

                {/* Add Note Form */}
                <form onSubmit={handleAddNote} className="space-y-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Author Name/Title</label>
                      <input
                        type="text"
                        value={newNoteAuthor}
                        onChange={e => setNewNoteAuthor(e.target.value)}
                        placeholder="e.g. Det. Miller"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Author Role</label>
                      <select
                        value={newNoteRole}
                        onChange={e => setNewNoteRole(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                      >
                        <option value="Investigator">Investigator</option>
                        <option value="Admin">Admin</option>
                        <option value="Dispatch Officer">Dispatch Officer</option>
                        <option value="Cardiologist">Cardiologist</option>
                        <option value="Family Guardian">Family Guardian</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Audit Note</label>
                    <textarea
                      value={newNoteText}
                      onChange={e => setNewNoteText(e.target.value)}
                      placeholder="Add investigation finding, dispatch result, or reviewer observations..."
                      rows={2}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
                      required
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/50 hover:bg-cyan-500/30 text-cyan-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Append Investigator Note
                    </button>
                  </div>
                </form>

                {/* Notes List */}
                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {selectedCase.notes.length === 0 ? (
                    <p className="text-xs text-slate-500 italic text-center py-3">No investigator notes attached to this case yet.</p>
                  ) : (
                    selectedCase.notes.map((note) => (
                      <div key={note.id} className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-cyan-300">{note.author}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                              {note.role}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-500">
                            {new Date(note.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 pt-1 leading-relaxed">
                          {note.text}
                        </p>
                      </div>
                    ))
                  )}
                </div>

              </div>

            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl border border-slate-800 bg-slate-900/50 text-slate-500">
              Select a case from the left panel to inspect details.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

export default SecurityCaseManager;
