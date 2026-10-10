import L from 'leaflet';

interface GetIconOptions {
  isActive?: boolean;
  isReservado?: boolean;
  isSelected?: boolean;
}

export const getIcon = (
  type: 'tradicional' | 'led' | 'led_movil',
  options: GetIconOptions = {},
) => {
  const { isActive = false, isReservado = false, isSelected = false } = options;
  const isLed = type === 'led' || type === 'led_movil';
  const bgColor = isReservado ? 'bg-slate-500' : (isLed ? 'bg-red-600' : 'bg-gray-950');

  const activeScale = isActive ? 'scale-125' : 'hover:scale-110';
  const activeBorder = isActive ? 'ring-4 ring-gray-950 ring-offset-2 border-2 border-white' : 'border-2 border-white';
  const activeZIndex = isActive ? 'z-[2000]' : 'z-10';
  const availabilityOpacity = isReservado ? 'opacity-70' : '';

  const svg = isLed
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;

  // Selection and availability are explicit, non-color-only states.
  // Reserved items cannot be selected, so the badges remain mutually exclusive.
  const cornerBadge = isReservado
    ? `<div class="absolute -top-2 -right-2 z-[30] w-5 h-5 rounded-full bg-white border border-gray-300 flex items-center justify-center shadow-md">
         <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
       </div>`
    : isSelected
    ? `<div class="absolute -top-2 -right-2 z-[30] w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-md animate-pulse" aria-label="Seleccionado">
         <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
       </div>`
    : '';

  return L.divIcon({
    className: `bg-transparent border-none ${isActive ? 'active' : ''}`,
    html: `
      <div class="relative flex items-center justify-center w-8 h-8 transition-transform duration-200 drop-shadow-lg cursor-pointer ${activeScale} ${availabilityOpacity}">
        <div class="relative flex items-center justify-center w-8 h-8 rounded-full ${bgColor} ${activeBorder} ${activeZIndex} shadow-md transition-all duration-200">
          ${svg}
        </div>
        <div class="absolute -bottom-1.5 w-3 h-3 ${bgColor} rotate-45 z-0 shadow-sm"></div>
        ${cornerBadge}
      </div>
    `,
    iconSize: [32, 38],
    iconAnchor: [16, 38],
    popupAnchor: [0, -38],
  });
};
