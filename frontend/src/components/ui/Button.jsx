import Spinner from './Spinner';

export default function Button({ children, variant = 'primary', loading = false, className = '', ...props }) {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-xl transition-colors font-medium',
    danger: 'bg-red-500 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-red-600 transition-colors',
  };
  return (
    <button className={`${variants[variant]} inline-flex items-center gap-2 ${className}`} disabled={loading || props.disabled} {...props}>
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
}
