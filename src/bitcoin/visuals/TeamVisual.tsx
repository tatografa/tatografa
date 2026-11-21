import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { useAccent } from "../../nvidia/theme";
import { SatoshiFigure } from "../../nvidia/Thumbnail";
import { Panel } from "../../nvidia/visuals/ui";
import { FONT } from "./BtcCommon";

/** Uma silhueta se divide em quatro: uma pessoa… ou um time? */
export const TeamVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const accent = useAccent();

  const split = spring({ frame: frame - Math.round(fps * 0.9), fps, config: { damping: 14 } });
  const targets = [175, 405, 675, 905];

  return (
    <AbsoluteFill>
      <Panel x={50} y={200} w={width - 100} kicker="THEORY" title="One person… or a team?" />

      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        {targets.map((tx, i) => {
          const cx = interpolate(split, [0, 1], [width / 2, tx]);
          const k = interpolate(split, [0, 1], [0.62, 0.36]);
          const top = interpolate(split, [0, 1], [430, 640]);
          // antes de dividir, só a primeira aparece
          const op = i === 0 ? 1 : split;
          return (
            <g key={i} opacity={op}>
              <SatoshiFigure cx={cx} top={top} k={k} accent={accent} />
            </g>
          );
        })}
      </svg>

      {/* esfuma a base das silhuetas (evita o corte reto) */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 940,
          height: 230,
          background: "linear-gradient(180deg, rgba(5,7,13,0) 0%, rgba(5,7,13,0.85) 70%, #05070d 100%)",
          opacity: split,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          top: 1220,
          textAlign: "center",
          fontFamily: FONT,
          opacity: split,
        }}
      >
        <div style={{ fontSize: 44, fontWeight: 900, color: "white" }}>
          Many believe it was <span style={{ color: accent }}>a small team</span>
        </div>
        <div style={{ fontSize: 30, fontWeight: 800, color: "rgba(255,255,255,0.65)", marginTop: 10 }}>Nobody has ever proven anything</div>
      </div>
    </AbsoluteFill>
  );
};
