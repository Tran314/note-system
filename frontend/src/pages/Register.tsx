import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { Mail, Lock, User, AlertCircle } from 'lucide-react';

const registerSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(6, '密码至少6位'),
  confirmPassword: z.string().min(6, '密码至少6位'),
  nickname: z.string().min(1, '昵称不能为空').max(50, '昵称最多50位'),
}).refine((data) => data.password === data.confirmPassword, {
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="card w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">📝 注册账号</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          // 昵称输入
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">昵称</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input
                type="text"
                {...register('nickname')}
                placeholder="您的昵称"
                className="input-field pl-10"
              />
            </div>
            {errors.nickname && (
              <p className="text-red-500 text-sm mt-1">{errors.nickname.message}</p>
            )}
          </div>

          // 邮箱输入
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">邮箱</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input
                type="email"
                {...register('email')}
                placeholder="user@example.com"
                className="input-field pl-10"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          // 密码输入
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">密码</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input
                type="password"
                {...register('password')}
                placeholder="请输入密码"
                className="input-field pl-10"
              />
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          // 确认密码
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">确认密码</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input
                type="password"
                {...register('confirmPassword')}
                placeholder="再次输入密码"
                className="input-field pl-10"
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          // 错误提示
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          // 注册按钮
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? '注册中...' : '注册'}
          </button>

          // 登录链接
          <p className="text-center text-sm text-gray-500 mt-4">
            已有账号？
            <Link to="/login" className="text-blue-600 hover:underline ml-1">
              登录
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;