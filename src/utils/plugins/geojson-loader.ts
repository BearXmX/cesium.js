import * as Cesium from 'cesium'

const distanceDisplayCondition = new Cesium.DistanceDisplayCondition(25000, 20000000)

/**
 * GeoJSON 单个要素接口（包含自定义标签配置）
 */
interface GeoJsonFeature {
  properties?: FeatureProperties
  geometry?: any // 保留geometry原始结构，Cesium原生会处理
  type?: string
}

/**
 * GeoJSON 完整数据接口
 */
interface GeoJsonData {
  type?: string
  properties?: TopLevelProperties
  features?: GeoJsonFeature[]
}

/**
 * 顶层全局配置接口（GeoJSON根节点properties）
 */
interface TopLevelProperties {
  pointToLabel?: number
  pointWithLabel?: number
  pointToIcon?: number
  iconUrl?: string
  iconWithLabel?: number
  iconScale?: number

  // 几何样式配置
  fillColor?: string
  fillOpacity?: number
  outlineColor?: string
  outlineOpacity?: number
  outlineWidth?: number
  polylineClampToGround?: number

  pointOutlineColor?: string
  pointOutlineOpacity?: number
  pointOutlineWidth?: number
  pointSize?: number

  // 标签样式配置
  labelText?: string
  labelPosition?: [number, number] | [number, number, number] // 经纬度[lon, lat] 或 经纬度+高度[lon, lat, height]
  labelFontSize?: number
  labelFillColor?: string
  labelOutlineColor?: string
  labelOutlineWidth?: number
  labelScale?: number
  labelOpacity?: number
  labelShow?: number
  labelTextZIndex?: number
  labelClampToGround?: number
}

/**
 * 单个Feature配置接口（继承顶层配置结构）
 */
interface FeatureProperties extends TopLevelProperties {
  // 可扩展单个Feature独有的配置
  [key: string]: any
}

/**
 * 合并后的配置接口（顶层 + 单个Feature）
 */
type MergedProperties = Required<Pick<TopLevelProperties, keyof TopLevelProperties>> & {
  [key: string]: any
}

/**
 * 自定义 GeoJSON 加载器（标签单独创建 Entity，直接读取 labelPosition 配置）
 * 特性：1. 标签位置完全由 labelPosition 配置决定 2. 标签与几何解耦 3. 保留 properties 配置 4. 简化无多余自动推导 5. 优化标签文字显示
 */
class GeoJsonLoader {
  // 私有属性
  private readonly _viewer: Cesium.Viewer // Cesium 视图实例
  private _topLevelProperties: TopLevelProperties // 顶层全局 properties
  private _allEntities: Cesium.Entity[] // 所有实体（几何+独立标签）
  private _currentDataSource: Cesium.GeoJsonDataSource | null // 当前几何数据源
  private _featureRandomFillColors: string[]

  /**
   * 构造函数
   * @param viewer Cesium.Viewer 实例
   */
  constructor(viewer: Cesium.Viewer) {
    if (!viewer || !(viewer instanceof Cesium.Viewer)) {
      throw new Error('构造函数必须传入有效的 Cesium.Viewer 实例')
    }
    this._viewer = viewer
    this._topLevelProperties = {}
    this._allEntities = []
    this._currentDataSource = null

    this._featureRandomFillColors = []
  }

  /**
   * 核心方法：加载并渲染 GeoJSON（标签位置直接读取 labelPosition）
   * @param geoJsonData 已解析的 GeoJSON 对象
   * @returns Promise<Cesium.Entity[]> 所有实体数组
   */
  async render(geoJsonData: GeoJsonData): Promise<Cesium.Entity[]> {
    // 前置校验
    if (!geoJsonData || typeof geoJsonData !== 'object') {
      console.error('请传入有效的GeoJSON格式数据')
      throw new Error('请传入有效的GeoJSON格式数据')
    }

    // 清空上一次结果
    this.clear()

    // 步骤1：提取顶层 properties（含全局 labelPosition）
    this._extractTopLevelProperties(geoJsonData)

    Array.isArray(geoJsonData.features) &&
      geoJsonData.features.forEach((feature, featureIndex) => {
        this._featureRandomFillColors.push(Cesium.Color.fromRandom().toCssHexString())

        feature.properties = { ...(feature.properties || {}), featureIndex: featureIndex }
      })

    // 步骤2：原生加载 GeoJSON（仅获取几何实体）
    this._currentDataSource = await Cesium.GeoJsonDataSource.load(geoJsonData)

    // 步骤4：添加到视图并缓存实体
    this._viewer.dataSources.add(this._currentDataSource)

    // 步骤3：处理几何样式 + 单独创建标签（直接读取 labelPosition）
    const labelEntities = this._processGeometriesAndCreateLabels(geoJsonData)

    const geometryEntities = this._currentDataSource.entities.values.slice()

    this._allEntities = [...geometryEntities, ...labelEntities]

    // 返回所有实体
    return this._allEntities
  }

  /**
   * 清空所有实体和数据源
   */
  clear(): void {
    // 移除几何数据源
    if (this._currentDataSource) {
      this._viewer.dataSources.remove(this._currentDataSource)
      this._currentDataSource = null
    }

    // 移除独立标签实体
    this._allEntities.forEach(entity => {
      if (entity.label && !entity.point && !entity.polygon && !entity.polyline) {
        this._viewer.entities.remove(entity)
      }
    })

    // 清空缓存
    this._allEntities = []
    this._topLevelProperties = {}
    this._featureRandomFillColors = []
  }

  toggleVisibility(): void {
    this._allEntities.forEach(entity => {
      entity.show = !entity.show
    })
  }

  updateEntitiesOpacity(value: number): void {
    this._allEntities.forEach(entity => {
      if (entity.polyline) {
        entity.polyline.material = new Cesium.Color(
          entity.polyline.material.getValue().color.red,
          entity.polyline.material.getValue().color.green,
          entity.polyline.material.getValue().color.blue,
          value,
        ) as unknown as Cesium.MaterialProperty
      }

      if (entity.polygon) {
        // 获取其颜色
        entity.polygon.material = new Cesium.Color(
          entity.polygon.material.getValue().color.red,
          entity.polygon.material.getValue().color.green,
          entity.polygon.material.getValue().color.blue,
          value,
        ) as unknown as Cesium.MaterialProperty
      }

      if (entity.point) {
        entity.point.color = new Cesium.Color(
          entity.point.color!.getValue().red,
          entity.point.color!.getValue().green,
          entity.point.color!.getValue().blue,
          value,
        ) as unknown as Cesium.MaterialProperty

        entity.point.outlineColor = new Cesium.Color(
          entity.point.outlineColor!.getValue().red,
          entity.point.outlineColor!.getValue().green,
          entity.point.outlineColor!.getValue().blue,
          value,
        ) as unknown as Cesium.MaterialProperty
      }

      if (entity.label) {
        entity.label.fillColor = new Cesium.Color(
          entity.label.fillColor!.getValue().red,
          entity.label.fillColor!.getValue().green,
          entity.label.fillColor!.getValue().blue,
          value,
        ) as unknown as Cesium.MaterialProperty

        entity.label.outlineColor = new Cesium.Color(
          entity.label.outlineColor!.getValue().red,
          entity.label.outlineColor!.getValue().green,
          entity.label.outlineColor!.getValue().blue,
          value,
        ) as unknown as Cesium.MaterialProperty
      }
    })
  }

  toggleEntitiesSplitDirection(splitDirection: 'left' | 'right'): void {
    /*     this._allEntities.forEach(entity => {
      if (entity.polygon) {
        console.log('entity.polygon', entity.polygon)
        entity.polygon.splitDirection = splitDirection === 'left' ? Cesium.SplitDirection.LEFT : Cesium.SplitDirection.RIGHT
      }

      if (entity.polyline) {
        entity.polyline.splitDirection = splitDirection === 'left' ? Cesium.SplitDirection.LEFT : Cesium.SplitDirection.RIGHT
      }



      if (entity.label) {
        entity.label.splitDirection = splitDirection === 'left' ? Cesium.SplitDirection.LEFT : Cesium.SplitDirection.RIGHT
      }

            if (entity.point) {
        entity.point.splitDirection = splitDirection === 'left' ? Cesium.SplitDirection.LEFT : Cesium.SplitDirection.RIGHT
      }

      if (entity.billboard) {

        entity.billboard.splitDirection = splitDirection === 'left' ? Cesium.SplitDirection.LEFT : Cesium.SplitDirection.RIGHT
      }
    }) */
  }

  /**
   * 分离获取：所有实体（只读）
   */
  get allEntities(): Cesium.Entity[] {
    return [...this._allEntities]
  }

  /**
   * 私有方法：提取顶层 properties（含 labelPosition）
   * @param geoJsonData GeoJSON 数据对象
   */
  private _extractTopLevelProperties(geoJsonData: GeoJsonData): void {
    if (geoJsonData.properties && typeof geoJsonData.properties === 'object') {
      this._topLevelProperties = {
        pointToLabel: Number(geoJsonData.properties.pointToLabel) || 0,
        pointWithLabel: Number(geoJsonData.properties.pointWithLabel) || 0,
        pointToIcon: Number(geoJsonData.properties.pointToIcon) || 0,
        iconUrl: geoJsonData.properties.iconUrl || '',
        iconWithLabel: Number(geoJsonData.properties.iconWithLabel) || 0,
        iconScale: geoJsonData.properties.iconScale || 0.8,

        // 几何样式配置（完全保留你的原始逻辑）
        fillColor: geoJsonData.properties.fillColor || undefined,
        fillOpacity: geoJsonData.properties.fillOpacity || 0.8,
        outlineColor: geoJsonData.properties.outlineColor || undefined,
        outlineOpacity: geoJsonData.properties.outlineOpacity || 1.0,
        outlineWidth: geoJsonData.properties.outlineWidth || 0,
        polylineClampToGround: Number(geoJsonData.properties.polylineClampToGround) || 0,
        pointOutlineColor: geoJsonData.properties.pointOutlineColor || '#fff',
        pointOutlineOpacity: geoJsonData.properties.pointOutlineOpacity || 1.0,
        pointOutlineWidth: geoJsonData.properties.pointOutlineWidth === 0 ? 0 : geoJsonData.properties.pointOutlineWidth || 1,
        pointSize: geoJsonData.properties.pointSize || 10,

        // 标签样式配置（核心：提取全局 labelPosition）
        labelText: '',
        labelPosition: geoJsonData.properties.labelPosition || [0, 0, 0], // 全局标签位置
        labelFontSize: geoJsonData.properties.labelFontSize || 16,
        labelFillColor: geoJsonData.properties.labelFillColor || undefined,
        labelOutlineColor: geoJsonData.properties.labelOutlineColor || undefined,
        labelOutlineWidth: geoJsonData.properties.labelOutlineWidth || 4,
        labelScale: geoJsonData.properties.labelScale || 1.0,
        labelOpacity: geoJsonData.properties.labelOpacity || 1.0,
        labelShow: Number(geoJsonData.properties.labelShow) || 1, // 新增：提取全局标签显示开关
        labelTextZIndex: [0, 1].includes(geoJsonData.properties.labelTextZIndex as number) ? (geoJsonData.properties.labelTextZIndex as number) : 0,
        labelClampToGround: Number(geoJsonData.properties.labelClampToGround) || 0,
      }
    } else {
      this._topLevelProperties = {
        pointToLabel: 0,
        pointWithLabel: 0,
        pointToIcon: 0,
        iconUrl: '',
        iconWithLabel: 0,
        iconScale: 0.8,

        // 几何样式配置（完全保留你的原始逻辑）
        fillColor: undefined,
        fillOpacity: 0.8,
        outlineColor: undefined,
        outlineOpacity: 1.0,
        outlineWidth: 0,
        polylineClampToGround: 0,

        pointOutlineColor: '#fff',
        pointOutlineOpacity: 1.0,
        pointOutlineWidth: 1,
        pointSize: 10,

        // 标签样式配置（核心：提取全局 labelPosition）
        labelText: '',
        labelPosition: [0, 0, 0], // 全局标签位置
        labelFontSize: 16,
        labelFillColor: undefined,
        labelOutlineColor: undefined,
        labelOutlineWidth: 4,
        labelScale: 1.0,
        labelOpacity: 1.0,
        labelShow: 1, // 新增：提取全局标签显示开关
        labelTextZIndex: 0,
        labelClampToGround: 0,
      }
    }
  }

  /**
   * 私有方法：处理几何样式 + 单独创建标签（核心：直接读取 labelPosition）
   * @returns Cesium.Entity[] 独立标签实体数组
   */
  private _processGeometriesAndCreateLabels(geoJsonData: GeoJsonData): Cesium.Entity[] {
    const labelEntities: Cesium.Entity[] = []

    if (!this._currentDataSource) return labelEntities

    Array.isArray(geoJsonData.features) &&
      geoJsonData.features.forEach((feature: any) => {
        if (feature.properties && feature.properties.labelPosition) {
          const mergedProperties = { ...this._topLevelProperties, ...(feature.properties || {}) }

          const labelEntity = this._createLabelByPositionConfig(mergedProperties)
          if (labelEntity) {
            labelEntities.push(labelEntity)
            this._viewer.entities.add(labelEntity)
          }
        }
      })

    // 遍历所有几何实体（完全保留你的原始逻辑）
    this._currentDataSource.entities.values.forEach(geometryEntity => {
      // 1. 获取合并后的配置（单个 Feature > 全局顶层）
      const featureProperties = geometryEntity.properties?.getValue(Cesium.JulianDate.now()) || {}

      const mergedProperties = { ...this._topLevelProperties, ...featureProperties }

      // 2. 处理几何实体样式（完全保留你的原始逻辑，不做任何修改，保证几何可见）
      // ===== 新增：修复纹理超限错误 - 强制关闭 Billboard，启用 Point =====
      // 1. 关闭默认的 Billboard 渲染（避免生成纹理图集）
      if (geometryEntity.billboard) {
        geometryEntity.billboard = undefined // 禁用 Billboard

        // 2. 强制启用 Point 渲染（无纹理图集，支持大量点）
        if (!geometryEntity.point) {
          geometryEntity.point = new Cesium.PointGraphics() // 初始化 Point 图形
        }
      }

      this._processGeometryStyle(geometryEntity, mergedProperties)
    })

    return labelEntities
  }

  /**
   * 私有方法：处理几何实体样式（完全保留你的原始逻辑，一字未改，保证几何正常显示）
   * @param geometryEntity 几何实体
   * @param mergedProperties 合并后的配置
   */
  private _processGeometryStyle(geometryEntity: Cesium.Entity, mergedProperties: MergedProperties): void {
    geometryEntity.properties?.addProperty('mergedProperties', mergedProperties)

    // 移除原生标签，确保几何实体纯净
    if (geometryEntity.label) {
      geometryEntity.label = undefined
    }

    // 处理线实体
    if (geometryEntity.polyline) {
      const lineColor = this._convertToCesiumColor(
        mergedProperties.fillColor,
        mergedProperties.fillOpacity,
        Cesium.Color.fromCssColorString(this._featureRandomFillColors[mergedProperties.featureIndex]),
      )

      if (lineColor) geometryEntity.polyline.material = lineColor as unknown as Cesium.MaterialProperty
      geometryEntity.polyline.width = this._clampValue(mergedProperties.outlineWidth, 0.5, 20, 3) as unknown as Cesium.Property
      geometryEntity.polyline.clampToGround = (Boolean(mergedProperties.polylineClampToGround) ?? false) as unknown as Cesium.Property
    }

    // 处理多边形实体
    if (geometryEntity.polygon) {
      const fillColor = this._convertToCesiumColor(
        mergedProperties.fillColor,
        mergedProperties.fillOpacity,
        Cesium.Color.fromCssColorString(this._featureRandomFillColors[mergedProperties.featureIndex]),
      )

      if (fillColor) {
        geometryEntity.polygon.material = fillColor as unknown as Cesium.MaterialProperty
      }

      const outlineColor = this._convertToCesiumColor(mergedProperties.outlineColor, mergedProperties.outlineOpacity)

      const outlineWidth = this._clampValue(mergedProperties.outlineWidth, 0, 10, 4)

      if (outlineColor && outlineWidth) {
        geometryEntity.polygon.outline = false as unknown as Cesium.Property

        geometryEntity.polyline = new Cesium.PolylineGraphics({
          positions: geometryEntity.polygon.hierarchy!.getValue().positions as unknown as Cesium.Property,
          material: outlineColor as unknown as Cesium.MaterialProperty,
          width: outlineWidth as unknown as Cesium.Property,
        })
      } else {
        geometryEntity.polygon.outline = false as unknown as Cesium.Property
      }
    }

    // 处理点实体
    if (geometryEntity.point) {
      geometryEntity.point.splitDirection = Cesium.SplitDirection.NONE as unknown as Cesium.Property

      geometryEntity.point.distanceDisplayCondition = distanceDisplayCondition as unknown as Cesium.Property
      const fillColor = this._convertToCesiumColor(mergedProperties.fillColor, mergedProperties.fillOpacity, Cesium.Color.RED)

      if (fillColor) geometryEntity.point.color = fillColor as unknown as Cesium.Property

      const outlineColor = this._convertToCesiumColor(mergedProperties.pointOutlineColor, mergedProperties.pointOutlineOpacity, Cesium.Color.WHITE)

      const outlineWidth = this._clampValue(mergedProperties.pointOutlineWidth, 0, 10, 1)

      if (outlineColor && outlineWidth) {
        geometryEntity.point.outlineColor = outlineColor as unknown as Cesium.Property
        geometryEntity.point.outlineWidth = outlineWidth as unknown as Cesium.Property
      } else {
        geometryEntity.point.outlineColor = Cesium.Color.TRANSPARENT as unknown as Cesium.Property
        geometryEntity.point.outlineWidth = 0 as unknown as Cesium.Property
      }

      geometryEntity.point.disableDepthTestDistance = 0 as unknown as Cesium.Property
      geometryEntity.point.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND as unknown as Cesium.Property
      geometryEntity.point.pixelSize = this._clampValue(mergedProperties.pointSize, 1, 20, 10) as unknown as Cesium.Property
    }

    if (geometryEntity.point && (!!mergedProperties.pointToLabel || !!mergedProperties.pointWithLabel || !!mergedProperties.iconWithLabel)) {
      geometryEntity.label = (this._createLabelGraphics(mergedProperties)?.label as Cesium.LabelGraphics) ?? undefined

      if ((!!mergedProperties.pointWithLabel || !!mergedProperties.iconWithLabel) && geometryEntity.label) {
        geometryEntity.label.pixelOffset = new Cesium.Cartesian2(0, -25) as unknown as Cesium.Property
      }
    }

    /* pointWithLabel优先级高 */
    if (geometryEntity.point && !mergedProperties.pointWithLabel && (!!mergedProperties.pointToIcon || !!mergedProperties.iconWithLabel)) {
      const prefix = 'https://jingan-deploy-test.oss-cn-shanghai.aliyuncs.com/img'
      geometryEntity.point = undefined

      geometryEntity.billboard = new Cesium.BillboardGraphics({
        show: true,

        image:
          typeof mergedProperties.iconUrl === 'string' && mergedProperties.iconUrl.length > 0
            ? mergedProperties.iconUrl.startsWith('/')
              ? prefix + mergedProperties.iconUrl
              : mergedProperties.iconUrl.startsWith('http')
                ? mergedProperties.iconUrl
                : window.$$prefix + '/position-icon-landmark.svg'
            : window.$$prefix + '/position-icon-landmark.svg',
        scale: this._clampValue(mergedProperties.iconScale, 0.1, 2, 0.8) as unknown as Cesium.Property,
        distanceDisplayCondition: distanceDisplayCondition as unknown as Cesium.Property,
        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND as unknown as Cesium.Property,
        disableDepthTestDistance: 0 as unknown as Cesium.Property,
      })
    }

    if (geometryEntity.point && !!mergedProperties.pointToLabel) {
      geometryEntity.point = undefined
    }
  }

  private _createLabelGraphics(mergedProperties: MergedProperties): {
    position: Cesium.PositionProperty | Cesium.Cartesian3 | Cesium.CallbackPositionProperty | undefined
    label: Cesium.LabelGraphics
  } | null {
    // ===== 仅优化：文字相关校验（避免空文字、空格创建无效标签）=====
    const rawLabelText = mergedProperties.labelText || ''

    const labelText = rawLabelText.trim() // 去除前后空格，避免纯空格文字

    // 无有效文字直接返回，不创建无效标签

    if (!labelText || typeof labelText !== 'string') {
      return null
    }

    // 原有：labelPosition 配置校验
    const labelPositionConfig =
      typeof mergedProperties.labelPosition === 'string' ? JSON.parse(mergedProperties.labelPosition) : mergedProperties.labelPosition

    if (!labelPositionConfig || !Array.isArray(labelPositionConfig) || labelPositionConfig.length < 2) {
      console.error('labelPosition配置参数有误，跳过标签创建')
      return null
    }

    // 原有：转换 labelPosition 配置为 Cesium 坐标
    const labelCartesian3 = this._convertLabelPositionToCartesian3(labelPositionConfig)

    if (!labelCartesian3) return null

    // 原有：标签颜色与边框配置
    const labelFillColor = this._convertToCesiumColor(mergedProperties.labelFillColor, mergedProperties.labelOpacity, Cesium.Color.WHITE)
    const labelOutlineColor = this._convertToCesiumColor(mergedProperties.labelOutlineColor, mergedProperties.labelOpacity, Cesium.Color.BLACK)
    const labelOutlineWidth = this._clampValue(mergedProperties.labelOutlineWidth, 0, 8, 4)

    const labelFontSize = this._clampValue(mergedProperties.labelFontSize, 16, 40, 16)

    const labelScale = this._clampValue(mergedProperties.labelScale, 0.1, 1, 1)

    const labelConfig = {
      position: labelCartesian3,
      label: new Cesium.LabelGraphics({
        text: labelText, // 赋值处理后的纯文字（无前后空格）
        show: !!mergedProperties.labelShow,
        scale: labelScale,
        verticalOrigin: Cesium.VerticalOrigin.CENTER,
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        heightReference: !!mergedProperties.labelClampToGround ? Cesium.HeightReference.CLAMP_TO_GROUND : Cesium.HeightReference.NONE,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        fillColor: labelFillColor,
        outlineColor: labelOutlineColor,
        outlineWidth: labelOutlineWidth,
        font: `${labelFontSize}px sans-serif`,
        distanceDisplayCondition: distanceDisplayCondition,
      }),
    }

    if (mergedProperties.labelTextZIndex === 1) {
      labelConfig.label.disableDepthTestDistance = Number.POSITIVE_INFINITY as unknown as Cesium.Property
    }

    return labelConfig
  }

  /**
   * 核心私有方法：根据 labelPosition 配置创建独立标签（仅优化文字相关逻辑，保留你的原始骨架）
   * @param mergedProperties 合并后的配置（含 labelPosition）
   * @param geometryEntity 关联的几何实体（仅继承 properties）
   * @returns Cesium.Entity | null 独立标签实体（无有效配置则返回 null）
   */
  private _createLabelByPositionConfig(mergedProperties: MergedProperties): Cesium.Entity | null {
    const label = this._createLabelGraphics(mergedProperties)

    if (!label?.label) return null

    // 原有：创建独立标签 Entity
    const labelEntity = new Cesium.Entity({
      position: label.position,
      label: label.label,
    })

    return labelEntity
  }

  /**
   * 辅助方法：将 labelPosition 配置转换为 Cesium.Cartesian3 坐标（直接转换，无多余逻辑）
   * @param labelPosition 配置数组 [lon, lat] 或 [lon, lat, height]
   * @returns Cesium.Cartesian3 | null 转换后的坐标
   */
  private _convertLabelPositionToCartesian3(labelPosition: number[]): Cesium.Cartesian3 | null {
    try {
      // 提取经纬度和高度（高度可选，默认 0）
      const lon = parseFloat(labelPosition[0].toString())
      const lat = parseFloat(labelPosition[1].toString())
      const height = labelPosition.length >= 3 ? parseFloat(labelPosition[2].toString()) : 0

      // 校验数值有效性
      if (isNaN(lon) || isNaN(lat) || isNaN(height)) return null

      // 转换为 Cesium 笛卡尔坐标（直接转换，不做其他处理）
      return Cesium.Cartesian3.fromDegrees(lon, lat, height)
    } catch (e) {
      console.error('labelPosition坐标转换失败')
      return null
    }
  }

  private _convertToCesiumColor(colorStr?: string, opacity?: number, defaultColor?: Cesium.Color): Cesium.Color | undefined {
    if (!colorStr) {
      return defaultColor ? Cesium.Color.fromAlpha(defaultColor!, Number(opacity) ?? 1.0) : undefined
    }

    try {
      if (colorStr.startsWith('#') || colorStr.startsWith('rgb') || colorStr.startsWith('rgba')) {
        const color = Cesium.Color.fromCssColorString(colorStr)
        return Cesium.Color.fromAlpha(color, Number(opacity) ?? color.alpha)
      }

      return defaultColor ? Cesium.Color.fromAlpha(defaultColor!, Number(opacity) ?? 1.0) : undefined
    } catch (e) {
      return defaultColor ? Cesium.Color.fromAlpha(defaultColor!, Number(opacity) ?? 1.0) : undefined
    }
  }

  /**
   * 辅助方法：数值边界夹紧（保持你的原始逻辑，仅兼容非数字入参）
   */
  private _clampValue(value: any, min: number, max: number, defaultValue: number): number {
    // 仅优化：兼容非数字入参，避免报错（保持你的核心逻辑）
    if (typeof value !== 'number' || isNaN(value)) {
      return defaultValue
    }
    return Math.max(min, Math.min(max, value))
  }
}

export default GeoJsonLoader
