import * as Cesium from 'cesium'
import { useEffect, useRef, useState } from 'react'
import * as gui from 'lil-gui'
import SampleLabel from '@/utils/plugins/sample-label'
import { notification, Slider } from 'antd'
import landUseType1958 from '@/assets/suzhou-river/land-use-type-1958.png'
import landUseType1989 from '@/assets/suzhou-river/land-use-type-1989.png'
import landUseType2021 from '@/assets/suzhou-river/land-use-type-2021.png'
import ImageText from '@/utils/plugins/image-text'
import type { CommonMapInstanceType } from '@/components/common-map'
import CommonMap from '@/components/common-map'
import { addWaterRegion, coordinatesToPositions } from './constance'
import WaterQualityCharts from './water-quality-charts'
import { debounce } from 'lodash'
import './index.css'
import FishCharts from './fish-charts'
import Images from './images'

type SuzhouRiverPropsType = {}

const defaultMinYear = 1986
const defaultMaxYear = 2021
const SuzhouRiver: React.FC<SuzhouRiverPropsType> = props => {
  const mapInstance = useRef<CommonMapInstanceType>(null)

  const [notificationApi, notificationContextHolder] = notification.useNotification()

  const viewerRef = useRef<Cesium.Viewer | null>(null)

  const guiRef = useRef<gui.GUI | null>(null)

  const [showTimeLine, setShowTimeLine] = useState<string[]>([])

  const [year, setYear] = useState<number>(defaultMinYear)

  const suzhouRiverWaterPrimitivesRef = useRef<any[]>([])

  const huangpuRiverWaterPrimitivesRef = useRef<any[]>([])

  const wenzaobangWaterPrimitivesRef = useRef<any[]>([])

  const wusongjiangWaterPrimitivesRef = useRef<any[]>([])

  const [showSuzhouRiverWaterQualityCharts, setShowSuzhouRiverWaterQualityCharts] = useState<boolean>(false)

  const [showSuzhouRiverFishCharts, setShowSuzhouRiverFishCharts] = useState<boolean>(false)

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

  const suzhouRiverDistrictAreaRef = useRef<Cesium.Entity[]>([])

  const suzhouRiverBoxRef = useRef<Cesium.Entity[]>([])

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
              viewerRef.current!.dataSources.add(dataSource)
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
    drawGeometry(checked, suzhouRiverDistrictAreaRef, window.$$prefix + '/data/suzhou-river/district.geojson', [], {
      stroke: Cesium.Color.BROWN.withAlpha(1),
      fill: Cesium.Color.WHITE.withAlpha(0.6),
      strokeWidth: 2,
      loadedDataCallback(data) {
        data.features.forEach((item: any) => {
          const position = item.properties.center
          const text = item.properties.name

          const label = viewerRef.current!.entities.add({
            position: Cesium.Cartesian3.fromDegrees(...(position as [number, number, number])),
            label: {
              text: text,
              font: '20px sans-serif',
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              outlineWidth: 4,
              outlineColor: Cesium.Color.BLACK,
              fillColor: Cesium.Color.YELLOW,
              disableDepthTestDistance: Number.POSITIVE_INFINITY, // 添加这一行，使标签始终在最前
            },
          })

          suzhouRiverDistrictAreaRef.current.push(label)
        })
      },
    })
  }

  const handleLandUseBox = () => {
    if (!showTimeLine.includes('landUse')) return

    suzhouRiverBoxRef.current.forEach(item => {
      item.show = false
    })

    if (year < 1989) {
      suzhouRiverBoxRef.current
        .filter(item => {
          return item.properties!.year < 1989
        })
        .forEach(item => {
          item.show = true
        })
    } else if (year >= 1989 && year < 2021) {
      suzhouRiverBoxRef.current
        .filter(item => {
          return item.properties!.year >= 1989 && item.properties!.year < 2021
        })
        .forEach(item => {
          item.show = true
        })
    } else if (year >= 2021) {
      suzhouRiverBoxRef.current
        .filter(item => {
          return item.properties!.year >= 2021
        })
        .forEach(item => {
          item.show = true
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
    drawWaterQualitycheckCharts: false,
    drawSuzhouRiverLandUseTypeTimeline: false,

    drawFishChangeCharts: false,

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
    /* 
        const historyControls = guiRef.current.addFolder('历史影像') */

    const suzhouRiverAreaControls = guiRef.current.addFolder('区域划分')

    const landUseTypeControls = guiRef.current.addFolder('用地类型')

    const waterQualityControls = guiRef.current.addFolder('水质')

    /*     const soilControls = guiRef.current.addFolder('土壤') */

    const organismControls = guiRef.current.addFolder('生物')

    const industrialHeritageControls = guiRef.current.addFolder('沿岸遗产')

    /* 历史影像 */
    /*     historyControls.add(guiControls, 'history').name('加载恒丰路历史影像') */

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

    landUseTypeControls
      .add(guiControls, 'drawSuzhouRiverLandUseTypeTimeline')
      .name('用地类型历年分布')
      .onChange((value: boolean) => {
        setYear(defaultMinYear)

        if (value) {
          setShowTimeLine(prev => {
            return [...prev, 'landUse']
          })

          viewerRef.current!.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(121.42319435, 31.24046338, 13696.69),
            orientation: {
              heading: 6.283185307179581,
              pitch: -1.5707961669977455,
              roll: 0,
            },
          })
        } else {
          setShowTimeLine(prev => {
            return [...prev].filter(item => item !== 'landUse')
          })

          suzhouRiverBoxRef.current.forEach(item => {
            item.show = false
          })
        }
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

    waterQualityControls
      .add(guiControls, 'drawWaterQualitycheckCharts')
      .name('水质变化历年图表')
      .onChange((value: boolean) => {
        setYear(defaultMinYear)
        setShowSuzhouRiverWaterQualityCharts(value)

        if (value) {
          setShowTimeLine(prev => {
            return [...prev, 'waterQuality']
          })
        } else {
          setShowTimeLine(prev => {
            return [...prev].filter(item => item !== 'waterQuality')
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

    organismControls
      .add(guiControls, 'drawFishChangeCharts')
      .name('鱼类种类变化历年图表')
      .onChange((value: boolean) => {
        setYear(2001)
        setShowSuzhouRiverFishCharts(value)
        if (value) {
          setShowTimeLine(prev => {
            return [...prev, 'fish']
          })
        } else {
          setShowTimeLine(prev => {
            return [...prev].filter(item => item !== 'fish')
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

  const drawRiver = (
    url: string,
    ref: React.RefObject<any[]>,
    options?: {
      loadDataCallback?: (data: any) => void
    }
  ) => {
    fetch(url)
      .then(res => res.json())
      .then(data => {
        data.features.forEach((item: any) => {
          const coordinates = item.geometry.coordinates[0]
          const positions = coordinatesToPositions(coordinates)
          addWaterRegion(positions, ref.current, viewerRef)
        })

        if (typeof options?.loadDataCallback === 'function') {
          options.loadDataCallback(data)
        }
      })
  }

  useEffect(() => {
    viewerRef.current = mapInstance.current?.getViewer()!

    drawGeometry(true, { current: [] }, window.$$prefix + '/data/china/china-boundary.geojson', [], {
      stroke: Cesium.Color.BROWN,
      fill: Cesium.Color.BROWN.withAlpha(0.2),
      strokeWidth: 4,
    })

    drawGeometry(true, { current: [] }, window.$$prefix + '/data/china/shanghai-area.geojson', [], {
      stroke: Cesium.Color.YELLOW,
      fill: Cesium.Color.TRANSPARENT,
      strokeWidth: 3,
    })

    drawRiver(window.$$prefix + '/data/suzhou-river/suzhou-river.geojson', suzhouRiverWaterPrimitivesRef, {})
    drawRiver(window.$$prefix + '/data/suzhou-river/huangpu-river.geojson', huangpuRiverWaterPrimitivesRef)
    drawRiver(window.$$prefix + '/data/suzhou-river/wenzaobang.geojson', wenzaobangWaterPrimitivesRef)
    drawRiver(window.$$prefix + '/data/suzhou-river/wusongjiang-river.geojson', wusongjiangWaterPrimitivesRef)

    const landUseYear = [1958, 1989, 2021]

    landUseYear.forEach(year => {
      drawGeometry(true, suzhouRiverBoxRef, window.$$prefix + `/data/suzhou-river/land-use-${year}.geojson`, [], {
        stroke: Cesium.Color.TRANSPARENT,
        fill: Cesium.Color.BROWN,
        strokeWidth: 4,
        loadedDataCallback(data, dataSource) {
          dataSource.entities.values.forEach(entity => {
            entity.show = false
            entity.properties!.year = year
            // 获取自定义属性
            const use = entity.properties!.use.getValue()

            const useColor = {
              '1': '#9dcf88',
              '2': '#ed6f8a',
              '3': '#05a552',
            }
            // @ts-ignore
            entity.polygon.material = Cesium.Color.fromCssColorString(useColor[use + '']).withAlpha(0.7)
          })
        },
      })
    })

    const texts = [
      {
        text: '苏州河',
        position: [121.43424178657835, 31.264846739529258],
        fontSize: '30px',
      },
      {
        text: '黄浦江',
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
      viewerRef.current?.entities.add({
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
                    ? new ImageText(viewerRef.current!, Cesium.Cartesian3.fromDegrees(...v.position), window.$$prefix + v.image, v.content, {
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
      guiRef.current?.destroy()
    }
  }, [])

  useEffect(() => {
    if (showTimeLine.includes('landUse')) {
      handleLandUseBox()
    }
  }, [year, showTimeLine])

  return (
    <>
      {notificationContextHolder}
      {showTimeLine.length > 0 && (
        <div className="suzhou-river-timeline-container">
          {/*           <div className='suzhou-river-timeline-title'>时间轴</div> */}
          <div className="suzhou-river-timeline">
            <Slider
              styles={{
                track: {
                  backgroundColor: 'transparent',
                },
                tracks: {
                  background: '#00b96b',
                },
                handle: {
                  backgroundColor: '#fff',
                },
              }}
              marks={{
                1986: '1986',
                1990: '1990',
                1995: '1995',
                2000: '2000',
                2005: '2005',
                2010: '2010',
                2015: '2015',
                2020: '2020',
                2021: '2021',
              }}
              step={1}
              value={year}
              min={defaultMinYear}
              max={defaultMaxYear}
              onChange={debounce(value => {
                setYear(() => {
                  return value
                })
              }, 300)}
            />
          </div>
        </div>
      )}
      <CommonMap
        pickToolsList={['default_perspective', 'zoom_out', 'zoom_in', 'area_contour', 'draw_polygon', 'draw_line', 'measure_distance', 'profile_analysis']}
        ref={mapInstance}
        defaultCameraFlyToParams={{
          destination: {
            longitude: 121.491185,
            latitude: 31.250281,
            height: 25000,
          },
        }}
      ></CommonMap>
      <div id="slider" style={{ display: 'none' }}></div>
      {[showSuzhouRiverWaterQualityCharts, showSuzhouRiverFishCharts].includes(true) && (
        <div className="project-charts-container" style={{ width: '100%', maxWidth: '90%' }}>
          {showSuzhouRiverWaterQualityCharts && (
            <WaterQualityCharts
              year={year}
              chartsContainerStyle={{
                width: '33.3%',
              }}
            ></WaterQualityCharts>
          )}
          {showSuzhouRiverWaterQualityCharts && (
            <Images
              year={year}
              chartsContainerStyle={{
                width: '33.3%',
              }}
            ></Images>
          )}
          {showSuzhouRiverFishCharts && (
            <FishCharts
              year={year}
              chartsContainerStyle={{
                width: '33.3%',
              }}
            ></FishCharts>
          )}
        </div>
      )}
    </>
  )
}

export default SuzhouRiver
