import { Link } from 'react-router-dom';

export default function PlaceholderPage({ title, description }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 text-white flex items-center justify-center px-4 py-16">
      <div className="max-w-3xl w-full rounded-[32px] border border-white/10 bg-slate-900/90 p-10 shadow-[0_40px_120px_rgba(15,23,42,0.45)]">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-primary-300">Placeholder Page</p>
          <h1 className="mt-4 text-4xl font-bold text-white">{title}</h1>
          <p className="mt-4 text-base text-slate-300">{description || 'This page has been reserved for future content. In the meantime, use the site navigation to continue exploring the app.'}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Link to="/" className="block rounded-2xl bg-slate-800 px-5 py-4 text-center text-sm font-semibold text-white transition hover:bg-slate-700">
            Back to Home
          </Link>
          <Link to="/marketplace" className="block rounded-2xl bg-gradient-to-r from-primary-500 to-secondary-500 px-5 py-4 text-center text-sm font-semibold text-slate-950 transition hover:opacity-90">
            Browse Marketplace
          </Link>
        </div>
      </div>
    </div>
  );
}
