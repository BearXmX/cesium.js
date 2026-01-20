


import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import * as Cesium from 'cesium'
import { Button, Drawer, Dropdown, InputNumber, message, Popover, Radio, Select, Slider, Switch, Tooltip, Upload, type DrawerProps } from 'antd'
import DrawAreaCountourIcon from '@/assets/svg/draw-area-countour-icon.svg?react'
import DrawMultipleShapeIcon from '@/assets/svg/draw-multiple-shape-icon.svg?react'
import DrawLineShapeIcon from '@/assets/svg/draw-line-shape-icon.svg?react'
import DrawMeasureDistanceIcon from '@/assets/svg/draw-measure-distance-icon.svg?react'
import DrawProfileAnalysisIcon from '@/assets/svg/draw-profile-analysis-icon.svg?react'
import ZoomInIcon from '@/assets/svg/zoom-in-icon.svg?react'
import ZoomOutIcon from '@/assets/svg/zoom-out-icon.svg?react'
import ZoomToHomeIcon from '@/assets/svg/zoom-to-home.svg?react'
import UploadFileIcon from '@/assets/svg/upload-icon.svg?react'
import AiIcon from '@/assets/svg/ai-icon.svg?react'

import DrawCountour from '@/utils/plugins/draw-multiple-shape-countour'
import MultipleShape, { Mutiple_SHAPE_OPTIONS_DEFAULT } from '@/utils/plugins/draw-multiple-shape'
import LineShape, { LINE_SHAPE_OPTIONS_DEFAULT } from '@/utils/plugins/draw-line-shape'
import MeasureDistance, { MEASURE_DISTANCE_OPTIONS_DEFAULT } from '@/utils/plugins/draw-measure-distance'
import ProfileAnalysis, { PROFILE_ANALYSIS_OPTIONS_DEFAULT, type pointMetaType } from '@/utils/plugins/draw-profile-analysis'
import type MultipleShapeCountour from '@/utils/plugins/draw-multiple-shape-countour'
import type { CommonMapPropsType } from '..'
import type { settingType } from '@/pages/build-map-setting/constance'
import GeoJsonLoader from '@/utils/plugins/geojson-loader'
import ProfileAnalysisChart from './profile-analysis-chart'
import { EllipsisOutlined } from '@ant-design/icons'
import AIChatBox from '../ai-tool'

type MapToolsPropsType = {
  model: CommonMapPropsType['model']
  defaultCameraFlyToParams: CommonMapPropsType['defaultCameraFlyToParams']
  viewer: Cesium.Viewer
  pickToolsList: CommonMapPropsType['pickToolsList']
}

type CommonToolsType = {
  icon: React.ReactNode
  title: string
  onClick: () => void
  showTipsClycle?: Boolean
  onClickTips?: (e: React.MouseEvent<HTMLDivElement>) => void
}

const MapTools: React.FC<MapToolsPropsType> = (props) => {

  const { model, defaultCameraFlyToParams, viewer, pickToolsList } = props

  const [openProfileAnalysisDrawer, setOpenProfileAnalysisDrawer] = useState<boolean>(false)

  const [profileAnalysisMetaData, setProfileAnalysisMetaData] = useState<{ data: pointMetaType[]; type: string; instance: ProfileAnalysis }[]>([])

  const [activeTool, setActiveTool] = useState<{
    type?: string
    instance?: MultipleShapeCountour | MultipleShape | LineShape | MeasureDistance | ProfileAnalysis
  }>({})

  const [allowActiveToolToCompleted, setAllowActiveToolToCompleted] = useState<boolean>(false)

  const [placement, setPlacement] = useState<DrawerProps['placement']>('bottom')

  const [, setMapWidget] = useState<settingType['mapWidget']>([])

  const [geojsonLoaderInstanceList, setGeojsonLoaderInstanceList] = useState<{ name: string; direction: 'left' | 'right'; opacity: number, instance: GeoJsonLoader }[]>([])

  const [openGeojsonLoaderDrawer, setOpenGeojsonLoaderDrawer] = useState<boolean>(false)

  const [openSplitCompare, setOpenSplitCompare] = useState<boolean>(false)

  const splitCompareHandler = useRef<boolean>(false)

  const defaultCameraFlyTo = () => {
    if (defaultCameraFlyToParams?.destination) {
      const destination = defaultCameraFlyToParams.destination
      console.log(viewer)
      viewer!.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(destination.longitude, destination.latitude, destination.height),
        orientation: defaultCameraFlyToParams.orientation,
        duration: 2,
      })
    }
  }

  /* const coffeeBeltRectangle = Cesium.Rectangle.fromDegrees(
    120.0,
    21.744441967016826,
    122.0,
    25.457622543131478,
  );
  
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(
      120.90960542899757,
      23.73598606130257,
      55000,
    ),
  }); */

  const MouseToolWithTips = (title: string, icon: React.ReactNode) => {

    return <Tooltip
      open={title === activeTool.type}
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
                onClick={(e) => {
                  e.stopPropagation()
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
            onClick={(e) => {
              e.stopPropagation()
              activeTool.instance!.toCancel()
            }}
          >
            取消绘制
          </Button>
        </>
      }
    >
      {icon}
    </Tooltip>
  }

  const handleSetGeojson = (data: string[]) => {
    data.forEach(item => {
      fetch(`/api/${item}`).then(res => res.json()).then(data => {

        const loader = new GeoJsonLoader(viewer!)

        setGeojsonLoaderInstanceList((prev) => {
          return [
            ...prev,
            { name: item, instance: loader, direction: 'left', opacity: 0.8 },
          ]
        })

        loader.render(data).then(entities => {

        })
      })
    })
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
        viewer!.camera.zoomIn(100000)
      },
    },
    {
      icon: <ZoomOutIcon></ZoomOutIcon>,
      title: '视角缩小',
      onClick: () => {
        if (model !== 'build') {
          return
        }
        viewer!.camera.zoomOut(100000)
      },
    },
    {
      icon: <Popover
        content={<AIChatBox viewer={viewer} handleSetGeojson={handleSetGeojson} />}
        trigger="click"
        placement="top">
        <AiIcon></AiIcon>
      </Popover>,
      title: 'AI工具',
      onClick: () => {
        if (model !== 'build') {
          return
        }
      },
    },
    {
      icon: <>
        <Upload action={'#'} customRequest={() => { }} maxCount={1} multiple={false} rootClassName='map-upload-tool-wrapper'
          beforeUpload={(file) => {
            if (model !== 'build') {
              return Promise.reject()
            }

            if (!viewer) {
              message.warning('地图资源未就绪')
              return
            }

            if (file.name.endsWith('.geojson')) {
              return Promise.resolve()
            }

            message.warning('请上传geojson格式文件')

            return Promise.reject()
          }}
          showUploadList={false}
          defaultFileList={[]}
          onChange={(info) => {
            const file = info.file

            message.success(`正在读取${file.name}`)

            setPlacement('right')
            const reader = new FileReader()

            reader.onload = (e) => {

              const geojson = JSON.parse(e.target?.result as string)

              const loader = new GeoJsonLoader(viewer!)

              loader.render(geojson).then((entities) => {
                viewer.flyTo(entities, {
                  duration: 2
                })
              })

              setGeojsonLoaderInstanceList([{ name: file.name.replace('.geojson', '') || '未命名geojson', instance: loader, direction: 'left', opacity: 0.8 }, ...geojsonLoaderInstanceList])
            }

            reader.readAsText(file.originFileObj as Blob)
          }}
        >
          <UploadFileIcon></UploadFileIcon>
        </Upload></>,
      showTipsClycle: !!geojsonLoaderInstanceList.length,
      onClickTips: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.stopPropagation()
        setOpenGeojsonLoaderDrawer(true)
      },
      title: '上传文件',
      onClick: () => {
        if (model !== 'build') {
          return
        }
      },
    },
  ]

  const useMouseTools = [
    {
      icon: MouseToolWithTips('区域等高线', <DrawAreaCountourIcon />),
      title: '区域等高线',
      onClick: () => {
        if (model !== 'build') {
          return
        }

        if (!!activeTool.type) {
          message.warning('当前正在使用' + activeTool.type + '，请先结束当前工具')
          return
        }

        const drawer = new DrawCountour(viewer!, {
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
      icon: MouseToolWithTips('绘制多边形', <DrawMultipleShapeIcon />),
      title: '绘制多边形',
      onClick: () => {
        if (model !== 'build') {
          return
        }

        if (!!activeTool.type) {
          message.warning('当前正在使用' + activeTool.type + '，请先结束当前工具')
          return
        }

        const drawer = new MultipleShape(viewer!, {
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
      icon: MouseToolWithTips('绘制线段', <DrawLineShapeIcon />),
      title: '绘制线段',
      onClick: () => {
        if (model !== 'build') {
          return
        }

        if (!!activeTool.type) {
          message.warning('当前正在使用' + activeTool.type + '，请先结束当前工具')
          return
        }

        const drawer = new LineShape(viewer!, {
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
      icon: MouseToolWithTips('测距工具', <DrawMeasureDistanceIcon />),
      title: '测距工具',
      onClick: () => {
        if (model !== 'build') {
          return
        }

        if (!!activeTool.type) {
          message.warning('当前正在使用' + activeTool.type + '，请先结束当前工具')
          return
        }

        const drawer = new MeasureDistance(viewer!, {
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
      icon: MouseToolWithTips('剖面分析', <DrawProfileAnalysisIcon />),
      title: '剖面分析',
      showTipsClycle: !!profileAnalysisMetaData.length,
      onClickTips: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.stopPropagation()
        setOpenProfileAnalysisDrawer(true)
      },
      onClick: () => {
        if (model !== 'build') {
          return
        }

        if (!!activeTool.type) {
          message.warning('当前正在使用' + activeTool.type + '，请先结束当前工具')
          return
        }

        const drawer = new ProfileAnalysis(viewer!, {
          onLoadData: (data: pointMetaType[]) => {
            setPlacement('bottom')
            setOpenProfileAnalysisDrawer(true)
            setProfileAnalysisMetaData([{ data: data, instance: drawer, type: '剖面分析' }, ...profileAnalysisMetaData])
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

  const finalTools = useMemo(() => {
    return [...commonTools, ...useMouseTools].filter(item => pickToolsList?.includes(item.title))
  }, [pickToolsList, activeTool, allowActiveToolToCompleted, geojsonLoaderInstanceList, profileAnalysisMetaData,])

  useEffect(() => {
    const slider = document.getElementById('slider')

    viewer!.scene.splitPosition = 0.5 // 默认中间分割

    const mousedown = () => (splitCompareHandler.current = true)
    const mouseup = () => (splitCompareHandler.current = false)

    const mousemove = (e: MouseEvent) => {
      if (!splitCompareHandler.current) return
      const splitPos = e.clientX / window.innerWidth
      slider!.style.left = splitPos * 100 + '%'
      viewer!.scene.splitPosition = splitPos
    }

    slider!.addEventListener('mousedown', mousedown)
    window.addEventListener('mouseup', mouseup)
    window.addEventListener('mousemove', mousemove)

    return () => {
      slider!.removeEventListener('mousedown', mousedown)
      window.removeEventListener('mouseup', mouseup)
      window.removeEventListener('mousemove', mousemove)
    }
  }, [])

  return <>
    {
      <div id="slider" style={{ display: openSplitCompare ? 'block' : 'none' }}></div>
    }
    <div className="map-diy-tools-container">
      <div className="map-diy-tools-container-wrapper">
        {finalTools.map(item => (
          <div className="map-diy-tools-item-wrapper" key={item.title} >
            <div className="map-diy-tools-item" onClick={item.onClick} title={item.title} style={{ borderColor: item.title === 'AI工具' ? "#00ffff" : undefined }}>
              {item.icon}
              {item.showTipsClycle && <div className="map-diy-tools-item-tipsClycle" onClick={item.onClickTips}></div>}
            </div>
          </div>
        ))}
      </div>
    </div>
    <Drawer
      getContainer={false}
      title="剖面分析"
      placement={placement}
      onClose={() => {
        setOpenProfileAnalysisDrawer(false)
      }}
      mask={false}
      styles={{
        body: {
          padding: 16,
        },
      }}
      destroyOnHidden={true}
      open={openProfileAnalysisDrawer}
      extra={
        <>
          <Select
            value={placement}
            onChange={e => {
              setPlacement(e)
            }}
            options={[
              {
                label: '上',
                value: 'top',
              },
              {
                label: '下',
                value: 'bottom',
              },
              {
                label: '左',
                value: 'left',
              },
              {
                label: '右',
                value: 'right',
              },
            ]}
          ></Select>
        </>
      }
    >
      {profileAnalysisMetaData.map((item, index) => {
        return <ProfileAnalysisChart profileAnalysisMetaData={profileAnalysisMetaData} key={index} index={index} data={item.data} instance={item.instance} placement={placement} />
      })}
    </Drawer>

    <Drawer
      getContainer={false}
      className='map-upload-tool-drawer'
      title="geojson"
      placement={placement}
      onClose={() => {
        setOpenGeojsonLoaderDrawer(false)
      }}
      mask={false}
      styles={{
        body: {
          padding: 16,
        },
      }}
      destroyOnHidden={true}
      open={openGeojsonLoaderDrawer}
      extra={
        <>
          <Select
            value={placement}
            onChange={e => {
              setPlacement(e)
            }}
            options={[
              {
                label: '上',
                value: 'top',
              },
              {
                label: '下',
                value: 'bottom',
              },
              {
                label: '左',
                value: 'left',
              },
              {
                label: '右',
                value: 'right',
              },
            ]}
          ></Select>
        </>
      }
    >
      {/*       <div style={{ display: 'flex', marginBottom: 16, maxWidth: 400 }}>
        <span>卷帘对比</span>&nbsp;&nbsp;
        <Switch checked={openSplitCompare} onChange={(checked) => {
          setOpenSplitCompare(checked)

          if (!checked) {
            setGeojsonLoaderInstanceList(prev => (
              prev.map(item => ({
                ...item,
                direction: 'left'
              }))
            ))
          }

        }} />
      </div> */}
      <div className='upload-geojson-list-container'>
        {
          geojsonLoaderInstanceList.map((item, index) => {
            return <div className='upload-geojson-item' key={index}>
              <div className='upload-geojson-item-header'>
                <div className='upload-geojson-item-name ellipsis-1'>{item.name}</div>
                <div className='upload-geojson-item-action'>
                  <Dropdown trigger={['click']} menu={{
                    items: [
                      {
                        key: '1',
                        label: <Button type='text' onClick={() => {
                          item.instance.toggleVisibility()
                        }}>展示/隐藏</Button>,
                      },
                      {
                        key: '2',
                        label: <Button danger type='text' onClick={() => {
                          setGeojsonLoaderInstanceList(geojsonLoaderInstanceList.filter((v, i) => i !== index))
                          item.instance.clear()
                        }}>删除</Button>,
                      },
                    ]
                  }} placement="bottomRight">
                    <EllipsisOutlined />
                  </Dropdown>
                </div>
              </div>
              <div className='upload-geojson-item-content'>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                  {/*                   <span>渲染方向</span>&nbsp;&nbsp;
                  <Radio.Group
                    disabled={!openSplitCompare}
                    value={item.direction}
                    onChange={(e) => {
                      setGeojsonLoaderInstanceList(geojsonLoaderInstanceList.map((v, i) => {
                        if (i === index) {
                          v.direction = e.target.value
                        }
                        return v
                      }))

                      item.instance.toggleEntitiesSplitDirection(e.target.value)
                    }}
                    options={[
                      {
                        label: '左',
                        value: 'left',
                      },
                      {
                        label: '右',
                        value: 'right',
                      }
                    ]}
                  /> */}
                  <span>透明度</span>&nbsp;&nbsp;
                  <InputNumber
                    style={{
                      width: 100
                    }}
                    max={1}
                    min={0}
                    step={0.1}
                    value={item.opacity}
                    onChange={(value) => {
                      setGeojsonLoaderInstanceList(geojsonLoaderInstanceList.map((v, i) => {
                        if (i === index) {
                          v.opacity = value!
                        }
                        return v
                      }))

                      item.instance.updateEntitiesOpacity(value!)

                    }}
                  />
                </div>
              </div>
            </div>
          })
        }
      </div>
    </Drawer>
  </>

}

export default MapTools