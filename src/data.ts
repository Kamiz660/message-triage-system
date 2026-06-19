import { ComplaintMessage } from './types';

export const COMPLAINT_CATEGORIES = [
  'Unassigned',
  'Water Supply',
  'Sanitation & Waste',
  'Roads & Potholes',
  'Electricity & Lighting',
  'Drainage & Sewerage',
  'Public Safety',
  'Stray Animals',
  'Miscellaneous'
];

export const ASSIGNED_OFFICERS = [
  'Unassigned',
  'Officer Rajesh Kumar (Water Eng.)',
  'Officer Priya Patil (Sanitation Lead)',
  'Officer Ahmed Khan (Roads Insp.)',
  'Officer Anita Desai (Electrical Chief)',
  'Officer Vikram Singh (Public Health)',
  'Officer Meera Nair (Animal Control)'
];

export const INITIAL_COMPLAINTS: ComplaintMessage[] = [
  {
    id: 'msg-1',
    sender: '+91 98450 12044',
    text: 'Water pipe burst on Sector 4 Main Road, near Apollo Pharmacy. Huge fountain of water is flooding nearby shops since 4:00 AM. Clean drinking water is pooling on the road!',
    timestamp: '2026-06-15T04:15:00-07:00', // 12 mins ago
    status: 'unresolved',
    category: 'Water Supply',
    assignedOfficer: 'Officer Rajesh Kumar (Water Eng.)',
    notes: 'Informed field engineers to shut off the main valve at Sector 4 junction.',
    history: [
      { id: 'h1', timestamp: '2026-06-15T04:20:00-07:00', action: 'Complaint received via WhatsApp', user: 'System Register' },
      { id: 'h2', timestamp: '2026-06-15T04:22:00-07:00', action: 'Officer Rajesh Kumar assigned and category tagged as Water Supply', user: 'Staff Meena' }
    ]
  },
  {
    id: 'msg-2',
    sender: '+91 91230 44588',
    text: 'Severe garbage overflow in Sector 2 park entrance. Bad odor has made it impossible to walk or jog. Street dogs are scattered everywhere tearing the plastic bags. Please clear!',
    timestamp: '2026-06-15T03:30:00-07:00', // 1 hr ago
    status: 'unresolved',
    category: 'Sanitation & Waste',
    assignedOfficer: 'Unassigned',
    history: [
      { id: 'h3', timestamp: '2026-06-15T03:31:00-07:00', action: 'Complaint received via WhatsApp', user: 'System Register' }
    ]
  },
  {
    id: 'msg-3',
    sender: '+91 78901 23412',
    text: 'Drainage line is completely blocked near House No 24, Block D. The black dirty sewage water is spilling directly onto our driveways, releasing noxious gas right into our living rooms. URGENT.',
    timestamp: '2026-06-15T01:05:00-07:00', // 3.3 hrs ago
    status: 'unresolved',
    category: 'Drainage & Sewerage',
    assignedOfficer: 'Unassigned',
    history: [
      { id: 'h4', timestamp: '2026-06-15T01:06:00-07:00', action: 'Complaint received via WhatsApp', user: 'System Register' }
    ]
  },
  {
    id: 'msg-4',
    sender: '+91 88849 92100',
    text: 'Open dangling high-tension electric wire at the corner of 5th cross street lane. It is hanging down to about 4 feet off the pavement, near where small children play. Extreme safety hazard!',
    timestamp: '2026-06-15T00:20:00-07:00', // 4 hrs ago
    status: 'unresolved',
    category: 'Electricity & Lighting',
    assignedOfficer: 'Officer Anita Desai (Electrical Chief)',
    notes: 'Power sub-station alerted to briefly isolate this local grid segment until patch teams arrive.',
    history: [
      { id: 'h5', timestamp: '2026-06-15T00:21:00-07:00', action: 'Complaint received via WhatsApp', user: 'System Register' },
      { id: 'h6', timestamp: '2026-06-15T00:25:00-07:00', action: 'Tagged Electricity & Safety; assigned to Anita Desai', user: 'Admin Suresh' }
    ]
  },
  {
    id: 'msg-5',
    sender: '+91 90554 81109',
    text: 'Deep pothole has cratered the center of the main flyover down-ramp. Yesterday night three bikers tripped and fell, suffering minor fractures. High risk for fatal accident in darkness!',
    timestamp: '2026-06-14T21:40:00-07:00', // Yesterday
    status: 'unresolved',
    category: 'Roads & Potholes',
    assignedOfficer: 'Officer Ahmed Khan (Roads Insp.)',
    notes: 'Instructed inspection team to cover with heavy duty barricade and fast cold-mix.',
    history: [
      { id: 'h7', timestamp: '2026-06-14T21:41:00-07:00', action: 'Complaint received via WhatsApp', user: 'System Register' },
      { id: 'h8', timestamp: '2026-06-14T21:50:00-07:00', action: 'Assigned Officer Ahmed Khan', user: 'Staff Meena' }
    ]
  },
  {
    id: 'msg-6',
    sender: '+91 94481 05500',
    text: 'Piped gas line pressure is super low since 3 days, now there is no gas stream at all. We cannot cook meals for the kids. Please update us.',
    timestamp: '2026-06-14T15:10:00-07:00', // Yesterday
    status: 'resolved',
    category: 'Miscellaneous',
    assignedOfficer: 'Unassigned',
    notes: 'GCP pipeline team detected block at master valve, pressure restored on 14/06. Confirmed with residents.',
    history: [
      { id: 'h9', timestamp: '2026-06-14T15:11:00-07:00', action: 'Complaint received via WhatsApp', user: 'System Register' },
      { id: 'h10', timestamp: '2026-06-14T18:00:00-07:00', action: 'Marked resolved: GCP Gas Pressure restored locally', user: 'Officer Kumar' }
    ]
  },
  {
    id: 'msg-7',
    sender: '+91 80951 33345',
    text: 'Street lighting has stopped operational state on Main Ring Road from metro pillar 45 to 60. Over 1.5km is in complete pitch blackness. Girls feel unsafe to walk back from work.',
    timestamp: '2026-06-14T10:00:00-07:00', // Yesterday
    status: 'unresolved',
    category: 'Electricity & Lighting',
    assignedOfficer: 'Unassigned',
    history: [
      { id: 'h11', timestamp: '2026-06-14T10:01:00-07:00', action: 'Complaint received via WhatsApp', user: 'System Register' }
    ]
  },
  {
    id: 'msg-8',
    sender: '+91 94220 18833',
    text: 'Stray dog pack has become aggressive near model school gate. Yesterday afternoon they chased a third-grade student. Parents are scared of children going on foot.',
    timestamp: '2026-06-13T17:45:00-07:00', // Older
    status: 'unresolved',
    category: 'Stray Animals',
    assignedOfficer: 'Officer Meera Nair (Animal Control)',
    notes: 'Meera was notified to send the catch van to school perimeter at 8:30 AM drop-off hours.',
    history: [
      { id: 'h12', timestamp: '2026-06-13T17:46:00-07:00', action: 'Complaint received via WhatsApp', user: 'System Register' },
      { id: 'h13', timestamp: '2026-06-13T18:22:00-07:00', action: 'Assigned to Officer Meera Nair', user: 'Staff Suresh' }
    ]
  },
  {
    id: 'msg-9',
    sender: '+91 72101 44550',
    text: 'Pothole near post office is completely filled with dirty soil but no asphalt coating. This creates huge dust clouds whenever heavy trucks drive past, causing breathing irritation.',
    timestamp: '2026-06-12T11:22:00-07:00', // Older
    status: 'resolved',
    category: 'Roads & Potholes',
    assignedOfficer: 'Officer Ahmed Khan (Roads Insp.)',
    notes: 'Asphalt cold patch mix rolled and cured successfully. Photo proof verified.',
    history: [
      { id: 'h14', timestamp: '2026-06-12T11:23:00-07:00', action: 'Complaint received via WhatsApp', user: 'System Register' },
      { id: 'h15', timestamp: '2026-06-13T15:10:00-07:00', action: 'Marked resolved: Cold mix asphalt rolled', user: 'Officer Ahmed Khan' }
    ]
  },
  {
    id: 'msg-10',
    sender: '+91 99000 11223',
    text: 'Construction vehicle dumping mud in the local lake buffer zone near Lakeview Layout. Action needed to protect the ecosystem and prevent silt blockage.',
    timestamp: '2026-06-11T16:05:00-07:00', // Older
    status: 'unresolved',
    category: 'Sanitation & Waste',
    assignedOfficer: 'Officer Priya Patil (Sanitation Lead)',
    notes: 'Nuisance notice sent to developer. Patrol dispatch scheduled.',
    history: [
      { id: 'h16', timestamp: '2026-06-11T16:06:00-07:00', action: 'Complaint received via WhatsApp', user: 'System Register' },
      { id: 'h17', timestamp: '2026-06-12T09:15:00-07:00', action: 'Assigned Priya Patil & Sanitation Category', user: 'Staff Meena' }
    ]
  }
];

export function getRelativeTimeString(isoString: string, currentLocalTime: string = '2026-06-15T04:27:30-07:00'): string {
  const target = new Date(isoString);
  const now = new Date(currentLocalTime);
  const diffMs = now.getTime() - target.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  
  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin} min${diffMin > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

export function formatDateLabel(isoString: string, currentLocalTime: string = '2026-06-15T04:27:30-07:00'): 'Today' | 'Yesterday' | 'Older' {
  const target = new Date(isoString);
  const now = new Date(currentLocalTime);
  
  // Reset hours to compare dates comfortably
  const targetDate = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const diffTime = nowDate.getTime() - targetDate.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  
  if (diffDays < 1 && targetDate.getDate() === nowDate.getDate()) {
    return 'Today';
  } else if (diffDays <= 1 || (diffDays < 2 && targetDate.getDate() === nowDate.getDate() - 1)) {
    return 'Yesterday';
  } else {
    return 'Older';
  }
}
