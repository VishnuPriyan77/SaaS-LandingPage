import { ease, range } from './studio.ts';

/** One pinned scene. New images grow over the previous image; only copy travels upward. */
export function approachAt(progress: number) {
  const p = Math.max(0, Math.min(1, progress));
  const starts = [0, .26, .63];
  const ends = [.12, .48, .85];
  return starts.map((start, i) => {
    const enter = ease(range(p, start, ends[i]));
    const leave = i < 2 ? ease(range(p, starts[i + 1], ends[i + 1])) : 0;
    const copyEnter = i === 0 ? 1 : ease(range(p, start + .035, ends[i]));
    return {
      backgroundOpacity: i === 0 ? 1 : enter,
      imageScale: i === 0 ? .72 + .28 * enter : .035 + .965 * enter,
      imageVisible: i === 0 || p > start,
      copyY: (1 - copyEnter) * 80 - leave * 85,
      copyOpacity: copyEnter * (1 - ease(range(leave, .35, .95))),
      active: (i === 0 || p >= ends[i] - .035) && (i === 2 || p < starts[i + 1] + .07),
    };
  });
}
