import CommonMap, { type CommonMapInstanceType } from '@/components/common-map'
import React, { useState, useEffect, useRef } from 'react'
import * as Cesium from 'cesium'
import GeoJsonLoader from '@/utils/plugins/geojson-loader'
type DebugGeojsonPropsType = {

}

const DebugGeojson: React.FC<DebugGeojsonPropsType> = (props) => {

  const { } = props
  const mapInstance = useRef<CommonMapInstanceType>(null)

  const viewerRef = useRef<Cesium.Viewer | null>(null)

  // #8b2106
  const loaderGeojson = (params: {
    show: boolean,
    ref: React.RefObject<Cesium.Entity[]>,
    url: string,
  }) => {

    if (params.show && !params.ref.current?.length) {
      fetch(params.url).then(res => res.json()).then(data => {

        const loader = new GeoJsonLoader(viewerRef.current!)

        loader.render(data).then(entities => {
          params.ref.current = entities
        })
      })

      return
    }

    if (!params.show && params.ref.current?.length) {
      params.ref.current.forEach(item => {
        item.show = false
      })
    }

    if (params.show && params.ref.current?.length) {
      params.ref.current.forEach(item => {
        item.show = true
      })
    }

  }

  useEffect(() => {
    viewerRef.current = mapInstance.current?.getViewer()!

    // 加载自定义瓦片影像

    /*     const customTileset = new Cesium.UrlTemplateImageryProvider({
          url: '/api/全球地形渲染影像-04/{z}/{x}/{y}.png', // 本地相对路径模板
          minimumLevel: 2,  // 你拥有的最小级别
          maximumLevel: 7,  // 你拥有的最大级别
          tileWidth: 256,   // 瓦片宽度（通常为256或512）
          tileHeight: 256,  // 瓦片高度
          // 如果你的瓦片不是覆盖全球，可以指定矩形范围（西经，南纬，东经，北纬，单位：弧度）
          // rectangle: Cesium.Rectangle.fromDegrees(70, 0, 140, 60) // 例如：仅显示中国区域
        });
    
        const myTileLayer = viewerRef.current.imageryLayers.addImageryProvider(customTileset); */
  }, [])

  return <CommonMap pickToolsList={['上传文件']} ref={mapInstance}
    defaultCameraFlyToParams={{
      destination: {
        longitude: 113.067491328234,
        latitude: 34.034616852726494,
        height: 6664311.55,
      },
    }}></CommonMap>

}

export default DebugGeojson