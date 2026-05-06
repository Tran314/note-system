import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/auth.store';
import { Mail, Lock, User, AlertCircle } from 'lucide-react';

const registerSchema = z.object({
  email: z.string().email('auth.invalidEmail'),
  password: z.string().min(6, 'auth.passwordTooShort'),
  confirmPassword: z.string().min(6, 'auth.passwordTooShort'),
  nickname: z.string().min(1, '昵称不能为空').max(50, '昵称最多50位'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'auth.passwordMismatch',
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register: registerUser } = useAuthStore();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    setError('');

    try {
      await registerUser(data.email, data.password, data.nickname);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || t('auth.registerFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="card w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">📝 {t('auth.register')}</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">{t('auth.nickname')}</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input
                type="text"
                {...register('nickname')}
                placeholder={t('auth.nickname')}
                className="input-field pl-10"
              />
            </div>
            {errors.nickname && (
              <p className="text-red-500 text-sm mt-1">{errors.nickname.message}</p>
            )}
          </div>

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

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">{t('auth.confirmPassword')}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input
                type="password"
                {...register('confirmPassword')}
                placeholder={t('auth.confirmPassword')}
                className="input-field pl-10"
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{t(errors.confirmPassword.message as string)}</p>
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
            {loading ? t('common.loading') : t('auth.register')}
          </button>

          <p className="text-center text-sm text-gray-500 mt-4">
            {t('auth.hasAccount')}
            <Link to="/login" className="text-blue-600 hover:underline ml-1">
              {t('auth.login')}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;
