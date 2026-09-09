import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Alert } from '../ui/Alert';
import { activityService } from '../../services/activityService';
import { Activity, ActivityType } from '../../types/database';
import { MessageSquarePlus } from 'lucide-react';

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: string;
  leadName: string;
  onActivityAdded: (activity: Activity) => void;
}

export const AddActivityModal: React.FC<AddActivityModalProps> = ({
  isOpen,
  onClose,
  leadId,
  leadName,
  onActivityAdded,
}) => {
  const [activityType, setActivityType] = useState<ActivityType>('lead_updated');
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) {
      setError('Please provide a note or description for this activity.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const { data, error: err } = await activityService.createActivity(
        leadId,
        activityType,
        note.trim()
      );
      if (err) throw new Error(err);
      if (data) {
        onActivityAdded(data);
        setNote('');
        onClose();
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save activity');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Note or Activity"
      description={`Record an internal note, call summary, or touchpoint for ${leadName}.`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Activity Category <span className="text-rose-500">*</span>
          </label>
          <Select
            value={activityType}
            onChange={(e) => setActivityType(e.target.value as ActivityType)}
            className="text-xs font-medium"
          >
            <option value="lead_updated">Sales Note / Discussion Log</option>
            <option value="status_changed">Pipeline Qualification Update</option>
            <option value="email_sent">Email Communication Sent</option>
            <option value="sales_alert">Critical Prospect Alert</option>
          </Select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Note / Activity Details <span className="text-rose-500">*</span>
          </label>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Document key discussion points, prospect sentiment, decision makers, or next milestones..."
            rows={4}
            required
            className="text-xs"
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            variant="primary"
            isLoading={isSubmitting}
            leftIcon={<MessageSquarePlus className="w-3.5 h-3.5" />}
          >
            Record Activity
          </Button>
        </div>
      </form>
    </Modal>
  );
};
