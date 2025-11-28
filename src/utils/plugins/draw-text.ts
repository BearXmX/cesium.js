import * as Cesium from 'cesium'
import type { EventType } from './type'

type options = {
  color?: string
  fontSize?: number
  outlineColor?: string
  outlineWidth?: number
  showBackground?: number
  backgroundColor?: string
  backgroundPaddingX?: number
  backgroundPaddingY?: number
} & EventType

class DrawText {
  viewer: Cesium.Viewer | null = null
  handler: Cesium.ScreenSpaceEventHandler | null = null
  state: string = 'pending'

  // 浮动点实体
  floatingPointEntity: Cesium.Entity | null = null
  // 存储已确定的点坐标
  fixedPositions: Cesium.Cartesian3[] = []
  finalTextEntity: Cesium.Entity | null = null

  options: options = {
    color: '#00FFFF',
    fontSize: 16,
    outlineColor: '#ffffffff',
    outlineWidth: 0,

    showBackground: 0,
    backgroundColor: '#ffffffff',
    backgroundPaddingX: 0,
    backgroundPaddingY: 0,
    onCompleted: () => {},
    onEnd() {},
  }

  constructor(viewer: Cesium.Viewer, options?: options) {
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
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

    handler.setInputAction((event: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
      if (this.state !== 'drawing') return

      const picked = this.viewer!.scene.pickPosition(event.position)

      if (Cesium.defined(picked)) {
        this.createFinalTextEntity(picked)
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
  }

  createFinalTextEntity(position: Cesium.Cartesian3) {
    this.finalTextEntity = this.viewer!.entities.add({
      position: position,
      label: {
        text: '文本',
        font: `${this.options.fontSize}px sans-serif`,
        fillColor: Cesium.Color.fromCssColorString(this.options.color!),
        outlineColor: Cesium.Color.fromCssColorString(this.options.outlineColor!),
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        verticalOrigin: Cesium.VerticalOrigin.CENTER,
        showBackground: !!this.options.showBackground,
        backgroundColor: Cesium.Color.fromCssColorString(this.options.backgroundColor!),
        backgroundPadding: new Cesium.Cartesian2(this.options.backgroundPaddingX, this.options.backgroundPaddingY),
        disableDepthTestDistance: Number.POSITIVE_INFINITY, // 添加这一行，使标签始终在最前
      },
    })

    this.completed()
  }

  toEnd() {
    this.state = 'end'

    if (typeof this.options.onEnd === 'function') {
      this.options.onEnd()
    }

    this.destroyAll()
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

    console.log('文字绘制工具已销毁')
  }

  destroyAll() {
    if (this.handler) {
      this.handler.destroy()
      this.handler = null
    }

    // 清理所有实体
    if (this.floatingPointEntity) {
      this.viewer!.entities.remove(this.floatingPointEntity)
    }

    if (this.finalTextEntity) {
      this.viewer!.entities.remove(this.finalTextEntity)
    }

    this.floatingPointEntity = null
    this.finalTextEntity = null
  }
}

export default DrawText
