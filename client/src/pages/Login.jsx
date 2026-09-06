import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sprout, ShoppingBag, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button, DemoTag } from '../components/ui';

const ROLE_HOME = { farmer: '/farmer/dashboard', buyer: '/buyer/dashboard', fpo: '/fpo/dashboard' };

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('farmer');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const doLogin = async (r) => {
    setLoading(true);
    setError('');
    try {
      await login(r);
      navigate(ROLE_HOME[r]);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-soil-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 justify-center mb-6">
          <Sprout className="text-field-600" size={26} />
          <span className="font-display text-2xl text-field-700">AgriLink</span>
        </Link>

        <div className="bg-white border border-soil-100 rounded-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h1 className="font-display text-xl">Sign in</h1>
            <DemoTag />
          </div>

          <form onSubmit={(e) => { e.preventDefault(); doLogin(role); }} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-soil-600 uppercase tracking-wide">Mobile number</label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="9XXXXXXXXX"
                className="mt-1 w-full border border-soil-100 rounded-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-field-400"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-soil-600 uppercase tracking-wide">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 w-full border border-soil-100 rounded-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-field-400"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-soil-600 uppercase tracking-wide">Role</label>
              <div className="mt-1 grid grid-cols-3 gap-2">
                {['farmer', 'buyer', 'fpo'].map(r => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setRole(r)}
                    className={`px-2 py-2 rounded-card text-xs font-medium border capitalize ${role === r ? 'bg-field-600 text-white border-field-600' : 'border-soil-100 text-soil-600'}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            {error && <p className="text-xs text-rust-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in…' : `Continue as ${role}`}
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-soil-100">
            <p className="text-xs text-soil-400 mb-3">Or jump straight into a demo account:</p>
            <div className="grid grid-cols-1 gap-2">
              <button onClick={() => doLogin('farmer')} className="flex items-center gap-2 px-3 py-2.5 rounded-card border border-soil-100 hover:bg-field-50 text-sm">
                <Sprout size={16} className="text-field-600" /> Login as Farmer
              </button>
              <button onClick={() => doLogin('buyer')} className="flex items-center gap-2 px-3 py-2.5 rounded-card border border-soil-100 hover:bg-sky-50 text-sm">
                <ShoppingBag size={16} className="text-sky-600" /> Login as Buyer
              </button>
              <button onClick={() => doLogin('fpo')} className="flex items-center gap-2 px-3 py-2.5 rounded-card border border-soil-100 hover:bg-harvest-50 text-sm">
                <Users size={16} className="text-harvest-600" /> Login as FPO
              </button>
            </div>
          </div>
        </div>
        <p className="text-center text-xs text-soil-400 mt-4">Authentication is mocked for this prototype demo.</p>
      </div>
    </div>
  );
}
