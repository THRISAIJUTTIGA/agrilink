import { Link } from 'react-router-dom';
import { Sprout, LineChart, ShieldCheck, Target, Truck, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const TICKER = [
  { crop: 'Chilli', market: 'Guntur', price: '₹205/kg', change: '+6.2%', up: true },
  { crop: 'Paddy', market: 'Vijayawada', price: '₹24/kg', change: '+2.4%', up: true },
  { crop: 'Cotton', market: 'Guntur', price: '₹7,250/qtl', change: '+4.1%', up: true },
  { crop: 'Tomato', market: 'Tenali', price: '₹32/kg', change: '-1.8%', up: false },
  { crop: 'Turmeric', market: 'Bapatla', price: '₹145/kg', change: '+3.0%', up: true },
];

const SECTIONS = [
  { icon: LineChart, title: 'Market Intelligence', copy: 'Live mandi, processor and buyer prices from every nearby market, compared side by side, so a farmer never sells blind.' },
  { icon: ShieldCheck, title: 'Verified Buyers', copy: 'Every buyer on AgriLink carries a verification badge, a payment-reliability score and a transaction history.' },
  { icon: Target, title: 'Smart Matching', copy: 'A transparent match score weighs price, quantity, quality fit, distance and buyer reliability for every lot.' },
  { icon: Truck, title: 'Logistics', copy: 'Book vetted transporters and nearby storage in a couple of taps once a deal is struck.' },
  { icon: Wallet, title: 'Transparent Payments', copy: 'Track a sale from accepted offer through pickup to payment received, one visible timeline at a time.' },
];

const STEPS = [
  { title: 'List your produce', copy: 'Farmers or FPOs create a lot with quantity, quality and expected price in a few minutes.' },
  { title: 'Get matched', copy: 'AgriLink scores every active buyer requirement against the lot and ranks the best fits.' },
  { title: 'Negotiate and accept', copy: 'Offers, counter-offers and acceptance happen in the app, with terms recorded.' },
  { title: 'Move and get paid', copy: 'Book transport, track the delivery, and follow the payment through to completion.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-soil-50 text-soil-800">
      <header className="border-b border-soil-100 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sprout className="text-field-600" size={24} />
            <span className="font-display text-xl">AgriLink</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-soil-600 hover:text-field-600">Login</Link>
            <Link to="/login" className="text-sm font-medium bg-field-600 text-white px-4 py-2 rounded-card hover:bg-field-700">
              Explore Platform
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-field-700 text-white">
        <div className="max-w-6xl mx-auto px-6 pt-16 pb-10">
          <p className="text-field-200 text-sm font-medium tracking-wide uppercase mb-4">Market intelligence · Verified buyers · Fair prices</p>
          <h1 className="font-display text-4xl md:text-6xl leading-[1.05] max-w-3xl">
            Sell smarter.<br />Connect better.<br />Earn more.
          </h1>
          <p className="mt-6 max-w-xl text-field-100 text-base leading-relaxed">
            AgriLink connects farmers and verified buyers with transparent market intelligence, better price discovery and reliable transactions.
          </p>
          <div className="mt-8 flex gap-3">
            <Link to="/login" className="bg-harvest-500 text-field-900 font-medium px-5 py-3 rounded-card hover:bg-harvest-400">
              Explore Platform
            </Link>
            <Link to="/login" className="border border-white/30 text-white font-medium px-5 py-3 rounded-card hover:bg-white/10">
              Login
            </Link>
          </div>
        </div>

        {/* Ticker */}
        <div className="border-t border-white/10 overflow-hidden bg-field-900/40 py-3">
          <div className="flex ticker-track w-max">
            {[...TICKER, ...TICKER].map((t, i) => (
              <div key={i} className="flex items-center gap-2 px-6 border-r border-white/10 whitespace-nowrap">
                <span className="font-medium text-sm">{t.crop}</span>
                <span className="text-field-200 text-xs">{t.market}</span>
                <span className="font-mono text-sm">{t.price}</span>
                <span className={`flex items-center text-xs font-medium ${t.up ? 'text-harvest-400' : 'text-red-300'}`}>
                  {t.up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}{t.change}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="font-display text-2xl mb-8">How it works</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {STEPS.map((s, i) => (
            <div key={i} className="border-l-2 border-field-400 pl-4">
              <p className="text-xs text-field-600 font-mono mb-1">Step {i + 1}</p>
              <p className="font-display text-lg mb-1">{s.title}</p>
              <p className="text-sm text-soil-400 leading-relaxed">{s.copy}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature sections */}
      <section className="bg-white border-y border-soil-100">
        <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-8">
          {SECTIONS.map(({ icon: Icon, title, copy }) => (
            <div key={title}>
              <div className="w-10 h-10 rounded-card bg-field-50 flex items-center justify-center mb-3">
                <Icon size={19} className="text-field-600" />
              </div>
              <p className="font-display text-lg mb-1">{title}</p>
              <p className="text-sm text-soil-400 leading-relaxed">{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="max-w-6xl mx-auto px-6 py-10 flex items-center justify-between text-sm text-soil-400">
        <span>AgriLink — a prototype market-intelligence platform. Demo data only.</span>
        <Link to="/login" className="text-field-600 font-medium">Get started →</Link>
      </footer>
    </div>
  );
}
