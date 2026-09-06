import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { CreateLeadInput, LeadStatus } from '../../types/database';

interface CreateLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (lead: CreateLeadInput) => Promise<boolean>;
}

export const CreateLeadModal: React.FC<CreateLeadModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<CreateLeadInput>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company_name: '',
    job_title: '',
    website: '',
    industry: '',
    inquiry: '',
    budget: undefined,
    budget_currency: 'NGN',
    timeline: 'Within 30 days',
    source: 'Manual Entry',
    status: 'new',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!formData.inquiry.trim()) newErrors.inquiry = 'Inquiry content is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const success = await onSubmit(formData);
    setIsSubmitting(false);

    if (success) {
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        company_name: '',
        job_title: '',
        website: '',
        industry: '',
        inquiry: '',
        budget: undefined,
        budget_currency: 'NGN',
        timeline: 'Within 30 days',
        source: 'Manual Entry',
        status: 'new',
      });
      setErrors({});
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Inbound Lead"
      description="Register a new prospect inquiry for sales processing and future AI qualification."
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Contact Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            label="First Name *"
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            placeholder="e.g. Tunde"
            error={errors.first_name}
          />
          <Input
            label="Last Name"
            value={formData.last_name ?? ''}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            placeholder="e.g. Balogun"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            label="Email Address *"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="tunde@company.com"
            error={errors.email}
          />
          <Input
            label="Phone Number"
            type="tel"
            value={formData.phone ?? ''}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+234 800 000 0000"
          />
        </div>

        {/* Company Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            label="Company Name"
            value={formData.company_name ?? ''}
            onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
            placeholder="e.g. Apex Global Corp"
          />
          <Input
            label="Job Title"
            value={formData.job_title ?? ''}
            onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
            placeholder="e.g. Head of Procurement"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            label="Website"
            value={formData.website ?? ''}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            placeholder="https://example.com"
          />
          <Input
            label="Industry"
            value={formData.industry ?? ''}
            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
            placeholder="e.g. Logistics, Fintech"
          />
        </div>

        {/* Inquiry */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Inquiry / Requirement Details *
          </label>
          <textarea
            rows={3}
            value={formData.inquiry}
            onChange={(e) => setFormData({ ...formData, inquiry: e.target.value })}
            placeholder="Provide customer message, pain points, or automation requirements..."
            className={`w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition
              ${errors.inquiry ? 'border-rose-400 focus:border-rose-500' : 'border-slate-300 focus:border-indigo-500'}
              focus:outline-none focus:ring-2 focus:ring-indigo-100`}
          />
          {errors.inquiry && <p className="mt-1 text-xs text-rose-600 font-medium">{errors.inquiry}</p>}
        </div>

        {/* Budget & Timeline */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="sm:col-span-2">
            <Input
              label="Estimated Budget"
              type="number"
              min={0}
              value={formData.budget ?? ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  budget: e.target.value ? parseFloat(e.target.value) : undefined,
                })
              }
              placeholder="e.g. 5000000"
            />
          </div>
          <div>
            <Select
              label="Currency"
              value={formData.budget_currency}
              onChange={(e) => setFormData({ ...formData, budget_currency: e.target.value })}
            >
              <option value="NGN">NGN (₦)</option>
              <option value="USD">USD ($)</option>
              <option value="GBP">GBP (£)</option>
              <option value="EUR">EUR (€)</option>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div>
            <Select
              label="Timeline"
              value={formData.timeline ?? ''}
              onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
            >
              <option value="Immediately">Immediately (&lt; 14 days)</option>
              <option value="Within 30 days">Within 30 days</option>
              <option value="1-3 months">1-3 months</option>
              <option value="More than 3 months">More than 3 months</option>
            </Select>
          </div>
          <div>
            <Select
              label="Lead Source"
              value={formData.source ?? ''}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
            >
              <option value="Website Contact Form">Website Form</option>
              <option value="LinkedIn Campaign">LinkedIn Campaign</option>
              <option value="Referral">Referral</option>
              <option value="Manual Entry">Manual Entry</option>
              <option value="Outbound Call">Outbound Call</option>
            </Select>
          </div>
          <div>
            <Select
              label="Initial Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as LeadStatus })}
            >
              <option value="new">New</option>
              <option value="qualified">Qualified</option>
              <option value="contacted">Contacted</option>
              <option value="meeting_scheduled">Meeting Scheduled</option>
            </Select>
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="secondary" isLoading={isSubmitting}>
            Create Lead
          </Button>
        </div>
      </form>
    </Modal>
  );
};
