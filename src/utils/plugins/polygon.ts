// @ts-nocheck

import * as turf from '@turf/turf'
import * as Cesium from 'cesium'

class CesiumDrawHexagonalGrid {
  constructor(viewer, options) {
    this._viewer = viewer
    this._coordinates = options?.coordinates || []
    this._cellSide = options?.cellSide || 20
    this._units = options?.units || { units: 'miles' }
  }
  drawHexagonalGrid() {
    const hexGrid = turf.hexGrid(this._coordinates, this._cellSide, this._units)
    hexGrid.features.forEach((feature, index) => {
      let positions = []
      const coordinates = feature.geometry.coordinates
      coordinates.forEach(item => {
        item.forEach(ite => {
          positions = positions.concat(ite)
        })
        this._viewer.entities.add({
          id: 'hexGrid' + index,
          polygon: {
            hierarchy: new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray(positions)),
            material: Cesium.Color.YELLOW.withAlpha(0.4),
          },
          polyline: { positions: Cesium.Cartesian3.fromDegreesArray(positions), width: 4, material: Cesium.Color.BLACK.withAlpha(0.5) },
        })
      })
    })
  }
}

export default CesiumDrawHexagonalGrid
