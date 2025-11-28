import * as Cesium from 'cesium'
import type { EventType } from './type'
import { featureEach, interpolate, point, rhumbDistance, isolines } from '@turf/turf'
type options = {
  interfaceNum?: number
  colorFill?: string[]
} & EventType

class MultipleShapeCountour {
  viewer: Cesium.Viewer | null = null
  handler: Cesium.ScreenSpaceEventHandler | null = null
  state: string = 'pending'

  // 存储已确定的点坐标
  fixedPositions: Cesium.Cartesian3[] = []
  // 存储所有点的实体
  fixedPointEntityList: Cesium.Entity[] = []
  // 动态多边形实体
  activeShapeEntity: Cesium.Entity | null = null
  // 浮动点实体
  floatingPointEntity: Cesium.Entity | null = null
  // 闭合按钮
  finishButtonEntity: Cesium.Entity | null = null

  finalShapeEntity: Cesium.Entity | null = null

  countorLine: Cesium.GeoJsonDataSource | null = null

  countorLineList: Cesium.DataSource[] = []

  countorLineLabelList: Cesium.Entity[] = []

  interfaceNum: number = 25

  colorFill: string[] = []

  options: options = {
    onCompleted: () => {},
    onEnd: () => {},
  }

  constructor(viewer: Cesium.Viewer, options?: options) {
    this.viewer = viewer

    this.interfaceNum = options?.interfaceNum || 25

    this.colorFill = options?.colorFill || [
      '#8CEA00',
      '#B7FF4A',
      '#FFFF37',
      '#FFE66F',
      '#FFD1A4',
      '#FFCBB3',
      '#FFBD9D',
      '#FFAD86',
      '#FF9D6F',
      '#FF8F59',
      '#FF8040',
      '#FF5809',
      '#F75000',
      '#D94600',
      '#BB3D00',
      '#A23400',
      '#842B00',
      '#642100',
      '#4D0000',
      '#2F0000',
    ]

    this.options = options || {}

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

      // 更新多边形预览（固定点 + 鼠标位置）
      this.updateShapePreview(newPosition)
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

    // 左键点击 - 添加固定点
    this.handler.setInputAction((event: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
      if (this.state !== 'drawing') return

      const picked = this.viewer!.scene.pickPosition(event.position)

      const pickedObject = this.viewer!.scene.pick(event.position)
      if (Cesium.defined(pickedObject) && pickedObject.id === this.finishButtonEntity) {
        this.terminateShape()
        return
      }

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

    if (this.fixedPositions.length >= 3) {
      if (!this.finishButtonEntity) {
        const buttonEntity = this.viewer!.entities.add({
          position: this.fixedPositions[this.fixedPositions.length - 1],
          label: {
            text: '点击完成绘制',
            font: '18px sans-serif',
            fillColor: Cesium.Color.BLACK,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 3,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -30), // 稍微向上偏移一点
            showBackground: true,
            backgroundColor: Cesium.Color.WHITE,
            backgroundPadding: new Cesium.Cartesian2(6, 4),
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            disableDepthTestDistance: Number.POSITIVE_INFINITY, // 添加这一行，使标签始终在最前
          },
        })

        this.finishButtonEntity = buttonEntity
      } else {
        // @ts-ignore
        this.finishButtonEntity.position = this.fixedPositions[this.fixedPositions.length - 1]
      }
    }
  }

  // 更新形状预览（固定点 + 当前鼠标位置）
  updateShapePreview(mousePosition: Cesium.Cartesian3) {
    if (this.fixedPositions.length === 0) return

    // 构建预览点数组：固定点 + 鼠标位置
    const previewPositions = [...this.fixedPositions, mousePosition]

    // 更新或创建动态形状
    if (!this.activeShapeEntity) {
      const dynamicPositions = new Cesium.CallbackProperty(() => {
        return new Cesium.PolygonHierarchy(previewPositions)
      }, false)

      this.activeShapeEntity = this.viewer!.entities.add({
        polygon: {
          hierarchy: dynamicPositions,
          material: Cesium.Color.CYAN.withAlpha(0.3),
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        },
      })
    } else {
      // 更新现有的动态形状
      const dynamicPositions = new Cesium.CallbackProperty(() => {
        return new Cesium.PolygonHierarchy(previewPositions)
      }, false)

      // 移除旧实体，创建新实体（简化更新逻辑）
      this.viewer!.entities.remove(this.activeShapeEntity)

      this.activeShapeEntity = this.viewer!.entities.add({
        polygon: {
          hierarchy: dynamicPositions,
          material: Cesium.Color.CYAN.withAlpha(0.3),
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        },
      })
    }
  }

  getObjectIndex(arr: number[], num: number): number | undefined {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] > num) return i
    }
    return undefined
  }

  terminateShape() {
    if (this.fixedPositions.length < 3) {
      return
    }

    // 添加最终的多边形实体
    const finalShape = this.viewer!.entities.add({
      polygon: {
        hierarchy: this.fixedPositions,
        material: Cesium.Color.CYAN.withAlpha(0.3),
        outline: true,
        outlineColor: Cesium.Color.BLACK,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      },
    })

    this.finalShapeEntity = finalShape

    console.log(`多边形绘制完成，共 ${this.fixedPositions.length} 个点`)

    this.interpolatePoint(this.fixedPositions)

    this.completed()
  }

  interpolatePoint(curPoints: Cesium.Cartesian3[]): void {
    const $this = this
    const features: any[] = []
    const boundaryCoord = { minX: 360, maxX: -360, minY: 180, maxY: -180 }

    for (let index = 0; index < curPoints.length; index++) {
      const element = curPoints[index]
      const ellipsoid = this.viewer!.scene.globe.ellipsoid
      const cartographic = ellipsoid.cartesianToCartographic(element)
      const lat = Cesium.Math.toDegrees(cartographic.latitude)
      const lng = Cesium.Math.toDegrees(cartographic.longitude)
      boundaryCoord.maxY = Math.max(lat, boundaryCoord.maxY)
      boundaryCoord.minY = Math.min(lat, boundaryCoord.minY)
      boundaryCoord.maxX = Math.max(lng, boundaryCoord.maxX)
      boundaryCoord.minX = Math.min(lng, boundaryCoord.minX)

      features.push({
        type: 'Feature',
        properties: {},
        geometry: { type: 'Point', coordinates: [lng, lat] },
      })
    }

    const boundaryJson: any = { type: 'FeatureCollection', features }

    featureEach(boundaryJson, function (point) {
      point.properties!.height = 0
    })

    const options = { gridType: 'points', property: 'height', units: 'kilometers' as const }
    const from = point([boundaryCoord.minX, boundaryCoord.minY])
    const to = point([boundaryCoord.maxX, boundaryCoord.maxY])
    const diagonalDistance = rhumbDistance(from, to, { units: 'kilometers' })
    const grid = interpolate(boundaryJson, diagonalDistance / this.interfaceNum, options as any)

    let minHeight = 1e7
    let maxHeight = -1e8

    featureEach(grid, function (point) {
      const pos = point.geometry.coordinates
      const cartographic = Cesium.Cartographic.fromDegrees(pos[0], pos[1])
      const height = $this.viewer!.scene.globe.getHeight(cartographic)
      if (height !== null && height !== undefined) {
        maxHeight = Math.max(height, maxHeight)
        minHeight = Math.min(height, minHeight)
        point.properties!.height = height
      }
    })

    const breaks: number[] = []
    const stepCount = this.colorFill.length - 1
    const step = (maxHeight - minHeight) / stepCount
    for (let index = 0; index < stepCount + 1; index++) {
      breaks.push(Math.ceil(minHeight + step * index))
    }

    const linesJson = isolines(grid, breaks, { zProperty: 'height' })

    const _countorLine = Cesium.GeoJsonDataSource.load(linesJson, { clampToGround: true })

    _countorLine.then(function (dataSource) {
      $this.countorLine = dataSource
      $this.countorLineList.push(dataSource)
      $this.viewer!.dataSources.add(dataSource)
      const entities = dataSource.entities.values

      const heightList = [] as string[]

      for (let index = 0; index < entities.length; index++) {
        const element = entities[index]
        const cur_index = $this.getObjectIndex(breaks, element.properties!.height._value)
        if (cur_index !== undefined) {
          // 设置等高线颜色
          // @ts-ignore
          element.polyline!.material = Cesium.Color.fromCssColorString($this.colorFill[cur_index - 1])

          // 只生成一个 label
          if (element.polyline && element.polyline.positions) {
            const positions = element.polyline.positions.getValue(Cesium.JulianDate.now()) as any[]

            if (positions && positions.length > 0) {
              const heights = positions.map(p => $this.viewer!.scene.globe.getHeight(Cesium.Cartographic.fromCartesian(p)) || 0)

              const avgHeight = heights.reduce((a, b) => a + b, 0) / heights.length

              const midPos = positions[Math.floor(positions.length / 2)]

              const carto = Cesium.Cartographic.fromCartesian(midPos)

              const fixedHeight = avgHeight + 2 // 2 米偏
              const fixedPos = Cesium.Cartesian3.fromRadians(carto.longitude, carto.latitude, fixedHeight)

              const labelHeight = Math.floor(avgHeight).toFixed(0)
              if (!heightList.includes(labelHeight)) {
                heightList.push(labelHeight)

                const labelEntity = $this.viewer!.entities.add({
                  position: fixedPos,
                  label: {
                    text: labelHeight,
                    font: '16px sans-serif',
                    fillColor: Cesium.Color.YELLOW,
                    outlineColor: Cesium.Color.BLACK,
                    outlineWidth: 2,
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    heightReference: Cesium.HeightReference.NONE, // 关键
                  },
                })

                $this.countorLineLabelList.push(labelEntity)
              }
            }
          }
        }
      }
    })
  }

  completed() {
    this.state = 'completed'

    if (typeof this.options.onCompleted === 'function') {
      this.options.onCompleted()
    }

    this.handler?.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)
    this.handler?.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK)
    this.handler?.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE)
    this.completedDestroy()
  }

  /* 在点击绘制完成前，不想绘制了，则调用此方法 */
  toEnd() {
    this.state = 'end'

    if (typeof this.options.onEnd === 'function') {
      this.options.onEnd()
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

    if (this.activeShapeEntity) {
      this.viewer!.entities.remove(this.activeShapeEntity)
    }

    // 清理所有实体
    if (this.floatingPointEntity) {
      this.viewer!.entities.remove(this.floatingPointEntity)
    }

    if (this.finishButtonEntity) {
      this.viewer!.entities.remove(this.finishButtonEntity)
    }

    if (this.finalShapeEntity) {
      this.viewer!.entities.remove(this.finalShapeEntity)
    }
  }

  completedDestroy() {
    if (this.handler) {
      this.handler.destroy()
      this.handler = null
    }

    // 清理所有实体
    if (this.floatingPointEntity) {
      this.viewer!.entities.remove(this.floatingPointEntity)
    }

    if (this.activeShapeEntity) {
      this.viewer!.entities.remove(this.activeShapeEntity)
    }

    if (this.finishButtonEntity) {
      this.viewer!.entities.remove(this.finishButtonEntity)
    }

    this.fixedPointEntityList.forEach(entity => {
      this.viewer!.entities.remove(entity)
    })

    if (this.finalShapeEntity) {
      this.viewer!.entities.remove(this.finalShapeEntity)
    }
  }
}

export default MultipleShapeCountour
