import { useCallback } from "react";
import { CLASSROOM, REPORT_CARD } from "../../data";
import Hotspot from "./Hotspot";
import { REPORT_POS, REPORT_TILT, REPORT_YAW } from "./layout";
import { useCanvasTexture } from "./textures";

interface Props {
  visited: boolean;
  showLabel: boolean;
  onSelect: () => void;
}

const FONTS = ['40px "Special Elite"', '700 60px "Caveat"', '700 60px "Playfair Display"'];

/** Kladde mit Zeugnis, aufgestellt auf dem Lehrerpult */
export default function ReportCardObject({ visited, showLabel, onSelect }: Props) {
  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#f6e9c8");
    g.addColorStop(1, "#e6d09c");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(120,90,50,0.5)";
    ctx.lineWidth = 4;
    ctx.strokeRect(18, 18, w - 36, h - 36);

    ctx.fillStyle = "#3d2a17";
    ctx.textAlign = "center";
    ctx.font = '700 64px "Playfair Display", serif';
    ctx.fillText(REPORT_CARD.title.toUpperCase(), w / 2, 110);
    ctx.font = '26px "Special Elite", monospace';
    ctx.fillText(REPORT_CARD.recipient, w / 2, 155);

    ctx.textAlign = "left";
    REPORT_CARD.subjects.slice(0, 5).forEach((s, i) => {
      const y = 230 + i * 78;
      ctx.fillStyle = "#3d2a17";
      ctx.font = '28px "Special Elite", monospace';
      ctx.fillText(s.subject.length > 18 ? `${s.subject.slice(0, 17)}…` : s.subject, 50, y);
      ctx.strokeStyle = "rgba(61,42,23,0.3)";
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(50, y + 18);
      ctx.lineTo(w - 50, y + 18);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#b42318";
      ctx.font = '700 58px "Caveat", cursive';
      ctx.fillText(s.grade, w - 125, y + 6);
    });
  }, []);

  const paper = useCanvasTexture(512, 660, draw, FONTS);

  return (
    <Hotspot
      label={CLASSROOM.objects.report.label}
      hint={CLASSROOM.objects.report.hint}
      visited={visited}
      showLabel={showLabel}
      onSelect={onSelect}
      position={REPORT_POS.toArray()}
      rotation={[0, REPORT_YAW, 0]}
      labelPosition={[-0.05, 0.78, 0]}
    >
      <group rotation-x={REPORT_TILT}>
        {/* Brett */}
        <mesh position-y={0.28}>
          <boxGeometry args={[0.44, 0.58, 0.018]} />
          <meshStandardMaterial color="#8a5a32" roughness={0.55} />
        </mesh>
        {/* Papier */}
        <mesh position={[0, 0.26, 0.0105]} rotation-z={-0.015}>
          <planeGeometry args={[0.38, 0.49]} />
          <meshStandardMaterial map={paper} roughness={0.9} />
        </mesh>
        {/* Klemme */}
        <mesh position={[0, 0.55, 0.018]}>
          <boxGeometry args={[0.16, 0.05, 0.025]} />
          <meshStandardMaterial color="#c7c9cc" metalness={0.85} roughness={0.25} />
        </mesh>
      </group>
      {/* Stütze hinten */}
      <mesh position={[0, 0.13, -0.16]} rotation-x={0.55}>
        <boxGeometry args={[0.05, 0.3, 0.012]} />
        <meshStandardMaterial color="#6b4527" />
      </mesh>
    </Hotspot>
  );
}
