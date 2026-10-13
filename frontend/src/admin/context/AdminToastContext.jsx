import { createContext, useContext, useState, useCallback } from 'react';
import Icon from '../../common/components/Icon';

const AdminToastContext = createContext(null);

export function AdminToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, 3500);
  }, [removeToast]);

  return (
    <AdminToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.length > 0 && (
        <div className="admin-toast-container" role="status" aria-live="polite">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`admin-toast admin-toast-${toast.type}`}
            >
              <div className="admin-toast-content">
                <Icon
                  name={toast.type === 'error' ? 'alert-circle' : toast.type === 'warning' ? 'alert-circle' : 'check-circle'}
                  size={18}
                />
                <span>{toast.message}</span>
              </div>
              <button
                type="button"
                className="admin-toast-close"
                onClick={() => removeToast(toast.id)}
                aria-label="Close notification"
              >
                <Icon name="x" size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </AdminToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAdminToast() {
  const context = useContext(AdminToastContext);
  if (!context) {
    return { showToast: (msg) => console.log('Toast:', msg) };
  }
  return context;
}
