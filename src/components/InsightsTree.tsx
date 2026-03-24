import { formatNumber, formatPercent, formatPercentPair } from "../lib/format";
import type { TinderMetrics } from "../types/tinder";

interface InsightsTreeProps {
  metrics: TinderMetrics;
}

interface Point {
  x: number;
  y: number;
}

interface BubbleNodeProps {
  centerX: number;
  topY: number;
  width: number;
  height: number;
  value: number;
  percent: number;
  label: string;
  labelPlacement?: "left" | "bottom";
}

interface TerminalMetricProps {
  anchorX: number;
  centerY: number;
  label: string;
  subtitle?: string;
  value: number;
  percent: number;
  labelPlacement?: "left" | "bottom";
}

function branchPath(from: Point, to: Point): string {
  const deltaY = to.y - from.y;
  const controlOffset = Math.max(34, deltaY * 0.42);

  return `M ${from.x} ${from.y} C ${from.x} ${from.y + controlOffset}, ${to.x} ${
    to.y - controlOffset
  }, ${to.x} ${to.y}`;
}

function Branch({
  from,
  to,
  width,
  opacity,
}: {
  from: Point;
  to: Point;
  width: number;
  opacity: number;
}) {
  return (
    <path
      d={branchPath(from, to)}
      fill="none"
      stroke={`rgba(255,255,255,${opacity})`}
      strokeWidth={width}
      strokeLinecap="round"
      filter="url(#glow)"
    />
  );
}

const estimateTextWidth = (text: string, fontSize: number): number => text.length * fontSize * 0.56;

function BubbleNode({
  centerX,
  topY,
  width,
  height,
  value,
  percent,
  label,
  labelPlacement = "bottom",
}: BubbleNodeProps) {
  const valueText = formatNumber(value);
  const percentText = formatPercent(percent);
  const valueHalfWidth = estimateTextWidth(valueText, 26) / 2;

  return (
    <g transform={`translate(${centerX - width / 2} ${topY})`}>
      <rect width={width} height={height} rx={height / 2} className="pill-base" />
      <text
        x={width / 2 - 8}
        y={height / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        className="pill-count"
      >
        {valueText}
      </text>
      <text
        x={width / 2 + valueHalfWidth + 6}
        y={height / 2}
        textAnchor="start"
        dominantBaseline="middle"
        className="pill-percent"
      >
        {percentText}
      </text>
      {labelPlacement === "left" ? (
        <text
          x="-18"
          y={height / 2}
          textAnchor="end"
          dominantBaseline="middle"
          className="bubble-label"
        >
          {label}
        </text>
      ) : (
        <text x={width / 2} y={height + 26} textAnchor="middle" className="bubble-label">
          {label}
        </text>
      )}
    </g>
  );
}

function TerminalMetric({
  anchorX,
  centerY,
  label,
  subtitle,
  value,
  percent,
  labelPlacement = "left",
}: TerminalMetricProps) {
  const valueText = formatNumber(value);
  const valueHalfWidth = estimateTextWidth(valueText, 30) / 2;

  return (
    <g transform={`translate(${anchorX} ${centerY})`}>
      <text className="terminal-value" textAnchor="middle" dominantBaseline="middle" x="0" y="0">
        {valueText}
      </text>
      <text
        className="terminal-percent"
        textAnchor="start"
        dominantBaseline="middle"
        x={valueHalfWidth + 8}
        y="0"
      >
        {formatPercent(percent)}
      </text>
      {labelPlacement === "left" ? (
        <text
          className="terminal-label"
          textAnchor="end"
          dominantBaseline="middle"
          x={-valueHalfWidth - 14}
          y="0"
        >
          {label}
        </text>
      ) : (
        <text
          className="terminal-label"
          textAnchor="middle"
          x="0"
          y="22"
        >
          {label}
        </text>
      )}
      {subtitle ? (
        <text
          className="terminal-subtitle"
          textAnchor={labelPlacement === "bottom" ? "middle" : "end"}
          x={labelPlacement === "bottom" ? 0 : -valueHalfWidth - 14}
          y={labelPlacement === "bottom" ? 36 : 18}
        >
          {subtitle}
        </text>
      ) : null}
    </g>
  );
}

export function InsightsTree({ metrics }: InsightsTreeProps) {
  const swipeSplit = formatPercentPair(metrics.leftSwipes, metrics.rightSwipes);
  const matchSplit = formatPercentPair(metrics.matches, metrics.noMatch);
  const chatSplit = formatPercentPair(metrics.chats, metrics.noChats);

  const topPill = { centerX: 360, topY: 70, width: 372, height: 58 };
  const rightSwipesBubble = { centerX: 518, topY: 186, width: 194, height: 50 };
  const matchesBubble = { centerX: 372, topY: 308, width: 156, height: 50 };
  const chatsBubble = { centerX: 248, topY: 432, width: 140, height: 50 };

  const firstRowY = rightSwipesBubble.topY + rightSwipesBubble.height / 2;
  const secondRowY = matchesBubble.topY + matchesBubble.height / 2;
  const thirdRowY = chatsBubble.topY + chatsBubble.height / 2;

  const leftTerminal = { x: 136, y: firstRowY };
  const noMatchTerminal = { x: 602, y: secondRowY };
  const noChatsTerminal = { x: 552, y: thirdRowY };

  const terminalJoinOffset = 18;

  return (
    <section className="results-shell" data-testid="results-shell">
      <div className="tree-stage">
        <div className="tree-frame" data-testid="insights-tree">
          <svg
            className="tree-svg"
            viewBox="0 0 720 560"
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
              <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="9" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <rect x="0" y="0" width="720" height="560" rx="34" fill="url(#pageGlow)" />

            <Branch
              from={{ x: 307, y: topPill.topY + topPill.height }}
              to={{ x: leftTerminal.x, y: leftTerminal.y - terminalJoinOffset }}
              width={18}
              opacity={0.34}
            />
            <Branch
              from={{ x: 414, y: topPill.topY + topPill.height }}
              to={{ x: rightSwipesBubble.centerX, y: rightSwipesBubble.topY }}
              width={28}
              opacity={0.82}
            />
            <Branch
              from={{
                x: rightSwipesBubble.centerX,
                y: rightSwipesBubble.topY + rightSwipesBubble.height,
              }}
              to={{ x: matchesBubble.centerX, y: matchesBubble.topY }}
              width={22}
              opacity={0.82}
            />
            <Branch
              from={{
                x: rightSwipesBubble.centerX,
                y: rightSwipesBubble.topY + rightSwipesBubble.height,
              }}
              to={{ x: noMatchTerminal.x, y: noMatchTerminal.y - terminalJoinOffset }}
              width={9}
              opacity={0.28}
            />
            <Branch
              from={{ x: matchesBubble.centerX, y: matchesBubble.topY + matchesBubble.height }}
              to={{ x: chatsBubble.centerX, y: chatsBubble.topY }}
              width={15}
              opacity={0.78}
            />
            <Branch
              from={{ x: matchesBubble.centerX, y: matchesBubble.topY + matchesBubble.height }}
              to={{ x: noChatsTerminal.x, y: noChatsTerminal.y - terminalJoinOffset }}
              width={8}
              opacity={0.26}
            />

            <text x="360" y="48" textAnchor="middle" className="tree-title">
              Your Tinder Insights
            </text>

            <g transform={`translate(${topPill.centerX - topPill.width / 2} ${topPill.topY})`}>
              <rect width={topPill.width} height={topPill.height} rx="28" className="pill-base" />
              <text
                x={topPill.width / 2}
                y={topPill.height / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                className="pill-kicker"
              >
                You swiped {formatNumber(metrics.totalSwipes)} times
              </text>
            </g>

            <BubbleNode
              centerX={rightSwipesBubble.centerX}
              topY={rightSwipesBubble.topY}
              width={rightSwipesBubble.width}
              height={rightSwipesBubble.height}
              value={metrics.rightSwipes}
              percent={swipeSplit.right}
              label="right swipes"
              labelPlacement="left"
            />
            <BubbleNode
              centerX={matchesBubble.centerX}
              topY={matchesBubble.topY}
              width={matchesBubble.width}
              height={matchesBubble.height}
              value={metrics.matches}
              percent={matchSplit.left}
              label="matches"
              labelPlacement="left"
            />
            <BubbleNode
              centerX={chatsBubble.centerX}
              topY={chatsBubble.topY}
              width={chatsBubble.width}
              height={chatsBubble.height}
              value={metrics.chats}
              percent={chatSplit.left}
              label="chats"
              labelPlacement="left"
            />

            <TerminalMetric
              anchorX={leftTerminal.x}
              centerY={leftTerminal.y}
              label="left swipes"
              value={metrics.leftSwipes}
              percent={swipeSplit.left}
            />
            <TerminalMetric
              anchorX={noMatchTerminal.x}
              centerY={noMatchTerminal.y}
              label="no match"
              value={metrics.noMatch}
              percent={matchSplit.right}
              labelPlacement="bottom"
            />
            <TerminalMetric
              anchorX={noChatsTerminal.x}
              centerY={noChatsTerminal.y}
              label="no chats"
              subtitle="(less than 5 messages)"
              value={metrics.noChats}
              percent={chatSplit.right}
              labelPlacement="bottom"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
