import * as Cesium from 'cesium'
import DiyShape from './diyShape'
import Circle from './circle'
import Geojson from './geojson'

interface ContourAnalysisOptions {
  interfaceNum?: number
  colorFill?: string[]
}

class DrawCountour {
  static drawDiyShapeCountour = (viewer: Cesium.Viewer, options?: ContourAnalysisOptions | {}): DiyShape => {
    return new DiyShape(viewer, options)
  }

  static drawShapeByGeojson = (viewer: Cesium.Viewer, geojson: any, options?: ContourAnalysisOptions | {}) => {
    return new Geojson(viewer, geojson, options)
  }

  static drawCircleCountour = (viewer: Cesium.Viewer, options?: ContourAnalysisOptions | {}): Circle => {
    return new Circle(viewer, options)
  }
}

export default DrawCountour
