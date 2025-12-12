import * as Cesium from 'cesium'

export default class LineShadowMaterialProperty {
  name: string
  definitionChanged: Cesium.Event
  lineColor: Cesium.Color
  shadowColor: Cesium.Color
  lineWidth: number
  shadowWidth: number
  shadowBlur: number
  shadowDirection: 'outwards' | 'inwards'
  _time: number

  /**
   * @description: 初始化线段阴影材质
   * @param {string} name 材质名称
   * @param {Cesium.Color} lineColor 线段颜色
   * @param {Cesium.Color | null} shadowColor 阴影颜色（可选，不传入则使用线段色的0.6透明度）
   * @param {number} lineWidth 线段宽度（像素）
   * @param {number} shadowWidth 阴影扩展宽度（像素）
   * @param {number} shadowBlur 阴影模糊度 0-1
   * @param {'outwards' | 'inwards'} shadowDirection 阴影方向
   */
  constructor(
    name: string,
    lineColor: Cesium.Color = Cesium.Color.WHITE,
    shadowColor: Cesium.Color | null = null,
    lineWidth: number = 10,
    shadowWidth: number = 30,
    shadowBlur: number = 0.8,
    shadowDirection: 'outwards' | 'inwards' = 'outwards'
  ) {
    this.name = name
    this.definitionChanged = new Cesium.Event()
    this.lineColor = lineColor

    // 如果传入了阴影色就使用，否则使用线段色的0.8透明度
    this.shadowColor = shadowColor || lineColor.withAlpha(0.8)

    this.lineWidth = Math.max(1, lineWidth)
    this.shadowWidth = Math.max(0, shadowWidth)
    this.shadowBlur = Math.max(0, Math.min(1, shadowBlur))
    this.shadowDirection = shadowDirection
    this._time = Date.now()

    // @ts-ignore
    Cesium.Material._materialCache.addMaterial('LineShadowMaterialProperty', {
      fabric: {
        type: 'LineShadowMaterialProperty',
        uniforms: {
          lineColor: this.lineColor,
          shadowColor: this.shadowColor,
          lineWidthRatio: this.calculateLineWidthRatio(),
          shadowWidthRatio: this.calculateShadowWidthRatio(),
          shadowBlur: this.shadowBlur,
          shadowSpread: 0.1, // 阴影扩散度
          shadowIntensity: 10, // 阴影强度
          shadowDirection: this.shadowDirection === 'outwards' ? 1.0 : 0.0,
        },
        source: `
          czm_material czm_getMaterial(czm_materialInput materialInput)
          {
            czm_material material = czm_getDefaultMaterial(materialInput);
            vec2 st = materialInput.st;
            
            // 中心位置 (0.5是线段的中心)
            float center = 0.5;
            
            // 计算距离中心的距离（0-0.5范围）
            float dist = abs(st.t - center);
            
            // 计算线段核心部分的边缘
            float lineEdge = lineWidthRatio * 0.5;
            
            // 计算阴影扩展的边缘（包括模糊区域）
            float shadowEdge = lineEdge + shadowWidthRatio * 0.5;
            
            // 计算线段的alpha（线段核心部分）
            float lineAlpha = 1.0 - smoothstep(lineEdge * 0.95, lineEdge, dist);
            
            // 计算阴影的alpha
            float shadowAlpha = 0.0;
            
            if (shadowDirection == 1.0) {
              // 向外阴影
              float shadowDist = max(0.0, dist - lineEdge);
              float normalizedShadowDist = shadowDist / (shadowWidthRatio * 0.5);
              
              // 高斯模糊效果
              float falloff = 1.0 - smoothstep(0.0, 1.0, normalizedShadowDist);
              shadowAlpha = falloff * shadowIntensity;
              
              // 根据模糊度调整衰减曲线
              shadowAlpha = pow(shadowAlpha, 1.0 / (1.0 + shadowBlur * 3.0));
              
            } else {
              // 向内阴影
              float shadowDist = max(0.0, lineEdge - dist);
              float normalizedShadowDist = shadowDist / (shadowWidthRatio * 0.5);
              
              // 高斯模糊效果
              float falloff = 1.0 - smoothstep(0.0, 1.0, normalizedShadowDist);
              shadowAlpha = falloff * shadowIntensity;
              
              // 根据模糊度调整衰减曲线
              shadowAlpha = pow(shadowAlpha, 1.0 / (1.0 + shadowBlur * 3.0));
              
              // 确保阴影在线段内部
              shadowAlpha *= (1.0 - lineAlpha);
            }
            
            // 预乘alpha的颜色
            vec3 lineColorPremultiplied = lineColor.rgb * lineColor.a;
            vec3 shadowColorPremultiplied = shadowColor.rgb * shadowColor.a;
            
            // 混合颜色：先绘制阴影，然后在线段区域用线段颜色覆盖
            vec3 finalColor = shadowColorPremultiplied;
            
            // 在线段区域内，用线段颜色覆盖阴影
            finalColor = mix(finalColor, lineColorPremultiplied, lineAlpha);
            
            // 混合透明度：阴影alpha + 线段alpha
            float finalAlpha = shadowAlpha + lineAlpha * lineColor.a;
            
            material.diffuse = finalColor;
            material.alpha = finalAlpha;
            return material;
          }
        `,
      },
      translucent: () => true,
    })
  }

  /**
   * @description: 计算线段宽度比例
   */
  private calculateLineWidthRatio(): number {
    const totalWidth = this.lineWidth + this.shadowWidth
    return this.lineWidth / totalWidth
  }

  /**
   * @description: 计算阴影宽度比例
   */
  private calculateShadowWidthRatio(): number {
    const totalWidth = this.lineWidth + this.shadowWidth
    return this.shadowWidth / totalWidth
  }

  /**
   * @description: 计算总宽度
   */
  calculateTotalWidth(): number {
    return this.lineWidth + this.shadowWidth
  }

  isConstant() {
    return false
  }

  getType() {
    return 'LineShadowMaterialProperty'
  }

  getValue(time: Cesium.JulianDate, result: any) {
    if (!Cesium.defined(result)) {
      result = {}
    }

    result.lineColor = this.lineColor
    result.shadowColor = this.shadowColor
    result.lineWidthRatio = this.calculateLineWidthRatio()
    result.shadowWidthRatio = this.calculateShadowWidthRatio()
    result.shadowBlur = this.shadowBlur
    result.shadowSpread = 0.1
    result.shadowIntensity = 0.8
    result.shadowDirection = this.shadowDirection === 'outwards' ? 1.0 : 0.0

    return result
  }

  equals(other: any) {
    return (
      other instanceof LineShadowMaterialProperty &&
      this.name === other.name &&
      Cesium.Color.equals(this.lineColor, other.lineColor) &&
      Cesium.Color.equals(this.shadowColor, other.shadowColor) &&
      this.lineWidth === other.lineWidth &&
      this.shadowWidth === other.shadowWidth &&
      this.shadowBlur === other.shadowBlur &&
      this.shadowDirection === other.shadowDirection
    )
  }

  // 修改线段颜色
  setLineColor(color: Cesium.Color) {
    this.lineColor = color
    this.definitionChanged.raiseEvent(this)
  }

  // 手动设置阴影颜色
  setShadowColor(color: Cesium.Color) {
    this.shadowColor = color
    this.definitionChanged.raiseEvent(this)
  }

  // 设置阴影强度
  setShadowIntensity(intensity: number) {
    // 注意：这个方法需要你在Shader uniforms中添加shadowIntensity参数
    // 这里只是示例，实际实现需要修改getValue方法
    this.definitionChanged.raiseEvent(this)
  }

  // 设置线段宽度
  setLineWidth(width: number) {
    this.lineWidth = Math.max(1, width)
    this.definitionChanged.raiseEvent(this)
  }

  // 设置阴影扩展宽度
  setShadowWidth(width: number) {
    this.shadowWidth = Math.max(0, width)
    this.definitionChanged.raiseEvent(this)
  }

  // 设置阴影模糊度
  setShadowBlur(blur: number) {
    this.shadowBlur = Math.max(0, Math.min(1, blur))
    this.definitionChanged.raiseEvent(this)
  }

  // 切换阴影方向
  toggleShadowDirection() {
    this.shadowDirection = this.shadowDirection === 'outwards' ? 'inwards' : 'outwards'
    this.definitionChanged.raiseEvent(this)
  }

  // 重置材质
  reset() {
    this._time = Date.now()
    this.definitionChanged.raiseEvent(this)
  }
}
