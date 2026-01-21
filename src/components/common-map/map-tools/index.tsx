


import React, { useState, useEffect, useMemo, useRef } from 'react'
import * as Cesium from 'cesium'
import { Button, Drawer, InputNumber, message, Popover, Select, Tooltip, Upload, type DrawerProps } from 'antd'
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
import D2Icon from '@/assets/svg/2d.svg?react'
import D3Icon from '@/assets/svg/3d.svg?react'


import DrawCountour from '@/utils/plugins/draw-multiple-shape-countour'
import MultipleShape, { Mutiple_SHAPE_OPTIONS_DEFAULT } from '@/utils/plugins/draw-multiple-shape'
import LineShape, { LINE_SHAPE_OPTIONS_DEFAULT } from '@/utils/plugins/draw-line-shape'
import MeasureDistance, { MEASURE_DISTANCE_OPTIONS_DEFAULT } from '@/utils/plugins/draw-measure-distance'
import ProfileAnalysis, { PROFILE_ANALYSIS_OPTIONS_DEFAULT, type pointMetaType } from '@/utils/plugins/draw-profile-analysis'
import type MultipleShapeCountour from '@/utils/plugins/draw-multiple-shape-countour'
import type { CommonMapPropsType, pick_tools_type, } from '..'
import { pick_tools_List } from '..'
import type { settingType } from '@/pages/build-map-setting/constance'
import GeoJsonLoader from '@/utils/plugins/geojson-loader'
import ProfileAnalysisChart from './profile-analysis-chart'
import { AimOutlined, DeleteOutlined, EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons'
import AIChatBox from '../ai-tool'
import { debounce } from 'lodash'
import GeoIcon from '@/assets/geo-icon.png'
import classNames from 'classnames'

type MapToolsPropsType = {
  model: CommonMapPropsType['model']
  defaultCameraFlyToParams: CommonMapPropsType['defaultCameraFlyToParams']
  viewer: Cesium.Viewer
  pickToolsList: CommonMapPropsType['pickToolsList']
}

type CommonToolsType = {
  key: pick_tools_type
  icon: React.ReactNode
  title: string
  onClick: () => void
  badge?: React.ReactNode
}

interface GeoJsonLoaderInstance {
  name: string;
  instance: GeoJsonLoader;
  direction: 'left' | 'right';
  opacity: number;
  show: boolean;
  origin: 'ai' | 'upload'
}

const MapTools: React.FC<MapToolsPropsType> = (props) => {

  const { model, defaultCameraFlyToParams, viewer, pickToolsList } = props

  const [openProfileAnalysisDrawer, setOpenProfileAnalysisDrawer] = useState<boolean>(false)

  const [profileAnalysisMetaData, setProfileAnalysisMetaData] = useState<{ data: pointMetaType[]; type: string; instance: ProfileAnalysis }[]>([])

  const [activeTool, setActiveTool] = useState<{
    type?: pick_tools_type
    instance?: MultipleShapeCountour | MultipleShape | LineShape | MeasureDistance | ProfileAnalysis
  }>({})

  const [allowActiveToolToCompleted, setAllowActiveToolToCompleted] = useState<boolean>(false)

  const [placement, setPlacement] = useState<DrawerProps['placement']>('bottom')

  const [, setMapWidget] = useState<settingType['mapWidget']>([])

  const [geojsonLoaderInstanceList, setGeojsonLoaderInstanceList] = useState<GeoJsonLoaderInstance[]>([])

  const [openGeojsonLoaderDrawer, setOpenGeojsonLoaderDrawer] = useState<boolean>(false)

  const [openAiPopver, setOpenAiPopver] = useState<boolean>(false)

  const splitCompareHandler = useRef<boolean>(false)

  const [is3d, setIs3d] = useState<boolean>(true)

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

  const MouseToolWithTips = (key: pick_tools_type, icon: React.ReactNode) => {

    return <Tooltip
      open={key === activeTool.type}
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

  async function executePromisesSequentially(
    data: string[],
    callback?: (name: string, entities: Cesium.Entity[]) => void
  ): Promise<void> {
    // 使用reduce创建Promise链
    await data.reduce(async (previousPromise: Promise<void>, item: string, index) => {
      // 等待上一个Promise完成
      await previousPromise;

      try {
        // 1. 执行fetch请求
        const response = await fetch(import.meta.env.PROD ? `/ali-geo/geo/geojson/${item}` : `/dev-geo/${item}`, {
          method: 'GET',
          mode: 'cors',
        });

        const file = item.split('/')[1]

        const fileName = handleFilename(file)

        if (!response.ok) {
          message.error(`${fileName}加载失败`);
          throw new Error(`Fetch failed for ${item}: ${response.statusText}`);
        }

        const jsonData = await response.json();

        // 2. 创建GeoJsonLoader实例
        const loader = new GeoJsonLoader(viewer);

        setOpenGeojsonLoaderDrawer(true)
        // 3. 更新状态（如果需要在React组件中使用）
        setGeojsonLoaderInstanceList((prev) => [
          ...prev,
          { name: fileName, instance: loader, direction: 'left', opacity: 0.8, show: true, origin: 'ai' },
        ]);

        // 4. 等待render完成
        const entities = await loader.render(jsonData);
        viewer.flyTo(entities, {
          duration: 0.5
        })
        message.success(`${fileName}加载成功`);
        callback && callback(item, entities)

      } catch (error) {
        // fetch失败或render失败时，直接继续下一个，这里可以添加错误处理
        console.error(`Error processing ${item}:`, error);
        // 不throw，让链继续执行
      }
    }, Promise.resolve()); // 初始Promise
  }

  const handleFilename = (filename: string) => {
    return filename.replace('.geojson', '') || '未命名geojson';
  }

  const handleSetGeojson = (data: string[]) => {
    executePromisesSequentially(data, (name) => {
      console.log(name)
    })
  }

  const getToolTitle = (key: pick_tools_type) => {
    return pick_tools_List.find(item => item.key === key)?.title || ''
  }

  const commonTools: CommonToolsType[] = [
    {
      icon: <ZoomToHomeIcon></ZoomToHomeIcon>,
      key: 'default_perspective',
      title: getToolTitle('default_perspective'),
      onClick: () => {
        if (model !== 'build') {
          return
        }
        defaultCameraFlyTo()
      },
    },
    {
      icon: <ZoomInIcon></ZoomInIcon>,
      key: 'zoom_in',
      title: getToolTitle('zoom_in'),
      onClick: () => {
        if (model !== 'build') {
          return
        }
        viewer!.camera.zoomIn(100000)
      },
    },
    {
      icon: <ZoomOutIcon></ZoomOutIcon>,
      key: 'zoom_out',
      title: getToolTitle('zoom_out'),
      onClick: () => {
        if (model !== 'build') {
          return
        }
        viewer!.camera.zoomOut(100000)
      },
    },
    {
      icon: is3d ? <D3Icon></D3Icon> : <D2Icon></D2Icon>,
      key: 'dimension',
      title: getToolTitle('dimension'),
      onClick: () => {
        if (model !== 'build') {
          return
        }

        if (is3d) {
          setIs3d(false)
          viewer.scene.morphToColumbusView(1);
          return
        }
        setIs3d(true)
        viewer.scene.morphTo3D(1);
      }
    },
    {
      icon: <Popover
        trigger="click"
        open={openAiPopver}
        onOpenChange={(show, e) => {
          if (model !== 'build') {
            setOpenAiPopver(false)
            return
          }
          setOpenAiPopver(show)
        }}
        content={
          <AIChatBox handleSetGeojson={handleSetGeojson} handlePopoverOpen={(show) => {
            setOpenAiPopver(show)
          }} />
        }
        placement="top">
        <AiIcon></AiIcon>
      </Popover>,
      key: 'AI',
      title: getToolTitle('AI'),
      onClick: () => {
        if (model !== 'build') {
          return
        }
      },
    },
    {
      badge: !!geojsonLoaderInstanceList.length && <div title={geojsonLoaderInstanceList.length + ''} className={classNames("map-diy-tools-item-badge", {
        "map-diy-tools-item-badge-more": geojsonLoaderInstanceList.length > 99
      })} onClick={(e) => {
        e.stopPropagation()
        setOpenGeojsonLoaderDrawer(true)
      }}>
        {geojsonLoaderInstanceList.length}
      </div>,
      icon: <>
        <Upload action={'#'} disabled={model !== 'build'} customRequest={() => { }} maxCount={1} multiple={false} rootClassName='map-upload-tool-wrapper'
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

            const reader = new FileReader()

            reader.onload = (e) => {

              const geojson = JSON.parse(e.target?.result as string)

              const loader = new GeoJsonLoader(viewer!)

              loader.render(geojson).then((entities) => {
                viewer.flyTo(entities, {
                  duration: 2
                })
              })

              setOpenGeojsonLoaderDrawer(true)
              setGeojsonLoaderInstanceList([{ name: handleFilename(file.name), instance: loader, direction: 'left', opacity: 0.8, show: true, origin: 'upload' }, ...geojsonLoaderInstanceList])
            }

            reader.readAsText(file.originFileObj as Blob)
          }}
        >
          <UploadFileIcon></UploadFileIcon>
        </Upload></>,
      key: 'upload_file',
      title: getToolTitle('upload_file'),
      onClick: () => {
        if (model !== 'build') {
          return
        }
      },
    },
  ]

  const useMouseTools: CommonToolsType[] = [
    {
      icon: MouseToolWithTips('area_contour', <DrawAreaCountourIcon />),
      title: getToolTitle('area_contour'),
      key: 'area_contour',
      onClick: () => {
        if (model !== 'build') {
          return
        }

        if (!!activeTool.type) {
          message.warning('当前正在使用' + getToolTitle('area_contour') + '，请先结束当前工具')
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

        setActiveTool({ type: 'area_contour', instance: drawer })
      },
    },
    {
      icon: MouseToolWithTips('draw_polygon', <DrawMultipleShapeIcon />),
      key: 'draw_polygon',
      title: getToolTitle('draw_polygon'),
      onClick: () => {
        if (model !== 'build') {
          return
        }

        if (!!activeTool.type) {
          message.warning('当前正在使用' + getToolTitle('area_contour') + '，请先结束当前工具')
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

        setActiveTool({ type: 'draw_polygon', instance: drawer })
      },
    },
    {
      icon: MouseToolWithTips('draw_line', <DrawLineShapeIcon />),
      key: 'draw_line',
      title: getToolTitle('draw_line'),
      onClick: () => {
        if (model !== 'build') {
          return
        }

        if (!!activeTool.type) {
          message.warning('当前正在使用' + getToolTitle('draw_line') + '，请先结束当前工具')
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

        setActiveTool({ type: 'draw_line', instance: drawer })
      },
    },
    {
      icon: MouseToolWithTips('measure_distance', <DrawMeasureDistanceIcon />),
      key: 'measure_distance',
      title: getToolTitle('measure_distance'),
      onClick: () => {
        if (model !== 'build') {
          return
        }

        if (!!activeTool.type) {
          message.warning('当前正在使用' + getToolTitle('measure_distance') + '，请先结束当前工具')
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

        setActiveTool({ type: 'measure_distance', instance: drawer })
      },
    },
    {
      badge: !!profileAnalysisMetaData.length && <div title={profileAnalysisMetaData.length + ''} className={classNames("map-diy-tools-item-badge", {
        "map-diy-tools-item-badge-more": profileAnalysisMetaData.length > 99
      })} onClick={(e) => {
        e.stopPropagation()
        setOpenProfileAnalysisDrawer(true)
      }}>
        {profileAnalysisMetaData.length}
      </div>,
      icon: MouseToolWithTips('profile_analysis', <DrawProfileAnalysisIcon />),
      title: getToolTitle('profile_analysis'),
      key: 'profile_analysis',
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

        setActiveTool({ type: 'profile_analysis', instance: drawer })
      },
    },
  ]

  const finalTools = useMemo(() => {
    return [...commonTools, ...useMouseTools].filter(item => pickToolsList?.includes(item.key))
  }, [pickToolsList, openAiPopver, is3d, activeTool, allowActiveToolToCompleted, geojsonLoaderInstanceList, profileAnalysisMetaData,])

  useEffect(() => {
    /*     const slider = document.getElementById('slider')
    
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
        } */
  }, [])

  return <>
    {
      <div id="slider" style={{ display: 'none' }}></div>
    }
    <div className="map-diy-tools-container">
      <div className="map-diy-tools-container-wrapper">
        {finalTools.map(item => (
          <div className="map-diy-tools-item-wrapper" key={item.title} >
            <div className="map-diy-tools-item" onClick={item.onClick} title={item.title} style={{ borderColor: item.title === 'AI工具' ? "#00ffff" : undefined }}>
              {item.icon}
              {item.badge}
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
      title="矢量数据"
      placement={'right'}
      onClose={() => {
        setOpenGeojsonLoaderDrawer(false)
      }}
      mask={false}
      styles={{
        body: {
          padding: 16,
        },
      }}
      open={openGeojsonLoaderDrawer}
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
                <div className='upload-geojson-item-name' >
                  <div className='upload-geojson-item-type' title={item.origin === 'ai' ? 'AI生成' : '上传'}>
                    {
                      item.origin === 'ai' ? (
                        <img src={GeoIcon} style={{ width: 26, height: 26, borderRadius: '50%' }} alt="" />
                      ) : (
                        <UploadFileIcon width={20} height={20}></UploadFileIcon>
                      )
                    }
                  </div>
                  <div className='upload-geojson-item-text ellipsis-1' title={item.name}> {item.name}</div>
                </div>
                <div className='upload-geojson-item-action'>
                  <AimOutlined title='快速定位' onClick={() => {
                    viewer.flyTo(item.instance.allEntities, {
                      duration: 1
                    })
                  }} />
                  {
                    item.show ? (
                      <EyeInvisibleOutlined title='隐藏' onClick={() => {
                        setGeojsonLoaderInstanceList(geojsonLoaderInstanceList.map((v, i) => {
                          if (i === index) {
                            v.show = !v.show
                          }
                          return v
                        }))
                        item.instance.toggleVisibility()
                      }} />
                    ) : (
                      <EyeOutlined title='展示' onClick={() => {
                        setGeojsonLoaderInstanceList(geojsonLoaderInstanceList.map((v, i) => {
                          if (i === index) {
                            v.show = !v.show
                          }
                          return v
                        }))
                        item.instance.toggleVisibility()
                      }} />
                    )
                  }
                  <DeleteOutlined
                    title='删除'
                    style={{
                      color: '#d61717'
                    }} onClick={() => {
                      setGeojsonLoaderInstanceList(geojsonLoaderInstanceList.filter((v, i) => i !== index))
                      item.instance.clear()
                    }} />
                </div>

              </div>
              <div className='upload-geojson-item-content'>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                  <span>透明度</span>&nbsp;&nbsp;
                  <InputNumber
                    style={{
                      width: 100
                    }}
                    max={1}
                    min={0}
                    step={0.1}
                    value={item.opacity}
                    onChange={debounce((value) => {
                      setGeojsonLoaderInstanceList(geojsonLoaderInstanceList.map((v, i) => {
                        if (i === index) {
                          v.opacity = value!
                        }
                        return v
                      }))

                      item.instance.updateEntitiesOpacity(value!)

                    }, 1000)}
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