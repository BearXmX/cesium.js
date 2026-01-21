import * as Cesium from 'cesium'
import type { EventType } from './type'

export type LINE_SHAPE_OPTIONS_TYPE = {
  color?: string
  width?: number
} & EventType & {
    onClick?: (instance: LineShape) => void
  }

export const LINE_SHAPE_OPTIONS_DEFAULT = {
  content: '',
  color: '#00FFFF',
  width: 5,
} as LINE_SHAPE_OPTIONS_TYPE

class LineShape {
  viewer: Cesium.Viewer | null = null
  handler: Cesium.ScreenSpaceEventHandler | null = null
  state: string = 'pending'

  // 存储已确定的点坐标
  fixedPositions: Cesium.Cartesian3[] = []
  // 存储所有点的实体
  fixedPointEntityList: Cesium.Entity[] = []
  // 动态线段实体
  activeLineEntity: Cesium.Entity | null = null
  // 浮动点实体
  floatingPointEntity: Cesium.Entity | null = null
  // 完成按钮
  finishButtonEntity: Cesium.Entity | null = null

  finalLineEntity: Cesium.Entity | null = null

  options: LINE_SHAPE_OPTIONS_TYPE = {
    ...LINE_SHAPE_OPTIONS_DEFAULT,
    onCompleted: () => {},
    onCancel() {},
    onShowFinishEntity() {},
  }

  constructor(viewer: Cesium.Viewer, options?: LINE_SHAPE_OPTIONS_TYPE) {
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
            heightReference: Cesium.HeightReference.NONE,
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
    this.createPointEntity(position)

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

  createPointEntity(position: Cesium.Cartesian3) {
    // 添加固定点实体
    const pointEntity = this.viewer!.entities.add({
      position,
      point: {
        color: Cesium.Color.RED,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
        pixelSize: 10,
        heightReference: Cesium.HeightReference.NONE,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
    })

    this.fixedPositions.push(position)
    this.fixedPointEntityList.push(pointEntity)

    console.log(`添加第 ${this.fixedPositions.length} 个点`)
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
        fillColor: Cesium.Color.BLACK,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 3,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        verticalOrigin: Cesium.VerticalOrigin.CENTER,
        pixelOffset: new Cesium.Cartesian2(0, -30), // 稍微向上偏移一点
        showBackground: true,
        backgroundColor: Cesium.Color.WHITE,
        backgroundPadding: new Cesium.Cartesian2(6, 4),
        heightReference: Cesium.HeightReference.NONE,
        disableDepthTestDistance: Number.POSITIVE_INFINITY, // 添加这一行，使标签始终在最前
      },
    })
    this.options.onShowFinishEntity?.()
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
            color: Cesium.Color.fromCssColorString(this.options.color!)!.withAlpha(0.8),
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
            color: Cesium.Color.fromCssColorString(this.options.color!)!.withAlpha(0.8),
          }),
          width: 3,
          clampToGround: true,
        },
      })
    }
  }

  terminateShape() {
    if (this.fixedPositions.length < 2) {
      console.warn('至少需要2个点才能构成线段')
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
        positions: fixedPositions,
        material: Cesium.Color.fromCssColorString(this.options.color!)!,
        width: this.options.width,
        clampToGround: true,
      },
    })

    this.finalLineEntity = finalLine

    this.completed()

    console.log(`线段绘制完成，共 ${this.fixedPositions.length} 个点`)
  }

  // 生成 GeoJSON 数据 (LineString)

  // 计算线段长度（近似值）
  calculateLineLength(positions: Cesium.Cartesian3[]): number {
    let totalLength = 0

    const distance = Cesium.Cartesian3.distance(positions[0], positions[1])

    totalLength += distance

    return Math.floor(totalLength)
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

  updateFinalEntityColor(color: string) {
    // @ts-ignore
    this.finalLineEntity!.polyline.material = Cesium.Color.fromCssColorString(color)
  }

  updateFinalEntityWidth(width: number = 5) {
    // @ts-ignore
    this.finalLineEntity!.polyline.width = width
  }

  destroyAll() {
    if (this.handler) {
      this.handler.destroy()
      this.handler = null
    }

    this.fixedPointEntityList.forEach(entity => {
      this.viewer!.entities.remove(entity)
    })

    if (this.activeLineEntity) {
      this.viewer!.entities.remove(this.activeLineEntity)
    }

    // 清理所有实体
    if (this.floatingPointEntity) {
      this.viewer!.entities.remove(this.floatingPointEntity)
    }

    if (this.finishButtonEntity) {
      this.viewer!.entities.remove(this.finishButtonEntity)
    }

    if (this.finalLineEntity) {
      this.viewer!.entities.remove(this.finalLineEntity)
    }

    this.fixedPositions = []
    this.fixedPointEntityList = []
    this.floatingPointEntity = null
    this.activeLineEntity = null
    this.finishButtonEntity = null
    this.finalLineEntity = null
  }

  /* 在点击绘制完成前，不想绘制了，则调用此方法 */
  toCancel() {
    this.state = 'cancel'

    if (typeof this.options.onCancel === 'function') {
      this.options.onCancel()
    }

    this.completedDestroy()
  }

  completedDestroy() {
    if (this.handler) {
      this.handler.destroy()
      this.handler = null
    }

    // 清理所有实体
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

    this.fixedPointEntityList.forEach(entity => {
      this.viewer!.entities.remove(entity)
    })

    this.fixedPositions = []

    console.log('线段绘制工具已销毁')
  }

  // 获取当前线段的坐标数量
  getPointCount(): number {
    return this.fixedPositions.length
  }

  // 获取当前状态
  getState(): string {
    return this.state
  }
}

export default LineShape
