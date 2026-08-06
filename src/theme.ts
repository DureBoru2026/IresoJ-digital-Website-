// Shared visual theme configuration for Layout elements (Header, Footer, etc.)
// Ensures cohesive aesthetic using the primary brand blue (#0EA5E9) as instructed

export const layoutTheme = {
  // Primary brand identifier color (Sky/Ocean Blue)
  primaryBlue: '#0EA5E9',
  
  // Background styling for both Header and Footer components
  bgClass: 'bg-slate-900 border-slate-800',
  
  // High contrast text/icons colors
  textPrimary: 'text-white hover:text-[#0EA5E9]',
  textSecondary: 'text-slate-300 hover:text-[#0EA5E9]',
  textAccent: 'text-[#0EA5E9]',
  
  // Custom button styling inside layout components
  buttonPrimary: 'bg-[#0EA5E9] hover:bg-sky-600 text-white transition-colors',
  buttonActive: 'bg-white/10 text-[#0EA5E9] border border-white/10',
  buttonInactive: 'text-slate-300 hover:text-[#0EA5E9] hover:bg-white/5',
};
