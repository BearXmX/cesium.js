import SampleLabel from '@/utils/plugins/sample-label'
import type { NotificationInstance } from 'antd/es/notification/interface'
import * as Cesium from 'cesium'
import Panda from './panda'
import Dianlengshan from './dianlengshan'
import VerticalNatureArea from '@/assets/nature-area.png'
import { Carousel } from 'antd'
import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'

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

export const otherPositionData: any[] = [
  {
    image: '/position-icon-scenicSpot.svg',
    imagePosition: Cesium.Cartesian3.fromDegrees(101.88123898839554, 29.5935768399523, 500),
    properties: {
      type: 'other-position',
      name: '贡嘎山',
      groupType: 'scenicSpot',
      groupName: '自然景观'
    }
  },
  {

    image: '/position-icon-scenicSpot.svg',
    imagePosition: Cesium.Cartesian3.fromDegrees(100.06127733028683, 27.170770691542253,),
    properties: {
      type: 'other-position',
      name: '虎跳峡',
      groupType: 'scenicSpot',
      groupName: '自然景观',
    },
  },
  {

    image: '/position-icon-scenicSpot.svg',
    imagePosition: Cesium.Cartesian3.fromDegrees(99.48111671593866, 28.27192539810618,),
    properties: {
      type: 'other-position',
      name: '碧壤峡谷',
      groupType: 'scenicSpot',
      groupName: '自然景观',
      callback: (viewerRef: React.RefObject<Cesium.Viewer | null>,) => {
        cameraFlyTo(99.50432404, 28.26702254, 5180.46, {
          orientation: {
            heading: 4.899541930068292,
            pitch: -0.564374744465872,
            roll: 0.000012141044522628874
          }
        }, viewerRef)
      },
    },
  },
  {

    image: '/position-icon-panda.svg',
    imagePosition: Cesium.Cartesian3.fromDegrees(103.12073346936057, 31.043327963060108,),
    properties: {
      type: 'other-position',
      name: '鞍子河大熊猫自然保护区',
      groupType: 'biology',
      groupName: '生物',
    },
  },
  {

    image: '/position-icon-tree.svg',
    imagePosition: Cesium.Cartesian3.fromDegrees(99.9101808782321, 27.409176945433586),
    properties: {
      type: 'other-position',
      name: '滇冷杉',
      groupType: 'scenicSpot',
      groupName: '自然景观',
    },
  }
]

export const researchLineBillboards = [
  {
    image: '/position-icon-landmark.svg',
    imagePosition: Cesium.Cartesian3.fromDegrees(100.21145191081905, 26.90612625295651),
    properties: {
      type: 'researchLine-position',
      name: '丽江',
      groupType: 'city',
      groupName: '城市',
    },
  },
  {
    image: '/position-icon-landmark.svg',
    imagePosition: Cesium.Cartesian3.fromDegrees(99.56055050339569, 27.485840446748455),
    properties: {
      type: 'researchLine-position',
      name: '塔城',
      groupType: 'city',
      groupName: '城市'
    },
  },
  {
    image: '/position-icon-scenicSpot.svg',
    imagePosition: Cesium.Cartesian3.fromDegrees(98.97064059974441, 28.52937522819254),
    properties: {
      type: 'researchLine-position',
      name: '梅里雪山',
      groupType: 'scenicSpot',
      groupName: '自然景观'
    }
  },
  {
    image: '/position-icon-landmark.svg',
    imagePosition: Cesium.Cartesian3.fromDegrees(99.70038240115997, 27.843065988387632),
    properties: {
      type: 'researchLine-position',
      name: '香格里拉',
      groupType: 'city',
      groupName: '城市'
    },
  },
  {

    image: '/position-icon-scenicSpot.svg',
    imagePosition: Cesium.Cartesian3.fromDegrees(99.96685951670271, 26.86968315120531),
    properties: {
      type: 'researchLine-position',
      name: '长江第一湾观景台',
      groupType: 'scenicSpot',
      groupName: '自然景观',
      callback: (viewerRef: React.RefObject<Cesium.Viewer | null>,) => {
        cameraFlyTo(99.97269454, 26.87308829, 10018.17, {
          orientation: {
            heading: 3.8357474868348254,
            pitch: -1.527977031824344,
            roll: 0
          }
        }, viewerRef)
      },
    },
  },
  {

    image: '/position-icon-scenicSpot.svg',
    imagePosition: Cesium.Cartesian3.fromDegrees(100.06127733028683, 27.170770691542253,),
    properties: {
      type: 'researchLine-position',
      name: '虎跳峡',
      groupType: 'scenicSpot',
      groupName: '自然景观',
    },
  }
]



export const cameraFlyTo = (longitude: number, latitude: number, height: number = 4000000, options: any = {}, viewerRef: React.RefObject<Cesium.Viewer | null>) => {
  (viewerRef!).current!.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
    ...options,
  })
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

/** @description  垂直自然区 */
export const drawVerticalNatureArea = (checked: boolean, viewerRef: React.RefObject<Cesium.Viewer | null>, verticalNatureAreaRef: React.RefObject<Cesium.Entity[]>) => {

  if (checked) {

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

export const ResearchLinePositionFirstBend = () => {
  const styles = researchLinePositionTextStyle

  return <>
    <div className="first-bend-intro" style={styles.container}>

      <h1 style={styles.title}>长江第一湾：江河巨变的史诗级转折</h1>

      <p style={styles.paragraph}>
        长江第一湾位于云南省丽江市石鼓镇，是金沙江在横断山脉间的一个超过100度的"Ω"形急转弯。
        这个壮丽的地理奇观不仅是视觉的震撼，更是地质演化史上的重要见证，被誉为"万里长江第一湾"。
      </p>

      <h2 style={styles.subtitle}>一、地质奇观——板块运动的生动教材</h2>

      <p style={styles.paragraph}>
        长江第一湾的形成是数百万年来地质作用的结果，展现了自然力量的伟大博弈。
      </p>

      <ul style={styles.list}>
        <li style={styles.listItem}>
          <strong>板块构造证据</strong>：印度板块与欧亚板块的强烈碰撞，导致横断山脉急剧抬升，迫使古金沙江河道沿着相对脆弱的断裂带发生转向。
        </li>
        <li style={styles.listItem}>
          <strong>河流袭夺经典</strong>：古长江通过强烈的溯源侵蚀，"袭夺"了原本南流的古金沙江上游河水，使其改道东流，形成统一的长江水系。
        </li>
        <li style={styles.listItem}>
          <strong>水文动力展示</strong>：江水在此流速骤变，形成独特的流水地貌，是研究河流侵蚀、搬运和堆积作用的天然实验室。
        </li>
      </ul>

      <h2 style={styles.subtitle}>二、地理意义——中华文明的地理基石</h2>
      <p style={styles.paragraph}>
        这一地理转折不仅改变了河流走向，更深刻影响了中华文明的发展格局。
      </p>
      <ul style={styles.list}>
        <li style={styles.listItem}>
          <strong>水系重组关键</strong>：正是这一转身，金沙江得以汇入东海，成为孕育中华文明的长江母亲河的重要组成部分。
        </li>
        <li style={styles.listItem}>
          <strong>气候影响深远</strong>：拐弯后江水东流，为长江中下游地区带来了丰沛的水汽和适宜的气候条件。
        </li>
        <li style={styles.listItem}>
          <strong>生态廊道枢纽</strong>：作为重要的生态过渡带，连接了青藏高原与云贵高原的生物多样性。
        </li>
      </ul>

      <h2 style={styles.subtitle}>三、研学价值——地理教学的天然课堂</h2>
      <p style={styles.paragraph}>
        长江第一湾是理解多个重要地理概念的理想场所。
      </p>
      <ul style={styles.list}>
        <li style={styles.listItem}>
          <strong>构造运动实例</strong>：直观展示板块碰撞如何塑造地表形态，是学习构造地质学的生动教材。
        </li>
        <li style={styles.listItem}>
          <strong>河流地貌典型</strong>：完整的河流袭夺证据链，包括袭夺湾、风口、倒淌河等典型地貌特征。
        </li>
        <li style={styles.listItem}>
          <strong>水文过程演示</strong>：可观测河流的侧蚀、下切作用，以及流速、流量与河道形态的关系。
        </li>
      </ul>

      <h2 style={styles.subtitle}>四、观测要点——科学考察的核心要素</h2>
      <p style={styles.paragraph}>
        在观景台进行实地考察时，应重点关注以下方面：
      </p>
      <ul style={styles.list}>
        <li style={styles.listItem}>
          <strong>宏观格局观察</strong>：从高处俯瞰完整的"Ω"形河道，理解其规模与形态特征。
        </li>
        <li style={styles.listItem}>
          <strong>地貌细节分析</strong>：观察两岸阶地分布、岩性差异，分析构造控制因素。
        </li>
        <li style={styles.listItem}>
          <strong>动态过程推测</strong>：根据现有地貌特征，推断历史时期的水文变化与河道演化。
        </li>
      </ul>

      <p style={styles.italicParagraph}>
        站在长江第一湾观景台，我们见证的不仅是一条江河的转向，更是地质历史长河中自然力量塑造大地的壮丽诗篇。
        这个转折点不仅改变了河流的命运，也深刻影响了中华文明的孕育与发展，是理解人地关系的重要窗口。
      </p>
    </div>
  </>
}

export const TigerLeapingGorge = () => {
  const styles = researchLinePositionTextStyle

  return <>
    <div className="tiger-leaping-gorge-intro" style={styles.container}>

      <h1 style={styles.title}>虎跳峡：金沙江的怒吼与地球的伤痕</h1>

      <p style={styles.paragraph}>
        虎跳峡位于云南省迪庆藏族自治州，金沙江在玉龙雪山与哈巴雪山之间奔腾而过，形成世界上最深、最险的峡谷之一。
        峡谷全长约16公里，江面与雪山峰顶高差达3900米，以"险"闻名天下，是板块运动造就的地质奇观。
      </p>

      <h2 style={styles.subtitle}>一、地质奇观——板块碰撞的壮丽诗篇</h2>

      <p style={styles.paragraph}>
        虎跳峡的形成是印度板块与欧亚板块持续碰撞的生动见证，记录了数百万年来地质演化的壮丽历程。
      </p>

      <ul style={styles.list}>
        <li style={styles.listItem}>
          <strong>深切峡谷典范</strong>：峡谷最窄处仅30余米，江心屹立着传说中的"虎跳石"，江水在此被压缩成汹涌激流，声震山谷。
        </li>
        <li style={styles.listItem}>
          <strong>垂直高差之最</strong>：从海拔5596米的玉龙雪山到1800米左右的江面，近4000米的垂直高差创造了世界峡谷深度的奇迹。
        </li>
        <li style={styles.listItem}>
          <strong>构造运动窗口</strong>：两岸陡峭的岩壁完整展示了断层构造、岩层褶皱等地质现象，是研究构造地质学的天然博物馆。
        </li>
      </ul>

      <h2 style={styles.subtitle}>二、水文动力——江河侵蚀的极致展现</h2>
      <p style={styles.paragraph}>
        金沙江在虎跳峡段展现出惊人的侵蚀能力，是研究河流动力学的理想场所。
      </p>
      <ul style={styles.list}>
        <li style={styles.listItem}>
          <strong>下切侵蚀典型</strong>：江水以每年数厘米的速度下切河谷，是地球上最活跃的下切河流之一。
        </li>
        <li style={styles.listItem}>
          <strong>水力作用强烈</strong>：汛期流量可达平常的数十倍，巨大的水流能量塑造着峡谷形态，搬运着大量泥沙石块。
        </li>
        <li style={styles.listItem}>
          <strong>阶地发育完整</strong>：峡谷两侧分布着多级河流阶地，记录了地质历史时期河流下切和构造抬升的过程。
        </li>
      </ul>

      <h2 style={styles.subtitle}>三、徒步圣地——探险者的地理课堂</h2>
      <p style={styles.paragraph}>
        虎跳峡徒步路线被誉为世界十大经典徒步线路之一，沿途展现丰富的地理现象。
      </p>
      <ul style={styles.list}>
        <li style={styles.listItem}>
          <strong>二十八道拐</strong>：徒步起点的高难度爬升段，可俯瞰峡谷全景，观察峡谷的宏观构造特征。
        </li>
        <li style={styles.listItem}>
          <strong>中虎跳</strong>：峡谷最险峻段，可近距离观察江水侵蚀作用，体验"满天星"礁石区的湍急水流。
        </li>
        <li style={styles.listItem}>
          <strong>一线天</strong>：峡谷收窄段，两岸岩壁近乎垂直，展示了断裂控制的峡谷发育模式。
        </li>
      </ul>

      <h2 style={styles.subtitle}>四、生态廊道——垂直带谱的完整展示</h2>
      <p style={styles.paragraph}>
        峡谷巨大的高差造就了完整的垂直生态带谱，是生物多样性研究的重要区域。
      </p>
      <ul style={styles.list}>
        <li style={styles.listItem}>
          <strong>干热河谷植被</strong>：谷底分布的稀树灌木丛，适应了干热的小气候环境。
        </li>
        <li style={styles.listItem}>
          <strong>中山湿性森林</strong>：海拔2000-3000米分布的原始森林，是滇金丝猴等重要物种的栖息地。
        </li>
        <li style={styles.listItem}>
          <strong>高山流石滩</strong>：海拔4000米以上分布的稀疏植被，展现了极限环境下的生命适应。
        </li>
      </ul>

      <p style={styles.italicParagraph}>
        虎跳峡不仅是一条地理界线，更是自然力量的象征。在这里，我们可以亲身感受地球内部力量与地表侵蚀作用的激烈碰撞，
        见证河流如何用千万年的时间在大地上刻下深深的痕迹。这座活的地质实验室，永远向勇于探索的人们敞开着大门。
      </p>
    </div>
  </>
}


export const GonggaMountain = () => {
  const styles = researchLinePositionTextStyle

  return <>
    <div className="gongga-mountain-intro" style={styles.container}>

      <h1 style={styles.title}>贡嘎山：蜀山之王与横断之巅</h1>

      <p style={styles.paragraph}>
        贡嘎山位于四川省康定以南，主峰海拔7556米，是横断山脉的最高峰，也是四川省的第一高峰，被誉为"蜀山之王"。
        这座金字塔状的极高山以其巨大的垂直高差、壮观的现代冰川和完整的垂直生态带谱，成为地理学研究的经典区域。
      </p>

      <h2 style={styles.subtitle}>一、极高山地貌——构造运动的巅峰之作</h2>

      <p style={styles.paragraph}>
        贡嘎山是印度板块与欧亚板块强烈碰撞挤压的产物，展现了新生代以来最剧烈的地壳抬升运动。
      </p>

      <ul style={styles.list}>
        <li style={styles.listItem}>
          <strong>巨大的相对高差</strong>：从大渡河谷地到主峰顶，水平距离仅29公里，高差却达6400余米，为世界之最。
        </li>
        <li style={styles.listItem}>
          <strong>典型的金字塔状峰体</strong>：主峰呈完美的金字塔造型，四壁陡峭，角峰尖锐，是冰川侵蚀作用的典型产物。
        </li>
        <li style={styles.listItem}>
          <strong>活跃的构造运动</strong>：作为青藏高原东缘的构造结，现今仍以每年3-5毫米的速度快速抬升，是研究现代地壳运动的天然实验室。
        </li>
      </ul>

      <h2 style={styles.subtitle}>二、冰川王国——东亚山地冰川的缩影</h2>
      <p style={styles.paragraph}>
        贡嘎山是全球中低纬度地区冰川最为发育的山地之一，现代冰川地貌类型齐全、特征典型。
      </p>
      <ul style={styles.list}>
        <li style={styles.listItem}>
          <strong>现代冰川发育</strong>：分布有74条现代冰川，总面积达256平方公里，其中海螺沟冰川最为著名。
        </li>
        <li style={styles.listItem}>
          <strong>完整的冰川序列</strong>：从粒雪盆、冰瀑布、冰川舌到冰碛垄，展示了完整的冰川系统。
        </li>
        <li style={styles.listItem}>
          <strong>冰川退缩见证</strong>：清晰的冰碛物序列记录了第四纪冰期以来冰川的进退历史，是研究全球变化的敏感指示器。
        </li>
      </ul>

      <h2 style={styles.subtitle}>三、垂直生态——山地垂直带谱的教科书</h2>
      <p style={styles.paragraph}>
        贡嘎山拥有我国乃至全球最完整的山地垂直自然带谱，从亚热带到永冻带依次分布。
      </p>
      <ul style={styles.list}>
        <li style={styles.listItem}>
          <strong>垂直带谱完整</strong>：7个明显的垂直自然带，从河谷的干旱灌丛到高山冰雪带，跨越了相当于从广东到北极的生态梯度。
        </li>
        <li style={styles.listItem}>
          <strong>森林线研究重点</strong>：海拔3600-4200米的暗针叶林带是研究高山林线形成机制的理想场所。
        </li>
        <li style={styles.listItem}>
          <strong>特有物种丰富</strong>：贡嘎山区域是许多珍稀特有物种的栖息地，如贡嘎杜鹃、雪豹、四川金丝猴等。
        </li>
      </ul>

      <h2 style={styles.subtitle}>四、地理界线——自然地理的重要分界</h2>
      <p style={styles.paragraph}>
        贡嘎山作为横断山脉的核心，是中国自然地理的重要分界线。
      </p>
      <ul style={styles.list}>
        <li style={styles.listItem}>
          <strong>气候分水岭</strong>：阻挡东南季风，形成东坡湿润、西坡干热的气候差异，是四川盆地与青藏高原的气候过渡带。
        </li>
        <li style={styles.listItem}>
          <strong>水系分界点</strong>：大渡河与雅砻江的分水岭，影响着长江上游的水系格局。
        </li>
        <li style={styles.listItem}>
          <strong>生物区系界线</strong>：东亚季风区与青藏高原区的生物地理分界，东西坡物种组成差异显著。
        </li>
      </ul>

      <p style={styles.italicParagraph}>
        贡嘎山不仅是一座地理意义上的高峰，更是一座科学研究的宝库。它见证了青藏高原的隆升历史，
        记录了气候变化的痕迹，展示了生物演化的奇迹。作为"蜀山之王"，它以其雄伟的身姿和丰富的内涵，
        永远吸引着地理学家、生态学家和登山探险者的目光，是理解横断山区乃至整个青藏高原东缘环境演化的关键所在。
      </p>
    </div>
  </>
}

export const BiranGorge = () => {
  const styles = researchLinePositionTextStyle

  return <>
    <div className="biran-gorge-intro" style={styles.container}>

      <h1 style={styles.title}>碧壤峡谷：隐秘的喀斯特地质画廊</h1>

      <p style={styles.paragraph}>
        碧壤峡谷位于云南省香格里拉县西北部，是香格里拉大峡谷的重要组成部分，以典型的喀斯特地貌、
        深邃的峡谷景观和丰富的生态多样性著称。峡谷全长约10公里，两岸峭壁如削，谷底溪流潺潺，
        是横断山区喀斯特地貌发育的典型代表。
      </p>

      <h2 style={styles.subtitle}>一、喀斯特奇观——石灰岩的天然雕塑</h2>

      <p style={styles.paragraph}>
        碧壤峡谷发育于三叠纪石灰岩地层中，经过千万年的溶蚀作用，形成了丰富多样的喀斯特地貌景观。
      </p>

      <ul style={styles.list}>
        <li style={styles.listItem}>
          <strong>峡谷溶蚀地貌</strong>：峡谷两侧发育有典型的溶沟、石芽、溶蚀洼地等喀斯特微地貌，记录了水对可溶性岩石的长期塑造过程。
        </li>
        <li style={styles.listItem}>
          <strong>垂直峭壁特征</strong>：峡谷深切，两岸峭壁近乎垂直，高度达1000-2000米，展示了强烈的构造抬升与河流下切的耦合作用。
        </li>
        <li style={styles.listItem}>
          <strong>溶洞系统发育</strong>：峡谷崖壁上分布着大小不一的溶洞，部分洞内可见石钟乳、石笋等次生化学沉积物。
        </li>
      </ul>

      <h2 style={styles.subtitle}>二、水文地质——地下与地表的水循环</h2>
      <p style={styles.paragraph}>
        碧壤峡谷是研究喀斯特地区水文地质过程的理想场所，展现了独特的水文地貌特征。
      </p>
      <ul style={styles.list}>
        <li style={styles.listItem}>
          <strong>地下河系统</strong>：典型的喀斯特水文系统，地表水通过落水洞转入地下，形成复杂的地下河网络。
        </li>
        <li style={styles.listItem}>
          <strong>泉水出露点</strong>：峡谷中多处可见喀斯特泉水从岩层中涌出，水质清澈，是研究地下水补排关系的良好地点。
        </li>
        <li style={styles.listItem}>
          <strong>季节性水文变化</strong>：雨季峡谷内溪流水量充沛，旱季则多转为地下径流，体现了喀斯特水文的强烈季节变异。
        </li>
      </ul>

      <h2 style={styles.subtitle}>三、生态秘境——峡谷生物多样性热点</h2>
      <p style={styles.paragraph}>
        峡谷独特的地形和小气候环境，造就了丰富的生物多样性和特殊的生态系统。
      </p>
      <ul style={styles.list}>
        <li style={styles.listItem}>
          <strong>垂直生态分异</strong>：从谷底到山顶，植被类型从湿性常绿阔叶林逐渐过渡到寒温性针叶林，体现了明显的垂直分异。
        </li>
        <li style={styles.listItem}>
          <strong>特有植物群落</strong>：峡谷内分布有多种珍稀植物，包括多种杜鹃、报春和龙胆等高山花卉，春季花开时节尤为壮观。
        </li>
        <li style={styles.listItem}>
          <strong>动物栖息地</strong>：为滇金丝猴、小熊猫、血雉等珍稀动物提供了重要的栖息环境和生态廊道。
        </li>
      </ul>

      <h2 style={styles.subtitle}>四、研学价值——喀斯特研究的天然课堂</h2>
      <p style={styles.paragraph}>
        碧壤峡谷为地理研学提供了丰富的内容和独特的视角。
      </p>
      <ul style={styles.list}>
        <li style={styles.listItem}>
          <strong>喀斯特发育过程观测</strong>：可直观观察溶蚀作用的各种形态，理解喀斯特地貌的发育机制。
        </li>
        <li style={styles.listItem}>
          <strong>岩石地层识别</strong>：清晰出露的石灰岩地层为地层划分和岩性识别提供了良好剖面。
        </li>
        <li style={styles.listItem}>
          <strong>生态适应性研究</strong>：峡谷特殊环境下的生物适应性进化是研究生物与环境关系的典型案例。
        </li>
      </ul>

      <p style={styles.italicParagraph}>
        碧壤峡谷犹如一部打开的喀斯特地质教科书，每一处岩壁、每一道沟壑都在诉说着水与岩石千万年的对话。
        这里不仅是地理学家研究喀斯特地貌的宝贵场所，也是自然爱好者探寻地质奇观和生态奥秘的理想之地。
        在这幽深的峡谷中，我们能够亲身感受大自然塑造地表形态的缓慢而坚定的力量。
      </p>
    </div>
  </>
}

export const AnzihePandaReserve = () => {
  const styles = researchLinePositionTextStyle

  return <>
    <div style={{ height: 300, width: '100%' }}>
      <Panda></Panda>
    </div>
    <div className="anzihe-panda-reserve-intro" style={styles.container}>

      <h1 style={styles.title}>鞍子河自然保护区：大熊猫的邛崃山系家园</h1>

      <p style={styles.paragraph}>
        鞍子河自然保护区位于四川省崇州市西北部，地处邛崃山脉中段，总面积达10141公顷。
        作为大熊猫岷山山系邛崃种群的重要栖息地，保护区以其完整的森林生态系统、丰富生物多样性和重要生态廊道功能，
        成为大熊猫保护网络中的关键节点。
      </p>

      <h2 style={styles.subtitle}>一、生态宝库——大熊猫的理想家园</h2>

      <p style={styles.paragraph}>
        保护区独特的地理位置和生态环境为大熊猫等珍稀物种提供了优质的生存空间。
      </p>

      <ul style={styles.list}>
        <li style={styles.listItem}>
          <strong>完整的垂直带谱</strong>：海拔从1200米至4582米，分布着从常绿阔叶林、针阔混交林到亚高山针叶林、高山灌丛草甸的完整植被带。
        </li>
        <li style={styles.listItem}>
          <strong>优质的竹林资源</strong>：保护区内分布有大面积箭竹、方竹等大熊猫喜食竹种，为大熊猫提供了充足的食物来源。
        </li>
        <li style={styles.listItem}>
          <strong>复杂地形地貌</strong>：深切峡谷、陡峭山坡和平缓台地相间分布，为大熊猫提供了多样的栖息环境和隐蔽场所。
        </li>
      </ul>

      <h2 style={styles.subtitle}>二、保护对象——珍稀物种的避难所</h2>
      <p style={styles.paragraph}>
        保护区不仅是大熊猫的重要栖息地，还是众多珍稀濒危物种的共同家园。
      </p>
      <ul style={styles.list}>
        <li style={styles.listItem}>
          <strong>大熊猫核心种群</strong>：保护区内分布有稳定的大熊猫种群，是大熊猫岷山种群基因交流的重要通道。
        </li>
        <li style={styles.listItem}>
          <strong>同域珍稀动物</strong>：与金丝猴、扭角羚、小熊猫、林麝等国家一级保护动物共享同一片栖息地。
        </li>
        <li style={styles.listItem}>
          <strong>特有植物资源</strong>：保护区内有珙桐、红豆杉等珍稀植物，构成了完整的生态系统基础。
        </li>
      </ul>

      <h2 style={styles.subtitle}>三、生态廊道——种群交流的生命通道</h2>
      <p style={styles.paragraph}>
        鞍子河保护区在大熊猫保护网络中发挥着不可替代的生态廊道功能。
      </p>
      <ul style={styles.list}>
        <li style={styles.listItem}>
          <strong>连接枢纽作用</strong>：连接着岷山山系的多个大熊猫保护区，促进不同种群间的基因交流。
        </li>
        <li style={styles.listItem}>
          <strong>廊道生态学研究</strong>：是研究野生动物迁徙通道、栖息地破碎化等生态学问题的理想场所。
        </li>
        <li style={styles.listItem}>
          <strong>保护生物学实践</strong>：开展栖息地恢复、生态监测等保护实践，为濒危物种保护提供示范。
        </li>
      </ul>

      <h2 style={styles.subtitle}>四、研学价值——保护生态学的户外课堂</h2>
      <p style={styles.paragraph}>
        保护区为地理学和生态学研学提供了丰富的研究内容和实践机会。
      </p>
      <ul style={styles.list}>
        <li style={styles.listItem}>
          <strong>栖息地评估研究</strong>：学习大熊猫栖息地质量评估方法，包括食物资源、地形适宜性、人为干扰等指标。
        </li>
        <li style={styles.listItem}>
          <strong>生物多样性监测</strong>：通过红外相机、样线调查等方法，监测野生动物种群动态和分布规律。
        </li>
        <li style={styles.listItem}>
          <strong>保护管理实践</strong>：了解自然保护区管理策略，包括巡护监测、社区共管、生态旅游等保护措施。
        </li>
      </ul>

      <p style={styles.italicParagraph}>
        鞍子河自然保护区不仅是大熊猫等珍稀物种的生存堡垒，更是人与自然和谐共生的实践基地。
        在这里，我们能够亲身感受生物多样性的丰富与脆弱，理解生态系统保护的紧迫与重要。
        这片绿色的家园提醒着我们，保护大熊猫不仅仅是保护一个物种，更是保护整个生态系统的完整与健康，
        保护我们共同的地球家园。
      </p>
    </div>
  </>
}

export const AbiesFaxoniana = () => {
  const styles = researchLinePositionTextStyle

  return <>
    <div style={{ height: 300, width: '100%' }}>
      <Dianlengshan></Dianlengshan>
    </div>
    <div className="abies-faxoniana-intro" style={styles.container}>

      <h1 style={styles.title}>滇冷杉：横断山区的亚高山卫士</h1>

      <p style={styles.paragraph}>
        滇冷杉（Abies faxoniana）是松科冷杉属的常绿乔木，中国特有种，主要分布于横断山区海拔2800-4000米的亚高山地带。
        作为暗针叶林的建群种，滇冷杉林在维持区域生态平衡、涵养水源和保护生物多样性方面发挥着不可替代的作用，
        是横断山区垂直带谱中重要的生态指示物种。
      </p>

      <h2 style={styles.subtitle}>一、形态特征——适应高寒的生存智慧</h2>

      <p style={styles.paragraph}>
        滇冷杉在长期演化过程中形成了独特的形态特征，使其能够很好地适应亚高山寒冷湿润的环境。
      </p>

      <ul style={styles.list}>
        <li style={styles.listItem}>
          <strong>树形与树皮</strong>：高大挺拔，可达40米，胸径达1米；树皮深灰色，不规则块状开裂，具有很好的抗寒隔热性能。
        </li>
        <li style={styles.listItem}>
          <strong>叶片特征</strong>：线形叶片扁平，先端凹缺，叶背有两条白色气孔带，既减少水分蒸腾又提高光合效率。
        </li>
        <li style={styles.listItem}>
          <strong>球果独特</strong>：圆柱形球果成熟时紫黑色，苞鳞短于种鳞，种子具翅，有利于风力传播。
        </li>
      </ul>

      <h2 style={styles.subtitle}>二、生态分布——垂直地带性的标志</h2>
      <p style={styles.paragraph}>
        滇冷杉的分布严格受海拔和气候条件控制，是研究山地垂直带谱的理想指示物种。
      </p>
      <ul style={styles.list}>
        <li style={styles.listItem}>
          <strong>海拔范围明确</strong>：集中分布在2800-4000米，上接高山灌丛草甸带，下连云杉、铁杉为主的针阔混交林带。
        </li>
        <li style={styles.listItem}>
          <strong>生境偏好明显</strong>：喜冷湿气候，多生长在阴坡、半阴坡，要求年降水量800毫米以上，空气湿度大的环境。
        </li>
        <li style={styles.listItem}>
          <strong>地理分布特征</strong>：主要分布于四川西部、云南西北部和西藏东南部，是横断山区的特有种和建群种。
        </li>
      </ul>

      <h2 style={styles.subtitle}>三、生态功能——森林生态系统的重要基石</h2>
      <p style={styles.paragraph}>
        滇冷杉林在维持区域生态平衡和提供生态服务方面具有多重重要功能。
      </p>
      <ul style={styles.list}>
        <li style={styles.listItem}>
          <strong>水源涵养作用</strong>：林冠截留降水，枯落物层蓄水，根系固土，是重要的"绿色水库"。
        </li>
        <li style={styles.listItem}>
          <strong>土壤保持功能</strong>：发达的根系网络有效固定土壤，防止水土流失，维护山地生态安全。
        </li>
        <li style={styles.listItem}>
          <strong>碳汇能力突出</strong>：生物量大，生长周期长，在固定大气二氧化碳、缓解气候变化方面作用显著。
        </li>
      </ul>

      <h2 style={styles.subtitle}>四、群落特征——完整的生态系统结构</h2>
      <p style={styles.paragraph}>
        滇冷杉林形成了结构复杂、物种丰富的森林群落，为众多生物提供了栖息环境。
      </p>
      <ul style={styles.list}>
        <li style={styles.listItem}>
          <strong>群落结构完整</strong>：具有明显的乔木层、灌木层、草本层和苔藓层，形成多层次垂直结构。
        </li>
        <li style={styles.listItem}>
          <strong>附生植物丰富</strong>：树干和树枝上常附生有多种松萝、苔藓和地衣，形成独特的"空中花园"。
        </li>
        <li style={styles.listItem}>
          <strong>动物栖息天堂</strong>：为滇金丝猴、小熊猫、血雉等珍稀动物提供食物和隐蔽场所。
        </li>
      </ul>

      <p style={styles.italicParagraph}>
        滇冷杉作为横断山区亚高山暗针叶林的代表树种，不仅是地理环境的重要指示者，更是生态系统健康的关键维护者。
        在这片冷杉林中，我们可以观察到植物对高寒环境的精妙适应，见证物种间复杂的相互关系，
        理解森林生态系统在维持区域生态平衡中的核心作用。保护滇冷杉林，就是保护横断山区重要的生态屏障和水源命脉。
      </p>
    </div>
  </>
}

export const VerticalNatureAreaChart = (props: any) => {

  const { otherPosition } = props

  const instance = useRef<HTMLDivElement>(null)

  const chartInstance = useRef<echarts.ECharts>(null)

  const initCharts = () => {
    const chartDom = instance.current

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartDom, 'dark');
    }

    chartInstance.current!.resize()

    const option = {
      color: ['#025402', '#007400', '#009c00', '#aaedaa', '#7b7b7b', '#dfdfdf'],
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : 海拔约{c}米'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: ['针阔混交林带', '针叶林带', '灌丛木带', '高山草甸带', '高寒荒漠带', '积雪冰川带']
      },
      series: [
        {
          name: '贡嘎山垂直自然带',
          type: 'funnel',
          width: '50%',
          height: '50%',
          data: [
            { value: 2500, name: '针阔混交林带' },
            { value: 3000, name: '针叶林带', },
            { value: 3500, name: '灌丛木带', },
            { value: 4000, name: '高山草甸带', },
            { value: 4500, name: '高寒荒漠带', },
            { value: 5000, name: '积雪冰川带', },
          ]
        },

      ]
    };

    chartInstance.current.setOption(option, true);

    window.addEventListener('resize', () => {
      chartInstance.current!.resize()
    })
  }

  useEffect(() => {
    initCharts()

  }, [otherPosition])

  return <div style={{ width: '400px', maxWidth: '100%', height: '500px' }} ref={instance} key={otherPosition}></div>
}