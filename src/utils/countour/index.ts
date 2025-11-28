import * as Cesium from 'cesium'
import Geojson from './geojson'
import type { EventType } from '../plugins/type'

export type ContourAnalysisOptionsType = {
  interfaceNum?: number
  colorFill?: string[]
} & EventType

class DrawCountour {
  static drawShapeByGeojson = (viewer: Cesium.Viewer, geojson: any, options?: ContourAnalysisOptionsType | {}) => {
    // @ts-ignore
    return new Geojson(viewer, geojson, options)
  }
}

export default DrawCountour
