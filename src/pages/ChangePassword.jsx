import { useState } from 'react';
import Navbar from '../components/Navbar';
import Field from '../components/Field';
import { useAuth } from '../context/AuthContext';

export default function ChangePassword() {
  const { changePassword } = useAuth();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const result = await changePassword({
        current_password: form.currentPassword,
        new_password: form.newPassword
      });
      if (result.success) {
        setDone(true);
        setForm({ currentPassword: '', newPassword: '' });
      } else {
        setError(result.error || 'Could not update password.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-[420px] mx-auto px-5 py-10">
        <p className="doc-number mb-1">FORM 07 — PASSWORD CHANGE</p>
        <h1 className="font-display text-[26px] text-ink mb-6">Change password</h1>

        <form onSubmit={handleSubmit} className="ledger-card p-7">
          <Field label="Current password">
            <input
              type="password"
              className="field-input"
              required
              value={form.currentPassword}
              onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))}
            />
          </Field>
          <Field label="New password">
            <input
              type="password"
              className="field-input"
              required
              minLength={8}
              value={form.newPassword}
              onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))}
            />
          </Field>
          {error && <p className="text-[13px] text-rust mb-4">{error}</p>}
          <button type="submit" className="btn-primary" disabled={busy}>
            {busy ? 'Updating…' : 'Update password'}
          </button>
          {done && <p className="mt-3 text-[13px] text-moss">Password updated.</p>}
        </form>
      </div>
    </div>
  )
}
