import * as Cesium from 'cesium'
import DiyMultipleShapeCountour from './diy-multiple-shape-countour'
import Geojson from './geojson'
import type { EventType } from '../plugins/type'

export type ContourAnalysisOptionsType = {
  interfaceNum?: number
  colorFill?: string[]
} & EventType

class DrawCountour {
  static drawDiyShapeCountour = (viewer: Cesium.Viewer, options?: ContourAnalysisOptionsType | {}): DiyMultipleShapeCountour => {
    return new DiyMultipleShapeCountour(viewer, options)
  }

  static drawShapeByGeojson = (viewer: Cesium.Viewer, geojson: any, options?: ContourAnalysisOptionsType | {}) => {
    // @ts-ignore
    return new Geojson(viewer, geojson, options)
  }
}

export default DrawCountour
