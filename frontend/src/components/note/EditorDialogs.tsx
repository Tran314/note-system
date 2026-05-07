import { Button } from '../common/Button';

interface EditorDialogsProps {
  showLinkDialog: boolean;
  showImageDialog: boolean;
  linkUrl: string;
  imageUrl: string;
  onLinkUrlChange: (url: string) => void;
  onImageUrlChange: (url: string) => void;
  onCloseLinkDialog: () => void;
  onCloseImageDialog: () => void;
  onAddLink: () => void;
  onAddImage: () => void;
  t: (key: string) => string;
}

export function EditorDialogs({
  showLinkDialog,
  showImageDialog,
  linkUrl,
  imageUrl,
  onLinkUrlChange,
  onImageUrlChange,
  onCloseLinkDialog,
  onCloseImageDialog,
  onAddLink,
  onAddImage,
  t,
}: EditorDialogsProps) {
  return (
    <>
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-96">
            <h3 className="font-medium mb-3">{t('common.addLink')}</h3>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => onLinkUrlChange(e.target.value)}
              placeholder={t('editor.linkPlaceholder')}
              className="input-field mb-3"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={onCloseLinkDialog}>
                {t('common.cancel')}
              </Button>
              <Button onClick={onAddLink}>{t('common.create')}</Button>
            </div>
          </div>
        </div>
      )}

      {showImageDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-96">
            <h3 className="font-medium mb-3">{t('common.addImage')}</h3>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => onImageUrlChange(e.target.value)}
              placeholder={t('editor.imageUrl')}
              className="input-field mb-3"
              autoFocus
            />
            <p className="text-sm text-gray-500 mb-3">
              {t('common.pasteImageHint')}
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={onCloseImageDialog}>
                {t('common.cancel')}
              </Button>
              <Button onClick={onAddImage}>{t('common.create')}</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
