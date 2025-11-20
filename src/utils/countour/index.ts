import * as Cesium from 'cesium'
import DiyShape from './diyShape'
import Geojson from './geojson'

export type ContourAnalysisOptionsType = {
  interfaceNum?: number
  colorFill?: string[]
  onOk?: () => void
}

class DrawCountour {
  static drawDiyShapeCountour = (viewer: Cesium.Viewer, options?: ContourAnalysisOptionsType | {}): DiyShape => {
    return new DiyShape(viewer, options)
  }

  static drawShapeByGeojson = (viewer: Cesium.Viewer, geojson: any, options?: ContourAnalysisOptionsType | {}) => {
    // @ts-ignore
    return new Geojson(viewer, geojson, options)
  }
}

export default DrawCountour
