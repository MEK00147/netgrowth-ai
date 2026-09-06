import React from 'react';
import { LeadClassification, LeadStatus } from '../../types/database';
import { getClassificationMeta, getStatusMeta } from '../../utils/formatters';
import { Flame, Zap, Snowflake, Clock } from 'lucide-react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-[11px] font-medium px-2 py-0.5 rounded-full',
    md: 'text-xs font-semibold px-2.5 py-1 rounded-full',
  };

  const variants = {
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
    info: 'bg-sky-50 text-sky-700 border border-sky-200',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap ${sizeStyles[size]} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export const ClassificationBadge: React.FC<{ classification: LeadClassification | null | undefined; score?: number | null }> = ({
  classification,
  score,
}) => {
  const meta = getClassificationMeta(classification);

  const renderIcon = () => {
    switch (classification) {
      case 'hot':
        return <Flame className="w-3 h-3 text-rose-600 animate-pulse" />;
      case 'warm':
        return <Zap className="w-3 h-3 text-amber-600" />;
      case 'cold':
        return <Snowflake className="w-3 h-3 text-slate-500" />;
      default:
        return <Clock className="w-3 h-3 text-zinc-400" />;
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${meta.badgeBg} ${meta.badgeText} ${meta.badgeBorder} whitespace-nowrap`}
    >
      {renderIcon()}
      <span>{meta.label}</span>
      {typeof score === 'number' && (
        <span className="opacity-70 font-mono text-[11px] font-medium">({score})</span>
      )}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: LeadStatus | string }> = ({ status }) => {
  const meta = getStatusMeta(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${meta.bg} ${meta.text} ${meta.border} whitespace-nowrap`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      <span>{meta.label}</span>
    </span>
  );
};
