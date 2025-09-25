import * as Cesium from "cesium";
import { useEffect, useRef } from "react";
import * as gui from 'lil-gui'
import SampleLabel from "@/utils/plugins/sample-label";
import { notification } from "antd";

const HengduanMountains = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);
  const [notificationApi, notificationContextHolder] = notification.useNotification();

  const guiRef = useRef<gui.GUI | null>(null);

  const provinceRef = useRef<Cesium.Entity[]>([]);

  const HengduanMountainsDiagramRef = useRef<Cesium.Entity[]>([]);
  const changjiangRiverRef = useRef<Cesium.Entity[]>([]);
  const lancangRiverRef = useRef<Cesium.Entity[]>([]);
  const nujiangRiverRef = useRef<Cesium.Entity[]>([]);
  const dulongjiangRiverRef = useRef<Cesium.Entity[]>([]);
  const jinshajiangRiverRef = useRef<Cesium.Entity[]>([]);
  const minjiangRiverRef = useRef<Cesium.Entity[]>([]);
  const yalongjiangRiverRef = useRef<Cesium.Entity[]>([]);
  const daduheRiverRef = useRef<Cesium.Entity[]>([]);
  const chinaClimateDistributionRef = useRef<Cesium.Entity[]>([]);

  const pandaRef = useRef<any[]>([]);

  const shanshuRef = useRef<any[]>([]);

  const higherMountainPonitInstanceList = useRef<{
    position: Cesium.Cartesian3
    text: string,
    instance: SampleLabel
    key: string
  }[]>([]);


  const showShanshuDetails = (value: boolean) => {
    if (value) {
      notificationApi.info({
        message: `滇冷杉`,
        description:
          <div style={{ textIndent: '2em' }}>
            <p>滇冷杉是分布于中国西南横断山脉及青藏高原东南缘的特有树种，多生长于海拔2500-4000米的高山针叶林带。 </p>
            <p>其树冠呈尖塔形，叶片条形具芳香气味，球果成熟时呈黑褐色。</p>
            <p>作为水源涵养林的主要组成树种，该物种在维持区域生态平衡中发挥重要作用。</p>
            <p> 研究表明，第四纪冰期时滇冷杉曾以云南鹤庆盆地为避难所，现代分布区的稳定性与温度季节性和降雨季节性变化密切相关。</p>
          </div>,
        placement: 'bottomLeft',
        duration: null,
      });
    } else {
      notificationApi.destroy();
    }

  }
  const showPandaDetails = (value: boolean) => {
    if (value) {
      notificationApi.info({

        message: `大熊猫`,
        description:
          <div style={{ textIndent: '2em' }}>
            <p>大熊猫是中国特有的哺乳动物，属于熊科、大熊猫属，被誉为“活化石”和“中国国宝”。</p>
            <p>它们栖息在海拔2600-3500米的茂密竹林中，以竹子为主要食物。</p>
            <p>外表肥硕、黑白相间，善于爬树。野外寿命约18-20岁，数量有所增长，截至2021年1月，中国大熊猫野生种群达1864只。</p>
          </div>,
        placement: 'bottomLeft',
        duration: null,
      });
    } else {
      notificationApi.destroy();
    }

  }

  const showGonggashanDetails = (value: boolean) => {
    if (value) {
      notificationApi.info({

        message: `贡嘎山`,
        description: <div style={{ textIndent: '2em' }}>
          <p>贡嘎山（岷雅贡嘎，英语：Minya Konka），为横断山系大雪山主峰，被当地人称为木雅贡嘎。</p>
          <p>位于四川省甘孜藏族自治州康定市、泸定县、九龙县和雅安市石棉县之间。藏语的“贡”是冰雪之意，“嘎”为白色，意为白色冰山。</p>
          <p>贡嘎山主峰海拔7508.9米（2023年公布 [18]），是四川省最高的山峰，被称为“蜀山之王”，为世界上高差最大的山之一，周围有海拔6000米上的高峰45座。</p>
          <p>贡嘎山北起康定折多山口，南抵泸定田湾河东到大渡河西至雅砻江。以贡嘎雪山为中心的贡嘎山风景名胜区是中国面积最大、环境容量最大的风景区。</p>
          <p>在长期冰川作用下，山峰发育为锥状大角峰，周围绕着60°～70°的峭壁，攀登困难。</p>
          <p>贡嘎山有海螺沟、巴旺、燕子沟、磨子沟等冰川和木格措、五须海、巴旺海等高原湖泊以及康定二道桥等温泉，也是全球25个生物多样性热点地区之一。</p>
          <p>周围有小贡嘎山、嘉子峰、日乌且峰、勒多曼因峰等雪山环绕。以日照金山奇观出名。 </p>
        </div>,
        placement: 'bottomLeft',
        duration: null,
      });
    } else {
      notificationApi.destroy();
    }

  }

  const initHigherMountainPonit = () => {

    higherMountainPonitInstanceList.current = [
      {
        position: Cesium.Cartesian3.fromDegrees(101.88123898839554, 29.5935768399523, 7100.9),
        text: '贡嘎山',
        instance: null,
        key: 'gonggashan'
      },
    ].map(item => {
      const instance = new SampleLabel(viewerRef.current!, item.position, item.text, {
        containerBackgroundUrlType: 'position',
        defaultVisible: false,
      });

      return {
        ...item,
        instance
      }
    })
  }

  const getCameraParams = () => {
    const camera = viewerRef.current!.camera;

    // 获取相机位置（笛卡尔坐标）
    const position = camera.position;

    // 获取方向参数
    const heading = camera.heading;
    const pitch = camera.pitch;
    const roll = camera.roll;


    // 转换为经纬度
    const cartographic = Cesium.Cartographic.fromCartesian(position);
    const lon = Cesium.Math.toDegrees(cartographic.longitude);
    const lat = Cesium.Math.toDegrees(cartographic.latitude);
    const height = cartographic.height;

    // 生成flyTo代码
    const code = `viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(${lon.toFixed(8)}, ${lat.toFixed(8)}, ${height.toFixed(2)}),
    orientation: {
        heading: ${heading},
        pitch: ${pitch},
        roll: ${roll}
    }
});`;

    console.log(code);

    return code;
  }

  const drawHengduanMountainsDiagram = (checked: boolean) => {
    if (checked) {

      if (HengduanMountainsDiagramRef.current?.length) {

        HengduanMountainsDiagramRef.current.forEach(item => {
          item.show = true
        })

      } else {

        fetch(window.$$prefix + "/data/hengduan-mountains/hengduan-mountains-area.geojson")
          .then(res => res.json())
          .then(data => {
            Cesium.GeoJsonDataSource.load(data, {
              stroke: Cesium.Color.ORANGE,
              fill: Cesium.Color.ORANGE.withAlpha(0.5),
              strokeWidth: 2,
              markerSymbol: "circle"
            }).then(function (dataSource) {
              viewerRef.current!.dataSources.add(dataSource)
              HengduanMountainsDiagramRef.current = dataSource.entities.values

              HengduanMountainsDiagramRef.current.push(viewerRef.current!.entities.add({
                position: Cesium.Cartesian3.fromDegrees(99.98771658991963, 30.29968842554559),
                label: {
                  text: "横断山区",
                  font: "20px sans-serif",
                  style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                  outlineWidth: 2,
                  outlineColor: Cesium.Color.WHITE,
                  fillColor: Cesium.Color.BLACK,
                }
              }))
            })
          });

      }

    } else {
      HengduanMountainsDiagramRef.current!.forEach(item => {
        item.show = false
      })
    }
  }

  const drawChangjiangRiver = (checked: boolean) => {
    if (checked) {

      if (changjiangRiverRef.current?.length) {

        changjiangRiverRef.current.forEach(item => {
          item.show = true
        })

      } else {

        fetch(window.$$prefix + "/data/hengduan-mountains/changjiang-river.geojson")
          .then(res => res.json())
          .then(data => {
            Cesium.GeoJsonDataSource.load(data, {
              stroke: Cesium.Color.AQUA,
              fill: Cesium.Color.AQUA.withAlpha(1),
              strokeWidth: 2,
              markerSymbol: "circle"
            }).then(function (dataSource) {

              viewerRef.current!.dataSources.add(dataSource)

              changjiangRiverRef.current = dataSource.entities.values
            })
          });

      }

    } else {
      changjiangRiverRef.current!.forEach(item => {
        item.show = false
      })
    }

  }

  const drawLancangRiver = (checked: boolean) => {
    if (checked) {

      if (lancangRiverRef.current?.length) {

        lancangRiverRef.current.forEach(item => {
          item.show = true
        })

      } else {

        fetch(window.$$prefix + "/data/hengduan-mountains/lancang-river.geojson")
          .then(res => res.json())
          .then(data => {
            Cesium.GeoJsonDataSource.load(data, {
              stroke: Cesium.Color.AQUA,
              fill: Cesium.Color.AQUA.withAlpha(1),
              strokeWidth: 2,
              markerSymbol: "circle"
            }).then(function (dataSource) {

              viewerRef.current!.dataSources.add(dataSource)

              lancangRiverRef.current = dataSource.entities.values
            })
          });

      }

    } else {
      lancangRiverRef.current!.forEach(item => {
        item.show = false
      })
    }
  }

  const drawNujiangRiver = (checked: boolean) => {
    if (checked) {

      if (nujiangRiverRef.current?.length) {

        nujiangRiverRef.current.forEach(item => {
          item.show = true
        })

      } else {

        fetch(window.$$prefix + "/data/hengduan-mountains/nujiang-river.geojson")
          .then(res => res.json()).then(data => {
            Cesium.GeoJsonDataSource.load(data, {
              stroke: Cesium.Color.AQUA,
              fill: Cesium.Color.AQUA.withAlpha(1),
              strokeWidth: 2,
              markerSymbol: "circle"
            }).then(function (dataSource) {

              viewerRef.current!.dataSources.add(dataSource)

              nujiangRiverRef.current = dataSource.entities.values
            })
          });
      }
    } else {
      nujiangRiverRef.current!.forEach(item => {
        item.show = false
      })
    }
  }

  const drawDulongjiangRiver = (checked: boolean) => {
    if (checked) {

      if (dulongjiangRiverRef.current?.length) {

        dulongjiangRiverRef.current.forEach(item => {
          item.show = true
        })

      } else {

        fetch(window.$$prefix + "/data/hengduan-mountains/dulongjiang-river.geojson")
          .then(res => res.json()).then(data => {
            Cesium.GeoJsonDataSource.load(data, {
              stroke: Cesium.Color.AQUA,
              fill: Cesium.Color.AQUA.withAlpha(1),
              strokeWidth: 2,
              markerSymbol: "circle"
            }).then(function (dataSource) {

              viewerRef.current!.dataSources.add(dataSource)

              dulongjiangRiverRef.current = dataSource.entities.values
            })
          });
      }
    } else {
      dulongjiangRiverRef.current!.forEach(item => {
        item.show = false
      })
    }
  }

  const drawJinshajiangRiver = (checked: boolean) => {
    if (checked) {

      if (jinshajiangRiverRef.current?.length) {

        jinshajiangRiverRef.current.forEach(item => {
          item.show = true
        })

      } else {

        fetch(window.$$prefix + "/data/hengduan-mountains/jinshajiang-river.geojson")
          .then(res => res.json()).then(data => {
            Cesium.GeoJsonDataSource.load(data, {
              stroke: Cesium.Color.AQUA,
              fill: Cesium.Color.AQUA.withAlpha(1),
              strokeWidth: 2,
              markerSymbol: "circle"
            }).then(function (dataSource) {

              viewerRef.current!.dataSources.add(dataSource)

              jinshajiangRiverRef.current = dataSource.entities.values
            })
          });
      }
    } else {
      jinshajiangRiverRef.current!.forEach(item => {
        item.show = false
      })
    }
  }

  const drawMinjiangRiver = (checked: boolean) => {
    if (checked) {

      if (minjiangRiverRef.current?.length) {

        minjiangRiverRef.current.forEach(item => {
          item.show = true
        })

      } else {

        fetch(window.$$prefix + "/data/hengduan-mountains/minjiang-river.geojson")
          .then(res => res.json()).then(data => {
            Cesium.GeoJsonDataSource.load(data, {
              stroke: Cesium.Color.AQUA,
              fill: Cesium.Color.AQUA.withAlpha(1),
              strokeWidth: 2,
              markerSymbol: "circle"
            }).then(function (dataSource) {

              viewerRef.current!.dataSources.add(dataSource)

              minjiangRiverRef.current = dataSource.entities.values
            })
          });
      }
    } else {
      minjiangRiverRef.current!.forEach(item => {
        item.show = false
      })
    }
  }

  const drawYalongjiangRiver = (checked: boolean) => {
    if (checked) {

      if (yalongjiangRiverRef.current?.length) {

        yalongjiangRiverRef.current.forEach(item => {
          item.show = true
        })

      } else {

        fetch(window.$$prefix + "/data/hengduan-mountains/yalongjiang-river.geojson")
          .then(res => res.json()).then(data => {
            Cesium.GeoJsonDataSource.load(data, {
              stroke: Cesium.Color.AQUA,
              fill: Cesium.Color.AQUA.withAlpha(1),
              strokeWidth: 2,
              markerSymbol: "circle"
            }).then(function (dataSource) {

              viewerRef.current!.dataSources.add(dataSource)

              yalongjiangRiverRef.current = dataSource.entities.values
            })
          });
      }
    } else {
      yalongjiangRiverRef.current!.forEach(item => {
        item.show = false
      })
    }
  }

  const drawDaduheRiver = (checked: boolean) => {
    if (checked) {

      if (daduheRiverRef.current?.length) {

        daduheRiverRef.current.forEach(item => {
          item.show = true
        })

      } else {

        fetch(window.$$prefix + "/data/hengduan-mountains/daduhe-river.geojson")
          .then(res => res.json()).then(data => {
            Cesium.GeoJsonDataSource.load(data, {
              stroke: Cesium.Color.AQUA,
              fill: Cesium.Color.AQUA.withAlpha(1),
              strokeWidth: 2,
              markerSymbol: "circle"
            }).then(function (dataSource) {

              viewerRef.current!.dataSources.add(dataSource)

              daduheRiverRef.current = dataSource.entities.values
            })
          });
      }
    } else {
      daduheRiverRef.current!.forEach(item => {
        item.show = false
      })
    }
  }

  const drawShanshu = async (checked: boolean) => {
    if (!viewerRef.current) return;

    if (!checked) {
      // 隐藏已有熊猫
      shanshuRef.current?.forEach(model => {
        model.show = false;
      });
      return;
    }

    if (shanshuRef.current?.length) {
      // 已存在模型，显示即可
      shanshuRef.current.forEach(model => {
        model.show = true;
      });
      return;
    }

    // 熊猫列表
    const pandaList = [

      { lon: 103.47117565227755, lat: 32.63255030483799, name: 'shanshu-01', uri: window.$$prefix + '/models/tree/scene.gltf', scale: 8, rotation: { z: 0 } },
      { lon: 103.48117565227755, lat: 32.63255030483799, name: 'shanshu-01', uri: window.$$prefix + '/models/tree/scene.gltf', scale: 8, rotation: { z: 0 } },
    ];

    // 转 Cartographic
    const cartos = pandaList.map(item => Cesium.Cartographic.fromDegrees(item.lon, item.lat));

    // 获取最精细地形高度
    const updatedCartos = await Cesium.sampleTerrainMostDetailed(viewerRef.current.terrainProvider, cartos);

    // 加载模型到 primitives
    shanshuRef.current = [];

    for (let i = 0; i < pandaList.length; i++) {
      const item = pandaList[i];
      const carto = updatedCartos[i];

      // 最终高度 = 地形高度 + 5 米偏移
      const finalHeight = (carto.height || 0) + 1;

      const position = Cesium.Cartesian3.fromRadians(carto.longitude, carto.latitude, finalHeight);

      // 朝向
      const hpr = new Cesium.HeadingPitchRoll(
        Cesium.Math.toRadians(item.rotation.z),
        0,
        0
      );

      // 固定矩阵
      const modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(position, hpr);



      // 加载模型
      const model = await Cesium.Model.fromGltfAsync({
        url: item.uri,
        modelMatrix,
        scale: item.scale
      });

      viewerRef.current.scene.primitives.add(model);
      shanshuRef.current.push(model);
    }
  }

  const drawPanda = async (checked: boolean) => {
    if (!viewerRef.current) return;

    if (!checked) {
      // 隐藏已有熊猫
      pandaRef.current?.forEach(model => {
        model.show = false;
      });
      return;
    }

    if (pandaRef.current?.length) {
      // 已存在模型，显示即可
      pandaRef.current.forEach(model => {
        model.show = true;
      });
      return;
    }

    // 熊猫列表
    const pandaList = [
      { lon: 103.32256515068411, lat: 32.704699998237025, name: 'panda-01', uri: window.$$prefix + '/models/panda/scene.gltf', scale: 120, rotation: { z: 90 } },
      { lon: 103.32959582119511, lat: 32.704699998237025, name: 'panda-02', uri: window.$$prefix + '/models/panda/scene.gltf', scale: 120, rotation: { z: 0 } },
      { lon: 103.3388788815005, lat: 32.704699998237025, name: 'panda-03', uri: window.$$prefix + '/models/panda/scene.gltf', scale: 120, rotation: { z: 180 } },
      { lon: 103.34799934747307, lat: 32.704699998237025, name: 'panda-04', uri: window.$$prefix + '/models/panda/scene.gltf', scale: 120, rotation: { z: 0 } },
    ];

    // 转 Cartographic
    const cartos = pandaList.map(item => Cesium.Cartographic.fromDegrees(item.lon, item.lat));

    // 获取最精细地形高度
    const updatedCartos = await Cesium.sampleTerrainMostDetailed(viewerRef.current.terrainProvider, cartos);

    // 加载模型到 primitives
    pandaRef.current = [];

    for (let i = 0; i < pandaList.length; i++) {
      const item = pandaList[i];
      const carto = updatedCartos[i];

      // 最终高度 = 地形高度 + 5 米偏移
      const finalHeight = (carto.height || 0) + 1;
      const position = Cesium.Cartesian3.fromRadians(carto.longitude, carto.latitude, finalHeight);

      // 朝向
      const hpr = new Cesium.HeadingPitchRoll(
        Cesium.Math.toRadians(item.rotation.z),
        0,
        0
      );

      // 固定矩阵
      const modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(position, hpr);



      // 加载模型
      const model = await Cesium.Model.fromGltfAsync({
        url: item.uri,
        modelMatrix,
        scale: item.scale
      });

      viewerRef.current.scene.primitives.add(model);
      pandaRef.current.push(model);
    }
  };

  const drawProvince = (checked: boolean) => {
    if (checked) {

      if (provinceRef.current?.length) {

        provinceRef.current.forEach(item => {
          item.show = true
        })

      } else {

        fetch(window.$$prefix + "/data/hengduan-mountains/province.geojson").then(res => res.json()).then(data => {
          Cesium.GeoJsonDataSource.load(data, {
            stroke: Cesium.Color.PINK,
            fill: Cesium.Color.PINK.withAlpha(0.5),
            strokeWidth: 0.5,
            markerSymbol: "circle"
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)
            provinceRef.current = dataSource.entities.values

            //西藏
            provinceRef.current.push(      // 绘制文字
              viewerRef.current!.entities.add({
                position: Cesium.Cartesian3.fromDegrees(87.80433606069074, 31.28797794125832),
                label: {
                  text: "西藏",
                  font: "20px sans-serif",
                  style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                  outlineWidth: 2,
                  outlineColor: Cesium.Color.WHITE,
                  fillColor: Cesium.Color.YELLOW,
                }
              }))

            provinceRef.current.push(      // 绘制文字
              viewerRef.current!.entities.add({
                position: Cesium.Cartesian3.fromDegrees(105.64506790860854, 31.491911447835545),
                label: {
                  text: "四川",
                  font: "20px sans-serif",
                  style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                  outlineWidth: 2,
                  outlineColor: Cesium.Color.WHITE,
                  fillColor: Cesium.Color.YELLOW,
                }
              }))


            provinceRef.current.push(      // 绘制文字
              viewerRef.current!.entities.add({
                position: Cesium.Cartesian3.fromDegrees(101.76608100350815, 24.12377274429042),
                label: {
                  text: "云南",
                  font: "20px sans-serif",
                  style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                  outlineWidth: 2,
                  outlineColor: Cesium.Color.WHITE,
                  fillColor: Cesium.Color.WHITE,
                }
              }))
          });

        });
      }

    } else {
      provinceRef.current!.forEach(item => {
        item.show = false
      })
    }

  };


  const drawChinaClimateDistribution = (checked: boolean) => {
    if (checked) {

      if (chinaClimateDistributionRef.current?.length) {

        chinaClimateDistributionRef.current.forEach(item => {
          item.show = true
        })

      } else {

        fetch(window.$$prefix + "/data/china/china-climate-distribution.geojson")
          .then(res => res.json())
          .then(data => {
            // 为5种气候类型定义颜色方案
            const climateColors: any = {
              '高原山地气候': {
                fill: Cesium.Color.fromCssColorString('#4A90E2').withAlpha(0.6), // 冷蓝色
                stroke: Cesium.Color.fromCssColorString('#2C5AA0'),
                textPosition: [92.09404483908936, 34.53784283747934],
              },
              '热带季风气候': {
                fill: Cesium.Color.fromCssColorString('#FF6B6B').withAlpha(0.6), // 暖红色
                stroke: Cesium.Color.fromCssColorString('#D64545'),
                textPosition: [100.81780521173025, 22.46855638524489],
              },
              '温带大陆性气候': {
                fill: Cesium.Color.fromCssColorString('#FFA726').withAlpha(0.6), // 橙色
                stroke: Cesium.Color.fromCssColorString('#F57C00'),
                textPosition: [107.72144131427258, 40.440585432301184],
              },
              '亚热带季风气候': {
                fill: Cesium.Color.fromCssColorString('#66BB6A').withAlpha(0.6), // 绿色
                stroke: Cesium.Color.fromCssColorString('#388E3C'),
                textPosition: [109.47667037219985, 29.4584931073585],
              },
              '温带季风气候': {
                fill: Cesium.Color.fromCssColorString('#AB47BC').withAlpha(0.6), // 紫色
                stroke: Cesium.Color.fromCssColorString('#8E24AA'),
                textPosition: [112.99830415726292, 36.593583520746385],
              }
            };

            // 获取所有唯一的名称
            const uniqueNames = [...new Set(data.features.map((feature: any) => feature.properties.name))];

            Cesium.GeoJsonDataSource.load(data, {
              stroke: Cesium.Color.BLACK.withAlpha(0),
              strokeWidth: 0,
              fill: Cesium.Color.WHITE.withAlpha(0)
            }).then(function (dataSource) {
              viewerRef.current!.dataSources.add(dataSource);

              const entities = dataSource.entities.values;
              chinaClimateDistributionRef.current = entities;

              // 根据气候类型设置颜色
              entities.forEach(entity => {
                const climateType = entity.name;
                if (climateType && climateColors[climateType]) {
                  const colorScheme = climateColors[climateType];
                  if (entity.polygon) {
                    entity.polygon.material = colorScheme.fill;
                    // @ts-ignore
                    entity.polygon.outline = false;
                    entity.polygon.outlineColor = colorScheme.stroke;
                    // @ts-ignore
                    entity.polygon.outlineWidth = 0;
                  }
                }
              });

              // 添加文字标签
              Object.keys(climateColors).forEach(climateType => {
                const colorScheme = climateColors[climateType];
                if (colorScheme.textPosition) {
                  const [longitude, latitude] = colorScheme.textPosition;

                  // 创建文字标签
                  const text = viewerRef.current!.entities.add({
                    position: Cesium.Cartesian3.fromDegrees(longitude, latitude),
                    label: {
                      text: climateType,
                      font: '16pt Microsoft YaHei', // 使用微软雅黑字体，更清晰
                      fillColor: Cesium.Color.WHITE,
                      outlineColor: Cesium.Color.BLACK, // 黑色描边，增加可读性
                      outlineWidth: 3,
                      pixelOffset: new Cesium.Cartesian2(0, 0),
                      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                      scale: 1.0,
                      horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                      verticalOrigin: Cesium.VerticalOrigin.CENTER,
                      showBackground: false
                    }
                  });

                  chinaClimateDistributionRef.current.push(text)
                }
              });

              console.log("气候分布分类:", uniqueNames);
            });
          });
      }

    } else {
      chinaClimateDistributionRef.current!.forEach(item => {
        item.show = false
      })
    }
  };


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
    drawPanda: false,

    drawShanshu: false,

    getCameraParams: () => {
      getCameraParams()
    },
  };



  const initGui = () => {
    if (guiRef.current) {
      guiRef.current.destroy()
      guiRef.current = null
    }

    guiRef.current = new gui.GUI({})

    guiRef.current.title('横断山')

    guiRef.current.add(guiControls, 'getCameraParams').name('获取相机参数')

    const mainAreaControls = guiRef.current.addFolder('主要区域');

    const mainRiverControls = guiRef.current.addFolder('主要河流');

    const climateControls = guiRef.current.addFolder('气候');

    const plantControls = guiRef.current.addFolder('植被');

    const animalsControls = guiRef.current.addFolder('动物');


    /* 主要区域 */

    mainAreaControls.add(guiControls, 'drawProvince').name('相关省域').onChange((value: boolean) => {
      drawProvince(value)
    })

    mainAreaControls.add(guiControls, 'drawHengduanMountainsDiagram').name('横断山区').onChange((value: boolean) => {
      drawHengduanMountainsDiagram(value)
    })

    mainAreaControls.add(guiControls, 'drawHigherMountainPoint').name('最高峰').onChange((value: boolean) => {
      higherMountainPonitInstanceList.current.forEach(item => {
        item.instance.toggleVisible(value)
      })

      showGonggashanDetails(value)

      if (value) {
        viewerRef.current!.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(101.81087885, 29.52080401, 7599.75),
          orientation: {
            heading: 0.6762693278851586,
            pitch: -0.042912143092978194,
            roll: 0.0001878768739276282
          }
        });
      }
    })


    /* 主要河流 */
    mainRiverControls.add(guiControls, 'drawChangjiangRiver').name('长江').onChange((value: boolean) => {
      drawChangjiangRiver(value)

      if (value) {
        viewerRef.current!.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(106.49566264, 33.80768620, 2000000),
        });
      }
    })


    mainRiverControls.add(guiControls, 'drawDulongjiangRiver').name('独龙江').onChange((value: boolean) => {
      drawDulongjiangRiver(value)
      if (value) {
        viewerRef.current!.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(106.49566264, 33.80768620, 2000000),
        });
      }
    })

    mainRiverControls.add(guiControls, 'drawNujiangRiver').name('怒江').onChange((value: boolean) => {
      drawNujiangRiver(value)
      if (value) {
        viewerRef.current!.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(106.49566264, 33.80768620, 2000000),
        });
      }
    })

    mainRiverControls.add(guiControls, 'drawLancangRiver').name('澜沧江').onChange((value: boolean) => {
      drawLancangRiver(value)
      if (value) {
        viewerRef.current!.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(106.49566264, 33.80768620, 2000000),
        });
      }
    })


    mainRiverControls.add(guiControls, 'drawJinshajiangRiver').name('金沙江').onChange((value: boolean) => {
      drawJinshajiangRiver(value)
      if (value) {
        viewerRef.current!.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(106.49566264, 33.80768620, 2000000),
        });
      }
    })

    mainRiverControls.add(guiControls, 'drawYalongjiangRiver').name('雅砻江').onChange((value: boolean) => {
      drawYalongjiangRiver(value)
      if (value) {
        viewerRef.current!.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(106.49566264, 33.80768620, 2000000),
        });
      }
    })


    mainRiverControls.add(guiControls, 'drawDaduheRiver').name('大渡河').onChange((value: boolean) => {
      drawDaduheRiver(value)
      if (value) {
        viewerRef.current!.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(106.49566264, 33.80768620, 2000000),
        });
      }
    })

    mainRiverControls.add(guiControls, 'drawMinjiangRiver').name('岷江').onChange((value: boolean) => {
      drawMinjiangRiver(value)
      if (value) {
        viewerRef.current!.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(106.49566264, 33.80768620, 2000000),
        });
      }
    })

    /* 气候 */
    climateControls.add(guiControls, 'drawChinaClimateDistribution').name('相关气候分布').onChange((value: boolean) => {
      drawChinaClimateDistribution(value)
    })

    /* 动物分布 */
    animalsControls.add(guiControls, 'drawPanda').name('熊猫').onChange((value: boolean) => {
      if (value) {
        viewerRef.current!.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(103.37087154, 32.60616200, 3017.33),
          orientation: {
            heading: 5.971222987539061,
            pitch: 0.2683846352166457,
            roll: 0.000003128307367816774
          }
        });
      }

      drawPanda(value)
      showPandaDetails(value)
    })

    /* 植被分布 */
    plantControls.add(guiControls, 'drawShanshu').name('滇冷杉').onChange((value: boolean) => {

      if (value) {
        viewerRef.current!.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(103.38251056, 32.59808678, 3105.23),
          orientation: {
            heading: 1.0299469580859508,
            pitch: 0.08986601208615386,
            roll: 0.0000027846895083172285
          }
        });
      }

      drawShanshu(value)
      showShanshuDetails(value)
    })
  }



  const initClickHandler = (viewer: Cesium.Viewer) => {
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

    handler.setInputAction((movement: { position: Cesium.Cartesian2; }) => {
      // 拾取椭球面上的点
      const cartesian = viewer.camera.pickEllipsoid(
        movement.position,
        viewer.scene.globe.ellipsoid
      );
      if (!cartesian) return;

      // 转换为经纬度
      const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
      const lon = Cesium.Math.toDegrees(cartographic.longitude);
      const lat = Cesium.Math.toDegrees(cartographic.latitude);

      // 获取当前相机大致层级
      const zoom = Math.round(
        Math.log2(
          (2 * Math.PI * 6378137) /
          viewer.camera.getMagnitude()
        )
      );

      // 经纬度 → XYZ 瓦片坐标
      const x = Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
      const y = Math.floor(
        ((1 -
          Math.log(
            Math.tan((lat * Math.PI) / 180) +
            1 / Math.cos((lat * Math.PI) / 180)
          ) /
          Math.PI) /
          2) *
        Math.pow(2, zoom)
      );

      console.log(`lon=${lon}, lat=${lat}, zoom=${zoom}, x=${x}, y=${y}`);
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }

  useEffect(() => {
    Cesium.Ion.defaultAccessToken = import.meta.env.VITE_APP_GITHUB_PROJECT_CESIUM_TOKEN;

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
    });

    viewerRef.current = viewer;



    Cesium.createWorldTerrainAsync({ requestVertexNormals: true, requestWaterMask: true }).then(
      async (terrain) => {
        viewer.terrainProvider = terrain;

        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(106.49566264, 33.80768620, 5000000),
        });

      }
    );

    (viewer.cesiumWidget.creditContainer as HTMLDivElement).style.display = "none";


    fetch(window.$$prefix + "/data/china/china-boundary.geojson").then(res => res.json()).then(data => {
      Cesium.GeoJsonDataSource.load(data, {
        stroke: Cesium.Color.BROWN,
        fill: Cesium.Color.BROWN.withAlpha(0.2),
        strokeWidth: 2,
        markerSymbol: "circle"
      }).then(function (dataSource) {
        viewer.dataSources.add(dataSource)
      })
    })


    initClickHandler(viewer);

    initGui()

    drawHengduanMountainsDiagram(true)
    initHigherMountainPonit()

    return () => {
      viewer.destroy();
      guiRef.current?.destroy()
    }
  }, []);


  return (
    <div className="canvas-container">
      {notificationContextHolder}
      <div className="canvas-container-body" ref={containerRef} />
    </div>
  );
};

export default HengduanMountains;
