import * as Cesium from 'cesium'
import { use, useEffect, useRef, useState } from 'react'
import * as gui from 'lil-gui'
import { Button, Drawer, notification, Select } from 'antd'
import {
  drawBoshulaling,
  drawChangjiangRiver,
  drawChinaClimateDistribution,
  drawChinaPlantDistribution,
  drawChinaSoilDistribution,
  drawDaduheRiver,
  drawDaxueshan,
  drawDulongjiangRiver,
  drawJinshajiangRiver,
  drawLancangRiver,
  drawMangkangshan,
  drawMinjiangRiver,
  drawMinshan,
  drawNujiangRiver,
  drawProvince,
  drawQionglaishan,
  drawShalulishan,
  drawTaniantawengshan,
  drawYalongjiangRiver,
  showSanjiangbingliuDetails,
  type sampleLabelType,
  drawVerticalNatureArea,
  showVerticalNatureAreaDetails,
  ResearchLinePositionLijiang,
  ResearchLinePositionTacheng,
  ResearchLinePositionMeiliSnowMountain,
  ResearchLinePositionShangriLa,
  ResearchLinePositionFirstBend,
  cameraFlyTo,
  researchLineBillboards,
  labelConfig,
  otherPositionData,
  GonggaMountain,
  TigerLeapingGorge,
  BiranGorge,
  AnzihePandaReserve,
  AbiesFaxoniana,
  VerticalNatureAreaChart
} from './constance'
import CommonMap, { type CommonMapInstanceType } from '@/components/common-map'

const HengduanMountains = () => {

  const formatterGroupResearchLineBillboards = () => {

    const groups = [] as any[]

    researchLineBillboards.forEach(item => {
      if (!groups.includes(item.properties.groupName)) {
        groups.push(item.properties.groupName)
      }
    })

    return groups.map(groupName => {
      return {
        title: groupName,
        label: groupName,
        options: researchLineBillboards.filter(item => item.properties.groupName === groupName).map(item => {
          return {
            value: item.properties.name,
            label: item.properties.name
          }
        })
      }
    })
  }


  const mapIntance = useRef<CommonMapInstanceType>(null)

  const viewerRef = useRef<Cesium.Viewer | null>(null)

  const [notificationApi, notificationContextHolder] = notification.useNotification()

  const guiRef = useRef<gui.GUI | null>(null)

  const guiControlsInstanceList = useRef<gui.Controller[]>([])

  const provinceRef = useRef<Cesium.Entity[]>([])

  const HengduanMountainsDiagramRef = useRef<Cesium.Entity[]>([])
  const changjiangRiverRef = useRef<Cesium.Entity[]>([])
  const lancangRiverRef = useRef<Cesium.Entity[]>([])
  const nujiangRiverRef = useRef<Cesium.Entity[]>([])
  const dulongjiangRiverRef = useRef<Cesium.Entity[]>([])
  const jinshajiangRiverRef = useRef<Cesium.Entity[]>([])
  const minjiangRiverRef = useRef<Cesium.Entity[]>([])
  const yalongjiangRiverRef = useRef<Cesium.Entity[]>([])
  const daduheRiverRef = useRef<Cesium.Entity[]>([])
  const chinaClimateDistributionRef = useRef<Cesium.Entity[]>([])
  const chinaSoilDistributionRef = useRef<Cesium.Entity[]>([])
  const chinaPlantDistributionRef = useRef<Cesium.Entity[]>([])

  const boshulalingRef = useRef<Cesium.Entity[]>([])
  const taniantawengshanRef = useRef<Cesium.Entity[]>([])
  const mangkangshanRef = useRef<Cesium.Entity[]>([])
  const shalulishanRef = useRef<Cesium.Entity[]>([])
  const daxueshanRef = useRef<Cesium.Entity[]>([])
  const qionglaishanRef = useRef<Cesium.Entity[]>([])
  const minshanRef = useRef<Cesium.Entity[]>([])

  const dianlengshanPointInstanceList = useRef<sampleLabelType[]>([])

  // 垂直自然带
  const verticalNatureAreaRef = useRef<Cesium.Entity[]>([])

  const gonggashanEntityRef = useRef<Cesium.Entity[]>([])
  const hutiaoxiaEntityRef = useRef<Cesium.Entity[]>([])
  const birangxiaguEntityRef = useRef<Cesium.Entity[]>([])
  const pandaEntityRef = useRef<Cesium.Entity[]>([])
  const dianlengshanEntityRef = useRef<Cesium.Entity[]>([])

  const [otherPosition, setOtherPosition] = useState<string | null>(null)

  const researchLinePositionRef = useRef<Cesium.Entity[]>([])

  const [researchLinePosition, setResearchLinePosition] = useState<string | null>(null)

  const drawGeometry = (
    show: boolean,
    ref: React.RefObject<Cesium.Entity[]>,
    url: string,
    options: {
      geoOptions?: Cesium.GeoJsonDataSource.LoadOptions & {
        color?: Cesium.Color
      }

      callbacks?: {
        loadedDataCallback?: (data: any, dataSource: Cesium.GeoJsonDataSource) => void
        useFetchOnlyCallback?: (data: any) => void,
      },
      entities?: {
        texts?: { position: Cesium.Cartesian3; text: string; fontSize?: number; labelOptions?: any }[],
        billboards?: { image: string, imagePosition: Cesium.Cartesian3, billboardOptions?: any, properties?: any }[]
      }
    }
  ) => {

    const geoOptions = options.geoOptions || {}
    const callbacks = options.callbacks || {}
    const entities = options.entities || {}

    if (show) {
      if (ref.current?.length) {
        ref.current.forEach(item => {
          item.show = true
        })
      } else {
        /* 文字 */
        {
          Array.isArray(entities?.texts) && entities.texts.forEach(item => {
            const textEntity = viewerRef.current!.entities.add({
              position: item.position,
              label: {
                text: item.text,
                font: `${item.fontSize || 16}px sans-serif`,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                outlineWidth: 2,
                outlineColor: geoOptions.color || geoOptions.fill?.withAlpha(1),
                fillColor: Cesium.Color.WHITE,
                disableDepthTestDistance: Number.POSITIVE_INFINITY, // 添加这一行，使标签始终在最前
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                verticalOrigin: Cesium.VerticalOrigin.CENTER,
                heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
                ...item.labelOptions,
              },
            })

            ref.current.push(textEntity)
          })
        }

        /* 图片 */
        {
          Array.isArray(entities?.billboards) && entities?.billboards.forEach(item => {
            const billboardEntity = viewerRef.current!.entities.add({
              properties: { position: item.imagePosition, ...item.properties },
              position: item.imagePosition,
              billboard: {
                image: window.$$prefix + item.image,
                disableDepthTestDistance: Number.POSITIVE_INFINITY, // 添加这一行，使标签始终在最前
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                verticalOrigin: Cesium.VerticalOrigin.CENTER,
                heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
                ...item.billboardOptions,
              },
            })

            ref.current.push(billboardEntity)
          })
        }

        if (url) {
          fetch(window.$$prefix + url)
            .then(res => res.json())
            .then(data => {

              if (typeof callbacks?.useFetchOnlyCallback === 'function') {
                callbacks.useFetchOnlyCallback(data)
                return
              }

              Cesium.GeoJsonDataSource.load(data, {
                markerSymbol: 'circle',
                ...geoOptions,
              }).then(function (dataSource) {
                viewerRef.current!.dataSources.add(dataSource)
                ref.current.push(...dataSource.entities.values)

                if (typeof callbacks?.loadedDataCallback === 'function') {
                  callbacks?.loadedDataCallback(data, dataSource)
                }
              })
            })
        }


      }
    } else {
      ref.current!.forEach(item => {
        item.show = false
      })
    }
  }

  const guiControls = {
    drawProvince: false,
    drawHengduanMountainsDiagram: true,
    drawHigherMountainPoint: false,
    drawChangjiangRiver: false,
    drawLancangRiver: false,
    drawNujiangRiver: false,
    drawDulongjiangRiver: false,
    drawJinshajiangRiver: false,
    drawMinjiangRiver: false,
    drawYalongjiangRiver: false,
    drawDaduheRiver: false,
    drawChinaClimateDistribution: false,
    drawChinaSoilDistribution: false,
    drawChinaPlantDistribution: false,
    drawPanda: false,
    drawDianlengshan: false,
    drawVerticalNatureArea: false,

    drawBoshulaling: false,
    drawTaniantawengshan: false,
    drawMangkangshan: false,
    drawShalulishan: false,
    drawDaxueshan: false,
    drawQionglaishan: false,
    drawMinshan: false,
    drawHutiaoxia: false,
    drawBirangxiagu: false,

    drawResearchLine1: false,

    showSanjiangbingliu: () => {
      const allRiverControlsNames = [
        'drawChangjiangRiver',
        'drawLancangRiver',
        'drawNujiangRiver',
        'drawDulongjiangRiver',
        'drawJinshajiangRiver',
        'drawMinjiangRiver',
        'drawYalongjiangRiver',
        'drawDaduheRiver',
      ]

      const sanjiangbingliuControlsNames = ['drawLancangRiver', 'drawNujiangRiver', 'drawJinshajiangRiver']

      allRiverControlsNames.forEach(name => {
        const controlInstance = guiControlsInstanceList.current.find(item => item.property === name)

        if (controlInstance) {
          controlInstance.setValue(sanjiangbingliuControlsNames.includes(controlInstance.property))
          controlInstance.updateDisplay()
        }
      })

      showSanjiangbingliuDetails(true, notificationApi, viewerRef)
    },
  }

  /** @description 创建GUI */
  const initGui = () => {
    if (guiRef.current) {
      guiRef.current.destroy()
      guiRef.current = null
    }

    guiRef.current = new gui.GUI({})

    guiRef.current.title('横断山')

    /*     guiRef.current.add(guiControls, 'getCameraParams').name('获取相机参数') */

    const mainAreaControls = guiRef.current.addFolder('主要区域')

    const mainMountainsControls = guiRef.current.addFolder('主要山脉')

    const mainCanyon = guiRef.current.addFolder('主要峡谷')

    const mainRiverControls = guiRef.current.addFolder('主要河流')

    const verticalNatureAreaControls = guiRef.current.addFolder('垂直自然带')

    const climateControls = guiRef.current.addFolder('气候')

    const soilControls = guiRef.current.addFolder('土壤')

    const plantControls = guiRef.current.addFolder('植被')

    const animalsControls = guiRef.current.addFolder('动物')

    const researchLineControls = guiRef.current.addFolder('研学路线')

    /* 主要区域 */
    mainAreaControls
      .add(guiControls, 'drawProvince')
      .name('相关行政区域')
      .onChange((value: boolean) => {
        drawProvince(value, viewerRef, provinceRef)
      })

    mainAreaControls
      .add(guiControls, 'drawHengduanMountainsDiagram')
      .name('横断山区')
      .onChange((value: boolean) => {
        /* 横断山区 */
        drawGeometry(value, HengduanMountainsDiagramRef, '/data/hengduan-mountains/hengduan-mountains-area.geojson', {
          geoOptions: {
            stroke: Cesium.Color.ORANGE,
            fill: Cesium.Color.ORANGE.withAlpha(0.5),
            strokeWidth: 2,
          },
          entities: {
            texts: [
              {
                text: '横断山区',
                fontSize: 20,
                position: Cesium.Cartesian3.fromDegrees(99.9156783576662, 28.506240020807176),
                labelOptions: {
                  ...labelConfig,
                  fillColor: Cesium.Color.ORANGE,
                }

              }
            ]
          }
        })

      })

    mainAreaControls
      .add(guiControls, 'drawHigherMountainPoint')
      .name('最高峰')
      .onChange((value: boolean) => {
        drawGeometry(
          value,
          gonggashanEntityRef,
          '',
          {
            entities: {
              billboards: otherPositionData.filter(item => item.properties.name === '贡嘎山'),
            }
          }
        )

        if (value) {
          setOtherPosition('贡嘎山')
          cameraFlyTo(101.81087885, 29.52080401, 7599.75, {
            orientation: {
              heading: 0.6762693278851586,
              pitch: -0.042912143092978194,
              roll: 0.0001878768739276282,
            },
          }, viewerRef)
        } else {
          setOtherPosition(null)

        }
      })

    /* 主要山脉 */
    mainMountainsControls
      .add(guiControls, 'drawBoshulaling')
      .name('伯舒拉岭-高黎贡山')
      .onChange((value: boolean) => {
        drawBoshulaling(value, viewerRef, boshulalingRef)
      })

    mainMountainsControls
      .add(guiControls, 'drawTaniantawengshan')
      .name('他念他翁山-怒山')
      .onChange((value: boolean) => {
        drawTaniantawengshan(value, viewerRef, taniantawengshanRef)
      })

    mainMountainsControls
      .add(guiControls, 'drawMangkangshan')
      .name('芒康山-云岭')
      .onChange((value: boolean) => {
        drawMangkangshan(value, viewerRef, mangkangshanRef)
      })

    mainMountainsControls
      .add(guiControls, 'drawShalulishan')
      .name('沙鲁里山')
      .onChange((value: boolean) => {
        drawShalulishan(value, viewerRef, shalulishanRef)
      })

    mainMountainsControls
      .add(guiControls, 'drawDaxueshan')
      .name('大雪山')
      .onChange((value: boolean) => {
        drawDaxueshan(value, viewerRef, daxueshanRef)
      })

    mainMountainsControls
      .add(guiControls, 'drawQionglaishan')
      .name('邛崃山')
      .onChange((value: boolean) => {
        drawQionglaishan(value, viewerRef, qionglaishanRef)
      })

    mainMountainsControls
      .add(guiControls, 'drawMinshan')
      .name('岷山')
      .onChange((value: boolean) => {
        drawMinshan(value, viewerRef, minshanRef)
      })

    /* 主要峡谷 */

    mainCanyon
      .add(guiControls, 'drawHutiaoxia')
      .name('虎跳峡')
      .onChange((value: boolean) => {
        drawGeometry(
          value,
          hutiaoxiaEntityRef,
          '',
          {
            entities: {
              billboards: otherPositionData.filter(item => item.properties.name === '虎跳峡'),
            }
          }
        )

        if (value) {
          setOtherPosition('虎跳峡')
          cameraFlyTo(100.07018355, 27.14659598, 4882.09, {
            orientation: {
              heading: 5.987534848261792,
              pitch: -0.88159552688695,
              roll: 0.000014648022920837889
            }
          }, viewerRef)
        } else {
          setOtherPosition(null)

        }

      })

    mainCanyon
      .add(guiControls, 'drawBirangxiagu')
      .name('碧壤峡谷')
      .onChange((value: boolean) => {
        drawGeometry(
          value,
          birangxiaguEntityRef,
          '',
          {
            entities: {
              billboards: otherPositionData.filter(item => item.properties.name === '碧壤峡谷'),
            }
          }
        )

        if (value) {
          setOtherPosition('碧壤峡谷')
          cameraFlyTo(99.51016045, 28.26774769, 5180.68, {
            orientation: {
              heading: 4.899541959295267,
              pitch: -0.5643747357231286,
              roll: 0.00001208640318672849,
            },
          }, viewerRef)
        } else {
          setOtherPosition(null)

        }
      })

    /* 主要河流 */
    const changjiangControl = mainRiverControls
      .add(guiControls, 'drawChangjiangRiver')
      .name('长江')
      .onChange((value: boolean) => {
        drawChangjiangRiver(value, viewerRef, changjiangRiverRef)
      })

    const dulongjiangControl = mainRiverControls
      .add(guiControls, 'drawDulongjiangRiver')
      .name('独龙江')
      .onChange((value: boolean) => {
        drawDulongjiangRiver(value, viewerRef, dulongjiangRiverRef)
      })

    const nujiangControl = mainRiverControls
      .add(guiControls, 'drawNujiangRiver')
      .name('怒江')
      .onChange((value: boolean) => {
        drawNujiangRiver(value, viewerRef, nujiangRiverRef)
      })

    const lancangjiangControl = mainRiverControls
      .add(guiControls, 'drawLancangRiver')
      .name('澜沧江')
      .onChange((value: boolean) => {
        drawLancangRiver(value, viewerRef, lancangRiverRef)
      })

    const jinshajiangControl = mainRiverControls
      .add(guiControls, 'drawJinshajiangRiver')
      .name('金沙江')
      .onChange((value: boolean) => {
        drawJinshajiangRiver(value, viewerRef, jinshajiangRiverRef)
      })

    const yalongjiangControl = mainRiverControls
      .add(guiControls, 'drawYalongjiangRiver')
      .name('雅砻江')
      .onChange((value: boolean) => {
        drawYalongjiangRiver(value, viewerRef, yalongjiangRiverRef)
      })

    const daduheControl = mainRiverControls
      .add(guiControls, 'drawDaduheRiver')
      .name('大渡河')
      .onChange((value: boolean) => {
        drawDaduheRiver(value, viewerRef, daduheRiverRef)
      })

    const minjiangControl = mainRiverControls
      .add(guiControls, 'drawMinjiangRiver')
      .name('岷江')
      .onChange((value: boolean) => {
        drawMinjiangRiver(value, viewerRef, minjiangRiverRef)
      })

    mainRiverControls.add(guiControls, 'showSanjiangbingliu').name('三江并流')

    guiControlsInstanceList.current.push(changjiangControl)
    guiControlsInstanceList.current.push(dulongjiangControl)
    guiControlsInstanceList.current.push(nujiangControl)
    guiControlsInstanceList.current.push(lancangjiangControl)
    guiControlsInstanceList.current.push(jinshajiangControl)
    guiControlsInstanceList.current.push(yalongjiangControl)
    guiControlsInstanceList.current.push(daduheControl)
    guiControlsInstanceList.current.push(minjiangControl)

    verticalNatureAreaControls
      .add(guiControls, 'drawVerticalNatureArea')
      .name('贡嘎山垂直自然带')
      .onChange((value: boolean) => {
        drawVerticalNatureArea(value, viewerRef, verticalNatureAreaRef)

        setOtherPosition(value ? 'verticalNatureArea' : null)
      })

    /* 气候 */
    climateControls
      .add(guiControls, 'drawChinaClimateDistribution')
      .name('相关气候分布')
      .onChange((value: boolean) => {
        drawChinaClimateDistribution(value, viewerRef, chinaClimateDistributionRef)
      })

    /* 土壤分布 */
    soilControls
      .add(guiControls, 'drawChinaSoilDistribution')
      .name('相关土壤分布')
      .onChange((value: boolean) => {
        drawChinaSoilDistribution(value, viewerRef, chinaSoilDistributionRef)
      })

    /* 动物分布 */
    animalsControls
      .add(guiControls, 'drawPanda')
      .name('鞍子河大熊猫自然保护区')
      .onChange((value: boolean) => {
        drawGeometry(
          value,
          pandaEntityRef,
          '',
          {
            entities: {
              billboards: otherPositionData.filter(item => item.properties.name === '鞍子河大熊猫自然保护区'),
            }
          }
        )

        if (value) {
          setOtherPosition('鞍子河大熊猫自然保护区')
          cameraFlyTo(103.12073346936057, 31.043327963060108, 300000, {
          }, viewerRef)
        } else {
          setOtherPosition(null)

        }
      })

    /* 植被分布 */
    plantControls
      .add(guiControls, 'drawChinaPlantDistribution')
      .name('相关植被分布')
      .onChange((value: boolean) => {
        drawChinaPlantDistribution(value, viewerRef, chinaPlantDistributionRef)
      })

    /* 典型植被 */
    const typeicalPlantControls = plantControls.addFolder('典型植被')

    typeicalPlantControls
      .add(guiControls, 'drawDianlengshan')
      .name('滇冷杉')
      .onChange((value: boolean) => {

        drawGeometry(
          value,
          dianlengshanEntityRef,
          '',
          {
            entities: {
              billboards: otherPositionData.filter(item => item.properties.name === '滇冷杉'),
            }
          }
        )

        if (value) {
          setOtherPosition('滇冷杉')
          cameraFlyTo(99.9101808782321, 27.409176945433586, 300000, {
          }, viewerRef)
        } else {
          setOtherPosition(null)

        }
      })

    researchLineControls
      .add(guiControls, 'drawResearchLine1')
      .name('丽江-塔城-梅里雪山-香格里拉')
      .onChange((value: boolean) => {
        drawGeometry(
          value,
          researchLinePositionRef,
          '/data/hengduan-mountains/researchLine1.geojson',
          {
            geoOptions: {
              stroke: Cesium.Color.fromCssColorString('#FF0000'),
              fill: Cesium.Color.fromCssColorString('#FF0000').withAlpha(0.8),
              strokeWidth: 4,
              clampToGround: true,
            },
            entities: {
              billboards: researchLineBillboards
            }
          }
        )

        if (value) {
          cameraFlyTo(0, 0, 0, {
            destination: Cesium.Cartesian3.fromDegrees(100.26481423, 26.47924395, 34771.12),
            orientation: {
              heading: 6.010600549860722,
              pitch: -0.3759492281203336,
              roll: 0.000034991829664932084,
            },
          }, viewerRef)
        }

      })
  }

  const selectAndClickResearchLine = (name: string) => {

    const currentSelect = researchLineBillboards.find(item => item.properties.name === name)!
    const position = currentSelect?.imagePosition!
    const cartographic = Cesium.Cartographic.fromCartesian(position)
    const longitude = Cesium.Math.toDegrees(cartographic.longitude)
    const latitude = Cesium.Math.toDegrees(cartographic.latitude)
    const height = cartographic.height

    if (typeof currentSelect.properties.callback === 'function') {
      currentSelect.properties.callback(viewerRef)
    } else {
      cameraFlyTo(longitude, latitude, height + 15000, {}, viewerRef)
    }
    setResearchLinePosition(name)
  }

  const clickOtherPosition = (name: string) => {

    const currentSelect = otherPositionData.find(item => item.properties.name === name)!

    const position = currentSelect?.imagePosition!
    const cartographic = Cesium.Cartographic.fromCartesian(position)
    const longitude = Cesium.Math.toDegrees(cartographic.longitude)
    const latitude = Cesium.Math.toDegrees(cartographic.latitude)
    const height = cartographic.height

    if (typeof currentSelect.properties?.callback === 'function') {
      currentSelect.properties.callback(viewerRef)
    } else {
      cameraFlyTo(longitude, latitude, height + 15000, {}, viewerRef)
    }

    setOtherPosition(name)
  }

  useEffect(() => {
    viewerRef.current = mapIntance.current?.getViewer()!

    // 深度测试
    viewerRef.current.scene.globe.depthTestAgainstTerrain = false

    /* 国家边界 */
    drawGeometry(true, { current: [] }, '/data/china/china-boundary.geojson', {
      geoOptions: {
        stroke: Cesium.Color.YELLOW,
        fill: Cesium.Color.YELLOW.withAlpha(0.2),
        strokeWidth: 2,
      }
    })

    /* 横断山区 */
    drawGeometry(true, HengduanMountainsDiagramRef, '/data/hengduan-mountains/hengduan-mountains-area.geojson', {
      geoOptions: {
        stroke: Cesium.Color.ORANGE,
        fill: Cesium.Color.ORANGE.withAlpha(0.5),
        strokeWidth: 2,
      },
      entities: {
        texts: [
          {
            text: '横断山区',
            fontSize: 20,
            position: Cesium.Cartesian3.fromDegrees(99.9156783576662, 28.506240020807176),
            labelOptions: {
              ...labelConfig,
              fillColor: Cesium.Color.ORANGE,
            }

          }
        ]
      }
    })

    initGui()

    const handler = new Cesium.ScreenSpaceEventHandler(viewerRef.current!.scene.canvas)

    handler.setInputAction(function (event: Cesium.ScreenSpaceEventHandler.PositionedEvent) {
      const picked = viewerRef.current!.scene.pick(event.position)

      if (Cesium.defined(picked)) {
        if (picked.id instanceof Cesium.Entity) {
          const entity = picked.id as Cesium.Entity

          if (typeof entity.properties === 'object') {

            if (!!entity.properties!.type) {

              if (entity.properties!.type.getValue() === 'researchLine-position' && !!entity.properties!.name) {

                const name = entity.properties!.name.getValue()

                selectAndClickResearchLine(name)

              }

              if (entity.properties!.type.getValue() === 'other-position' && !!entity.properties!.name) {

                const name = entity.properties!.name.getValue()

                clickOtherPosition(name)
              }

            }
          }


        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    return () => {
      guiRef.current?.destroy()
    }
  }, [])

  return (
    <>
      {' '}
      {notificationContextHolder}


      <CommonMap
        ref={mapIntance}
        terrainInitCallback={() => {
          viewerRef.current!.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(106.47433746783226, 35.22179132388041, 8000000),
          })
        }}
      ></CommonMap>
      {
        <Drawer
          width={400}
          placement="left"
          mask={false}
          maskClosable={false}
          open={!!otherPosition}
          getContainer={false}
          closeIcon={<></>}
          zIndex={2551}
          afterOpenChange={(open) => {
            if (open) {
              setResearchLinePosition(null)
            }
          }}
          footer={
            <div style={{ textAlign: 'right' }}>
              <Button type='default' onClick={() => {
                setOtherPosition(null)
              }}>关闭</Button>
            </div>}
          styles={
            {
              body: {
                padding: 0
              }
            }
          }
          onClose={() => setOtherPosition(null)}>
          {
            otherPosition === '贡嘎山' && <GonggaMountain></GonggaMountain>
          }
          {
            otherPosition === '虎跳峡' && <TigerLeapingGorge></TigerLeapingGorge>
          }
          {
            otherPosition === '碧壤峡谷' && <BiranGorge></BiranGorge>
          }
          {
            otherPosition === '鞍子河大熊猫自然保护区' && <AnzihePandaReserve></AnzihePandaReserve>
          }
          {
            otherPosition === '滇冷杉' && <AbiesFaxoniana></AbiesFaxoniana>
          }
          {
            otherPosition === 'verticalNatureArea' && <VerticalNatureAreaChart otherPosition={otherPosition}></VerticalNatureAreaChart>
          }
        </Drawer>
      }

      {
        <Drawer
          width={400}
          placement="left"
          mask={false}
          maskClosable={false}
          open={!!researchLinePosition}
          getContainer={false}
          zIndex={2551}
          afterOpenChange={(open) => {

            if (open) {
              setOtherPosition(null)
            }
          }}
          closeIcon={<></>}
          footer={
            <div style={{ textAlign: 'right' }}>
              <Button type='default' onClick={() => {
                setResearchLinePosition(null)
              }}>关闭</Button>
            </div>}
          extra={<>
            <Select value={researchLinePosition} style={{ width: 180 }} options={formatterGroupResearchLineBillboards()} onChange={(e) => {
              selectAndClickResearchLine(e)
            }}></Select>
          </>}
          styles={
            {
              body: {
                padding: 0
              }
            }
          }
          onClose={() => setResearchLinePosition(null)}>
          {
            researchLinePosition === '丽江' && <ResearchLinePositionLijiang></ResearchLinePositionLijiang>
          }
          {
            researchLinePosition === '塔城' && <ResearchLinePositionTacheng></ResearchLinePositionTacheng>
          }
          {
            researchLinePosition === '梅里雪山' && <ResearchLinePositionMeiliSnowMountain></ResearchLinePositionMeiliSnowMountain>
          }
          {
            researchLinePosition === '香格里拉' && <ResearchLinePositionShangriLa></ResearchLinePositionShangriLa>
          }
          {
            researchLinePosition === '长江第一湾观景台' && <ResearchLinePositionFirstBend></ResearchLinePositionFirstBend>
          }
          {
            researchLinePosition === '虎跳峡' && <TigerLeapingGorge></TigerLeapingGorge>
          }
        </Drawer>
      }




    </>
  )
}

export default HengduanMountains
