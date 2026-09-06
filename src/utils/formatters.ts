import { LeadClassification, LeadStatus, FollowUpChannel } from '../types/database';

export function formatCurrency(amount: number | null | undefined, currency: string = 'NGN'): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'Not specified';
  }
  try {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency || 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function formatRelativeTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    const then = new Date(dateStr).getTime();
    const now = Date.now();
    const diffSec = Math.floor((now - then) / 1000);

    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
    return formatDate(dateStr);
  } catch {
    return dateStr;
  }
}

export interface ClassificationMeta {
  label: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  indicator: string;
  scoreRange: string;
  iconName: string;
}

export function getClassificationMeta(classification: LeadClassification | null | undefined): ClassificationMeta {
  switch (classification) {
    case 'hot':
      return {
        label: 'HOT',
        badgeBg: 'bg-rose-50',
        badgeText: 'text-rose-700',
        badgeBorder: 'border-rose-200',
        indicator: 'bg-rose-500',
        scoreRange: '80–100',
        iconName: 'Flame',
      };
    case 'warm':
      return {
        label: 'WARM',
        badgeBg: 'bg-amber-50',
        badgeText: 'text-amber-700',
        badgeBorder: 'border-amber-200',
        indicator: 'bg-amber-500',
        scoreRange: '50–79',
        iconName: 'Zap',
      };
    case 'cold':
      return {
        label: 'COLD',
        badgeBg: 'bg-slate-100',
        badgeText: 'text-slate-600',
        badgeBorder: 'border-slate-200',
        indicator: 'bg-slate-400',
        scoreRange: '0–49',
        iconName: 'Snowflake',
      };
    default:
      return {
        label: 'PENDING',
        badgeBg: 'bg-zinc-50',
        badgeText: 'text-zinc-500',
        badgeBorder: 'border-zinc-200',
        indicator: 'bg-zinc-300',
        scoreRange: 'Unscored',
        iconName: 'Clock',
      };
  }
}

export interface StatusMeta {
  label: string;
  bg: string;
  text: string;
  border: string;
}

export function getStatusMeta(status: LeadStatus | string): StatusMeta {
  switch (status) {
    case 'new':
      return { label: 'New', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
    case 'qualified':
      return { label: 'Qualified', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    case 'contacted':
      return { label: 'Contacted', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' };
    case 'meeting_scheduled':
      return { label: 'Meeting Scheduled', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' };
    case 'proposal_sent':
      return { label: 'Proposal Sent', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' };
    case 'won':
      return { label: 'Closed Won', bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' };
    case 'lost':
      return { label: 'Closed Lost', bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' };
    default:
      return { label: status, bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
  }
}

export function getChannelIcon(channel: FollowUpChannel | string): string {
  switch (channel) {
    case 'email':
      return 'Mail';
    case 'phone':
      return 'Phone';
    case 'whatsapp':
      return 'MessageSquare';
    case 'sms':
      return 'Smartphone';
    case 'meeting':
      return 'Calendar';
    default:
      return 'Bell';
  }
}
