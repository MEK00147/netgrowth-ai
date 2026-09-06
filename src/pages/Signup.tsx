import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Alert } from '../components/ui/Alert';
import { Cpu, Mail, Lock, User, Building2, ShieldCheck } from 'lucide-react';

interface SignupProps {
  onNavigateToLogin: () => void;
  onOpenSchemaModal: () => void;
}

export const Signup: React.FC<SignupProps> = ({ onNavigateToLogin, onOpenSchemaModal }) => {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) {
      setErrorMessage('Please complete all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const result = await signUp({
      email,
      password,
      fullName,
      companyName,
    });

    setIsLoading(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Failed to create account.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 mb-3">
            <Cpu className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
            <span>LeadFlow</span>
            <span className="text-xs font-bold text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
              AI
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            AI Lead Qualification & Sales Automation System
          </p>
        </div>

        {/* Card */}
        <Card className="p-6 sm:p-8 bg-white/95 backdrop-blur-md shadow-2xl border-slate-700/40">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Register Organization</h2>
            <p className="text-xs text-slate-500 mt-1">
              Create an enterprise account to access automated lead scoring and pipeline management.
            </p>
          </div>

          {errorMessage && (
            <Alert
              type="error"
              message={errorMessage}
              onClose={() => setErrorMessage(null)}
              className="mb-5"
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name *"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Alex Rivera"
              leftIcon={<User className="w-4 h-4" />}
            />

            <Input
              label="Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Apex Growth Dynamics"
              leftIcon={<Building2 className="w-4 h-4" />}
            />

            <Input
              label="Work Email *"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@acmecorp.com"
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <Input
              label="Password *"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <Input
              label="Confirm Password *"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat password"
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Already registered?</span>
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="font-semibold text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
            >
              Sign in to account
            </button>
          </div>
        </Card>

        <div className="mt-6 text-center text-[11px] text-slate-400 flex items-center justify-center gap-4">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>PostgreSQL Row Level Security</span>
          </span>
          <button
            onClick={onOpenSchemaModal}
            className="text-slate-400 hover:text-slate-200 underline cursor-pointer"
          >
            View SQL Schema
          </button>
        </div>
      </div>
    </div>
  );
};
