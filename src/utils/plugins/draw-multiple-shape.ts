import * as Cesium from 'cesium'

class MultipleShape {
  viewer: Cesium.Viewer | null = null
  handler: Cesium.ScreenSpaceEventHandler | null = null
  state: string = 'pending'

  // 存储已确定的点坐标
  fixedPositions: Cesium.Cartesian3[] = []
  // 存储所有点的实体
  pointEntityList: Cesium.Entity[] = []
  // 动态多边形实体
  activeShape: Cesium.Entity | null = null
  // 浮动点实体
  floatingPoint: Cesium.Entity | null = null
  // 闭合按钮
  finishButton: Cesium.Entity | null = null

  constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer
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

      // 更新多边形预览（固定点 + 鼠标位置）
      this.updateShapePreview(newPosition)
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

    // 左键点击 - 添加固定点
    this.handler.setInputAction((event: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
      if (this.state !== 'drawing') return

      const picked = this.viewer!.scene.pickPosition(event.position)

      const pickedObject = this.viewer!.scene.pick(event.position)
      if (Cesium.defined(pickedObject) && pickedObject.id === this.finishButton) {
        this.terminateShape()
        return
      }

      if (Cesium.defined(picked)) {
        this.defindPoint(picked)
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    // 右键点击 - 完成绘制
    handler.setInputAction((event: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
      if (this.state !== 'drawing') return
      this.terminateShape()
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
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

    if (this.fixedPositions.length >= 3) {
      if (!this.finishButton) {
        // 在第二个点上方插入文字按钮
        const secondPos = this.fixedPositions[0]
        const carto = Cesium.Cartographic.fromCartesian(secondPos)
        const upPos = Cesium.Cartesian3.fromRadians(
          carto.longitude,
          carto.latitude,
          (carto.height || 0) + 30 // 抬高 30
        )

        const buttonEntity = this.viewer!.entities.add({
          position: upPos,
          label: {
            text: '点击闭合',
            font: '18px sans-serif',
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 3,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -50), // 稍微向上偏移一点
            showBackground: true,
            backgroundColor: Cesium.Color.BLACK.withAlpha(0.6),
            backgroundPadding: new Cesium.Cartesian2(6, 4),
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            disableDepthTestDistance: Number.POSITIVE_INFINITY, // 添加这一行，使标签始终在最前
          },
        })

        this.finishButton = buttonEntity
      } else {
        this.finishButton.position = pointEntity.position
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

    if (this.activeShape) {
      this.viewer!.entities.remove(this.activeShape)
    }

    if (this.finishButton) {
      this.viewer!.entities.remove(this.finishButton)
    }

    this.pointEntityList.forEach(entity => {
      this.viewer!.entities.remove(entity)
    })
  }
}

export default MultipleShape
