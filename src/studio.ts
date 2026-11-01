export const INTRO_END = 4.2;
export const range = (p: number, a: number, b: number) => Math.max(0, Math.min(1, (p - a) / (b - a)));
export const ease = (p: number) => p * p * (3 - 2 * p);

/** Absolute scroll pose: independent of scroll direction or accumulated state. */
export function studioAt(progress: number, duration = 15.041667) {
  const p = Math.max(0, Math.min(1, progress));
  const end = Math.max(0, duration - .08);
  const rest = Math.min(INTRO_END, end);
  const reveal = ease(range(p, .76, .99));
  return {
    videoTime: rest + ease(range(p, 0, .65)) * (end - rest),
    videoOffset: (1 - ease(range(p, 0, .32))) * 9,
    introOpacity: 1 - ease(range(p, .08, .28)),
    promiseOpacity: ease(range(p, .39, .51)) * (1 - ease(range(p, .73, .81))),
    shade: .03 + ease(range(p, .32, .54)) * .7,
    portalVisible: p >= .76,
    portalInsetY: (1 - reveal) * 43,
    portalInsetX: (1 - reveal) * 44,
    portalCopy: ease(range(p, .93, .99)),
    portalInteractive: p >= .99,
  };
}
