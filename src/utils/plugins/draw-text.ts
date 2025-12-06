import * as Cesium from 'cesium'
import type { EventType } from './type'

export type TEXT_OPTIONS_TYPE = {
  label?: string
  color?: string
  fontSize?: number
  outlineColor?: string
  outlineWidth?: number
  showBackground?: number
  backgroundColor?: string
  backgroundPaddingX?: number
  backgroundPaddingY?: number
} & EventType & {
    onClick?: (instance: DrawText) => void
  }

export const TEXT_OPTIONS_DEFAULT = {
  content: '',
  label: '一段测试文本',
  color: '#00FFFF',
  fontSize: 14,
  outlineColor: '#ffffffff',
  outlineWidth: 0,
  showBackground: 0,
  backgroundColor: '#ffffffff',
  backgroundPaddingX: 0,
  backgroundPaddingY: 0,
} as TEXT_OPTIONS_TYPE

class DrawText {
  viewer: Cesium.Viewer | null = null
  handler: Cesium.ScreenSpaceEventHandler | null = null
  state: string = 'pending'

  // 浮动点实体
  floatingPointEntity: Cesium.Entity | null = null
  // 存储已确定的点坐标
  fixedPositions: Cesium.Cartesian3[] = []
  finalTextEntity: Cesium.Entity | null = null

  options: TEXT_OPTIONS_TYPE = {
    ...TEXT_OPTIONS_DEFAULT,
    onCompleted: () => {},
    onCancel() {},
  }

  constructor(viewer: Cesium.Viewer, options?: TEXT_OPTIONS_TYPE) {
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
        // 高度为0
        const cartographic = Cesium.Cartographic.fromCartesian(picked)
        const longitude = Cesium.Math.toDegrees(cartographic.longitude)
        const latitude = Cesium.Math.toDegrees(cartographic.latitude)
        const height = 0
        const heightToZeroPosition = Cesium.Cartesian3.fromDegrees(longitude, latitude, height)

        this.fixedPositions.push(heightToZeroPosition)
        this.createFinalTextEntity(heightToZeroPosition)
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
  }

  createFinalTextEntity(position: Cesium.Cartesian3) {
    this.fixedPositions = [position]

    this.finalTextEntity = this.viewer!.entities.add({
      position: position,
      label: {
        text: this.options.label,
        font: `${this.options.fontSize}px sans-serif`,
        fillColor: Cesium.Color.fromCssColorString(this.options.color!),
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        outlineColor: Cesium.Color.fromCssColorString(this.options.outlineColor!),
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        verticalOrigin: Cesium.VerticalOrigin.CENTER,
        showBackground: !!this.options.showBackground,
        backgroundColor: Cesium.Color.fromCssColorString(this.options.backgroundColor!),
        backgroundPadding: new Cesium.Cartesian2(this.options.backgroundPaddingX!, this.options.backgroundPaddingY!),
        disableDepthTestDistance: Number.POSITIVE_INFINITY, // 添加这一行，使标签始终在最前
        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
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

  updateTextEntityLabel(label: string) {
    if (this.finalTextEntity) {
      // @ts-ignore
      this.finalTextEntity.label.text = label
    }
  }

  updateTextEntityColor(color: string) {
    if (this.finalTextEntity) {
      // @ts-ignore
      this.finalTextEntity.label.fillColor = Cesium.Color.fromCssColorString(color)
    }
  }

  updateTextEntityFontSize(fontSize: number) {
    if (this.finalTextEntity) {
      // @ts-ignore
      this.finalTextEntity.label.font = `${fontSize}px sans-serif`
    }
  }

  updateTextEntityOutlineColor(outlineColor: string) {
    if (this.finalTextEntity) {
      // @ts-ignore
      this.finalTextEntity.label.outlineColor = Cesium.Color.fromCssColorString(outlineColor)
    }
  }

  updateTextEntityOutlineWidth(outlineWidth: number) {
    if (this.finalTextEntity) {
      // @ts-ignore
      this.finalTextEntity.label.outlineWidth = outlineWidth
    }
  }

  updateTextEntityShowBackground(showBackground: boolean) {
    if (this.finalTextEntity) {
      // @ts-ignore
      this.finalTextEntity.label.showBackground = showBackground
    }
  }

  updateTextEntityBackgroundColor(backgroundColor: string) {
    if (this.finalTextEntity) {
      // @ts-ignore
      this.finalTextEntity.label.backgroundColor = Cesium.Color.fromCssColorString(backgroundColor)
    }
  }

  updateTextEntityBackgroundPadding(backgroundPaddingX: number, backgroundPaddingY: number) {
    if (this.finalTextEntity) {
      // @ts-ignore
      this.finalTextEntity.label.backgroundPadding = new Cesium.Cartesian2(backgroundPaddingX!, backgroundPaddingY)
    }
  }

  updateTextEntityHeight(position: Cesium.Cartesian3) {
    if (this.finalTextEntity) {
      // @ts-ignore
      this.finalTextEntity.position = position
    }
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
      if (Cesium.defined(pickedObject) && pickedObject.id === this.finalTextEntity) {
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
