import L from 'leaflet';

interface GetIconOptions {
  isActive?: boolean;
  isReservado?: boolean;
  isSelected?: boolean;
}

export const getIcon = (
  type: 'tradicional' | 'led' | 'led_movil',
  options: GetIconOptions = {}
) => {
  const { isActive = false, isReservado = false, isSelected = false } = options;
  const isLed = type === 'led' || type === 'led_movil';
  const bgColor = isReservado ? 'bg-gray-400' : (isLed ? 'bg-red-500' : 'bg-gray-900');

  // Apply specific styles when active
  const activeScale = isActive ? 'scale-125' : '';
  const activeBorder = isActive ? 'ring-4 ring-black ring-offset-2' : 'border-2 border-white';
  const activeZIndex = isActive ? 'z-[2000]' : 'z-10';
  const availabilityOpacity = isReservado ? 'opacity-60' : '';

  const svg = isLed
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;

  // Non-color indicator: reservado shows a lock icon, selected shows a check icon.
  // These are mutually exclusive (reservado items cannot be selected).
  const cornerBadge = isReservado
    ? `<div class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white border border-gray-300 flex items-center justify-center shadow-sm">
         <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
       </div>`
    : isSelected
    ? `<div class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-sm">
         <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
       </div>`
    : '';

  return L.divIcon({
    className: `bg-transparent border-none ${isActive ? 'active' : ''}`, // Add active class for CSS targeting
    html: `
      <div class="relative flex items-center justify-center w-8 h-8 transition-transform duration-200 drop-shadow-md ${activeScale} ${availabilityOpacity}">
        <div class="relative flex items-center justify-center w-8 h-8 rounded-full ${bgColor} ${activeBorder} ${activeZIndex} transition-all duration-200">
          ${svg}
        </div>
        <div class="absolute -bottom-1.5 w-3 h-3 ${bgColor} rotate-45 z-0"></div>
        ${cornerBadge}
      </div>
    `,
    iconSize: [32, 38],
    iconAnchor: [16, 38],
    popupAnchor: [0, -38],
  });
};
