import * as Cesium from 'cesium'

type options = {
  onOk?: () => void
}

class LineShape {
  viewer: Cesium.Viewer | null = null
  handler: Cesium.ScreenSpaceEventHandler | null = null
  state: string = 'pending'

  // 存储已确定的点坐标
  fixedPositions: Cesium.Cartesian3[] = []
  // 存储所有点的实体
  pointEntityList: Cesium.Entity[] = []
  // 动态线段实体
  activeLine: Cesium.Entity | null = null
  // 浮动点实体
  floatingPoint: Cesium.Entity | null = null
  // 完成按钮
  finishButton: Cesium.Entity | null = null
  // 颜色
  color: Cesium.Color = Cesium.Color.CYAN

  options: options = {
    onOk: () => {},
  }

  constructor(viewer: Cesium.Viewer, options?: options) {
    this.viewer = viewer
    this.options = options! || {}
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
      if (!this.floatingPoint) {
        this.floatingPoint = this.viewer!.entities.add({
          position: newPosition,
          point: {
            color: Cesium.Color.RED.withAlpha(0.8),
            pixelSize: 5,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          },
        })
      } else {
        //@ts-ignore
        this.floatingPoint.position.setValue(newPosition)
      }

      // 更新线段预览（固定点 + 鼠标位置）
      this.updateLinePreview(newPosition)
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

    // 左键点击 - 添加固定点
    this.handler.setInputAction((event: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
      if (this.state !== 'drawing') return

      // 检查是否点击了完成按钮
      const pickedObject = this.viewer!.scene.pick(event.position)
      if (Cesium.defined(pickedObject) && pickedObject.id === this.finishButton) {
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
    this.pointEntityList.push(pointEntity)

    console.log(`添加第 ${this.fixedPositions.length} 个点`)

    // 当有2个点以上时，显示完成按钮
    if (this.fixedPositions.length >= 2) {
      if (!this.finishButton) {
        this.addFinishButton()
      } else {
        // 更新按钮位置到最新点
        // @ts-ignore
        this.finishButton.position = position
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

    this.finishButton = this.viewer!.entities.add({
      position: buttonPosition,
      label: {
        text: '点击完成绘制',
        font: '18px sans-serif',
        fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 3,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -50),
        showBackground: true,
        backgroundColor: Cesium.Color.BLACK.withAlpha(0.6),
        backgroundPadding: new Cesium.Cartesian2(6, 4),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
    })
  }

  // 更新线段预览（固定点 + 当前鼠标位置）
  updateLinePreview(mousePosition: Cesium.Cartesian3) {
    if (this.fixedPositions.length === 0) return

    // 构建预览点数组：固定点 + 鼠标位置
    const previewPositions = [...this.fixedPositions, mousePosition]

    // 更新或创建动态线段
    if (!this.activeLine) {
      const dynamicPositions = new Cesium.CallbackProperty(() => {
        return previewPositions
      }, false)

      this.activeLine = this.viewer!.entities.add({
        polyline: {
          positions: dynamicPositions,
          material: new Cesium.PolylineDashMaterialProperty({
            color: this.color.withAlpha(0.8),
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
      this.viewer!.entities.remove(this.activeLine)
      this.activeLine = this.viewer!.entities.add({
        polyline: {
          positions: dynamicPositions,
          material: new Cesium.PolylineDashMaterialProperty({
            color: this.color.withAlpha(0.8),
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
    if (this.floatingPoint) {
      this.viewer!.entities.remove(this.floatingPoint)
      this.floatingPoint = null
    }

    if (this.activeLine) {
      this.viewer!.entities.remove(this.activeLine)
      this.activeLine = null
    }

    if (this.finishButton) {
      this.viewer!.entities.remove(this.finishButton)
      this.finishButton = null
    }

    // 添加最终的线段实体
    const finalLine = this.viewer!.entities.add({
      polyline: {
        positions: this.fixedPositions,
        material: new Cesium.PolylineGlowMaterialProperty({
          glowPower: 0.2,
          color: this.color,
        }),
        width: 5,
        clampToGround: true,
      },
    })

    console.log(`线段绘制完成，共 ${this.fixedPositions.length} 个点`)

    this.stop()

    // 生成并打印 GeoJSON
    this.printGeoJSON()
  }

  // 生成并打印 GeoJSON
  printGeoJSON(): void {
    if (this.fixedPositions.length < 2) {
      console.warn('无法生成GeoJSON：点数不足')
      return
    }

    const geoJSON = this.generateGeoJSON()
    console.log('生成的GeoJSON:')
    console.log(JSON.stringify(geoJSON, null, 2))
  }

  // 生成 GeoJSON 数据 (LineString)
  generateGeoJSON(): any {
    // 将 Cartesian3 坐标转换为经纬度
    const coordinates = this.fixedPositions.map(position => {
      const cartographic = Cesium.Cartographic.fromCartesian(position)
      const longitude = Cesium.Math.toDegrees(cartographic.longitude)
      const latitude = Cesium.Math.toDegrees(cartographic.latitude)
      return [longitude, latitude]
    })

    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            name: '绘制线段',
            pointCount: this.fixedPositions.length,
            length: this.calculateLineLength(), // 计算线段长度
            createdAt: new Date().toISOString(),
          },
          geometry: {
            type: 'LineString', // 线段使用 LineString 类型
            coordinates: coordinates,
          },
        },
      ],
    }
  }

  // 计算线段长度（近似值）
  private calculateLineLength(): number {
    let totalLength = 0
    for (let i = 1; i < this.fixedPositions.length; i++) {
      const distance = Cesium.Cartesian3.distance(this.fixedPositions[i - 1], this.fixedPositions[i])
      totalLength += distance
    }
    return totalLength
  }

  stop() {
    this.state = 'completed'

    if (typeof this.options.onOk === 'function') {
      this.options.onOk()
    }

    this.handler?.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)
    this.handler?.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK)
    this.handler?.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE)
    this.destroy()
  }

  destroy() {
    if (this.handler) {
      this.handler.destroy()
      this.handler = null
    }

    // 清理所有实体
    if (this.floatingPoint) {
      this.viewer!.entities.remove(this.floatingPoint)
    }

    if (this.activeLine) {
      this.viewer!.entities.remove(this.activeLine)
    }

    if (this.finishButton) {
      this.viewer!.entities.remove(this.finishButton)
    }

    this.pointEntityList.forEach(entity => {
      this.viewer!.entities.remove(entity)
    })

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

  // 导出 GeoJSON 数据
  exportGeoJSON(): any {
    return this.generateGeoJSON()
  }

  // 下载 GeoJSON 文件
  downloadGeoJSON(filename: string = 'line.geojson'): void {
    const geoJSON = this.exportGeoJSON()
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(geoJSON, null, 2))
    const downloadAnchorNode = document.createElement('a')
    downloadAnchorNode.setAttribute('href', dataStr)
    downloadAnchorNode.setAttribute('download', filename)
    document.body.appendChild(downloadAnchorNode)
    downloadAnchorNode.click()
    downloadAnchorNode.remove()
  }
}

export default LineShape
