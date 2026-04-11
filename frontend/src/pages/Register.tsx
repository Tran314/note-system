import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { Mail, Lock, User, AlertCircle } from 'lucide-react';

const registerSchema = z
  .object({
    email: z.string().email('邮箱格式不正确'),
    password: z.string().min(6, '密码至少 6 位'),
    confirmPassword: z.string().min(6, '密码至少 6 位'),
    nickname: z.string().min(1, '昵称不能为空').max(50, '昵称最多 50 个字符'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '两次密码不一致',
    path: ['confirmPassword'],
  });

type RegisterForm = z.infer<typeof registerSchema>;

function Register() {
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
      window.location.href = '/';
    } catch (err: any) {
      setError(err.response?.data?.message || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nebula-shell flex min-h-screen items-center justify-center px-4 py-12">
      <div className="card w-full max-w-md p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-900 text-lg font-semibold text-white shadow-[0_14px_40px_rgba(63,44,24,0.24)]">
            N
          </div>
          <h2 className="text-3xl font-semibold tracking-tight text-stone-900">创建账号</h2>
          <p className="mt-2 text-sm text-stone-500">开始搭建属于你的笔记空间</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">昵称</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
              <input
                type="text"
                {...register('nickname')}
                placeholder="你的昵称"
                className="input-field pl-10"
              />
            </div>
            {errors.nickname && (
              <p className="mt-1 text-sm text-red-500">{errors.nickname.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">邮箱</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
              <input
                type="email"
                {...register('email')}
                placeholder="user@example.com"
                className="input-field pl-10"
              />
            </div>
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">密码</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
              <input
                type="password"
                {...register('password')}
                placeholder="请输入密码"
                className="input-field pl-10"
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">确认密码</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
              <input
                type="password"
                {...register('confirmPassword')}
                placeholder="再次输入密码"
                className="input-field pl-10"
              />
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50/90 p-3 text-red-600">
              <AlertCircle size={18} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
            {loading ? '注册中...' : '注册'}
          </button>

          <p className="text-center text-sm text-stone-500">
            已有账号？
            <Link to="/login" className="ml-1 text-stone-900 underline decoration-stone-300 underline-offset-4">
              登录
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;
