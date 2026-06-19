export interface HistoryLog {
  id: string;
  timestamp: string;
  action: string;
  user: string;
}

export type MessageStatus = 'resolved' | 'unresolved';

export interface ComplaintMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string; // ISO String
  status: MessageStatus;
  category: string; // "Water Supply", "Sanitation", etc.
  assignedOfficer: string;
  notes?: string;
  history: HistoryLog[];
}

export interface Stats {
  total: number;
  unresolved: number;
  resolved: number;
  todayCount: number;
}
