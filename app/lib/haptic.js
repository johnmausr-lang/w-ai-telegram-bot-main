export const haptic = (type = "light") => {
  if (!navigator.vibrate) return;
  const patterns = { light: [30], medium: [60], heavy: [100, 50, 100] };
  navigator.vibrate(patterns[type] || patterns.light);
};
