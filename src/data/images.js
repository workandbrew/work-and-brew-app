// Test photos bundled with the app. Swap for Supabase Storage URLs later.
const SAMPLES = {
  'sample:feature': require('../../assets/sample/feature-storefront.jpg'),
  'sample:den': require('../../assets/sample/profile-den.jpg'),
};

// Accepts a sample key, a bundled require() number, or a remote/local URI string.
export function imageSource(ref) {
  if (!ref) return null;
  if (typeof ref === 'number') return ref;
  if (SAMPLES[ref]) return SAMPLES[ref];
  return { uri: ref };
}
