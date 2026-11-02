/**
 * iOS Safari / WKWebView can recognise double-tap zoom and long-press text
 * selection even when the viewport meta tag and touch-action are present.
 *
 * Cancel native gestures on the GAME surface without suppressing menu button
 * clicks. Pointerdown still drives the jump/dash gamepad, including fast taps.
 */
export function installGameTouchGuards(root, doc) {
  const options = {passive: false, capture: true};
  const prevent = event => {
    if (event.cancelable) event.preventDefault();
  };
  const ignoreTextSelection = event => {
    // The whole document is a game UI, not editable text.
    prevent(event);
  };
  // iOS-specific pinch events; do not rely on only CSS touch-action here.
  for (const event of ['gesturestart', 'gesturechange', 'gestureend']) {
    doc.addEventListener(event, prevent, options);
  }
  root.addEventListener('touchstart', event => {
    if ((event.touches?.length ?? 0) > 1) prevent(event);
  }, options);
  root.addEventListener('touchmove', prevent, options);

  let lastTapTime = -Infinity, lastX = -10000, lastY = -10000;
  root.addEventListener('touchend', event => {
    const touch = event.changedTouches?.[0];
    const target = event.target;
    const gamepad = target?.closest?.('[data-action]');
    const menuAction = target?.closest?.('#overlay a, #overlay button');
    if (gamepad) {
      // The real action was already handled on pointerdown. Cancel Safari's
      // emulated click, selection and double-tap recogniser on *every* tap.
      prevent(event);
    } else if (!menuAction && touch) {
      const time = Number.isFinite(event.timeStamp) ? event.timeStamp : Date.now();
      const x = touch.clientX, y = touch.clientY;
      if (time - lastTapTime < 480 && Math.hypot(x - lastX, y - lastY) < 70) {
        prevent(event);
      }
    }
    if (touch) {
      lastTapTime = Number.isFinite(event.timeStamp) ? event.timeStamp : Date.now();
      lastX = touch.clientX; lastY = touch.clientY;
    }
  }, options);

  // iOS magnifying loupe / select/copy overlay, native long-press menu,
  // text dragging and browser double-click zoom.
  doc.addEventListener('dblclick', prevent, options);
  doc.addEventListener('selectstart', ignoreTextSelection, options);
  doc.addEventListener('contextmenu', prevent, options);
  doc.addEventListener('dragstart', prevent, options);
  doc.addEventListener('selectionchange', () => {
    const selection = doc.getSelection?.();
    if (selection && selection.rangeCount > 0) selection.removeAllRanges();
  });
}
