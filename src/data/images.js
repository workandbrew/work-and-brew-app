// Test photos bundled with the app. Swap for Supabase Storage URLs later.
const SAMPLES = {
  'sample:lalins-storefront': require('../../assets/sample/lalins-storefront.jpg'),
  'sample:lalins-interior': require('../../assets/sample/lalins-interior.jpg'),
  'sample:lalins-pool': require('../../assets/sample/lalins-pool.jpg'),
  'sample:lalins-order': require('../../assets/sample/lalins-order.jpg'),
  'sample:den': require('../../assets/sample/profile-den.jpg'),
};

// Accepts a sample key, a bundled require() number, or a remote/local URI string.
export function imageSource(ref) {
  if (!ref) return null;
  if (typeof ref === 'number') return ref;
  if (SAMPLES[ref]) return SAMPLES[ref];
  return { uri: ref };
}
