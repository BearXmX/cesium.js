import * as Cesium from 'cesium'

export default class LineProgressMaterialProperty {
  name: string
  definitionChanged: Cesium.Event
  baseColor: Cesium.Color // 仍保留该属性，只是默认由progressColor生成
  progressColor: Cesium.Color
  duration: number
  stayDuration: number // 缩短默认等待时间
  direction: 'forward' | 'reverse'
  _time: number

  /**
   * @description: 初始化带停留功能的进度条式线条增长材质
   * @param {string} name 材质名称
   * @param {Cesium.Color} progressColor 进度条颜色（默认：紫色）
   * @param {number} duration 单次增长时长（默认：3000毫秒）
   * @param {number} stayDuration 填充完成后停留时长（默认：500毫秒，缩短等待）
   * @param {'forward' | 'reverse'} direction 增长方向（默认：forward）
   */
  constructor(
    name: string,
    progressColor: Cesium.Color = Cesium.Color.VIOLET, // 默认进度条颜色为紫色
    duration: number = 10000,
    stayDuration: number = 500, // 缩短默认等待时间（从1000→500毫秒）
    direction: 'forward' | 'reverse' = 'forward'
  ) {
    this.name = name
    this.definitionChanged = new Cesium.Event()
    // 核心修改：baseColor默认取progressColor的颜色，透明度设为0.7
    this.progressColor = progressColor
    this.baseColor = progressColor.withAlpha(0.5)
    this.duration = Math.max(500, duration)
    this.stayDuration = Math.max(0, stayDuration)
    this.direction = direction
    this._time = Date.now()

    // @ts-ignore
    Cesium.Material._materialCache.addMaterial('LineProgressMaterialProperty', {
      fabric: {
        type: 'LineProgressMaterialProperty',
        uniforms: {
          progress: 0.0,
          baseColor: this.baseColor,
          progressColor: this.progressColor,
          direction: this.direction === 'forward' ? 1.0 : 0.0,
        },
        source: `
          czm_material czm_getMaterial(czm_materialInput materialInput)
          {
              czm_material material = czm_getDefaultMaterial(materialInput);
              vec2 st = materialInput.st; 
              
              float currentProgress = direction == 1.0 ? progress : (1.0 - progress);
              float smoothEdge = smoothstep(currentProgress, currentProgress + 0.01, st.s);
              
              // 手动计算预乘alpha，适配Cesium默认规则
              vec3 baseColorPremultiplied = baseColor.rgb * baseColor.a;
              vec3 progressColorPremultiplied = progressColor.rgb * progressColor.a;
              
              // 混合预乘后的颜色，避免透明度叠加错误
              vec3 finalColor = mix(
                  progressColorPremultiplied, 
                  baseColorPremultiplied, 
                  smoothEdge          
              );
              
              // 混合透明度
              float finalAlpha = mix(
                  progressColor.a,
                  baseColor.a,
                  smoothEdge
              );
              
              material.diffuse = finalColor;
              material.alpha = finalAlpha;
              return material;
          }
        `,
      },
      // 强制启用半透明渲染管线
      translucent: () => true,
    })
  }

  isConstant() {
    return false
  }

  getType() {
    return 'LineProgressMaterialProperty'
  }

  /**
   * @description: 实时更新进度值（核心：分增长/停留阶段）
   * 注释说明：放开下方「不循环逻辑」的注释，同时注释掉「循环逻辑」，即可关闭进度条循环
   */
  getValue(time: Cesium.JulianDate, result: any) {
    if (!Cesium.defined(result)) {
      result = {}
    }

    const now = Date.now()
    const totalCycle = this.duration + this.stayDuration // 单次完整周期（增长+停留）
    const timeOffset = now - this._time // 距离当前周期起始的时间偏移

    let progress = 0.0
    // 分阶段计算进度
    if (timeOffset < this.duration) {
      // 阶段1：增长阶段（0→1）
      progress = timeOffset / this.duration
    } else if (timeOffset < totalCycle) {
      // 阶段2：停留阶段（保持1）
      progress = 1.0
    } else {
      // ====================== 循环逻辑（默认启用） ======================
      // 阶段3：重置周期，重新开始（循环的核心）
      this._time = now - (timeOffset % totalCycle) // 修正时间戳，避免重置后进度跳变
      progress = 0.0
      // ==================================================================

      // ====================== 不循环逻辑（放开注释启用） ======================
      // 说明：放开以下2行注释，同时注释掉上面的「循环逻辑」，进度条将停留在100%，不再循环
      // progress = 1.0; // 填充完成后保持100%进度
      // // 不再重置_time，永久停留在完成状态
      // ==================================================================
    }

    result.progress = progress
    result.baseColor = this.baseColor
    result.progressColor = this.progressColor
    result.direction = this.direction === 'forward' ? 1.0 : 0.0
    return result
  }

  equals(other: any) {
    return (
      other instanceof LineProgressMaterialProperty &&
      this.name === other.name &&
      Cesium.Color.equals(this.baseColor, other.baseColor) &&
      Cesium.Color.equals(this.progressColor, other.progressColor) &&
      this.direction === other.direction &&
      this.stayDuration === other.stayDuration
    )
  }

  // 扩展方法：动态修改进度条颜色（同步更新baseColor的颜色，保持透明度0.7）
  setProgressColor(color: Cesium.Color) {
    this.progressColor = color
    this.baseColor = color.withAlpha(this.baseColor.alpha) // 保留原有透明度
    this.definitionChanged.raiseEvent(this)
  }

  // 保留修改baseColor的方法，方便手动调整
  setBaseColor(color: Cesium.Color) {
    this.baseColor = color
    this.definitionChanged.raiseEvent(this)
  }

  // 快捷方法：仅修改baseColor的透明度（无需传入完整颜色）
  setBaseAlpha(alpha: number) {
    this.baseColor = this.baseColor.withAlpha(Math.max(0, Math.min(1, alpha)))
    this.definitionChanged.raiseEvent(this)
  }

  toggleDirection() {
    this.direction = this.direction === 'forward' ? 'reverse' : 'forward'
    this.definitionChanged.raiseEvent(this)
  }

  resetProgress() {
    this._time = Date.now()
    this.definitionChanged.raiseEvent(this)
  }

  setStayDuration(duration: number) {
    this.stayDuration = Math.max(0, duration)
    this.definitionChanged.raiseEvent(this)
  }
}
