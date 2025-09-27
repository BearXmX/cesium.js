import * as Cesium from 'cesium'
import { featureEach, interpolate, point, rhumbDistance, isolines } from '@turf/turf'
import CreateRemindertip from './tips'

const _instance = [] as DiyShape[]

interface ContourAnalysisOptions {
  interfaceNum?: number
  colorFill?: string[]
}

class DiyShape {
  viewer!: Cesium.Viewer
  interfaceNum: number = 25
  colorFill: string[] = []
  countorLineList: Cesium.DataSource[] = []
  drawGeomtry: Cesium.Entity | undefined
  countorLine: Cesium.GeoJsonDataSource | undefined
  countorLineLabelList: Cesium.Entity[] = []
  finished: boolean = false

  points: Cesium.Cartesian3[] = []

  /* 每一个点击实例 */
  clickPoints: Cesium.Entity[] = [] // 存储每次点击的点

  buttonEntity: Cesium.Entity | undefined = undefined

  constructor(viewer: Cesium.Viewer, options?: ContourAnalysisOptions) {
    if (_instance.some(item => !item.finished)) {
      window.alert('已经有正在绘制的等高线！请勿重复操作')
      return
    }

    _instance.push(this)

    if (!viewer) throw new Error('no viewer object!')

    this.viewer = viewer

    this.interfaceNum = 25

    this.colorFill = [
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

    options = options || {}

    this.interfaceNum = Cesium.defaultValue(options.interfaceNum, this.interfaceNum)

    this.colorFill = Cesium.defaultValue(options.colorFill, this.colorFill)

    this.countorLineList = []

    this.countorLineLabelList = []

    this.finished = false

    this.startDraw({
      colorFill: this.colorFill,
      interfaceNum: this.interfaceNum,
    })
  }

  startDraw(options?: ContourAnalysisOptions): void {
    options = options || {}
    this.interfaceNum = Cesium.defaultValue(options.interfaceNum, 25)
    this.colorFill = Cesium.defaultValue(options.colorFill, this.colorFill)
    this.createNewLine()
  }

  private createNewLine(): void {
    const $this = this
    const viewer = this.viewer

    const activeShapePoints: Cesium.Cartesian3[] = []

    let activeShape: Cesium.Entity | undefined

    let floatingPoint: Cesium.Entity | undefined

    const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas)

    let toolTip = '左键点击开始绘制区域，点击添加点'

    // 鼠标移动，小红点跟随
    handler.setInputAction(function (event: Cesium.ScreenSpaceEventHandler.MotionEvent) {
      const newPosition = viewer.scene.pickPosition(event.endPosition)

      if ($this.finished) {
        CreateRemindertip(toolTip, event.endPosition, false)
      }

      if (!Cesium.defined(newPosition)) return

      CreateRemindertip(toolTip, event.endPosition, true)

      if (!floatingPoint) {
        floatingPoint = viewer.entities.add({
          position: newPosition,
          point: {
            color: Cesium.Color.RED.withAlpha(0.8),
            pixelSize: 5,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          },
        })
      } else {
        // @ts-ignore
        floatingPoint.position!.setValue(newPosition)
      }

      if (activeShapePoints.length > 0) {
        activeShapePoints.pop()
        activeShapePoints.push(newPosition)
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

    // 左键点击
    handler.setInputAction(function (event: Cesium.ScreenSpaceEventHandler.PositionedEvent) {
      if ($this.finished) return

      const picked = viewer.scene.pick(event.position)

      if (Cesium.defined(picked) && picked.id === $this.buttonEntity) {
        toolTip = ''
        CreateRemindertip(toolTip, event.position, false)

        terminateShape()

        return
      }

      const earthPosition = viewer.scene.pickPosition(event.position)
      if (Cesium.defined(earthPosition)) {
        // 每次点击生成唯一点
        const pointEntity = $this.createPoint(earthPosition, activeShapePoints.length === 0)

        $this.clickPoints.push(pointEntity)

        $this.points.push(earthPosition)

        CreateRemindertip(toolTip, event.position, true)

        if ($this.clickPoints.length >= 3) {
          if (!$this.buttonEntity) {
            // 在第二个点上方插入文字按钮
            const secondPos = $this.points[0]
            const carto = Cesium.Cartographic.fromCartesian(secondPos)
            const upPos = Cesium.Cartesian3.fromRadians(
              carto.longitude,
              carto.latitude,
              (carto.height || 0) + 50 // 抬高 30 米
            )

            const buttonEntity = viewer.entities.add({
              position: upPos,
              label: {
                text: '点我生成等高线',
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

            $this.buttonEntity = buttonEntity
          } else {
            $this.buttonEntity.position = pointEntity.position
          }
        }

        if (activeShapePoints.length === 0) {
          toolTip = '左键添加第二个点'

          activeShapePoints.push(earthPosition)

          const dynamicPositions = new Cesium.CallbackProperty(function () {
            return new Cesium.PolygonHierarchy(activeShapePoints)
          }, false)

          activeShape = $this.drawShape(dynamicPositions)
        } else {
          toolTip = '左键添加点'
        }

        activeShapePoints.push(earthPosition)
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    // 右键完成绘制
    /*     handler.setInputAction(function (event: Cesium.ScreenSpaceEventHandler.PositionedEvent) {
      CreateRemindertip(toolTip, event.position, false)
      terminateShape()
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK) */

    function terminateShape(): void {
      activeShapePoints.pop()

      if (activeShapePoints.length) {
        $this.drawShape(activeShapePoints)
      }

      if ($this.buttonEntity) {
        $this.buttonEntity!.show = false
        viewer.entities.remove($this.buttonEntity)
      }

      // 隐藏所有点击点
      $this.clickPoints.forEach(p => {
        p.show = false
        viewer.entities.remove(p)
      })

      if (floatingPoint) {
        floatingPoint!.show = false
        viewer.entities.remove(floatingPoint)
      }

      if (activeShape) {
        activeShape.show = false
        viewer.entities.remove(activeShape)
      }

      handler.destroy()

      $this.finished = true

      $this.interpolatePoint(activeShapePoints)
    }
  }

  private createPoint(worldPosition: Cesium.Cartesian3, boolPoint: boolean): Cesium.Entity {
    const _size = boolPoint ? 30 : 5

    return this.viewer.entities.add({
      position: worldPosition,
      point: {
        color: Cesium.Color.RED.withAlpha(0.8),
        pixelSize: _size,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      },
    })
  }

  private drawShape(positionData: any): Cesium.Entity {
    this.drawGeomtry = this.viewer.entities.add({
      name: 'contourBoundary',
      polygon: {
        hierarchy: positionData,
        material: new Cesium.ColorMaterialProperty(Cesium.Color.BLUE.withAlpha(0.4)),
      },
    })
    return this.drawGeomtry
  }

  private interpolatePoint(curPoints: Cesium.Cartesian3[]): void {
    const $this = this
    const features: any[] = []
    const boundaryCoord = { minX: 360, maxX: -360, minY: 180, maxY: -180 }

    for (let index = 0; index < curPoints.length; index++) {
      const element = curPoints[index]
      const ellipsoid = this.viewer.scene.globe.ellipsoid
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
      const height = $this.viewer.scene.globe.getHeight(cartographic)
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
      $this.viewer.dataSources.add(dataSource)
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
              const heights = positions.map(p => $this.viewer.scene.globe.getHeight(Cesium.Cartographic.fromCartesian(p)) || 0)

              const avgHeight = heights.reduce((a, b) => a + b, 0) / heights.length

              const midPos = positions[Math.floor(positions.length / 2)]

              const carto = Cesium.Cartographic.fromCartesian(midPos)

              const fixedHeight = avgHeight + 2 // 2 米偏
              const fixedPos = Cesium.Cartesian3.fromRadians(carto.longitude, carto.latitude, fixedHeight)

              const labelHeight = Math.floor(avgHeight).toFixed(0)
              if (!heightList.includes(labelHeight)) {
                heightList.push(labelHeight)

                const labelEntity = $this.viewer.entities.add({
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

    if (this.drawGeomtry) {
      this.viewer.entities.remove(this.drawGeomtry)
    }
  }

  private getObjectIndex(arr: number[], num: number): number | undefined {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] > num) return i
    }
    return undefined
  }

  clear(countorLine?: Cesium.DataSource): void {
    if (countorLine) {
      this.viewer.dataSources.remove(countorLine)
      const index = this.countorLineList.indexOf(countorLine)
      if (index > -1) this.countorLineList.splice(index, 1)
    }
  }

  destroy(): void {
    this.countorLineList.forEach(element => this.viewer.dataSources.remove(element))
    this.countorLineList = []

    this.countorLineLabelList.forEach(element => this.viewer.entities.remove(element))
    this.countorLineLabelList = []
  }
}

export default DiyShape
