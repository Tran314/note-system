import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/auth.store';
import { User, Lock, Palette, Save } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { api } from '../services/api';

function createProfileSchema(t: (key: string) => string) {
  return z.object({
    nickname: z.string().min(1, t('auth.nicknameRequired')).max(50, t('auth.nicknameMax')),
    avatarUrl: z.string().url(t('auth.invalidUrl')).optional().or(z.literal('')),
  });
}

function createPasswordSchema(t: (key: string) => string) {
  return z.object({
    oldPassword: z.string().min(6, t('auth.passwordTooShort')),
    newPassword: z.string().min(6, t('auth.passwordTooShort')),
    confirmPassword: z.string().min(6, t('auth.passwordTooShort')),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: t('auth.passwordMismatch'),
    path: ['confirmPassword'],
  });
}

type ProfileForm = z.infer<ReturnType<typeof createProfileSchema>>;
type PasswordForm = z.infer<ReturnType<typeof createPasswordSchema>>;

function Settings() {
  const { t } = useTranslation();
  const { user, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'appearance'>('profile');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [fontSize, setFontSize] = useState(16);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  const profileSchema = createProfileSchema(t);
  const passwordSchema = createPasswordSchema(t);

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

  useEffect(() => {
    if (user) {
      profileForm.reset({
        nickname: user.nickname || '',
        avatarUrl: user.avatarUrl || '',
      });
    }
  }, [user]);

  const onProfileSubmit = async (data: ProfileForm) => {
    setSaving(true);
    setMessage(null);
    try {
      const response = await api.put('/users/profile', data);
      setUser(response.data.data);
      setMessage({ type: 'success', text: t('settings.profileSection') });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      setMessage({ type: 'error', text: err.response?.data?.message || t('errors.networkError') });
    } finally {
      setSaving(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    setSaving(true);
    setMessage(null);
    try {
      await api.put('/users/password', {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });
      setMessage({ type: 'success', text: t('settings.passwordChanged') });
      passwordForm.reset();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      setMessage({ type: 'error', text: err.response?.data?.message || t('settings.passwordWrong') });
    } finally {
      setSaving(false);
    }
  };

  const toggleDarkMode = useCallback((dark: boolean) => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const tabs: { id: 'profile' | 'password' | 'appearance'; label: string; icon: typeof User }[] = [
    { id: 'profile', label: t('settings.profile'), icon: User },
    { id: 'password', label: t('settings.changePassword'), icon: Lock },
    { id: 'appearance', label: t('settings.appearance'), icon: Palette },
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-6">{t('settings.settings')}</h1>

      <div className="flex border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
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

      {message && (
        <div
          className={`mb-4 p-3 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="card">
          <h2 className="font-medium mb-4">{t('settings.profileSection')}</h2>
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
            <Input
              label={t('auth.nickname')}
              {...profileForm.register('nickname')}
              error={profileForm.formState.errors.nickname?.message}
            />
            
            <Input
              label={t('settings.avatar')}
              {...profileForm.register('avatarUrl')}
              placeholder="https://example.com/avatar.jpg"
              error={profileForm.formState.errors.avatarUrl?.message}
              helperText={t('settings.avatarHelperText')}
            />

            <div className="flex items-center gap-4">
              <Button type="submit" loading={saving}>
                <Save size={16} />
                {t('common.save')}
              </Button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'password' && (
        <div className="card">
          <h2 className="font-medium mb-4">{t('settings.changePassword')}</h2>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
            <Input
              type="password"
              label={t('settings.currentPassword')}
              {...passwordForm.register('oldPassword')}
              error={passwordForm.formState.errors.oldPassword?.message}
            />
            
            <Input
              type="password"
              label={t('settings.newPassword')}
              {...passwordForm.register('newPassword')}
              error={passwordForm.formState.errors.newPassword?.message}
            />
            
            <Input
              type="password"
              label={t('settings.confirmNewPassword')}
              {...passwordForm.register('confirmPassword')}
              error={passwordForm.formState.errors.confirmPassword?.message}
            />

            <Button type="submit" loading={saving}>
              <Lock size={16} />
              {t('settings.changePassword')}
            </Button>
          </form>
        </div>
      )}

      {activeTab === 'appearance' && (
        <div className="card">
          <h2 className="font-medium mb-4">{t('settings.appearance')}</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">{t('settings.theme')}</label>
              <div className="flex gap-3">
                <button
                  onClick={() => toggleDarkMode(false)}
                  className="flex-1 p-4 border-2 rounded-lg hover:border-blue-500 transition-colors"
                  aria-pressed="false"
                >
                  <div className="w-full h-20 bg-white border rounded mb-2" />
                  <span className="text-sm">{t('settings.themeLight')}</span>
                </button>
                <button
                  onClick={() => toggleDarkMode(true)}
                  className="flex-1 p-4 border-2 rounded-lg hover:border-blue-500 transition-colors"
                  aria-pressed="true"
                >
                  <div className="w-full h-20 bg-gray-800 border rounded mb-2" />
                  <span className="text-sm">{t('settings.themeDark')}</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('settings.fontSize')}</label>
              <select 
                className="input-field"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
              >
                <option value="14">14px</option>
                <option value="16">16px</option>
                <option value="18">18px</option>
                <option value="20">20px</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium">{t('settings.autoSave')}</label>
                <p className="text-sm text-gray-500">{t('settings.autoSaveEnabled')}</p>
              </div>
              <button
                onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
                className={`w-12 h-6 rounded-full relative transition-colors ${
                  autoSaveEnabled ? 'bg-blue-600' : 'bg-gray-300'
                }`}
                role="switch"
                aria-checked={autoSaveEnabled}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    autoSaveEnabled ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;
