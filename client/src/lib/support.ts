import { apiJson } from './api';

export interface SupportSession {
  session_id: number;
  channel: 'hotline' | 'ai';
  patient_id?: number | null;
  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  status: string;
  last_topic?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupportMessage {
  message_id: number;
  session_id: number;
  author: 'patient' | 'agent' | 'assistant';
  content: string;
  created_at: string;
}

interface SessionResponse {
  session: SupportSession;
  messages: SupportMessage[];
}

export async function createSupportSession(payload: {
  channel: 'hotline' | 'ai';
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  topic?: string;
  initial_message?: string;
}): Promise<SessionResponse> {
  return apiJson('/support/sessions', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function sendSupportMessage(sessionId: number, content: string): Promise<SessionResponse> {
  return apiJson(`/support/sessions/${sessionId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}
