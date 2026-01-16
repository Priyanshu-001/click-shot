/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{vue,ts,js}',
  ],
  theme: {
    extend: {},
  },
  corePlugins: {
    preflight: false, // IMPORTANT for content scripts
  },
    safelist: [
    // layout
    'fixed', 'bottom-4', 'right-4', 'flex', 'items-end', 'gap-2',

    // visibility / animation
    'opacity-0', 'opacity-100', 'transition-opacity',

    // colors
    'bg-white', 'bg-blue-600', 'bg-blue-700',
    'text-white', 'text-gray-800',

    // sizing
    'w-10', 'h-10', 'px-3', 'py-1', 'p-4',

    // effects
    'rounded', 'rounded-lg', 'rounded-full', 'shadow',
  ],
}
