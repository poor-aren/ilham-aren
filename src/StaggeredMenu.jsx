import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import './StaggeredMenu.css';

export default function StaggeredMenu({
  items = [],
  colors = ['#1b1b1b', '#101018'],
  panelBg = '#101018',
  panelFg = '#F0E3D2',
  accent = '#E7B996',
  btnColor = '#1b1b1b',
  onSelect
}) {
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);
  const panelRef = useRef(null);
  const preRef = useRef(null);
  const preEls = useRef([]);
  const plusHRef = useRef(null);
  const plusVRef = useRef(null);
  const iconRef = useRef(null);
  const textInnerRef = useRef(null);
  const toggleRef = useRef(null);
  const tlRef = useRef(null);
  const closeRef = useRef(null);
  const busy = useRef(false);
  const [lines, setLines] = useState(['Menu', 'Close']);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const panel = panelRef.current, pre = preRef.current;
      if (!panel || !pre) return;
      preEls.current = Array.from(pre.querySelectorAll('.sm-prelayer'));
      gsap.set([panel, ...preEls.current], { xPercent: 100 });
      gsap.set(pre, { xPercent: 0, opacity: 1 });
      gsap.set(plusHRef.current, { transformOrigin: '50% 50%', rotate: 0 });
      gsap.set(plusVRef.current, { transformOrigin: '50% 50%', rotate: 90 });
      gsap.set(iconRef.current, { rotate: 0, transformOrigin: '50% 50%' });
      gsap.set(textInnerRef.current, { yPercent: 0 });
    });
    return () => ctx.revert();
  }, []);

  const buildOpen = useCallback(() => {
    const panel = panelRef.current;
    const layers = preEls.current;
    if (!panel) return null;
    tlRef.current?.kill();
    closeRef.current?.kill();

    const itemEls = Array.from(panel.querySelectorAll('.sm-item-label'));
    const numEls = Array.from(panel.querySelectorAll('.sm-list[data-numbering] .sm-item'));

    gsap.set(itemEls, { yPercent: 140, rotate: 8, filter: 'blur(6px)', opacity: 0 });
    gsap.set(numEls, { '--sm-num-opacity': 0 });

    const tl = gsap.timeline({ paused: true });
    layers.forEach((el, i) => {
      tl.fromTo(el, { xPercent: 100 }, { xPercent: 0, duration: 0.52, ease: 'power4.out' }, i * 0.08);
    });
    const insert = (layers.length ? (layers.length - 1) * 0.08 + 0.09 : 0);
    tl.fromTo(panel, { xPercent: 100 }, { xPercent: 0, duration: 0.68, ease: 'power4.out' }, insert);

    tl.to(itemEls, {
      yPercent: 0, rotate: 0, opacity: 1, filter: 'blur(0px)',
      duration: 0.9, ease: 'power4.out', stagger: { each: 0.09 }
    }, insert + 0.12);
    tl.to(numEls, {
      duration: 0.6, ease: 'power2.out', '--sm-num-opacity': 1, stagger: { each: 0.07 }
    }, insert + 0.22);

    tlRef.current = tl;
    return tl;
  }, []);

  const playOpen = useCallback(() => {
    if (busy.current) return;
    busy.current = true;
    const tl = buildOpen();
    if (tl) { tl.eventCallback('onComplete', () => { busy.current = false; }); tl.play(0); }
    else busy.current = false;
  }, [buildOpen]);

  const playClose = useCallback(() => {
    tlRef.current?.kill();
    tlRef.current = null;
    const panel = panelRef.current;
    if (!panel) return;
    closeRef.current?.kill();
    closeRef.current = gsap.to([...preEls.current, panel], {
      xPercent: 100, duration: 0.34, ease: 'power3.in', overwrite: 'auto',
      onComplete: () => { busy.current = false; }
    });
  }, []);

  const animIcon = useCallback(o => {
    gsap.to(iconRef.current, o
      ? { rotate: 225, duration: 0.8, ease: 'power4.out', overwrite: 'auto' }
      : { rotate: 0, duration: 0.35, ease: 'power3.inOut', overwrite: 'auto' });
  }, []);

  const animText = useCallback(o => {
    const inner = textInnerRef.current;
    if (!inner) return;
    const from = o ? 'Menu' : 'Close';
    const to = o ? 'Close' : 'Menu';
    const seq = [from];
    let last = from;
    for (let i = 0; i < 3; i++) { last = last === 'Menu' ? 'Close' : 'Menu'; seq.push(last); }
    if (last !== to) seq.push(to);
    seq.push(to);
    setLines(seq);
    gsap.set(inner, { yPercent: 0 });
    gsap.to(inner, { yPercent: -((seq.length - 1) / seq.length) * 100, duration: 0.5 + seq.length * 0.07, ease: 'power4.out' });
  }, []);

  const toggle = useCallback(() => {
    const t = !openRef.current;
    openRef.current = t;
    setOpen(t);
    t ? playOpen() : playClose();
    animIcon(t); animText(t);
  }, [playOpen, playClose, animIcon, animText]);

  const close = useCallback(() => {
    if (!openRef.current) return;
    openRef.current = false;
    setOpen(false);
    playClose(); animIcon(false); animText(false);
  }, [playClose, animIcon, animText]);

  const pick = (e, it) => {
    e.preventDefault();
    close();
    setTimeout(() => onSelect && onSelect(it.key), 280);
  };

  return (
    <div className="sm-wrap" data-open={open || undefined} style={{ '--sm-accent': accent }}>
      <div ref={preRef} className="sm-prelayers" aria-hidden="true">
        {colors.slice(0, 3).map((c, i) => (
          <div key={i} className="sm-prelayer" style={{ background: c }} />
        ))}
      </div>

      <button
        ref={toggleRef}
        className="sm-toggle"
        style={{ color: open ? panelFg : btnColor }}
        aria-label={open ? 'Tutup menu' : 'Buka menu'}
        onClick={toggle}
        type="button"
      >
        <span className="sm-toggle-wrap" aria-hidden="true">
          <span ref={textInnerRef} className="sm-toggle-inner">
            {lines.map((l, i) => <span className="sm-toggle-line" key={i}>{l}</span>)}
          </span>
        </span>
        <span ref={iconRef} className="sm-icon" aria-hidden="true">
          <span ref={plusHRef} className="sm-icon-line" />
          <span ref={plusVRef} className="sm-icon-line" />
        </span>
      </button>

      <aside
        ref={panelRef}
        className="sm-panel"
        style={{ background: panelBg, color: panelFg }}
        aria-hidden={!open}
      >
        <ul className="sm-list" data-numbering role="list">
          {items.map((it, i) => (
            <li className="sm-item-wrap" key={it.key}>
              <a className="sm-item" href={'#' + it.key} data-index={i + 1} onClick={e => pick(e, it)}>
                <span className="sm-item-label">{it.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
