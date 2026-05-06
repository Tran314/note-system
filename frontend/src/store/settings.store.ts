import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  fontSize: number;
  autoSaveEnabled: boolean;
  isDarkMode: boolean;
  setFontSize: (size: number) => void;
  setAutoSaveEnabled: (enabled: boolean) => void;
  setDarkMode: (dark: boolean) => void;
  toggleDarkMode: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      fontSize: 16,
      autoSaveEnabled: true,
      isDarkMode: false,

      setFontSize: (fontSize) => {
        set({ fontSize });
        document.documentElement.style.setProperty('--editor-font-size', `${fontSize}px`);
      },

      setAutoSaveEnabled: (autoSaveEnabled) => set({ autoSaveEnabled }),

      setDarkMode: (isDarkMode) => {
        set({ isDarkMode });
        document.documentElement.classList.toggle('dark', isDarkMode);
      },

      toggleDarkMode: () => {
        const newValue = !get().isDarkMode;
        set({ isDarkMode: newValue });
        document.documentElement.classList.toggle('dark', newValue);
      },
    }),
    {
      name: 'settings-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          document.documentElement.classList.toggle('dark', state.isDarkMode);
          document.documentElement.style.setProperty('--editor-font-size', `${state.fontSize}px`);
        }
      },
    }
  )
);