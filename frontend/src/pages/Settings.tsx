import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../store/auth.store';
import { User, Lock, Palette, Save } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';

// 表单 Schema
const profileSchema = z.object({
  nickname: z.string().min(1, '昵称不能为空').max(50, '昵称最多50位'),
  avatarUrl: z.string().url('请输入有效的 URL').optional().or(z.literal('')),
});

const passwordSchema = z.object({
  oldPassword: z.string().min(6, '密码至少6位'),
  newPassword: z.string().min(6, '密码至少6位'),
  confirmPassword: z.string().min(6, '密码至少6位'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: '两次密码不一致',
  path: ['confirmPassword'],
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

function Settings() {
  const { user, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'appearance'>('profile');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 个人资料表单
  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nickname: user?.nickname || '',
      avatarUrl: user?.avatarUrl || '',
    },
  });

  // 密码修改表单
  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  // 保存个人资料
  const onProfileSubmit = async (data: ProfileForm) => {
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch('/api/v1/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new Error('保存失败');
      
      const result = await response.json();
      setUser(result);
      setMessage({ type: 'success', text: '个人资料已保存' });
    } catch (error) {
      setMessage({ type: 'error', text: '保存失败，请重试' });
    } finally {
      setSaving(false);
    }
  };

  // 修改密码
  const onPasswordSubmit = async (data: PasswordForm) => {
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch('/api/v1/users/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          oldPassword: data.oldPassword,
          newPassword: data.newPassword,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '修改失败');
      }
      
      setMessage({ type: 'success', text: '密码修改成功' });
      passwordForm.reset();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '修改失败' });
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', label: '个人资料', icon: User },
    { id: 'password', label: '密码修改', icon: Lock },
    { id: 'appearance', label: '外观设置', icon: Palette },
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-6">设置</h1>

      {/* 标签栏 */}
      <div className="flex border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              setMessage(null);
            }}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* 消息提示 */}
      {message && (
        <div
          className={`mb-4 p-3 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* 个人资料 */}
      {activeTab === 'profile' && (
        <div className="card">
          <h2 className="font-medium mb-4">个人资料</h2>
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
            <Input
              label="昵称"
              {...profileForm.register('nickname')}
              error={profileForm.formState.errors.nickname?.message}
            />
            
            <Input
              label="头像 URL"
              {...profileForm.register('avatarUrl')}
              placeholder="https://example.com/avatar.jpg"
              error={profileForm.formState.errors.avatarUrl?.message}
              helperText="支持 jpg/png 格式的图片链接"
            />

            <div className="flex items-center gap-4">
              <Button type="submit" loading={saving}>
                <Save size={16} />
                保存
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* 密码修改 */}
      {activeTab === 'password' && (
        <div className="card">
          <h2 className="font-medium mb-4">修改密码</h2>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
            <Input
              type="password"
              label="当前密码"
              {...passwordForm.register('oldPassword')}
              error={passwordForm.formState.errors.oldPassword?.message}
            />
            
            <Input
              type="password"
              label="新密码"
              {...passwordForm.register('newPassword')}
              error={passwordForm.formState.errors.newPassword?.message}
            />
            
            <Input
              type="password"
              label="确认新密码"
              {...passwordForm.register('confirmPassword')}
              error={passwordForm.formState.errors.confirmPassword?.message}
            />

            <Button type="submit" loading={saving}>
              <Lock size={16} />
              修改密码
            </Button>
          </form>
        </div>
      )}

      {/* 外观设置 */}
      {activeTab === 'appearance' && (
        <div className="card">
          <h2 className="font-medium mb-4">外观设置</h2>
          
          <div className="space-y-6">
            {/* 主题切换 */}
            <div>
              <label className="block text-sm font-medium mb-2">主题</label>
              <div className="flex gap-3">
                <button
                  onClick={() => document.documentElement.classList.remove('dark')}
                  className="flex-1 p-4 border-2 rounded-lg hover:border-blue-500 transition-colors"
                >
                  <div className="w-full h-20 bg-white border rounded mb-2" />
                  <span className="text-sm">亮色</span>
                </button>
                <button
                  onClick={() => document.documentElement.classList.add('dark')}
                  className="flex-1 p-4 border-2 rounded-lg hover:border-blue-500 transition-colors"
                >
                  <div className="w-full h-20 bg-gray-800 border rounded mb-2" />
                  <span className="text-sm">暗色</span>
                </button>
              </div>
            </div>

            {/* 编辑器设置 */}
            <div>
              <label className="block text-sm font-medium mb-2">编辑器字号</label>
              <select className="input-field">
                <option value="14">14px</option>
                <option value="16" selected>16px</option>
                <option value="18">18px</option>
                <option value="20">20px</option>
              </select>
            </div>

            {/* 自动保存 */}
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium">自动保存</label>
                <p className="text-sm text-gray-500">编辑时自动保存笔记</p>
              </div>
              <button
                className="w-12 h-6 bg-blue-600 rounded-full relative"
              >
                <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;