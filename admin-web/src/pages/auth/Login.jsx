// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useTranslation } from 'react-i18next';
// import { useAuth } from '../../context/AuthContext';
// import LanguageSwitcher from '../../components/common/LanguageSwitcher';

// const Login = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const { login } = useAuth();
//   const { t } = useTranslation();
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     try {
//       await login(email, password);
//       navigate('/dashboard');
//     } catch (err) {
//       setError(err.response?.data?.message || 'Login failed');
//     }
//   };

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-gray-100">
//       <div className="absolute right-6 top-6">
//         <button
//           onClick={() => {}}
//           className="rounded border border-gray-300 bg-white px-3 py-1 text-xs"
//           style={{ pointerEvents: 'none', opacity: 0 }}
//         >
//           {/* placeholder to keep layout consistent — actual switcher below */}
//         </button>
//       </div>

//       <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-lg bg-white p-8 shadow-md">
//         <div className="mb-4 flex justify-end">
//           <div className="text-gray-700">
//             <LanguageSwitcher />
//           </div>
//         </div>

//         <h1 className="mb-6 text-2xl font-bold text-gray-800">{t('auth.loginTitle')}</h1>

//         {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

//         <div className="mb-4">
//           <label className="mb-1 block text-sm font-medium text-gray-700">{t('common.email')}</label>
//           <input
//             type="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             required
//           />
//         </div>

//         <div className="mb-6">
//           <label className="mb-1 block text-sm font-medium text-gray-700">{t('common.password')}</label>
//           <input
//             type="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             required
//           />
//         </div>

//         <button
//           type="submit"
//           className="w-full rounded bg-blue-600 py-2 font-medium text-white hover:bg-blue-700"
//         >
//           {t('auth.loginButton')}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default Login;





import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';
import { AnimatedCharacter } from '../../components/common/AnimatedCharacter';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [characterState, setCharacterState] = useState('entry');
  const { login } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleEntryFinish = () => {
    setCharacterState('idle');
  };

  // Error state ke baad, user jaise hi field me dubara type kare — character
  // ko idle pe wapas le aao.
  const handleFieldChange = (setter) => (e) => {
    setter(e.target.value);
    if (characterState === 'error') setCharacterState('idle');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setCharacterState('thinking');
    try {
      await login(email, password);
      // Success animation ek pal ke liye dikhne do, phir navigate karo.
      setCharacterState('success');
      setTimeout(() => navigate('/dashboard'), 600);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      setCharacterState('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Left brand panel — sirf desktop-width pe dikhta hai */}
      <div
        className="hidden md:flex md:w-1/2 flex-col items-center justify-center p-10"
        style={{ background: 'linear-gradient(135deg, #4338CA 0%, #6366F1 100%)' }}
      >
        <AnimatedCharacter state={characterState} size={200} onFinish={handleEntryFinish} />
        <h2 className="mt-4 text-3xl font-extrabold text-white text-center">Kaksha</h2>
        <p className="mt-2 text-sm font-medium text-white/80 text-center">
          Coaching Institute Management
        </p>
      </div>

      <div className="relative flex flex-1 items-center justify-center p-6">
        <div className="absolute right-6 top-6 md:right-10 md:top-10">
          <LanguageSwitcher />
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-lg bg-white p-8 shadow-md">
          {/* Chhoti screen pe left panel hidden hai, isliye character yahan
              chhote size me dikhao taaki entry animation kahin na kahin dikhe. */}
          <div className="mb-4 flex justify-center md:hidden">
            <AnimatedCharacter state={characterState} size={110} onFinish={handleEntryFinish} />
          </div>

          <h1 className="mb-6 text-2xl font-bold text-gray-800">{t('auth.loginTitle')}</h1>

          {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">{t('common.email')}</label>
            <input
              type="email"
              value={email}
              onChange={handleFieldChange(setEmail)}
              className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-6">
            <label className="mb-1 block text-sm font-medium text-gray-700">{t('common.password')}</label>
            <input
              type="password"
              value={password}
              onChange={handleFieldChange(setPassword)}
              className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-blue-600 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? '...' : t('auth.loginButton')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;