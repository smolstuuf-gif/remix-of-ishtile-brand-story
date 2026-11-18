export function isWindowScroller(scroller: Element | Window): scroller is Window {
  return scroller === window;
}

/** Wait until the chosen scroll container has measurable layout before creating triggers. */
export function waitForScrollerReady(scroller: Element | Window): Promise<void> {
  return new Promise((resolve) => {
    const check = () => {
      if (scroller === window) {
        if (document.documentElement.clientHeight > 0) {
          resolve();
          return;
        }
      } else if (scroller instanceof Element && scroller.isConnected && scroller.getBoundingClientRect().height > 0) {
        resolve();
        return;
      }
      requestAnimationFrame(check);
    };
    requestAnimationFrame(check);
  });
}

/** Bind resize handling to the window and return an unbind function. */
export function observeWindowResize(callback: () => void): () => void {
  let frame = 0;
  const handleResize = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(callback);
  };
  window.addEventListener("resize", handleResize, { passive: true });
  return () => {
    window.removeEventListener("resize", handleResize);
    cancelAnimationFrame(frame);
  };
}
