import { useEffect, useRef, useCallback, type MouseEvent } from "react";
import type { Stroke, Point } from "../services/api";

interface CanvasProps {
  strokes: Stroke[];
  isDrawer: boolean;
  onStrokeEnd?: (stroke: Stroke) => void;
  onClear?: () => void;
}

export function Canvas({ strokes, isDrawer, onStrokeEnd, onClear }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const currentStrokeRef = useRef<Point[]>([]);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    for (const stroke of strokes) {
      if (stroke.points.length < 2) {
        continue;
      }
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    }
  }, [strokes]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  function getCanvasPos(event: MouseEvent<HTMLCanvasElement>): Point {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  function handleMouseDown(event: MouseEvent<HTMLCanvasElement>) {
    if (!isDrawer) {
      return;
    }
    isDrawing.current = true;
    currentStrokeRef.current = [getCanvasPos(event)];
  }

  function handleMouseMove(event: MouseEvent<HTMLCanvasElement>) {
    if (!isDrawing.current || !isDrawer) {
      return;
    }
    const pos = getCanvasPos(event);
    currentStrokeRef.current.push(pos);

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (currentStrokeRef.current.length === 2) {
      ctx.beginPath();
      ctx.moveTo(currentStrokeRef.current[0].x, currentStrokeRef.current[0].y);
      ctx.lineTo(currentStrokeRef.current[1].x, currentStrokeRef.current[1].y);
      ctx.stroke();
    } else {
      const points = currentStrokeRef.current;
      ctx.beginPath();
      ctx.moveTo(points[points.length - 2].x, points[points.length - 2].y);
      ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
      ctx.stroke();
    }
  }

  function handleMouseUp() {
    if (!isDrawing.current || !isDrawer) {
      return;
    }
    isDrawing.current = false;

    if (currentStrokeRef.current.length >= 2 && onStrokeEnd) {
      onStrokeEnd({ points: [...currentStrokeRef.current] });
    }
    currentStrokeRef.current = [];
  }

  function handleMouseLeave() {
    if (isDrawing.current) {
      handleMouseUp();
    }
  }

  return (
    <div className="canvas-container">
      <canvas
        ref={canvasRef}
        className="canvas-element"
        width={800}
        height={600}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      />
      {isDrawer ? (
        <div className="canvas-toolbar">
          <button className="button button--secondary" onClick={onClear}>
            Clear Canvas
          </button>
        </div>
      ) : null}
    </div>
  );
}
