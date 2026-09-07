/**
 * Resolves the only two supported reader themes from a locally persisted value.
 * Unknown or missing values deliberately use light mode so a new visit matches the approved default visual design.
 * @param {string | null} storedTheme Persisted browser theme preference.
 * @returns {'light' | 'dark'} Effective application theme.
 */
export function resolveStoredTheme(storedTheme) {
  return storedTheme === 'dark' ? 'dark' : 'light';
}
