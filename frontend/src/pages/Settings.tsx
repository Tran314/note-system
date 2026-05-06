<<<<<<< Updated upstream
import { useState } from 'react';
=======
import { useState, useEffect } from 'react';
>>>>>>> Stashed changes
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../store/auth.store';
import { useSettingsStore } from '../store/settings.store';
import { User, Lock, Palette, Save } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';

const profileSchema = z.object({
  nickname: z.string().min(1, '昵称不能为空').max(50, '昵称最多 50 个字符'),
  avatarUrl: z.string().url('请输入有效的 URL').optional().or(z.literal('')),
});

const passwordSchema = z
  .object({
    oldPassword: z.string().min(6, '密码至少 6 位'),
    newPassword: z.string().min(6, '密码至少 6 位'),
    confirmPassword: z.string().min(6, '密码至少 6 位'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: '两次密码不一致',
    path: ['confirmPassword'],
  });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

function Settings() {
  const { user, setUser } = useAuthStore();
  const { fontSize, autoSaveEnabled, setFontSize, setAutoSaveEnabled, isDarkMode, setDarkMode } = useSettingsStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'appearance'>('profile');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
<<<<<<< Updated upstream
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
=======
>>>>>>> Stashed changes

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nickname: user?.nickname || '',
      avatarUrl: user?.avatarUrl || '',
    },
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = async (data: ProfileForm) => {
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch('/api/v1/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('保存失败');

      const result = await response.json();
      setUser(result);
      setMessage({ type: 'success', text: '个人资料已保存' });
    } catch {
      setMessage({ type: 'error', text: '保存失败，请重试' });
    } finally {
      setSaving(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch('/api/v1/users/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
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

<<<<<<< Updated upstream
  const tabs = [
    { id: 'profile', label: '个人资料', icon: User },
    { id: 'password', label: '密码修改', icon: Lock },
    { id: 'appearance', label: '外观设置', icon: Palette },
=======
  const tabs: { id: 'profile' | 'password' | 'appearance'; label: string; icon: typeof User }[] = [
    { id: 'profile', label: t('settings.profile'), icon: User },
    { id: 'password', label: t('settings.changePassword'), icon: Lock },
    { id: 'appearance', label: t('settings.appearance'), icon: Palette },
>>>>>>> Stashed changes
  ];

  return (
    <div className="page-enter mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-stone-900">设置</h1>
        <p className="mt-1 text-sm text-stone-500">调整你的账号、编辑体验和界面风格</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as typeof activeTab);
              setMessage(null);
            }}
            className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm transition-all ${
              activeTab === tab.id
                ? 'bg-stone-900 text-white shadow-[0_12px_32px_rgba(63,44,24,0.18)]'
                : 'bg-white/55 text-stone-600 hover:bg-white/75'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {message && (
        <div
          className={`mb-4 rounded-2xl border px-4 py-3 text-sm ${
            message.type === 'success'
              ? 'border-emerald-200/80 bg-emerald-50/80 text-emerald-700'
              : 'border-red-200/80 bg-red-50/80 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="card">
          <h2 className="mb-4 text-lg font-medium text-stone-900">个人资料</h2>
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
              helperText="支持 jpg、png 等公开图片地址"
            />

            <Button type="submit" loading={saving}>
              <Save size={16} />
              保存资料
            </Button>
          </form>
        </div>
      )}

      {activeTab === 'password' && (
        <div className="card">
          <h2 className="mb-4 text-lg font-medium text-stone-900">修改密码</h2>
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
              更新密码
            </Button>
          </form>
        </div>
      )}

      {activeTab === 'appearance' && (
<<<<<<< Updated upstream
        <div className="card space-y-6">
          <div>
            <h2 className="mb-1 text-lg font-medium text-stone-900">外观设置</h2>
            <p className="text-sm text-stone-500">让界面更适合你的日常使用习惯</p>
          </div>
=======
        <div className="card">
          <h2 className="font-medium mb-4">{t('settings.appearance')}</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">{t('settings.theme')}</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setDarkMode(false)}
                  className={`flex-1 p-4 border-2 rounded-lg transition-colors ${
                    !isDarkMode ? 'border-blue-500 bg-blue-50' : 'hover:border-blue-500'
                  }`}
                  aria-pressed={!isDarkMode}
                >
                  <div className="w-full h-20 bg-white border rounded mb-2" />
                  <span className="text-sm">{t('settings.themeLight')}</span>
                </button>
                <button
                  onClick={() => setDarkMode(true)}
                  className={`flex-1 p-4 border-2 rounded-lg transition-colors ${
                    isDarkMode ? 'border-blue-500 bg-blue-50' : 'hover:border-blue-500'
                  }`}
                  aria-pressed={isDarkMode}
                >
                  <div className="w-full h-20 bg-gray-800 border rounded mb-2" />
                  <span className="text-sm">{t('settings.themeDark')}</span>
                </button>
              </div>
            </div>
>>>>>>> Stashed changes

          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700">主题</label>
            <div className="grid gap-3 md:grid-cols-2">
              <button
                onClick={() => document.documentElement.classList.remove('dark')}
                className="rounded-[22px] border border-stone-200/80 bg-white/65 p-4 text-left transition hover:-translate-y-0.5 hover:border-stone-300"
              >
                <div className="mb-3 h-24 rounded-2xl border border-stone-200/70 bg-[linear-gradient(180deg,#fffcf8_0%,#f2ece2_100%)]" />
                <span className="text-sm font-medium text-stone-800">浅色</span>
              </button>
              <button
                onClick={() => document.documentElement.classList.add('dark')}
                className="rounded-[22px] border border-stone-200/80 bg-white/65 p-4 text-left transition hover:-translate-y-0.5 hover:border-stone-300"
              >
                <div className="mb-3 h-24 rounded-2xl border border-stone-700/70 bg-[linear-gradient(180deg,#2c241d_0%,#151311_100%)]" />
                <span className="text-sm font-medium text-stone-800">深色</span>
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700">编辑器字号</label>
            <select className="input-field" defaultValue="16">
              <option value="14">14px</option>
              <option value="16">16px</option>
              <option value="18">18px</option>
              <option value="20">20px</option>
            </select>
          </div>

          <div className="flex items-center justify-between rounded-[22px] border border-stone-200/70 bg-white/45 px-4 py-4">
            <div>
              <label className="block text-sm font-medium text-stone-800">自动保存</label>
              <p className="text-sm text-stone-500">编辑时自动保存笔记，减少手动操作</p>
            </div>
            <button
              onClick={() => setAutoSaveEnabled((value) => !value)}
              className={`relative h-7 w-14 rounded-full transition ${
                autoSaveEnabled ? 'bg-stone-800' : 'bg-stone-300'
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                  autoSaveEnabled ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;