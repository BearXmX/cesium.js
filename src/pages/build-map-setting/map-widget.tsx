import { useEffect, useRef, useState } from 'react'
import * as Cesium from 'cesium'
import type { CommonMapInstanceType } from '@/components/common-map'
import type { BillboardWidget, LineWidget, settingType, TextWidget } from './constance'
import { ColorPicker, Form, Input, InputNumber, message, Switch, type InputRef } from 'antd'
import { AimOutlined, CheckOutlined, CloseOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons'
import classNames from 'classnames'
import SvgIcon from '@/components/svg-icon'
import DrawLineShapeIcon from '@/assets/svg/draw-line-shape-icon.svg?react' // 第二步写这里！
import DrawTextIcon from '@/assets/svg/draw-text-icon.svg?react'
import DrawBillboardIcon from '../../../public/position-icon-landmark.svg?react'
import LineShape, { LINE_SHAPE_OPTIONS_DEFAULT } from '@/utils/plugins/draw-line-shape'
import DrawText, { TEXT_OPTIONS_DEFAULT } from '@/utils/plugins/draw-text'
import DrawBillboard, { BILLBOARD_OPTIONS_DEFAULT } from '@/utils/plugins/draw-billboard'
import EditorWidget from './editor-widget'

type props = {
  setting: settingType
  mapInstance: React.RefObject<CommonMapInstanceType | null>
  setSetting: React.Dispatch<React.SetStateAction<settingType>>
  viewerRef: React.RefObject<Cesium.Viewer | null>
  onDeleteWidget?: (index: number) => void
  onClickWidget?: (index: number) => void
}

export const MapWidgetToolComponent: React.FC<props> = props => {
  const { setting, setSetting, viewerRef, onDeleteWidget, onClickWidget } = props

  const [activeTool, setActiveTool] = useState<{ type?: string; instance?: LineShape | DrawText | DrawBillboard }>({})

  // 定义一个 ref，专门存储最新的 setting
  const settingRef = useRef(setting)

  // 监听 setting 变化，实时更新 ref.current
  useEffect(() => {
    settingRef.current = setting // 每次 setting 更新，都把最新值同步到 ref
  }, [setting])

  const tools = [
    {
      icon: <SvgIcon icon={DrawLineShapeIcon} size={24} />,
      title: '绘制线段',
      onClick: () => {
        if (!!activeTool.type) {
          if (activeTool.type === '绘制线段') {
            activeTool.instance?.toCancel()
          } else {
            message.warning('当前正在使用' + activeTool.type + '工具，请先结束当前工具')
            return
          }
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
                    params: {
                      ...LINE_SHAPE_OPTIONS_DEFAULT,
                    },
                  },
                ],
              }
            })
            setActiveTool({})
          },
          onCancel() {
            setActiveTool({})
          },
          onClick(ref) {
            const index = settingRef.current.mapWidget.findIndex(item => item.type === 'line' && item.instance === ref)
            if (onClickWidget) {
              onClickWidget(index)
            }
          },
        })

        setActiveTool({ type: '绘制线段', instance: drawer })
      },
    },
    {
      icon: <SvgIcon icon={DrawTextIcon} size={24} />,
      title: '绘制文字',
      onClick: () => {
        if (!!activeTool.type) {
          if (activeTool.type === '绘制文字') {
            activeTool.instance?.toCancel()
          } else {
            message.warning('当前正在使用' + activeTool.type + '工具，请先结束当前工具')
            return
          }
        }

        const drawer = new DrawText(viewerRef.current!, {
          onCompleted(fixedPositions) {
            const coordinates = fixedPositions!.map(position => {
              const cartographic = Cesium.Cartographic.fromCartesian(position)
              const longitude = Cesium.Math.toDegrees(cartographic.longitude)
              const latitude = Cesium.Math.toDegrees(cartographic.latitude)
              const height = 0

              return {
                longitude,
                latitude,
                height,
              }
            })

            setSetting(pre => {
              return {
                ...pre,
                mapWidget: [
                  ...pre.mapWidget,
                  {
                    type: 'text',
                    title: '文字实例',
                    instance: drawer,
                    position: coordinates[0],
                    params: {
                      ...TEXT_OPTIONS_DEFAULT,
                    },
                  },
                ],
              }
            })

            setActiveTool({})
          },
          onCancel() {
            setActiveTool({})
          },
          onClick(ref) {
            const index = settingRef.current.mapWidget.findIndex(item => item.type === 'text' && item.instance === ref)
            if (onClickWidget) {
              onClickWidget(index)
            }
          },
        })

        setActiveTool({ type: '绘制文字', instance: drawer })
      },
    },
    {
      icon: <SvgIcon icon={DrawBillboardIcon} size={24} />,
      title: '绘制图标',
      onClick: () => {
        if (!!activeTool.type) {
          if (activeTool.type === '绘制图标') {
            activeTool.instance?.toCancel()
          } else {
            message.warning('当前正在使用' + activeTool.type + '工具，请先结束当前工具')
            return
          }
        }

        const drawer = new DrawBillboard(viewerRef.current!, {
          onCompleted(fixedPositions) {
            const coordinates = fixedPositions!.map(position => {
              const cartographic = Cesium.Cartographic.fromCartesian(position)
              const longitude = Cesium.Math.toDegrees(cartographic.longitude)
              const latitude = Cesium.Math.toDegrees(cartographic.latitude)
              const height = 0

              return {
                longitude,
                latitude,
                height,
              }
            })

            setSetting(pre => {
              return {
                ...pre,
                mapWidget: [
                  ...pre.mapWidget,
                  {
                    type: 'billboard',
                    title: '图标实例',
                    instance: drawer,
                    position: coordinates[0],
                    params: {
                      ...BILLBOARD_OPTIONS_DEFAULT,
                    },
                  },
                ],
              }
            })

            setActiveTool({})
          },
          onCancel() {
            setActiveTool({})
          },
          onClick(ref) {
            const index = settingRef.current.mapWidget.findIndex(item => item.type === 'billboard' && item.instance === ref)
            if (onClickWidget) {
              onClickWidget(index)
            }
          },
        })

        setActiveTool({ type: '绘制图标', instance: drawer })
      },
    },
  ]

  useEffect(() => {
    return () => {
      if (activeTool.instance) {
        activeTool.instance?.toCancel()
      }
    }
  }, [activeTool])

  return (
    <>
      <h3>地图组件</h3>
      <br />
      <p className="build-map-body-tools-item-description">该模块用于设置地图组件，包括文字、图标、线段、矢量图形等。</p>
      <br />
      <div className="map-widget-tools-container">
        {tools.map(item => {
          return (
            <div
              className={classNames('map-widget-tools-item', {
                'map-widget-tools-item-active': activeTool.type === item.title,
              })}
              key={item.title}
              onClick={item.onClick}
            >
              {item.icon}
              <div>{item.title}</div>
            </div>
          )
        })}
      </div>
    </>
  )
}

export const MapWidgetSettingComponent: React.FC<props> = props => {
  const { setting, mapInstance, setSetting, onDeleteWidget } = props

  const [editIndex, setEditIndex] = useState<number | null>(null)

  const editInputRef = useRef<InputRef>(null)

  return (
    <>
      <h3>设置地图组件</h3>
      <br />
      <div className="map-widget-setting-container">
        {setting.mapWidget.map((item, index) => {
          return (
            <div key={index} className="map-widget-setting-item">
              <div className="map-widget-setting-item-header">
                <div className="map-widget-setting-item-header-left">
                  <span style={{ marginRight: 8 }}>
                    {item.type === 'line' && <SvgIcon icon={DrawLineShapeIcon} size={24} color={'var(--primary-active-color)'} />}
                    {item.type === 'text' && <SvgIcon icon={DrawTextIcon} size={24} color={'var(--primary-active-color)'} />}
                    {item.type === 'billboard' && <SvgIcon icon={DrawBillboardIcon} size={24} color={'var(--primary-active-color)'} />}
                  </span>
                  <span>
                    {
                      <span>
                        {editIndex === index ? (
                          <Input size="small" ref={editInputRef} style={{ width: 110 }} autoFocus maxLength={10} defaultValue={item.title} />
                        ) : (
                          item.title
                        )}
                      </span>
                    }
                  </span>
                </div>
                <div className="map-widget-setting-item-header-right">
                  <span className="setting-item-edit">
                    {editIndex === index ? (
                      <>
                        <CloseOutlined
                          title="取消编辑"
                          onClick={() => {
                            setEditIndex(null)
                          }}
                        />
                        &nbsp; &nbsp;
                        <CheckOutlined
                          title="确认"
                          onClick={() => {
                            const inputValue = editInputRef.current?.input?.value?.trim()
                            if (!inputValue) return // 空值不保存
                            const newMapWidget = setting.mapWidget.map((widget, widgetIndex) =>
                              widgetIndex === editIndex ? { ...widget, title: inputValue } : widget
                            )
                            setSetting(prev => ({ ...prev, mapWidget: newMapWidget }))
                            setEditIndex(null)
                          }}
                        />
                      </>
                    ) : (
                      <>
                        <EditOutlined
                          title="编辑"
                          onClick={() => {
                            setEditIndex(index)
                          }}
                        />
                      </>
                    )}
                  </span>

                  <span className="setting-item-aim">
                    <AimOutlined
                      title="定位"
                      onClick={() => {
                        if (item.type === 'line') {
                          const positions = Cesium.Cartesian3.fromDegreesArray(item.points.map(item => [item.longitude, item.latitude]).flat())
                          mapInstance.current?.flyToBoundingSphere(positions)
                        }

                        if (item.type === 'text' || item.type === 'billboard') {
                          const positions = Cesium.Cartesian3.fromDegreesArray([
                            item.position.longitude,
                            item.position.latitude,
                            item.position.longitude - 10,
                            item.position.latitude,
                            item.position.longitude + 10,
                            item.position.latitude,
                          ])
                          mapInstance.current?.flyToBoundingSphere(positions)
                        }
                      }}
                    />
                  </span>

                  <span className="setting-item-delete">
                    <DeleteOutlined
                      title="删除"
                      onClick={() => {
                        item.instance?.destroyAll()
                        setEditIndex(null)
                        setSetting(prev => ({
                          ...prev,
                          mapWidget: prev.mapWidget.filter((_, i) => i !== index),
                        }))
                        if (onDeleteWidget) {
                          onDeleteWidget(index)
                        }
                      }}
                    />
                  </span>
                </div>
              </div>

              <div className="map-widget-setting-item-body">
                {item.type === 'line' && (
                  <Form>
                    <Form.Item label="线段颜色">
                      <ColorPicker
                        size="small"
                        value={item.params.color}
                        defaultValue={'#00FFFF'}
                        disabledFormat
                        format="hex"
                        onChangeComplete={color => {
                          const newColor = '#' + color.toHex()

                          // @ts-ignore
                          item.instance?.updateFinalEntityColor(newColor)
                          setSetting(prev => ({
                            ...prev,
                            mapWidget: prev.mapWidget.map((widget: any, widgetIndex) => {
                              if (widgetIndex === index) {
                                const v = widget as LineWidget
                                return { ...widget, params: { ...v.params, color: newColor } }
                              }

                              return widget
                            }),
                          }))
                        }}
                      />
                    </Form.Item>

                    <Form.Item label="线段宽度">
                      <InputNumber
                        size="small"
                        min={1}
                        max={10}
                        defaultValue={5}
                        value={item.params.width}
                        onChange={value => {
                          // @ts-ignore
                          item.instance?.updateFinalEntityWidth(value)
                          setSetting(prev => ({
                            ...prev,
                            mapWidget: prev.mapWidget.map((widget: any, widgetIndex) => {
                              if (widgetIndex === index) {
                                const v = widget as LineWidget
                                return { ...widget, params: { ...v.params, width: value! } }
                              }

                              return widget
                            }),
                          }))
                        }}
                      />
                    </Form.Item>
                    <Form.Item
                      label="内容介绍"
                      labelCol={{
                        span: 24,
                      }}
                    >
                      <EditorWidget item={item} setSetting={setSetting} index={index} setting={setting}></EditorWidget>
                    </Form.Item>
                  </Form>
                )}

                {item.type === 'text' && (
                  <Form>
                    <Form.Item label="文本内容">
                      <Input
                        size="small"
                        maxLength={20}
                        value={item.params.label}
                        onChange={e => {
                          const text = e.target.value.trim()
                          item.instance?.updateTextEntityLabel(text)
                          setSetting(prev => ({
                            ...prev,
                            mapWidget: prev.mapWidget.map((widget: any, widgetIndex) => {
                              if (widgetIndex === index) {
                                const v = widget as TextWidget
                                return { ...widget, params: { ...v.params, label: text } }
                              }

                              return widget
                            }),
                          }))
                        }}
                      />
                    </Form.Item>
                    <Form.Item label="高度">
                      <InputNumber
                        size="small"
                        min={0}
                        max={500000}
                        step={1000}
                        value={item.position.height}
                        onChange={value => {
                          const position = { ...item.position, height: value! }

                          const formatterPosition = Cesium.Cartesian3.fromDegrees(position.longitude, position.latitude, position.height)

                          item.instance?.updateTextEntityHeight(formatterPosition)
                          setSetting(prev => ({
                            ...prev,
                            mapWidget: prev.mapWidget.map((widget, widgetIndex) => {
                              if (widgetIndex === index) {
                                const v = widget as TextWidget
                                return { ...v, position: position }
                              }
                              return widget
                            }),
                          }))
                        }}
                      />
                    </Form.Item>
                    <Form.Item label="文本颜色">
                      <ColorPicker
                        size="small"
                        value={item.params.color}
                        disabledFormat
                        format="hex"
                        onChangeComplete={color => {
                          const newColor = '#' + color.toHex()

                          item.instance?.updateTextEntityColor(newColor)
                          setSetting(prev => ({
                            ...prev,
                            mapWidget: prev.mapWidget.map((widget: any, widgetIndex) => {
                              if (widgetIndex === index) {
                                const v = widget as TextWidget
                                return { ...widget, params: { ...v.params, color: newColor } }
                              }

                              return widget
                            }),
                          }))
                        }}
                      />
                    </Form.Item>
                    <Form.Item label="文本大小">
                      <InputNumber
                        size="small"
                        min={1}
                        max={30}
                        value={item.params.fontSize}
                        onChange={value => {
                          item.instance?.updateTextEntityFontSize(value!)
                          setSetting(prev => ({
                            ...prev,
                            mapWidget: prev.mapWidget.map((widget: any, widgetIndex) => {
                              if (widgetIndex === index) {
                                const v = widget as TextWidget
                                return { ...widget, params: { ...v.params, fontSize: value! } }
                              }

                              return widget
                            }),
                          }))
                        }}
                      />
                    </Form.Item>
                    <Form.Item label="描边颜色">
                      <ColorPicker
                        size="small"
                        value={item.params.outlineColor}
                        disabledFormat
                        format="hex"
                        onChangeComplete={color => {
                          const newColor = '#' + color.toHex()

                          item.instance?.updateTextEntityOutlineColor(newColor)
                          setSetting(prev => ({
                            ...prev,
                            mapWidget: prev.mapWidget.map((widget: any, widgetIndex) => {
                              if (widgetIndex === index) {
                                const v = widget as TextWidget
                                return { ...widget, params: { ...v.params, outlineColor: newColor } }
                              }

                              return widget
                            }),
                          }))
                        }}
                      />
                    </Form.Item>

                    <Form.Item label="描边宽度">
                      <InputNumber
                        size="small"
                        min={0}
                        max={10}
                        value={item.params.outlineWidth}
                        onChange={value => {
                          item.instance?.updateTextEntityOutlineWidth(value!)
                          setSetting(prev => ({
                            ...prev,
                            mapWidget: prev.mapWidget.map((widget: any, widgetIndex) => {
                              if (widgetIndex === index) {
                                const v = widget as TextWidget
                                return { ...widget, params: { ...v.params, outlineWidth: value! } }
                              }
                              return widget
                            }),
                          }))
                        }}
                      />
                    </Form.Item>

                    <Form.Item label="显示背景">
                      <Switch
                        size="small"
                        checked={!!item.params.showBackground}
                        onChange={checked => {
                          item.instance?.updateTextEntityShowBackground(checked)

                          setSetting(prev => ({
                            ...prev,
                            mapWidget: prev.mapWidget.map((widget: any, widgetIndex) => {
                              if (widgetIndex === index) {
                                const v = widget as TextWidget
                                return { ...widget, params: { ...v.params, showBackground: Number(checked) } }
                              }
                              return widget
                            }),
                          }))
                        }}
                      />
                    </Form.Item>

                    <Form.Item label="背景颜色">
                      <ColorPicker
                        size="small"
                        value={item.params.backgroundColor}
                        disabledFormat
                        format="hex"
                        onChangeComplete={color => {
                          const newColor = '#' + color.toHex()

                          item.instance?.updateTextEntityBackgroundColor(newColor)
                          setSetting(prev => ({
                            ...prev,
                            mapWidget: prev.mapWidget.map((widget: any, widgetIndex) => {
                              if (widgetIndex === index) {
                                const v = widget as TextWidget
                                return { ...widget, params: { ...v.params, backgroundColor: newColor } }
                              }

                              return widget
                            }),
                          }))
                        }}
                      />
                    </Form.Item>
                    <Form.Item label="背景内边距X">
                      <InputNumber
                        size="small"
                        min={0}
                        max={10}
                        value={item.params.backgroundPaddingX}
                        onChange={value => {
                          item.instance?.updateTextEntityBackgroundPadding(value!, item.params.backgroundPaddingY!)
                          setSetting(prev => ({
                            ...prev,
                            mapWidget: prev.mapWidget.map((widget: any, widgetIndex) => {
                              if (widgetIndex === index) {
                                const v = widget as TextWidget
                                return { ...widget, params: { ...v.params, backgroundPaddingX: value! } }
                              }

                              return widget
                            }),
                          }))
                        }}
                      />
                    </Form.Item>
                    <Form.Item label="背景内边距Y">
                      <InputNumber
                        size="small"
                        min={0}
                        max={10}
                        value={item.params.backgroundPaddingY}
                        onChange={value => {
                          item.instance?.updateTextEntityBackgroundPadding(value!, item.params.backgroundPaddingY!)
                          setSetting(prev => ({
                            ...prev,
                            mapWidget: prev.mapWidget.map((widget: any, widgetIndex) => {
                              if (widgetIndex === index) {
                                const v = widget as TextWidget
                                return { ...widget, params: { ...v.params, backgroundPaddingY: value! } }
                              }

                              return widget
                            }),
                          }))
                        }}
                      />
                    </Form.Item>
                    <Form.Item
                      label="内容介绍"
                      labelCol={{
                        span: 24,
                      }}
                    >
                      <EditorWidget item={item} setSetting={setSetting} index={index} setting={setting}></EditorWidget>
                    </Form.Item>
                  </Form>
                )}

                {item.type === 'billboard' && (
                  <Form>
                    <Form.Item label="高度">
                      <InputNumber
                        size="small"
                        min={0}
                        max={500000}
                        step={1000}
                        value={item.position.height}
                        onChange={value => {
                          const position = { ...item.position, height: value! }

                          const formatterPosition = Cesium.Cartesian3.fromDegrees(position.longitude, position.latitude, position.height)

                          item.instance?.updateBillboardEntityHeight(formatterPosition)
                          setSetting(prev => ({
                            ...prev,
                            mapWidget: prev.mapWidget.map((widget, widgetIndex) => {
                              if (widgetIndex === index) {
                                const v = widget as BillboardWidget
                                return { ...v, position: position }
                              }
                              return widget
                            }),
                          }))
                        }}
                      />
                    </Form.Item>

                    <Form.Item label="缩放">
                      <InputNumber
                        size="small"
                        min={0.1}
                        max={5}
                        step={0.1}
                        value={item.params.scale}
                        onChange={value => {
                          item.instance?.updateFinalEntityScale(value!)
                          setSetting(prev => ({
                            ...prev,
                            mapWidget: prev.mapWidget.map((widget: any, widgetIndex) => {
                              if (widgetIndex === index) {
                                const v = widget as BillboardWidget
                                return { ...widget, params: { ...v.params, scale: value! } }
                              }

                              return widget
                            }),
                          }))
                        }}
                      />
                    </Form.Item>
                    <Form.Item
                      label="内容介绍"
                      labelCol={{
                        span: 24,
                      }}
                    >
                      <EditorWidget item={item} setSetting={setSetting} index={index} setting={setting}></EditorWidget>
                    </Form.Item>
                  </Form>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
