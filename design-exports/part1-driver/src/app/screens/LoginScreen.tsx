import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router';

export const LoginScreen = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      if (phone && password) {
        navigate('/driver/livraisons');
      } else {
        setError(true);
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAF9', maxWidth: '375px', margin: '0 auto' }}>
      <div className="flex flex-col items-center px-6 pt-16">
        {/* Logo */}
        <div className="text-center">
          <div className="text-4xl font-bold mb-2" style={{ color: '#2563EB' }}>
            Plaza
          </div>
          <h1 className="text-xl font-semibold mt-2" style={{ color: '#1C1917' }}>
            Espace Livreur
          </h1>
          <p className="text-sm mt-2" style={{ color: '#78716C' }}>
            Connectez-vous pour voir vos livraisons
          </p>
        </div>

        {/* Form Card */}
        <form onSubmit={handleLogin} className="w-full mt-10">
          <div className="bg-white rounded-xl shadow-md p-6">
            {/* Phone Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: '#1C1917' }}>
                Numéro de téléphone
              </label>
              <div className="relative">
                <span
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
                  style={{ color: '#78716C' }}
                >
                  +212
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="06 XX XX XX XX"
                  className="w-full h-12 pl-14 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  inputMode="numeric"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="mb-2">
              <label className="block text-sm font-medium mb-2" style={{ color: '#1C1917' }}>
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 px-4 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: '#78716C' }}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right mb-6">
              <button
                type="button"
                className="text-sm"
                style={{ color: '#2563EB' }}
              >
                Mot de passe oublié ?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-lg text-white font-medium flex items-center justify-center"
              style={{ backgroundColor: '#2563EB' }}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Se connecter'
              )}
            </button>

            {/* Error Message */}
            {error && (
              <div
                className="mt-4 p-3 rounded-lg text-sm"
                style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}
              >
                Identifiants incorrects. Veuillez réessayer.
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
