/**
 * Blocking theme script — forces light mode (no dark / system toggle).
 */
const THEME_INIT = `
(function () {
  try {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  } catch (e) {}
})();
`;

export function ThemeScript() {
  return (
    <script
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: THEME_INIT }}
    />
  );
}
