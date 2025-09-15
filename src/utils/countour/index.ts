import * as Cesium from 'cesium'
import DiyShape from './diyShape'
import Circle from './circle'
import Geojson from './geojson'

class DrawCountour {
  static drawDiyShapeCountour = (viewer: Cesium.Viewer): DiyShape => {
    return new DiyShape(viewer)
  }

  static drawShapeByGeojson = (viewer: Cesium.Viewer, geojson: any) => {
    return new Geojson(viewer, geojson)
  }

  static drawCircleCountour = (viewer: Cesium.Viewer): Circle => {
    return new Circle(viewer)
  }
}

export default DrawCountour
