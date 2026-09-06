import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { FollowUpChannel, CreateFollowUpInput } from '../../types/database';

interface ScheduleFollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: string;
  leadName: string;
  onSubmit: (data: CreateFollowUpInput) => Promise<boolean>;
}

export const ScheduleFollowUpModal: React.FC<ScheduleFollowUpModalProps> = ({
  isOpen,
  onClose,
  leadId,
  leadName,
  onSubmit,
}) => {
  // Default tomorrow at 10:00 AM
  const tomorrow = new Date(Date.now() + 86400000);
  tomorrow.setHours(10, 0, 0, 0);
  const defaultDateTime = tomorrow.toISOString().slice(0, 16);

  const [channel, setChannel] = useState<FollowUpChannel>('phone');
  const [scheduledFor, setScheduledFor] = useState<string>(defaultDateTime);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduledFor) {
      setError('Date and time are required');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    const success = await onSubmit({
      lead_id: leadId,
      scheduled_for: new Date(scheduledFor).toISOString(),
      channel,
      notes: notes.trim() || null,
      status: 'scheduled',
    });
    setIsSubmitting(false);

    if (success) {
      setNotes('');
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule Follow-up"
      description={`Set next communication touchpoint for ${leadName}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Select
            label="Communication Channel *"
            value={channel}
            onChange={(e) => setChannel(e.target.value as FollowUpChannel)}
          >
            <option value="phone">📞 Phone Call</option>
            <option value="meeting">📅 Video / In-Person Meeting</option>
            <option value="email">✉️ Email Touchpoint</option>
            <option value="whatsapp">💬 WhatsApp Message</option>
            <option value="sms">📱 SMS Alert</option>
          </Select>
        </div>

        <div>
          <Input
            label="Scheduled Date & Time *"
            type="datetime-local"
            value={scheduledFor}
            onChange={(e) => setScheduledFor(e.target.value)}
            error={error ?? undefined}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Call Agenda or Notes
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Discuss deployment architecture, review quotation, confirm timeline..."
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
          />
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="secondary" isLoading={isSubmitting}>
            Schedule Touchpoint
          </Button>
        </div>
      </form>
    </Modal>
  );
};
