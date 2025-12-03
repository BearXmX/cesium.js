import * as Cesium from "cesium";
import DrawCountour from '@/utils/plugins/draw-multiple-shape-countour'
import MultipleShape from '@/utils/plugins/draw-multiple-shape'
import LineShape from '@/utils/plugins/draw-line-shape'
import DrawerText from '@/utils/plugins/draw-text'
import MeasureDistance from '@/utils/plugins/draw-measure-distance'
import ProfileAnalysis, { type pointMetaType } from '@/utils/plugins/draw-profile-analysis'
import type MultipleShapeCountour from '@/utils/plugins/draw-multiple-shape-countour'
import DrawBillboard from '@/utils/plugins/draw-billboard'
import DrawText from "@/utils/plugins/draw-text";
import type { cameraFlyParamsType, CommonMapInstanceType } from "@/components/common-map";

export type lineWidget = {
  type: 'line',
  title: string,
  instance?: LineShape
  points: {
    longitude: number
    latitude: number
    height?: number
  }[]
  params: {
    content?: string
    color?: string
    width?: number
  }

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
  params: {
    content?: string
    label?: string
    color?: string
    fontSize?: number
    outlineColor?: string
    outlineWidth?: number
    showBackground?: number
    backgroundColor?: string
    backgroundPaddingX?: number
    backgroundPaddingY?: number
  }
}

export type billboardWidget = {
  type: 'billboard',
  title: string,
  position: {
    longitude: number
    latitude: number
    height?: number
  }
  instance?: DrawBillboard
  params: {
    scale?: number
    content?: string
  }
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

  mapWidget: (lineWidget | textWidget | billboardWidget)[]
}
export const setting_default: settingType = {
  mapMetadata: {
    id: 1,
    title: '',
    desciption: '',
    cover: 'https://q3.itc.cn/images01/20251004/6b6104cb287743fa82808c060ab22f83.png',
  },
  initialView: [],
  mapWidget: []
}


export const transfromDestination = (destination: settingType['initialView'][0]['destination']) => {
  return Cesium.Cartesian3.fromDegrees(destination.longitude, destination.latitude, destination.height)
}

export const parseMapJson = (viewerRef: React.RefObject<Cesium.Viewer | null>, mapInstance: React.RefObject<CommonMapInstanceType | null>, options?: {
  onClickWidget?: (index: number) => void
}): settingType => {
  // 拿url的查询参数
  const query = new URLSearchParams(window.location.search)

  const id = Number(query.get('id'))

  if (!id) return setting_default

  const json = JSON.parse(localStorage.getItem('build-map-list') || '[]')

  const list = (Array.isArray(json) ? json : []) as settingType[]

  const params = {
    ...list.find(item => item.mapMetadata.id === id)
  } as settingType

  /* 先处理视角 */
  const initialViewParams: cameraFlyParamsType[] = params.initialView.map(item => {

    const current = item

    return {
      destination: transfromDestination(current.destination),
      orientation: current.orientation
    }

  })

  mapInstance.current?.executeFlySequence(initialViewParams)

  /* 处理地图组件 */
  params.mapWidget = params.mapWidget.map((item, index) => {

    if (item.type === 'line') {
      const { points, params } = item

      const instance = new LineShape(viewerRef.current!, {
        ...params,
        onClick(ref) {
          if (options?.onClickWidget) {
            options.onClickWidget(index)
          }
        }
      })

      instance.creatFinalShape(points.map(item => {
        return Cesium.Cartesian3.fromDegrees(item.longitude, item.latitude)
      }))

      item.instance = instance

      return {
        ...item,
        instance: instance,
      }
    }

    if (item.type === 'text') {
      const { position, params } = item

      const instance = new DrawText(viewerRef.current!, {
        label: item.params.label,
        ...params,
        onClick(ref) {
          if (options?.onClickWidget) {
            options.onClickWidget(index)
          }
        }
      })

      item.instance = instance

      instance.createFinalTextEntity(Cesium.Cartesian3.fromDegrees(position.longitude, position.latitude, position.height))

      return {
        ...item,
        instance: instance,
      }
    }

    if (item.type === 'billboard') {
      const { position, params } = item

      const instance = new DrawBillboard(viewerRef.current!, {
        ...params,
        onClick(ref) {
          if (options?.onClickWidget) {
            options.onClickWidget(index)
          }
        }
      })

      item.instance = instance

      instance.createFinalbBillboardEntity(Cesium.Cartesian3.fromDegrees(position.longitude, position.latitude, position.height))

      return {
        ...item,
        instance: instance,
      }
    }

    return item
  })

  return params
}
