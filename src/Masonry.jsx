import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';

import './Masonry.css';

const useMedia = (queries, values, defaultValue) => {
  const get = () => values[queries.findIndex(q => matchMedia(q).matches)] ?? defaultValue;
  const [value, setValue] = useState(get);
  useEffect(() => {
    const handler = () => setValue(get);
    queries.forEach(q => matchMedia(q).addEventListener('change', handler));
    return () => queries.forEach(q => matchMedia(q).removeEventListener('change', handler));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queries]);
  return value;
};

const useMeasure = () => {
  const ref = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, size];
};

const preloadImages = async urls => {
  await Promise.all(urls.map(src => new Promise(resolve => {
    const img = new Image(); img.src = src; img.onload = img.onerror = () => resolve();
  })));
};

const Masonry = ({
  items,
  ease = 'power3.out',
  duration = 0.6,
  stagger = 0.05,
  animateFrom = 'bottom',
  scaleOnHover = true,
  hoverScale = 0.95,
  blurToFocus = true,
  maxColumns = 5,
  onItemClick
}) => {
  const columns = useMedia(
    ['(min-width:1100px)', '(min-width:750px)', '(min-width:500px)'],
    [maxColumns, 3, 2],
    1
  );

  const [containerRef, { width }] = useMeasure();
  const [imagesReady, setImagesReady] = useState(false);

  const getInitialPosition = item => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return { x: item.x, y: item.y };
    let direction = animateFrom;
    if (animateFrom === 'random') {
      const dirs = ['top', 'bottom', 'left', 'right'];
      direction = dirs[Math.floor(Math.random() * dirs.length)];
    }
    switch (direction) {
      case 'top': return { x: item.x, y: -200 };
      case 'bottom': return { x: item.x, y: window.innerHeight + 200 };
      case 'left': return { x: -200, y: item.y };
      case 'right': return { x: window.innerWidth + 200, y: item.y };
      case 'center': return { x: containerRect.width / 2 - item.w / 2, y: containerRect.height / 2 - item.h / 2 };
      default: return { x: item.x, y: item.y + 100 };
    }
  };

  useEffect(() => { preloadImages(items.map(i => i.img)).then(() => setImagesReady(true)); }, [items]);

  const { grid, totalHeight } = useMemo(() => {
    if (!width) return { grid: [], totalHeight: 0 };
    const colHeights = new Array(columns).fill(0);
    const columnWidth = width / columns;
    const g = items.map(child => {
      const col = colHeights.indexOf(Math.min(...colHeights));
      const x = columnWidth * col;
      const height = child.height / 2;
      const y = colHeights[col];
      colHeights[col] += height;
      return { ...child, x, y, w: columnWidth, h: height };
    });
    return { grid: g, totalHeight: Math.max(0, ...colHeights) };
  }, [columns, items, width]);

  const hasMounted = useRef(false);

  useLayoutEffect(() => {
    if (!imagesReady) return;
    grid.forEach((item, index) => {
      const selector = `[data-key="${item.id}"]`;
      const animationProps = { x: item.x, y: item.y, width: item.w, height: item.h };
      if (!hasMounted.current) {
        const initialPos = getInitialPosition(item, index);
        const initialState = {
          opacity: 0, x: initialPos.x, y: initialPos.y, width: item.w, height: item.h,
          ...(blurToFocus && { filter: 'blur(10px)' })
        };
        gsap.fromTo(selector, initialState, {
          opacity: 1, ...animationProps,
          ...(blurToFocus && { filter: 'blur(0px)' }),
          duration: 0.8, ease: 'power3.out', delay: index * stagger
        });
      } else {
        gsap.to(selector, { ...animationProps, duration, ease, overwrite: 'auto' });
      }
    });
    hasMounted.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grid, imagesReady, stagger, animateFrom, blurToFocus, duration, ease]);

  const enter = (e, item) => { if (scaleOnHover) gsap.to(`[data-key="${item.id}"]`, { scale: hoverScale, duration: 0.3, ease: 'power2.out' }); };
  const leave = (e, item) => { if (scaleOnHover) gsap.to(`[data-key="${item.id}"]`, { scale: 1, duration: 0.3, ease: 'power2.out' }); };

  return (
    <div ref={containerRef} className="masonry-list" style={{ height: totalHeight }}>
      {grid.map(item => (
        <div
          key={item.id}
          data-key={item.id}
          className="item-wrapper"
          onClick={() => (onItemClick ? onItemClick(item) : (item.url && window.open(item.url, '_blank', 'noopener')))}
          onMouseEnter={e => enter(e, item)}
          onMouseLeave={e => leave(e, item)}
        >
          <div className="item-img" style={{ backgroundImage: `url(${item.img})` }}>
            {item.title ? <div className="item-cap">{item.title}</div> : null}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Masonry;
