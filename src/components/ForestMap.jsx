import { useEffect, useMemo, useRef } from 'react';
import { buildForestLayout } from '../utils/mapLayout';

const clip = (text, max) => (text.length > max ? `${text.slice(0, max)}…` : text);

function ForestTree({ tree }) {
  return (
    <g transform={`translate(${tree.x}, ${tree.y}) scale(${tree.scale})`}>
      <g className="forest-tree" style={{ animationDelay: `${tree.delay}s` }}>
        <ellipse cx="0" cy="18" rx="18" ry="6" fill="#071712" opacity="0.45" />
        {tree.variant === 'pine' ? (
          <>
            <rect x="-3" y="4" width="6" height="14" rx="2" fill="#4b3423" />
            <polygon points="0,-34 -20,-4 20,-4" fill="#1d5c42" />
            <polygon points="0,-24 -24,6 24,6" fill="#174c36" />
            <polygon points="0,-34 0,-4 20,-4" fill="#256f50" opacity="0.55" />
          </>
        ) : (
          <>
            <rect x="-4" y="2" width="8" height="16" rx="3" fill="#573b26" />
            <circle cx="0" cy="-12" r="19" fill="#1c5c40" />
            <circle cx="-11" cy="-6" r="12" fill="#154b34" />
            <circle cx="11" cy="-7" r="13" fill="#246e4e" />
          </>
        )}
      </g>
    </g>
  );
}

function ForestDefs() {
  return (
    <defs>
      <linearGradient id="forestBg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#0f2922" />
        <stop offset="50%" stopColor="#123528" />
        <stop offset="100%" stopColor="#0d241d" />
      </linearGradient>
      <radialGradient id="summitGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.48" />
        <stop offset="60%" stopColor="#34d399" stopOpacity="0.16" />
        <stop offset="100%" stopColor="#0f2922" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="campGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#fb923c" stopOpacity="0.42" />
        <stop offset="100%" stopColor="#0d241d" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="riverGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#1e6f78" stopOpacity="0.55" />
        <stop offset="100%" stopColor="#0e4f5c" stopOpacity="0.4" />
      </linearGradient>
      <linearGradient id="trailGlow" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stopColor="#34d399" />
        <stop offset="55%" stopColor="#a3e635" />
        <stop offset="100%" stopColor="#fbbf24" />
      </linearGradient>
      <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="5" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
}

export function ForestMap({ plan, activeIndex, onSelectIndex }) {
  const layout = useMemo(() => buildForestLayout(plan.levels.length), [plan.levels.length]);
  const stopRefs = useRef([]);
  const firstRender = useRef(true);

  const isFinished = activeIndex >= plan.levels.length;
  const totalSegments = plan.levels.length + 1;
  const trailProgress = Math.min(
    100,
    ((isFinished ? totalSegments : activeIndex + 1) / totalSegments) * 100,
  );

  // Smoothly scroll the active circle (or Goal) into view when advancing
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    stopRefs.current[activeIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [activeIndex, plan.goal]);

  const creekPath =
    `M -20 ${layout.height * 0.36} ` +
    `C 160 ${layout.height * 0.31}, 240 ${layout.height * 0.43}, 380 ${layout.height * 0.38} ` +
    `S 520 ${layout.height * 0.44}, ${layout.width + 20} ${layout.height * 0.41}`;

  return (
    <div className="forest-stage">
      <svg
        className="forest-svg"
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        role="img"
        aria-label={`Forest map for ${plan.goal}`}
      >
        <ForestDefs />

        {/* Ground, hills, creek, and sunbeams */}
        <rect width={layout.width} height={layout.height} rx="28" fill="url(#forestBg)" />
        <ellipse cx={110} cy={layout.height * 0.24} rx="180" ry="110" fill="#174232" opacity="0.55" />
        <ellipse cx={450} cy={layout.height * 0.52} rx="190" ry="130" fill="#184735" opacity="0.5" />
        <ellipse cx={140} cy={layout.height * 0.78} rx="200" ry="120" fill="#153d2e" opacity="0.55" />
        <ellipse cx={layout.end.x} cy={layout.end.y} rx="165" ry="90" fill="url(#summitGlow)" />
        <ellipse cx={layout.start.x} cy={layout.start.y} rx="140" ry="80" fill="url(#campGlow)" />

        <path d={creekPath} fill="none" stroke="url(#riverGrad)" strokeWidth="28" strokeLinecap="round" />
        <path className="river-shimmer" d={creekPath} fill="none" stroke="#7dd3fc" strokeOpacity="0.32" strokeWidth="4" strokeDasharray="16 26" strokeLinecap="round" />

        <polygon points="90,0 220,0 130,480 30,480" fill="#fde68a" opacity="0.04" />
        <polygon points="340,0 470,0 380,520 270,520" fill="#fde68a" opacity="0.035" />

        {layout.trees.map((tree, idx) => (
          <ForestTree key={idx} tree={tree} />
        ))}

        {/* Wide trail + glowing progress */}
        <path d={layout.fullPathD} fill="none" stroke="#06140f" strokeWidth="52" strokeLinecap="round" opacity="0.6" />
        <path d={layout.fullPathD} fill="none" stroke="#5c4632" strokeWidth="36" strokeLinecap="round" />
        <path d={layout.fullPathD} fill="none" stroke="#a88b68" strokeWidth="16" strokeLinecap="round" strokeDasharray="2 22" opacity="0.85" />
        <path className="trail-progress" d={layout.fullPathD} fill="none" stroke="url(#trailGlow)" strokeWidth="15" strokeLinecap="round" pathLength={100} strokeDasharray="100" strokeDashoffset={100 - trailProgress} filter="url(#softGlow)" />
        <path className="trail-progress" d={layout.fullPathD} fill="none" stroke="#fef9c3" strokeWidth="4.5" strokeLinecap="round" pathLength={100} strokeDasharray="100" strokeDashoffset={100 - trailProgress} opacity="0.85" />

        {/* Start camp */}
        <g transform={`translate(${layout.start.x}, ${layout.start.y})`}>
          <circle r="44" fill="#173d2e" stroke="#4ade80" strokeWidth="3.5" strokeDasharray="7 6" />
          <path d="M -12 13 L 12 18 M -12 18 L 12 13" stroke="#784421" strokeWidth="4.5" strokeLinecap="round" />
          <path className="campfire-flame" d="M 0 -14 C 11 -3, 13 8, 0 15 C -13 8, -11 -3, 0 -14 Z" fill="#fb923c" />
          <path className="campfire-flame" d="M 0 -5 C 6 1, 7 8, 0 12 C -7 8, -6 1, 0 -5 Z" fill="#fde047" />
          <g transform="translate(0, 62)">
            <rect x="-58" y="-16" width="116" height="32" rx="16" fill="#0d261e" stroke="#4ade80" strokeWidth="2" />
            <text textAnchor="middle" y="5" className="badge-text badge-text--start">START</text>
          </g>
        </g>

        {/* Goal summit */}
        <g
          ref={(el) => { stopRefs.current[plan.levels.length] = el; }}
          transform={`translate(${layout.end.x}, ${layout.end.y})`}
          className={`goal-node ${isFinished ? 'is-finished' : ''}`}
          onClick={() => onSelectIndex(plan.levels.length)}
          role="button"
          aria-label={`Goal: ${plan.goal}`}
        >
          <g className="node-circle-group">
            <circle r="56" fill="none" stroke="#fbbf24" strokeWidth="3" opacity={isFinished ? 0.95 : 0.6} className="beacon-ring" />
            <circle r="44" fill={isFinished ? '#f59e0b' : '#1e3a2b'} stroke={isFinished ? '#fef08a' : '#fbbf24'} strokeWidth={isFinished ? 5 : 4} filter="url(#softGlow)" />
            <path d="M -16 13 L -19 -9 L -5 1 L 0 -15 L 5 1 L 19 -9 L 16 13 Z" fill={isFinished ? '#052e16' : '#fbbf24'} />
          </g>
          <g transform="translate(0, -68)">
            <rect x="-142" y="-18" width="284" height="36" rx="18" fill="#1b2e24" stroke="#fbbf24" strokeWidth="2" />
            <text textAnchor="middle" y="6" className="badge-text badge-text--end">★ GOAL: {clip(plan.goal, 20)}</text>
          </g>
        </g>

        {/* Level circles */}
        {plan.levels.map((level, idx) => {
          const point = layout.levelPoints[idx];
          if (!point) return null;

          const isActive = idx === activeIndex;
          const isPassed = idx < activeIndex;
          const onRight = point.x < layout.width / 2;
          const labelX = onRight ? 58 : -308;
          const textX = onRight ? 74 : -292;

          return (
            <g
              key={level.levelNumber}
              ref={(el) => { stopRefs.current[idx] = el; }}
              transform={`translate(${point.x}, ${point.y})`}
              className={`level-node ${isActive ? 'is-active' : ''} ${isPassed ? 'is-passed' : ''}`}
              onClick={() => onSelectIndex(idx)}
              role="button"
              aria-label={`Level ${level.levelNumber}: ${level.title}`}
            >
              <g className="node-circle-group">
                {isActive && <circle r="50" fill="none" stroke="#fbbf24" strokeWidth="3.5" className="beacon-ring" />}
                <ellipse cx="0" cy="36" rx="34" ry="10" fill="#06140f" opacity="0.6" />
                <circle cy="6" r="38" fill={isActive ? '#92400e' : isPassed ? '#065f46' : '#1b2c26'} />
                <circle
                  r="38"
                  fill={isActive ? '#f59e0b' : isPassed ? '#10b981' : '#263f35'}
                  stroke={isActive ? '#fef08a' : isPassed ? '#a7f3d0' : '#6ee7b7'}
                  strokeWidth={isActive ? 4.5 : 3}
                  filter={isActive ? 'url(#softGlow)' : undefined}
                />
                <text textAnchor="middle" y="9" className="node-num">{level.levelNumber}</text>
              </g>
              <rect x={labelX} y="-30" width="250" height="60" rx="15" className="node-card" />
              <text x={textX} y="-6" className="node-card-kicker">LEVEL {level.levelNumber} · {level.duration}</text>
              <text x={textX} y="17" className="node-card-title">{clip(level.title, 21)}</text>
            </g>
          );
        })}

        {/* Floating fireflies */}
        {layout.fireflies.map((fly, idx) => (
          <circle
            key={idx}
            cx={fly.x}
            cy={fly.y}
            r={fly.r}
            fill="#fef08a"
            className="firefly"
            style={{ animationDelay: `${fly.delay}s`, animationDuration: `${fly.duration}s` }}
          />
        ))}
      </svg>
    </div>
  );
}
