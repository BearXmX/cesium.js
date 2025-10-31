import * as Cesium from 'cesium'
import { useEffect, useRef, useState } from 'react'
import * as gui from 'lil-gui'
import { Drawer, notification, Select } from 'antd'
import {
  drawBoshulaling,
  drawChangjiangRiver,
  drawChinaBoundary,
  drawChinaClimateDistribution,
  drawChinaPlantDistribution,
  drawChinaSoilDistribution,
  drawDaduheRiver,
  drawDaxueshan,
  drawDulongjiangRiver,
  drawHengduanMountainsDiagram,
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
  initHigherMountainPoint,
  initPandaPoint,
  showGonggashanDetails,
  showPandaDetails,
  showSanjiangbingliuDetails,
  showDianlengshanDetails,
  initDianlengshanPoint,
  type sampleLabelType,
  initCanyonPoint,
  drawVerticalNatureArea,
  showVerticalNatureAreaDetails,
  ResearchLinePositionLijiang,
  ResearchLinePositionTacheng,
  ResearchLinePositionMeiliSnowMountain,
  ResearchLinePositionShangriLa,
} from './constance'
import CommonMap, { type CommonMapInstanceType } from '@/components/common-map'

const HengduanMountains = () => {
  const researchLineBillboards = [
    {
      image: window.$$prefix + '/position-icon-red.svg',
      position: Cesium.Cartesian3.fromDegrees(100.21145191081905, 26.90612625295651),
      properties: {
        type: 'researchLine-position',
        name: '丽江',
      },
    },
    {
      image: window.$$prefix + '/position-icon-red.svg',
      position: Cesium.Cartesian3.fromDegrees(99.56055050339569, 27.485840446748455),
      properties: {
        type: 'researchLine-position',
        name: '塔城',
      },
    },
    {
      image: window.$$prefix + '/position-icon-red.svg',
      position: Cesium.Cartesian3.fromDegrees(98.97064059974441, 28.52937522819254),
      properties: {
        type: 'researchLine-position',
        name: '梅里雪山',
      }
    },
    {
      image: window.$$prefix + '/position-icon-red.svg',
      position: Cesium.Cartesian3.fromDegrees(99.70038240115997, 27.843065988387632),
      properties: {
        type: 'researchLine-position',
        name: '香格里拉',
      },
    },
  ]

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

  const higherMountainPointInstanceList = useRef<sampleLabelType[]>([])

  const pandaPointInstanceList = useRef<sampleLabelType[]>([])

  const dianlengshanPointInstanceList = useRef<sampleLabelType[]>([])
  const canyonPointInstanceList = useRef<sampleLabelType[]>([])

  // 垂直自然带
  const verticalNatureAreaRef = useRef<Cesium.Entity[]>([])

  const researchLine1Ref = useRef<Cesium.Entity[]>([])

  const [researchLinePosition, setResearchLinePosition] = useState<string | null>(null)

  const cameraFlyTo = (longitude: number, latitude: number, height: number = 4000000, options: any = {}) => {
    viewerRef.current!.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
      ...options,
    })
  }

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
        billboards?: { image: string, position: Cesium.Cartesian3, billboardOptions?: any, properties?: any }[]
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
        fetch(url)
          .then(res => res.json())
          .then(data => {
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
                  properties: { position: item.position, ...item.properties },
                  position: item.position,
                  billboard: {
                    image: item.image,
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
    } else {
      ref.current!.forEach(item => {
        item.show = false
      })
    }
  }

  const guiControls = {
    drawProvince: false,
    drawHengduanMountainsDiagram: false,
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
        drawHengduanMountainsDiagram(value, viewerRef, HengduanMountainsDiagramRef)
      })

    mainAreaControls
      .add(guiControls, 'drawHigherMountainPoint')
      .name('最高峰')
      .onChange((value: boolean) => {
        showGonggashanDetails(value, notificationApi, viewerRef, higherMountainPointInstanceList)
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
        canyonPointInstanceList.current.find(item => item.key === 'hutiaoxia' && item.instance?.toggleVisible(value))

        if (value) {
          viewerRef.current!.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(100.07703196, 27.14042416, 3002.85),
            orientation: {
              heading: 5.919684370219261,
              pitch: -0.28394899801853324,
              roll: 6.2831255385928255,
            },
          })
        }
      })

    mainCanyon
      .add(guiControls, 'drawBirangxiagu')
      .name('碧壤峡谷')
      .onChange((value: boolean) => {
        canyonPointInstanceList.current.find(item => item.key === 'birangxiagu' && item.instance?.toggleVisible(value))

        if (value) {
          viewerRef.current!.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(99.51016045, 28.26774769, 5180.68),
            orientation: {
              heading: 4.899541959295267,
              pitch: -0.5643747357231286,
              roll: 0.00001208640318672849,
            },
          })
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
        drawVerticalNatureArea(value, viewerRef, verticalNatureAreaRef, higherMountainPointInstanceList)

        showVerticalNatureAreaDetails(value, notificationApi)
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
      .name('大熊猫分布')
      .onChange((value: boolean) => {
        if (value) {
          viewerRef.current?.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(103.12073346936057, 31.043327963060108, 300000),
          })
        }
        pandaPointInstanceList.current.forEach(item => item.instance?.toggleVisible(value))
        showPandaDetails(value, notificationApi)
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
        if (value) {
          viewerRef.current?.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(99.9101808782321, 27.409176945433586, 300000),
          })
        }

        dianlengshanPointInstanceList.current.forEach(item => item.instance?.toggleVisible(value))
        showDianlengshanDetails(value, notificationApi)
        /*         showDianlengshanDetails(value, notificationApi) */
      })

    researchLineControls
      .add(guiControls, 'drawResearchLine1')
      .name('丽江-塔城-梅里雪山-香格里拉')
      .onChange((value: boolean) => {
        drawGeometry(
          value,
          researchLine1Ref,
          window.$$prefix + '/data/hengduan-mountains/researchLine1.geojson',
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

        cameraFlyTo(0, 0, 0, {
          destination: Cesium.Cartesian3.fromDegrees(100.26481423, 26.47924395, 34771.12),
          orientation: {
            heading: 6.010600549860722,
            pitch: -0.3759492281203336,
            roll: 0.000034991829664932084,
          },
        })
      })
  }

  useEffect(() => {
    viewerRef.current = mapIntance.current?.getViewer()!

    drawChinaBoundary(true, viewerRef)
    initGui()
    /*     drawHengduanMountainsDiagram(true, viewerRef, HengduanMountainsDiagramRef) */
    initHigherMountainPoint(viewerRef, higherMountainPointInstanceList)
    initPandaPoint(viewerRef, pandaPointInstanceList)
    initDianlengshanPoint(viewerRef, dianlengshanPointInstanceList)
    initCanyonPoint(viewerRef, canyonPointInstanceList)

    const handler = new Cesium.ScreenSpaceEventHandler(viewerRef.current!.scene.canvas)

    handler.setInputAction(function (event: Cesium.ScreenSpaceEventHandler.PositionedEvent) {
      const picked = viewerRef.current!.scene.pick(event.position)

      if (Cesium.defined(picked)) {
        if (picked.id instanceof Cesium.Entity) {
          const entity = picked.id as Cesium.Entity

          if (!!entity.properties!.type) {
            if (entity.properties!.type.getValue() === 'researchLine-position' && !!entity.properties!.name) {

              const name = entity.properties!.name.getValue()

              setResearchLinePosition(name)

              const position = entity.properties!.position.getValue() as Cesium.Cartesian3
              const cartographic = Cesium.Cartographic.fromCartesian(position)
              const longitude = Cesium.Math.toDegrees(cartographic.longitude)
              const latitude = Cesium.Math.toDegrees(cartographic.latitude)
              const height = cartographic.height

              cameraFlyTo(longitude, latitude, height + 10000)

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
            destination: Cesium.Cartesian3.fromDegrees(106.49566264, 33.8076862, 5000000),
          })
        }}
      ></CommonMap>

      <Drawer
        width={400}
        placement="left"
        zIndex={2551}
        mask={false}
        maskClosable={false}
        open={!!researchLinePosition}
        getContainer={false}
        extra={<>
          <Select value={researchLinePosition} style={{ width: 100 }} options={researchLineBillboards.map((item, index) => {
            return {
              value: item.properties.name,
              label: item.properties.name
            }
          })} onChange={(e) => {
            const position = researchLineBillboards.find(item => item.properties.name === e)?.position!
            const cartographic = Cesium.Cartographic.fromCartesian(position)
            const longitude = Cesium.Math.toDegrees(cartographic.longitude)
            const latitude = Cesium.Math.toDegrees(cartographic.latitude)
            const height = cartographic.height

            cameraFlyTo(longitude, latitude, height + 15000)

            setResearchLinePosition(e)

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
      </Drawer>


    </>
  )
}

export default HengduanMountains
