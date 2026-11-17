import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { useAccent } from "../../nvidia/theme";
import { Panel, Pill } from "../../nvidia/visuals/ui";
import { FONT } from "./BtcCommon";

/** O whitepaper de 9 páginas chegando por e-mail numa lista de criptografia. */
export const WhitepaperVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const accent = useAccent();

  const paper = spring({ frame: frame - 14, fps, config: { damping: 14 } });
  const pages = 9;
  const fan = interpolate(frame, [30, 30 + fps * 1.6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const cx = width / 2;
  const pw = 520;
  const ph = 690;

  return (
    <AbsoluteFill>
      <Panel x={50} y={200} w={width - 100} kicker="OCTOBER 31, 2008" title="Nine pages, no name">
        <div style={{ marginTop: 14 }}>
          <Pill>From: satoshi@vistomail.com</Pill>
        </div>
      </Panel>

      {/* páginas de trás, abrindo em leque */}
      {Array.from({ length: pages - 1 }, (_, i) => {
        const k = i + 1;
        const a = fan * (k * 1.6);
        return (
          <div
            key={k}
            style={{
              position: "absolute",
              left: cx - pw / 2,
              top: 560,
              width: pw,
              height: ph,
              borderRadius: 10,
              background: "#e9e4d8",
              boxShadow: "0 12px 30px rgba(0,0,0,0.5)",
              transform: `rotate(${a}deg) translate(${a * 3}px, ${-a * 1.5}px)`,
              transformOrigin: "bottom left",
              opacity: paper,
            }}
          />
        );
      })}

      {/* página de rosto */}
      <div
        style={{
          position: "absolute",
          left: cx - pw / 2,
          top: 560,
          width: pw,
          height: ph,
          borderRadius: 10,
          background: "linear-gradient(180deg, #faf7f0 0%, #ece7da 100%)",
          boxShadow: "0 26px 60px rgba(0,0,0,0.65)",
          transform: `scale(${paper})`,
          opacity: paper,
          padding: "46px 38px",
          fontFamily: "'DejaVu Serif', Georgia, serif",
          color: "#15181d",
        }}
      >
        <div style={{ fontSize: 29, fontWeight: 800, lineHeight: 1.3, textAlign: "center" }}>
          Bitcoin: A Peer-to-Peer
          <br />
          Electronic Cash System
        </div>
        <div style={{ fontSize: 22, textAlign: "center", marginTop: 22 }}>Satoshi Nakamoto</div>
        <div style={{ fontSize: 19, textAlign: "center", color: "#555", marginTop: 4 }}>
          satoshin@gmx.com · www.bitcoin.org
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, marginTop: 34 }}>Abstract.</div>
        {[96, 100, 92, 100, 97, 88, 100, 94, 70].map((w, i) => (
          <div key={i} style={{ height: 9, borderRadius: 5, background: "#c6c0b2", marginTop: 13, width: `${w}%` }} />
        ))}
        <div
          style={{
            position: "absolute",
            right: 30,
            bottom: 22,
            fontFamily: FONT,
            fontSize: 20,
            fontWeight: 800,
            color: "#8a8578",
          }}
        >
          1 / 9
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          top: 1330,
          textAlign: "center",
          fontFamily: FONT,
          fontSize: 32,
          fontWeight: 800,
          color: "white",
          opacity: fan,
        }}
      >
        Sent to <span style={{ color: accent }}>The Cryptography Mailing List</span>
      </div>
    </AbsoluteFill>
  );
};
