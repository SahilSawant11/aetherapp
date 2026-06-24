export const supabaseConfig = {
  url: 'https://umwrgevyasizvympclaz.supabase.co',
  anonKey: 'sb_publishable_1RHLFjLjaPhE54rzVEDWhQ_iVVhSGLf',
  passwordResetRedirectUrl: 'aetherapp://reset-password',
};

const normalizedUrl = supabaseConfig.url.trim();
const normalizedAnonKey = supabaseConfig.anonKey.trim();

export const isSupabaseConfigured =
  normalizedUrl.length > 0 &&
  normalizedAnonKey.length > 0 &&
  normalizedUrl.startsWith('https://') &&
  !normalizedUrl.includes('YOUR_PROJECT') &&
  !normalizedAnonKey.includes('YOUR_SUPABASE_ANON_KEY');
