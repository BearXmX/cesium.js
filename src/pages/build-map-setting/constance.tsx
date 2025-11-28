
import DrawCountour from '@/utils/plugins/draw-multiple-shape-countour'
import MultipleShape from '@/utils/plugins/draw-multiple-shape'
import LineShape from '@/utils/plugins/draw-line-shape'
import DrawerText from '@/utils/plugins/draw-text'
import MeasureDistance from '@/utils/plugins/draw-measure-distance'
import ProfileAnalysis, { type pointMetaType } from '@/utils/plugins/draw-profile-analysis'
import type MultipleShapeCountour from '@/utils/plugins/draw-multiple-shape-countour'

export type lineWidget = {
  type: 'line',
  title: string,
  instance?: LineShape
  points: {
    longitude: number
    latitude: number
    height?: number
  }[]
  color?: string
  width?: number
}

export type textWidget = {
  type: 'text'
  title: string
  position: {
    longitude: number
    latitude: number
    height?: number
  }
  instance?: DrawerText
}

export type settingType = {
  mapMetadata: {
    id: number
    title: string
    desciption: string
    cover: string
  }
  initialView: {
    title?: string;
    destination: {
      longitude: number
      latitude: number
      height: number
    }
    orientation?: {
      heading: number
      pitch: number
      roll: number
    }
  }[]

  mapWidget: (lineWidget | textWidget)[]
}
