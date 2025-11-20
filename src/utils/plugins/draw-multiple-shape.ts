import * as Cesium from 'cesium'

type options = {
  onOk?: () => void
}

class MultipleShape {
  viewer: Cesium.Viewer | null = null
  handler: Cesium.ScreenSpaceEventHandler | null = null
  state: string = 'pending'

  // 存储已确定的点坐标
  fixedPositions: Cesium.Cartesian3[] = []
  // 存储所有点的实体
  fixedPointEntityList: Cesium.Entity[] = []
  // 动态多边形实体
  activeShape: Cesium.Entity | null = null
  // 浮动点实体
  floatingPointEntity: Cesium.Entity | null = null
  // 闭合按钮
  finishButtonEntity: Cesium.Entity | null = null

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
            text: '点击闭合',
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
    if (!this.activeShape) {
      const dynamicPositions = new Cesium.CallbackProperty(() => {
        return new Cesium.PolygonHierarchy(previewPositions)
      }, false)

      this.activeShape = this.viewer!.entities.add({
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
      this.viewer!.entities.remove(this.activeShape)

      this.activeShape = this.viewer!.entities.add({
        polygon: {
          hierarchy: dynamicPositions,
          material: Cesium.Color.CYAN.withAlpha(0.3),
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        },
      })
    }
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

    console.log(`多边形绘制完成，共 ${this.fixedPositions.length} 个点`)

    this.stop()

    // 生成并打印 GeoJSON
    /*     this.printGeoJSON() */
  }

  // 生成并打印 GeoJSON
  printGeoJSON(): void {
    if (this.fixedPositions.length < 3) {
      console.warn('无法生成GeoJSON：点数不足')
      return
    }

    const geoJSON = this.generateGeoJSON()
    console.log('生成的GeoJSON:')
    console.log(JSON.stringify(geoJSON, null, 2))
  }

  // 生成 GeoJSON 数据
  generateGeoJSON(): any {
    // 将 Cartesian3 坐标转换为经纬度
    const coordinates = this.fixedPositions.map(position => {
      const cartographic = Cesium.Cartographic.fromCartesian(position)
      const longitude = Cesium.Math.toDegrees(cartographic.longitude)
      const latitude = Cesium.Math.toDegrees(cartographic.latitude)
      return [longitude, latitude]
    })

    // 确保多边形闭合
    if (coordinates.length > 0) {
      const firstCoord = coordinates[0]
      const lastCoord = coordinates[coordinates.length - 1]

      if (firstCoord[0] !== lastCoord[0] || firstCoord[1] !== lastCoord[1]) {
        coordinates.push([...firstCoord])
      }
    }

    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            name: '绘制多边形',
            pointCount: this.fixedPositions.length,
            createdAt: new Date().toISOString(),
          },
          geometry: {
            type: 'Polygon',
            coordinates: [coordinates],
          },
        },
      ],
    }
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
    if (this.floatingPointEntity) {
      this.viewer!.entities.remove(this.floatingPointEntity)
    }

    if (this.activeShape) {
      this.viewer!.entities.remove(this.activeShape)
    }

    if (this.finishButtonEntity) {
      this.viewer!.entities.remove(this.finishButtonEntity)
    }

    this.fixedPointEntityList.forEach(entity => {
      this.viewer!.entities.remove(entity)
    })
  }
}

export default MultipleShape
