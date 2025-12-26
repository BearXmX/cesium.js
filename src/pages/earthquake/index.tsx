import * as Cesium from 'cesium'
import { useEffect, useRef, useState } from 'react'
import { Modal, notification } from 'antd'
import * as gui from 'lil-gui'
import CommonMap, { type CommonMapInstanceType } from '@/components/common-map'
import Radiant from './radiant'
import { tangshanEarthquake, wenchuangEarthquake } from './constance'
import WavesCharts from './wenchuan-earthquake-waves-charts'
import { createFencePattern } from '@/utils/plugins/fill-grid-to-polygon'
const Earthquake = () => {
  const mapInstance = useRef<CommonMapInstanceType>(null)

  const [modal, modalContext] = Modal.useModal()
  const [notificationApi, notificationContextHolder] = notification.useNotification()

  const viewerRef = useRef<Cesium.Viewer | null>(null)

  const guiRef = useRef<gui.GUI | null>(null)

  const chinaEarthquakeRef = useRef<Cesium.Entity[]>([])

  const stepDividingLineRef = useRef<Cesium.Entity[]>([])

  const globalPlateBoundaryRef = useRef<Cesium.Entity[]>([])

  const globalPlateBoundaryNameRef = useRef<Cesium.Entity[]>([])

  const globalTrenchRef = useRef<Cesium.Entity[]>([])

  const globalEarthquakePointRef = useRef<Cesium.Entity[]>([])

  const globalVolcanoPointRef = useRef<Cesium.Entity[]>([])

  const globalLandArcLineRef = useRef<Cesium.Entity[]>([])

  const globalLandArcNameRef = useRef<Cesium.Entity[]>([])

  const globalRiftValleyLineRef = useRef<Cesium.Entity[]>([])

  const globalRiftValleyNameRef = useRef<Cesium.Entity[]>([])

  const ANZNCMainlandOutlineRef = useRef<Cesium.Entity[]>([])

  const NORTHAMEMainlandOutlineRef = useRef<Cesium.Entity[]>([])

  const AFRICAMainlandOutlineRef = useRef<Cesium.Entity[]>([])

  const SOUTHAMEMainlandOutlineRef = useRef<Cesium.Entity[]>([])

  const THESOUTHPOLEMainlandOutlineRef = useRef<Cesium.Entity[]>([])

  const EURASIAMainlandOutlineRef = useRef<Cesium.Entity[]>([])

  const globalMainlandNameRef = useRef<Cesium.Entity[]>([])

  const earthquakeCircleWaveRef = useRef<Cesium.Entity[]>([])

  const [showWenchuanEarthquakeWavesCharts, setShowWenchuanEarthquakeWavesCharts] = useState(false)

  const drawGeometry = (
    show: boolean,
    ref: React.RefObject<Cesium.Entity[]>,
    url: string,
    texts: { position: Cesium.Cartesian3; text: string; fontSize?: number }[],
    options: Cesium.GeoJsonDataSource.LoadOptions & {
      color?: Cesium.Color
      loadedDataCallback?: (data: any, dataSource: Cesium.GeoJsonDataSource) => void
    }
  ) => {
    if (!viewerRef.current) return

    if (show) {
      if (ref.current?.length) {
        ref.current.forEach(item => {
          item.show = true
        })
      } else {
        fetch(url)
          .then(res => res.json())
          .then(data => {
            Cesium.GeoJsonDataSource.load(data, {
              markerSymbol: 'circle',
              ...options,
            }).then(function (dataSource) {
              if (!viewerRef.current) return
              viewerRef.current?.dataSources.add(dataSource)
              ref.current.push(...dataSource.entities.values)

              texts.forEach(item => {
                ref.current.push(
                  viewerRef.current!.entities.add({
                    position: item.position,
                    label: {
                      text: item.text,
                      font: `${item.fontSize || 16}px sans-serif`,
                      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                      outlineWidth: 2,
                      outlineColor: options.color || options.fill?.withAlpha(1),
                      fillColor: Cesium.Color.WHITE,
                      disableDepthTestDistance: Number.POSITIVE_INFINITY, // 添加这一行，使标签始终在最前
                    },
                  })
                )
              })

              if (typeof options.loadedDataCallback === 'function') {
                options.loadedDataCallback(data, dataSource)
              }
            })
          })
      }
    } else {
      ref.current!.forEach(item => {
        item.show = false
      })
    }
  }

  const guiControls = {
    drawMainlandOutline: false,
    drawChinaEarthquakeArea: false,
    drawStepDividingLine: false,
    drawGlobalPlateBoundary: false,
    drawGlobalPlateBoundaryName: false,
    drawGlobalTrenchName: false,
    drawGlobalEarthquakePoint: false,
    drawGlobalVolcanoPoint: false,
    drawGlobalLandArc: false,
    drawGlobalRiftValley: false,
    wenchuangEarthquake: false,
    tangshanEarthquake: false,

    wenchuanEarthquakeWavesCharts: false,

    showVideo: () => {
      modal.info({
        icon: null,
        title: '视频播放',
        content: (
          <video
            src={window.$$prefix + '/data/earthquake/earthquake.mp4'}
            style={{ width: '100%', height: '100%' }}
            controlsList="nodownload"
            controls
            autoPlay
          />
        ),
        okText: '关闭',
        cancelText: '取消',
        width: 800,
        centered: true,
        onOk() { },
        onCancel() { },
      })
    },

    playSimpleSeismograph: () => {
      modal.info({
        icon: null,
        title: '简易地震仪',
        content: (
          <iframe
            src={window.location.href.replace('earthquake', 'simple-seismograph')}
            frameBorder={0}
            style={{ width: '100%', height: 'calc(100vh - 118px)' }}
          />
        ),
        okText: '关闭',
        cancelText: '取消',
        width: '100%',
        style: {
          maxWidth: '100vw',
          height: '100vh',
          top: 0,
          overflow: 'hidden',
        },
        styles: { wrapper: { overflow: 'hidden' } },
        closable: true,
        centered: true,
        zIndex: 2551,
        onOk() { },
      })
    },
    playEarthConstruction: () => {
      modal.info({
        icon: null,
        title: '地球的构造',
        content: (
          <iframe
            src={window.location.href.replace('earthquake', 'earth-construction')}
            frameBorder={0}
            style={{ width: '100%', height: 'calc(100vh - 118px)' }}
          />
        ),
        okText: '关闭',
        cancelText: '取消',
        width: '100%',
        style: {
          maxWidth: '100vw',
          height: '100vh',
          top: 0,
          overflow: 'hidden',
        },
        styles: { wrapper: { overflow: 'hidden' } },
        closable: true,
        centered: true,
        zIndex: 2551,
        onOk() { },
      })
    },
  }

  const initGui = () => {
    if (guiRef.current) {
      guiRef.current.destroy()
      guiRef.current = null
    }

    guiRef.current = new gui.GUI({})

    guiRef.current.title('地震')

    const videoControls = guiRef.current.addFolder('地震科普')

    const mainControls = guiRef.current.addFolder('国内相关')

    const globalControls = guiRef.current.addFolder('全球相关')

    videoControls.add(guiControls, 'playEarthConstruction').name('地球的构造')
    videoControls.add(guiControls, 'playSimpleSeismograph').name('简易地震仪')

    const eventsControls = guiRef.current.addFolder('重大地震')

    /*     videoControls.add(guiControls, 'showVideo').name('什么是地震？') */

    /* 国内相关 */
    mainControls
      .add(guiControls, 'drawChinaEarthquakeArea')
      .name('中国主要地震带')
      .onChange((value: boolean) => {
        drawChinaEarthquakeArea(value)
      })

    mainControls
      .add(guiControls, 'drawStepDividingLine')
      .name('梯度分界线')
      .onChange((value: boolean) => {
        drawStepDividingLine(value)
      })

    /* 全球相关 */
    globalControls
      .add(guiControls, 'drawMainlandOutline')
      .name('大陆板块')
      .onChange((value: boolean) => {
        drawMainlandOutline(value)
      })

    globalControls
      .add(guiControls, 'drawGlobalPlateBoundary')
      .name('板块分界线')
      .onChange((value: boolean) => {
        drawGlobalPlateBoundary(value)
      })

    globalControls
      .add(guiControls, 'drawGlobalPlateBoundaryName')
      .name('板块名称')
      .onChange((value: boolean) => {
        drawGlobalPlateBoundaryName(value)
      })

    globalControls
      .add(guiControls, 'drawGlobalTrenchName')
      .name('主要海沟')
      .onChange((value: boolean) => {
        drawGlobalTrenchName(value)
      })

    globalControls
      .add(guiControls, 'drawGlobalEarthquakePoint')
      .name('地震分布（近10年）')
      .onChange((value: boolean) => {
        drawGlobalEarthquakePoint(value)
      })

    globalControls
      .add(guiControls, 'drawGlobalVolcanoPoint')
      .name('火山分布')
      .onChange((value: boolean) => {
        drawGlobalVolcanoPoint(value)
      })

    globalControls
      .add(guiControls, 'drawGlobalLandArc')
      .name('主要岛弧')
      .onChange((value: boolean) => {
        drawGlobalLandArc(value)
      })

    globalControls
      .add(guiControls, 'drawGlobalRiftValley')
      .name('主要裂谷')
      .onChange((value: boolean) => {
        drawGlobalRiftValley(value)
      })

    eventsControls
      .add(guiControls, 'wenchuangEarthquake')
      .name('汶川大地震')
      .onChange((value: boolean) => {
        if (value) {
          cameraFlyTo(103.48591676223856, 31.061249796531172, 5000, {
            orientation: {
              heading: 6.283185307179586,
              pitch: -1.5707960496172761,
              roll: 0,
            },
          })
        }

        earthquakeCircleWaveRef.current[0].show = value

        notificationApi.destroy()

        if (value) {
          notificationApi.info({
            message: `5.12 汶川大地震`,
            style: {
              width: 400,
            },
            description: <div style={{ maxHeight: 500, textIndent: '2em' }}>{wenchuangEarthquake}</div>,
            placement: 'bottomLeft',
            duration: null,
          })
        } else {
          notificationApi.destroy()
        }
      })

    eventsControls
      .add(guiControls, 'wenchuanEarthquakeWavesCharts')
      .name('汶川大地震地震波')
      .onChange((value: boolean) => {
        setShowWenchuanEarthquakeWavesCharts(value)
      })

    eventsControls
      .add(guiControls, 'tangshanEarthquake')
      .name('唐山大地震')
      .onChange((value: boolean) => {
        if (value) {
          cameraFlyTo(118.07407423045544, 39.575412540709294, 5000, {
            orientation: {
              heading: 6.283185307179586,
              pitch: -1.5707960496172761,
              roll: 0,
            },
          })
        }
        earthquakeCircleWaveRef.current[1].show = value

        notificationApi.destroy()

        if (value) {
          notificationApi.info({
            message: `7.28 唐山大地震`,
            style: {
              width: 400,
            },
            description: <div style={{ maxHeight: 500, textIndent: '2em' }}>{tangshanEarthquake}</div>,
            placement: 'bottomLeft',
            duration: null,
          })
        } else {
          notificationApi.destroy()
        }
      })
  }

  const drawChinaBoundary = () => {
    drawGeometry(true, { current: [] }, window.$$prefix + '/data/china/china-boundary.geojson', [], {
      stroke: Cesium.Color.YELLOW,
      fill: Cesium.Color.YELLOW.withAlpha(0.2),
      strokeWidth: 2,
    })
  }

  const drawChinaEarthquakeArea = (checked: boolean) => {
    drawGeometry(checked, chinaEarthquakeRef, window.$$prefix + '/data/earthquake/china-earthquake-area.geojson', [], {
      stroke: Cesium.Color.BROWN,
      fill: Cesium.Color.BROWN.withAlpha(0.5),
      strokeWidth: 2,
    })
  }

  const drawANZNCMainlandOutline = (checked: boolean) => {
    drawGeometry(checked, ANZNCMainlandOutlineRef, window.$$prefix + '/data/earthquake/ANZNC-mainland-outline.geojson', [], {
      stroke: Cesium.Color.ORANGERED,
      fill: Cesium.Color.ORANGERED.withAlpha(0.2),
      strokeWidth: 2,
    })
  }

  const drawNORTHAMEMainlandOutline = (checked: boolean) => {
    drawGeometry(checked, NORTHAMEMainlandOutlineRef, window.$$prefix + '/data/earthquake/NORTH-AME-mainland-outline.geojson', [], {
      stroke: Cesium.Color.ORANGERED,
      fill: Cesium.Color.ORANGERED.withAlpha(0.2),
      strokeWidth: 2,
    })
  }

  const drawAFRICAMainlandOutline = (checked: boolean) => {
    drawGeometry(checked, AFRICAMainlandOutlineRef, window.$$prefix + '/data/earthquake/AFRICA-mainland-outline.geojson', [], {
      stroke: Cesium.Color.ORANGERED,
      fill: Cesium.Color.ORANGERED.withAlpha(0.2),
      strokeWidth: 2,
    })
  }

  const drawTHESOUTHPOLEMainlandOutline = (checked: boolean) => {
    drawGeometry(checked, THESOUTHPOLEMainlandOutlineRef, window.$$prefix + '/data/earthquake/THESOUTHPOLE-mainland-outline.geojson', [], {
      stroke: Cesium.Color.ORANGERED,
      fill: Cesium.Color.ORANGERED.withAlpha(0.2),
      strokeWidth: 2,
    })
  }

  const drawSOUTHAMEMainlandOutline = (checked: boolean) => {
    drawGeometry(checked, SOUTHAMEMainlandOutlineRef, window.$$prefix + '/data/earthquake/SOUTH-AME-mainland-outline.geojson', [], {
      stroke: Cesium.Color.ORANGERED,
      fill: Cesium.Color.ORANGERED.withAlpha(0.2),
      strokeWidth: 2,
    })
  }

  const drawEURASIAMainlandOutline = (checked: boolean) => {
    drawGeometry(checked, EURASIAMainlandOutlineRef, window.$$prefix + '/data/earthquake/EURASIA-mainland-outline.geojson', [], {
      stroke: Cesium.Color.ORANGERED,
      fill: Cesium.Color.ORANGERED.withAlpha(0.2),
      strokeWidth: 2,
    })
  }

  const drawGlobalMainlandName = (checked: boolean) => {
    drawGeometry(checked, globalMainlandNameRef, window.$$prefix + '/data/earthquake/global-mainland-name.geojson', [], {
      stroke: Cesium.Color.RED,
      fill: Cesium.Color.RED.withAlpha(0.2),
      strokeWidth: 2,
      loadedDataCallback(data, dataSource) {
        dataSource.entities.values.forEach(entity => {
          const props = entity.properties!.getValue()
          if (!props) return

          const labelConfig = {
            text: props.name || '',
            textColor: '#fff', // 原始文字颜色配置
            outlineColor: '#000000',
            outlineWidth: 4, // 原100过大，修正为1
            farDistance: 30000000,
            nearDistance: 2000000,
          }

          // 移除默认点/图标，避免重叠
          entity.billboard = undefined
          entity.point = undefined

          // 关键修正：将 color → fontColor
          entity.label = new Cesium.LabelGraphics({
            text: labelConfig.text,
            font: '30px sans-serif',
            style: Cesium.LabelStyle.FILL_AND_OUTLINE, // 关键：同时显示描边和填充
            outlineColor: Cesium.Color.fromCssColorString(labelConfig.outlineColor),
            outlineWidth: labelConfig.outlineWidth,
            fillColor: Cesium.Color.fromCssColorString(labelConfig.textColor),
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            verticalOrigin: Cesium.VerticalOrigin.CENTER,
          })
        })
      },
    })
  }

  const drawMainlandOutline = (checked: boolean) => {
    drawANZNCMainlandOutline(checked)
    drawNORTHAMEMainlandOutline(checked)
    drawAFRICAMainlandOutline(checked)
    drawTHESOUTHPOLEMainlandOutline(checked)
    drawSOUTHAMEMainlandOutline(checked)
    drawEURASIAMainlandOutline(checked)
    drawGlobalMainlandName(checked)
  }

  const drawStepDividingLine = (checked: boolean) => {
    drawGeometry(checked, stepDividingLineRef, window.$$prefix + '/data/earthquake/step-dividing-line.geojson', [], {
      loadedDataCallback(data, dataSource) {
        const colors = [
          Cesium.Color.RED,
          Cesium.Color.GREEN,
          Cesium.Color.BLUE,
          Cesium.Color.CYAN,
          Cesium.Color.MAGENTA,
          Cesium.Color.GRAY,
          Cesium.Color.WHITE,
          Cesium.Color.YELLOW,
        ]

        const stepDividingLineInstance = dataSource.entities.values.map((entity, index) => {
          entity.polyline!.width = new Cesium.ConstantProperty(8)

          entity.polyline!.material = new Cesium.PolylineGlowMaterialProperty({
            color: colors[index],
          })

          return entity
        })

        stepDividingLineRef.current = stepDividingLineInstance
      },
    })
  }

  const drawGlobalPlateBoundary = (checked: boolean) => {
    drawGeometry(checked, globalPlateBoundaryRef, window.$$prefix + '/data/earthquake/global-plate-boundary.geojson', [], {
      stroke: Cesium.Color.RED,
      fill: Cesium.Color.RED.withAlpha(0.2),
      strokeWidth: 2,
    })
  }

  const drawGlobalPlateBoundaryName = (checked: boolean) => {
    drawGeometry(checked, globalPlateBoundaryNameRef, window.$$prefix + '/data/earthquake/global-plate-boundary-name.geojson', [], {
      loadedDataCallback(data, dataSource) {
        dataSource.entities.values.forEach(entity => {
          const props = entity.properties!.getValue()
          if (!props) return

          const labelConfig = {
            text: props.name || '未命名板块',
            textColor: '#FFFFFF', // 原始文字颜色配置
            outlineColor: '#000000',
            outlineWidth: 5, // 原100过大，修正为1
            farDistance: 30000000,
            nearDistance: 2000000,
          }

          // 移除默认点/图标，避免重叠
          entity.billboard = undefined
          entity.point = undefined

          // 关键修正：将 color → fontColor
          entity.label = new Cesium.LabelGraphics({
            text: labelConfig.text,
            font: '30px sans-serif',
            outlineColor: Cesium.Color.fromCssColorString(labelConfig.outlineColor),
            style: Cesium.LabelStyle.FILL_AND_OUTLINE, // 关键：同时显示描边和填充
            outlineWidth: labelConfig.outlineWidth,
            fillColor: Cesium.Color.fromCssColorString(labelConfig.textColor),
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            verticalOrigin: Cesium.VerticalOrigin.CENTER,
          })
        })

        globalPlateBoundaryNameRef.current = dataSource.entities.values
      },
    })
  }

  const drawGlobalTrenchName = (checked: boolean) => {
    drawGeometry(checked, globalTrenchRef, window.$$prefix + '/data/earthquake/global-trench-name.geojson', [], {
      stroke: Cesium.Color.RED,
      fill: Cesium.Color.RED.withAlpha(0.2),
      strokeWidth: 2,

      loadedDataCallback(data, dataSource) {
        dataSource.entities.values.forEach(entity => {
          const props = entity.properties!.getValue()
          if (!props) return

          const labelConfig = {
            text: props.name || '海沟',
            textColor: '#0307eeff', // 原始文字颜色配置
            outlineColor: '#000000',
            outlineWidth: 4, // 原100过大，修正为1
            farDistance: 30000000,
            nearDistance: 2000000,
          }

          // 移除默认点/图标，避免重叠
          entity.billboard = undefined
          entity.point = undefined

          // 关键修正：将 color → fontColor
          entity.label = new Cesium.LabelGraphics({
            text: labelConfig.text,
            font: '30px sans-serif',
            style: Cesium.LabelStyle.FILL_AND_OUTLINE, // 关键：同时显示描边和填充
            outlineColor: Cesium.Color.fromCssColorString(labelConfig.outlineColor),
            outlineWidth: labelConfig.outlineWidth,
            fillColor: Cesium.Color.fromCssColorString(labelConfig.textColor),
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            verticalOrigin: Cesium.VerticalOrigin.CENTER,
          })
        })

        globalTrenchRef.current = dataSource.entities.values
      },
    })
  }

  const drawGlobalEarthquakePoint = (checked: boolean) => {
    if (checked) {
      if (globalEarthquakePointRef.current?.length) {
        globalEarthquakePointRef.current.forEach(item => {
          item.show = true
        })
      } else {
        fetch(window.$$prefix + '/data/earthquake/global-earthquake-point.geojson')
          .then(res => res.json())
          .then(data => {
            const featrures = data.features || []

            globalEarthquakePointRef.current = featrures.map((item: any) => {
              const position = Cesium.Cartesian3.fromDegrees(parseFloat(item.geometry.coordinates[0]), parseFloat(item.geometry.coordinates[1]))

              const props = item.properties || {}

              return viewerRef.current!.entities.add({
                position: position,
                point: {
                  color: Cesium.Color.WHITE,
                  pixelSize: Number(props.size) || 5,
                  outlineColor: Cesium.Color.GREEN,
                  outlineWidth: 2,
                },
              })
            })
          })
      }
    } else {
      globalEarthquakePointRef.current!.forEach(item => {
        item.show = false
      })
    }
  }

  const drawGlobalVolcanoPoint = (checked: boolean) => {
    if (checked) {
      if (globalVolcanoPointRef.current?.length) {
        globalVolcanoPointRef.current.forEach(item => {
          item.show = true
        })
      } else {
        fetch(window.$$prefix + '/data/earthquake/global-volcano-point.geojson')
          .then(res => res.json())
          .then(data => {
            const featrures = data.features || []

            globalVolcanoPointRef.current = featrures.map((item: any) => {
              const position = Cesium.Cartesian3.fromDegrees(parseFloat(item.geometry.coordinates[0]), parseFloat(item.geometry.coordinates[1]))

              const props = item.properties || {}

              return viewerRef.current!.entities.add({
                position: position,
                point: {
                  color: Cesium.Color.DARKGRAY,
                  pixelSize: Number(props.size) || 5,
                  outlineColor: Cesium.Color.BLACK,
                  outlineWidth: 2,
                },
              })
            })
          })
      }
    } else {
      globalVolcanoPointRef.current!.forEach(item => {
        item.show = false
      })
    }
  }

  const drawGlobalLandArcLine = (checked: boolean) => {
    drawGeometry(checked, globalLandArcLineRef, window.$$prefix + '/data/earthquake/global-land-arc-line.geojson', [], {
      stroke: Cesium.Color.BROWN,
      fill: Cesium.Color.BROWN.withAlpha(0.2),
      strokeWidth: 2,
    })
  }

  const drawGlobalLandArcName = (checked: boolean) => {
    drawGeometry(checked, globalLandArcLineRef, window.$$prefix + '/data/earthquake/global-land-arc-name.geojson', [], {
      stroke: Cesium.Color.BROWN,
      fill: Cesium.Color.BROWN.withAlpha(0.2),
      strokeWidth: 2,
      loadedDataCallback(data, dataSource) {
        cameraFlyTo(116.4683053, 14.69396339, 6909486.37, {
          orientation: {
            heading: 1.7763568394002505e-15,
            pitch: -1.5664983737834062,
            roll: 0,
          },
        })

        dataSource.entities.values.forEach(entity => {
          const props = entity.properties!.getValue()
          if (!props) return

          const labelConfig = {
            text: props.name || '岛',
            textColor: '#fff', // 原始文字颜色配置
            outlineColor: '#000000',
            outlineWidth: 4, // 原100过大，修正为1
            farDistance: 30000000,
            nearDistance: 2000000,
          }

          // 移除默认点/图标，避免重叠
          entity.billboard = undefined
          entity.point = undefined

          // 关键修正：将 color → fontColor
          entity.label = new Cesium.LabelGraphics({
            text: labelConfig.text,
            font: '20px sans-serif',
            style: Cesium.LabelStyle.FILL_AND_OUTLINE, // 关键：同时显示描边和填充
            outlineColor: Cesium.Color.fromCssColorString(labelConfig.outlineColor),
            outlineWidth: labelConfig.outlineWidth,
            fillColor: Cesium.Color.fromCssColorString(labelConfig.textColor),
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            verticalOrigin: Cesium.VerticalOrigin.CENTER,
          })
        })

        globalLandArcNameRef.current = dataSource.entities.values
      },
    })
  }

  const drawGlobalLandArc = (checked: boolean) => {
    drawGlobalLandArcLine(checked)
    drawGlobalLandArcName(checked)
  }

  const drawGlobalRiftValley = (checked: boolean) => {
    drawGlobalRiftValleyLine(checked)
    drawGlobalRiftValleyName(checked)
  }
  const drawGlobalRiftValleyLine = (checked: boolean) => {
    drawGeometry(checked, globalRiftValleyLineRef, window.$$prefix + '/data/earthquake/global-rift-valley-line.geojson', [], {
      stroke: Cesium.Color.GOLD,
      fill: Cesium.Color.GOLD.withAlpha(0.2),
      strokeWidth: 2,
    })
  }

  const drawGlobalRiftValleyName = (checked: boolean) => {
    drawGeometry(checked, globalRiftValleyNameRef, window.$$prefix + '/data/earthquake/global-rift-valley-name.geojson', [], {
      stroke: Cesium.Color.GOLD,
      fill: Cesium.Color.GOLD.withAlpha(0.2),
      strokeWidth: 2,
      loadedDataCallback(data, dataSource) {
        cameraFlyTo(30.52863705, 2.17257194, 6657107.1, {
          orientation: {
            heading: 1.7763568394002505e-15,
            pitch: -1.5678701498057945,
            roll: 0,
          },
        })

        dataSource.entities.values.forEach(entity => {
          const props = entity.properties!.getValue()
          if (!props) return

          const labelConfig = {
            text: props.name || '',
            textColor: '#fff', // 原始文字颜色配置
            outlineColor: '#000000',
            outlineWidth: 4, // 原100过大，修正为1
            farDistance: 30000000,
            nearDistance: 2000000,
          }

          // 移除默认点/图标，避免重叠
          entity.billboard = undefined
          entity.point = undefined

          // 关键修正：将 color → fontColor
          entity.label = new Cesium.LabelGraphics({
            text: labelConfig.text,
            font: '20px sans-serif',
            style: Cesium.LabelStyle.FILL_AND_OUTLINE, // 关键：同时显示描边和填充
            outlineColor: Cesium.Color.fromCssColorString(labelConfig.outlineColor),
            outlineWidth: labelConfig.outlineWidth,
            fillColor: Cesium.Color.fromCssColorString(labelConfig.textColor),
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            verticalOrigin: Cesium.VerticalOrigin.CENTER,
          })
        })

        globalRiftValleyNameRef.current = dataSource.entities.values
      },
    })
  }

  const cameraFlyTo = (longitude: number, latitude: number, height: number = 4000000, options: any = {}) => {
    viewerRef.current!.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
      ...options,
    })
  }

  useEffect(() => {
    viewerRef.current = mapInstance.current?.getViewer()!

    drawChinaBoundary()

    initGui()

    return () => {
      guiRef.current?.destroy()
    }
  }, [])

  return (
    <>
      {modalContext}
      {notificationContextHolder}
      <CommonMap
        ref={mapInstance}
        defaultCameraFlyToParams={{
          destination: {
            longitude: 105.63717584,
            latitude: 35.63459892,
            height: 6664311.55,
          },
        }}
      ></CommonMap>

      {[showWenchuanEarthquakeWavesCharts].includes(true) && (
        <div className="project-charts-container" style={{ height: '400px' }}>
          {showWenchuanEarthquakeWavesCharts && (
            <WavesCharts
              chartsContainerStyle={{
                width: '100%',
              }}
            ></WavesCharts>
          )}
        </div>
      )}
    </>
  )
}

export default Earthquake
