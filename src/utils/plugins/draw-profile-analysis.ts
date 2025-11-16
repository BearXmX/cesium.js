import * as Cesium from 'cesium'

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

class ProfileAnalysis {
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

  // 展示距离的label实体
  distanceLabelEntityList: Cesium.Entity[] = []

  // 总距离
  totalDistance: number = 0

  totalDistanceLabelEntity: Cesium.Entity | null = null

  profileAnalysisPointPosition: Cesium.Cartesian3[] = []

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
        ...pointLabelStyle,
        pixelOffset: new Cesium.Cartesian2(0, -30),
        backgroundPadding: new Cesium.Cartesian2(6, 4),
        backgroundColor: Cesium.Color.WHITE,
        fillColor: Cesium.Color.BLACK,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 3,
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

    let prepareProfileAnalysisPointPosition = [] as Cesium.Cartesian3[]

    for (let i = 0; i < this.fixedPositions.length; i++) {
      if (i !== this.fixedPositions.length - 1) {
        const segements = this.interpolateBetweenPoints(this.fixedPositions[i], this.fixedPositions[i + 1], 2)

        const segmentPositions = []

        // 第一个点位
        if (i === 0) {
          segmentPositions.unshift(this.fixedPositions[0])
        }

        // 转换成经纬度
        for (let j = 0; j < segements.length; j++) {
          segmentPositions.push(segements[j])

          this.viewer!.entities.add({
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
        }

        segmentPositions.push(this.fixedPositions[i + 1])

        prepareProfileAnalysisPointPosition = [...prepareProfileAnalysisPointPosition, ...segmentPositions]
      }
    }

    this.computeDistanceFromStart(prepareProfileAnalysisPointPosition as Cesium.Cartesian3[])

    this.stop()
  }

  /** @description 计算与起点之间的距离 */
  computeDistanceFromStart(positions: Cesium.Cartesian3[]) {
    const nextPositions = positions.map((item, index) => {
      const left = index == 0 ? item : positions[index - 1]

      const distance = Cesium.Cartesian3.distance(left, item)

      const total = distance

      return {
        ...item,
        distanceFromLeft: index === 0 ? 0 : total,
      }
    })

    const totalPositions = nextPositions.map((item, index) => {
      return {
        ...item,
        distanceFromStart: this.stringDistance(
          item.distanceFromLeft + nextPositions.slice(0, index).reduce((acc, cur) => acc + cur.distanceFromLeft, 0)
        ),
      }
    })

    console.log('totalDistance', this.totalDistance)

    console.log('totalPositions', totalPositions)
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

    return Number(int) === 0 ? '0' : int + '.' + float.slice(0, 1)
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

    if (this.activeLine) {
      this.viewer!.entities.remove(this.activeLine)
    }

    if (this.finishButton) {
      this.viewer!.entities.remove(this.finishButton)
    }
  }
}

export default ProfileAnalysis
