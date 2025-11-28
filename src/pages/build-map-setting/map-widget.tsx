import * as Cesium from "cesium";
import type { cameraFlyParamsType, CommonMapInstanceType } from "@/components/common-map"
import type { settingType } from "./constance"
import { transfromDestination } from "."
import { AimOutlined, CameraOutlined, CheckOutlined, CloseOutlined, DeleteOutlined, DragOutlined, EditOutlined, SaveOutlined, TwitterOutlined } from "@ant-design/icons"
import { Button, ColorPicker, Form, Input, InputNumber, message, type InputRef } from "antd"
import { useEffect, useRef, useState, useReducer } from "react"
import SvgIcon from "@/components/svg-icon"

import DrawLineShapeIcon from '@/assets/svg/draw-line-shape-icon.svg?react'; // 第二步写这里！
import DrawTextIcon from '@/assets/svg/draw-text-icon.svg?react';

import DrawCountour from '@/utils/plugins/draw-multiple-shape-countour'
import MultipleShape from '@/utils/plugins/draw-multiple-shape'
import LineShape from '@/utils/plugins/draw-line-shape'
import MeasureDistance from '@/utils/plugins/draw-measure-distance'
import ProfileAnalysis, { type pointMetaType } from '@/utils/plugins/draw-profile-analysis'
import DrawText from "@/utils/plugins/draw-text";
import type MultipleShapeCountour from '@/utils/plugins/draw-multiple-shape-countour'
import classNames from "classnames";

type props = {
  setting: settingType
  mapInstance: React.RefObject<CommonMapInstanceType | null>
  setSetting: React.Dispatch<React.SetStateAction<settingType>>
  viewerRef: React.RefObject<Cesium.Viewer | null>
}

export const MapWidgetToolComponent: React.FC<props> = (props) => {

  const { setting, mapInstance, setSetting, viewerRef } = props

  const [activeTool, setActiveTool] = useState<{ type?: string; instance?: MultipleShapeCountour | MultipleShape | LineShape | MeasureDistance | ProfileAnalysis }>({})

  const tools = [
    {
      icon: <SvgIcon
        icon={DrawLineShapeIcon}
        size={24}
      />,
      title: '绘制线段',
      onClick: () => {

        if (!!activeTool.type) {
          message.warning('当前正在绘制')
          return
        }

        const drawer = new LineShape(viewerRef.current!, {
          onCompleted(fixedPositions) {
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

            setSetting(pre => {
              return {
                ...pre,
                mapWidget: [
                  ...pre.mapWidget,
                  {
                    type: 'line',
                    title: '线段实例',
                    points: coordinates,
                    instance: drawer,
                    color: '#00FFFF',
                    width: 5
                  }
                ]
              }
            })
            setActiveTool({})
          },
          onEnd() {
            setActiveTool({})
          },
        })

        setActiveTool({ type: '绘制线段', instance: drawer })

      }
    },
    {
      icon: <SvgIcon
        icon={DrawTextIcon}
        size={24}
      />,
      title: '绘制文字',
      onClick: () => {

        if (!!activeTool.type) {
          message.warning('当前正在绘制')
          return
        }

        const drawer = new DrawText(viewerRef.current!, {
          onCompleted(fixedPositions) {
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

            setSetting(pre => {
              return {
                ...pre,
                mapWidget: [
                  ...pre.mapWidget,
                  {
                    type: 'text',
                    title: '文本',
                    instance: drawer,
                    position: coordinates[0]
                  }
                ]
              }
            })

            setActiveTool({})
          },
          onEnd() {
            setActiveTool({})
          },
        })
      }

    }
  ]

  return <>
    <h3>地图组件</h3>
    <br />
    <p className="build-map-body-tools-item-description">
      该模块用于设置地图组件，包括文字、图标、线段、矢量图形等。
    </p>
    <br />
    <div className="map-widget-tools-container">
      {
        tools.map(item => {
          return <div className={classNames("map-widget-tools-item", {
            "map-widget-tools-item-active": activeTool.type === item.title
          })} key={item.title} onClick={item.onClick}>
            {item.icon}
            <div>{item.title}</div>
          </div>
        })
      }
    </div>

  </>
}

export const MapWidgetSettingComponent: React.FC<props> = (props) => {
  const { setting, mapInstance, setSetting, viewerRef } = props

  const [editIndex, setEditIndex] = useState<number | null>(null)

  const editInputRef = useRef<InputRef>(null)

  return <>
    <h3>设置地图组件</h3>
    <br />
    <div className="map-widget-setting-container">

      {
        setting.mapWidget.map((item, index) => {
          return <div key={index} className="map-widget-setting-item">
            <div className="map-widget-setting-item-header">
              <div className="map-widget-setting-item-header-left">
                <span style={{ marginRight: 8 }}>
                  {item.type === 'line' && <SvgIcon
                    icon={DrawLineShapeIcon}
                    size={24}
                    color={'var(--primary-active-color)'}
                  />}
                  {item.type === 'text' && <SvgIcon
                    icon={DrawTextIcon}
                    size={24}
                    color={'var(--primary-active-color)'}
                  />}
                </span>
                <span>
                  {<span>
                    {editIndex === index ? (
                      <Input
                        size="small"
                        ref={editInputRef}
                        style={{ width: 130 }}
                        autoFocus
                        maxLength={10}
                        defaultValue={item.title}
                      />
                    ) : item.title}
                  </span>}
                </span>
              </div>
              <div className="map-widget-setting-item-header-right">
                <span className="setting-item-edit" >
                  {editIndex === index ? (
                    <>
                      <CloseOutlined title="取消编辑" onClick={() => {
                        setEditIndex(null)
                      }} />
                      &nbsp; &nbsp;
                      <CheckOutlined title="确认" onClick={() => {
                        const inputValue = editInputRef.current?.input?.value?.trim()
                        if (!inputValue) return // 空值不保存
                        const newMapWidget = setting.mapWidget.map((widget, widgetIndex) =>
                          widgetIndex === editIndex ? { ...widget, title: inputValue } : widget
                        )
                        setSetting(prev => ({ ...prev, mapWidget: newMapWidget }))
                        setEditIndex(null)
                      }} /></>

                  ) : (
                    <><EditOutlined title="编辑" onClick={() => {
                      setEditIndex(index)
                    }} /></>
                  )}
                </span>

                <span className="setting-item-aim" >
                  <AimOutlined title="定位" onClick={() => {

                    if (item.type === 'line') {
                      const positions = Cesium.Cartesian3.fromDegreesArray(item.points.map(item => [item.longitude, item.latitude]).flat())
                      mapInstance.current?.flyToBoundingSphere(positions)
                    }

                    if (item.type === 'text') {
                      console.log(item)
                      const positions = Cesium.Cartesian3.fromDegreesArray([item.position.longitude, item.position.latitude])
                      mapInstance.current?.flyToBoundingSphere(positions)
                    }

                  }} />
                </span>

                <span className="setting-item-delete">
                  <DeleteOutlined title="删除" onClick={() => {
                    item.instance?.destroyAll()
                    setEditIndex(null)
                    setSetting(prev => ({
                      ...prev,
                      mapWidget: prev.mapWidget.filter((_, i) => i !== index)
                    }))
                  }} />
                </span>
              </div>
            </div>

            <div className="map-widget-setting-item-body">
              {
                item.type === 'line' && <Form >
                  <Form.Item label="线段颜色">
                    <ColorPicker
                      value={item.color}
                      defaultValue={'#00FFFF'}
                      disabledFormat
                      format='hex'
                      onChangeComplete={(color) => {
                        const newColor = '#' + color.toHex()

                        // @ts-ignore
                        item.instance?.updateFinalEntityColor(newColor)
                        setSetting(prev => ({
                          ...prev,
                          mapWidget: prev.mapWidget.map((widget, widgetIndex) =>
                            widgetIndex === index ? { ...widget, color: newColor } : widget
                          )
                        }))
                      }}
                    />
                  </Form.Item>

                  <Form.Item label="线段宽度">
                    <InputNumber
                      min={1}
                      max={10}
                      defaultValue={5}
                      value={item.width}
                      onChange={(value) => {
                        // @ts-ignore
                        item.instance?.updateFinalEntityWidth(value)
                        setSetting(prev => ({
                          ...prev,
                          mapWidget: prev.mapWidget.map((widget, widgetIndex) =>
                            widgetIndex === index ? { ...widget, width: value! } : widget
                          )
                        }))
                      }}
                    />
                  </Form.Item>
                </Form>
              }

            </div>
          </div>
        })
      }
    </div>

  </>
}
