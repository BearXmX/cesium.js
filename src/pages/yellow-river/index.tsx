import * as Cesium from "cesium";
import { useEffect, useRef, useState, type JSX } from "react";
import { Button, Checkbox, Form, Modal } from 'antd'
import * as gui from 'lil-gui'
import SampleLabel from "@/utils/plugins/sample-label";
import ImageText from "@/utils/plugins/image-text";
import { dayuzhishuiStory, handaidiyicijuekouStory, jindiStory, jinfuzhiheStory, zhihesanceStory } from "./constance";

const YellowRiver = () => {

  const [modal, modalContext] = Modal.useModal();

  const containerRef = useRef<HTMLDivElement>(null);

  const viewerRef = useRef<Cesium.Viewer | null>(null);

  const guiRef = useRef<gui.GUI | null>(null);

  const administrativeRegionRef = useRef<Cesium.Entity[]>([]);

  const yellowRiverBranchRef = useRef<Cesium.Entity[]>([]);

  const yellowRiverAreaProvinceRef = useRef<Cesium.Entity[]>([]);

  const loessPlateauAreaRef = useRef<Cesium.Entity[]>([]);

  const yuhegudaoRef = useRef<Cesium.Entity[]>([]);
  const xihangudaoRef = useRef<Cesium.Entity[]>([]);
  const donghangudaoRef = useRef<Cesium.Entity[]>([]);
  const beisonggudaoRef = useRef<Cesium.Entity[]>([]);
  const mingqinggudaoRef = useRef<Cesium.Entity[]>([]);
  const nansonggudaoRef = useRef<Cesium.Entity[]>([]);

  const daluzeRef = useRef<Cesium.Entity[]>([]);
  const dayezeRef = useRef<Cesium.Entity[]>([]);
  const luoshuiRef = useRef<Cesium.Entity[]>([]);
  const jishuiRef = useRef<Cesium.Entity[]>([]);

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

  const historyChangeFlyTo = [116.68159000606285, 37.064512255466, 1000000] as [number, number, number]

  const drawHistoryRiver = (show: boolean, ref: React.RefObject<Cesium.Entity[]>, url: string, texts: { position: Cesium.Cartesian3, text: string, fontSize?: number }[], color: Cesium.Color) => {

    if (show) {

      if (ref.current?.length) {

        ref.current.forEach(item => {
          item.show = true
        })

      } else {
        fetch(url).then(res => res.json()).then(data => {
          Cesium.GeoJsonDataSource.load(data, {
            stroke: color,
            fill: color.withAlpha(0.2),
            strokeWidth: 4,
            markerSymbol: "circle"
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)
            ref.current.push(...dataSource.entities.values)
          });
        });

        texts.forEach(item => {
          ref.current.push(viewerRef.current!.entities.add({
            position: item.position,
            label: {
              text: item.text,
              font: `${item.fontSize || 16}px sans-serif`,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              outlineWidth: 2,
              outlineColor: color,
              fillColor: Cesium.Color.WHITE,
              disableDepthTestDistance: Number.POSITIVE_INFINITY, // 添加这一行，使标签始终在最前
            }
          }))
        })
      }

    } else {
      ref.current!.forEach(item => {
        item.show = false
      })
    }
  }

  const guiControls = {
    drawAdministrativeRegion: false,

    drawYellowRiverBranch: false,
    drawYellowRiverAreaProvince: false,
    drawLoessPlateauArea: false,
    drawYellowRiverAreaCity: false,
    drawYellowRiverSubsectionPoint: false,

    drawYuhegudao: false,
    drawXihangudao: false,
    drawDonghangudao: false,
    drawBeisonggudao: false,
    drawMingqinggudao: false,
    drawNansonggudao: false,

    drawDaluze: false,
    drawDayeze: false,
    drawDapishan: false,
    drawLuoshui: false,
    drawJishui: false,

    showVideo: () => {
      modal.info({
        icon: null,
        title: '视频播放',
        content: <video src={window.$$prefix + '/data/yellow-river/yellow-river.mp4'} style={{ width: '100%', height: '100%' }} controlsList="nodownload" controls autoPlay />,
        okText: '关闭',
        cancelText: '取消',
        width: 800,
        centered: true,
        onOk() {
        },
        onCancel() {
        }
      })
    },

    dayuzhishui: () => {
      const visible = pointInstanceList.current.find(item => item.type === 'story')?.data.find(item => item.key === 'dayuzhishui')?.instance?.toggleVisible(true)

      if (visible) {
        cameraFlyTo(116.04987694946415, 38.60306708197618, 1000000)
      }
    },
    jinfuzhihe: () => {

      const visible = pointInstanceList.current.find(item => item.type === 'story')?.data.find(item => item.key === 'jinfuzhihe')?.instance?.toggleVisible(true)

      if (visible) {
        cameraFlyTo(117.26616152861372, 34.57448473156657, 1000000)
      }
    },
    jindi: () => {
      const visible = pointInstanceList.current.find(item => item.type === 'story')?.data.find(item => item.key === 'jindi')?.instance?.toggleVisible(true)
      if (visible) {
        cameraFlyTo(114.88677333671359, 35.89746983824332, 1000000)
      }
    },
    handaidiyicijuekou: () => {
      const visible = pointInstanceList.current.find(item => item.type === 'story')?.data.find(item => item.key === 'handaidiyicijuekou')?.instance?.toggleVisible(true)
      if (visible) {
        cameraFlyTo(114.80936023649383, 35.49292826726047, 500000)
      }
    },
    zhihesance: () => {
      const visible = pointInstanceList.current.find(item => item.type === 'story')?.data.find(item => item.key === 'zhihesance')?.instance?.toggleVisible(true)
      if (visible) {
        cameraFlyTo(116.44621506571357, 36.62260463431871, 500000)
      }
    },

  };

  const initGui = () => {
    if (guiRef.current) {
      guiRef.current.destroy()
      guiRef.current = null
    }

    guiRef.current = new gui.GUI({})

    guiRef.current.title('黄河')

    const regionControls = guiRef.current.addFolder('主要区域')

    const videoControls = guiRef.current.addFolder('黄河科普')

    const mainControls = guiRef.current.addFolder('相关区域')

    const historyChangeContols = guiRef.current.addFolder('黄河历史')

    /* 主要区域 */
    regionControls.add(guiControls, 'drawAdministrativeRegion').name('行政区域').onChange((value: boolean) => {
      drawAdministrativeRegion(value)
    })

    /* 科普视频 */
    videoControls.add(guiControls, 'showVideo').name('我们的母亲河')

    /* 主要区域 */
    mainControls.add(guiControls, 'drawYellowRiverBranch').name('黄河支流').onChange((value: boolean) => {
      drawYellowRiverBranch(value)
    })

    const yellowRiverAreaProvinceControl = mainControls.add(guiControls, 'drawYellowRiverAreaProvince').name('黄河流域').onChange((value: boolean) => {
      drawYellowRiverAreaProvince(value)
    })

    mainControls.add(guiControls, 'drawLoessPlateauArea').name('黄土高原').onChange((value: boolean) => {
      drawLoessPlateauArea(value)
    })

    mainControls.add(guiControls, 'drawYellowRiverAreaCity').name('流经城市').onChange((value: boolean) => {
      pointInstanceList.current.find(item => item.type === 'city')?.data.forEach(item => item.instance?.toggleVisible(value))
      yellowRiverAreaProvinceControl.setValue(value)
      yellowRiverAreaProvinceControl.updateDisplay()

      if (value) {
        cameraFlyTo(109.45936235563758, 36.31925612853817, 2200000)
      }
    })

    mainControls.add(guiControls, 'drawYellowRiverSubsectionPoint').name('上中下游分界点').onChange((value: boolean) => {
      pointInstanceList.current.find(item => item.type === 'subsection')?.data.forEach(item => item.instance?.toggleVisible(value))

      if (value) {
        cameraFlyTo(113.07157684715946, 38.465983825955824, 2000000)
      }
    })



    const shangguHistoryChangeContols = historyChangeContols.addFolder('上古时期')
    const xihanHistoryChangeContols = historyChangeContols.addFolder('西汉时期')
    const donghanHistoryChangeContols = historyChangeContols.addFolder('东汉时期')
    const beisongHistoryChangeContols = historyChangeContols.addFolder('北宋时期')
    const nansongHistoryChangeContols = historyChangeContols.addFolder('南宋、元时期')
    const mingqingHistoryChangeContols = historyChangeContols.addFolder('明清时期')

    /* 历史改道 */


    /* 上古时期 */
    shangguHistoryChangeContols.add(guiControls, 'drawYuhegudao').name('禹河故道').onChange((value: boolean) => {
      if (value) {
        cameraFlyTo(...historyChangeFlyTo)
      }
      drawYuhegudao(value)
    })

    shangguHistoryChangeContols.add(guiControls, 'drawDaluze').name('大陆泽').onChange((value: boolean) => {
      if (value) {
        cameraFlyTo(...historyChangeFlyTo)
      }
      drawDaluze(value)
    })

    shangguHistoryChangeContols.add(guiControls, 'drawDapishan').name('大伾山').onChange((value: boolean) => {
      const visible = pointInstanceList.current.find(item => item.type === 'mountain')?.data.find(item => item.key === 'dapishan')?.instance?.toggleVisible(value)
      if (value) {
        cameraFlyTo(...historyChangeFlyTo)
      }
    })

    shangguHistoryChangeContols.add(guiControls, 'drawLuoshui').name('漯水').onChange((value: boolean) => {
      drawLuoshui(value)
      if (value) {
        cameraFlyTo(...historyChangeFlyTo)
      }
    })

    shangguHistoryChangeContols.add(guiControls, 'drawJishui').name('济水').onChange((value: boolean) => {
      drawJishui(value)
      if (value) {
        cameraFlyTo(...historyChangeFlyTo)
      }
    })


    shangguHistoryChangeContols.add(guiControls, 'dayuzhishui').name('大禹治水')

    /* 西汉时期 */
    xihanHistoryChangeContols.add(guiControls, 'drawXihangudao').name('西汉故道').onChange((value: boolean) => {
      if (value) {
        cameraFlyTo(...historyChangeFlyTo)
      }
      drawXihangudao(value)
    })

    xihanHistoryChangeContols.add(guiControls, 'jindi').name('秦始皇修金堤')

    xihanHistoryChangeContols.add(guiControls, 'handaidiyicijuekou').name('汉代第一次重大决口')

    /* 东汉时期 */
    donghanHistoryChangeContols.add(guiControls, 'drawDonghangudao').name('东汉故道').onChange((value: boolean) => {
      if (value) {

        cameraFlyTo(...historyChangeFlyTo)
      }
      drawDonghangudao(value)
    })
    donghanHistoryChangeContols.add(guiControls, 'zhihesance').name('贾让“治河三策”')

    /* 北宋时期 */
    beisongHistoryChangeContols.add(guiControls, 'drawBeisonggudao').name('北宋故道').onChange((value: boolean) => {
      if (value) {

        cameraFlyTo(...historyChangeFlyTo)
      }
      drawBeisonggudao(value)
    })

    /* 南宋时期 */
    nansongHistoryChangeContols.add(guiControls, 'drawNansonggudao').name('南宋、元故道').onChange((value: boolean) => {
      if (value) {

        cameraFlyTo(...historyChangeFlyTo)
      }
      drawNansonggudao(value)
    })

    nansongHistoryChangeContols.add(guiControls, 'drawDayeze').name('大野泽').onChange((value: boolean) => {
      if (value) {

        cameraFlyTo(...historyChangeFlyTo)
      }
      drawDayeze(value)
    })

    /* 明清时期 */
    mingqingHistoryChangeContols.add(guiControls, 'drawMingqinggudao').name('明清故道').onChange((value: boolean) => {

      if (value) {
        cameraFlyTo(...historyChangeFlyTo)
      }

      drawMingqinggudao(value)
    })

    mingqingHistoryChangeContols.add(guiControls, 'jinfuzhihe').name('靳辅治河')

  }

  const cameraFlyTo = (longitude: number, latitude: number, height: number = 4000000) => {
    viewerRef.current!.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
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

  const drawAdministrativeRegion = (checked: boolean) => {
    if (checked) {

      if (administrativeRegionRef.current?.length) {

        administrativeRegionRef.current.forEach(item => {
          item.show = true
        })

      } else {
        fetch(window.$$prefix + "/data/china/china.geojson").then(res => res.json()).then(data => {
          Cesium.GeoJsonDataSource.load(data, {
            stroke: Cesium.Color.BROWN.withAlpha(0.8),
            fill: Cesium.Color.WHITE.withAlpha(0.5),
            strokeWidth: 0.8,
            markerSymbol: "circle"
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)
            administrativeRegionRef.current = dataSource.entities.values
          });

        });
      }

    } else {
      administrativeRegionRef.current!.forEach(item => {
        item.show = false
      })
    }
  };

  const drawYellowRiverBranch = (checked: boolean) => {
    if (checked) {

      if (yellowRiverBranchRef.current?.length) {

        yellowRiverBranchRef.current.forEach(item => {
          item.show = true
        })

      } else {

        fetch(window.$$prefix + "/data/yellow-river/yellow-river-branch.geojson").then(res => res.json()).then(data => {
          Cesium.GeoJsonDataSource.load(data, {
            stroke: Cesium.Color.YELLOW,
            fill: Cesium.Color.YELLOW.withAlpha(0.1),
            strokeWidth: 0.5,
            markerSymbol: "circle"
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)
            yellowRiverBranchRef.current = dataSource.entities.values
          });

        });
      }

    } else {
      yellowRiverBranchRef.current!.forEach(item => {
        item.show = false
      })
    }

  }

  const drawYellowRiverAreaProvince = (checked: boolean) => {
    if (checked) {

      if (yellowRiverAreaProvinceRef.current?.length) {

        yellowRiverAreaProvinceRef.current.forEach(item => {
          item.show = true
        })

      } else {

        fetch(window.$$prefix + "/data/yellow-river/yellow-river-area-province.geojson").then(res => res.json()).then(data => {
          Cesium.GeoJsonDataSource.load(data, {
            stroke: Cesium.Color.PINK,
            fill: Cesium.Color.PINK.withAlpha(0.5),
            strokeWidth: 0.5,
            markerSymbol: "circle"
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)
            yellowRiverAreaProvinceRef.current = dataSource.entities.values
          });

        });
      }

    } else {
      yellowRiverAreaProvinceRef.current!.forEach(item => {
        item.show = false
      })
    }

  }

  const drawLoessPlateauArea = (checked: boolean) => {
    if (checked) {

      if (loessPlateauAreaRef.current?.length) {

        loessPlateauAreaRef.current.forEach(item => {
          item.show = true
        })

      } else {

        fetch(window.$$prefix + "/data/yellow-river/loess-plateau-area.geojson").then(res => res.json()).then(data => {
          Cesium.GeoJsonDataSource.load(data, {
            stroke: Cesium.Color.ORANGE,
            fill: Cesium.Color.ORANGE.withAlpha(0.4),
            strokeWidth: 0.5,
            markerSymbol: "circle"
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)
            loessPlateauAreaRef.current = dataSource.entities.values
          });

        });
      }

    } else {
      loessPlateauAreaRef.current!.forEach(item => {
        item.show = false
      })
    }

  }

  const drawYuhegudao = (checked: boolean) => {
    const color = Cesium.Color.VIOLET

    drawHistoryRiver(checked, yuhegudaoRef, window.$$prefix + "/data/yellow-river/yuhegudao.geojson", [
      {
        position: Cesium.Cartesian3.fromDegrees(117.34429640994914, 39.59296969230597),
        text: "禹河古道\n前2278-前602",
      }
    ], color)
  }

  const drawDaluze = (checked: boolean) => {
    const color = Cesium.Color.CYAN

    drawHistoryRiver(checked, daluzeRef, window.$$prefix + "/data/yellow-river/daluze.geojson", [
      {
        position: Cesium.Cartesian3.fromDegrees(114.29593465100123,
          37.45570063279759),
        text: "大陆泽",
      }
    ], color)
  }

  const drawLuoshui = (checked: boolean) => {
    const color = Cesium.Color.PURPLE

    drawHistoryRiver(checked, luoshuiRef, window.$$prefix + "/data/yellow-river/luoshui.geojson", [
      {
        position: Cesium.Cartesian3.fromDegrees(116.10791182717689,
          36.734390277000436),
        text: "漯水",
      }
    ], color)
  }

  const drawJishui = (checked: boolean) => {
    const color = Cesium.Color.SKYBLUE

    drawHistoryRiver(checked, jishuiRef, window.$$prefix + "/data/yellow-river/jishui.geojson", [
      {
        position: Cesium.Cartesian3.fromDegrees(113.39439555837208,
          35.23124166146688),
        text: "济水",
      }
    ], color)
  }


  const drawDonghangudao = (checked: boolean) => {

    const color = Cesium.Color.ORANGE

    drawHistoryRiver(checked, donghangudaoRef, window.$$prefix + "/data/yellow-river/donghangudao.geojson", [
      {
        position: Cesium.Cartesian3.fromDegrees(117.64350152395602, 37.6292465454227),
        text: "东汉故道\n11-1048",
      }
    ], color)
  }

  const drawXihangudao = (checked: boolean) => {

    const color = Cesium.Color.BROWN

    drawHistoryRiver(checked, xihangudaoRef, window.$$prefix + "/data/yellow-river/xihangudao.geojson", [
      {
        position: Cesium.Cartesian3.fromDegrees(117.16475899411333, 38.87213207639694),
        text: "西汉故道\n前602-11",
      }
    ], color)
  }

  const drawBeisonggudao = (checked: boolean) => {

    const color = Cesium.Color.THISTLE

    drawHistoryRiver(checked, beisonggudaoRef, window.$$prefix + "/data/yellow-river/beisonggudao.geojson", [
      {
        position: Cesium.Cartesian3.fromDegrees(115.82154578431262, 38.015631919408),
        text: '北宋故道（北流）\n1048-1128',
      },
      {
        position: Cesium.Cartesian3.fromDegrees(117.41979162899403, 38.153555435893274),
        text: '北宋故道（东流）\n1048-1128',
      },
    ], color)
  }

  const drawMingqinggudao = (checked: boolean) => {


    const color = Cesium.Color.DARKBLUE

    drawHistoryRiver(checked, mingqinggudaoRef, window.$$prefix + "/data/yellow-river/mingqinggudao.geojson", [
      {
        position: Cesium.Cartesian3.fromDegrees(116.89789938054952, 34.002151532164426),
        text: "明清故道\n1368-1855",
      },
    ], color)
  }

  const drawNansonggudao = (checked: boolean) => {


    const color = Cesium.Color.FUCHSIA

    drawHistoryRiver(checked, nansonggudaoRef, window.$$prefix + "/data/yellow-river/nansonggudao.geojson", [
      {
        position: Cesium.Cartesian3.fromDegrees(115.83909059918128, 34.9316807722699),
        text: '南宋、元故道\n1128-1368'
      },
      {
        position: Cesium.Cartesian3.fromDegrees(117.25871558918108, 35.12197753878519),
        text: '南宋北岔流'
      },
      {
        position: Cesium.Cartesian3.fromDegrees(114.97118922424879, 34.2832804070269),
        text: '南宋南岔流'
      },
    ], color)
  }

  const drawDayeze = (checked: boolean) => {
    const color = Cesium.Color.CYAN

    drawHistoryRiver(checked, dayezeRef, window.$$prefix + "/data/yellow-river/dayeze.geojson", [
      {
        position: Cesium.Cartesian3.fromDegrees(116.46380530896955,
          35.70172754553374),
        text: "大野泽",
      }
    ], color)
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

      // 天地图
      /*       baseLayer: new Cesium.ImageryLayer(new Cesium.WebMapTileServiceImageryProvider({
              url: "http://t{s}.tianditu.gov.cn/img_w/wmts?tk=03e1637ffbffc98d74b6ead0631a29d4",
              layer: 'img',
              style: 'default',
              tileMatrixSetID: 'w',
              maximumLevel: 18,
              subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
            })), */
    });

    viewerRef.current = viewer;

    Cesium.createWorldTerrainAsync({ requestVertexNormals: true, requestWaterMask: true }).then(
      async (terrain) => {
        viewer.terrainProvider = terrain;
        cameraFlyTo(106.42574140217508, 37.565051396604, 4000000)
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

    fetch(window.$$prefix + "/data/yellow-river/yellow-river.geojson").then(res => res.json()).then(data => {
      Cesium.GeoJsonDataSource.load(data, {
        stroke: Cesium.Color.YELLOW,
        fill: Cesium.Color.YELLOW.withAlpha(0.2),
        strokeWidth: 4,
        markerSymbol: "circle"
      }).then(function (dataSource) {
        viewer.dataSources.add(dataSource)
        /*         viewer.flyTo(dataSource); */
      });

    });

    initClickHandler(viewer)

    initGui()

    fetch(window.$$prefix + '/data/yellow-river/points.json')
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
                      /*                       const [longitude, latitude, height] = v.position
                      
                                            viewerRef.current?.camera.flyTo({
                                              destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, height + 1500),
                                            }) */


                      if (item.type === 'story') {
                        const modalOptions = {
                          icon: null,
                          title: v.text,
                          okText: '关闭',
                          cancelText: '关闭',
                          width: 800,
                          centered: true,
                        }

                        const modalStory: Record<string, React.ReactNode> = {
                          dayuzhishui: dayuzhishuiStory,
                          jinfuzhihe: jinfuzhiheStory,
                          jindi: jindiStory,
                          handaidiyicijuekou: handaidiyicijuekouStory,
                          zhihesance: zhihesanceStory
                        }

                        modal.info({
                          ...modalOptions,
                          content: modalStory[v.key] || null,
                        })


                      }
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
      viewer.destroy();
      guiRef.current?.destroy()
    }
  }, []);


  return (
    <div className="canvas-container">
      {modalContext}
      <div className="canvas-container-body" ref={containerRef} />
    </div>
  );
};

export default YellowRiver;
