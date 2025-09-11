// @ts-nocheck
import * as Cesium from 'cesium'
import { featureEach, interpolate, point, rhumbDistance, isolines } from '@turf/turf'
import CreateRemindertip from './tips'

class CircleContour {
  viewer: Cesium.Viewer
  floatingPoint: Cesium.Entity | undefined
  ellipseEntity: Cesium.Entity | undefined
  points: Cesium.Cartesian3[] = []
  handler: Cesium.ScreenSpaceEventHandler | undefined
  contourList: Cesium.DataSource[] = []
  interfaceNum: number = 25
  colorFill: string[] = [
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
  finished: boolean = false
  clickPoints: Cesium.Entity[] = []
  pointCounter: number = 0

  constructor(viewer: Cesium.Viewer) {
    if (!viewer) throw new Error('viewer is required')
    this.viewer = viewer
  }

  startDraw() {
    this.finished = false
    this.points = []
    this.clickPoints = []
    this.floatingPoint = undefined
    this.ellipseEntity = undefined

    const viewer = this.viewer
    let toolTip = '左键点击开始绘制区域，点击添加点'

    this.handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas)

    // 鼠标移动显示红点
    this.handler.setInputAction(event => {
      if (this.finished) return
      const newPos = viewer.scene.pickPosition(event.endPosition)
      if (!Cesium.defined(newPos)) return

      CreateRemindertip(toolTip, event.endPosition, true)

      if (this.points.length < 2) {
        if (!this.floatingPoint) {
          this.floatingPoint = viewer.entities.add({
            position: newPos,
            point: { color: Cesium.Color.RED, pixelSize: 5, heightReference: Cesium.HeightReference.CLAMP_TO_GROUND },
          })
        } else {
          this.floatingPoint.position!.setValue(newPos)
        }
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

    // 左键点击
    this.handler.setInputAction(event => {
      if (this.finished) return
      const earthPos = viewer.scene.pickPosition(event.position)
      if (!Cesium.defined(earthPos)) return

      // 保存点击点
      const pointEntity = viewer.entities.add({
        position: earthPos,
        point: { color: Cesium.Color.RED.withAlpha(0.8), pixelSize: 5, heightReference: Cesium.HeightReference.CLAMP_TO_GROUND },
      })
      this.clickPoints.push(pointEntity)

      this.points.push(earthPos)

      if (this.points.length === 1) {
        toolTip = '左键点击第二个点确定区域半径'
      } else if (this.points.length === 2) {
        // 绘制蓝色椭圆
        this.drawEllipse(this.points[0], this.points[1])

        // 删除浮动点
        if (this.floatingPoint) {
          viewer.entities.remove(this.floatingPoint)
          this.floatingPoint = undefined
        }

        toolTip = '右键点击生成等高线'
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    // 右键生成等高线
    this.handler.setInputAction(event => {
      if (this.finished || this.points.length < 2) return

      const ellipsePositions = this.getEllipsePositions(this.points[0], this.points[1], 64)
      this.generateContour(ellipsePositions)

      // 删除椭圆和红点
      if (this.ellipseEntity) {
        viewer.entities.remove(this.ellipseEntity)
        this.ellipseEntity = undefined
      }
      this.clickPoints.forEach(p => viewer.entities.remove(p))
      this.clickPoints = []

      // 隐藏提示
      CreateRemindertip('', event.position, false)

      // 不再允许标点
      this.handler?.destroy()
      this.finished = true
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
  }

  drawEllipse(center: Cesium.Cartesian3, radiusPos: Cesium.Cartesian3) {
    const viewer = this.viewer
    const centerCarto = viewer.scene.globe.ellipsoid.cartesianToCartographic(center)
    const radiusCarto = viewer.scene.globe.ellipsoid.cartesianToCartographic(radiusPos)
    const dx = Cesium.Math.toDegrees(radiusCarto.longitude - centerCarto.longitude)
    const dy = Cesium.Math.toDegrees(radiusCarto.latitude - centerCarto.latitude)
    const radius = Math.sqrt(dx * dx + dy * dy)

    this.ellipseEntity = viewer.entities.add({
      position: center,
      ellipse: {
        semiMajorAxis: radius * 111000,
        semiMinorAxis: radius * 111000,
        material: Cesium.Color.BLUE.withAlpha(0.4),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      },
    })
  }

  getEllipsePositions(center: Cesium.Cartesian3, radiusPos: Cesium.Cartesian3, segments: number = 64) {
    const positions: Cesium.Cartesian3[] = []
    const viewer = this.viewer
    const centerCarto = viewer.scene.globe.ellipsoid.cartesianToCartographic(center)
    const radiusCarto = viewer.scene.globe.ellipsoid.cartesianToCartographic(radiusPos)
    const dx = Cesium.Math.toDegrees(radiusCarto.longitude - centerCarto.longitude)
    const dy = Cesium.Math.toDegrees(radiusCarto.latitude - centerCarto.latitude)
    const radius = Math.sqrt(dx * dx + dy * dy)

    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * 2 * Math.PI
      const lon = Cesium.Math.toDegrees(centerCarto.longitude) + radius * Math.cos(angle)
      const lat = Cesium.Math.toDegrees(centerCarto.latitude) + radius * Math.sin(angle)
      positions.push(Cesium.Cartesian3.fromDegrees(lon, lat))
    }
    return positions
  }

  generateContour(positions: Cesium.Cartesian3[]) {
    const $this = this
    const features: any[] = []
    let boundaryCoord = { minX: 360, maxX: -360, minY: 180, maxY: -180 }

    positions.forEach(pos => {
      const carto = this.viewer.scene.globe.ellipsoid.cartesianToCartographic(pos)
      const lat = Cesium.Math.toDegrees(carto.latitude)
      const lng = Cesium.Math.toDegrees(carto.longitude)

      features.push({ type: 'Feature', properties: { height: 0 }, geometry: { type: 'Point', coordinates: [lng, lat] } })

      boundaryCoord.minX = Math.min(boundaryCoord.minX, lng)
      boundaryCoord.maxX = Math.max(boundaryCoord.maxX, lng)
      boundaryCoord.minY = Math.min(boundaryCoord.minY, lat)
      boundaryCoord.maxY = Math.max(boundaryCoord.maxY, lat)
    })

    const featureCollection = { type: 'FeatureCollection', features }
    const from = point([boundaryCoord.minX, boundaryCoord.minY])
    const to = point([boundaryCoord.maxX, boundaryCoord.maxY])
    const diagonalDistance = rhumbDistance(from, to, { units: 'kilometers' })
    const grid = interpolate(featureCollection, diagonalDistance / this.interfaceNum, { gridType: 'points', property: 'height', units: 'kilometers' })

    featureEach(grid, pt => {
      const coords = pt.geometry.coordinates
      const carto = Cesium.Cartographic.fromDegrees(coords[0], coords[1])
      const height = $this.viewer.scene.globe.getHeight(carto) || 0
      pt.properties.height = height
    })

    const breaks: number[] = []
    const stepCount = this.colorFill.length - 1
    const heights = grid.features.map(f => f.properties.height)
    const minHeight = Math.min(...heights)
    const maxHeight = Math.max(...heights)
    const step = (maxHeight - minHeight) / stepCount
    for (let i = 0; i <= stepCount; i++) breaks.push(minHeight + step * i)
    // 右击生成等高线部分
    Cesium.GeoJsonDataSource.load(isolines(grid, breaks, { zProperty: 'height' }), { clampToGround: true }).then(ds => {
      $this.viewer.dataSources.add(ds)
      $this.contourList.push(ds)

      const heightList = [] as string[]

      ds.entities.values.forEach(e => {
        const h = e.properties?.height?._value || 0
        const idx = breaks.findIndex(b => b > h)
        if (idx > 0) {
          // 设置线的颜色
          e.polyline.material = Cesium.Color.fromCssColorString($this.colorFill[idx - 1])

          // 只生成一个 label
          if (e.polyline.positions) {
            const positions = e.polyline.positions.getValue(Cesium.JulianDate.now())
            if (positions && positions.length > 0) {
              // 找中点

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
              }
            }
          }
        }
      })
    })
  }

  destroy() {
    this.floatingPoint && this.viewer.entities.remove(this.floatingPoint)
    this.ellipseEntity && this.viewer.entities.remove(this.ellipseEntity)
    this.contourList.forEach(ds => this.viewer.dataSources.remove(ds))
    this.contourList = []
    this.points = []
    this.handler?.destroy()
    this.finished = false
    this.clickPoints = []
  }
}

export default CircleContour
