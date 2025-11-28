// src/components/SvgIcon/index.tsx
import { memo, useRef, useEffect, type SVGProps, type ReactElement } from 'react';

interface SvgIconProps {
  /** SVG 组件（通过 import xxx from 'xxx.svg?react' 导入） */
  icon: React.ElementType<SVGProps<SVGSVGElement>>;
  /** 填充色（覆盖所有内部元素的 fill） */
  color?: string;
  /** 描边色（覆盖所有内部元素的 stroke） */
  strokeColor?: string;
  /** 尺寸（数字=px，字符串支持单位如 '2rem'） */
  size?: number | string;
  /** 自定义类名 */
  className?: string;
  /** 原生 SVG 属性透传 */
  svgProps?: SVGProps<SVGSVGElement>;
}

const SvgIcon = memo(({
  icon: Icon,
  color = 'currentColor',
  strokeColor = 'none',
  size = 24,
  className,
  svgProps,
}: SvgIconProps): ReactElement => {
  // 外层容器的 ref（非 SVG 组件，无 ref 警告）
  const containerRef = useRef<HTMLSpanElement>(null);

  // 组件挂载/更新后，通过容器查找 SVG 元素并修改样式
  useEffect(() => {
    if (!containerRef.current) return;

    // 从容器中获取 SVG 根元素（避开直接给函数组件传 ref）
    const svgElement = containerRef.current.querySelector('svg');
    if (!svgElement) return;

    // 获取 SVG 内部所有图形元素
    const elements = svgElement.querySelectorAll('path, g, circle, rect, polygon, line') as NodeListOf<SVGElement>;

    elements.forEach(el => {
      // 覆盖填充色
      if (color) {
        el.setAttribute('fill', color);
        el.style.fill = color;
      }
      // 覆盖描边色
      if (strokeColor) {
        el.setAttribute('stroke', strokeColor);
        el.style.stroke = strokeColor;
      }
    });

    // 同步尺寸到 SVG 元素
    svgElement.style.width = typeof size === 'number' ? `${size}px` : size;
    svgElement.style.height = typeof size === 'number' ? `${size}px` : size;
  }, [color, strokeColor, size]);

  // 容器样式：inline-block 避免换行
  const containerStyle = {
    display: 'inline-block',
    width: typeof size === 'number' ? `${size}px` : size,
    height: typeof size === 'number' ? `${size}px` : size,
    verticalAlign: 'middle',
  };

  return (
    <span
      ref={containerRef}
      className={className}
      style={containerStyle}
    >
      {/* 直接渲染 SVG 组件，无需传 ref */}
      <Icon {...svgProps} />
    </span>
  );
});

export default SvgIcon;