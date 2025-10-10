import * as Cesium from 'cesium'
import { useEffect, useRef } from 'react'
import WaterPrimitive from '@/utils/plugins/water-primitive'
import * as gui from 'lil-gui'
import SampleLabel from '@/utils/plugins/sample-label'
import { notification } from 'antd'
import landUseType1958 from '@/assets/suzhou-river/land-use-type-1958.png'
import landUseType1989 from '@/assets/suzhou-river/land-use-type-1989.png'
import landUseType2021 from '@/assets/suzhou-river/land-use-type-2021.png'
import ImageText from '@/utils/plugins/image-text'

type SuzhouRiverPropsType = {}

const SuzhouRiver: React.FC<SuzhouRiverPropsType> = props => {
  const [notificationApi, notificationContextHolder] = notification.useNotification()

  const containerRef = useRef<HTMLDivElement>(null)

  const viewerRef = useRef<Cesium.Viewer | null>(null)

  const guiRef = useRef<gui.GUI | null>(null)

  const suzhouRiverWaterPrimitivesRef = useRef<any[]>([])

  const huangpuRiverWaterPrimitivesRef = useRef<any[]>([])

  const wenzaobangWaterPrimitivesRef = useRef<any[]>([])

  const wusongjiangWaterPrimitivesRef = useRef<any[]>([])

  const pointInstanceList = useRef<
    {
      type: string
      data: {
        position: [number, number, number]
        text: string
        instance: SampleLabel | ImageText | null
        key: string
        [key: string]: any
      }[]
    }[]
  >([])

  const suzhouRiverDistrictArea = useRef<Cesium.Entity[]>([])

  /** @description 获取当前相机参数 */
  const getCameraParams = (viewerRef: React.RefObject<Cesium.Viewer | null>) => {
    const camera = viewerRef.current!.camera

    // 获取相机位置（笛卡尔坐标）
    const position = camera.position

    // 获取方向参数
    const heading = camera.heading
    const pitch = camera.pitch
    const roll = camera.roll

    // 转换为经纬度
    const cartographic = Cesium.Cartographic.fromCartesian(position)
    const lon = Cesium.Math.toDegrees(cartographic.longitude)
    const lat = Cesium.Math.toDegrees(cartographic.latitude)
    const height = cartographic.height

    // 生成flyTo代码
    const code = `viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(${lon.toFixed(8)}, ${lat.toFixed(8)}, ${height.toFixed(2)}),
      orientation: {
          heading: ${heading},
          pitch: ${pitch},
          roll: ${roll}
      }
  });`

    console.log(code)

    return code
  }

  const cartesian3ToDegrees = (cartesian: Cesium.Cartesian3, ellipsoid: Cesium.Ellipsoid) => {
    // 如果未指定椭球体，使用默认的WGS84椭球体
    ellipsoid = ellipsoid || Cesium.Ellipsoid.WGS84

    // 将笛卡尔坐标转换为弧度表示的地理坐标（包含经度、纬度和高度）
    const cartographic = ellipsoid.cartesianToCartographic(cartesian)

    // 将弧度转换为度
    const longitude = Cesium.Math.toDegrees(cartographic.longitude)
    const latitude = Cesium.Math.toDegrees(cartographic.latitude)
    const height = cartographic.height

    // 返回转换后的结果
    return {
      longitude: longitude, // 经度（度）
      latitude: latitude, // 纬度（度）
      height: height, // 高度（米）
    }
  }

  const showLandUseType = (value: boolean) => {
    if (value) {
      notificationApi.info({
        style: {
          maxHeight: '100%',
        },
        message: `用地类型分布图`,
        description: (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ display: 'inline-block', width: 20, height: 10, backgroundColor: '#9ed08a' }}></span>农业用地&nbsp;&nbsp;
              <span style={{ display: 'inline-block', width: 20, height: 10, backgroundColor: '#f1718b' }}></span>工业用地&nbsp;&nbsp;
              <span style={{ display: 'inline-block', width: 20, height: 10, backgroundColor: '#00a550' }}></span>城市绿地
            </div>
            <img src={landUseType2021} width={'100%'} alt="" />
            <div style={{ textAlign: 'center' }}>2021年</div>
            <img src={landUseType1989} width={'100%'} alt="" />
            <div style={{ textAlign: 'center' }}>1989年</div>
            <img src={landUseType1958} width={'100%'} alt="" />
            <div style={{ textAlign: 'center' }}>1958年</div>
          </>
        ),
        placement: 'bottomLeft',
        duration: null,
      })
    } else {
      notificationApi.destroy()
    }
  }

  const showSuzhouRiverDetails = (value: boolean) => {
    notificationApi.destroy()
    if (value) {
      notificationApi.info({
        message: `苏州河`,
        description: (
          <div>
            <div style={{ textIndent: '2em' }}>
              <p>苏州河是吴淞江进入上海市区段的俗称。 </p>
              <p>发源于太湖瓜泾口，在上海市区外白渡桥附近汇入黄浦江，全长125公里，上海境内54公里。</p>
              <p>古名“松江”，又因流域在古代吴国境内，故称之为“吴淞江”。</p>
              <p>吴淞江源出太湖瓜泾口，穿过江南运河，流经吴江、昆山、嘉定、青浦等县市，在上海市区外白渡桥附近注入黄浦江。</p>
            </div>
          </div>
        ),
        placement: 'bottomLeft',
        duration: null,
      })
    } else {
      notificationApi.destroy()
    }
  }

  const drawSuzhouRiverDistrictArea = (checked: boolean) => {
    if (checked) {
      if (suzhouRiverDistrictArea.current?.length) {
        suzhouRiverDistrictArea.current.forEach(item => {
          item.show = true
        })
      } else {
        fetch(window.$$prefix + '/data/suzhou-river/district.geojson')
          .then(res => res.json())
          .then(data => {
            Cesium.GeoJsonDataSource.load(data, {
              stroke: Cesium.Color.BROWN.withAlpha(1),
              fill: Cesium.Color.WHITE.withAlpha(0.6),
              strokeWidth: 2,
              markerSymbol: 'circle',
            }).then(function (dataSource) {
              data.features.forEach((item: any) => {
                const position = item.properties.center
                const text = item.properties.name

                const label = viewerRef.current!.entities.add({
                  position: Cesium.Cartesian3.fromDegrees(...(position as [number, number, number])),
                  label: {
                    text: text,
                    font: '20px sans-serif',
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    outlineWidth: 2,
                    outlineColor: Cesium.Color.RED,
                    fillColor: Cesium.Color.YELLOW,
                    disableDepthTestDistance: Number.POSITIVE_INFINITY, // 添加这一行，使标签始终在最前
                  },
                })

                suzhouRiverDistrictArea.current.push(label)
              })

              viewerRef.current!.dataSources.add(dataSource)
              suzhouRiverDistrictArea.current = [...suzhouRiverDistrictArea.current, ...dataSource.entities.values]
            })
          })
      }
    } else {
      suzhouRiverDistrictArea.current!.forEach(item => {
        item.show = false
      })
    }
  }

  const guiControls = {
    drawSuzhouRiverSubsectionPoint: false,
    drawWaterQualitycheckpoint: false,
    drawSuzhouRiverOrganismSamplingPoint: false,
    drawSuzhouRiverUpstreamSegment: false,
    drawSuzhouRiverMidstreamSegment: false,
    drawSuzhouRiverLandUseType: false,
    drawSuzhouRiverOrigin: false,
    drawSuzhouRiverEnding: false,
    drawSuzhouRiverIndustrialHeritage: false,
    drawSuzhouRiverDistrictArea: false,

    getCameraParams: () => {
      getCameraParams(viewerRef)
    },

    history: () => {
      viewerRef.current?.camera.flyTo({ destination: Cesium.Cartesian3.fromDegrees(121.44681124210383, 31.253252971821134, 300) })

      // 添加瓦片图
      const imageryLayer = viewerRef.current!.imageryLayers.addImageryProvider(
        new Cesium.UrlTemplateImageryProvider({
          url: window.$$prefix + '/image/tif-png7/{z}/{x}/{y}.png',
          maximumLevel: 19,
        })
      )

      // 设置右边显示历史影像
      imageryLayer.splitDirection = Cesium.SplitDirection.RIGHT

      // slider 控制
      const slider = document.getElementById('slider')

      slider!.style.display = 'block'

      // @ts-ignore
      viewerRef.current!.scene.splitPosition = 0.5 // 默认中间分割

      let handler = false
      slider!.addEventListener('mousedown', () => (handler = true))
      window.addEventListener('mouseup', () => (handler = false))
      window.addEventListener('mousemove', e => {
        if (!handler) return
        const splitPos = e.clientX / window.innerWidth
        slider!.style.left = splitPos * 100 + '%'
        viewerRef.current!.scene.splitPosition = splitPos
      })
    },
  }

  const initGui = () => {
    if (guiRef.current) {
      guiRef.current.destroy()
      guiRef.current = null
    }

    guiRef.current = new gui.GUI({})

    guiRef.current.title('苏州河')

    const historyControls = guiRef.current.addFolder('历史影像')

    const suzhouRiverAreaControls = guiRef.current.addFolder('区域划分')

    const landUseTypeControls = guiRef.current.addFolder('用地类型')

    const waterQualityControls = guiRef.current.addFolder('水质')

    /*     const soilControls = guiRef.current.addFolder('土壤') */

    const organismControls = guiRef.current.addFolder('生物')

    const industrialHeritageControls = guiRef.current.addFolder('沿岸遗产')

    guiRef.current.add(guiControls, 'getCameraParams').name('获取相机参数')

    /* 历史影像 */
    historyControls.add(guiControls, 'history').name('加载恒丰路历史影像')

    /* 区域划分 */
    suzhouRiverAreaControls
      .add(guiControls, 'drawSuzhouRiverDistrictArea')
      .name('流经区县')
      .onChange((value: boolean) => {
        if (value) {
          viewerRef.current!.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(121.29767651, 31.2244611, 69639.55),
            orientation: {
              heading: 6.283185307179583,
              pitch: -1.5707955853217404,
              roll: 0,
            },
          })
        }
        drawSuzhouRiverDistrictArea(value)
      })

    suzhouRiverAreaControls
      .add(guiControls, 'drawSuzhouRiverOrigin')
      .name('苏州河源头')
      .onChange((value: boolean) => {
        pointInstanceList.current
          .find(item => item.type === 'originAndEndingPoint')
          ?.data.find(item => item.key === 'origin' && item.instance?.toggleVisible(value))

        showSuzhouRiverDetails(value)
        if (value) {
          viewerRef.current!.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(120.69966072, 31.21560048, 2632.72),
            orientation: {
              heading: 4.425380834609057,
              pitch: -0.3008825357266769,
              roll: 0.00005288277165060862,
            },
          })
        }
      })

    suzhouRiverAreaControls
      .add(guiControls, 'drawSuzhouRiverEnding')
      .name('苏州河终点')
      .onChange((value: boolean) => {
        pointInstanceList.current
          .find(item => item.type === 'originAndEndingPoint')
          ?.data.find(item => item.key === 'ending' && item.instance?.toggleVisible(value))
        showSuzhouRiverDetails(value)
        if (value) {
          viewerRef.current!.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(121.44379233, 31.24547954, 1172.35),
            orientation: {
              heading: 1.6800656081066547,
              pitch: -0.15615311443862656,
              roll: 6.283181442675136,
            },
          })
        }
      })

    suzhouRiverAreaControls
      .add(guiControls, 'drawSuzhouRiverSubsectionPoint')
      .name('上下游分界点')
      .onChange((value: boolean) => {
        pointInstanceList.current.find(item => item.type === 'subsection')?.data.forEach(item => item.instance?.toggleVisible(value))

        if (value) {
          viewerRef.current?.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(121.34345294112579, 31.241533962801665, 15000),
          })
        }
      })

    suzhouRiverAreaControls
      .add(guiControls, 'drawSuzhouRiverUpstreamSegment')
      .name('上游段')
      .onChange((value: boolean) => {
        suzhouRiverWaterPrimitivesRef.current[0].appearance.material.uniforms.baseWaterColor = value
          ? Cesium.Color.GREEN.withAlpha(0.6)
          : Cesium.Color.AQUA.withAlpha(0.6)
        if (value) {
          viewerRef.current?.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(121.21475984777767, 31.262530333046115, 15000),
          })
        }
      })

    suzhouRiverAreaControls
      .add(guiControls, 'drawSuzhouRiverMidstreamSegment')
      .name('下游段')
      .onChange((value: boolean) => {
        suzhouRiverWaterPrimitivesRef.current[1].appearance.material.uniforms.baseWaterColor = value
          ? Cesium.Color.TOMATO.withAlpha(0.6)
          : Cesium.Color.AQUA.withAlpha(0.6)
        if (value) {
          viewerRef.current?.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(121.41021285316776, 31.230596040912467, 15000),
          })
        }
      })

    /* 用地类型 */
    landUseTypeControls
      .add(guiControls, 'drawSuzhouRiverLandUseType')
      .name('用地类型分布')
      .onChange((value: boolean) => {
        showLandUseType(value)
      })

    /* 水质 */
    const drawWaterQualitycheckpointControl = waterQualityControls
      .add(guiControls, 'drawWaterQualitycheckpoint')
      .name('水质检测点')
      .onChange((value: boolean) => {
        pointInstanceList.current.find(item => item.type === 'waterQualityCheckpoint')?.data.forEach(item => item.instance?.toggleVisible(value))

        if (value) {
          pointInstanceList.current.find(item => item.type === 'organismSamplingPoint')?.data.forEach(item => item.instance?.toggleVisible(false))
          drawSuzhouRiverOrganismSamplingPointControl.setValue(false)
          drawSuzhouRiverOrganismSamplingPointControl.updateDisplay()

          viewerRef.current?.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(121.2969150311974, 31.247713859928712, 50000),
          })
        }
      })

    /* 生物 */
    const drawSuzhouRiverOrganismSamplingPointControl = organismControls
      .add(guiControls, 'drawSuzhouRiverOrganismSamplingPoint')
      .name('生物采样点')
      .onChange((value: boolean) => {
        pointInstanceList.current.find(item => item.type === 'organismSamplingPoint')?.data.forEach(item => item.instance?.toggleVisible(value))

        if (value) {
          pointInstanceList.current.find(item => item.type === 'waterQualityCheckpoint')?.data.forEach(item => item.instance?.toggleVisible(false))

          drawWaterQualitycheckpointControl.setValue(false)
          drawWaterQualitycheckpointControl.updateDisplay()

          viewerRef.current?.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(121.2969150311974, 31.247713859928712, 50000),
          })
        }
      })

    industrialHeritageControls
      .add(guiControls, 'drawSuzhouRiverIndustrialHeritage')
      .name('工业遗产')
      .onChange((value: boolean) => {
        pointInstanceList.current.find(item => item.type === 'industrialHeritage')?.data.forEach(item => item.instance?.toggleVisible(value))
      })
  }

  const initClickHandler = (viewer: Cesium.Viewer) => {
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)

    handler.setInputAction((movement: { position: Cesium.Cartesian2 }) => {
      // 拾取椭球面上的点
      const cartesian = viewer.camera.pickEllipsoid(movement.position, viewer.scene.globe.ellipsoid)
      if (!cartesian) return

      // 转换为经纬度
      const cartographic = Cesium.Cartographic.fromCartesian(cartesian)
      const lon = Cesium.Math.toDegrees(cartographic.longitude)
      const lat = Cesium.Math.toDegrees(cartographic.latitude)

      // 获取当前相机大致层级
      const zoom = Math.round(Math.log2((2 * Math.PI * 6378137) / viewer.camera.getMagnitude()))

      // 经纬度 → XYZ 瓦片坐标
      const x = Math.floor(((lon + 180) / 360) * Math.pow(2, zoom))
      const y = Math.floor(((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) * Math.pow(2, zoom))

      console.log(`lon=${lon}, lat=${lat}, zoom=${zoom}, x=${x}, y=${y}`)
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
  }

  const addWaterRegion = (positions: any, instance: any[]) => {
    let waterPrimitive = new WaterPrimitive(positions, {
      baseWaterColor: Cesium.Color.AQUA.withAlpha(0.6),
      normalMap: window.$$prefix + '/waterNormalsSmall.jpg',
      frequency: 1000.0,
      animationSpeed: 0.01,
      amplitude: 100,
      specularIntensity: 100,
    })

    viewerRef.current!.scene.primitives.add(waterPrimitive) //添加到场景

    instance.push(waterPrimitive)
  }

  const coordinatesToPositions = (coordinates: any[]) => {
    let positions = [] as any
    coordinates.map(c => {
      positions.push(Cesium.Cartesian3.fromDegrees(c[0], c[1], 0))
    })

    return positions
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
    viewer.scene.globe.showGroundAtmosphere = false;
    viewerRef.current = viewer

    Cesium.createWorldTerrainAsync({ requestVertexNormals: true, requestWaterMask: true }).then(async terrain => {
      viewer.terrainProvider = terrain

      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(121.491185, 31.250281, 25000),
      })
    })
      ; (viewer.cesiumWidget.creditContainer as HTMLDivElement).style.display = 'none'

    fetch(window.$$prefix + '/data/china/china-boundary.geojson')
      .then(res => res.json())
      .then(data => {
        Cesium.GeoJsonDataSource.load(data, {
          stroke: Cesium.Color.BLUE,
          fill: Cesium.Color.BLUE.withAlpha(0.2),
          strokeWidth: 2,
          markerSymbol: 'circle',
        }).then(function (dataSource) {
          viewer.dataSources.add(dataSource)
        })
      })

    fetch(window.$$prefix + '/data/china/shanghai-area.geojson')
      .then(res => res.json())
      .then(data => {
        Cesium.GeoJsonDataSource.load(data, {
          stroke: Cesium.Color.PINK,
          fill: Cesium.Color.PINK.withAlpha(0.2),
          strokeWidth: 2,
          markerSymbol: 'circle',
        }).then(function (dataSource) {
          viewer.dataSources.add(dataSource)
        })
      })

    fetch(window.$$prefix + '/data/suzhou-river/suzhou-river.geojson')
      .then(res => res.json())
      .then(data => {
        data.features.forEach((item: any) => {
          const coordinates = item.geometry.coordinates[0]

          const positions = coordinatesToPositions(coordinates)

          addWaterRegion(positions, suzhouRiverWaterPrimitivesRef.current)
        })
      })

    fetch(window.$$prefix + '/data/suzhou-river/huangpu-river.geojson')
      .then(res => res.json())
      .then(data => {
        data.features.forEach((item: any) => {
          const coordinates = item.geometry.coordinates[0]

          const positions = coordinatesToPositions(coordinates)

          addWaterRegion(positions, huangpuRiverWaterPrimitivesRef.current)
        })
      })

    fetch(window.$$prefix + '/data/suzhou-river/wenzaobang.geojson')
      .then(res => res.json())
      .then(data => {
        data.features.forEach((item: any) => {
          const coordinates = item.geometry.coordinates[0]

          const positions = coordinatesToPositions(coordinates)

          addWaterRegion(positions, wenzaobangWaterPrimitivesRef.current)
        })
      })

    fetch(window.$$prefix + '/data/suzhou-river/wusongjiang-river.geojson')
      .then(res => res.json())
      .then(data => {
        data.features.forEach((item: any) => {
          const coordinates = item.geometry.coordinates[0]

          const positions = coordinatesToPositions(coordinates)

          addWaterRegion(positions, wusongjiangWaterPrimitivesRef.current)
        })
      })

    const texts = [
      {
        text: '苏州河',
        position: [121.43424178657835, 31.264846739529258],
        fontSize: '30px',
      },
      {
        text: '黄埔江',
        position: [121.531185, 31.241281],
        fontSize: '40px',
      },
      {
        text: '蕰藻浜',
        position: [121.17507739975338, 31.297054818748347],
        fontSize: '26px',
      },
      {
        text: '太湖',
        position: [120.42534535422851, 31.18036513944, 1000],
        fontSize: '40px',
      },
    ]

    texts.forEach(item => {
      viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(...(item.position as [number, number, number])),
        label: {
          text: item.text,
          font: item.fontSize + ' sans-serif',
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          outlineWidth: 4,
          outlineColor: Cesium.Color.BLACK,
          fillColor: Cesium.Color.YELLOW,
          disableDepthTestDistance: Number.POSITIVE_INFINITY, // 添加这一行，使标签始终在最前
        },
      })
    })

    initClickHandler(viewer)

    initGui()

    fetch(window.$$prefix + '/data/suzhou-river/points.json')
      .then(res => res.json())
      .then(data => {
        const list = data as {
          data: typeof pointInstanceList.current
        }
        pointInstanceList.current = list.data.map(item => {
          return {
            ...item,
            data: item.data.map(v => {
              const instance =
                v.type === 'SampleLabel'
                  ? new SampleLabel(viewerRef.current!, Cesium.Cartesian3.fromDegrees(...v.position), v.text, {
                    containerBackgroundUrlType: v.containerBackgroundUrlType,
                    defaultVisible: v.defaultVisible,
                    indicationLineColor: v.indicationLineColor,
                    clickCallback() {
                      const [longitude, latitude, height] = v.position

                      viewerRef.current?.camera.flyTo({
                        destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, height + 1500),
                      })
                    },
                  })
                  : v.type === 'ImageText'
                    ? new ImageText(viewerRef.current!, Cesium.Cartesian3.fromDegrees(...v.position), v.image, v.content, {
                      defaultVisible: v.defaultVisible,
                    })
                    : null

              return {
                ...v,
                instance,
              }
            }),
          }
        })
      })

    return () => {
      viewer.destroy()
      guiRef.current?.destroy()
    }
  }, [])

  return (
    <div className="canvas-container">
      {notificationContextHolder}
      <div className="canvas-container-body" ref={containerRef} />
      <div id="slider" style={{ display: 'none' }}></div>
    </div>
  )
}

export default SuzhouRiver
