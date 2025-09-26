import * as Cesium from 'cesium'
import { featureEach, interpolate, point, rhumbDistance, isolines } from '@turf/turf'

interface ContourAnalysisOptions {
  interfaceNum?: number
  colorFill?: string[]
}

class DrawShapeByGeojson {
  viewer: Cesium.Viewer
  interfaceNum: number = 25
  colorFill: string[] = []
  countorLineList: Cesium.DataSource[]
  countorLine: Cesium.GeoJsonDataSource | undefined
  countorLineLabelList: Cesium.Entity[]

  constructor(viewer: Cesium.Viewer, geojson: any, options?: ContourAnalysisOptions) {
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

    this.drawContourFromGeoJSON(geojson)
  }

  private drawContourFromGeoJSON(geojson: any): void {
    const $this = this
    const features: any[] = []
    const boundaryCoord = { minX: 360, maxX: -360, minY: 180, maxY: -180 }

    if (!geojson || !geojson.features) {
      window.alert('无效的 GeoJSON')
      return
    }

    // 支持 Polygon 或 MultiPolygon
    geojson.features.forEach((f: any) => {
      if (f.geometry.type === 'Polygon') {
        f.geometry.coordinates[0].forEach((coord: number[]) => {
          const lng = coord[0]
          const lat = coord[1]
          boundaryCoord.maxY = Math.max(lat, boundaryCoord.maxY)
          boundaryCoord.minY = Math.min(lat, boundaryCoord.minY)
          boundaryCoord.maxX = Math.max(lng, boundaryCoord.maxX)
          boundaryCoord.minX = Math.min(lng, boundaryCoord.minX)

          features.push({
            type: 'Feature',
            properties: {},
            geometry: { type: 'Point', coordinates: [lng, lat] },
          })
        })
      } else if (f.geometry.type === 'MultiPolygon') {
        f.geometry.coordinates.forEach((poly: number[][][]) => {
          poly[0].forEach((coord: number[]) => {
            const lng = coord[0]
            const lat = coord[1]
            boundaryCoord.maxY = Math.max(lat, boundaryCoord.maxY)
            boundaryCoord.minY = Math.min(lat, boundaryCoord.minY)
            boundaryCoord.maxX = Math.max(lng, boundaryCoord.maxX)
            boundaryCoord.minX = Math.min(lng, boundaryCoord.minX)

            features.push({
              type: 'Feature',
              properties: {},
              geometry: { type: 'Point', coordinates: [lng, lat] },
            })
          })
        })
      }
    })

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

    console.log(linesJson, 'linesJson')
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

          // 给每条等高线加一个 label
          if (element.polyline && element.polyline.positions) {
            const positions = element.polyline.positions.getValue(Cesium.JulianDate.now()) as any[]
            if (positions && positions.length > 0) {
              const heights = positions.map(p => $this.viewer.scene.globe.getHeight(Cesium.Cartographic.fromCartesian(p)) || 0)
              const avgHeight = heights.reduce((a, b) => a + b, 0) / heights.length
              const midPos = positions[Math.floor(positions.length / 2)]

              const carto = Cesium.Cartographic.fromCartesian(midPos)
              const fixedHeight = avgHeight + 2
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
                  },
                })

                $this.countorLineLabelList.push(labelEntity)
              }
            }
          }
        }
      }
    })
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

export default DrawShapeByGeojson
