// src/components/Field.jsx
export default function Field({ label, children }) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      {children}
    </div>
  );
}