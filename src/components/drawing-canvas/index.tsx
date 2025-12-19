import React, { useRef, useEffect, useState } from 'react';
import classNames from 'classnames';
import './index.less';
import { Button } from 'antd';

// 类型定义
interface Point {
  x: number;
  y: number;
}

type DrawingTool = 'pencil' | 'eraser' | 'rectangle' | 'circle' | 'square';

const DrawingCanvas: React.FC = () => {
  // Canvas引用
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 绘图状态
  const drawingRef = useRef({
    isDrawing: false,
    startPoint: { x: 0, y: 0 } as Point,
    lastPoint: { x: 0, y: 0 } as Point,
    ctx: null as CanvasRenderingContext2D | null,
    dpr: 1,
    currentTool: 'pencil' as DrawingTool,
    currentColor: '#000000',
    lineWidth: 5,
    fillShape: false
  });

  // UI状态
  const [currentTool, setCurrentTool] = useState<DrawingTool>('pencil');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(5);
  const [fillShape, setFillShape] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const [canvasModel, setCanvasModel] = useState<boolean>(true)

  // 固定画布尺寸
  const canvasWidth = 800;
  const canvasHeight = 600;

  // 颜色选项
  const colorOptions = [
    { name: '黑色', value: '#000000' },
    { name: '红色', value: '#ff4757' },
    { name: '绿色', value: '#2ed573' },
    { name: '蓝色', value: '#1e90ff' },
    { name: '橙色', value: '#ffa502' },
    { name: '紫色', value: '#a55eea' },
  ];

  // 工具选项
  const tools = [
    { id: 'pencil' as DrawingTool, icon: 'fas fa-pencil-alt', title: '画笔' },
    { id: 'eraser' as DrawingTool, icon: 'fas fa-eraser', title: '橡皮擦' },
    { id: 'rectangle' as DrawingTool, icon: 'fas fa-square', title: '矩形' },
    { id: 'circle' as DrawingTool, icon: 'fas fa-circle', title: '圆形' },
    { id: 'square' as DrawingTool, icon: 'fas fa-square-full', title: '正方形' },
  ];

  // 颜色名称映射
  const colorNames: Record<string, string> = {
    '#000000': '黑色',
    '#ff4757': '红色',
    '#2ed573': '绿色',
    '#1e90ff': '蓝色',
    '#ffa502': '橙色',
    '#a55eea': '紫色',
  };

  // 工具名称映射
  const toolNames: Record<DrawingTool, string> = {
    pencil: '画笔',
    eraser: '橡皮擦',
    rectangle: '矩形',
    circle: '圆形',
    square: '正方形',
  };

  // 初始化Canvas
  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;

    // 设置Canvas像素尺寸（考虑高DPI屏幕）
    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;

    // 设置Canvas显示尺寸
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;

    // 获取上下文
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 保存到ref
    drawingRef.current.ctx = ctx;
    drawingRef.current.dpr = dpr;

    // 缩放上下文以适配高DPI屏幕
    ctx.scale(dpr, dpr);

    // 设置画布样式
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = drawingRef.current.currentColor;
    ctx.fillStyle = drawingRef.current.currentColor;
    ctx.lineWidth = drawingRef.current.lineWidth;

    // 填充白色背景
    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = drawingRef.current.currentColor;

    // 保存初始状态到历史记录
    const dataUrl = canvas.toDataURL();
    setHistory([dataUrl]);
    setHistoryIndex(0);
  };

  // 保存状态到历史记录
  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL();

    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);

      // 限制历史记录数量
      if (newHistory.length >= 20) {
        newHistory.shift();
      }

      newHistory.push(dataUrl);
      setHistoryIndex(newHistory.length - 1);
      return newHistory;
    });
  };

  // 恢复历史状态
  const restoreState = (index: number) => {
    if (index < 0 || index >= history.length) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = drawingRef.current.ctx;
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      const dpr = drawingRef.current.dpr;

      // 清除画布
      ctx.clearRect(0, 0, canvasWidth * dpr, canvasHeight * dpr);

      // 绘制历史状态
      ctx.drawImage(img, 0, 0);
    };
    img.src = history[index];

    setHistoryIndex(index);
  };

  // 撤销操作
  const undo = () => {
    if (historyIndex > 0) {
      restoreState(historyIndex - 1);
    }
  };

  // 重做操作
  const redo = () => {
    if (historyIndex < history.length - 1) {
      restoreState(historyIndex + 1);
    }
  };

  // 清空画布
  const clearCanvas = () => {
    if (window.confirm('确定要清空画布吗？')) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = drawingRef.current.ctx;
      if (!ctx) return;

      const dpr = drawingRef.current.dpr;

      // 清除画布并填充白色
      ctx.clearRect(0, 0, canvasWidth * dpr, canvasHeight * dpr);
      ctx.fillStyle = 'transparent';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      ctx.fillStyle = drawingRef.current.currentColor;

      saveState();
    }
  };

  // 获取坐标（处理鼠标和触摸事件）
  const getCoordinates = (e: MouseEvent | TouchEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const dpr = drawingRef.current.dpr;

    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * (canvas.width / rect.width / dpr),
      y: (clientY - rect.top) * (canvas.height / rect.height / dpr)
    };
  };

  // 开始绘制
  const startDrawing = (e: MouseEvent | TouchEvent) => {
    e.preventDefault();

    const coords = getCoordinates(e);
    drawingRef.current.isDrawing = true;
    drawingRef.current.startPoint = coords;
    drawingRef.current.lastPoint = coords;

    const ctx = drawingRef.current.ctx;
    if (!ctx) return;

    // 如果使用画笔或橡皮擦，开始新路径
    if (drawingRef.current.currentTool === 'pencil' || drawingRef.current.currentTool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
    }
  };

  // 绘制中
  const draw = (e: MouseEvent | TouchEvent) => {
    if (!drawingRef.current.isDrawing) return;

    e.preventDefault();
    const coords = getCoordinates(e);
    const x = coords.x;
    const y = coords.y;

    const ctx = drawingRef.current.ctx;
    if (!ctx) return;

    // 根据当前工具执行不同绘制逻辑
    switch (drawingRef.current.currentTool) {
      case 'pencil':
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = drawingRef.current.currentColor;
        ctx.lineWidth = drawingRef.current.lineWidth;
        ctx.lineTo(x, y);
        ctx.stroke();
        break;
      case 'eraser':
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = drawingRef.current.lineWidth * 2;
        ctx.lineTo(x, y);
        ctx.stroke();
        // 不要在这里恢复合成模式，否则会覆盖之前的擦除
        break;
      case 'rectangle':
      case 'circle':
      case 'square':
        // 形状工具在鼠标释放时绘制
        break;
    }

    drawingRef.current.lastPoint = { x, y };
  };

  // 结束绘制
  const stopDrawing = () => {
    if (!drawingRef.current.isDrawing) return;

    drawingRef.current.isDrawing = false;

    const ctx = drawingRef.current.ctx;
    if (!ctx) return;

    // 如果是形状工具，绘制最终形状
    if (['rectangle', 'circle', 'square'].includes(drawingRef.current.currentTool)) {
      const width = drawingRef.current.lastPoint.x - drawingRef.current.startPoint.x;
      const height = drawingRef.current.lastPoint.y - drawingRef.current.startPoint.y;

      // 恢复绘制样式
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = drawingRef.current.currentColor;
      ctx.fillStyle = drawingRef.current.currentColor;
      ctx.lineWidth = drawingRef.current.lineWidth;

      // 绘制形状
      if (drawingRef.current.currentTool === 'rectangle') {
        if (drawingRef.current.fillShape) {
          ctx.fillRect(drawingRef.current.startPoint.x, drawingRef.current.startPoint.y, width, height);
        } else {
          ctx.strokeRect(drawingRef.current.startPoint.x, drawingRef.current.startPoint.y, width, height);
        }
      } else if (drawingRef.current.currentTool === 'circle') {
        const centerX = drawingRef.current.startPoint.x + width / 2;
        const centerY = drawingRef.current.startPoint.y + height / 2;
        const radius = Math.sqrt(width * width + height * height) / 2;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);

        if (drawingRef.current.fillShape) {
          ctx.fill();
        } else {
          ctx.stroke();
        }
      } else if (drawingRef.current.currentTool === 'square') {
        const size = Math.max(Math.abs(width), Math.abs(height));
        const squareWidth = width < 0 ? -size : size;
        const squareHeight = height < 0 ? -size : size;

        if (drawingRef.current.fillShape) {
          ctx.fillRect(drawingRef.current.startPoint.x, drawingRef.current.startPoint.y, squareWidth, squareHeight);
        } else {
          ctx.strokeRect(drawingRef.current.startPoint.x, drawingRef.current.startPoint.y, squareWidth, squareHeight);
        }
      }
    }

    // 恢复橡皮擦的合成模式
    if (drawingRef.current.currentTool === 'eraser') {
      ctx.globalCompositeOperation = 'source-over';
    }

    // 保存状态
    saveState();
  };

  // 处理工具切换
  const handleToolChange = (tool: DrawingTool) => {
    setCurrentTool(tool);
    drawingRef.current.currentTool = tool;
  };

  // 处理颜色切换
  const handleColorChange = (color: string) => {
    setCurrentColor(color);
    drawingRef.current.currentColor = color;

    // 更新Canvas上下文样式
    const ctx = drawingRef.current.ctx;
    if (ctx) {
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
    }
  };

  // 处理线条粗细变化
  const handleLineWidthChange = (width: number) => {
    setLineWidth(width);
    drawingRef.current.lineWidth = width;

    // 更新Canvas上下文样式
    const ctx = drawingRef.current.ctx;
    if (ctx) {
      ctx.lineWidth = width;
    }
  };

  // 处理填充选项变化
  const handleFillShapeChange = (checked: boolean) => {
    setFillShape(checked);
    drawingRef.current.fillShape = checked;
  };

  /**
   * 将Canvas导出为图片并下载
   * @param canvas Canvas元素引用
   * @param filename 文件名（可选，默认为canvas_image_当前时间戳）
   * @param format 图片格式（可选，默认为'png'）
   * @param quality 图片质量（可选，0-1，默认为1，仅对jpeg/webp有效）
   */
  const exportCanvasAsImage = (
    canvas: HTMLCanvasElement,
    filename?: string,
    format: 'png' | 'jpeg' | 'webp' = 'png',
    quality: number = 1
  ) => {
    if (!canvas) {
      console.error('Canvas元素不存在');
      return;
    }

    // 生成文件名
    const timestamp = Date.now();
    const defaultName = `canvas_image_${timestamp}`;
    const fileName = filename || defaultName;

    // 确定MIME类型
    let mimeType: string;
    switch (format) {
      case 'jpeg':
        mimeType = 'image/jpeg';
        break;
      case 'webp':
        mimeType = 'image/webp';
        break;
      default:
        mimeType = 'image/png';
    }

    try {
      // 创建DataURL
      let dataUrl: string;
      if (format === 'png') {
        dataUrl = canvas.toDataURL(mimeType);
      } else {
        dataUrl = canvas.toDataURL(mimeType, quality);
      }

      // 创建下载链接
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${fileName}.${format}`;

      // 触发下载
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log(`图片已导出: ${fileName}.${format}`);
      return true;
    } catch (error) {
      console.error('导出图片失败:', error);
      return false;
    }
  };

  // 初始化Canvas和事件监听
  useEffect(() => {
    // 初始化Canvas
    initCanvas();

    const canvas = canvasRef.current;
    if (!canvas) return;

    // 鼠标事件处理函数
    const handleMouseDown = (e: MouseEvent) => startDrawing(e);
    const handleMouseMove = (e: MouseEvent) => draw(e);
    const handleMouseUp = () => stopDrawing();
    const handleMouseOut = () => stopDrawing();

    // 触摸事件处理函数
    const handleTouchStart = (e: TouchEvent) => startDrawing(e);
    const handleTouchMove = (e: TouchEvent) => draw(e);
    const handleTouchEnd = () => stopDrawing();

    // 添加事件监听器
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseout', handleMouseOut);

    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', handleTouchEnd);

    // 键盘快捷键
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z 或 Cmd+Z 撤销
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
      }

      // Ctrl+Y 或 Cmd+Y 重做
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }

      // Escape 键取消当前绘制
      if (e.key === 'Escape' && drawingRef.current.isDrawing) {
        stopDrawing();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // 清理函数
    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseout', handleMouseOut);

      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);

      window.removeEventListener('keydown', handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 空依赖数组，只在挂载和卸载时执行

  // 更新状态栏
  useEffect(() => {
    setStatusText(`当前工具: ${toolNames[currentTool]} | 颜色: ${colorNames[currentColor] || currentColor} | 粗细: ${lineWidth}px${fillShape ? ' | 填充模式' : ''}`);
  }, [currentTool, currentColor, lineWidth, fillShape]);

  return (
    <div className={classNames("drawing-canvas-app", {
      "drawing-canvas-app-undo": !canvasModel
    })}>
      <div className="app-canvas-container">
        <canvas
          ref={canvasRef}
          style={{
            display: 'block',
            cursor: 'crosshair',
            touchAction: 'none'
          }}
        />
        {/* 
          <div className="status-bar">
            {statusText}
          </div> */}
      </div>
      <div className="toolbar-container">
        <div className="toolbar">
          <div className="toolbar-top-row">
            <div className="tool-group">
              <h3>绘图工具:</h3>
              <div className="tools">
                {tools.map((tool) => (
                  <button
                    key={tool.id}
                    className={`tool-btn ${currentTool === tool.id ? 'active' : ''}`}
                    onClick={() => handleToolChange(tool.id)}
                    title={tool.title}
                  >
                    <i className={tool.icon}></i>
                  </button>
                ))}
              </div>
            </div>

            <div className="tool-group">
              <h3>颜色:</h3>
              <div className="color-picker">
                {colorOptions.map((color) => (
                  <div
                    key={color.value}
                    className={`color-option ${currentColor === color.value ? 'active' : ''}`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => handleColorChange(color.value)}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="toolbar-bottom-row">
            <div className="tool-group">
              <div className="slider-container">
                <label htmlFor="lineWidth">粗细:</label>
                <input
                  type="range"
                  id="lineWidth"
                  min="1"
                  max="30"
                  value={lineWidth}
                  onChange={(e) => handleLineWidthChange(parseInt(e.target.value))}
                />
                <span>{lineWidth}</span>px
              </div>
            </div>

            <div className="tool-group">
              <div className="fill-toggle">
                <label>
                  <input
                    type="checkbox"
                    id="fillShape"
                    checked={fillShape}
                    onChange={(e) => handleFillShapeChange(e.target.checked)}
                  />
                  填充形状
                </label>
                &nbsp;&nbsp;
                <label>
                  <input
                    type="checkbox"
                    id="canvas-model"
                    checked={canvasModel}
                    onChange={(e) => {
                      setCanvasModel(e.target.checked)
                    }}
                  />
                  画布模式
                </label>
              </div>
            </div>

            <div className="action-buttons">
              <button
                className="action-btn history-btn"
                onClick={undo}
                disabled={historyIndex <= 0}
                title="撤销"
              >
                <i className="fas fa-undo"></i> 撤销
              </button>
              <button
                className="action-btn history-btn"
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                title="重做"
              >
                <i className="fas fa-redo"></i> 重做
              </button>
              <button className="action-btn clear-btn" onClick={clearCanvas} title="清空画布">
                <i className="fas fa-trash-alt"></i> 清空
              </button>
              <button
                className="action-btn history-btn"
                onClick={() => {
                  const canvas = canvasRef.current;
                  exportCanvasAsImage(canvas!, 'image');
                }}
              >
                <i className="fas fa-undo"></i> 导出为图片
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrawingCanvas;