import AdminModal from './AdminModal';

export default function ConfirmDialog({
  open,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  danger = true,
  onConfirm,
  onClose,
}) {
  return (
    <AdminModal
      open={open}
      title={title}
      onClose={onClose}
      size="sm"
      footer={
        <>
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`admin-btn ${danger ? 'admin-btn-danger' : 'admin-btn-primary'}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </>
      }
    >
      <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5, color: 'var(--admin-text-main)' }}>
        {message}
      </p>
    </AdminModal>
  );
}
