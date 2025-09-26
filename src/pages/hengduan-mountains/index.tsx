import * as Cesium from 'cesium'
import { useEffect, useRef } from 'react'
import * as gui from 'lil-gui'
import SampleLabel from '@/utils/plugins/sample-label'
import { notification } from 'antd'
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
  drawPanda,
  drawProvince,
  drawQionglaishan,
  drawShalulishan,
  drawShanshu,
  drawTaniantawengshan,
  drawYalongjiangRiver,
  getCameraParams,
  initClickHandler,
  initHigherMountainPonit,
  showGonggashanDetails,
  showPandaDetails,
  showSanjiangbingliuDetails,
  showShanshuDetails,
} from './constance'


const HengduanMountains = () => {
  const containerRef = useRef<HTMLDivElement>(null)
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

  const pandaRef = useRef<Cesium.Model[]>([])

  const shanshuRef = useRef<Cesium.Model[]>([])

  const higherMountainPonitInstanceList = useRef<
    {
      position: Cesium.Cartesian3
      text: string
      instance: SampleLabel
      key: string
    }[]
  >([])


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
    drawShanshu: false,

    drawBoshulaling: false,
    drawTaniantawengshan: false,
    drawMangkangshan: false,
    drawShalulishan: false,
    drawDaxueshan: false,
    drawQionglaishan: false,
    drawMinshan: false,

    getCameraParams: () => {
      getCameraParams(viewerRef)
    },
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

    guiRef.current.add(guiControls, 'getCameraParams').name('获取相机参数')

    const mainAreaControls = guiRef.current.addFolder('主要区域')

    const mainMountainsControls = guiRef.current.addFolder('主要山脉')

    const mainRiverControls = guiRef.current.addFolder('主要河流')

    const climateControls = guiRef.current.addFolder('气候')

    const soilControls = guiRef.current.addFolder('土壤')

    const plantControls = guiRef.current.addFolder('植被')

    const animalsControls = guiRef.current.addFolder('动物')

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
        showGonggashanDetails(value, notificationApi, viewerRef, higherMountainPonitInstanceList)
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
      .name('熊猫')
      .onChange((value: boolean) => {
        drawPanda(value, viewerRef, pandaRef)
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
      .add(guiControls, 'drawShanshu')
      .name('滇冷杉')
      .onChange((value: boolean) => {
        drawShanshu(value, viewerRef, shanshuRef)
        showShanshuDetails(value, notificationApi)
      })
  }

  useEffect(() => {
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

    viewerRef.current = viewer

    Cesium.createWorldTerrainAsync({ requestVertexNormals: true, requestWaterMask: true }).then(async terrain => {
      viewer.terrainProvider = terrain

      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(106.49566264, 33.8076862, 5000000),
      })
    });

    (viewer.cesiumWidget.creditContainer as HTMLDivElement).style.display = 'none'

    drawChinaBoundary(true, viewerRef)
    initClickHandler(viewerRef)
    initGui()
    drawHengduanMountainsDiagram(true, viewerRef, HengduanMountainsDiagramRef)
    initHigherMountainPonit(viewerRef, higherMountainPonitInstanceList)

    return () => {
      viewer.destroy()
      guiRef.current?.destroy()
    }
  }, [])

  return (
    <div className="canvas-container">
      {notificationContextHolder}
      <div className="canvas-container-body" ref={containerRef} />
    </div>
  )
}

export default HengduanMountains
