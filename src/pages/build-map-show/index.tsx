import * as Cesium from "cesium";
import React, { useState, useEffect, useRef } from 'react'
import CommonMap, { type cameraFlyParamsType, type CommonMapInstanceType, type CommonMapPropsType } from '@/components/common-map'
import type { settingType } from "../build-map-setting/constance";
import { parseMapJson, setting_default } from "../build-map-setting/constance";
type BuildMapShowPropsType = {

}

const BuildMapShow: React.FC<BuildMapShowPropsType> = (props) => {

  const { } = props

  const [setting, setSetting] = useState<settingType>(setting_default)

  const mapInstance = useRef<CommonMapInstanceType>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);

  // 定义一个 ref，专门存储最新的 setting
  const settingRef = useRef(setting);

  // 监听 setting 变化，实时更新 ref.current
  useEffect(() => {
    settingRef.current = setting; // 每次 setting 更新，都把最新值同步到 ref
  }, [setting]);

  useEffect(() => {

  }, [])

  return <CommonMap model={'build'} pickToolsList={[]} ref={mapInstance} terrainInitCallback={() => {
    viewerRef.current = mapInstance.current?.getViewer()!

    const params = parseMapJson(viewerRef, mapInstance, {
      onBillboardClick(index) {

      },
    })

    setSetting(params)
  }}></CommonMap>

}

export default BuildMapShow