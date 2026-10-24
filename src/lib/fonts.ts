/** Resolve Next's generated font families before Phaser creates any canvas text. */
export async function loadGameFonts() {
  const styles = getComputedStyle(document.documentElement);
  const faces = [
    ['--font-fraunces', 24],
    ['--font-nunito', 14],
    ['--font-caveat', 22],
  ] as const;
  await Promise.all(
    faces.map(([variable, size]) => {
      const family = styles.getPropertyValue(variable).split(',')[0].trim();
      return document.fonts.load(`400 ${size}px ${family}`, 'Ari brings the lantern home');
    }),
  );
  await document.fonts.ready;
}
