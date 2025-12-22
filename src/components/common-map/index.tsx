import { Button, Drawer, message, Select, Spin, Tooltip, type DrawerProps } from 'antd'
import * as Cesium from 'cesium'
import React, { use, useEffect, useImperativeHandle, useMemo, useState } from 'react'
import { useRef } from 'react'
import DrawAreaCountourIcon from '@/assets/svg/draw-area-countour-icon.svg?react'
import DrawMultipleShapeIcon from '@/assets/svg/draw-multiple-shape-icon.svg?react'
import DrawLineShapeIcon from '@/assets/svg/draw-line-shape-icon.svg?react'
import DrawMeasureDistanceIcon from '@/assets/svg/draw-measure-distance-icon.svg?react'
import DrawProfileAnalysisIcon from '@/assets/svg/draw-profile-analysis-icon.svg?react'
import ZoomInIcon from '@/assets/svg/zoom-in-icon.svg?react'
import ZoomOutIcon from '@/assets/svg/zoom-out-icon.svg?react'
import ZoomToHomeIcon from '@/assets/svg/zoom-to-home.svg?react'

import DrawCountour from '@/utils/plugins/draw-multiple-shape-countour'
import MultipleShape, { Mutiple_SHAPE_OPTIONS_DEFAULT } from '@/utils/plugins/draw-multiple-shape'
import LineShape, { LINE_SHAPE_OPTIONS_DEFAULT } from '@/utils/plugins/draw-line-shape'
import MeasureDistance, { MEASURE_DISTANCE_OPTIONS_DEFAULT } from '@/utils/plugins/draw-measure-distance'
import ProfileAnalysis, { PROFILE_ANALYSIS_OPTIONS_DEFAULT, type pointMetaType } from '@/utils/plugins/draw-profile-analysis'
import type MultipleShapeCountour from '@/utils/plugins/draw-multiple-shape-countour'
import ProfileAnalysisChart from './profile-analysis-chart'
import './index.less'
import { getCameraParams, initClickHandler } from './constance'
import type { settingType } from '@/pages/build-map-setting/constance'

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

type CommonToolsType = {
  icon: React.ReactNode
  title: string
  onClick: () => void
  showTipsClycle?: Boolean
  onClickTips?: (e: React.MouseEvent<HTMLDivElement>) => void
}

export type CommonMapInstanceType = {
  getViewer: () => Cesium.Viewer
  cameraFlyTo: (params: cameraFlyParamsType) => void
  getCameraParams: () => cameraParamsType
  executeFlySequence: (flySequence: cameraFlyParamsType[]) => void
  flyToBoundingSphere: (positions: Cesium.Cartesian3[]) => void
}

const pick_tools_List_default = ['默认视角', '视角放大', '视角缩小', '区域等高线', '绘制多边形', '绘制线段', '测距工具', '剖面分析']

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

  const [open, setOpen] = useState<boolean>(false)

  const [profileAnalysisMetaData, setProfileAnalysisMetaData] = useState<{ data: pointMetaType[]; type: string; instance: ProfileAnalysis }[]>([])

  const [activeTool, setActiveTool] = useState<{
    type?: string
    instance?: MultipleShapeCountour | MultipleShape | LineShape | MeasureDistance | ProfileAnalysis
  }>({})

  const [allowActiveToolToCompleted, setAllowActiveToolToCompleted] = useState<boolean>(false)

  const [placement, setPlacement] = useState<DrawerProps['placement']>('bottom')

  const [mapWidget, setMapWidget] = useState<settingType['mapWidget']>([])

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

  const init = () => {
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
    })

    viewer.scene.globe.showGroundAtmosphere = false
      ; (viewer.cesiumWidget.creditContainer as HTMLDivElement).style.display = 'none'

    viewerRef.current = viewer

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

  const commonTools: CommonToolsType[] = [
    {
      icon: <ZoomToHomeIcon></ZoomToHomeIcon>,
      title: '默认视角',
      onClick: () => {
        if (model !== 'build') {
          return
        }
        defaultCameraFlyTo()
      },
    },
    {
      icon: <ZoomInIcon></ZoomInIcon>,
      title: '视角放大',
      onClick: () => {
        if (model !== 'build') {
          return
        }
        viewerRef.current!.camera.zoomIn(100000)
      },
    },
    {
      icon: <ZoomOutIcon></ZoomOutIcon>,
      title: '视角缩小',
      onClick: () => {
        if (model !== 'build') {
          return
        }
        viewerRef.current!.camera.zoomOut(100000)
      },
    },
  ]

  const useMouseTools = [
    {
      icon: <DrawAreaCountourIcon></DrawAreaCountourIcon>,
      title: '区域等高线',
      onClick: () => {
        if (model !== 'build') {
          return
        }

        if (!!activeTool.type) {
          message.warning('当前正在使用' + activeTool.type + '工具，请先结束当前工具')
          return
        }

        const drawer = new DrawCountour(viewerRef.current!, {
          onCompleted(fixedPositions) {
            setActiveTool({})
            setAllowActiveToolToCompleted(false)

            const coordinates = fixedPositions!.map(position => {
              const cartographic = Cesium.Cartographic.fromCartesian(position)
              const longitude = Cesium.Math.toDegrees(cartographic.longitude)
              const latitude = Cesium.Math.toDegrees(cartographic.latitude)
              /*               const height = cartographic.height */
              return {
                longitude,
                latitude,
                /*                 height, */
              }
            })

            setMapWidget(pre => [
              ...pre,
              {
                type: 'multipleShapeCountour',
                title: '区域等高线实例',
                points: coordinates,
                instance: drawer,
                params: {

                },
              },
            ])
          },
          onCancel() {
            setActiveTool({})
            setAllowActiveToolToCompleted(false)
          },
          onShowFinishEntity() {
            setAllowActiveToolToCompleted(true)
          },
        })

        setActiveTool({ type: '区域等高线', instance: drawer })
      },
    },
    {
      icon: <DrawMultipleShapeIcon></DrawMultipleShapeIcon>,
      title: '绘制多边形',
      onClick: () => {
        if (model !== 'build') {
          return
        }

        if (!!activeTool.type) {
          message.warning('当前正在使用' + activeTool.type + '工具，请先结束当前工具')
          return
        }

        const drawer = new MultipleShape(viewerRef.current!, {
          onCompleted(fixedPositions) {
            setActiveTool({})
            setAllowActiveToolToCompleted(false)

            const coordinates = fixedPositions!.map(position => {
              const cartographic = Cesium.Cartographic.fromCartesian(position)
              const longitude = Cesium.Math.toDegrees(cartographic.longitude)
              const latitude = Cesium.Math.toDegrees(cartographic.latitude)
              /*               const height = cartographic.height */
              return {
                longitude,
                latitude,
                /*                 height, */
              }
            })

            setMapWidget(pre => [
              ...pre,
              {
                type: 'multipleShape',
                title: '多边形实例',
                points: coordinates,
                instance: drawer,
                params: {
                  ...Mutiple_SHAPE_OPTIONS_DEFAULT,
                },
              },
            ])
          },
          onCancel() {
            setActiveTool({})
            setAllowActiveToolToCompleted(false)
          },
          onShowFinishEntity() {
            setAllowActiveToolToCompleted(true)
          },
        })

        setActiveTool({ type: '绘制多边形', instance: drawer })
      },
    },
    {
      icon: <DrawLineShapeIcon></DrawLineShapeIcon>,
      title: '绘制线段',
      onClick: () => {
        if (model !== 'build') {
          return
        }

        if (!!activeTool.type) {
          message.warning('当前正在使用' + activeTool.type + '工具，请先结束当前工具')
          return
        }

        const drawer = new LineShape(viewerRef.current!, {
          onCompleted(fixedPositions) {
            setActiveTool({})
            setAllowActiveToolToCompleted(false)

            const coordinates = fixedPositions!.map(position => {
              const cartographic = Cesium.Cartographic.fromCartesian(position)
              const longitude = Cesium.Math.toDegrees(cartographic.longitude)
              const latitude = Cesium.Math.toDegrees(cartographic.latitude)
              /*               const height = cartographic.height */
              return {
                longitude,
                latitude,
                /*                 height, */
              }
            })

            setMapWidget(pre => [
              ...pre,
              {
                type: 'line',
                title: '线段实例',
                points: coordinates,
                instance: drawer,
                params: {
                  ...LINE_SHAPE_OPTIONS_DEFAULT,
                },
              },
            ])
          },
          onCancel() {
            setActiveTool({})
            setAllowActiveToolToCompleted(false)
          },
          onShowFinishEntity() {
            setAllowActiveToolToCompleted(true)
          },
        })

        setActiveTool({ type: '绘制线段', instance: drawer })
      },
    },
    {
      icon: <DrawMeasureDistanceIcon></DrawMeasureDistanceIcon>,
      title: '测距工具',
      onClick: () => {
        if (model !== 'build') {
          return
        }

        if (!!activeTool.type) {
          message.warning('当前正在使用' + activeTool.type + '工具，请先结束当前工具')
          return
        }

        const drawer = new MeasureDistance(viewerRef.current!, {
          onCompleted(fixedPositions) {
            setActiveTool({})
            setAllowActiveToolToCompleted(false)

            const coordinates = fixedPositions!.map(position => {
              const cartographic = Cesium.Cartographic.fromCartesian(position)
              const longitude = Cesium.Math.toDegrees(cartographic.longitude)
              const latitude = Cesium.Math.toDegrees(cartographic.latitude)
              /*               const height = cartographic.height */
              return {
                longitude,
                latitude,
                /*                 height, */
              }
            })

            setMapWidget(pre => [
              ...pre,
              {
                type: 'messureDistance',
                title: '测距工具实例',
                points: coordinates,
                instance: drawer,
                params: {
                  ...MEASURE_DISTANCE_OPTIONS_DEFAULT,
                },
              },
            ])
          },
          onCancel() {
            setActiveTool({})
            setAllowActiveToolToCompleted(false)
          },
          onShowFinishEntity() {
            setAllowActiveToolToCompleted(true)
          },
        })

        setActiveTool({ type: '测距工具', instance: drawer })
      },
    },
    {
      icon: <DrawProfileAnalysisIcon></DrawProfileAnalysisIcon>,
      title: '剖面分析',
      showTipsClycle: !!profileAnalysisMetaData.length,
      onClickTips: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.stopPropagation()
        setOpen(true)
      },
      onClick: () => {
        if (model !== 'build') {
          return
        }

        if (!!activeTool.type) {
          message.warning('当前正在使用' + activeTool.type + '工具，请先结束当前工具')
          return
        }

        const drawer = new ProfileAnalysis(viewerRef.current!, {
          onLoadData: (data: pointMetaType[]) => {
            setOpen(true)
            setProfileAnalysisMetaData([...profileAnalysisMetaData, { data: data, instance: drawer, type: '剖面分析' }])
          },
          onCompleted(fixedPositions) {
            setActiveTool({})
            setAllowActiveToolToCompleted(false)

            const coordinates = fixedPositions!.map(position => {
              const cartographic = Cesium.Cartographic.fromCartesian(position)
              const longitude = Cesium.Math.toDegrees(cartographic.longitude)
              const latitude = Cesium.Math.toDegrees(cartographic.latitude)
              /*               const height = cartographic.height */
              return {
                longitude,
                latitude,
                /*                 height, */
              }
            })

            setMapWidget(pre => [
              ...pre,
              {
                type: 'profileAnalysis',
                title: '剖面分析实例',
                points: coordinates,
                instance: drawer,
                params: {
                  ...PROFILE_ANALYSIS_OPTIONS_DEFAULT,
                },
              },
            ])
          },
          onCancel() {
            setActiveTool({})
            setAllowActiveToolToCompleted(false)
          },
          onShowFinishEntity() {
            setAllowActiveToolToCompleted(true)
          },
        })

        setActiveTool({ type: '剖面分析', instance: drawer })
      },
    },
  ]

  useEffect(() => {
    console.log(mapWidget)
  }, [mapWidget])

  const finalTools = useMemo(() => {
    return [...commonTools, ...useMouseTools].filter(item => pickToolsList.includes(item.title))
  }, [pickToolsList, profileAnalysisMetaData, activeTool])

  useEffect(() => {
    init()

    return () => {
      viewerRef.current!.destroy()
    }
  }, [])

  return (
    <>
      <div className="canvas-container" style={props.containerStyle}>
        <div className="canvas-container-body" ref={containerRef} />
        {finalTools.length > 0 && (
          <div className="map-diy-tools-container">
            <div className="map-diy-tools-container-wrapper">
              {finalTools.map(item => (
                <div className="map-diy-tools-item-wrapper" key={item.title}>
                  <Tooltip
                    open={item.title === activeTool.type}
                    styles={{
                      body: {
                        padding: 0,
                        paddingTop: 3,
                      },
                    }}
                    title={
                      <>
                        {!!allowActiveToolToCompleted && (
                          <>
                            <Button
                              type="link"
                              size="small"
                              style={{ color: 'var(--primary-active-color)' }}
                              disabled={!allowActiveToolToCompleted}
                              onClick={() => {
                                activeTool.instance!.terminateShape()
                              }}
                            >
                              完成绘制
                            </Button>
                            <br />
                          </>
                        )}

                        <Button
                          type="link"
                          style={{ color: '#fff' }}
                          size="small"
                          onClick={() => {
                            activeTool.instance!.toCancel()
                          }}
                        >
                          取消绘制
                        </Button>
                      </>
                    }
                  >
                    <div className="map-diy-tools-item" onClick={item.onClick} title={item.title}>
                      {item.icon}
                      {item.showTipsClycle && <div className="map-diy-tools-item-tipsClycle" onClick={item.onClickTips}></div>}
                    </div>
                  </Tooltip>
                </div>
              ))}
            </div>
          </div>
        )}
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
      <Drawer
        title="剖面分析"
        placement={placement}
        onClose={() => {
          setOpen(false)
        }}
        mask={false}
        styles={{
          body: {
            padding: 16,
          },
        }}
        destroyOnHidden={true}
        open={open}
        extra={
          <>
            <Select
              value={placement}
              onChange={e => {
                setPlacement(e)
              }}
              options={[
                {
                  label: '上方',
                  value: 'top',
                },
                {
                  label: '下方',
                  value: 'bottom',
                },
                {
                  label: '左侧',
                  value: 'left',
                },
                {
                  label: '右侧',
                  value: 'right',
                },
              ]}
            ></Select>
          </>
        }
      >
        {profileAnalysisMetaData.map((item, index) => {
          return <ProfileAnalysisChart key={index} index={index} data={item.data} instance={item.instance} placement={placement} />
        })}
      </Drawer>
    </>
  )
})

export default CommonMap
