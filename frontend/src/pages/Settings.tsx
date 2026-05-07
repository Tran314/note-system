import { useState } from 'react';
import { Palette } from 'lucide-react';

function Settings() {
  const [activeTab, setActiveTab] = useState<'appearance'>('appearance');
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  const tabs = [
    { id: 'appearance', label: '外观设置', icon: Palette },
  ];

  return (
    <div className="page-enter mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-stone-900">设置</h1>
        <p className="mt-1 text-sm text-stone-500">调整你的编辑体验和界面风格</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
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

      {activeTab === 'appearance' && (
        <div className="card space-y-6">
          <div>
            <h2 className="mb-1 text-lg font-medium text-stone-900">外观设置</h2>
            <p className="text-sm text-stone-500">让界面更适合你的日常使用习惯</p>
          </div>

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
