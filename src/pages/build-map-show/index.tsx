import * as Cesium from "cesium";
import React, { useState, useEffect, useRef } from 'react'
import CommonMap, { type cameraFlyParamsType, type CommonMapInstanceType, type CommonMapPropsType } from '@/components/common-map'
import type { settingType } from "../build-map-setting/constance";
import { setting_default, transfromDestination } from "../build-map-setting";
import LineShape from "@/utils/plugins/draw-line-shape";
type BuildMapShowPropsType = {

}

const BuildMapShow: React.FC<BuildMapShowPropsType> = (props) => {

  const { } = props

  const [setting, setSetting] = useState<settingType>(setting_default)

  const mapInstance = useRef<CommonMapInstanceType>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);

  useEffect(() => {

  }, [])

  return <CommonMap model={'build'} pickToolsList={[]} ref={mapInstance} terrainInitCallback={() => {
    viewerRef.current = mapInstance.current?.getViewer()!

    // 拿url的查询参数
    const query = new URLSearchParams(window.location.search)
    const id = Number(query.get('id'))

    if (!id) return
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
    params.mapWidget = params.mapWidget.map(item => {

      if (item.type === 'line') {
        const { points, color, width } = item
        const lineShape = new LineShape(viewerRef.current!, {
          color,
          width
        })

        lineShape.creatFinalShape(points.map(item => {
          return Cesium.Cartesian3.fromDegrees(item.longitude, item.latitude)
        }))

        return {
          ...item,
          instance: lineShape,
        }
      }

      return item
    })

    setSetting(params)

  }}></CommonMap>

}

export default BuildMapShow