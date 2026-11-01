export const clamp = (n: number) => Math.max(0, Math.min(1, n));
export const span = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
export const ease = (n: number) => n * n * (3 - 2 * n);
export const SCREENS = 16;
export const MOBILE_SCREENS = 16;
export const SCROLL_CATCHUP = 1.15;
export const OPENING_END = .18;
export const ARRIVAL_END = .24;
export const portfolioProgress = (p: number) => span(p, ARRIVAL_END, 1);
export const scrollStop = (p: number) => ARRIVAL_END + p * (1 - ARRIVAL_END);

export function openingAt(p: number) {
  const arrival = ease(span(p, .13, ARRIVAL_END));
  return {
    bannerY: -ease(span(p, 0, .04)) * 100,
    headerY: 40 * (1 - ease(span(p, 0, .04))),
    // A real negative-Z translation creates perspective shrink, not a zoom out
    // toward the viewer. Keep the retreat shallow: opacity does the exit.
    posterZ: -260 * span(p, 0, OPENING_END) ** 1.5,
    openingBackgroundOpacity: 1 - span(p, 0, .20),
    openingVoidOpacity: 1 - ease(span(p, .12, ARRIVAL_END)),
    posterOpacity: 1 - ease(span(p, .05, OPENING_END)),
    portfolioOpacity: arrival,
    // Translate the entire avatar/card wrapper from beyond the right edge.
    // It stays opaque; the viewport reveals it spatially instead of a fade-in.
    arrivalX: 1 - arrival,
    arrivalZ: -320 * (1 - arrival),
    arrivalY: 24 * (1 - arrival),
    backgroundY: -p * 100,
  };
}
export const STRIPS = 28;
export const chapterStops = [0, 0.24, 0.53, 0.96];
const HALF_ARC = Math.PI / 4;

// Top view: position follows one circle, and the card is tangent to that
// circle. A shared angle prevents the old "slide + independent tilt" motion.
export function cardArc(progress: number, halfSpan: number) {
  const angle = HALF_ARC * (1 - 2 * clamp(progress));
  return circleAt(angle, halfSpan);
}

function circleAt(angle: number, halfSpan: number) {
  const radius = halfSpan / Math.sin(HALF_ARC);
  return {
    x: radius * Math.sin(angle),
    z: radius * (Math.cos(HALF_ARC) - Math.cos(angle)),
    rotationY: -angle * 180 / Math.PI,
  };
}

// Absolute progress keeps every pose reversible, even after a fast scroll jump.
export function sceneAt(p: number, width: number, height: number, mobile = false) {
  const orbit = ease(span(p, 0, 0.25));
  // Continue counter-clockwise around the LEFT of the same circle. The
  // editor is the reverse face, visible only after the plane passes edge-on.
  const turn = ease(span(p, 0.30, 0.50));
  const angle = HALF_ARC * (1 - 2 * orbit) - (Math.PI - HALF_ARC) * turn;
  const arc = circleAt(angle, width * (mobile ? .11 : .235));
  // Shift the framing during the continuation so the turnaround happens
  // fully beyond the left edge. Both faces still share the same orbit.
  const framingOffset = width * 1.05 * Math.sin(Math.PI * turn);
  const x = arc.x - framingOffset;
  const perspective = Math.max(1200, width * 1.6);
  // Compensate the near-camera enlargement so the final film stays readable
  // inside the viewport. This never changes the circular x/z trajectory.
  const scale = 1 - Math.max(0, arc.z) / perspective;
  const initialY = height * (mobile ? .12 + orbit * .06 : -.015 + orbit * .12);
  const finalY = height * (mobile ? -.03 : .06);
  const portraitCenterOffset = mobile ? height * .09 : 0;
  const y = (initialY + (finalY - initialY) * turn + portraitCenterOffset) * scale;
  const reveal = ease(span(p, 0.73, 0.98));
  return {
    framingOffset,
    portrait: {
      x,
      y: y - portraitCenterOffset,
      z: arc.z,
      rotationY: arc.rotationY,
      rotationZ: 0,
      scale,
      opacity: arc.rotationY <= 90 ? 1 : 0,
    },
    intro: 1 - ease(span(p, 0.055, 0.15)),
    approach: ease(span(p, 0.17, 0.23)) * (1 - ease(span(p, 0.30, 0.37))),
    editor: {
      x,
      y: y - height * .06,
      z: arc.z,
      rotationY: arc.rotationY - 180,
      rotationZ: 0,
      scale,
      opacity: arc.rotationY > 90 ? 1 : 0,
    },
    project: {
      scale: 0.62 + reveal * 0.38,
      opacity: ease(span(p, 0.68, 0.82)),
      y: (1 - reveal) * 40,
    },
    chapter: p < 0.16 ? 0 : p < 0.38 ? 1 : p < 0.79 ? 2 : 3,
  };
}
