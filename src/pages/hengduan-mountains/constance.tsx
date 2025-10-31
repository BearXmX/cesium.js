import SampleLabel from '@/utils/plugins/sample-label'
import type { NotificationInstance } from 'antd/es/notification/interface'
import * as Cesium from 'cesium'
import Panda from './panda'
import Dianlengshan from './dianlengshan'
import VerticalNatureArea from '@/assets/nature-area.png'
import { Carousel } from 'antd'

export type sampleLabelType = {
  position: Cesium.Cartesian3
  text: string
  instance: SampleLabel
  key: string
}

/** @description 文字配置 */
export const labelConfig = {
  fillColor: Cesium.Color.WHITE,
  outlineColor: Cesium.Color.BLACK, // 黑色描边，增加可读性
  outlineWidth: 3,
  pixelOffset: new Cesium.Cartesian2(0, 0),
  style: Cesium.LabelStyle.FILL_AND_OUTLINE,
  scale: 1.0,
  horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
  verticalOrigin: Cesium.VerticalOrigin.CENTER,
  showBackground: true,
  backgroundColor: Cesium.Color.BLACK.withAlpha(0.6),
  backgroundPadding: new Cesium.Cartesian2(6, 4),
  disableDepthTestDistance: Number.POSITIVE_INFINITY, // 添加这一行，使标签始终在最前
}

/** @description 绘制国界 */
export const drawChinaBoundary = (checked: boolean, viewerRef: React.RefObject<Cesium.Viewer | null>) => {
  if (checked) {
    fetch(window.$$prefix + '/data/china/china-boundary.geojson')
      .then(res => res.json())
      .then(data => {
        Cesium.GeoJsonDataSource.load(data, {
          stroke: Cesium.Color.BROWN,
          fill: Cesium.Color.BROWN.withAlpha(0.2),
          strokeWidth: 2,
          markerSymbol: 'circle',
        }).then(function (dataSource) {
          viewerRef.current!.dataSources.add(dataSource)
        })
      })
  }
}

/** @description 横断山区 */
export const drawHengduanMountainsDiagram = (
  checked: boolean,
  viewerRef: React.RefObject<Cesium.Viewer | null>,
  HengduanMountainsDiagramRef: React.RefObject<Cesium.Entity[]>
) => {
  if (checked) {
    if (HengduanMountainsDiagramRef.current?.length) {
      HengduanMountainsDiagramRef.current.forEach(item => {
        item.show = true
      })
    } else {

      fetch(window.$$prefix + '/data/hengduan-mountains/hengduan-mountains-area.geojson')
        .then(res => res.json())
        .then(data => {
          Cesium.GeoJsonDataSource.load(data, {
            stroke: Cesium.Color.ORANGE,
            fill: Cesium.Color.ORANGE.withAlpha(0.5),
            strokeWidth: 2,
            markerSymbol: 'circle',
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)
            HengduanMountainsDiagramRef.current = dataSource.entities.values

            HengduanMountainsDiagramRef.current.push(
              viewerRef.current!.entities.add({
                position: Cesium.Cartesian3.fromDegrees(99.9156783576662, 28.506240020807176),
                label: {
                  text: '横断山区',
                  font: '20px sans-serif',
                  ...labelConfig,
                  fillColor: Cesium.Color.ORANGE,
                },
              })
            )
          })
        })
    }
  } else {
    HengduanMountainsDiagramRef.current!.forEach(item => {
      item.show = false
    })
  }
}

/** @description 长江 */
export const drawChangjiangRiver = (
  checked: boolean,
  viewerRef: React.RefObject<Cesium.Viewer | null>,
  changjiangRiverRef: React.RefObject<Cesium.Entity[]>
) => {
  if (checked) {
    viewerRef.current!.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(107.7708852, 31.14346632, 3527892.68),
      orientation: {
        heading: 6.283185307179581,
        pitch: -1.5705328303764619,
        roll: 0,
      },
    })

    if (changjiangRiverRef.current?.length) {
      changjiangRiverRef.current.forEach(item => {
        item.show = true
      })
    } else {
      fetch(window.$$prefix + '/data/hengduan-mountains/changjiang-river.geojson')
        .then(res => res.json())
        .then(data => {
          Cesium.GeoJsonDataSource.load(data, {
            stroke: Cesium.Color.AQUA,
            fill: Cesium.Color.AQUA.withAlpha(1),
            strokeWidth: 2,
            markerSymbol: 'circle',
            clampToGround: true, // 贴地
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)

            changjiangRiverRef.current = dataSource.entities.values

            changjiangRiverRef.current.push(
              viewerRef.current!.entities.add({
                position: Cesium.Cartesian3.fromDegrees(109.84480653636214, 31.676271014964506),
                label: {
                  text: '长江',
                  font: '20px sans-serif',
                  ...labelConfig,
                  fillColor: Cesium.Color.AQUA,
                },
              })
            )
          })
        })
    }
  } else {
    changjiangRiverRef.current!.forEach(item => {
      item.show = false
    })
  }
}

/** @description 澜沧江 */
export const drawLancangRiver = (
  checked: boolean,
  viewerRef: React.RefObject<Cesium.Viewer | null>,
  lancangRiverRef: React.RefObject<Cesium.Entity[]>
) => {
  if (checked) {
    viewerRef.current!.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(102.90680454, 30.20169249, 3527892.68),
      orientation: {
        heading: 6.2831853071795845,
        pitch: -1.5702702380948708,
        roll: 0,
      },
    })

    if (lancangRiverRef.current?.length) {
      lancangRiverRef.current.forEach(item => {
        item.show = true
      })
    } else {
      fetch(window.$$prefix + '/data/hengduan-mountains/lancang-river.geojson')
        .then(res => res.json())
        .then(data => {
          Cesium.GeoJsonDataSource.load(data, {
            stroke: Cesium.Color.AQUA,
            fill: Cesium.Color.AQUA.withAlpha(1),
            strokeWidth: 2,
            markerSymbol: 'circle',
            clampToGround: true, // 贴地
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)

            lancangRiverRef.current = dataSource.entities.values

            lancangRiverRef.current.push(
              viewerRef.current!.entities.add({
                position: Cesium.Cartesian3.fromDegrees(95.60080485634482, 33.66363160959343),
                label: {
                  text: '澜沧江',
                  font: '20px sans-serif',
                  ...labelConfig,
                  fillColor: Cesium.Color.AQUA,
                },
              })
            )
          })
        })
    }
  } else {
    lancangRiverRef.current!.forEach(item => {
      item.show = false
    })
  }
}

/** @description 怒江 */
export const drawNujiangRiver = (
  checked: boolean,
  viewerRef: React.RefObject<Cesium.Viewer | null>,
  nujiangRiverRef: React.RefObject<Cesium.Entity[]>
) => {
  if (checked) {
    viewerRef.current!.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(96.03191605, 28.98714853, 3527892.68),
      orientation: {
        heading: 6.283185307179586,
        pitch: -1.5705376995527884,
        roll: 0,
      },
    })

    if (nujiangRiverRef.current?.length) {
      nujiangRiverRef.current.forEach(item => {
        item.show = true
      })
    } else {
      fetch(window.$$prefix + '/data/hengduan-mountains/nujiang-river.geojson')
        .then(res => res.json())
        .then(data => {
          Cesium.GeoJsonDataSource.load(data, {
            stroke: Cesium.Color.AQUA,
            fill: Cesium.Color.AQUA.withAlpha(1),
            strokeWidth: 2,
            markerSymbol: 'circle',
            clampToGround: true, // 贴地
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)

            nujiangRiverRef.current = dataSource.entities.values

            nujiangRiverRef.current.push(
              viewerRef.current!.entities.add({
                position: Cesium.Cartesian3.fromDegrees(92.03880869555387, 32.2995521335205),
                label: {
                  text: '怒江',
                  font: '20px sans-serif',
                  ...labelConfig,
                  fillColor: Cesium.Color.AQUA,
                },
              })
            )
          })
        })
    }
  } else {
    nujiangRiverRef.current!.forEach(item => {
      item.show = false
    })
  }
}

/** @description 独龙江 */
export const drawDulongjiangRiver = (
  checked: boolean,
  viewerRef: React.RefObject<Cesium.Viewer | null>,
  dulongjiangRiverRef: React.RefObject<Cesium.Entity[]>
) => {
  if (checked) {
    viewerRef.current!.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(98.59137891, 28.33325205, 715131.0),
      orientation: {
        heading: 6.283185307179586,
        pitch: -1.5703325312386975,
        roll: 0,
      },
    })

    if (dulongjiangRiverRef.current?.length) {
      dulongjiangRiverRef.current.forEach(item => {
        item.show = true
      })
    } else {
      fetch(window.$$prefix + '/data/hengduan-mountains/dulongjiang-river.geojson')
        .then(res => res.json())
        .then(data => {
          Cesium.GeoJsonDataSource.load(data, {
            stroke: Cesium.Color.AQUA,
            fill: Cesium.Color.AQUA.withAlpha(1),
            strokeWidth: 2,
            markerSymbol: 'circle',
            clampToGround: true, // 贴地
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)

            dulongjiangRiverRef.current = dataSource.entities.values
            dulongjiangRiverRef.current.push(
              viewerRef.current!.entities.add({
                position: Cesium.Cartesian3.fromDegrees(97.84652837218303, 28.107092478607957),
                label: {
                  text: '独龙江',
                  font: '20px sans-serif',
                  ...labelConfig,
                  fillColor: Cesium.Color.AQUA,
                },
              })
            )
          })
        })
    }
  } else {
    dulongjiangRiverRef.current!.forEach(item => {
      item.show = false
    })
  }
}

/** @description 金沙江 */
export const drawJinshajiangRiver = (
  checked: boolean,
  viewerRef: React.RefObject<Cesium.Viewer | null>,
  jinshajiangRiverRef: React.RefObject<Cesium.Entity[]>
) => {
  if (checked) {
    viewerRef.current!.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(102.90680454, 30.20169249, 3527892.68),
      orientation: {
        heading: 6.2831853071795845,
        pitch: -1.5702702380948708,
        roll: 0,
      },
    })

    if (jinshajiangRiverRef.current?.length) {
      jinshajiangRiverRef.current.forEach(item => {
        item.show = true
      })
    } else {
      fetch(window.$$prefix + '/data/hengduan-mountains/jinshajiang-river.geojson')
        .then(res => res.json())
        .then(data => {
          Cesium.GeoJsonDataSource.load(data, {
            stroke: Cesium.Color.AQUA,
            fill: Cesium.Color.AQUA.withAlpha(1),
            strokeWidth: 2,
            markerSymbol: 'circle',
            clampToGround: true, // 贴地
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)

            jinshajiangRiverRef.current = dataSource.entities.values

            jinshajiangRiverRef.current.push(
              viewerRef.current!.entities.add({
                position: Cesium.Cartesian3.fromDegrees(97.6058095014923, 33.02908771838989),
                label: {
                  text: '金沙江',
                  font: '20px sans-serif',
                  ...labelConfig,
                  fillColor: Cesium.Color.AQUA,
                },
              })
            )
          })
        })
    }
  } else {
    jinshajiangRiverRef.current!.forEach(item => {
      item.show = false
    })
  }
}

/** @description 岷江 */
export const drawMinjiangRiver = (
  checked: boolean,
  viewerRef: React.RefObject<Cesium.Viewer | null>,
  minjiangRiverRef: React.RefObject<Cesium.Entity[]>
) => {
  if (checked) {
    viewerRef.current!.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(102.59084722, 29.99187433, 3527892.68),
      orientation: {
        heading: 8.881784197001252e-16,
        pitch: -1.5705984938492015,
        roll: 0,
      },
    })

    if (minjiangRiverRef.current?.length) {
      minjiangRiverRef.current.forEach(item => {
        item.show = true
      })
    } else {
      fetch(window.$$prefix + '/data/hengduan-mountains/minjiang-river.geojson')
        .then(res => res.json())
        .then(data => {
          Cesium.GeoJsonDataSource.load(data, {
            stroke: Cesium.Color.AQUA,
            fill: Cesium.Color.AQUA.withAlpha(1),
            strokeWidth: 2,
            markerSymbol: 'circle',
            clampToGround: true, // 贴地
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)

            minjiangRiverRef.current = dataSource.entities.values

            minjiangRiverRef.current.push(
              viewerRef.current!.entities.add({
                position: Cesium.Cartesian3.fromDegrees(104.03353796391211, 31.029147766652784),
                label: {
                  text: '岷江',
                  font: '20px sans-serif',
                  ...labelConfig,
                  fillColor: Cesium.Color.AQUA,
                },
              })
            )
          })
        })
    }
  } else {
    minjiangRiverRef.current!.forEach(item => {
      item.show = false
    })
  }
}

/** @description 雅砻江 */
export const drawYalongjiangRiver = (
  checked: boolean,
  viewerRef: React.RefObject<Cesium.Viewer | null>,
  yalongjiangRiverRef: React.RefObject<Cesium.Entity[]>
) => {
  if (checked) {
    viewerRef.current!.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(98.49758224, 31.11454042, 3527892.68),
      orientation: {
        heading: 6.283185307179586,
        pitch: -1.5707504947616706,
        roll: 0,
      },
    })

    if (yalongjiangRiverRef.current?.length) {
      yalongjiangRiverRef.current.forEach(item => {
        item.show = true
      })
    } else {
      fetch(window.$$prefix + '/data/hengduan-mountains/yalongjiang-river.geojson')
        .then(res => res.json())
        .then(data => {
          Cesium.GeoJsonDataSource.load(data, {
            stroke: Cesium.Color.AQUA,
            fill: Cesium.Color.AQUA.withAlpha(1),
            strokeWidth: 2,
            markerSymbol: 'circle',
            clampToGround: true, // 贴地
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)

            yalongjiangRiverRef.current = dataSource.entities.values
            yalongjiangRiverRef.current.push(
              viewerRef.current!.entities.add({
                position: Cesium.Cartesian3.fromDegrees(98.2699798471984, 33.62221082027084),
                label: {
                  text: '雅砻江',
                  font: '20px sans-serif',
                  ...labelConfig,
                  fillColor: Cesium.Color.AQUA,
                },
              })
            )
          })
        })
    }
  } else {
    yalongjiangRiverRef.current!.forEach(item => {
      item.show = false
    })
  }
}

/** @description 大渡河 */
export const drawDaduheRiver = (
  checked: boolean,
  viewerRef: React.RefObject<Cesium.Viewer | null>,
  daduheRiverRef: React.RefObject<Cesium.Entity[]>
) => {
  if (checked) {
    viewerRef.current!.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(101.60958657, 31.47050878, 3527892.68),
      orientation: {
        heading: 6.283185307179586,
        pitch: -1.570685025933066,
        roll: 0,
      },
    })

    if (daduheRiverRef.current?.length) {
      daduheRiverRef.current.forEach(item => {
        item.show = true
      })
    } else {
      fetch(window.$$prefix + '/data/hengduan-mountains/daduhe-river.geojson')
        .then(res => res.json())
        .then(data => {
          Cesium.GeoJsonDataSource.load(data, {
            stroke: Cesium.Color.AQUA,
            fill: Cesium.Color.AQUA.withAlpha(1),
            strokeWidth: 2,
            markerSymbol: 'circle',
            clampToGround: true, // 贴地
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)

            daduheRiverRef.current = dataSource.entities.values

            daduheRiverRef.current.push(
              viewerRef.current!.entities.add({
                position: Cesium.Cartesian3.fromDegrees(101.18501373694866, 33.02592772285958),
                label: {
                  text: '大渡河',
                  font: '20px sans-serif',
                  ...labelConfig,
                  fillColor: Cesium.Color.AQUA,
                },
              })
            )
          })
        })
    }
  } else {
    daduheRiverRef.current!.forEach(item => {
      item.show = false
    })
  }
}

/** @description 相关省域 */
export const drawProvince = (checked: boolean, viewerRef: React.RefObject<Cesium.Viewer | null>, provinceRef: React.RefObject<Cesium.Entity[]>) => {
  if (checked) {
    viewerRef.current!.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(98.81428905, 30.26172082, 3156200.7),
      orientation: {
        heading: 6.283185307179586,
        pitch: -1.5703325312410912,
        roll: 0,
      },
    })

    if (provinceRef.current?.length) {
      provinceRef.current.forEach(item => {
        item.show = true
      })
    } else {
      fetch(window.$$prefix + '/data/hengduan-mountains/province.geojson')
        .then(res => res.json())
        .then(data => {
          Cesium.GeoJsonDataSource.load(data, {
            stroke: Cesium.Color.PINK,
            fill: Cesium.Color.PINK.withAlpha(0.5),
            strokeWidth: 0.5,
            markerSymbol: 'circle',
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)

            provinceRef.current = dataSource.entities.values

            const provinceNames = [
              {
                text: '西藏',
                position: Cesium.Cartesian3.fromDegrees(87.80433606069074, 31.28797794125832),
              },
              {
                text: '四川',
                position: Cesium.Cartesian3.fromDegrees(105.64506790860854, 31.491911447835545),
              },
              {
                text: '云南',
                position: Cesium.Cartesian3.fromDegrees(101.76608100350815, 24.12377274429042),
              },
            ]

            const provinceNamesInstance = provinceNames.map(item => {
              // 绘制文字
              return viewerRef.current!.entities.add({
                position: item.position,
                label: {
                  text: item.text,
                  font: '20px sans-serif',
                  style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                  outlineWidth: 2,
                  outlineColor: Cesium.Color.BLACK,
                  fillColor: Cesium.Color.WHITE,
                  disableDepthTestDistance: Number.POSITIVE_INFINITY, // 添加这一行，使标签始终在最前
                },
              })
            })

            provinceRef.current.push(...provinceNamesInstance)
          })
        })
    }
  } else {
    provinceRef.current!.forEach(item => {
      item.show = false
    })
  }
}

/** @description 气候分布 */
export const drawChinaClimateDistribution = (
  checked: boolean,
  viewerRef: React.RefObject<Cesium.Viewer | null>,
  chinaClimateDistributionRef: React.RefObject<Cesium.Entity[]>
) => {
  if (checked) {
    viewerRef.current!.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(105.90676345, 35.09453359, 5884376.89),
      orientation: {
        heading: 6.283185307179586,
        pitch: -1.5707398108470874,
        roll: 0,
      },
    })

    if (chinaClimateDistributionRef.current?.length) {
      chinaClimateDistributionRef.current.forEach(item => {
        item.show = true
      })
    } else {
      fetch(window.$$prefix + '/data/china/china-climate-distribution.geojson')
        .then(res => res.json())
        .then(data => {
          // 为5种气候类型定义颜色方案
          const climateColors: any = {
            高原山地气候: {
              fill: Cesium.Color.fromCssColorString('#4A90E2').withAlpha(0.6), // 冷蓝色
              stroke: Cesium.Color.fromCssColorString('#2C5AA0'),
              textPosition: [92.09404483908936, 34.53784283747934],
            },
            热带季风气候: {
              fill: Cesium.Color.fromCssColorString('#FF6B6B').withAlpha(0.6), // 暖红色
              stroke: Cesium.Color.fromCssColorString('#D64545'),
              textPosition: [100.81780521173025, 22.46855638524489],
            },
            温带大陆性气候: {
              fill: Cesium.Color.fromCssColorString('#FFA726').withAlpha(0.6), // 橙色
              stroke: Cesium.Color.fromCssColorString('#F57C00'),
              textPosition: [107.72144131427258, 40.440585432301184],
            },
            亚热带季风气候: {
              fill: Cesium.Color.fromCssColorString('#66BB6A').withAlpha(0.6), // 绿色
              stroke: Cesium.Color.fromCssColorString('#388E3C'),
              textPosition: [109.47667037219985, 29.4584931073585],
            },
            温带季风气候: {
              fill: Cesium.Color.fromCssColorString('#AB47BC').withAlpha(0.6), // 紫色
              stroke: Cesium.Color.fromCssColorString('#8E24AA'),
              textPosition: [112.99830415726292, 36.593583520746385],
            },
          }

          // 获取所有唯一的名称
          const uniqueNames = [...new Set(data.features.map((feature: any) => feature.properties.name))]

          Cesium.GeoJsonDataSource.load(data, {
            stroke: Cesium.Color.BLACK.withAlpha(0),
            strokeWidth: 0,
            fill: Cesium.Color.WHITE.withAlpha(0),
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)

            const entities = dataSource.entities.values
            chinaClimateDistributionRef.current = entities

            // 根据气候类型设置颜色
            entities.forEach(entity => {
              const climateType = entity.name
              if (climateType && climateColors[climateType]) {
                const colorScheme = climateColors[climateType]
                if (entity.polygon) {
                  entity.polygon.material = colorScheme.fill
                  // @ts-ignore
                  entity.polygon.outline = false
                  entity.polygon.outlineColor = colorScheme.stroke
                  // @ts-ignore
                  entity.polygon.outlineWidth = 0
                }
              }
            })

            // 添加文字标签
            Object.keys(climateColors).forEach(climateType => {
              const colorScheme = climateColors[climateType]
              if (colorScheme.textPosition) {
                const [longitude, latitude] = colorScheme.textPosition

                // 创建文字标签
                const text = viewerRef.current!.entities.add({
                  position: Cesium.Cartesian3.fromDegrees(longitude, latitude),
                  label: {
                    text: climateType,
                    font: '16pt Microsoft YaHei', // 使用微软雅黑字体，更清晰
                    ...labelConfig,
                  },
                })

                chinaClimateDistributionRef.current.push(text)
              }
            })

            console.log('气候分布分类:', uniqueNames)
          })
        })
    }
  } else {
    chinaClimateDistributionRef.current!.forEach(item => {
      item.show = false
    })
  }
}

/* 土壤分布 */
export const drawChinaSoilDistribution = (
  checked: boolean,
  viewerRef: React.RefObject<Cesium.Viewer | null>,
  chinaSoilDistributionRef: React.RefObject<Cesium.Entity[]>
) => {
  if (checked) {
    viewerRef.current!.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(105.90676345, 35.09453359, 5884376.89),
      orientation: {
        heading: 6.283185307179586,
        pitch: -1.5707398108470874,
        roll: 0,
      },
    })

    if (chinaSoilDistributionRef.current?.length) {
      chinaSoilDistributionRef.current.forEach(item => {
        item.show = true
      })
    } else {
      fetch(window.$$prefix + '/data/china/china-soil-distribution.geojson')
        .then(res => res.json())
        .then(data => {
          // 为土壤类型定义颜色方案
          const soilColors: any = {
            砖红壤: {
              fill: Cesium.Color.fromCssColorString('#8B4513').withAlpha(0.6), // 红棕色
              stroke: Cesium.Color.fromCssColorString('#654321'),
              textPosition: [109.60266864561984, 18.925205005894433], // 海南附近
            },
            灰漠土: {
              fill: Cesium.Color.fromCssColorString('#A9A9A9').withAlpha(0.6), // 灰色
              stroke: Cesium.Color.fromCssColorString('#696969'),
              textPosition: [85.0, 45.0], // 新疆北部
            },
            棕漠土: {
              fill: Cesium.Color.fromCssColorString('#D2691E').withAlpha(0.6), // 棕色
              stroke: Cesium.Color.fromCssColorString('#8B4513'),
              textPosition: [90.0, 40.0], // 新疆南部
            },
            黑钙土: {
              fill: Cesium.Color.fromCssColorString('#2F4F4F').withAlpha(0.6), // 深灰色
              stroke: Cesium.Color.fromCssColorString('#000000'),
              textPosition: [111.19799358960789, 40.26795863764495], // 内蒙古东部
            },
            亚高山草原土带: {
              fill: Cesium.Color.fromCssColorString('#61fd61ff').withAlpha(0.6), // 淡绿色
              stroke: Cesium.Color.fromCssColorString('#556B2F'),
              textPosition: [88.9329247937849, 28.597591991570404], // 青藏高原
            },
            灰钙土: {
              fill: Cesium.Color.fromCssColorString('#D3D3D3').withAlpha(0.6), // 浅灰色
              stroke: Cesium.Color.fromCssColorString('#A9A9A9'),
              textPosition: [102.59440658804448, 36.02267693298963], // 甘肃、宁夏
            },
            黑土: {
              fill: Cesium.Color.fromCssColorString('#2F2F2F').withAlpha(0.6), // 近黑色
              stroke: Cesium.Color.fromCssColorString('#000000'),
              textPosition: [128.99970312431063, 45.634047159130965], // 东北地区
            },
            寒棕土: {
              fill: Cesium.Color.fromCssColorString('#8B7355').withAlpha(0.6), // 冷棕色
              stroke: Cesium.Color.fromCssColorString('#696969'),
              textPosition: [122.94437565648104, 52.214359020658], // 黑龙江北部
            },
            棕壤: {
              fill: Cesium.Color.fromCssColorString('#A0522D').withAlpha(0.6), // 标准棕色
              stroke: Cesium.Color.fromCssColorString('#8B4513'),
              textPosition: [115.0, 35.0], // 华北地区
            },
            黄棕壤: {
              fill: Cesium.Color.fromCssColorString('#DAA520').withAlpha(0.6), // 黄棕色
              stroke: Cesium.Color.fromCssColorString('#B8860B'),
              textPosition: [113.66903286043595, 31.508797605755067], // 长江中下游
            },
            赤红壤: {
              fill: Cesium.Color.fromCssColorString('#DC143C').withAlpha(0.6), // 赤红色
              stroke: Cesium.Color.fromCssColorString('#B22222'),
              textPosition: [100.68825517044883, 23.042228682822703], // 广东、广西
            },
            红壤: {
              fill: Cesium.Color.fromCssColorString('#CD5C5C').withAlpha(0.6), // 红色
              stroke: Cesium.Color.fromCssColorString('#B22222'),
              textPosition: [115.0, 26.0], // 福建、江西
            },
            高山漠土带: {
              fill: Cesium.Color.fromCssColorString('#708090').withAlpha(0.6), // 石板灰色
              stroke: Cesium.Color.fromCssColorString('#2F4F4F'),
              textPosition: [78.44630649651444, 36.17994722511998], // 青藏高原西部
            },
            亚高山漠土带: {
              fill: Cesium.Color.fromCssColorString('#46525eff').withAlpha(0.6), // 浅石板灰色
              stroke: Cesium.Color.fromCssColorString('#696969'),
              textPosition: [79.97242147078896, 33.4684656396256], // 青藏高原中部
            },
            高山草原土带: {
              fill: Cesium.Color.fromCssColorString('#4d4545ff').withAlpha(0.6), // 淡绿色
              stroke: Cesium.Color.fromCssColorString('#32CD32'),
              textPosition: [85.91594544886775, 32.84534541395958], // 青藏高原东部
            },
            高山草甸土带: {
              fill: Cesium.Color.fromCssColorString('#115311ff').withAlpha(0.6), // 草绿色
              stroke: Cesium.Color.fromCssColorString('#3CB371'),
              textPosition: [97.3786945658124, 34.218864101076356], // 青藏高原东南部
            },
          }

          // 获取所有唯一的名称
          const uniqueNames = [...new Set(data.features.map((feature: any) => feature.properties.name))]

          Cesium.GeoJsonDataSource.load(data, {
            stroke: Cesium.Color.BLACK.withAlpha(0),
            strokeWidth: 0,
            fill: Cesium.Color.WHITE.withAlpha(0),
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)

            const entities = dataSource.entities.values
            chinaSoilDistributionRef.current = entities // 假设您有这个引用

            // 根据土壤类型设置颜色
            entities.forEach(entity => {
              const soilType = entity.name
              if (soilType && soilColors[soilType]) {
                const colorScheme = soilColors[soilType]
                if (entity.polygon) {
                  entity.polygon.material = colorScheme.fill
                  // @ts-ignore
                  entity.polygon.outline = false
                  entity.polygon.outlineColor = colorScheme.stroke
                  // @ts-ignore
                  entity.polygon.outlineWidth = 0
                }
              }
            })

            // 添加土壤类型文字标签
            Object.keys(soilColors).forEach(soilType => {
              const colorScheme = soilColors[soilType]
              if (colorScheme.textPosition) {
                const [longitude, latitude] = colorScheme.textPosition

                // 创建文字标签
                const text = viewerRef.current!.entities.add({
                  position: Cesium.Cartesian3.fromDegrees(longitude, latitude),
                  label: {
                    text: soilType,
                    font: '14pt Microsoft YaHei', // 稍小一点的字体，因为名称较长
                    ...labelConfig,
                  },
                })

                chinaSoilDistributionRef.current.push(text)
              }
            })

            console.log('土壤分布分类:', uniqueNames)
          })
        })
    }
  } else {
    chinaSoilDistributionRef.current!.forEach(item => {
      item.show = false
    })
  }
}

/** @description 植被分布 */
export const drawChinaPlantDistribution = (
  checked: boolean,
  viewerRef: React.RefObject<Cesium.Viewer | null>,
  chinaPlantDistributionRef: React.RefObject<Cesium.Entity[]>
) => {
  if (checked) {
    viewerRef.current!.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(105.90676345, 35.09453359, 5884376.89),
      orientation: {
        heading: 6.283185307179586,
        pitch: -1.5707398108470874,
        roll: 0,
      },
    })

    if (chinaPlantDistributionRef.current?.length) {
      chinaPlantDistributionRef.current.forEach(item => {
        item.show = true
      })
    } else {
      fetch(window.$$prefix + '/data/china/china-plant-distribution.geojson')
        .then(res => res.json())
        .then(data => {
          // 为植被带类型定义颜色方案
          const plantColors: any = {
            温带荒漠带: {
              fill: Cesium.Color.fromCssColorString('#F0E68C').withAlpha(0.6), // 沙黄色
              stroke: Cesium.Color.fromCssColorString('#DAA520'),
              textPosition: [85.0, 42.0], // 新疆荒漠地区
            },
            热带雨林带: {
              fill: Cesium.Color.fromCssColorString('#005900').withAlpha(0.6), // 深绿色
              stroke: Cesium.Color.fromCssColorString('#006400'),
              textPosition: [110.0, 18.0], // 海南、西双版纳
            },
            寒温带针叶林: {
              fill: Cesium.Color.fromCssColorString('#91a098ff').withAlpha(0.6), // 海绿色
              stroke: Cesium.Color.fromCssColorString('#1E5B3A'),
              textPosition: [122.0, 52.0], // 大兴安岭北部
            },
            温带针叶阔叶林: {
              fill: Cesium.Color.fromCssColorString('#3CB371').withAlpha(0.6), // 中绿色
              stroke: Cesium.Color.fromCssColorString('#2E8B57'),
              textPosition: [129.9085890708368, 45.408358156786555], // 小兴安岭、长白山
            },
            温带草原带: {
              fill: Cesium.Color.fromCssColorString('#486d48ff').withAlpha(0.6), // 浅绿色
              stroke: Cesium.Color.fromCssColorString('#6B8E23'),
              textPosition: [112.0, 44.0], // 内蒙古草原
            },
            暖温带落叶阔叶林: {
              fill: Cesium.Color.fromCssColorString('#32CD32').withAlpha(0.6), // 黄绿色
              stroke: Cesium.Color.fromCssColorString('#228B22'),
              textPosition: [115.0, 36.0], // 华北地区
            },
            亚热带常绿阔叶林: {
              fill: Cesium.Color.fromCssColorString('#008000').withAlpha(0.6), // 纯绿色
              stroke: Cesium.Color.fromCssColorString('#006400'),
              textPosition: [115.0, 28.0], // 长江以南地区
            },
            高原植被: {
              fill: Cesium.Color.fromCssColorString('#969696ff').withAlpha(0.6), // 淡绿色
              stroke: Cesium.Color.fromCssColorString('#7CFC00'),
              textPosition: [92.0, 32.0], // 青藏高原
            },
          }

          // 获取所有唯一的名称
          const uniqueNames = [...new Set(data.features.map((feature: any) => feature.properties.name))]

          Cesium.GeoJsonDataSource.load(data, {
            stroke: Cesium.Color.BLACK.withAlpha(0),
            strokeWidth: 0,
            fill: Cesium.Color.WHITE.withAlpha(0),
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)

            const entities = dataSource.entities.values
            chinaPlantDistributionRef.current = entities // 假设您有这个引用

            // 根据植被带类型设置颜色
            entities.forEach(entity => {
              const vegetationType = entity.name
              if (vegetationType && plantColors[vegetationType]) {
                const colorScheme = plantColors[vegetationType]
                if (entity.polygon) {
                  entity.polygon.material = colorScheme.fill
                  // @ts-ignore
                  entity.polygon.outline = false
                  entity.polygon.outlineColor = colorScheme.stroke
                  // @ts-ignore
                  entity.polygon.outlineWidth = 0
                }
              }
            })

            // 添加植被带类型文字标签
            Object.keys(plantColors).forEach(vegetationType => {
              const colorScheme = plantColors[vegetationType]
              if (colorScheme.textPosition) {
                const [longitude, latitude] = colorScheme.textPosition

                // 创建文字标签
                const text = viewerRef.current!.entities.add({
                  position: Cesium.Cartesian3.fromDegrees(longitude, latitude),
                  label: {
                    text: vegetationType,
                    font: '14pt Microsoft YaHei',
                    ...labelConfig,
                  },
                })

                chinaPlantDistributionRef.current.push(text)
              }
            })

            console.log('植被带分布分类:', uniqueNames)
          })
        })
    }
  } else {
    chinaPlantDistributionRef.current!.forEach(item => {
      item.show = false
    })
  }
}

/** @description  滇冷杉介绍*/
export const showDianlengshanDetails = (value: boolean, notificationApi: NotificationInstance) => {
  notificationApi.destroy()
  if (value) {
    notificationApi.info({
      message: `滇冷杉`,
      description: (
        <div>
          <div style={{ textIndent: '2em' }}>
            <p>滇冷杉是分布于中国西南横断山脉及青藏高原东南缘的特有树种，多生长于海拔2500-4000米的高山针叶林带。 </p>
            <p>其树冠呈尖塔形，叶片条形具芳香气味，球果成熟时呈黑褐色。</p>
            <p>作为水源涵养林的主要组成树种，该物种在维持区域生态平衡中发挥重要作用。</p>
            <p> 研究表明，第四纪冰期时滇冷杉曾以云南鹤庆盆地为避难所，现代分布区的稳定性与温度季节性和降雨季节性变化密切相关。</p>
          </div>

          <br />
          <div style={{ height: 300, width: '100%' }}>
            <Dianlengshan></Dianlengshan>
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

/** @description 大熊猫介绍 */
export const showPandaDetails = (value: boolean, notificationApi: NotificationInstance) => {
  notificationApi.destroy()
  if (value) {
    notificationApi.info({
      message: `大熊猫`,
      description: (
        <div>
          <div style={{ textIndent: '2em' }}>
            <p>大熊猫是中国特有的哺乳动物，属于熊科、大熊猫属，被誉为“活化石”和“中国国宝”。</p>
            <p>它们栖息在海拔2600-3500米的茂密竹林中，以竹子为主要食物。</p>
            <p>外表肥硕、黑白相间，善于爬树。野外寿命约18-20岁，数量有所增长，截至2021年1月，中国大熊猫野生种群达1864只。</p>
          </div>

          <br />
          <div style={{ height: 300, width: '100%' }}>
            <Panda></Panda>
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

/** @description 贡嘎山介绍 */
export const showGonggashanDetails = (
  value: boolean,
  notificationApi: NotificationInstance,
  viewerRef: React.RefObject<Cesium.Viewer | null>,
  higherMountainPointInstanceList: React.RefObject<sampleLabelType[]>
) => {
  higherMountainPointInstanceList.current.forEach(item => {
    item.instance.toggleVisible(value)
  })

  notificationApi.destroy()

  if (value) {
    viewerRef.current!.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(101.81087885, 29.52080401, 7599.75),
      orientation: {
        heading: 0.6762693278851586,
        pitch: -0.042912143092978194,
        roll: 0.0001878768739276282,
      },
    })

    notificationApi.info({
      message: `贡嘎山`,
      description: (
        <div style={{ textIndent: '2em' }}>
          <p>贡嘎山（岷雅贡嘎，英语：Minya Konka），为横断山系大雪山主峰，被当地人称为木雅贡嘎。</p>
          <p>位于四川省甘孜藏族自治州康定市、泸定县、九龙县和雅安市石棉县之间。藏语的“贡”是冰雪之意，“嘎”为白色，意为白色冰山。</p>
          <p>
            贡嘎山主峰海拔7508.9米（2023年公布 [18]），是四川省最高的山峰，被称为“蜀山之王”，为世界上高差最大的山之一，周围有海拔6000米上的高峰45座。
          </p>
          <p>贡嘎山北起康定折多山口，南抵泸定田湾河东到大渡河西至雅砻江。以贡嘎雪山为中心的贡嘎山风景名胜区是中国面积最大、环境容量最大的风景区。</p>
          <p>在长期冰川作用下，山峰发育为锥状大角峰，周围绕着60°～70°的峭壁，攀登困难。</p>
          <p>
            贡嘎山有海螺沟、巴旺、燕子沟、磨子沟等冰川和木格措、五须海、巴旺海等高原湖泊以及康定二道桥等温泉，也是全球25个生物多样性热点地区之一。
          </p>
          <p>周围有小贡嘎山、嘉子峰、日乌且峰、勒多曼因峰等雪山环绕。以日照金山奇观出名。 </p>
        </div>
      ),
      placement: 'bottomLeft',
      duration: null,
    })
  } else {
    notificationApi.destroy()
  }
}

/** @description  三江并流 */
export const showSanjiangbingliuDetails = (
  value: boolean,
  notificationApi: NotificationInstance,
  viewerRef: React.RefObject<Cesium.Viewer | null>
) => {
  viewerRef.current!.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(98.45607352, 28.12476188, 3527892.68),
    orientation: {
      heading: 1.7763568394002505e-15,
      pitch: -1.5707142551692401,
      roll: 0,
    },
  })

  notificationApi.destroy()

  if (value) {
    notificationApi.info({
      message: `三江并流`,
      description: (
        <div style={{ textIndent: '2em' }}>
          <p>
            三江并流，是指金沙江、澜沧江和怒江这三条发源于青藏高原的大江在云南省境内自北向南并行奔流170多千米的区域，
            位于中国云南省，跨越了云南省丽江市、迪庆藏族自治州、怒江傈僳族自治州的9个自然保护区和10个风景名胜区。
          </p>
          <p>
            地理坐标位于东经98°～100°30′，北纬25°30′～29°之间， 涵盖范围达170万公顷。
            分为15个不同的保护区，已被分为八区域，每个都能提供全方位的横断山脉的生物和地质多样性的具有代表性的样本。
          </p>
          <p>
            三江并流区域有高等植物210余科，1200余属，6000种以上；有44个中国特有属，2700个中国特有种，
            其中有600种为三江并流区域特有种；有国家珍稀濒危保护植物秃杉、桫椤、红豆杉等33种，省级珍稀濒危保护植物37种。
            区域内栖息着的珍稀濒危动物有滇金丝猴、羚羊、雪豹、孟加拉虎、黑颈鹤等等77种国家级保护动物。
          </p>
        </div>
      ),
      placement: 'bottomLeft',
      duration: null,
    })
  }
}

/** @description  最高峰点位*/
export const initHigherMountainPoint = (
  viewerRef: React.RefObject<Cesium.Viewer | null>,
  higherMountainPointInstanceList: React.RefObject<sampleLabelType[]>
) => {
  higherMountainPointInstanceList.current = [
    {
      position: Cesium.Cartesian3.fromDegrees(101.88123898839554, 29.5935768399523, 7100.9),
      text: '贡嘎山',
      instance: null,
      key: 'gonggashan',
    },
  ].map(item => {
    const instance = new SampleLabel(viewerRef.current!, item.position, item.text, {
      containerBackgroundUrlType: 'position',
      defaultVisible: false,
    })

    return {
      ...item,
      instance,
    }
  })
}

/** @description 伯舒拉岭-高黎贡山 */
export const drawBoshulaling = (
  checked: boolean,
  viewerRef: React.RefObject<Cesium.Viewer | null>,
  boshulalingRef: React.RefObject<Cesium.Entity[]>
) => {
  if (checked) {
    viewerRef.current!.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(98.85494471, 27.62975211, 1656506.3),
      orientation: {
        heading: 6.283185307179583,
        pitch: -1.5705000185647013,
        roll: 0,
      },
    })

    if (boshulalingRef.current?.length) {
      boshulalingRef.current.forEach(item => {
        item.show = true
      })
    } else {
      fetch(window.$$prefix + '/data/hengduan-mountains/boshulaling-gaoligongshan.geojson')
        .then(res => res.json())
        .then(data => {
          Cesium.GeoJsonDataSource.load(data, {
            stroke: Cesium.Color.fromCssColorString('#43e479ff'),
            fill: Cesium.Color.fromCssColorString('#43e479ff').withAlpha(0.8),
            strokeWidth: 2,
            markerSymbol: 'circle',
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)
            boshulalingRef.current = dataSource.entities.values

            boshulalingRef.current.push(
              viewerRef.current!.entities.add({
                position: Cesium.Cartesian3.fromDegrees(97.34634157900587, 29.0430861127563),
                label: {
                  text: '伯舒拉岭',
                  font: '20px sans-serif',
                  ...labelConfig,
                  fillColor: Cesium.Color.fromCssColorString('#43e479ff'),
                },
              })
            )
            /* viewer.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(98.29562051, 28.14677066, 3036.39),
                orientation: {
                    heading: 6.16180360604343,
                    pitch: -0.5573008123218886,
                    roll: 6.283169868518325
                }
            }); */
            boshulalingRef.current.push(
              viewerRef.current!.entities.add({
                position: Cesium.Cartesian3.fromDegrees(98.37378003814831, 26.79269786960716),
                label: {
                  text: '高黎贡山',
                  font: '20px sans-serif',
                  ...labelConfig,
                  fillColor: Cesium.Color.fromCssColorString('#43e479ff'),
                },
              })
            )
          })
        })
    }
  } else {
    boshulalingRef.current!.forEach(item => {
      item.show = false
    })
  }
}

/** @description 他念他翁山-怒山 */
export const drawTaniantawengshan = (
  checked: boolean,
  viewerRef: React.RefObject<Cesium.Viewer | null>,
  taniantawengshanRef: React.RefObject<Cesium.Entity[]>
) => {
  if (checked) {
    viewerRef.current!.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(98.85494471, 27.62975211, 1656506.3),
      orientation: {
        heading: 6.283185307179583,
        pitch: -1.5705000185647013,
        roll: 0,
      },
    })

    if (taniantawengshanRef.current?.length) {
      taniantawengshanRef.current.forEach(item => {
        item.show = true
      })
    } else {
      fetch(window.$$prefix + '/data/hengduan-mountains/taniantawengshan-nushan.geojson')
        .then(res => res.json())
        .then(data => {
          Cesium.GeoJsonDataSource.load(data, {
            stroke: Cesium.Color.fromCssColorString('#43e479ff'),
            fill: Cesium.Color.fromCssColorString('#43e479ff').withAlpha(0.8),
            strokeWidth: 2,
            markerSymbol: 'circle',
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)
            taniantawengshanRef.current = dataSource.entities.values

            taniantawengshanRef.current.push(
              viewerRef.current!.entities.add({
                position: Cesium.Cartesian3.fromDegrees(97.75085382769366, 30.033816565649452),
                label: {
                  text: '他念他翁山',
                  font: '20px sans-serif',
                  ...labelConfig,
                  fillColor: Cesium.Color.fromCssColorString('#43e479ff'),
                },
              })
            )

            taniantawengshanRef.current.push(
              viewerRef.current!.entities.add({
                position: Cesium.Cartesian3.fromDegrees(99.04154615423067, 26.225806715977225),
                label: {
                  text: '怒山',
                  font: '20px sans-serif',

                  ...labelConfig,
                  fillColor: Cesium.Color.fromCssColorString('#43e479ff'),
                },
              })
            )
          })
        })
    }
  } else {
    taniantawengshanRef.current!.forEach(item => {
      item.show = false
    })
  }
}

/** @description 芒康山-云岭 */
export const drawMangkangshan = (
  checked: boolean,
  viewerRef: React.RefObject<Cesium.Viewer | null>,
  mangkangshanRef: React.RefObject<Cesium.Entity[]>
) => {
  if (checked) {
    viewerRef.current!.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(99.13110646, 29.56595366, 1887923.0),
      orientation: {
        heading: 6.283185307179583,
        pitch: -1.5703899551321632,
        roll: 0,
      },
    })

    if (mangkangshanRef.current?.length) {
      mangkangshanRef.current.forEach(item => {
        item.show = true
      })
    } else {
      fetch(window.$$prefix + '/data/hengduan-mountains/mangkangshan-yunling.geojson')
        .then(res => res.json())
        .then(data => {
          Cesium.GeoJsonDataSource.load(data, {
            stroke: Cesium.Color.fromCssColorString('#43e479ff'),
            fill: Cesium.Color.fromCssColorString('#43e479ff').withAlpha(0.8),
            strokeWidth: 2,
            markerSymbol: 'circle',
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)
            mangkangshanRef.current = dataSource.entities.values

            mangkangshanRef.current.push(
              viewerRef.current!.entities.add({
                position: Cesium.Cartesian3.fromDegrees(98.40665629320692, 30.489661468408304),
                label: {
                  text: '芒康山',
                  font: '20px sans-serif',
                  ...labelConfig,
                  fillColor: Cesium.Color.fromCssColorString('#43e479ff'),
                },
              })
            )

            mangkangshanRef.current.push(
              viewerRef.current!.entities.add({
                position: Cesium.Cartesian3.fromDegrees(99.40211213896258, 26.80612247599627),
                label: {
                  text: '云岭',
                  font: '20px sans-serif',
                  ...labelConfig,
                  fillColor: Cesium.Color.fromCssColorString('#43e479ff'),
                },
              })
            )
          })
        })
    }
  } else {
    mangkangshanRef.current!.forEach(item => {
      item.show = false
    })
  }
}

/** @description 沙鲁里山 */
export const drawShalulishan = (
  checked: boolean,
  viewerRef: React.RefObject<Cesium.Viewer | null>,
  shalulishanRef: React.RefObject<Cesium.Entity[]>
) => {
  if (checked) {
    viewerRef.current!.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(99.13110646, 29.56595366, 1887923.0),
      orientation: {
        heading: 6.283185307179583,
        pitch: -1.5703899551321632,
        roll: 0,
      },
    })

    if (shalulishanRef.current?.length) {
      shalulishanRef.current.forEach(item => {
        item.show = true
      })
    } else {
      fetch(window.$$prefix + '/data/hengduan-mountains/shalulishan.geojson')
        .then(res => res.json())
        .then(data => {
          Cesium.GeoJsonDataSource.load(data, {
            stroke: Cesium.Color.fromCssColorString('#43e479ff'),
            fill: Cesium.Color.fromCssColorString('#43e479ff').withAlpha(0.8),
            strokeWidth: 2,
            markerSymbol: 'circle',
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)
            shalulishanRef.current = dataSource.entities.values

            shalulishanRef.current.push(
              viewerRef.current!.entities.add({
                position: Cesium.Cartesian3.fromDegrees(99.50471900227845, 31.08962223183079),
                label: {
                  text: '沙鲁里山',
                  font: '20px sans-serif',
                  ...labelConfig,
                  fillColor: Cesium.Color.fromCssColorString('#43e479ff'),
                },
              })
            )
          })
        })
    }
  } else {
    shalulishanRef.current!.forEach(item => {
      item.show = false
    })
  }
}

/** @description 大雪山 */
export const drawDaxueshan = (checked: boolean, viewerRef: React.RefObject<Cesium.Viewer | null>, daxueshanRef: React.RefObject<Cesium.Entity[]>) => {
  if (checked) {
    viewerRef.current!.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(99.13110646, 29.56595366, 1887923.0),
      orientation: {
        heading: 6.283185307179583,
        pitch: -1.5703899551321632,
        roll: 0,
      },
    })

    if (daxueshanRef.current?.length) {
      daxueshanRef.current.forEach(item => {
        item.show = true
      })
    } else {
      fetch(window.$$prefix + '/data/hengduan-mountains/daxueshan.geojson')
        .then(res => res.json())
        .then(data => {
          Cesium.GeoJsonDataSource.load(data, {
            stroke: Cesium.Color.fromCssColorString('#43e479ff'),
            fill: Cesium.Color.fromCssColorString('#43e479ff').withAlpha(0.8),
            strokeWidth: 2,
            markerSymbol: 'circle',
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)
            daxueshanRef.current = dataSource.entities.values

            daxueshanRef.current.push(
              viewerRef.current!.entities.add({
                position: Cesium.Cartesian3.fromDegrees(101.36515981045625, 31.574323857583252),
                label: {
                  text: '大雪山',
                  font: '20px sans-serif',
                  ...labelConfig,
                  fillColor: Cesium.Color.fromCssColorString('#43e479ff'),
                },
              })
            )
          })
        })
    }
  } else {
    daxueshanRef.current!.forEach(item => {
      item.show = false
    })
  }
}

/** @description 大雪山 */
export const drawQionglaishan = (
  checked: boolean,
  viewerRef: React.RefObject<Cesium.Viewer | null>,
  qionglaishan: React.RefObject<Cesium.Entity[]>
) => {
  if (checked) {
    viewerRef.current!.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(104.47583212, 31.42273029, 1888526.93),
      orientation: {
        heading: 6.283185307179582,
        pitch: -1.5702841970739416,
        roll: 0,
      },
    })

    if (qionglaishan.current?.length) {
      qionglaishan.current.forEach(item => {
        item.show = true
      })
    } else {
      fetch(window.$$prefix + '/data/hengduan-mountains/qionglaishan.geojson')
        .then(res => res.json())
        .then(data => {
          Cesium.GeoJsonDataSource.load(data, {
            stroke: Cesium.Color.fromCssColorString('#43e479ff'),
            fill: Cesium.Color.fromCssColorString('#43e479ff').withAlpha(0.8),
            strokeWidth: 2,
            markerSymbol: 'circle',
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)
            qionglaishan.current = dataSource.entities.values

            qionglaishan.current.push(
              viewerRef.current!.entities.add({
                position: Cesium.Cartesian3.fromDegrees(102.80395867428174, 32.28643306644907),
                label: {
                  text: '邛崃山',
                  font: '20px sans-serif',
                  ...labelConfig,
                  fillColor: Cesium.Color.fromCssColorString('#43e479ff'),
                },
              })
            )
          })
        })
    }
  } else {
    qionglaishan.current!.forEach(item => {
      item.show = false
    })
  }
}

/** @description 大雪山 */
export const drawMinshan = (checked: boolean, viewerRef: React.RefObject<Cesium.Viewer | null>, minshanRef: React.RefObject<Cesium.Entity[]>) => {
  if (checked) {
    viewerRef.current!.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(107.18146906, 31.3145703, 3528324.44),
      orientation: {
        heading: 6.283185307179586,
        pitch: -1.5705239714367836,
        roll: 0,
      },
    })

    if (minshanRef.current?.length) {
      minshanRef.current.forEach(item => {
        item.show = true
      })
    } else {
      fetch(window.$$prefix + '/data/hengduan-mountains/minshan.geojson')
        .then(res => res.json())
        .then(data => {
          Cesium.GeoJsonDataSource.load(data, {
            stroke: Cesium.Color.fromCssColorString('#43e479ff'),
            fill: Cesium.Color.fromCssColorString('#43e479ff').withAlpha(0.8),
            strokeWidth: 2,
            markerSymbol: 'circle',
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)
            minshanRef.current = dataSource.entities.values

            minshanRef.current.push(
              viewerRef.current!.entities.add({
                position: Cesium.Cartesian3.fromDegrees(104.0434617314983, 32.7493986221671),
                label: {
                  text: '岷山',
                  font: '20px sans-serif',
                  ...labelConfig,
                  fillColor: Cesium.Color.fromCssColorString('#43e479ff'),
                },
              })
            )
          })
        })
    }
  } else {
    minshanRef.current!.forEach(item => {
      item.show = false
    })
  }
}

/** @description  大熊猫点位*/
export const initPandaPoint = (viewerRef: React.RefObject<Cesium.Viewer | null>, pandaPointInstanceList: React.RefObject<sampleLabelType[]>) => {
  pandaPointInstanceList.current = [
    {
      position: Cesium.Cartesian3.fromDegrees(103.12073346936057, 31.043327963060108, 7100.9),
      text: '鞍子河大熊猫自然保护区',
      instance: null,
      key: 'anzihedaxiongmao',
    },
  ].map(item => {
    const instance = new SampleLabel(viewerRef.current!, item.position, item.text, {
      containerBackgroundUrlType: 'panda',
      defaultVisible: false,
    })

    return {
      ...item,
      instance,
    }
  })
}

/** @description  滇冷杉点位*/
export const initDianlengshanPoint = (
  viewerRef: React.RefObject<Cesium.Viewer | null>,
  dianlengshanPointInstanceList: React.RefObject<sampleLabelType[]>
) => {
  dianlengshanPointInstanceList.current = [
    {
      position: Cesium.Cartesian3.fromDegrees(99.9101808782321, 27.409176945433586, 7100.9),
      text: '滇冷杉',
      instance: null,
      key: 'dianlengshan',
    },
  ].map(item => {
    const instance = new SampleLabel(viewerRef.current!, item.position, item.text, {
      containerBackgroundUrlType: 'tree',
      defaultVisible: false,
    })

    return {
      ...item,
      instance,
    }
  })
}

/** @description  虎跳峡点位*/
export const initCanyonPoint = (viewerRef: React.RefObject<Cesium.Viewer | null>, canyonPointInstanceList: React.RefObject<sampleLabelType[]>) => {
  /*   28°27'20"N 99°49'51"E */
  canyonPointInstanceList.current = [
    {
      position: Cesium.Cartesian3.fromDegrees(100.06127733028683, 27.170770691542253, 2044.04),
      text: '虎跳峡',
      instance: null,
      key: 'hutiaoxia',
    },
    {
      position: Cesium.Cartesian3.fromDegrees(99.48111671593866, 28.27192539810618, 3513.55),
      text: '碧壤峡谷',
      instance: null,
      key: 'birangxiagu',
    },
  ].map(item => {
    const instance = new SampleLabel(viewerRef.current!, item.position, item.text, {
      containerBackgroundUrlType: 'position',
      defaultVisible: false,
      clickCallback: () => {

      },
    })

    return {
      ...item,
      instance,
    }
  })
}

/** @description  垂直自然区 */
export const drawVerticalNatureArea = (checked: boolean, viewerRef: React.RefObject<Cesium.Viewer | null>, verticalNatureAreaRef: React.RefObject<Cesium.Entity[]>, higherMountainPointInstanceList: React.RefObject<sampleLabelType[]>) => {

  if (checked) {
    higherMountainPointInstanceList.current.forEach(item => item.instance.toggleVisible(true))

    viewerRef.current!.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(101.66628020, 29.47521623, 23637.14),
      orientation: {
        heading: 1.0086921425934001,
        pitch: -0.8111771661888083,
        roll: 3.091986808811953e-7
      }
    });
    if (verticalNatureAreaRef.current?.length) {
      verticalNatureAreaRef.current.forEach(item => {
        item.show = true
      })
    } else {
      fetch(window.$$prefix + '/data/hengduan-mountains/vertical-nature-area.geojson')
        .then(res => res.json())
        .then(data => {

          data.features.forEach((item: any) => {
            const parmas = {
              features: [] as any,
              type: 'FeatureCollection',
            }
            parmas.features.push(item)

            // 添加标注this.generateParticles() this.intervalTimer = setInte

            Cesium.GeoJsonDataSource.load(parmas, {
              stroke: Cesium.Color.fromCssColorString(item.properties.color),
              fill: Cesium.Color.fromCssColorString(item.properties.color).withAlpha(0.5),
              strokeWidth: 2,
              markerSymbol: 'circle',
              clampToGround: true,
            }).then(function (dataSource) {
              viewerRef.current!.dataSources.add(dataSource)

              verticalNatureAreaRef.current.push(...dataSource.entities.values)

              verticalNatureAreaRef.current.push(
                viewerRef.current!.entities.add({
                  position: Cesium.Cartesian3.fromDegrees(item.geometry.coordinates[0][0][0], item.geometry.coordinates[0][0][1]),
                  label: {
                    text: item.properties.name,
                    font: '20px sans-serif',
                    ...labelConfig,
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                  }
                })
              )
            })
          })
        })
    }
  } else {
    verticalNatureAreaRef.current!.forEach(item => {
      item.show = false
    })
  }
}

/** @description 贡嘎山垂直自然带 */
export const showVerticalNatureAreaDetails = (value: boolean, notificationApi: NotificationInstance) => {
  notificationApi.destroy()
  if (value) {
    notificationApi.info({
      message: `贡嘎山垂直自然带`,
      style: {
        width: 600
      },
      description: (
        <div style={{ height: 600 }}>
          <img src={VerticalNatureArea} alt="" style={{ display: 'block', width: '100%', height: '100%' }} />
        </div>
      ),
      placement: 'bottomLeft',
      duration: null,
    })
  } else {
    notificationApi.destroy()
  }
}

const researchLinePositionTextStyle = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  },
  title: {
    color: '#476f97',
    borderBottom: '2px solid #3498db',
    paddingBottom: '10px',
    marginBottom: '20px'
  },
  paragraph: {
    lineHeight: '1.8',
    margin: '15px 0',
    color: '#969696'
  },
  subtitle: {
    color: '#596a7a',
    marginTop: '30px',
    marginBottom: '15px'
  },
  list: {
    lineHeight: '2',
    paddingLeft: '20px',
    margin: '10px 0',
    color: '#afacacff'
  },
  listItem: {
    marginBottom: '8px'
  },
  italicParagraph: {
    lineHeight: '1.8',
    marginTop: '20px',
    fontStyle: 'italic',
    color: '#7f8c8d'
  }
};
export const ResearchLinePositionLijiang = () => {

  const styles = researchLinePositionTextStyle

  return <div>
    <Carousel className='project-carousel' autoplay autoplaySpeed={2000} style={{ height: 300 }}>
      <div style={{ height: 300 }}><img style={{ maxWidth: '100%', maxHeight: '100%' }} src={window.$$prefix + '/image/hengduan-mountains/lijiang/1.png'} alt="" /></div>
      <div style={{ height: 300 }}><img style={{ maxWidth: '100%', maxHeight: '100%' }} src={window.$$prefix + '/image/hengduan-mountains/lijiang/2.png'} alt="" /></div>
      <div style={{ height: 300 }}><img style={{ maxWidth: '100%', maxHeight: '100%' }} src={window.$$prefix + '/image/hengduan-mountains/lijiang/3.png'} alt="" /></div>
      <div style={{ height: 300 }}><img style={{ maxWidth: '100%', maxHeight: '100%' }} src={window.$$prefix + '/image/hengduan-mountains/lijiang/4.png'} alt="" /></div>
      <div style={{ height: 300 }}><img style={{ maxWidth: '100%', maxHeight: '100%' }} src={window.$$prefix + '/image/hengduan-mountains/lijiang/5.png'} alt="" /></div>
    </Carousel>
    <div className="lijiang-intro" style={styles.container}>
      <h1 style={styles.title}>丽江：彩云之南的诗意栖居地</h1>
      <p style={styles.paragraph}>
        丽江，这座位于云南省西北部的古城，是纳西族文化的核心承载地，也是无数人心中“诗与远方”的代名词。它既有千年历史沉淀的厚重，也有自然与人文交融的灵动，每一处角落都藏着独特的故事。
      </p>

      <h2 style={styles.subtitle}>一、世界文化遗产——丽江古城</h2>
      <p style={styles.paragraph}>
        丽江古城始建于宋末元初，以“没有城墙”的特色闻名于世，1997年被列入《世界文化遗产名录》。
      </p>
      <ul style={styles.list}>
        <li style={styles.listItem}>
          <strong>四方街</strong>：古城的核心区域，青石板路向四周延伸，清晨的集市满是纳西族特色小吃的香气，夜晚的灯笼则点亮了古城的温柔。
        </li>
        <li style={styles.listItem}>
          <strong>水系景观</strong>：穿城而过的玉河水，让古城有了“东方威尼斯”的韵味，家家户户门前流水潺潺，是古城活力的象征。
        </li>
        <li style={styles.listItem}>
          <strong>纳西建筑</strong>：白墙黛瓦的民居搭配“三坊一照壁”“四合五天井”的结构，木质门窗上的雕花细致精巧，尽显民族智慧。
        </li>
      </ul>

      <h2 style={styles.subtitle}>二、自然与信仰的交织——周边必访</h2>
      <p style={styles.paragraph}>丽江的魅力不止于古城，周边的山水与圣地更让人沉醉。</p>
      <ul style={styles.list}>
        <li style={styles.listItem}>
          <strong>玉龙雪山</strong>：纳西族心中的“神山”，十三座雪峰连绵起伏，即使在夏季也能看到皑皑白雪，山下的蓝月谷湖水湛蓝如宝石，随手一拍都是大片。
        </li>
        <li style={styles.listItem}>
          <strong>拉市海</strong>：高原湿地的代表，春季绿草如茵，冬季则成为候鸟的天堂，骑马走在湖边的草甸上，能感受最纯粹的自然气息。
        </li>
        <li style={styles.listItem}>
          <strong>束河古镇</strong>：比丽江古城更安静的“秘境”，保留了更多原始的纳西生活风貌，古镇入口的青龙桥已有数百年历史，见证了岁月变迁。
        </li>
      </ul>

      <h2 style={styles.subtitle}>三、舌尖上的丽江——民族风味</h2>
      <p style={styles.paragraph}>丽江的美食融合了纳西族、彝族等多民族特色，每一口都是地域的味道。</p>
      <ul style={styles.list}>
        <li style={styles.listItem}>
          <strong>腊排骨火锅</strong>：用当地土法腌制的腊排骨，搭配萝卜炖煮，肉质紧实、汤味浓郁，是丽江的招牌美食。
        </li>
        <li style={styles.listItem}>
          <strong>鸡豆凉粉</strong>：纳西族的传统小吃，用鸡豆磨粉制成，可凉拌可油煎，搭配秘制调料，酸辣开胃。
        </li>
        <li style={styles.listItem}>
          <strong>酥油茶</strong>：藏族与纳西族共爱的饮品，咸香浓郁，初尝可能略带苦涩，搭配糌粑食用，更能体会高原饮食的特色。
        </li>
      </ul>

      <p style={styles.italicParagraph}>
        丽江从不只是一个旅游目的地，它是一种生活方式的缩影——在这里，你可以放慢脚步，听纳西古乐、看雪山流云，在古城的烟火气里找到内心的平静。
      </p>
    </div>
  </div>
}


export const ResearchLinePositionTacheng = () => {
  const styles = researchLinePositionTextStyle

  return (
    <>
      <Carousel className='project-carousel' autoplay autoplaySpeed={2000} style={{ height: 300 }}>
        <div style={{ height: 300 }}><img style={{ maxWidth: '100%', maxHeight: '100%' }} src={window.$$prefix + '/image/hengduan-mountains/tacheng/1.png'} alt="" /></div>
        <div style={{ height: 300 }}><img style={{ maxWidth: '100%', maxHeight: '100%' }} src={window.$$prefix + '/image/hengduan-mountains/tacheng/2.png'} alt="" /></div>
        <div style={{ height: 300 }}><img style={{ maxWidth: '100%', maxHeight: '100%' }} src={window.$$prefix + '/image/hengduan-mountains/tacheng/3.png'} alt="" /></div>
        <div style={{ height: 300 }}><img style={{ maxWidth: '100%', maxHeight: '100%' }} src={window.$$prefix + '/image/hengduan-mountains/tacheng/4.png'} alt="" /></div>
        <div style={{ height: 300 }}><img style={{ maxWidth: '100%', maxHeight: '100%' }} src={window.$$prefix + '/image/hengduan-mountains/tacheng/5.png'} alt="" /></div>
      </Carousel>
      <div className="tacheng-intro" style={styles.container}>
        <h1 style={styles.title}>塔城：滇西北的秘境栖居地</h1>
        <p style={styles.paragraph}>
          塔城，坐落于云南省丽江市玉龙纳西族自治县西北部，地处金沙江畔、滇川藏交界处。它没有古城的喧嚣，却藏着最原始的高原风光与多元民族文化，是被时光偏爱的“滇西北后花园”。
        </p>

        <h2 style={styles.subtitle}>一、自然馈赠——原始生态秘境</h2>
        <p style={styles.paragraph}>
          塔城的自然之美源于未被过度开发的纯净，山水相依间尽是野趣与诗意。
        </p>
        <ul style={styles.list}>
          <li style={styles.listItem}>
            <strong>长江第一湾上游峡谷</strong>：金沙江在这里蜿蜒流淌，两岸悬崖峭壁与河谷田园相映，清晨云雾缭绕时宛如仙境，是徒步和摄影的绝佳去处。
          </li>
          <li style={styles.listItem}>
            <strong>老君山余脉风光</strong>：境内群山连绵，森林覆盖率极高，盛产松茸、羊肚菌等野生菌，山间溪流潺潺，空气清新得能嗅到草木的清香。
          </li>
          <li style={styles.listItem}>
            <strong>高原田园画卷</strong>：春季油菜花田铺成金色海洋，夏季稻田绿意盎然，秋季稻谷泛黄、果树飘香，展现着最质朴的农耕生态之美。
          </li>
        </ul>

        <h2 style={styles.subtitle}>二、民族共生——多元文化交融</h2>
        <p style={styles.paragraph}>
          塔城是纳西族、傈僳族、白族、藏族等多民族聚居地，不同文化在此碰撞共生，保留着最本真的民族风情。
        </p>
        <ul style={styles.list}>
          <li style={styles.listItem}>
            <strong>纳西族古村落</strong>：传统“三坊一照壁”民居依山而建，村民仍保持着耕种、纺织的古老生活方式，闲暇时的纳西古乐传唱着千年故事。
          </li>
          <li style={styles.listItem}>
            <strong>傈僳族特色文化</strong>：傈僳族同胞擅长歌舞与手工编织，节日里的跳嘎舞、葫芦笙演奏充满感染力，手工织就的麻布服饰色彩艳丽。
          </li>
          <li style={styles.listItem}>
            <strong>宗教文化印记</strong>：境内既有纳西族的东巴庙，也有藏传佛教的小寺院，不同信仰和谐共存，构成独特的文化景观。
          </li>
        </ul>

        <h2 style={styles.subtitle}>三、舌尖风味——山野本味佳肴</h2>
        <p style={styles.paragraph}>
          塔城的美食取材于当地山野与田园，主打原生态风味，每一口都是自然的馈赠。
        </p>
        <ul style={styles.list}>
          <li style={styles.listItem}>
            <strong>野生菌宴</strong>：雨季的塔城是菌子的天堂，松茸刺身、干椒炒牛肝菌、鸡油菌汤等菜品，鲜香味美，保留菌子最纯粹的鲜味。
          </li>
          <li style={styles.listItem}>
            <strong>金沙江鱼</strong>：取自金沙江的原生态鱼类，肉质鲜嫩无腥味，清炖或香煎都极具风味，搭配当地蔬菜炖煮更是鲜香可口。
          </li>
          <li style={styles.listItem}>
            <strong>民族特色小吃</strong>：纳西族的米糕、傈僳族的杵酒、白族的乳扇，都是当地独有的风味，简单的食材搭配出最地道的山野味道。
          </li>
        </ul>

        <p style={styles.italicParagraph}>
          塔城是一处远离尘嚣的秘境，这里没有拥挤的人潮，只有山水的静谧、民族的淳朴和生活的本真。来到这里，方能体会到滇西北最原始的诗意与安宁。
        </p>
      </div>
    </>

  );
}

export const ResearchLinePositionMeiliSnowMountain = () => {
  const styles = researchLinePositionTextStyle

  return (

    <>
      <Carousel className='project-carousel' autoplay autoplaySpeed={2000} style={{ height: 300 }}>
        <div style={{ height: 300 }}><img style={{ maxWidth: '100%', maxHeight: '100%' }} src={window.$$prefix + '/image/hengduan-mountains/meilixueshan/1.png'} alt="" /></div>
        <div style={{ height: 300 }}><img style={{ maxWidth: '100%', maxHeight: '100%' }} src={window.$$prefix + '/image/hengduan-mountains/meilixueshan/2.png'} alt="" /></div>
        <div style={{ height: 300 }}><img style={{ maxWidth: '100%', maxHeight: '100%' }} src={window.$$prefix + '/image/hengduan-mountains/meilixueshan/3.png'} alt="" /></div>
        <div style={{ height: 300 }}><img style={{ maxWidth: '100%', maxHeight: '100%' }} src={window.$$prefix + '/image/hengduan-mountains/meilixueshan/4.png'} alt="" /></div>
        <div style={{ height: 300 }}><img style={{ maxWidth: '100%', maxHeight: '100%' }} src={window.$$prefix + '/image/hengduan-mountains/meilixueshan/5.png'} alt="" /></div>
      </Carousel>
      <div className="meili-intro" style={styles.container}>
        <h1 style={styles.title}>梅里雪山：藏区八大神山之首的圣洁秘境</h1>
        <p style={styles.paragraph}>
          梅里雪山，位于云南省迪庆藏族自治州德钦县境内，是横断山脉中最为壮观的雪山群。作为藏传佛教四大神山之一，它不仅是自然奇观，更是藏族同胞心中的精神图腾，被誉为"雪山之神"。
        </p>

        <h2 style={styles.subtitle}>一、神山圣境——自然奇观与宗教圣地的完美融合</h2>
        <p style={styles.paragraph}>
          梅里雪山以其巍峨壮丽的山体和神秘莫测的宗教色彩，成为无数人心中的圣地。
        </p>
        <ul style={styles.list}>
          <li style={styles.listItem}>
            <strong>卡瓦格博峰</strong>：主峰海拔6740米，是云南第一高峰，至今仍是未被人类登顶的"处女峰"。其金字塔状的山形在朝阳映照下呈现出著名的"日照金山"奇观。
          </li>
          <li style={styles.listItem}>
            <strong>太子十三峰</strong>：连绵的十三座雪峰宛如仪仗队般排列，每座山峰都有其独特的传说和宗教意义，构成了壮观的雪山群像。
          </li>
          <li style={styles.listItem}>
            <strong>明永冰川</strong>：从海拔5500米延伸至2700米，是世界上少有的低纬度、低海拔季风海洋性现代冰川，冰舌直抵森林地带，形成"冰川入林"的奇景。
          </li>
        </ul>

        <h2 style={styles.subtitle}>二、宗教文化——藏传佛教的神圣道场</h2>
        <p style={styles.paragraph}>
          梅里雪山在藏传佛教中具有至高无上的地位，是噶举派的重要修行地，每年吸引大量信徒前来朝拜。
        </p>
        <ul style={styles.list}>
          <li style={styles.listItem}>
            <strong>转山传统</strong>：外转经路线全程约240公里，徒步需时10-15天；内转经路线约60公里，是藏传佛教最重要的朝圣活动之一。
          </li>
          <li style={styles.listItem}>
            <strong>飞来寺</strong>：观赏梅里雪山的最佳位置，寺内供奉有卡瓦格博的神像，是朝圣者必到的宗教场所。
          </li>
          <li style={styles.listItem}>
            <strong>经幡与玛尼堆</strong>：雪山周围遍布五彩经幡和玛尼堆，每一面经幡、每一块石头都承载着信徒的祈愿和祝福。
          </li>
        </ul>

        <h2 style={styles.subtitle}>三、生态奇观——生物多样性宝库</h2>
        <p style={styles.paragraph}>
          梅里雪山地区垂直气候带明显，从雪山冰川到干热河谷，孕育了丰富的动植物资源。
        </p>
        <ul style={styles.list}>
          <li style={styles.listItem}>
            <strong>垂直生态带谱</strong>：在短短数十公里内，可以经历从高山冰雪带到亚热带常绿阔叶林的完整垂直气候带变化。
          </li>
          <li style={styles.listItem}>
            <strong>珍稀动植物</strong>：是滇金丝猴最重要的栖息地，同时还分布有雪豹、小熊猫等珍稀动物，以及大量高山杜鹃和药用植物。
          </li>
          <li style={styles.listItem}>
            <strong>雨崩秘境</strong>：雪山脚下的雨崩村，被群山环抱，只能徒步到达，保持着最原始的生态和生活方式，被誉为"世外桃源"。
          </li>
        </ul>

        <h2 style={styles.subtitle}>四、旅行体验——心灵与自然的对话</h2>
        <p style={styles.paragraph}>
          梅里雪山的旅行不仅是视觉的盛宴，更是心灵的洗礼。
        </p>
        <ul style={styles.list}>
          <li style={styles.listItem}>
            <strong>最佳观赏季节</strong>：秋冬季是观赏雪山的最佳时节，天气稳定，"日照金山"的出现概率最高。
          </li>
          <li style={styles.listItem}>
            <strong>徒步线路</strong>：雨崩徒步、明永冰川徒步等都是深受户外爱好者喜爱的经典线路，沿途风景绝美。
          </li>
          <li style={styles.listItem}>
            <strong>摄影天堂</strong>：从日出时的"日照金山"到星空下的雪山剪影，每一个时刻都是摄影创作的绝佳素材。
          </li>
        </ul>

        <p style={styles.italicParagraph}>
          梅里雪山是一座需要用心去感受的神山。在这里，自然的壮美与信仰的力量交织，让人在巍峨的雪山面前感受到生命的渺小与自然的伟大，获得心灵的净化与升华。
        </p>
      </div>
    </>

  );
}

export const ResearchLinePositionShangriLa = () => {
  const styles = researchLinePositionTextStyle

  return <>
    <Carousel className='project-carousel' autoplay autoplaySpeed={2000} style={{ height: 300 }}>
      <div style={{ height: 300 }}><img style={{ maxWidth: '100%', maxHeight: '100%' }} src={window.$$prefix + '/image/hengduan-mountains/xianggelila/1.png'} alt="" /></div>
      <div style={{ height: 300 }}><img style={{ maxWidth: '100%', maxHeight: '100%' }} src={window.$$prefix + '/image/hengduan-mountains/xianggelila/2.png'} alt="" /></div>
      <div style={{ height: 300 }}><img style={{ maxWidth: '100%', maxHeight: '100%' }} src={window.$$prefix + '/image/hengduan-mountains/xianggelila/3.png'} alt="" /></div>
      <div style={{ height: 300 }}><img style={{ maxWidth: '100%', maxHeight: '100%' }} src={window.$$prefix + '/image/hengduan-mountains/xianggelila/4.png'} alt="" /></div>
      <div style={{ height: 300 }}><img style={{ maxWidth: '100%', maxHeight: '100%' }} src={window.$$prefix + '/image/hengduan-mountains/xianggelila/5.png'} alt="" /></div>
    </Carousel>
    <div className="shangri-la-intro" style={styles.container}>

      <h1 style={styles.title}>香格里拉：人间仙境与藏域风情的完美交融</h1>

      <p style={styles.paragraph}>
        香格里拉，藏语意为"心中的日月"，位于云南省迪庆藏族自治州，地处滇、川、藏三省区交汇处。这片被詹姆斯·希尔顿在《消失的地平线》中描绘的世外桃源，集雪山峡谷、草原湖泊、原始森林和民族风情于一体，是名副其实的人间天堂。
      </p>

      <h2 style={styles.subtitle}>一、自然秘境——高原风光的精华荟萃</h2>

      <p style={styles.paragraph}>
        香格里拉的自然景观丰富多样，从壮丽雪山到宁静湖泊，从广袤草原到深邃峡谷，构成了一幅幅令人惊叹的画卷。
      </p>

      <ul style={styles.list}>
        <li style={styles.listItem}>
          <strong>普达措国家公园</strong>：中国大陆第一个国家公园，拥有明镜般的高山湖泊、水草丰美的牧场、百花盛开的湿地和飞禽走兽时常出没的原始森林。
        </li>
        <li style={styles.listItem}>
          <strong>纳帕海依拉草原</strong>：季节性高山湖泊和沼泽草甸，冬季是草原，夏季成湖泊，黑颈鹤等珍稀鸟类在此栖息，是高原湿地生态系统的典型代表。
        </li>
        <strong>虎跳峡</strong>：以险峻闻名于世的世界级峡谷，金沙江在此奔腾咆哮，峡谷深度仅次于雅鲁藏布江大峡谷，是徒步爱好者的天堂
      </ul>

      <h2 style={styles.subtitle}>二、藏域文化——浓郁的藏族风情</h2>
      <p style={styles.paragraph}>
        作为云南藏族文化的重要发祥地，香格里拉保存着完整的藏族传统和独特的康巴文化。
      </p>
      <ul style={styles.list}>
        <li style={styles.listItem}>
          <strong>松赞林寺</strong>：云南规模最大的藏传佛教寺院，有"小布达拉宫"之称，金顶辉煌，法号声声，是藏传佛教的重要修行圣地。
        </li>
        <li style={styles.listItem}>
          <strong>独克宗古城</strong>：距今已有1300多年历史的茶马古道重镇，拥有世界上最大的转经筒，古城的石板路上仍回响着马帮的蹄声。
        </li>
        <li style={styles.listItem}>
          <strong>藏族民俗</strong>：热情奔放的锅庄舞、悠扬的藏族民歌、精美的唐卡艺术、盛大的赛马节，无不展现着浓郁的藏族文化魅力。
        </li>
      </ul>

      <h2 style={styles.subtitle}>三、生态奇观——生物多样性宝库</h2>
      <p style={styles.paragraph}>
        香格里拉地处"三江并流"世界自然遗产核心区，生态系统完整，生物资源丰富。
      </p>
      <ul style={styles.list}>
        <li style={styles.listItem}>
          <strong>高山植物王国</strong>：从海拔1500米的金沙江干热河谷到5000多米的雪山之巅，分布着从亚热带到寒带的丰富植被类型。
        </li>
        <li style={styles.listItem}>
          <strong>珍稀动物乐园</strong>：滇金丝猴、雪豹、黑颈鹤等国家一级保护动物在此栖息，是重要的物种基因库。
        </li>
        <li style={styles.listItem}>
          <strong>原始森林秘境</strong>：广袤的原始冷杉林、云杉林保持着最原始的状态，林中松萝垂挂，苔藓铺地，充满神秘色彩。
        </li>
      </ul>

      <h2 style={styles.subtitle}>四、特色物产——高原珍品与藏族美食</h2>
      <p style={styles.paragraph}>
        香格里拉的特产融合了高原物产的精华和藏族饮食文化的智慧。
      </p>
      <ul style={styles.list}>
        <li style={styles.listItem}>
          <strong>松茸等野生菌</strong>：作为"菌中之王"松茸的主产区，每年雨季，新鲜的松茸从这里走向世界各地的餐桌。
        </li>
        <li style={styles.listItem}>
          <strong>藏族美食</strong>：酥油茶、糌粑、牦牛肉火锅、青稞酒等传统藏族美食，风味独特，营养丰富。
        </li>
        <li style={styles.listItem}>
          <strong>高原特产</strong>：冬虫夏草、雪莲花、藏红花等名贵药材，以及牦牛制品、藏族手工艺品都是极具特色的伴手礼。
        </li>
      </ul>

      <p style={styles.italicParagraph}>
        香格里拉不仅是一片地理意义上的净土，更是心灵可以栖息的精神家园。在这里，神圣的雪山、清澈的湖泊、广袤的草原与淳朴的民风交织在一起，让人真正体会到"人间天堂"的意境，找到内心深处的那份宁静与平和。
      </p>
    </div >
  </>
}