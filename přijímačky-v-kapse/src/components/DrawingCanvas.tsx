import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Line, Image as KonvaImage, Group, Rect, Path, Text, Circle } from 'react-konva';
import { Eraser, Pencil, Ruler as RulerIcon, Triangle, Circle as CircleIcon, Trash2, Printer, Move, RotateCw, Palette } from 'lucide-react';

interface DrawingCanvasProps {
  width: number;
  height: number;
}

const COLORS = ['#000000', '#ef4444', '#3b82f6', '#10b981', '#f59e0b'];

export function DrawingCanvas({ width, height }: DrawingCanvasProps) {
  const [tool, setTool] = useState<'pencil' | 'eraser'>('pencil');
  const [lines, setLines] = useState<any[]>([]);
  const [color, setColor] = useState(COLORS[0]);
  const isDrawing = useRef(false);
  const stageRef = useRef<any>(null);

  // Tool visibility/state
  const [showRuler, setShowRuler] = useState(false);
  const [showTriangle, setShowTriangle] = useState(false);
  const [showProtractor, setShowProtractor] = useState(false);
  const [showCompass, setShowCompass] = useState(false);

  const handleMouseDown = (e: any) => {
    // If clicking on a tool, don't draw
    if (e.target !== e.target.getStage()) return;

    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    setLines([...lines, { tool, color, points: [pos.x, pos.y] }]);
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing.current) return;
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    setLines(prevLines => {
      if (prevLines.length === 0) return prevLines;
      const newLines = [...prevLines];
      const lastLine = { ...newLines[newLines.length - 1] };
      lastLine.points = lastLine.points.concat([point.x, point.y]);
      newLines[newLines.length - 1] = lastLine;
      return newLines;
    });
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const handlePrint = () => {
    const dataUrl = stageRef.current.toDataURL();
    const windowContent = '<!DOCTYPE html><html><head><title>Tisk rýsování</title></head><body><img src="' + dataUrl + '" style="width:100%;"></body></html>';
    const printWin = window.open('', '', 'width=800,height=600');
    if (printWin) {
      printWin.document.open();
      printWin.document.write(windowContent);
      printWin.document.close();
      printWin.focus();
      setTimeout(() => {
        printWin.print();
        printWin.close();
      }, 250);
    }
  };

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const clearCanvas = () => {
    if (showClearConfirm) {
      setLines([]);
      setShowClearConfirm(false);
    } else {
      setShowClearConfirm(true);
      setTimeout(() => setShowClearConfirm(false), 3000);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="p-2 bg-slate-50 border-b border-slate-200 flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-1 items-center">
          <button
            onClick={() => setTool('pencil')}
            className={`p-2 rounded-lg transition-colors ${tool === 'pencil' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 text-slate-600'}`}
            title="Tužka"
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={() => setTool('eraser')}
            className={`p-2 rounded-lg transition-colors ${tool === 'eraser' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 text-slate-600'}`}
            title="Guma"
          >
            <Eraser size={18} />
          </button>
          <div className="w-px h-6 bg-slate-300 mx-1" />
          <div className="flex gap-1">
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-6 h-6 rounded-full border-2 transition-transform ${color === c ? 'scale-125 border-slate-400' : 'border-transparent hover:scale-110'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-1 items-center">
          <button
            onClick={() => setShowRuler(!showRuler)}
            className={`p-2 rounded-lg transition-colors ${showRuler ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'hover:bg-slate-200 text-slate-600'}`}
            title="Pravítko"
          >
            <RulerIcon size={18} />
          </button>
          <button
            onClick={() => setShowTriangle(!showTriangle)}
            className={`p-2 rounded-lg transition-colors ${showTriangle ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'hover:bg-slate-200 text-slate-600'}`}
            title="Trojúhelník s ryskou"
          >
            <Triangle size={18} />
          </button>
          <button
            onClick={() => setShowProtractor(!showProtractor)}
            className={`p-2 rounded-lg transition-colors ${showProtractor ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'hover:bg-slate-200 text-slate-600'}`}
            title="Úhloměr"
          >
            <RotateCw size={18} />
          </button>
          <button
            onClick={() => setShowCompass(!showCompass)}
            className={`p-2 rounded-lg transition-colors ${showCompass ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'hover:bg-slate-200 text-slate-600'}`}
            title="Kružítko"
          >
            <CircleIcon size={18} />
          </button>
        </div>

        <div className="flex gap-1">
          <button
            onClick={handlePrint}
            className="p-2 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors"
            title="Tisknout"
          >
            <Printer size={18} />
          </button>
          <button
            onClick={clearCanvas}
            className={`p-2 rounded-lg transition-colors flex items-center gap-1 ${
              showClearConfirm ? 'bg-red-500 text-white hover:bg-red-600' : 'hover:bg-red-100 text-red-600'
            }`}
            title="Vymazat vše"
          >
            <Trash2 size={18} />
            {showClearConfirm && <span className="text-xs font-medium">Opravdu?</span>}
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 bg-slate-50 relative overflow-hidden cursor-crosshair">
        <Stage
          width={width}
          height={height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          ref={stageRef}
        >
          <Layer>
            {/* Grid Background */}
            <Rect width={width} height={height} fill="#ffffff" />
            {Array.from({ length: Math.ceil(width / 20) }).map((_, i) => (
              <Line key={`v-${i}`} points={[i * 20, 0, i * 20, height]} stroke="#f1f5f9" strokeWidth={1} />
            ))}
            {Array.from({ length: Math.ceil(height / 20) }).map((_, i) => (
              <Line key={`h-${i}`} points={[0, i * 20, width, i * 20]} stroke="#f1f5f9" strokeWidth={1} />
            ))}

            {/* Drawing Lines */}
            {lines.map((line, i) => (
              <Line
                key={i}
                points={line.points}
                stroke={line.color}
                strokeWidth={line.tool === 'eraser' ? 20 : 2}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation={
                  line.tool === 'eraser' ? 'destination-out' : 'source-over'
                }
              />
            ))}

            {/* Interactive Tools */}
            {showRuler && <RulerTool x={100} y={100} />}
            {showTriangle && <TriangleTool x={200} y={200} />}
            {showProtractor && <ProtractorTool x={300} y={300} />}
            {showCompass && <CompassTool x={400} y={400} />}
          </Layer>
        </Stage>
      </div>
    </div>
  );
}

// Helper components for tools
function RulerTool({ x, y }: { x: number, y: number }) {
  const [rotation, setRotation] = useState(0);
  return (
    <Group x={x} y={y} rotation={rotation} draggable>
      <Rect
        width={300}
        height={40}
        fill="rgba(255, 251, 235, 0.8)"
        stroke="#d97706"
        strokeWidth={1}
        cornerRadius={2}
      />
      {/* Scale */}
      {Array.from({ length: 31 }).map((_, i) => (
        <Line
          key={i}
          points={[i * 10, 0, i * 10, i % 5 === 0 ? 15 : 8]}
          stroke="#d97706"
          strokeWidth={1}
        />
      ))}
      {Array.from({ length: 4 }).map((_, i) => (
        <Text
          key={i}
          x={i * 100 - 5}
          y={18}
          text={(i * 10).toString()}
          fontSize={10}
          fill="#d97706"
        />
      ))}
      <Text
        x={150}
        y={22}
        text={`${Math.round(rotation)}°`}
        fontSize={12}
        fill="#b45309"
        fontStyle="bold"
      />
      {/* Rotation handle */}
      <Circle
        x={310}
        y={20}
        radius={8}
        fill="#d97706"
        draggable
        onDragMove={(e) => {
          const pos = e.target.absolutePosition();
          const parentPos = e.target.getParent().absolutePosition();
          const angle = Math.atan2(pos.y - parentPos.y, pos.x - parentPos.x) * 180 / Math.PI;
          setRotation(angle);
          e.target.x(310);
          e.target.y(20);
        }}
      />
    </Group>
  );
}

function TriangleTool({ x, y }: { x: number, y: number }) {
  const [rotation, setRotation] = useState(0);
  return (
    <Group x={x} y={y} rotation={rotation} draggable>
      <Line
        points={[0, 0, 200, 0, 100, 100]}
        closed
        fill="rgba(255, 251, 235, 0.7)"
        stroke="#d97706"
        strokeWidth={1}
      />
      {/* Ryska (the line in the middle) */}
      <Line points={[100, 0, 100, 100]} stroke="#d97706" strokeWidth={1} dash={[5, 2]} />
      <Text
        x={85}
        y={40}
        text={`${Math.round(rotation)}°`}
        fontSize={12}
        fill="#b45309"
        fontStyle="bold"
      />
      {/* Rotation handle */}
      <Circle
        x={100}
        y={110}
        radius={8}
        fill="#d97706"
        draggable
        onDragMove={(e) => {
          const pos = e.target.absolutePosition();
          const parentPos = e.target.getParent().absolutePosition();
          const angle = Math.atan2(pos.y - parentPos.y, pos.x - parentPos.x) * 180 / Math.PI - 90;
          setRotation(angle);
          e.target.x(100);
          e.target.y(110);
        }}
      />
    </Group>
  );
}

function ProtractorTool({ x, y }: { x: number, y: number }) {
  const [rotation, setRotation] = useState(0);
  return (
    <Group x={x} y={y} rotation={rotation} draggable>
      <Path
        data="M -100 0 A 100 100 0 0 1 100 0 L -100 0"
        fill="rgba(255, 251, 235, 0.7)"
        stroke="#d97706"
        strokeWidth={1}
      />
      {/* Degree marks */}
      {Array.from({ length: 19 }).map((_, i) => {
        const angle = (i * 10) * Math.PI / 180;
        return (
          <Line
            key={i}
            points={[
              -100 * Math.cos(angle),
              -100 * Math.sin(angle),
              -90 * Math.cos(angle),
              -90 * Math.sin(angle)
            ]}
            stroke="#d97706"
            strokeWidth={1}
          />
        );
      })}
      <Text
        x={-15}
        y={-30}
        text={`${Math.round(rotation)}°`}
        fontSize={14}
        fill="#b45309"
        fontStyle="bold"
      />
      {/* Rotation handle */}
      <Circle
        x={0}
        y={-110}
        radius={8}
        fill="#d97706"
        draggable
        onDragMove={(e) => {
          const pos = e.target.absolutePosition();
          const parentPos = e.target.getParent().absolutePosition();
          const angle = Math.atan2(pos.y - parentPos.y, pos.x - parentPos.x) * 180 / Math.PI + 90;
          setRotation(angle);
          e.target.x(0);
          e.target.y(-110);
        }}
      />
    </Group>
  );
}

function CompassTool({ x, y }: { x: number, y: number }) {
  const [radius, setRadius] = useState(50);
  return (
    <Group x={x} y={y} draggable>
      {/* Compass body */}
      <Line points={[0, 0, -10, 80]} stroke="#64748b" strokeWidth={3} />
      <Line points={[0, 0, radius, 80]} stroke="#64748b" strokeWidth={3} />
      <Circle radius={5} fill="#334155" />
      {/* Needle point */}
      <Circle x={-10} y={80} radius={2} fill="#000" />
      {/* Pencil point */}
      <Rect x={radius - 2} y={80} width={4} height={10} fill="#3b82f6" />
      <Text
        x={radius / 2 - 15}
        y={90}
        text={`${(radius / 10).toFixed(1)} cm`}
        fontSize={12}
        fill="#334155"
        fontStyle="bold"
      />
      {/* Radius handle */}
      <Circle
        x={radius}
        y={80}
        radius={8}
        fill="#3b82f6"
        draggable
        onDragMove={(e) => {
          const newRadius = Math.max(10, e.target.x());
          setRadius(newRadius);
          e.target.y(80);
        }}
      />
      {/* Preview circle */}
      <Circle radius={radius + 10} stroke="#cbd5e1" strokeWidth={1} dash={[5, 5]} x={-10} y={80} />
    </Group>
  );
}
