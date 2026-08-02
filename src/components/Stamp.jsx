// src/components/Stamp.jsx
export default function Stamp({ label, active = false }) {
  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
      active 
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
        : 'bg-red-50 text-red-700 border-red-200'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        active ? 'bg-emerald-500' : 'bg-red-500'
      }`}></span>
      {label}
    </div>
  );
}