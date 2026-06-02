export default function Avatar({ src, name, size = 'md', className = '' }) {
  const sizes = { sm: 'w-8 h-8 text-sm', md: 'w-10 h-10 text-base', lg: 'w-14 h-14 text-xl', xl: 'w-20 h-20 text-2xl' };
  const initials = name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';
  return src
    ? <img src={src} alt={name} className={`${sizes[size]} rounded-full object-cover ${className}`} />
    : <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-brand-400 to-orange-400 text-white font-bold flex items-center justify-center ${className}`}>{initials}</div>;
}
