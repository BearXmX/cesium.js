import * as Cesium from "cesium";
import { useEffect, useRef } from "react";
import * as gui from 'lil-gui'
import SampleLabel from "@/utils/plugins/sample-label";

const HengduanMountains = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);

  const guiRef = useRef<gui.GUI | null>(null);

  const HengduanMountainsDiagramRef = useRef<Cesium.Entity[]>([]);
  const changjiangRiverRef = useRef<Cesium.Entity[]>([]);
  const lancangRiverRef = useRef<Cesium.Entity[]>([]);
  const nujiangRiverRef = useRef<Cesium.Entity[]>([]);
  const dulongjiangRiverRef = useRef<Cesium.Entity[]>([]);
  const jinshajiangRiverRef = useRef<Cesium.Entity[]>([]);
  const minjiangRiverRef = useRef<Cesium.Entity[]>([]);
  const yalongjiangRiverRef = useRef<Cesium.Entity[]>([]);

  const higherMountainPonitInstanceList = useRef<{
    position: Cesium.Cartesian3
    text: string,
    instance: SampleLabel
    key: string
  }[]>([]);

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
              stroke: Cesium.Color.WHITE,
              fill: Cesium.Color.WHITE.withAlpha(1),
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

  const guiControls = {
    drawHengduanMountainsDiagram: true,
    drawHigherMountainPoint: false,
    drawChangjiangRiver: false,
    drawLancangRiver: false,
    drawNujiangRiver: false,
    drawDulongjiangRiver: false,
    drawJinshajiangRiver: false,
    drawMinjiangRiver: false,
    drawYalongjiangRiver: false,

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

    mainAreaControls.add(guiControls, 'drawHengduanMountainsDiagram').name('横断山区').onChange((value: boolean) => {
      drawHengduanMountainsDiagram(value)
    })

    mainAreaControls.add(guiControls, 'drawHigherMountainPoint').name('最高峰').onChange((value: boolean) => {
      higherMountainPonitInstanceList.current.forEach(item => {
        item.instance.toggleVisible(value)
      })

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

    const mainRiverControls = guiRef.current.addFolder('主要河流');

    mainRiverControls.add(guiControls, 'drawChangjiangRiver').name('长江').onChange((value: boolean) => {
      drawChangjiangRiver(value)
    })

    mainRiverControls.add(guiControls, 'drawLancangRiver').name('澜沧江').onChange((value: boolean) => {
      drawLancangRiver(value)
    })

    mainRiverControls.add(guiControls, 'drawNujiangRiver').name('怒江').onChange((value: boolean) => {
      drawNujiangRiver(value)
    })



    mainRiverControls.add(guiControls, 'drawJinshajiangRiver').name('金沙江').onChange((value: boolean) => {
      drawJinshajiangRiver(value)
    })

    mainRiverControls.add(guiControls, 'drawMinjiangRiver').name('岷江').onChange((value: boolean) => {
      drawMinjiangRiver(value)
    })

    mainRiverControls.add(guiControls, 'drawYalongjiangRiver').name('雅砻江').onChange((value: boolean) => {
      drawYalongjiangRiver(value)
    })

    mainRiverControls.add(guiControls, 'drawDulongjiangRiver').name('独龙江').onChange((value: boolean) => {
      drawDulongjiangRiver(value)
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
      <div className="canvas-container-body" ref={containerRef} />
    </div>
  );
};

export default HengduanMountains;
