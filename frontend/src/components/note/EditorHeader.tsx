import { ArrowLeft, Save, Check } from 'lucide-react';
import { Button } from '../common/Button';

interface EditorHeaderProps {
  hasUnsavedChanges: boolean;
  lastSaved: Date | null;
  saving: boolean;
  onSave: () => void;
  onBack: () => void;
  t: (key: string) => string;
}

export function EditorHeader({
  hasUnsavedChanges,
  lastSaved,
  saving,
  onSave,
  onBack,
  t,
}: EditorHeaderProps) {
  return (
    <div className="flex items-center justify-between p-3 border-b border-gray-200 sticky top-0 bg-white z-10">
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded"
          title={t('common.back')}
          aria-label={t('common.back')}
        >
          <ArrowLeft size={20} />
        </button>
        
        <div className="text-sm text-gray-500">
          {hasUnsavedChanges ? (
            <span className="text-orange-500">{t('common.unsaved')}</span>
          ) : lastSaved ? (
            <span className="flex items-center gap-1 text-green-600">
              <Check size={14} />
              {t('common.saved')} {lastSaved.toLocaleTimeString()}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={onSave}
          disabled={saving}
          loading={saving}
        >
          <Save size={16} />
          {t('common.save')}
        </Button>
      </div>
    </div>
  );
}
