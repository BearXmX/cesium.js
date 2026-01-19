import { Spin, } from 'antd'
import * as Cesium from 'cesium'
import React, { useEffect, useImperativeHandle, useMemo, useState } from 'react'
import { useRef } from 'react'
import './index.less'
import { getCameraParams, initClickHandler } from './constance'
import MapTools from './map-tools'

export type CommonMapPropsType = {
  /** @description 地形加载完的回调 */
  terrainInitCallback?: () => void
  containerStyle?: React.CSSProperties
  model?: 'build-edit' | 'build-preview' | 'build'
  pickToolsList?: string[]
  children?: React.ReactNode
  depthTestAgainstTerrain?: boolean
  defaultCameraFlyToParams?: cameraParamsType
}

export type cameraFlyParamsType = Parameters<Cesium.Viewer['camera']['flyTo']>[0]

type cameraParamsType = {
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
}

export type CommonMapInstanceType = {
  getViewer: () => Cesium.Viewer
  cameraFlyTo: (params: cameraFlyParamsType) => void
  getCameraParams: () => cameraParamsType
  executeFlySequence: (flySequence: cameraFlyParamsType[]) => void
  flyToBoundingSphere: (positions: Cesium.Cartesian3[]) => void
}

const pick_tools_List_default = ['默认视角', '视角放大', '视角缩小', '区域等高线', '绘制多边形', '绘制线段', '测距工具', '剖面分析', '上传文件']

const CommonMap = React.forwardRef<CommonMapInstanceType, CommonMapPropsType>((props, instance) => {

  const {
    terrainInitCallback,
    model = 'build',
    pickToolsList = pick_tools_List_default,
    depthTestAgainstTerrain = false,
    defaultCameraFlyToParams,
  } = props

  const [loading, setLoading] = useState<boolean>(true)

  const containerRef = useRef<HTMLDivElement>(null)

  const viewerRef = useRef<Cesium.Viewer | null>(null)

  useImperativeHandle(instance, () => {
    return {
      getViewer() {
        return viewerRef.current!
      },
      cameraFlyTo(params) {
        viewerRef.current!.camera.flyTo({
          ...params,
        })
      },
      getCameraParams() {
        return getCameraParams(viewerRef.current)
      },
      executeFlySequence(flySequence: cameraFlyParamsType[]) {
        // 边界检查：地图实例不存在或序列为空，直接返回
        if (flySequence.length === 0) return

        // 递归执行每一步飞行
        const executeStep = (index: number) => {
          // 所有步骤执行完毕，退出
          if (index >= flySequence.length) return

          const currentStep = flySequence[index]

          // 执行当前步骤的相机飞行
          viewerRef.current!.camera.flyTo({
            // 透传当前步骤的所有配置（destination/duration/orientation等）
            ...currentStep,
            // 当前步骤完成后，执行下一个步骤
            complete: () => {
              // 如果当前步骤本身有complete回调，先执行它
              currentStep.complete?.()
              // 执行下一个步骤
              executeStep(index + 1)
            },
          })
        }

        // 从第一个步骤开始执行
        executeStep(0)
      },
      flyToBoundingSphere(positions) {
        const boundingSphere = Cesium.BoundingSphere.fromPoints(positions)
        viewerRef.current!.camera.flyToBoundingSphere(boundingSphere)
      },
    }
  })

  const defaultCameraFlyTo = () => {
    if (defaultCameraFlyToParams?.destination) {
      const destination = defaultCameraFlyToParams.destination
      viewerRef.current!.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(destination.longitude, destination.latitude, destination.height),
        orientation: defaultCameraFlyToParams.orientation,
        duration: 2,
      })
    }
  }

  const init = async () => {
    Cesium.Ion.defaultAccessToken = import.meta.env.VITE_APP_GITHUB_PROJECT_CESIUM_TOKEN

    const viewer = new Cesium.Viewer(containerRef.current!, {
      infoBox: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      baseLayerPicker: false,
      navigationHelpButton: false,
      animation: false,
      timeline: false,
      fullscreenButton: false,
      baseLayer: import.meta.env.DEV ? Cesium.ImageryLayer.fromProviderAsync(
        Cesium.ArcGisMapServerImageryProvider.fromBasemapType(
          Cesium.ArcGisBaseMapType.SATELLITE,
          // other supported styles include:
          // Cesium.ArcGisMapServerImageryProvider.HILLSHADE
          // Cesium.ArcGisMapServerImageryProvider.OCEANS
        ),
      ) : undefined,
    })

    viewer.scene.globe.showGroundAtmosphere = false
      ; (viewer.cesiumWidget.creditContainer as HTMLDivElement).style.display = 'none'

    viewerRef.current = viewer

    /*     const esri = await Cesium.ArcGisMapServerImageryProvider.fromUrl(
          'https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer', {
    
        }
        )
    
        const index = 1
        viewer.imageryLayers.addImageryProvider(esri, index) */

    Cesium.createWorldTerrainAsync({ requestVertexNormals: true, requestWaterMask: true })
      .then(async terrain => {
        viewer.terrainProvider = terrain
        setLoading(false)

        if (typeof terrainInitCallback === 'function') {
          terrainInitCallback()
        }

        if (depthTestAgainstTerrain && terrain) {
          viewer.scene.globe.depthTestAgainstTerrain = true
        }
      })
      .finally(() => {
        setLoading(false)

        defaultCameraFlyTo()
      })

    initClickHandler(viewer)
  }

  const viewerInstance = useMemo(() => {
    return viewerRef.current ? viewerRef.current : null
  }, [viewerRef.current])


  useEffect(() => {
    init()

    return () => {
      viewerRef.current!.destroy()
    }
  }, [])

  return (
    <>
      <div className="canvas-container" style={props.containerStyle}>
        <div className="canvas-container-body" ref={containerRef} >
          {
            !!viewerInstance && <MapTools model={model} defaultCameraFlyToParams={defaultCameraFlyToParams} viewer={viewerInstance!} pickToolsList={pickToolsList}></MapTools>
          }
        </div>
        {loading && (
          <div
            className="canvas-container-loading"
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 999999999,
              background: '#000',
            }}
          >
            <Spin spinning={true} tip={<div style={{ width: 200, transform: 'translateX(-50%)' }}>加载中...</div>}>
              <></>
            </Spin>
          </div>
        )}
        {props.children}
      </div>
    </>
  )
})

export default CommonMap
