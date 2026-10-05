export default function Button({ children, loading = false, variant = 'primary', className = '', disabled, type = 'button', ...props }) {
  return <button type={type} className={`btn btn-${variant} ${className}`} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
    {loading && <span className="spinner spinner-small" aria-hidden="true" />}{children}
  </button>;
}
