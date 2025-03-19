export function Logo(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 200 50" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" {...props}>
      {/* Define gradients */}
      <defs>
        <linearGradient id="godeploy-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: '#2F4F4F', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#615fff', stopOpacity: 1 }} />
        </linearGradient>
      </defs>

      {/* Arrows in dark slate */}
      <path d="M25 25 L30 15" stroke="#2F4F4F" strokeWidth="1" />
      <path d="M25 25 L35 20" stroke="#2F4F4F" strokeWidth="1" />
      <path d="M25 25 L40 25" stroke="#2F4F4F" strokeWidth="1" />
      <path d="M25 25 L35 30" stroke="#2F4F4F" strokeWidth="1" />
      <path d="M25 25 L30 35" stroke="#2F4F4F" strokeWidth="1" />

      {/* Smaller nodes in indigo */}
      <circle cx="30" cy="15" r="2" fill="#615fff" />
      <circle cx="35" cy="20" r="2" fill="#615fff" />
      <circle cx="40" cy="25" r="2" fill="#615fff" />
      <circle cx="35" cy="30" r="2" fill="#615fff" />
      <circle cx="30" cy="35" r="2" fill="#615fff" />

      {/* Central dot with gradient */}
      <circle cx="25" cy="25" r="5" fill="url(#godeploy-grad)" />

      {/* Text with dual colors */}
      <text x="50" y="35" fontFamily="Arial, sans-serif" fontSize="24" fontWeight="bold">
        <tspan fill="#615fff">Go</tspan>
        <tspan fill="#2F4F4F">Deploy</tspan>
      </text>
    </svg>
  );
}

export const LogoIcon = (props: React.ComponentPropsWithoutRef<'svg'>) => {
  return (
    <svg width="50" height="50" viewBox="9 5 40 40" xmlns="http://www.w3.org/2000/svg" {...props}>
      {/* Define gradients */}
      <defs>
        <linearGradient id="godeploy-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: '#2F4F4F', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#615fff', stopOpacity: 1 }} />
        </linearGradient>
      </defs>

      {/* Arrows in dark slate */}
      <path d="M25 25 L30 15" stroke="#2F4F4F" strokeWidth="1" />
      <path d="M25 25 L35 20" stroke="#2F4F4F" strokeWidth="1" />
      <path d="M25 25 L40 25" stroke="#2F4F4F" strokeWidth="1" />
      <path d="M25 25 L35 30" stroke="#2F4F4F" strokeWidth="1" />
      <path d="M25 25 L30 35" stroke="#2F4F4F" strokeWidth="1" />

      {/* Smaller nodes in indigo */}
      <circle cx="30" cy="15" r="2" fill="#615fff" />
      <circle cx="35" cy="20" r="2" fill="#615fff" />
      <circle cx="40" cy="25" r="2" fill="#615fff" />
      <circle cx="35" cy="30" r="2" fill="#615fff" />
      <circle cx="30" cy="35" r="2" fill="#615fff" />

      {/* Central dot with gradient */}
      <circle cx="25" cy="25" r="5" fill="url(#godeploy-grad)" />
    </svg>
  );
};
