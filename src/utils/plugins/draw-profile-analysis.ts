import * as Cesium from 'cesium'
import type { EventType } from './type'
import { message } from 'antd'

const pointLabelStyle = {
  fillColor: Cesium.Color.WHITE,
  outlineColor: Cesium.Color.BLACK,
  outlineWidth: 3,
  style: Cesium.LabelStyle.FILL_AND_OUTLINE,
  verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
  pixelOffset: new Cesium.Cartesian2(0, -10),
  showBackground: true,
  backgroundColor: Cesium.Color.BLACK.withAlpha(0.6),
  backgroundPadding: new Cesium.Cartesian2(3, 2),
  heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
  disableDepthTestDistance: Number.POSITIVE_INFINITY,
}

export type pointMetaType = {
  longitude: number
  latitude: number
  height: number
  heightTostring: string
  distanceFromPrev: number
  distanceFromPrevTostring: string
  distanceFromStart: number
  distanceFromStartTostring: string
}

export type PROFILE_ANALYSIS_OPTIONS_TYPE = {
  width?: number
  color?: string
  onLoadData?: (data: pointMetaType[]) => void
} & EventType & {
    onClick?: (instance: ProfileAnalysis) => void
  }

export const PROFILE_ANALYSIS_OPTIONS_DEFAULT = {
  content: '',
  color: '#00FFFF',
  width: 5,
} as PROFILE_ANALYSIS_OPTIONS_TYPE

class ProfileAnalysis {
  viewer: Cesium.Viewer | null = null
  handler: Cesium.ScreenSpaceEventHandler | null = null
  state: string = 'pending'

  // 存储已确定的点坐标
  fixedPositions: Cesium.Cartesian3[] = []

  // 总距离
  totalDistance: number = 0

  profileAnalysisPointPosition: pointMetaType[] = []

  // 存储所有点的实体
  fixedPointEntityList: Cesium.Entity[] = []
  // 动态线段实体
  activeLineEntity: Cesium.Entity | null = null
  // 浮动点实体
  floatingPointEntity: Cesium.Entity | null = null
  // 完成按钮
  finishButtonEntity: Cesium.Entity | null = null

  // 展示距离的label实体
  distanceLabelEntityList: Cesium.Entity[] = []

  // 插入的点位实体，非点击的点位
  insertPointEntityList: Cesium.Entity[] = []

  totalDistanceLabelEntity: Cesium.Entity | null = null

  slideEntity: Cesium.Entity | null = null

  finalLineEntity: Cesium.Entity | null = null

  options: PROFILE_ANALYSIS_OPTIONS_TYPE = {
    ...PROFILE_ANALYSIS_OPTIONS_DEFAULT,
    onLoadData: (data: pointMetaType[]) => {},
    onCompleted: () => {},
    onCancel() {},
    onShowFinishEntity: () => {},
  }

  constructor(viewer: Cesium.Viewer, options?: PROFILE_ANALYSIS_OPTIONS_TYPE) {
    this.viewer = viewer

    this.options = {
      ...this.options,
      ...options,
    }

    this.start()
  }

  start() {
    const handler = new Cesium.ScreenSpaceEventHandler(this.viewer!.canvas)
    this.handler = handler
    this.state = 'drawing'

    // 鼠标移动事件 - 更新预览
    handler.setInputAction((event: Cesium.ScreenSpaceEventHandler.MotionEvent) => {
      if (this.state !== 'drawing') return

      const newPosition = this.viewer!.scene.pickPosition(event.endPosition)
      if (!Cesium.defined(newPosition)) return

      // 更新浮动点位置
      if (!this.floatingPointEntity) {
        this.floatingPointEntity = this.viewer!.entities.add({
          position: newPosition,
          point: {
            color: Cesium.Color.RED.withAlpha(0.8),
            pixelSize: 5,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          },
        })
      } else {
        //@ts-ignore
        this.floatingPointEntity.position.setValue(newPosition)
      }

      // 更新线段预览（固定点 + 鼠标位置）
      this.updateLinePreview(newPosition)
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

    // 左键点击 - 添加固定点
    this.handler.setInputAction((event: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
      if (this.state !== 'drawing') return

      // 检查是否点击了完成按钮
      const pickedObject = this.viewer!.scene.pick(event.position)
      if (Cesium.defined(pickedObject) && pickedObject.id === this.finishButtonEntity) {
        this.terminateShape()
        return
      }

      const picked = this.viewer!.scene.pickPosition(event.position)
      if (Cesium.defined(picked)) {
        this.defindPoint(picked)
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
  }

  defindPoint(position: Cesium.Cartesian3) {
    // 添加固定点实体
    const pointEntity = this.viewer!.entities.add({
      position,
      point: {
        color: Cesium.Color.RED,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
        pixelSize: 10,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
    })

    this.fixedPositions.push(position)
    this.fixedPointEntityList.push(pointEntity)

    console.log(`添加第 ${this.fixedPositions.length} 个点`)

    // 创建距离标签
    const distance = this.calculateLineLength([
      this.fixedPositions[this.fixedPositions.length > 1 ? this.fixedPositions.length - 2 : 0],
      this.fixedPositions[this.fixedPositions.length > 1 ? this.fixedPositions.length - 1 : 0],
    ])

    const cartographic = Cesium.Cartographic.fromCartesian(position)

    // 在最后一个点上方创建按钮
    const distanceLabelPosition = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, (cartographic.height || 0) + 1)

    const distanceLabel = this.viewer!.entities.add({
      position: distanceLabelPosition,
      label: {
        text: `${this.stringDistance(distance)}米`,
        font: '12px sans-serif',
        ...pointLabelStyle,
      },
    })

    this.distanceLabelEntityList.push(distanceLabel)

    this.totalDistance += distance

    this.totalDistance = this.totalDistance

    const totalText = `总距离：${this.stringDistance(this.totalDistance)}米`

    if (this.fixedPositions.length >= 2) {
      if (!this.totalDistanceLabelEntity) {
        this.totalDistanceLabelEntity = this.viewer!.entities.add({
          position: distanceLabelPosition,
          label: {
            text: totalText,
            font: '12px sans-serif',
            ...pointLabelStyle,
            pixelOffset: new Cesium.Cartesian2(0, 30),
          },
        })
      } else {
        // @ts-ignore
        this.totalDistanceLabelEntity.label.text = totalText
        // @ts-ignore
        this.totalDistanceLabelEntity.position = distanceLabelPosition
      }
    }

    // 当有2个点以上时，显示完成按钮
    if (this.fixedPositions.length >= 2) {
      if (!this.finishButtonEntity) {
        this.addFinishButton()
      } else {
        // 更新按钮位置到最新点
        // @ts-ignore
        this.finishButtonEntity.position = position
      }
    }
  }

  // 添加完成按钮
  addFinishButton() {
    if (this.fixedPositions.length === 0) return

    const lastPosition = this.fixedPositions[this.fixedPositions.length - 1]
    const cartographic = Cesium.Cartographic.fromCartesian(lastPosition)

    // 在最后一个点上方创建按钮
    const buttonPosition = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, (cartographic.height || 0) + 30)

    this.finishButtonEntity = this.viewer!.entities.add({
      position: buttonPosition,
      label: {
        text: '点击完成绘制',
        font: '18px sans-serif',
        ...pointLabelStyle,
        pixelOffset: new Cesium.Cartesian2(0, -30),
        backgroundPadding: new Cesium.Cartesian2(6, 4),
        backgroundColor: Cesium.Color.WHITE,
        fillColor: Cesium.Color.BLACK,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 3,
      },
    })

    this.options?.onShowFinishEntity?.()
  }

  // 更新线段预览（固定点 + 当前鼠标位置）
  updateLinePreview(mousePosition: Cesium.Cartesian3) {
    if (this.fixedPositions.length === 0) return

    // 构建预览点数组：固定点 + 鼠标位置
    const previewPositions = [...this.fixedPositions, mousePosition]

    // 更新或创建动态线段
    if (!this.activeLineEntity) {
      const dynamicPositions = new Cesium.CallbackProperty(() => {
        return previewPositions
      }, false)

      this.activeLineEntity = this.viewer!.entities.add({
        polyline: {
          positions: dynamicPositions,
          material: new Cesium.PolylineDashMaterialProperty({
            color: Cesium.Color.fromCssColorString(this.options.color!),
          }),
          width: 3,
          clampToGround: true,
        },
      })
    } else {
      // 更新现有的动态线段
      const dynamicPositions = new Cesium.CallbackProperty(() => {
        return previewPositions
      }, false)

      // 移除旧实体，创建新实体
      this.viewer!.entities.remove(this.activeLineEntity)
      this.activeLineEntity = this.viewer!.entities.add({
        polyline: {
          positions: dynamicPositions,
          material: new Cesium.PolylineDashMaterialProperty({
            color: Cesium.Color.fromCssColorString(this.options.color!).withAlpha(0.8),
          }),
          width: 3,
          clampToGround: true,
        },
      })
    }
  }

  terminateShape() {
    if (this.fixedPositions.length < 2) {
      return
    }

    // 清理预览实体
    if (this.floatingPointEntity) {
      this.viewer!.entities.remove(this.floatingPointEntity)
      this.floatingPointEntity = null
    }

    if (this.activeLineEntity) {
      this.viewer!.entities.remove(this.activeLineEntity)
      this.activeLineEntity = null
    }

    if (this.finishButtonEntity) {
      this.viewer!.entities.remove(this.finishButtonEntity)
      this.finishButtonEntity = null
    }

    this.creatFinalShape(this.fixedPositions)
  }

  creatFinalShape(fixedPositions: Cesium.Cartesian3[]) {
    if (this.fixedPositions !== fixedPositions) {
      this.fixedPositions = fixedPositions
    }

    // 添加最终的线段实体
    const finalLine = this.viewer!.entities.add({
      polyline: {
        positions: this.fixedPositions,
        material: Cesium.Color.fromCssColorString(this.options.color!),
        width: this.options.width,
        clampToGround: true,
      },
    })

    this.finalLineEntity = finalLine

    let prepareProfileAnalysisPointPosition = [] as Cesium.Cartesian3[]

    for (let i = 0; i < this.fixedPositions.length; i++) {
      if (i !== this.fixedPositions.length - 1) {
        const segements = this.interpolateBetweenPoints(this.fixedPositions[i], this.fixedPositions[i + 1], 30)

        const segmentPositions = []

        // 第一个点位
        if (i === 0) {
          segmentPositions.unshift(this.fixedPositions[0])
        }

        // 转换成经纬度
        for (let j = 0; j < segements.length; j++) {
          segmentPositions.push(segements[j])

          const entity = this.viewer!.entities.add({
            position: segements[j],
            point: {
              color: Cesium.Color.RED,
              outlineColor: Cesium.Color.WHITE,
              outlineWidth: 2,
              pixelSize: 5,
              heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
            },
          })

          this.insertPointEntityList.push(entity)
        }

        segmentPositions.push(this.fixedPositions[i + 1])

        prepareProfileAnalysisPointPosition = [...prepareProfileAnalysisPointPosition, ...segmentPositions]
      }
    }

    this.computeDistanceFromStart(prepareProfileAnalysisPointPosition as Cesium.Cartesian3[])
  }

  /** @description 计算与起点之间的距离（带真实海拔） */
  async computeDistanceFromStart(positions: Cesium.Cartesian3[]) {
    message.open({
      key: 'profileAnalysis',
      duration: 0,
      content: '正在进行剖面分析...',
      type: 'loading',
    })
    // 1. 将 Cartesian 转成 Cartographic（后面用来查真实高度）
    const cartos = positions.map(p => Cesium.Cartographic.fromCartesian(p))

    this.completed()

    // 2. 从地形中获取真实海拔（关键）
    const terrainCartos = await Cesium.sampleTerrainMostDetailed(this.viewer!.terrainProvider, cartos)

    message.destroy('profileAnalysis')

    // 3. 使用带真实海拔的 cartographic 继续你的逻辑
    const nextPositions = terrainCartos.map((cartographic, index) => {
      const left = index == 0 ? positions[index] : positions[index - 1]

      // 仍用 Cartesian3.distance（不修改）
      const distance = Cesium.Cartesian3.distance(left, positions[index])
      const total = distance
      const distanceFromPrev = index === 0 ? 0 : total

      // ---------- 关键：使用真实海拔 ----------
      const longitude = Cesium.Math.toDegrees(cartographic.longitude)
      const latitude = Cesium.Math.toDegrees(cartographic.latitude)
      const height = cartographic.height // ← 这里现在是真实地形海拔

      return {
        longitude,
        latitude,
        height,
        distanceFromPrev,
        distanceFromPrevTostring: this.stringDistance(distanceFromPrev),
      }
    })

    const totalPositions = nextPositions.map((item, index) => {
      const distanceFromStart = item.distanceFromPrev + nextPositions.slice(0, index).reduce((acc, cur) => acc + cur.distanceFromPrev, 0)

      return {
        ...item,
        distanceFromStart,
        distanceFromStartTostring: this.stringDistance(distanceFromStart),
        heightTostring: this.stringDistance(item.height),
      }
    })

    this.slideEntity = this.viewer!.entities.add({
      billboard: {
        image: window.$$prefix + '/position-icon-landmark.svg',
        disableDepthTestDistance: Number.POSITIVE_INFINITY, // 添加这一行，使标签始终在最前
        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
        pixelOffset: new Cesium.Cartesian2(0, -20),
      },
    })

    this.slideEntity.show = false

    this.profileAnalysisPointPosition = totalPositions

    if (typeof this.options.onLoadData === 'function') {
      this.options.onLoadData(totalPositions)
    }
  }

  updateSlideEntityPostion(lon: number | boolean, lat?: number, height?: number) {
    if (!!this.slideEntity) {
      if (typeof lon === 'boolean') {
        this.slideEntity.show = lon
      }

      if (typeof lon === 'number') {
        this.slideEntity.show = true
        // @ts-ignore
        this.slideEntity.position = Cesium.Cartesian3.fromDegrees(lon, lat)
      }
    }
  }

  /**
   * 在起点和终点之间进行线性插值，只返回中间的插值点
   * @param start 起点坐标
   * @param end 终点坐标
   * @param pointCount 插值点数，默认为50
   * @returns 只包含中间插值点的坐标数组（不包括起点和终点）
   */
  interpolateBetweenPoints(start: Cesium.Cartesian3, end: Cesium.Cartesian3, pointCount: number = 50): Cesium.Cartesian3[] {
    const count = pointCount + 1
    const interpolatedPoints: Cesium.Cartesian3[] = []

    for (let i = 1; i < count; i++) {
      const t = i / count // 插值比例，从1/(n+1)到n/(n+1)
      const interpolatedPoint = Cesium.Cartesian3.lerp(start, end, t, new Cesium.Cartesian3())
      interpolatedPoints.push(interpolatedPoint)
    }

    return interpolatedPoints
  }

  // 计算线段长度（近似值）
  private calculateLineLength(positions: Cesium.Cartesian3[]): number {
    let totalLength = 0

    const distance = Cesium.Cartesian3.distance(positions[0], positions[1])

    totalLength += distance

    return totalLength
  }

  stringDistance(distance: number) {
    const arr = distance.toString().split('.')

    const [int, float = ''] = arr

    return Number(int) === 0 ? '0' : int + '.' + float.slice(0, 2)
  }

  completed() {
    this.state = 'completed'

    if (typeof this.options.onCompleted === 'function') {
      this.options.onCompleted(this.fixedPositions)
    }

    this.handler?.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)
    this.handler?.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK)
    this.handler?.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE)
    this.completedDestroy()

    const handler = new Cesium.ScreenSpaceEventHandler(this.viewer!.canvas)

    handler.setInputAction((event: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
      // 检查是否点击了完成按钮
      const pickedObject = this.viewer!.scene.pick(event.position)
      if (Cesium.defined(pickedObject) && pickedObject.id === this.finalLineEntity) {
        this.options.onClick && this.options.onClick(this)
        return
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
  }

  /* 在点击绘制完成前，不想绘制了，则调用此方法 */
  toCancel() {
    this.state = 'cancel'

    if (typeof this.options.onCancel === 'function') {
      this.options.onCancel()
    }

    this.destroyAll()
  }

  destroyAll() {
    if (this.handler) {
      this.handler.destroy()
      this.handler = null
    }

    this.fixedPointEntityList.forEach(entity => {
      this.viewer!.entities.remove(entity)
    })

    this.fixedPointEntityList = []

    if (this.activeLineEntity) {
      this.viewer!.entities.remove(this.activeLineEntity)
      this.activeLineEntity = null
    }

    // 清理所有实体
    if (this.floatingPointEntity) {
      this.viewer!.entities.remove(this.floatingPointEntity)
      this.floatingPointEntity = null
    }

    if (this.finishButtonEntity) {
      this.viewer!.entities.remove(this.finishButtonEntity)
      this.finishButtonEntity = null
    }

    this.distanceLabelEntityList.forEach(entity => {
      this.viewer!.entities.remove(entity)
    })

    this.distanceLabelEntityList = []

    this.insertPointEntityList.forEach(entity => {
      this.viewer!.entities.remove(entity)
    })
    this.insertPointEntityList = []

    if (this.totalDistanceLabelEntity) {
      this.viewer!.entities.remove(this.totalDistanceLabelEntity)
      this.totalDistanceLabelEntity = null
    }

    if (this.slideEntity) {
      this.viewer!.entities.remove(this.slideEntity)
      this.slideEntity = null
    }

    if (this.finalLineEntity) {
      this.viewer!.entities.remove(this.finalLineEntity)
      this.finalLineEntity = null
    }
  }

  completedDestroy() {
    if (this.handler) {
      this.handler.destroy()
      this.handler = null
    }

    this.fixedPointEntityList.forEach(entity => {
      this.viewer!.entities.remove(entity)
    })

    this.fixedPointEntityList = []

    if (this.activeLineEntity) {
      this.viewer!.entities.remove(this.activeLineEntity)
      this.activeLineEntity = null
    }

    // 清理所有实体
    if (this.floatingPointEntity) {
      this.viewer!.entities.remove(this.floatingPointEntity)
      this.floatingPointEntity = null
    }

    if (this.finishButtonEntity) {
      this.viewer!.entities.remove(this.finishButtonEntity)
      this.finishButtonEntity = null
    }

    this.distanceLabelEntityList.forEach(entity => {
      this.viewer!.entities.remove(entity)
    })

    this.distanceLabelEntityList = []

    this.insertPointEntityList.forEach(entity => {
      this.viewer!.entities.remove(entity)
    })

    this.insertPointEntityList = []
  }
}

export default ProfileAnalysis
