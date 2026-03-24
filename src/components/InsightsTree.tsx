import { formatNumber, formatPercent, formatPercentPair } from "../lib/format";
import type { TinderMetrics } from "../types/tinder";

interface InsightsTreeProps {
  metrics: TinderMetrics;
}

interface MetricLabelProps {
  label: string;
  subtitle?: string;
  value: number;
  percent: number;
  x: number;
  y: number;
  anchor?: "start" | "middle" | "end";
  /** When true: number (percent%) on top, label name below. */
  showValue?: boolean;
}

/**
 * All floating labels use one of two layouts:
 *   showValue=true  → "{number} ({percent%})"  ← big bold
 *                      "{label}"                ← small below
 *   showValue=false → "{label}"                 ← small
 *                      "({percent%})"            ← small below
 */
function MetricLabel({
  label,
  subtitle,
  value,
  percent,
  x,
  y,
  anchor = "middle",
  showValue = true,
}: MetricLabelProps) {
  if (showValue) {
    return (
      <g transform={`translate(${x} ${y})`}>
        {/* Line 1: large number + small percent in parens on the same baseline */}
        <text className="metric-label-value" textAnchor={anchor}>
          {formatNumber(value)}
          <tspan fontSize="13" fontWeight="400" fill="rgba(255,255,255,0.76)">
            {" "}({formatPercent(percent)})
          </tspan>
        </text>
        {/* Line 2: label name */}
        <text className="metric-label-name" textAnchor={anchor} y="24">
          {label}
        </text>
        {subtitle && (
          <text className="metric-label-subtitle" textAnchor={anchor} y="40">
            {subtitle}
          </text>
        )}
      </g>
    );
  }

  return (
    <g transform={`translate(${x} ${y})`}>
      <text className="metric-label-name" textAnchor={anchor}>
        {label}
      </text>
      <text className="metric-label-name" textAnchor={anchor} y="18" fill="rgba(255,255,255,0.72)">
        ({formatPercent(percent)})
      </text>
    </g>
  );
}

export function InsightsTree({ metrics }: InsightsTreeProps) {
  const swipeSplit = formatPercentPair(metrics.leftSwipes, metrics.rightSwipes);
  const matchSplit = formatPercentPair(metrics.matches, metrics.noMatch);
  const chatSplit = formatPercentPair(metrics.chats, metrics.noChats);

  return (
    <section className="results-shell" data-testid="results-shell">
      <div className="tree-stage">
        <div className="tree-frame" data-testid="insights-tree">
          <svg
            className="tree-svg"
            viewBox="0 0 720 660"
            role="img"
            aria-label="Tinder insights tree"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id="pageGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#6ea5d3" />
                <stop offset="52%" stopColor="#6683d7" />
                <stop offset="100%" stopColor="#6d4fe2" />
              </linearGradient>
              {/*
                Glow filter: feGaussianBlur behind + crisp original on top.
                Creates the soft "glowing ribbon" look of the reference.
              */}
              <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="10" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <rect x="0" y="0" width="720" height="660" rx="34" fill="url(#pageGlow)" />

            {/*
              BRANCH PATHS
              Each branch uses a single path with the glow filter.
              Control points are set so every branch exits its origin pill
              vertically (CP1 directly below start) and arrives at its
              destination from above (CP2 directly above end). This creates
              the smooth, organic S-curves seen in the reference.

              Positive (right swipes, matches, chats):
                frosted white ~0.60 opacity, thick strokes.
              Negative (left swipes, no match, no chats):
                dim white ~0.25–0.32 opacity, thin strokes.
            */}

            {/* Left swipes — negative, exits total-swipes pill left side */}
            <path
              d="M300 148 C300 196, 178 218, 162 260"
              fill="none"
              stroke="rgba(255,255,255,0.34)"
              strokeWidth="14"
              strokeLinecap="round"
              filter="url(#glow)"
            />

            {/* Right swipes — positive main trunk; exits pill right side */}
            <path
              d="M424 148 C424 186, 518 196, 520 220"
              fill="none"
              stroke="rgba(255,255,255,0.60)"
              strokeWidth="26"
              strokeLinecap="round"
              filter="url(#glow)"
            />

            {/* Matches — positive; both level-2 branches exit from pill bottom-centre (520,264) */}
            <path
              d="M520 264 C520 314, 460 342, 447 365"
              fill="none"
              stroke="rgba(255,255,255,0.58)"
              strokeWidth="22"
              strokeLinecap="round"
              filter="url(#glow)"
            />

            {/* No match — negative; same origin (520,264) */}
            <path
              d="M520 264 C520 308, 592 346, 600 378"
              fill="none"
              stroke="rgba(255,255,255,0.22)"
              strokeWidth="8"
              strokeLinecap="round"
              filter="url(#glow)"
            />

            {/* Chats — positive; both level-3 branches exit from pill bottom-centre (447,409) */}
            <path
              d="M447 409 C447 456, 368 480, 355 510"
              fill="none"
              stroke="rgba(255,255,255,0.56)"
              strokeWidth="17"
              strokeLinecap="round"
              filter="url(#glow)"
            />

            {/* No chats — negative; same origin (447,409) */}
            <path
              d="M447 409 C447 456, 534 490, 542 520"
              fill="none"
              stroke="rgba(255,255,255,0.20)"
              strokeWidth="7"
              strokeLinecap="round"
              filter="url(#glow)"
            />

            {/* ── TITLE ── */}
            <text x="360" y="62" textAnchor="middle" className="tree-title">
              Your Tinder Insights
            </text>

            {/* ── PILLS ── */}
            <g transform="translate(184 92)">
              <rect width="352" height="56" rx="28" className="pill-base" />
              <text x="176" y="34" textAnchor="middle" className="pill-kicker">
                You swiped {formatNumber(metrics.totalSwipes)} times
              </text>
            </g>

            {/* Right swipes */}
            <g transform="translate(454 220)">
              <rect width="132" height="44" rx="22" className="pill-base" />
              <text x="66" y="29" textAnchor="middle" className="pill-count">
                {formatNumber(metrics.rightSwipes)}
              </text>
            </g>

            {/* Matches */}
            <g transform="translate(392 365)">
              <rect width="110" height="44" rx="22" className="pill-base" />
              <text x="55" y="29" textAnchor="middle" className="pill-count">
                {formatNumber(metrics.matches)}
              </text>
            </g>

            {/* Chats */}
            <g transform="translate(300 510)">
              <rect width="110" height="44" rx="22" className="pill-base" />
              <text x="55" y="29" textAnchor="middle" className="pill-count">
                {formatNumber(metrics.chats)}
              </text>
            </g>

            {/* ── LABELS ── */}

            {/* Left side: left swipes */}
            <MetricLabel
              label="left swipes"
              value={metrics.leftSwipes}
              percent={swipeSplit.left}
              x={100}
              y={252}
            />

            {/* Right of right-swipes pill: no value (pill shows it) */}
            <MetricLabel
              label="right swipes"
              value={metrics.rightSwipes}
              percent={swipeSplit.right}
              x={596}
              y={228}
              anchor="start"
              showValue={false}
            />

            {/* On the branch between right-swipes and matches pills */}
            <MetricLabel
              label="matches"
              value={metrics.matches}
              percent={matchSplit.left}
              x={438}
              y={300}
              anchor="end"
              showValue={false}
            />

            {/* Right side: no match — start far enough left that the text stays inside 720px */}
            <MetricLabel
              label="no match"
              value={metrics.noMatch}
              percent={matchSplit.right}
              x={568}
              y={380}
              anchor="start"
            />

            {/* Left of chats pill: no value (pill shows it) */}
            <MetricLabel
              label="chats"
              value={metrics.chats}
              percent={chatSplit.left}
              x={292}
              y={524}
              anchor="end"
              showValue={false}
            />

            {/* Right side: no chats */}
            <MetricLabel
              label="no chats"
              subtitle="(less than 5 messages)"
              value={metrics.noChats}
              percent={chatSplit.right}
              x={550}
              y={514}
              anchor="start"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
