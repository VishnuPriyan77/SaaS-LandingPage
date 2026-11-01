import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown, ArrowUp, ArrowUpRight, Check, Copy, EnvelopeSimple, LinkedinLogo, List, Play, X } from '@phosphor-icons/react';
import '@fontsource-variable/manrope';
import { INTRO_END, range, studioAt } from './studio';
import { EMAIL, enquiryDraft } from './enquiry';
import { approachAt } from './approach-motion';

gsap.registerPlugin(ScrollTrigger);
const A = '/assets/redesign-v1/';
type Modal = 'menu' | 'contact' | 'ofacto' | 'reel' | null;
const approach = [
  { title: 'Understand', file: 'approach-understand', copy: 'It starts with your product and the people it’s for. Together, we identify the core idea, the problem it solves and what the viewer should understand by the end.', alt: 'Several product ideas converge into one clear red focal point on a glass frame.' },
  { title: 'Shape', file: 'approach-shape', copy: 'I build the story through script, storyboard and visual direction. We decide what to show, what to say and how each moment leads to the next.', alt: 'Three story frames progress from a wireframe sketch to a finished composition.' },
  { title: 'Bring to life', file: 'approach-bring-to-life-v2', copy: 'Animation, editing, music and sound bring the story together. I refine the pacing and details so the finished film feels clear, cohesive and true to your product.', alt: 'A red cube follows a looping motion path with keyframes and ghosted rotation poses.' },
];
const services = [
  { title: 'Explainers', type: 'VIDEO FORMAT', file: 'capability-explainers.webp', copy: 'Make the core idea easy to follow. I turn SaaS features and product concepts into a visual story that explains what your product does and why it matters to the viewer.', alt: 'A product idea becomes clear through three connected glass story frames.' },
  { title: 'Product demos', type: 'VIDEO FORMAT', file: 'capability-product-demos.jpg', wide: true, credit: 'FROM THE OFACTO LABS LAUNCH FILM', copy: 'Show the product in use. A focused walkthrough connects interface, action and outcome, helping viewers understand a workflow and how it could fit into their day.', alt: 'Project VEX landlord dashboard shown in the Ofacto Labs launch film.' },
  { title: 'Launch films', type: 'VIDEO FORMAT', file: 'capability-launch-films.jpg', wide: true, credit: 'OFACTO LABS / CLIENT FILM', copy: 'Give your product a considered introduction. I bring the idea, key features and visual identity into a film that sets the scene for launch day.', alt: 'The VEX 0.5 product reveal from the Ofacto Labs launch film.' },
  { title: 'Promotional videos', type: 'VIDEO FORMAT', file: 'capability-promotional-videos.jpg', wide: true, credit: 'PERSONAL MOTION SHOWCASE', copy: 'Put one message in focus. A promotional film brings your product, campaign or announcement into a short visual story shaped for its audience and context.', alt: 'A glasslike purple and blue mascot from the self-initiated motion showcase.' },
  { title: 'Script & storyboard', type: 'PRODUCTION', file: 'capability-script-storyboard.webp', copy: 'Give the film a clear direction before animation begins. I help shape the message and map it into scenes, or build from a script you already have.', alt: 'A sequence of graphite storyboard cards with sketches and a red pencil.' },
  { title: 'Animation & sound', type: 'PRODUCTION', file: 'capability-animation-sound.webp', copy: 'Bring the planned story to the screen. Animation, editing, music and sound are considered together, giving the film its pace, character and final polish.', alt: 'A sound waveform and an animation path aligned with a red playhead.' },
];
function TextLink({ children, onClick, primary = false }: { children: React.ReactNode; onClick: () => void; primary?: boolean }) {
  return <button className={`text-link ${primary ? 'btn-primary' : 'btn-ghost'}`} onClick={onClick}><span>{children}</span><ArrowUpRight size={16} /></button>;
}

function Opening({ reduced, onContact }: { reduced: boolean; onContact: () => void }) {
  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const [replay, setReplay] = useState(0);
  useLayoutEffect(() => {
    if (reduced) return;
    const section = root.current!, film = video.current;
    if (!film) return;
    const node = (selector: string) => section.querySelector<HTMLElement>(selector)!;
    const intro = node('.hero-intro'), promise = node('.promise'), shade = node('.film-shade'), portal = node('.approach-portal'), portalCopy = node('.portal-copy'), cue = node('.hero-bottom');
    let done = false, disposed = false, progress = 0, desired = INTRO_END, frameRequest = 0;
    const seek = () => {
      if (disposed || film.readyState < 1 || film.seeking) return;
      if (Math.abs(film.currentTime - desired) > .01) film.currentTime = desired;
    };
    const render = (p: number) => {
      if (disposed) return;
      progress = p; section.dataset.progress = p.toFixed(4);
      const pose = studioAt(p, film.duration || 15.041667);
      film.style.transform = `translateY(${pose.videoOffset}svh)`;
      if (p > .001 || done) {
        done = true; film.pause();
        desired = pose.videoTime; seek();
      }
      section.dataset.videoTarget = desired.toFixed(4);
      intro.style.opacity = String((done ? 1 : 0) * pose.introOpacity);
      intro.style.transform = `translateY(${-range(p, 0, .28) * 35}px)`;
      intro.style.visibility = p > .3 ? 'hidden' : 'visible';
      intro.inert = !done || pose.introOpacity < .95;
      promise.style.opacity = String(pose.promiseOpacity);
      promise.style.visibility = p > .35 && p < .82 ? 'visible' : 'hidden';
      shade.style.opacity = String(pose.shade);
      portal.style.visibility = pose.portalVisible ? 'visible' : 'hidden';
      portal.style.clipPath = `inset(${pose.portalInsetY}% ${pose.portalInsetX}%)`;
      portalCopy.style.opacity = String(pose.portalCopy);
      portalCopy.style.pointerEvents = pose.portalInteractive ? 'auto' : 'none';
      portalCopy.inert = !pose.portalInteractive;
      cue.style.opacity = String(1 - range(p, .15, .24)); cue.style.visibility = p > .25 ? 'hidden' : 'visible';
    };
    const stopIntro = () => { if (done || disposed) return; done = true; film.pause(); desired = INTRO_END; seek(); render(progress); };
    const watchIntro = () => { if (disposed || done) return; if (film.currentTime >= INTRO_END) { stopIntro(); return; } frameRequest = requestAnimationFrame(watchIntro); };
    const start = () => {
      if (disposed) return;
      if (progress > .001 || window.scrollY > section.offsetTop + 12) { done = true; render(progress); return; }
      film.currentTime = 0; film.play().then(() => { frameRequest = requestAnimationFrame(watchIntro); }).catch(stopIntro);
    };
    const error = () => { setFailed(true); done = true; render(progress); };
    film.addEventListener('loadedmetadata', start); film.addEventListener('seeked', seek); film.addEventListener('error', error);
    const playhead = { p: 0 };
    const tween = gsap.to(playhead, { p: 1, ease: 'none', onUpdate: () => render(playhead.p), scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: .8, invalidateOnRefresh: true } });
    render(0); if (film.readyState >= 1) start();
    return () => {
      disposed = true; cancelAnimationFrame(frameRequest); film.pause();
      film.removeEventListener('loadedmetadata', start); film.removeEventListener('seeked', seek); film.removeEventListener('error', error);
      tween.scrollTrigger?.kill(); tween.kill();
      intro.inert = false; portalCopy.inert = false;
      for (const el of [intro, promise, shade, portal, portalCopy, cue]) { el.style.opacity = ''; el.style.visibility = ''; el.style.transform = ''; el.style.clipPath = ''; el.style.pointerEvents = ''; }
    };
  }, [reduced, replay]);
  return <section className={`hero-runway ${reduced ? 'static-story' : ''}`} ref={root} aria-label="Introduction and creative approach">
    <div className="hero-stage">
      {reduced || failed ? <img className="hero-film" src={`${A}studio-settled.webp`} alt="Three glass displays in a dark studio, with a red composition at the centre." /> : <video ref={video} className="hero-film" src={`${A}opening-studio.mp4`} poster={`${A}opening-poster.webp`} muted playsInline preload="auto" aria-label="Cinematic introduction moving toward the central glass display" />}
      <div className="film-shade" aria-hidden="true" />
      <div className="hero-intro"><h1>For founders<br />with something<br />worth explaining.</h1><div className="hero-description"><p>SaaS explainers, product demos and launch films,<br className="desktop-break" /> shaped around your product and the people who need it.</p><button className="btn-primary hero-contact" onClick={onContact}>Tell me about your project <ArrowUpRight size={17} /></button></div></div>
      <div className="hero-bottom"><a className="micro scroll-cue" href="#approach" onClick={e => { e.preventDefault(); const el = root.current!; window.scrollTo({ top: reduced ? el.offsetTop + el.offsetHeight : el.offsetTop + (el.offsetHeight - innerHeight) * .45, behavior: reduced ? 'auto' : 'smooth' }); }}><ArrowDown size={15} /> Scroll to explore</a>{!reduced && <button className="micro replay-intro" onClick={() => { window.scrollTo({ top: 0, behavior: 'auto' }); setReplay(n => n + 1); }}><Play size={11} /> Replay intro</button>}<span className="micro hero-index">01 — Introduction</span></div>
      <div className="promise"><span className="micro">THE IDEA BEHIND THE WORK</span><h2>I find the story<br />in your product.<br /><span>Then bring it to life.</span></h2></div>
      <div className="approach-portal"><img src={`${A}approach-reveal.webp`} alt="A sequence of glass story frames progresses from an initial sketch to a finished design." /><div className="portal-shade" /><div className="portal-copy"><div><p className="micro">01 / THE APPROACH</p><h2>How I shape<br />your story.</h2></div><div className="portal-summary"><p>I begin with what your product does, who it helps and what they need to understand. That gives every scene a reason to be there.</p><TextLink primary onClick={onContact}>Tell me about your project</TextLink></div><div className="practice-ribbon micro">SaaS explainers <span>Product demos</span><span>Launch films</span><span>Promotional videos</span></div></div></div>
    </div>
  </section>;
}

function Approach({ reduced, onContact }: { reduced: boolean; onContact: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (reduced) return;
    const section = root.current!;
    const backgrounds = [...section.querySelectorAll<HTMLElement>('.chapter-backdrop')];
    const images = [...section.querySelectorAll<HTMLElement>('.chapter-image-layer')];
    const copies = [...section.querySelectorAll<HTMLElement>('.chapter-motion-copy')];
    const render = (p: number) => {
      section.dataset.progress = p.toFixed(4);
      approachAt(p).forEach((pose, i) => {
        backgrounds[i].style.opacity = String(pose.backgroundOpacity);
        images[i].style.transform = `scale(${pose.imageScale})`;
        images[i].style.visibility = pose.imageVisible ? 'visible' : 'hidden';
        copies[i].style.transform = `translateY(${pose.copyY}svh)`;
        copies[i].style.opacity = String(pose.copyOpacity);
        copies[i].style.visibility = pose.copyOpacity > .001 ? 'visible' : 'hidden';
        copies[i].inert = !pose.active;
        copies[i].setAttribute('aria-hidden', String(!pose.active));
      });
    };
    const playhead = { p: 0 };
    const tween = gsap.to(playhead, { p: 1, ease: 'none', onUpdate: () => render(playhead.p), scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: .65, invalidateOnRefresh: true } });
    render(0);
    return () => { tween.scrollTrigger?.kill(); tween.kill(); };
  }, [reduced]);
  if (reduced) return <div id="approach" className="approach-chapters">{approach.map((item, i) => <section className="approach-chapter" key={item.title} aria-labelledby={`approach-${i}`}><img className="approach-background" src={`${A}${item.file}.webp`} alt="" loading="lazy" /><div className="chapter-inner"><figure className="approach-foreground"><img src={`${A}${item.file}.webp`} alt={item.alt} loading="lazy" /></figure><div className="chapter-copy"><p className="micro chapter-number">0{i + 1} / 03</p><h3 id={`approach-${i}`}>{item.title}</h3><p>{item.copy}</p><TextLink primary onClick={onContact}>Talk through your idea</TextLink></div></div></section>)}</div>;
  return <div id="approach" className="approach-motion" ref={root} aria-label="How I approach your project">
    <div className="approach-stage">
      <div className="chapter-backdrops" aria-hidden="true">{approach.map(item => <img className="chapter-backdrop" key={item.file} src={`${A}${item.file}.webp`} alt="" />)}</div>
      <div className="chapter-inner motion-chapter-inner">
        <div className="chapter-image-stack">{approach.map(item => <figure className="chapter-image-layer" key={item.file}><img src={`${A}${item.file}.webp`} alt={item.alt} /></figure>)}</div>
        <div className="chapter-copy-stack">{approach.map((item, i) => <section className="chapter-copy chapter-motion-copy" key={item.title} aria-labelledby={`approach-${i}`}><p className="micro chapter-number">0{i + 1} / 03</p><h3 id={`approach-${i}`}>{item.title}</h3><p>{item.copy}</p><TextLink primary onClick={onContact}>Talk through your idea</TextLink></section>)}</div>
      </div>
    </div>
  </div>;
}

export function App() {
  const root = useRef<HTMLDivElement>(null), dialog = useRef<HTMLDialogElement>(null), filmRef = useRef<HTMLVideoElement>(null), lastFocus = useRef<HTMLElement | null>(null);
  const [modal, setModal] = useState<Modal>(null);
  const [systemReduced, setSystemReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches || new URLSearchParams(location.search).get('motion') === 'reduce');
  const [motionOff, setMotionOff] = useState(false), [copied, setCopied] = useState(false), [emailReady, setEmailReady] = useState(false);
  const reduced = systemReduced || motionOff, isFilm = modal === 'ofacto' || modal === 'reel';
  useEffect(() => { const query = matchMedia('(prefers-reduced-motion: reduce)'); const listener = () => setSystemReduced(query.matches || new URLSearchParams(location.search).get('motion') === 'reduce'); query.addEventListener('change', listener); return () => query.removeEventListener('change', listener); }, []);
  useLayoutEffect(() => {
    const context = gsap.context(() => {
      if (!reduced) {
        gsap.utils.toArray<HTMLElement>('.reveal-copy').forEach(el => gsap.fromTo(el, { y: 45, opacity: .15 }, { y: 0, opacity: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 90%', end: 'top 58%', scrub: .5 } }));
        gsap.utils.toArray<HTMLElement>('.craft-words span').forEach((el, i) => gsap.fromTo(el, { opacity: .22 }, { opacity: 1, ease: 'none', scrollTrigger: { trigger: '.craft-section', start: `top ${70 - i * 14}%`, end: `top ${38 - i * 14}%`, scrub: .5 } }));
        gsap.fromTo('.bridge-art', { scale: .75, y: 70 }, { scale: 1, y: -30, ease: 'none', scrollTrigger: { trigger: '.bridge', start: 'top bottom', end: 'bottom top', scrub: .8 } });
      }
      gsap.to('.page-progress-fill', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: reduced ? true : .2 } });
    }, root);
    document.fonts.ready.then(() => ScrollTrigger.refresh()); return () => context.revert();
  }, [reduced]);
  useEffect(() => { if (!modal) return; lastFocus.current = document.activeElement as HTMLElement; const previous = document.body.style.overflow; document.body.style.overflow = 'hidden'; dialog.current?.showModal(); return () => { document.body.style.overflow = previous; dialog.current?.close(); lastFocus.current?.focus(); }; }, [modal]);
  const close = () => { filmRef.current?.pause(); setModal(null); setEmailReady(false); setCopied(false); };
  const contact = () => { setEmailReady(false); setModal('contact'); };
  const navigate = (id: string) => { close(); requestAnimationFrame(() => { if (id === 'top') window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }); else if (id === 'approach' && !reduced) { const hero = document.querySelector<HTMLElement>('.hero-runway')!; window.scrollTo({ top: hero.offsetTop + (hero.offsetHeight - innerHeight) * .995, behavior: 'smooth' }); } else document.getElementById(id)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' }); }); };
  return <div ref={root} className={`motion-site ${reduced ? 'reduced-motion' : ''}`}>
    <a className="skip-link" href="#work">Skip to selected work</a>
    <header className="site-header"><div className="header-socials"><a href={`mailto:${EMAIL}`} aria-label="Email Vishnu"><EnvelopeSimple size={19} weight="light" /></a><a href="https://www.linkedin.com/in/b-vishnu-priyan/" target="_blank" rel="noreferrer" aria-label="Vishnu Priyan on LinkedIn"><LinkedinLogo size={18} /></a></div><a href="#top" className="wordmark" onClick={e => { e.preventDefault(); navigate('top'); }} aria-label="Vishnu Priyan, back to top">vishnu priyan<span>INDEPENDENT MOTION DESIGNER</span></a><div className="header-actions"><button className="btn-primary nav-contact" onClick={contact}>Start a project <ArrowUpRight size={16} /></button><button className="menu-trigger micro" onClick={() => setModal('menu')} aria-haspopup="dialog" aria-label="Menu"><span className="menu-label">Menu</span><List size={25} weight="light" /></button></div></header>
    <main id="top"><Opening reduced={reduced} onContact={contact} />
      <Approach reduced={reduced} onContact={contact} />
      <section className="craft-section container" id="services"><div className="craft-copy"><p className="micro">02 / WHAT I CAN HELP WITH</p><h2 className="craft-words"><span>A clear story.</span><span>A considered frame.</span><span>A reason for every move.</span></h2><p className="body-copy">I create motion that helps people follow your product’s story. From the first script to the final sound mix, I shape the details around what your audience needs to understand.</p><TextLink primary onClick={contact}>Tell me about your project</TextLink></div><img className="craft-image" src={`${A}craft-detail.webp`} alt="A precise glass corner with a red alignment point, illustrating attention to detail." loading="lazy" /></section>
      <div className="services-list container">{services.map((service, i) => <section className="service-section" key={service.title}><div className="service-copy reveal-copy"><div className="service-topline micro"><span>{service.type}</span><span>0{i + 1} / 06</span></div><h3>{service.title}</h3><p>{service.copy}</p><TextLink onClick={contact}>Discuss your project</TextLink></div><figure className={`service-media ${service.wide ? 'wide-media' : ''}`}><img src={`${A}${service.file}`} alt={service.alt} loading="lazy" />{service.credit && <figcaption className="micro">{service.credit}</figcaption>}</figure></section>)}</div>
      <section className="bridge" aria-label="From complexity to clarity"><p className="micro">THE STORY COMES TOGETHER</p><h2 className="bridge-first">Complexity</h2><img className="bridge-art" src={`${A}approach-reveal.webp`} alt="Story frames develop from an initial wireframe into a resolved red and ivory design." loading="lazy" /><div className="bridge-ending"><h2>Becomes clarity.</h2><p>Product stories shaped through script,<br />design, motion and sound.</p></div></section>
      <section className="work-section container" id="work"><div className="section-heading"><p className="micro">03 / SELECTED WORK</p><span className="micro">A CLIENT FILM. A PERSONAL EXPLORATION.</span></div><article className="work-feature ofacto"><img src={`${A}work-ofacto.jpg`} alt="Ofacto Labs VEX 0.5 product reveal." loading="lazy" /><div className="work-caption"><p className="micro">CLIENT WORK / PILOT PROGRAMME LAUNCH</p><h2>Ofacto Labs</h2><p>A client launch film, from script and storyboard through<br className="desktop-break" /> animation, editing, music and sound.</p><button className="outline-button btn-ghost" onClick={() => setModal('ofacto')}><Play size={13} weight="fill" /> Watch the launch film <span>01:04</span></button></div></article><article className="work-feature personal"><img src={`${A}work-personal-showcase-v2.jpg`} alt="Purple glasslike mascot from Vishnu’s personal SaaS motion showcase." loading="lazy" /><div className="work-caption"><p className="micro">SELF-INITIATED WORK / PERSONAL MOTION SHOWCASE</p><h2>Your story in motion</h2><p>An exploration of SaaS storytelling,<br className="desktop-break" /> interface animation and visual rhythm.</p><button className="outline-button btn-ghost" onClick={() => setModal('reel')}><Play size={13} weight="fill" /> Watch the showcase <span>00:35</span></button><small>Silent preview</small></div></article></section>
      <section className="closing" id="contact"><img src={`${A}studio-settled.webp`} alt="The three glass displays return in the dark motion studio." loading="lazy" /><div className="closing-copy"><p className="micro">HAVE A PRODUCT IN MIND?</p><h2>Let’s make it<br />understood.</h2><button className="outline-button btn-primary" onClick={contact}>Tell me about your project <ArrowUpRight size={17} /></button></div></section>
    </main>
    <footer className="site-footer container"><div className="footer-top"><a className="footer-name" href="#top" onClick={e => { e.preventDefault(); navigate('top'); }}>vishnu priyan</a><p>Independent motion designer.<br />From script to final frame.</p><button className="back-top micro" onClick={() => navigate('top')}>Back to top <ArrowUp size={16} /></button></div><div className="footer-bottom"><a href={`mailto:${EMAIL}`}>{EMAIL} <ArrowUpRight size={13} /></a><div className="footer-links"><a href="https://www.linkedin.com/in/b-vishnu-priyan/" target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight size={12} /></a><a href="https://www.fiverr.com/vishnu_priyan_b/" target="_blank" rel="noreferrer">Fiverr <ArrowUpRight size={12} /></a></div><span>© {new Date().getFullYear()} Vishnu Priyan</span></div></footer>
    <div className="page-progress" aria-hidden="true"><div className="page-progress-fill" /></div>
    <dialog ref={dialog} className={`site-dialog ${modal === 'menu' ? 'menu-dialog' : ''} ${isFilm ? 'film-dialog' : ''}`} aria-label={modal === 'menu' ? 'Explore the site' : isFilm ? 'Motion film player' : 'Project enquiry'} onCancel={e => { e.preventDefault(); close(); }} onClick={e => { if (e.target === e.currentTarget && modal !== 'menu') close(); }}><button className="dialog-close" onClick={close} aria-label="Close dialog"><X size={23} weight="light" /></button>
      {modal === 'menu' ? <div className="menu-content"><p className="micro">VISHNU PRIYAN / INDEPENDENT MOTION</p><nav aria-label="Main navigation">{[['01', 'Introduction', 'top'], ['02', 'Approach', 'approach'], ['03', 'Services', 'services'], ['04', 'Selected work', 'work']].map(([n, label, id]) => <a href={`#${id}`} onClick={e => { e.preventDefault(); navigate(id); }} key={id}><span className="micro">{n}</span>{label}<ArrowUpRight size={30} weight="light" /></a>)}<button onClick={contact}><span className="micro">05</span>Let’s talk<ArrowUpRight size={30} weight="light" /></button></nav><div className="menu-bottom"><a href={`mailto:${EMAIL}`}>{EMAIL}</a><button className="micro motion-control" onClick={() => { window.scrollTo({ top: 0, behavior: 'auto' }); setMotionOff(v => !v); }} disabled={systemReduced}>{systemReduced ? 'Reduced motion enabled' : reduced ? 'Motion off — enable' : 'Motion on — disable'}</button></div></div> : isFilm ? <div className="film-content"><div className="film-title"><span>{modal === 'ofacto' ? 'Ofacto Labs — Pilot programme launch' : 'Your story in motion — Personal showcase'}</span><span className="micro">{modal === 'ofacto' ? 'CLIENT FILM' : 'SELF-INITIATED WORK'}</span></div><video ref={filmRef} src={`/assets/${modal === 'ofacto' ? 'ofacto-launch.mp4' : 'reel.mp4'}`} controls playsInline autoPlay preload="metadata" /><p className="film-note">{modal === 'ofacto' ? 'Script, storyboard, animation, editing, music and sound by Vishnu Priyan.' : 'Personal motion showcase. This draft export is unfinished and silent.'}</p></div> : modal === 'contact' ? <div className="enquiry-content"><p className="micro">A GOOD PROJECT STARTS WITH A CONVERSATION</p><h2>Tell me about<br />your project.</h2><p className="enquiry-intro">Share what you’re building, who it’s for and what you’d like the video to explain.</p><form onSubmit={e => { e.preventDefault(); window.location.href = enquiryDraft(new FormData(e.currentTarget)); setEmailReady(true); }}><div className="form-row"><label>Your name<input name="name" autoComplete="name" placeholder="Name" required /></label><label>Email address<input name="email" type="email" autoComplete="email" placeholder="you@company.com" required /></label></div><label>Product or website <span>(optional)</span><input name="product" placeholder="Your product name or link" /></label><div className="form-row"><label>What do you need?<select name="type" aria-label="What do you need?"><option>Explainer</option><option>Product demo</option><option>Launch film</option><option>Promotional video</option><option>Let’s discuss</option></select></label><label>Deadline / budget <span>(optional)</span><input name="timing" placeholder="A rough idea is fine" /></label></div><label>Project brief<textarea name="brief" rows={3} placeholder="What should your audience understand by the end?" required /></label><button type="submit" className="outline-button btn-primary">Continue in email <ArrowUpRight size={16} /></button><p className="form-note" role="status">{emailReady ? 'Your email app was requested. Send the draft there, or copy my address below.' : 'Opens your email app with these details. Nothing is submitted here.'}</p></form><button className="copy-email" onClick={async () => { try { await navigator.clipboard.writeText(EMAIL); setCopied(true); } catch { setCopied(false); } }}>{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? 'Email address copied' : 'Copy my email address'}</button><a className="direct-email" href={`mailto:${EMAIL}`}>{EMAIL}</a></div> : null}
    </dialog>
  </div>;
}
