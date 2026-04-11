import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { Mail, Lock, AlertCircle } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(6, '密码至少 6 位'),
});

type LoginForm = z.infer<typeof loginSchema>;

function Login() {
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
      setError(err.response?.data?.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="card page-enter w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#10a37f] text-xl font-bold text-white">
            N
          </div>
          <h1 className="text-2xl font-semibold">Nebula Note</h1>
          <p className="mt-2 text-sm text-[#888888]">登录你的笔记工作台</p>
        </div>

        {/* 登录表单 */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* 邮箱输入 */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#b4b4b4]">邮箱</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]" size={18} />
              <input
                type="email"
                {...register('email')}
                placeholder="user@example.com"
                className="input-field pl-10"
              />
            </div>
            {errors.email && <p className="mt-1 text-sm text-[#ef4444]">{errors.email.message}</p>}
          </div>

          {/* 密码输入 */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#b4b4b4]">密码</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]" size={18} />
              <input
                type="password"
                {...register('password')}
                placeholder="输入密码"
                className="input-field pl-10"
              />
            </div>
            {errors.password && <p className="mt-1 text-sm text-[#ef4444]">{errors.password.message}</p>}
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-[#ef4444]/30 bg-[#ef4444]/10 p-3 text-[#ef4444]">
              <AlertCircle size={18} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* 登录按钮 */}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? '登录中...' : '登录'}
          </button>

          {/* 注册链接 */}
          <p className="text-center text-sm text-[#888888]">
            还没有账号？
            <Link to="/register" className="ml-1 text-[#10a37f] hover:underline">
              注册
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;