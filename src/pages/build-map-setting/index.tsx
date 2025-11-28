import * as Cesium from "cesium";
import React, { useState, useEffect, useRef } from 'react'
import { Button, Modal, notification, Space } from 'antd'
import CommonMap, { type cameraFlyParamsType, type CommonMapInstanceType, type CommonMapPropsType } from '@/components/common-map'
import * as gui from 'lil-gui'
import classNames from "classnames";
import { DatabaseOutlined, EyeOutlined, GlobalOutlined, } from "@ant-design/icons";
import type { lineWidget, settingType } from "./constance";
import './index.less'
import { InitialViewSettingComponent, InitialViewToolComponent, } from "./initial-view";
import { MapWidgetSettingComponent, MapWidgetToolComponent } from "./map-widget";
import { useNavigate } from 'react-router-dom'
import { PageMetadataSettingComponent, PageMetadataToolComponent } from "./page-metaData";
import LineShape from "@/utils/plugins/draw-line-shape";

type BuildMapSettingPropsType = {

}

export const transfromDestination = (destination: settingType['initialView'][0]['destination']) => {
  return Cesium.Cartesian3.fromDegrees(destination.longitude, destination.latitude, destination.height)
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

const BuildMapSetting: React.FC<BuildMapSettingPropsType> = (props) => {

  const { } = props

  const navigate = useNavigate()

  const mapInstance = useRef<CommonMapInstanceType>(null);

  const [modal, modalContext] = Modal.useModal();

  const [notificationApi, notificationContextHolder] = notification.useNotification()

  const viewerRef = useRef<Cesium.Viewer | null>(null);

  const guiRef = useRef<gui.GUI | null>(null);

  const [model, setModel] = useState<CommonMapPropsType['model']>('build-edit')

  const [pickToolsList, setPickToolsList] = useState<CommonMapPropsType['pickToolsList']>([])

  const [activeTool, setActiveTool] = useState<'mapMetadata' | 'initialView' | 'mapWidget' | null>('mapMetadata')

  const [setting, setSetting] = useState<settingType>(setting_default)

  const metaData = [
    {
      title: '页面元数据',
      icon: <DatabaseOutlined />,
      key: 'mapMetadata',
      onClick: () => {
        setActiveTool('mapMetadata')
      },
      toolComponent: <PageMetadataToolComponent setSetting={setSetting} setting={setting} mapInstance={mapInstance}></PageMetadataToolComponent>,
      settingComponent: <PageMetadataSettingComponent setSetting={setSetting} setting={setting} mapInstance={mapInstance}></PageMetadataSettingComponent>
    },
    {
      title: '初始视角',
      icon: <EyeOutlined />,
      key: 'initialView',
      onClick: () => {
        setActiveTool('initialView')
      },
      toolComponent: <InitialViewToolComponent setSetting={setSetting} setting={setting} mapInstance={mapInstance}></InitialViewToolComponent>,
      settingComponent: <InitialViewSettingComponent setSetting={setSetting} setting={setting} mapInstance={mapInstance}></InitialViewSettingComponent>
    },
    {
      title: '地图组件',
      icon: <GlobalOutlined />,
      key: 'mapWidget',
      onClick: () => {
        setActiveTool('mapWidget')
      },
      toolComponent: <MapWidgetToolComponent setSetting={setSetting} setting={setting} mapInstance={mapInstance} viewerRef={viewerRef}></MapWidgetToolComponent>,
      settingComponent: <MapWidgetSettingComponent setSetting={setSetting} setting={setting} mapInstance={mapInstance} viewerRef={viewerRef}>
      </MapWidgetSettingComponent>
    }
  ]

  const previewMap = () => {

    const initialViewParams: cameraFlyParamsType[] = setting.initialView.map(item => {

      const current = item

      return {
        destination: transfromDestination(current.destination),
        orientation: current.orientation
      }

    })

    mapInstance.current?.executeFlySequence(initialViewParams)

  }

  useEffect(() => {


  }, [])

  return <div className="build-map-container">
    {modalContext}
    {notificationContextHolder}
    {
      model !== 'build' && <div className={classNames('build-map-header', {
      })}>
        <div></div>
        <div className={classNames('build-map-header-actions', {
        })}>
          <Space>
            {
              model === 'build-preview' && <Button type="default" onClick={() => {
                setModel('build-edit')
              }}>编辑模式</Button>
            }
            {
              model === 'build-edit' && <Button type="default" onClick={() => {
                setModel('build-preview')

                previewMap()
              }}>预览模式</Button>
            }
            <Button type="primary" onClick={() => {

              const json = JSON.stringify([{
                ...setting,
                mapWidget: setting.mapWidget.map(item => {
                  return {
                    ...item,
                    instance: null
                  }
                })
              }])

              localStorage.setItem('build-map-list', json)

              console.log(json)

              navigate('/build-map-list')

            }} >保存</Button>
          </Space>
        </div>
      </div>
    }
    <div className={classNames('build-map-body', {
      'build-map-body-build': model === 'build'
    })}>
      {
        model !== 'build' && <div className={
          classNames('build-map-body-tools', {
            'build-map-body-tools-preview': model === 'build-preview'
          })
        }>
          <div className="build-map-body-tools-left">
            {
              metaData.map(item => {
                return <div title={item.title} key={item.key} className={classNames('build-map-body-tools-item', {
                  'build-map-body-tools-item-active': activeTool === item.key
                })} onClick={item.onClick}>
                  {item.icon}
                </div>
              })
            }
          </div>
          <div className="build-map-body-tools-right">
            {metaData.find(item => item.key === activeTool)?.toolComponent}
          </div>
        </div>
      }
      <div className="build-map-body-content">
        <CommonMap model={model} pickToolsList={pickToolsList} ref={mapInstance} terrainInitCallback={() => {


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
              const { points, color, width } = item as lineWidget

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
      </div>
      {
        model !== 'build' && <div className={
          classNames('build-map-body-setting', {
            'build-map-body-setting-preview': model === 'build-preview'
          })
        }>
          {metaData.find(item => item.key === activeTool)?.settingComponent}
        </div>
      }
    </div>

  </div>

}

export default BuildMapSetting