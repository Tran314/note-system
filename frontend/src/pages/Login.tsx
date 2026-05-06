import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/auth.store';
import { Mail, Lock, AlertCircle } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('auth.invalidEmail'),
  password: z.string().min(6, 'auth.passwordTooShort'),
});

type LoginForm = z.infer<typeof loginSchema>;

function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError('');

    try {
      await login(data.email, data.password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || t('auth.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="card w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">📝 {t('common.appName')}</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">{t('auth.email')}</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input
                type="email"
                {...register('email')}
                placeholder={t('auth.emailPlaceholder')}
                className="input-field pl-10"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{t(errors.email.message as string)}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">{t('auth.password')}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input
                type="password"
                {...register('password')}
                placeholder={t('auth.passwordPlaceholder')}
                className="input-field pl-10"
              />
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{t(errors.password.message as string)}</p>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? t('common.loading') : t('auth.login')}
          </button>

          <p className="text-center text-sm text-gray-500 mt-4">
            {t('auth.noAccount')}
            <Link to="/register" className="text-blue-600 hover:underline ml-1">
              {t('auth.register')}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
