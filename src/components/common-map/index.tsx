import { Button, Drawer, message, Select, Spin, Tooltip, type DrawerProps } from 'antd'
import * as Cesium from 'cesium'
import React, { useEffect, useImperativeHandle, useState } from 'react'
import { useRef } from 'react'
import DrawAreaCountourIcon from '@/assets/draw-area-countour-icon.svg'
import DrawMultipleShapeIcon from '@/assets/draw-multiple-shape-icon.svg'
import DrawLineShapeIcon from '@/assets/draw-line-shape-icon.svg'
import DrawMeasureDistanceIcon from '@/assets/draw-measure-distance-icon.svg'
import DrawProfileAnalysisIcon from '@/assets/draw-profile-analysis-icon.svg'

import DrawCountour from '@/utils/countour'
import MultipleShape from '@/utils/plugins/draw-multiple-shape'
import LineShape from '@/utils/plugins/draw-line-shape'
import MeasureDistance from '@/utils/plugins/draw-measure-distance'
import ProfileAnalysis, { type pointMetaType } from '@/utils/plugins/draw-profile-analysis'
import ProfileAnalysisChart from './profile-analysis-chart'
import './index.css'
import type DiyMultipleShapeCountour from '@/utils/countour/diy-multiple-shape-countour'

export type CommonMapPropsType = {
  /** @description 地形加载完的回调 */
  terrainInitCallback?: () => void
  containerStyle?: React.CSSProperties
}

export type CommonMapInstanceType = {
  getViewer: () => Cesium.Viewer
}

const CommonMap = React.forwardRef<CommonMapInstanceType, CommonMapPropsType>((props, instance) => {
  const { terrainInitCallback } = props

  const [loading, setLoading] = useState<boolean>(true)

  const containerRef = useRef<HTMLDivElement>(null)

  const viewerRef = useRef<Cesium.Viewer | null>(null)

  const [open, setOpen] = useState<boolean>(false)

  const [profileAnalysisMetaData, setProfileAnalysisMetaData] = useState<{ data: pointMetaType[]; type: string; instance: ProfileAnalysis }[]>([])

  const [activeTool, setActiveTool] = useState<{ type?: string; instance?: DiyMultipleShapeCountour | MultipleShape | LineShape | MeasureDistance | ProfileAnalysis }>({})

  const [placement, setPlacement] = useState<DrawerProps['placement']>('bottom');

  useImperativeHandle(instance, () => {
    return {
      getViewer() {
        return viewerRef.current!
      },
    }
  })

  /** @description 获取当前相机参数 */
  const getCameraParams = async (viewerRef: React.RefObject<Cesium.Viewer | null>) => {
    const camera = viewerRef.current!.camera

    // 获取相机位置（笛卡尔坐标）
    const position = camera.position

    // 获取方向参数
    const heading = camera.heading
    const pitch = camera.pitch
    const roll = camera.roll

    // 转换为经纬度
    const cartographic = Cesium.Cartographic.fromCartesian(position)
    const lon = Cesium.Math.toDegrees(cartographic.longitude)
    const lat = Cesium.Math.toDegrees(cartographic.latitude)
    const height = cartographic.height

    // 生成flyTo代码
    const code = `viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(${lon.toFixed(8)}, ${lat.toFixed(8)}, ${height.toFixed(2)}),
        orientation: {
            heading: ${heading},
            pitch: ${pitch},
            roll: ${roll}
        }
    });`

    console.log(code)

    return code
  }

  const initClickHandler = (viewer: Cesium.Viewer) => {
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)

    handler.setInputAction(async (movement: { position: Cesium.Cartesian2 }) => {
      // 拾取椭球面上的点
      const cartesian = viewer.camera.pickEllipsoid(movement.position, viewer.scene.globe.ellipsoid)
      if (!cartesian) return

      const terrainCartos = await Cesium.sampleTerrainMostDetailed(viewer!.terrainProvider, [Cesium.Cartographic.fromCartesian(cartesian)])

      const cartographic = terrainCartos[0]

      const lon = Cesium.Math.toDegrees(cartographic.longitude)
      const lat = Cesium.Math.toDegrees(cartographic.latitude)
      const height = cartographic.height

      // 获取当前相机大致层级
      const zoom = Math.round(Math.log2((2 * Math.PI * 6378137) / viewer.camera.getMagnitude()))

      // 经纬度 → XYZ 瓦片坐标
      const x = Math.floor(((lon + 180) / 360) * Math.pow(2, zoom))
      const y = Math.floor(((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) * Math.pow(2, zoom))

      console.log(`lon=${lon}, lat=${lat}, height=${height} zoom=${zoom}, x=${x}, y=${y}`)

      getCameraParams(viewerRef)
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
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
      })
      .finally(() => {
        setLoading(false)
      })

    initClickHandler(viewer)
  }

  useEffect(() => {
    init()

    return () => {
      viewerRef.current!.destroy()
    }
  }, [])

  const tools = [
    {
      icon: DrawAreaCountourIcon,
      title: '区域等高线',
      onClick: () => {

        if (!!activeTool.type) {
          message.warning('当前正在绘制')
          return
        }
        const drawer = DrawCountour.drawDiyShapeCountour(viewerRef.current!, {
          onCompleted() {
            setActiveTool({})
          },
          onEnd() {
            setActiveTool({})
          },
        })

        setActiveTool({ type: '区域等高线', instance: drawer })
      },
    },
    {
      icon: DrawMultipleShapeIcon,
      title: '绘制多边形',
      onClick: () => {

        if (!!activeTool.type) {
          message.warning('当前正在绘制')
          return
        }

        const drawer = new MultipleShape(viewerRef.current!, {
          onCompleted() {
            setActiveTool({})
          },
          onEnd() {
            setActiveTool({})
          },
        })

        setActiveTool({ type: '绘制多边形', instance: drawer })
      },
    },
    {
      icon: DrawLineShapeIcon,
      title: '绘制线段',
      onClick: () => {

        if (!!activeTool.type) {
          message.warning('当前正在绘制')
          return
        }
        const drawer = new LineShape(viewerRef.current!, {
          onCompleted() {
            setActiveTool({})
          },
          onEnd() {
            setActiveTool({})
          },
        })


        setActiveTool({ type: '绘制线段', instance: drawer })
      },
    },
    {
      icon: DrawMeasureDistanceIcon,
      title: '测距工具',
      onClick: () => {
        if (!!activeTool.type) {
          message.warning('当前正在绘制')
          return
        }

        const drawer = new MeasureDistance(viewerRef.current!, {
          onCompleted() {
            setActiveTool({})
          },
          onEnd() {
            setActiveTool({})
          },
        })

        setActiveTool({ type: '测距工具', instance: drawer })
      },
    },
    {
      icon: DrawProfileAnalysisIcon,
      title: '剖面分析',
      showTipsClycle: !!profileAnalysisMetaData.length,
      onClickTips: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.stopPropagation()
        setOpen(true)
      },
      onClick: () => {
        if (!!activeTool.type) {
          message.warning('当前正在绘制')
          return
        }
        const drawer = new ProfileAnalysis(viewerRef.current!, {
          onLoadData: (data: pointMetaType[]) => {
            setOpen(true)
            setProfileAnalysisMetaData([...profileAnalysisMetaData, { data: data, instance: drawer, type: '剖面分析' }])
          },
          onCompleted() {
            setActiveTool({})
          },
          onEnd() {
            setActiveTool({})
          },
        })

        setActiveTool({ type: '剖面分析', instance: drawer })
      },
    },
  ]

  return (
    <>
      {loading && (
        <div
          className="canvas-container-loading"
          style={{
            position: 'fixed',
            width: '100vw',
            height: '100vh',
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
      <div className="canvas-container" style={props.containerStyle}>
        <div className="canvas-container-body" ref={containerRef} />
      </div>
      <div className="map-diy-tools-container">
        {tools.map(item => (
          <div className="map-diy-tools-item-wrapper" key={item.title}>
            <Tooltip open={item.title === activeTool.type} title={<Button type='link' style={{ color: '#fff' }} size='small' onClick={() => {
              activeTool.instance!.toEnd()
            }}>结束绘制</Button>}>
              <div className="map-diy-tools-item" onClick={item.onClick} title={item.title}>
                <img src={item.icon} alt="" />
                {
                  item.showTipsClycle && (
                    <div className="map-diy-tools-item-tipsClycle" onClick={item.onClickTips}></div>
                  )
                }
              </div>
            </Tooltip>
          </div>

        ))}
      </div>
      <Drawer
        title='剖面分析'
        placement={placement}
        onClose={() => {
          setOpen(false)
        }}
        mask={false}
        styles={{
          body: {
            padding: 16
          }
        }}
        destroyOnHidden={true}
        open={open}
        extra={
          <>
            <Select value={placement} onChange={(e) => {
              setPlacement(e)
            }} options={[
              {
                label: '上方',
                value: 'top'
              },
              {
                label: '下方',
                value: 'bottom'
              },
              {
                label: '左侧',
                value: 'left'
              },
              {
                label: '右侧',
                value: 'right'
              },
            ]}></Select>
          </>
        }
      >
        {
          profileAnalysisMetaData.map((item, index) => {
            return (
              <ProfileAnalysisChart
                key={index}
                index={index}
                data={item.data}
                instance={item.instance}
                placement={placement}
              />
            )
          })
        }

      </Drawer>
    </>
  )
})

export default CommonMap
