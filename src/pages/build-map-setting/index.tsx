import * as Cesium from "cesium";
import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Button, Drawer, Modal, notification, Space } from 'antd'
import CommonMap, { type cameraFlyParamsType, type CommonMapInstanceType, type CommonMapPropsType } from '@/components/common-map'
import * as gui from 'lil-gui'
import classNames from "classnames";
import { DatabaseOutlined, EyeOutlined, GlobalOutlined, } from "@ant-design/icons";
import { parseMapJson, setting_default, transfromDestination, type BillboardWidget, type LineWidget, type settingType, type TextWidget } from "./constance";
import './index.less'
import { InitialViewSettingComponent, InitialViewToolComponent, } from "./initial-view";
import { MapWidgetSettingComponent, MapWidgetToolComponent } from "./map-widget";
import { useNavigate } from 'react-router-dom'
import { PageMetadataSettingComponent, PageMetadataToolComponent } from "./page-metaData";

type BuildMapSettingPropsType = {
  mapModel: CommonMapPropsType['model']
}

const BuildMapSetting: React.FC<BuildMapSettingPropsType> = (props) => {

  const { mapModel = 'build-edit' } = props

  const navigate = useNavigate()

  const mapInstance = useRef<CommonMapInstanceType>(null);

  const [modal, modalContext] = Modal.useModal();

  const [notificationApi, notificationContextHolder] = notification.useNotification()

  const viewerRef = useRef<Cesium.Viewer | null>(null);

  const guiRef = useRef<gui.GUI | null>(null);

  const [model, setModel] = useState<CommonMapPropsType['model']>(mapModel)

  const [pickToolsList, setPickToolsList] = useState<CommonMapPropsType['pickToolsList']>([])

  const [activeTool, setActiveTool] = useState<'mapMetadata' | 'initialView' | 'mapWidget' | null>('mapMetadata')

  const [setting, setSetting] = useState<settingType>(setting_default)

  const [clickWidgetIndex, setClickWidgetIndex] = useState<number | undefined>(undefined)

  const [open, setOpen] = useState<boolean>(false)


  // 定义一个 ref，专门存储最新的 setting
  const settingRef = useRef(setting);

  const metaData = useMemo(() => {
    return [
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
        toolComponent:
          <MapWidgetToolComponent
            setSetting={setSetting}
            setting={setting}
            mapInstance={mapInstance}
            viewerRef={viewerRef}
            onClickWidget={(index) => {
              setOpen(true)
              setClickWidgetIndex(index)

              scrollIntoDOM(index)

            }}
          ></MapWidgetToolComponent>,
        settingComponent:
          <MapWidgetSettingComponent
            setSetting={setSetting}
            setting={setting}
            mapInstance={mapInstance}
            viewerRef={viewerRef}
            onDeleteWidget={(index) => {
              if (index === clickWidgetIndex) {
                setOpen(false)
                setClickWidgetIndex(undefined)
              }

            }}>
          </MapWidgetSettingComponent>
      }
    ]
  }, [setting])

  const scrollIntoDOM = (index: number) => {
    const scrollDom = document.querySelector(`.build-map-body-setting`) as HTMLDivElement;

    if (!scrollDom) return

    const widgetItemDom = document.querySelectorAll(`.map-widget-setting-item`)[index] as HTMLDivElement

    if (!widgetItemDom) return;

    scrollDom.scrollTop = widgetItemDom.offsetTop - 100;
  }


  const clickWidget = useMemo(() => {
    if (clickWidgetIndex === undefined) {
      return null
    }

    const cur = setting.mapWidget[clickWidgetIndex]

    return cur
  }, [clickWidgetIndex, setting])


  // 监听 setting 变化，实时更新 ref.current
  useEffect(() => {
    settingRef.current = setting; // 每次 setting 更新，都把最新值同步到 ref
  }, [setting]);
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
      <div className={classNames('build-map-header', {
        'build-map-header-build': model === 'build'
      })}>
        <div className="build-map-header-logo"></div>
        <div className="build-map-header-title">
          {setting.mapMetadata?.title}
        </div>
        <div className={classNames('build-map-header-actions', {
        })}>
          {
            model !== 'build' && <Space>
              {
                model === 'build-preview' && <Button type="default" onClick={() => {
                  setOpen(false)
                  setClickWidgetIndex(undefined)
                  setModel('build-edit')
                }}>编辑模式</Button>
              }
              {
                model === 'build-edit' && <Button type="default" onClick={() => {
                  setOpen(false)
                  setClickWidgetIndex(undefined)
                  setModel('build-preview')
                  previewMap()
                }}>预览模式</Button>
              }
              {
                model === 'build-edit' && <Button type="primary" onClick={() => {
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
              }
            </Space>
          }
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

          const params = parseMapJson(viewerRef, mapInstance, {
            onClickWidget(index) {
              setClickWidgetIndex(index)
              setOpen(true)

              scrollIntoDOM(index)
            },
          })
          setSetting(params)

        }}>

          <Drawer title={clickWidget?.title} open={open} width={400} placement="left" mask={false} maskClosable={false} onClose={() => {
            setOpen(false)
          }}>
            <div dangerouslySetInnerHTML={{ __html: clickWidget?.params?.content! }}></div>
          </Drawer>

        </CommonMap>
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