import * as Cesium from "cesium";
import { useEffect, useRef, useState } from "react";
import { Button, Checkbox, Form } from 'antd'
import DrawerCountour from "../../utils/countour";
import * as gui from 'lil-gui'

const YellowRiver = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const viewerRef = useRef<Cesium.Viewer | null>(null);

  const guiRef = useRef<gui.GUI | null>(null);

  const yellowRiverBranchRef = useRef<Cesium.Entity[]>([]);

  const yellowRiverAreaProvinceRef = useRef<Cesium.Entity[]>([]);

  const loessPlateauAreaRef = useRef<Cesium.Entity[]>([]);

  const yuhegudaoRef = useRef<Cesium.Entity[]>([]);
  const yuhegudaoNameRef = useRef<Cesium.Entity[]>([]);

  const donghangudaoRef = useRef<Cesium.Entity[]>([]);
  const donghangudaoNameRef = useRef<Cesium.Entity[]>([]);

  const xihangudaoRef = useRef<Cesium.Entity[]>([]);
  const xihangudaoNameRef = useRef<Cesium.Entity[]>([]);

  const beisonggudaoRef = useRef<Cesium.Entity[]>([]);
  const beisonggudaoNameRef = useRef<Cesium.Entity[]>([]);

  const mingqinggudaoRef = useRef<Cesium.Entity[]>([]);
  const mingqinggudaoNameRef = useRef<Cesium.Entity[]>([]);

  const nansonggudaoRef = useRef<Cesium.Entity[]>([]);
  const nansonggudaoNameRef = useRef<Cesium.Entity[]>([]);

  const historyChangeFlyTo = [115.90403078006872, 36.31340804490251, 2000000] as [number, number, number]

  const guiControls = {
    drawYellowRiverBranch: false,
    drawYellowRiverAreaProvince: false,
    drawLoessPlateauArea: false,

    drawYuhegudao: false,
    drawXihangudao: false,
    drawDonghangudao: false,
    drawBeisonggudao: false,
    drawMingqinggudao: false,
    drawNansonggudao: false,


  };

  const setupClickHandler = (viewer: Cesium.Viewer) => {
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

    if (checked) {

      if (yuhegudaoRef.current?.length) {

        yuhegudaoRef.current.forEach(item => {
          item.show = true
        })

        yuhegudaoNameRef.current.forEach(item => {
          item.show = true
        })


      } else {

        const color = Cesium.Color.VIOLET

        fetch(window.$$prefix + "/data/yellow-river/yuhegudao.geojson").then(res => res.json()).then(data => {
          Cesium.GeoJsonDataSource.load(data, {
            stroke: color,
            fill: color.withAlpha(0.2),
            strokeWidth: 4,
            markerSymbol: "circle"
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)
            yuhegudaoRef.current = dataSource.entities.values
          });
        });

        yuhegudaoNameRef.current.push(viewerRef.current!.entities.add({
          position: Cesium.Cartesian3.fromDegrees(117.34429640994914, 39.59296969230597),
          label: {
            text: "禹河古道",
            font: "18px sans-serif",
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            outlineWidth: 2,
            outlineColor: color,
            fillColor: Cesium.Color.WHITE,
          }
        }))
      }

    } else {
      yuhegudaoRef.current!.forEach(item => {
        item.show = false
      })

      yuhegudaoNameRef.current!.forEach(item => {
        item.show = false
      })
    }


  }

  const drawDonghangudao = (checked: boolean) => {

    if (checked) {

      if (donghangudaoRef.current?.length) {

        donghangudaoRef.current.forEach(item => {
          item.show = true
        })

        donghangudaoNameRef.current.forEach(item => {
          item.show = true
        })


      } else {

        const color = Cesium.Color.ORANGE

        fetch(window.$$prefix + "/data/yellow-river/donghangudao.geojson").then(res => res.json()).then(data => {
          Cesium.GeoJsonDataSource.load(data, {
            stroke: color,
            fill: color.withAlpha(0.2),
            strokeWidth: 4,
            markerSymbol: "circle"
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)
            donghangudaoRef.current = dataSource.entities.values
          });
        });

        donghangudaoNameRef.current.push(viewerRef.current!.entities.add({
          position: Cesium.Cartesian3.fromDegrees(117.7107197633053, 37.67839224617755),
          label: {
            text: "东汉故道",
            font: "18px sans-serif",
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            outlineWidth: 2,
            outlineColor: color,
            fillColor: Cesium.Color.WHITE,
          }
        }))
      }

    } else {
      donghangudaoRef.current!.forEach(item => {
        item.show = false
      })

      donghangudaoNameRef.current.forEach(item => {
        item.show = true
      })
    }


  }

  const drawXihangudao = (checked: boolean) => {

    if (checked) {

      if (xihangudaoRef.current?.length) {

        xihangudaoRef.current.forEach(item => {
          item.show = true
        })

        xihangudaoNameRef.current.forEach(item => {
          item.show = true
        })

      } else {

        const color = Cesium.Color.BROWN

        fetch(window.$$prefix + "/data/yellow-river/xihangudao.geojson").then(res => res.json()).then(data => {
          Cesium.GeoJsonDataSource.load(data, {
            stroke: color,
            fill: color.withAlpha(0.2),
            strokeWidth: 4,
            markerSymbol: "circle"
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)
            xihangudaoRef.current = dataSource.entities.values
          });
        });

        xihangudaoNameRef.current.push(viewerRef.current!.entities.add({
          position: Cesium.Cartesian3.fromDegrees(117.16475899411333, 38.87213207639694),
          label: {
            text: "西汉故道",
            font: "18px sans-serif",
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            outlineWidth: 2,
            outlineColor: color,
            fillColor: Cesium.Color.WHITE,
          }
        }))
      }

    } else {
      xihangudaoRef.current!.forEach(item => {
        item.show = false
      })

      xihangudaoNameRef.current.forEach(item => {
        item.show = true
      })
    }


  }

  const drawBeisonggudao = (checked: boolean) => {

    if (checked) {

      if (beisonggudaoRef.current?.length) {

        beisonggudaoRef.current.forEach(item => {
          item.show = true
        })

        beisonggudaoNameRef.current.forEach(item => {
          item.show = true
        })


      } else {

        const color = Cesium.Color.THISTLE

        fetch(window.$$prefix + "/data/yellow-river/beisonggudao.geojson").then(res => res.json()).then(data => {
          Cesium.GeoJsonDataSource.load(data, {
            stroke: color,
            fill: color.withAlpha(0.2),
            strokeWidth: 4,
            markerSymbol: "circle"
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)
            beisonggudaoRef.current = dataSource.entities.values
          });
        });


        const beisonggudaoName = [
          {
            position: Cesium.Cartesian3.fromDegrees(115.82154578431262, 38.015631919408),
            text: '北宋故道（北流）'
          },
          {
            position: Cesium.Cartesian3.fromDegrees(117.41979162899403, 38.153555435893274),
            text: '北宋故道（东流）'
          },
        ]

        beisonggudaoName.forEach(item => {
          beisonggudaoNameRef.current.push(viewerRef.current!.entities.add({
            position: item.position,
            label: {
              text: item.text,
              font: "18px sans-serif",
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              outlineWidth: 2,
              outlineColor: color,
              fillColor: Cesium.Color.WHITE,
            }
          }))
        })
      }

    } else {
      beisonggudaoRef.current!.forEach(item => {
        item.show = false
      })

      beisonggudaoNameRef.current.forEach(item => {
        item.show = false
      })
    }

  }

  const drawMingqinggudao = (checked: boolean) => {

    if (checked) {

      if (mingqinggudaoRef.current?.length) {

        mingqinggudaoRef.current.forEach(item => {
          item.show = true
        })

        mingqinggudaoNameRef.current.forEach(item => {
          item.show = true
        })

      } else {

        const color = Cesium.Color.DARKBLUE

        fetch(window.$$prefix + "/data/yellow-river/mingqinggudao.geojson").then(res => res.json()).then(data => {
          Cesium.GeoJsonDataSource.load(data, {
            stroke: color,
            fill: color.withAlpha(0.2),
            strokeWidth: 4,
            markerSymbol: "circle"
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)
            mingqinggudaoRef.current = dataSource.entities.values
          });

          mingqinggudaoNameRef.current.push(viewerRef.current!.entities.add({
            position: Cesium.Cartesian3.fromDegrees(116.89789938054952, 34.002151532164426),
            label: {
              text: "明清故道",
              font: "18px sans-serif",
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              outlineWidth: 2,
              outlineColor: color,
              fillColor: Cesium.Color.WHITE,

            }
          }))
        });

      }
    } else {
      mingqinggudaoRef.current!.forEach(item => {
        item.show = false
      })

      mingqinggudaoNameRef.current.forEach(item => {
        item.show = true
      })

    }
  }

  const drawNansonggudao = (checked: boolean) => {

    if (checked) {

      if (nansonggudaoRef.current?.length) {

        nansonggudaoRef.current.forEach(item => {
          item.show = true
        })

        nansonggudaoNameRef.current.forEach(item => {
          item.show = true
        })


      } else {

        const color = Cesium.Color.LIGHTGREEN

        fetch(window.$$prefix + "/data/yellow-river/nansonggudao.geojson").then(res => res.json()).then(data => {
          Cesium.GeoJsonDataSource.load(data, {
            stroke: color,
            fill: color.withAlpha(0.2),
            strokeWidth: 4,
            markerSymbol: "circle"
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)
            nansonggudaoRef.current = dataSource.entities.values
          });
        });


        const nansonggudaoName = [
          {
            position: Cesium.Cartesian3.fromDegrees(115.83909059918128, 34.9316807722699),
            text: '南宋故道'
          },
          {
            position: Cesium.Cartesian3.fromDegrees(115.83245563677772, 35.57573482173487),
            text: '南宋北岔流'
          },
          {
            position: Cesium.Cartesian3.fromDegrees(114.97118922424879, 34.2832804070269),
            text: '南宋南岔流'
          },
        ]

        nansonggudaoName.forEach(item => {
          nansonggudaoNameRef.current.push(viewerRef.current!.entities.add({
            position: item.position,
            label: {
              text: item.text,
              font: "14px sans-serif",
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              outlineWidth: 2,
              outlineColor: color,
              fillColor: Cesium.Color.WHITE,
            }
          }))
        })
      }

    } else {
      nansonggudaoRef.current!.forEach(item => {
        item.show = false
      })

      nansonggudaoNameRef.current.forEach(item => {
        item.show = false
      })
    }
  }

  const initGui = () => {
    if (guiRef.current) {
      guiRef.current.destroy()
      guiRef.current = null
    }

    guiRef.current = new gui.GUI({})

    guiRef.current.title('黄河')

    const mainControls = guiRef.current.addFolder('主要区域')

    mainControls.add(guiControls, 'drawYellowRiverBranch').name('绘制黄河支流').onChange((value: boolean) => {
      drawYellowRiverBranch(value)
    })

    mainControls.add(guiControls, 'drawYellowRiverAreaProvince').name('绘制黄河流域').onChange((value: boolean) => {
      drawYellowRiverAreaProvince(value)
    })

    mainControls.add(guiControls, 'drawLoessPlateauArea').name('绘制黄土高原').onChange((value: boolean) => {
      drawLoessPlateauArea(value)
    })

    const historyChangeContols = guiRef.current.addFolder('历史改道')

    historyChangeContols.add(guiControls, 'drawYuhegudao').name('绘制禹河故道').onChange((value: boolean) => {
      if (value) {

        cameraFlyTo(...historyChangeFlyTo)
      }
      drawYuhegudao(value)
    })

    historyChangeContols.add(guiControls, 'drawXihangudao').name('绘制西汉故道').onChange((value: boolean) => {
      if (value) {

        cameraFlyTo(...historyChangeFlyTo)
      }
      drawXihangudao(value)
    })

    historyChangeContols.add(guiControls, 'drawDonghangudao').name('绘制东汉故道').onChange((value: boolean) => {
      if (value) {

        cameraFlyTo(...historyChangeFlyTo)
      }
      drawDonghangudao(value)
    })

    historyChangeContols.add(guiControls, 'drawBeisonggudao').name('绘制北宋故道').onChange((value: boolean) => {
      if (value) {

        cameraFlyTo(...historyChangeFlyTo)
      }
      drawBeisonggudao(value)
    })

    historyChangeContols.add(guiControls, 'drawNansonggudao').name('绘制南宋故道').onChange((value: boolean) => {
      if (value) {

        cameraFlyTo(...historyChangeFlyTo)
      }
      drawNansonggudao(value)
    })

    historyChangeContols.add(guiControls, 'drawMingqinggudao').name('绘制明清故道').onChange((value: boolean) => {
      if (value) {
        cameraFlyTo(...historyChangeFlyTo)
      }
      drawMingqinggudao(value)
    })
  }

  const cameraFlyTo = (longitude: number, latitude: number, height: number = 4000000) => {
    viewerRef.current!.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
    })
  }

  useEffect(() => {
    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4OTcwYjRjZi03Y2M5LTRiZTAtYTU4ZC04YjQ5OWRjOGM0N2EiLCJpZCI6MzM5NTk0LCJpYXQiOjE3NTczODMxNDZ9.MOvOOWYC62dePPqxADFjmesGKc6hDwtp0evj1DiujBw'

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
        stroke: Cesium.Color.BLUE,
        fill: Cesium.Color.BLUE.withAlpha(0.2),
        strokeWidth: 2,
        markerSymbol: "circle"
      }).then(function (dataSource) {
        viewer.dataSources.add(dataSource)
        /*         viewer.flyTo(dataSource); */
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

    setupClickHandler(viewer)

    initGui()

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

export default YellowRiver;
