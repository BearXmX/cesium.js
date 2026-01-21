import * as Cesium from 'cesium'
import type { EventType } from './type'

export type BILLBOARD_OPTIONS_TYPE = {
  scale?: number
  content?: string
} & EventType & {
    onClick?: (instance: DrawBillboard) => void
  }

export const BILLBOARD_OPTIONS_DEFAULT = {
  scale: 1,
  content: '',
} as BILLBOARD_OPTIONS_TYPE

class DrawBillboard {
  viewer: Cesium.Viewer | null = null
  handler: Cesium.ScreenSpaceEventHandler | null = null
  state: string = 'pending'

  // 浮动点实体
  floatingPointEntity: Cesium.Entity | null = null
  // 存储已确定的点坐标
  fixedPositions: Cesium.Cartesian3[] = []
  finalBillboardEntity: Cesium.Entity | null = null

  options: BILLBOARD_OPTIONS_TYPE = {
    ...BILLBOARD_OPTIONS_DEFAULT,
    onCompleted: () => {},
    onCancel() {},
    onClick() {},
  }

  constructor(viewer: Cesium.Viewer, options?: BILLBOARD_OPTIONS_TYPE) {
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
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

    handler.setInputAction((event: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
      if (this.state !== 'drawing') return

      const picked = this.viewer!.scene.pickPosition(event.position)

      if (Cesium.defined(picked)) {
        // 高度为0
        const cartographic = Cesium.Cartographic.fromCartesian(picked)
        const longitude = Cesium.Math.toDegrees(cartographic.longitude)
        const latitude = Cesium.Math.toDegrees(cartographic.latitude)
        const height = 0
        const heightToZeroPosition = Cesium.Cartesian3.fromDegrees(longitude, latitude, height)

        this.fixedPositions.push(heightToZeroPosition)
        this.createFinalbBillboardEntity(heightToZeroPosition)
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
  }

  createFinalbBillboardEntity(position: Cesium.Cartesian3) {
    this.fixedPositions = [position]

    this.finalBillboardEntity = this.viewer!.entities.add({
      position: position,
      billboard: {
        image: window.$$prefix + '/position-icon-landmark.svg',
        disableDepthTestDistance: Number.POSITIVE_INFINITY, // 添加这一行，使标签始终在最前
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        verticalOrigin: Cesium.VerticalOrigin.CENTER,
        heightReference: Cesium.HeightReference.NONE,
      },
    })

    this.completed()
  }

  toCancel() {
    this.state = 'cancel'

    if (typeof this.options.onCancel === 'function') {
      this.options.onCancel()
    }

    this.completedDestroy()
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
      if (Cesium.defined(pickedObject) && pickedObject.id === this.finalBillboardEntity) {
        this.options.onClick && this.options.onClick(this)
        return
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
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

    console.log('图标绘制工具已销毁')
  }

  updateBillboardEntityHeight(position: Cesium.Cartesian3) {
    if (this.finalBillboardEntity) {
      // @ts-ignore
      this.finalBillboardEntity.position = position
    }
  }

  updateFinalEntityScale(scale: number) {
    if (this.finalBillboardEntity) {
      //@ts-ignore
      this.finalBillboardEntity.billboard.scale = scale
    }
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

    if (this.finalBillboardEntity) {
      this.viewer!.entities.remove(this.finalBillboardEntity)
    }

    this.floatingPointEntity = null
    this.finalBillboardEntity = null
  }
}

export default DrawBillboard
