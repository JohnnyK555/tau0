import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Line, Image as KonvaImage, Group, Rect, Path, Text, Circle } from 'react-konva';
import { Eraser, Pencil, Ruler as RulerIcon, Triangle, Circle as CircleIcon, Trash2, Printer, Move, RotateCw, Palette, Minus, ZoomIn, ZoomOut, Maximize, MousePointer2 } from 'lucide-react';

interface DrawingCanvasProps {
  width: number;
  height: number;
}

const COLORS = ['#000000', '#ef4444', '#3b82f6', '#10b981', '#f59e0b'];

export function DrawingCanvas({ width, height }: DrawingCanvasProps) {
  const [tool, setTool] = useState<'pencil' | 'eraser' | 'line' | 'circle' | 'pointer'>('pointer');
  const [lines, setLines] = useState<any[]>([]);
  const [color, setColor] = useState(COLORS[0]);
  const isDrawing = useRef(false);
  const stageRef = useRef<any>(null);

  // Tool visibility/state
  const [showRuler, setShowRuler] = useState(false);
  const [showTriangle, setShowTriangle] = useState(false);
  const [showProtractor, setShowProtractor] = useState(false);
  const [showCompass, setShowCompass] = useState(false);

  const [rulerState, setRulerState] = useState({ x: width / 2 - 150, y: height / 2 - 20, rotation: 0 });
  const [triangleState, setTriangleState] = useState({ x: width / 2 - 100, y: height / 2 - 50, rotation: 0 });
  const [protractorState, setProtractorState] = useState({ x: width / 2, y: height / 2, rotation: 0 });
  const [compassState, setCompassState] = useState({ x: width / 2, y: height / 2 - 40 });

  const [scale, setScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState<{x: number, y: number} | null>(null);

  // Update tool positions if width/height change significantly (e.g. on mount)
  useEffect(() => {
    if (width > 0 && height > 0 && rulerState.x === -150) {
      setRulerState(s => ({ ...s, x: width / 2 - 150, y: height / 2 - 20 }));
      setTriangleState(s => ({ ...s, x: width / 2 - 100, y: height / 2 - 50 }));
      setProtractorState(s => ({ ...s, x: width / 2, y: height / 2 }));
      setCompassState(s => ({ ...s, x: width / 2, y: height / 2 - 40 }));
    }
  }, [width, height]);

  const handleZoomIn = () => {
    const newScale = scale * 1.2;
    const center = { x: width / 2, y: height / 2 };
    const relatedTo = { x: (center.x - stagePos.x) / scale, y: (center.y - stagePos.y) / scale };
    setScale(newScale);
    setStagePos({
      x: center.x - relatedTo.x * newScale,
      y: center.y - relatedTo.y * newScale
    });
  };

  const handleZoomOut = () => {
    const newScale = scale / 1.2;
    const center = { x: width / 2, y: height / 2 };
    const relatedTo = { x: (center.x - stagePos.x) / scale, y: (center.y - stagePos.y) / scale };
    setScale(newScale);
    setStagePos({
      x: center.x - relatedTo.x * newScale,
      y: center.y - relatedTo.y * newScale
    });
  };

  const handleResetZoom = () => {
    setScale(1);
    setStagePos({ x: 0, y: 0 });
  };

  const getRelativePointerPosition = (stage: any) => {
    const pointerPosition = stage.getPointerPosition();
    if (!pointerPosition) return { x: 0, y: 0 };
    return {
      x: (pointerPosition.x - stage.x()) / stage.scaleX(),
      y: (pointerPosition.y - stage.y()) / stage.scaleY()
    };
  };

  const getSnappedPoint = (x: number, y: number) => {
    let snappedX = x;
    let snappedY = y;
    let minDistance = 20; // Snap threshold

    if (showRuler) {
      const rad = rulerState.rotation * Math.PI / 180;
      const cos = Math.cos(-rad);
      const sin = Math.sin(-rad);
      const dx = x - rulerState.x;
      const dy = y - rulerState.y;
      
      const localX = dx * cos - dy * sin;
      const localY = dx * sin + dy * cos;

      if (localX >= -20 && localX <= 320) {
        if (Math.abs(localY) < minDistance) {
          const snapLocalY = 0;
          snappedX = localX * Math.cos(rad) - snapLocalY * Math.sin(rad) + rulerState.x;
          snappedY = localX * Math.sin(rad) + snapLocalY * Math.cos(rad) + rulerState.y;
          minDistance = Math.abs(localY);
        } else if (Math.abs(localY - 40) < minDistance) {
          const snapLocalY = 40;
          snappedX = localX * Math.cos(rad) - snapLocalY * Math.sin(rad) + rulerState.x;
          snappedY = localX * Math.sin(rad) + snapLocalY * Math.cos(rad) + rulerState.y;
          minDistance = Math.abs(localY - 40);
        }
      }
    }

    if (showTriangle) {
      const rad = triangleState.rotation * Math.PI / 180;
      const cos = Math.cos(-rad);
      const sin = Math.sin(-rad);
      const dx = x - triangleState.x;
      const dy = y - triangleState.y;
      
      const localX = dx * cos - dy * sin;
      const localY = dx * sin + dy * cos;

      // Edge 1: Bottom (0,0) to (200,0)
      if (localX >= -20 && localX <= 220 && Math.abs(localY) < minDistance) {
        const snapLocalY = 0;
        snappedX = localX * Math.cos(rad) - snapLocalY * Math.sin(rad) + triangleState.x;
        snappedY = localX * Math.sin(rad) + snapLocalY * Math.cos(rad) + triangleState.y;
        minDistance = Math.abs(localY);
      }
      
      // Edge 2: Left (0,0) to (100,100) -> y = x
      const dist2 = Math.abs(localX - localY) / Math.SQRT2;
      if (localX >= -10 && localX <= 110 && dist2 < minDistance) {
        const proj = (localX + localY) / 2;
        snappedX = proj * Math.cos(rad) - proj * Math.sin(rad) + triangleState.x;
        snappedY = proj * Math.sin(rad) + proj * Math.cos(rad) + triangleState.y;
        minDistance = dist2;
      }

      // Edge 3: Right (200,0) to (100,100) -> x + y = 200
      const dist3 = Math.abs(localX + localY - 200) / Math.SQRT2;
      if (localX >= 90 && localX <= 210 && dist3 < minDistance) {
        const t = (localX + localY - 200) / 2;
        const projX = localX - t;
        const projY = localY - t;
        snappedX = projX * Math.cos(rad) - projY * Math.sin(rad) + triangleState.x;
        snappedY = projX * Math.sin(rad) + projY * Math.cos(rad) + triangleState.y;
        minDistance = dist3;
      }
    }

    return { x: snappedX, y: snappedY };
  };

  const handleMouseDown = (e: any) => {
    if (tool === 'pointer') return;

    // If clicking on a tool, don't draw
    const target = e.target;
    if (target.name() !== 'background' && target !== target.getStage()) return;

    isDrawing.current = true;
    const pos = getRelativePointerPosition(target.getStage());
    const snapped = getSnappedPoint(pos.x, pos.y);
    if (tool === 'line') {
      setLines([...lines, { tool, color, points: [snapped.x, snapped.y, snapped.x, snapped.y] }]);
    } else if (tool === 'circle') {
      setLines([...lines, { tool, color, x: snapped.x, y: snapped.y, radius: 0 }]);
    } else {
      setLines([...lines, { tool, color, points: [snapped.x, snapped.y] }]);
    }
  };

  const handleMouseMove = (e: any) => {
    const stage = e.target.getStage();
    const pos = getRelativePointerPosition(stage);
    setMousePos(pos);

    if (!isDrawing.current) return;
    const snapped = getSnappedPoint(pos.x, pos.y);
    setLines(prevLines => {
      if (prevLines.length === 0) return prevLines;
      const newLines = [...prevLines];
      const lastLine = { ...newLines[newLines.length - 1] };
      if (lastLine.tool === 'line') {
        lastLine.points = [lastLine.points[0], lastLine.points[1], snapped.x, snapped.y];
      } else if (lastLine.tool === 'circle') {
        const dx = snapped.x - lastLine.x;
        const dy = snapped.y - lastLine.y;
        lastLine.radius = Math.sqrt(dx * dx + dy * dy);
      } else {
        lastLine.points = lastLine.points.concat([snapped.x, snapped.y]);
      }
      newLines[newLines.length - 1] = lastLine;
      return newLines;
    });
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const handleMouseLeave = () => {
    setMousePos(null);
    isDrawing.current = false;
  };

  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

    setScale(newScale);
    setStagePos({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
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
            onClick={() => setTool('pointer')}
            className={`p-2 rounded-lg transition-colors ${tool === 'pointer' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 text-slate-600'}`}
            title="Kurzor (přesun)"
          >
            <MousePointer2 size={18} />
          </button>
          <div className="w-px h-6 bg-slate-300 mx-1" />
          <button
            onClick={() => setTool('pencil')}
            className={`p-2 rounded-lg transition-colors ${tool === 'pencil' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 text-slate-600'}`}
            title="Tužka"
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={() => setTool('line')}
            className={`p-2 rounded-lg transition-colors ${tool === 'line' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 text-slate-600'}`}
            title="Rovná čára"
          >
            <Minus size={18} />
          </button>
          <button
            onClick={() => setTool('circle')}
            className={`p-2 rounded-lg transition-colors ${tool === 'circle' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 text-slate-600'}`}
            title="Kružnice"
          >
            <CircleIcon size={18} />
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
          <div className="w-px h-6 bg-slate-300 mx-1" />
          <button
            onClick={handleZoomOut}
            className="p-2 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors"
            title="Oddálit"
          >
            <ZoomOut size={18} />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-2 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors text-xs font-medium w-12"
            title="Resetovat přiblížení"
          >
            {Math.round(scale * 100)}%
          </button>
          <button
            onClick={handleZoomIn}
            className="p-2 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors"
            title="Přiblížit"
          >
            <ZoomIn size={18} />
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
      <div className={`flex-1 bg-slate-50 relative overflow-hidden ${tool === 'pointer' ? 'cursor-move' : 'cursor-crosshair'}`}>
        <Stage
          width={width}
          height={height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onWheel={handleWheel}
          ref={stageRef}
          scaleX={scale}
          scaleY={scale}
          x={stagePos.x}
          y={stagePos.y}
          draggable={tool === 'pointer'}
          onDragEnd={(e) => {
            if (e.target === stageRef.current) {
              setStagePos({ x: e.target.x(), y: e.target.y() });
            }
          }}
        >
          <Layer>
            {/* Grid Background */}
            <Rect x={-2000} y={-2000} width={6000} height={6000} fill="#ffffff" name="background" />
            {Array.from({ length: 300 }).map((_, i) => (
              <Line key={`v-${i}`} points={[-2000 + i * 20, -2000, -2000 + i * 20, 4000]} stroke="#f1f5f9" strokeWidth={1} listening={false} />
            ))}
            {Array.from({ length: 300 }).map((_, i) => (
              <Line key={`h-${i}`} points={[-2000, -2000 + i * 20, 4000, -2000 + i * 20]} stroke="#f1f5f9" strokeWidth={1} listening={false} />
            ))}
          </Layer>

          <Layer>
            {/* Drawing Lines */}
            {lines.map((line, i) => {
              if (line.tool === 'circle') {
                return (
                  <Group
                    key={i}
                    x={line.groupX || 0}
                    y={line.groupY || 0}
                    draggable={tool === 'pointer'}
                    onDragEnd={(e) => {
                      if (e.target === e.currentTarget) {
                        const newLines = [...lines];
                        newLines[i] = { ...newLines[i], groupX: e.target.x(), groupY: e.target.y() };
                        setLines(newLines);
                      }
                    }}
                  >
                    <Circle
                      x={line.x}
                      y={line.y}
                      radius={line.radius}
                      stroke={line.color}
                      strokeWidth={2}
                      listening={tool === 'pointer'}
                    />
                    {isDrawing.current && i === lines.length - 1 && (
                      <Text
                        x={line.x + line.radius + 10}
                        y={line.y}
                        text={`r = ${(line.radius / 10).toFixed(1)} cm`}
                        fill={line.color}
                        fontSize={14}
                        listening={false}
                      />
                    )}
                  </Group>
                );
              }
              return (
                <Group
                  key={i}
                  x={line.groupX || 0}
                  y={line.groupY || 0}
                  draggable={tool === 'pointer'}
                  onDragEnd={(e) => {
                    if (e.target === e.currentTarget) {
                      const newLines = [...lines];
                      newLines[i] = { ...newLines[i], groupX: e.target.x(), groupY: e.target.y() };
                      setLines(newLines);
                    }
                  }}
                >
                  <Line
                    points={line.points}
                    stroke={line.color}
                    strokeWidth={line.tool === 'eraser' ? 20 : 2}
                    tension={line.tool === 'line' ? 0 : 0.5}
                    lineCap="round"
                    lineJoin="round"
                    listening={tool === 'pointer'}
                    globalCompositeOperation={
                      line.tool === 'eraser' ? 'destination-out' : 'source-over'
                    }
                  />
                  {line.tool === 'line' && isDrawing.current && i === lines.length - 1 && (
                    <Text
                      x={line.points[2] + 10}
                      y={line.points[3] + 10}
                      text={`${(Math.sqrt(Math.pow(line.points[2] - line.points[0], 2) + Math.pow(line.points[3] - line.points[1], 2)) / 10).toFixed(1)} cm`}
                      fill={line.color}
                      fontSize={14}
                      listening={false}
                    />
                  )}
                </Group>
              );
            })}
          </Layer>

          <Layer>
            {/* Interactive Tools */}
            {showRuler && <RulerTool state={rulerState} onChange={setRulerState} />}
            {showTriangle && <TriangleTool state={triangleState} onChange={setTriangleState} />}
            {showProtractor && <ProtractorTool state={protractorState} onChange={setProtractorState} />}
            {showCompass && <CompassTool state={compassState} onChange={setCompassState} />}
            
            {/* Eraser Cursor */}
            {tool === 'eraser' && mousePos && (
              <Circle
                x={mousePos.x}
                y={mousePos.y}
                radius={10}
                stroke="#000"
                strokeWidth={1}
                listening={false}
              />
            )}
          </Layer>
        </Stage>
      </div>
    </div>
  );
}

// Helper components for tools
function RulerTool({ state, onChange }: { state: any, onChange: (s: any) => void }) {
  return (
    <Group 
      x={state.x} 
      y={state.y} 
      rotation={state.rotation} 
      draggable
      onDragMove={(e) => {
        if (e.target === e.currentTarget) {
          onChange({ ...state, x: e.target.x(), y: e.target.y() });
        }
      }}
    >
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
        text={`${Math.round(state.rotation)}°`}
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
          onChange({ ...state, rotation: angle });
          e.target.x(310);
          e.target.y(20);
        }}
      />
    </Group>
  );
}

function TriangleTool({ state, onChange }: { state: any, onChange: (s: any) => void }) {
  return (
    <Group 
      x={state.x} 
      y={state.y} 
      rotation={state.rotation} 
      draggable
      onDragMove={(e) => {
        if (e.target === e.currentTarget) {
          onChange({ ...state, x: e.target.x(), y: e.target.y() });
        }
      }}
    >
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
        text={`${Math.round(state.rotation)}°`}
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
          onChange({ ...state, rotation: angle });
          e.target.x(100);
          e.target.y(110);
        }}
      />
    </Group>
  );
}

function ProtractorTool({ state, onChange }: { state: any, onChange: (s: any) => void }) {
  return (
    <Group 
      x={state.x} 
      y={state.y} 
      rotation={state.rotation} 
      draggable
      onDragMove={(e) => {
        if (e.target === e.currentTarget) {
          onChange({ ...state, x: e.target.x(), y: e.target.y() });
        }
      }}
    >
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
        text={`${Math.round(state.rotation)}°`}
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
          onChange({ ...state, rotation: angle });
          e.target.x(0);
          e.target.y(-110);
        }}
      />
    </Group>
  );
}

function CompassTool({ state, onChange }: { state: any, onChange: (s: any) => void }) {
  const [radius, setRadius] = useState(50);
  return (
    <Group 
      x={state.x} 
      y={state.y} 
      draggable
      onDragMove={(e) => {
        if (e.target === e.currentTarget) {
          onChange({ ...state, x: e.target.x(), y: e.target.y() });
        }
      }}
    >
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
