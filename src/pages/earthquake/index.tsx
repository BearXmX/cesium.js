import * as Cesium from "cesium";
import { useEffect, useRef, useState } from "react";
import { Button, Checkbox, Form, Modal } from 'antd'
import DrawerCountour from "../../utils/countour";

const Earthquake = () => {

  const [modal, modalContext] = Modal.useModal();

  const containerRef = useRef<HTMLDivElement>(null);

  const viewerRef = useRef<Cesium.Viewer | null>(null);

  const chinaEarthquakeRef = useRef<Cesium.Entity[]>([]);

  const stepDividingLineRef = useRef<Cesium.Entity[]>([]);

  const globalPlateBoundaryRef = useRef<Cesium.Entity[]>([]);

  const globalPlateBoundaryNameRef = useRef<Cesium.Entity[]>([]);

  const globalTrenchRef = useRef<Cesium.Entity[]>([]);

  const globalEarthquakePointRef = useRef<Cesium.Entity[]>([]);

  const globalVolcanoPointRef = useRef<Cesium.Entity[]>([]);

  const globalLandArcLineRef = useRef<Cesium.Entity[]>([]);

  const globalLandArcNameRef = useRef<Cesium.Entity[]>([]);

  const globalRiftValleyLineRef = useRef<Cesium.Entity[]>([]);

  const globalRiftValleyNameRef = useRef<Cesium.Entity[]>([]);

  const ANZNCMainlandOutlineRef = useRef<Cesium.Entity[]>([]);

  const NORTHAMEMainlandOutlineRef = useRef<Cesium.Entity[]>([]);

  const AFRICAMainlandOutlineRef = useRef<Cesium.Entity[]>([]);

  const SOUTHAMEMainlandOutlineRef = useRef<Cesium.Entity[]>([]);

  const THESOUTHPOLEMainlandOutlineRef = useRef<Cesium.Entity[]>([]);

  const EURASIAMainlandOutlineRef = useRef<Cesium.Entity[]>([]);

  const globalMainlandNameRef = useRef<Cesium.Entity[]>([]);

  const drawChinaBoundary = () => {
    fetch(window.$$prefix + "/data/china/china-boundary.geojson").then(res => res.json()).then(data => {
      Cesium.GeoJsonDataSource.load(data, {
        stroke: Cesium.Color.YELLOW,
        fill: Cesium.Color.YELLOW.withAlpha(0.2),
        strokeWidth: 2,
        markerSymbol: "circle"
      }).then(function (dataSource) {
        viewerRef.current!.dataSources.add(dataSource)
      })
    })
  }


  const drawChinaEarthquakeArea = (checked: boolean) => {

    if (checked) {

      if (chinaEarthquakeRef.current?.length) {

        chinaEarthquakeRef.current.forEach(item => {
          item.show = true
        })

      } else {
        fetch(window.$$prefix + "/data/earthquake/china-earthquake-area.geojson").then(res => res.json()).then(data => {
          Cesium.GeoJsonDataSource.load(data, {
            stroke: Cesium.Color.PINK,
            fill: Cesium.Color.PINK.withAlpha(0.5),
            strokeWidth: 2,
            markerSymbol: "circle"
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)
            chinaEarthquakeRef.current = dataSource.entities.values;
          });

        });
      }

    } else {
      chinaEarthquakeRef.current!.forEach(item => {
        item.show = false
      })
    }

  };

  const drawANZNCMainlandOutline = (checked: boolean) => {
    if (checked) {

      if (ANZNCMainlandOutlineRef.current?.length) {

        ANZNCMainlandOutlineRef.current.forEach(item => {
          item.show = true
        })

      } else {
        fetch(window.$$prefix + "/data/earthquake/ANZNC-mainland-outline.geojson").then(res => res.json()).then(data => {
          Cesium.GeoJsonDataSource.load(data, {
            stroke: Cesium.Color.ORANGERED,
            fill: Cesium.Color.ORANGERED.withAlpha(0.2),
            strokeWidth: 2,
            markerSymbol: "circle"
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)
            ANZNCMainlandOutlineRef.current = dataSource.entities.values;
          });

        });
      }

    } else {
      ANZNCMainlandOutlineRef.current!.forEach(item => {
        item.show = false
      })
    }
  }

  const drawNORTHAMEMainlandOutline = (checked: boolean) => {
    if (checked) {

      if (NORTHAMEMainlandOutlineRef.current?.length) {

        NORTHAMEMainlandOutlineRef.current.forEach(item => {
          item.show = true
        })

      } else {
        fetch(window.$$prefix + "/data/earthquake/NORTH-AME-mainland-outline.geojson").then(res => res.json()).then(data => {
          Cesium.GeoJsonDataSource.load(data, {
            stroke: Cesium.Color.ORANGERED,
            fill: Cesium.Color.ORANGERED.withAlpha(0.2),
            strokeWidth: 2,
            markerSymbol: "circle"
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)
            NORTHAMEMainlandOutlineRef.current = dataSource.entities.values;
          });

        });
      }

    } else {
      NORTHAMEMainlandOutlineRef.current!.forEach(item => {
        item.show = false
      })
    }
  }

  const drawAFRICAMainlandOutline = (checked: boolean) => {
    if (checked) {

      if (AFRICAMainlandOutlineRef.current?.length) {

        AFRICAMainlandOutlineRef.current.forEach(item => {
          item.show = true
        })

      } else {
        fetch(window.$$prefix + "/data/earthquake/AFRICA-mainland-outline.geojson").then(res => res.json()).then(data => {
          Cesium.GeoJsonDataSource.load(data, {
            stroke: Cesium.Color.ORANGERED,
            fill: Cesium.Color.ORANGERED.withAlpha(0.2),
            strokeWidth: 2,
            markerSymbol: "circle"
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)
            AFRICAMainlandOutlineRef.current = dataSource.entities.values;
          });

        });
      }

    } else {
      AFRICAMainlandOutlineRef.current!.forEach(item => {
        item.show = false
      })
    }
  }

  const drawTHESOUTHPOLEMainlandOutline = (checked: boolean) => {
    if (checked) {

      if (THESOUTHPOLEMainlandOutlineRef.current?.length) {

        THESOUTHPOLEMainlandOutlineRef.current.forEach(item => {
          item.show = true
        })

      } else {
        fetch(window.$$prefix + "/data/earthquake/THESOUTHPOLE-mainland-outline.geojson").then(res => res.json()).then(data => {
          Cesium.GeoJsonDataSource.load(data, {
            stroke: Cesium.Color.ORANGERED,
            fill: Cesium.Color.ORANGERED.withAlpha(0.2),
            strokeWidth: 2,
            markerSymbol: "circle"
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)
            THESOUTHPOLEMainlandOutlineRef.current = dataSource.entities.values;
          });

        });
      }

    } else {
      THESOUTHPOLEMainlandOutlineRef.current!.forEach(item => {
        item.show = false
      })
    }
  }

  const drawSOUTHAMEMainlandOutline = (checked: boolean) => {
    if (checked) {

      if (SOUTHAMEMainlandOutlineRef.current?.length) {

        SOUTHAMEMainlandOutlineRef.current.forEach(item => {
          item.show = true
        })

      } else {
        fetch(window.$$prefix + "/data/earthquake/SOUTH-AME-mainland-outline.geojson").then(res => res.json()).then(data => {
          Cesium.GeoJsonDataSource.load(data, {
            stroke: Cesium.Color.ORANGERED,
            fill: Cesium.Color.ORANGERED.withAlpha(0.2),
            strokeWidth: 2,
            markerSymbol: "circle"
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)
            SOUTHAMEMainlandOutlineRef.current = dataSource.entities.values;
          });

        });
      }

    } else {
      SOUTHAMEMainlandOutlineRef.current!.forEach(item => {
        item.show = false
      })
    }
  }

  const drawEURASIAMainlandOutline = (checked: boolean) => {
    if (checked) {

      if (EURASIAMainlandOutlineRef.current?.length) {

        EURASIAMainlandOutlineRef.current.forEach(item => {
          item.show = true
        })

      } else {
        fetch(window.$$prefix + "/data/earthquake/EURASIA-mainland-outline.geojson").then(res => res.json()).then(data => {
          Cesium.GeoJsonDataSource.load(data, {
            stroke: Cesium.Color.ORANGERED,
            fill: Cesium.Color.ORANGERED.withAlpha(0.2),
            strokeWidth: 2,
            markerSymbol: "circle"
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)
            EURASIAMainlandOutlineRef.current = dataSource.entities.values;
          });

        });
      }

    } else {
      EURASIAMainlandOutlineRef.current!.forEach(item => {
        item.show = false
      })
    }
  }

  const drawGlobalMainlandName = (checked: boolean) => {

    if (checked) {

      if (globalMainlandNameRef.current?.length) {

        globalMainlandNameRef.current.forEach(item => {
          item.show = true
        })

      } else {


        fetch(window.$$prefix + "/data/earthquake/global-mainland-name.geojson")
          .then(res => res.json())
          .then(data => {
            Cesium.GeoJsonDataSource.load(data, {
              stroke: Cesium.Color.RED,
              fill: Cesium.Color.RED.withAlpha(0.2),
              strokeWidth: 2,
              markerSymbol: "circle"
            }).then(function (dataSource) {
              const viewer = viewerRef.current!;

              viewer.dataSources.add(dataSource);

              dataSource.entities.values.forEach(entity => {
                const props = entity.properties!.getValue();
                if (!props) return;

                const labelConfig = {
                  text: props.name || "",
                  textColor: "#fff", // 原始文字颜色配置
                  outlineColor: "#000000",
                  outlineWidth: 4, // 原100过大，修正为1
                  farDistance: 30000000,
                  nearDistance: 2000000
                };

                // 移除默认点/图标，避免重叠
                entity.billboard = undefined;
                entity.point = undefined;

                // 关键修正：将 color → fontColor
                entity.label = new Cesium.LabelGraphics({
                  text: labelConfig.text,
                  font: '30px sans-serif',
                  style: Cesium.LabelStyle.FILL_AND_OUTLINE, // 关键：同时显示描边和填充
                  outlineColor: Cesium.Color.fromCssColorString(labelConfig.outlineColor),
                  outlineWidth: labelConfig.outlineWidth,
                  fillColor: Cesium.Color.fromCssColorString(labelConfig.textColor),
                  horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                  verticalOrigin: Cesium.VerticalOrigin.CENTER,
                });
              });

              globalMainlandNameRef.current = dataSource.entities.values;
            });
          });

      }

    } else {
      globalMainlandNameRef.current!.forEach(item => {
        item.show = false
      })
    }
  }

  const drawMainlandOutline = (checked: boolean) => {
    drawANZNCMainlandOutline(checked)
    drawNORTHAMEMainlandOutline(checked)
    drawAFRICAMainlandOutline(checked)
    drawTHESOUTHPOLEMainlandOutline(checked)
    drawSOUTHAMEMainlandOutline(checked)
    drawEURASIAMainlandOutline(checked)
    drawGlobalMainlandName(checked)
  }


  const drawStepDividingLine = (checked: boolean) => {

    if (checked) {

      if (stepDividingLineRef.current?.length) {

        stepDividingLineRef.current.forEach(item => {
          item.show = true
        })

      } else {
        fetch(window.$$prefix + "/data/earthquake/step-dividing-line.geojson").then(res => res.json()).then(data => {
          Cesium.GeoJsonDataSource.load(data, {

          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)

            const colors = [
              Cesium.Color.RED,
              Cesium.Color.GREEN,
              Cesium.Color.BLUE,
              Cesium.Color.CYAN,
              Cesium.Color.MAGENTA,
              Cesium.Color.GRAY,
              Cesium.Color.WHITE,
              Cesium.Color.YELLOW,
            ];


            const stepDividingLineInstance = dataSource.entities.values.map((entity, index) => {

              entity.polyline!.width = new Cesium.ConstantProperty(8);

              entity.polyline!.material = new Cesium.PolylineGlowMaterialProperty({
                color: colors[index],

              });

              return entity;
            });

            stepDividingLineRef.current = stepDividingLineInstance;
          });

        });
      }

    } else {
      stepDividingLineRef.current!.forEach(item => {
        item.show = false
      })
    }


  }

  const drawGlobalPlateBoundary = (checked: boolean) => {

    if (checked) {

      if (globalPlateBoundaryRef.current?.length) {

        globalPlateBoundaryRef.current.forEach(item => {
          item.show = true
        })

      } else {
        fetch(window.$$prefix + "/data/earthquake/global-plate-boundary.geojson").then(res => res.json()).then(data => {
          Cesium.GeoJsonDataSource.load(data, {
            stroke: Cesium.Color.RED,
            fill: Cesium.Color.RED.withAlpha(0.2),
            strokeWidth: 2,
            markerSymbol: "circle"
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)


            globalPlateBoundaryRef.current = dataSource.entities.values
          });

        });
      }

    } else {
      globalPlateBoundaryRef.current!.forEach(item => {
        item.show = false
      })
    }
  }

  const drawGlobalPlateBoundaryName = (checked: boolean) => {

    if (checked) {

      if (globalPlateBoundaryNameRef.current?.length) {

        globalPlateBoundaryNameRef.current.forEach(item => {
          item.show = true
        })

      } else {


        fetch(window.$$prefix + "/data/earthquake/global-plate-boundary-name.geojson")
          .then(res => res.json())
          .then(data => {
            Cesium.GeoJsonDataSource.load(data, {
              stroke: Cesium.Color.RED,
              fill: Cesium.Color.RED.withAlpha(0.2),
              strokeWidth: 2,
              markerSymbol: "circle"
            }).then(function (dataSource) {
              const viewer = viewerRef.current!;

              viewer.dataSources.add(dataSource);

              dataSource.entities.values.forEach(entity => {
                const props = entity.properties!.getValue();
                if (!props) return;

                const labelConfig = {
                  text: props.name || "未命名板块",
                  textColor: "#FFFFFF", // 原始文字颜色配置
                  outlineColor: "#000000",
                  outlineWidth: 5, // 原100过大，修正为1
                  farDistance: 30000000,
                  nearDistance: 2000000
                };

                // 移除默认点/图标，避免重叠
                entity.billboard = undefined;
                entity.point = undefined;

                // 关键修正：将 color → fontColor
                entity.label = new Cesium.LabelGraphics({
                  text: labelConfig.text,
                  font: '30px sans-serif',
                  outlineColor: Cesium.Color.fromCssColorString(labelConfig.outlineColor),
                  style: Cesium.LabelStyle.FILL_AND_OUTLINE, // 关键：同时显示描边和填充
                  outlineWidth: labelConfig.outlineWidth,
                  fillColor: Cesium.Color.fromCssColorString(labelConfig.textColor),
                  horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                  verticalOrigin: Cesium.VerticalOrigin.CENTER,
                });
              });

              globalPlateBoundaryNameRef.current = dataSource.entities.values;
            });
          });

      }

    } else {
      globalPlateBoundaryNameRef.current!.forEach(item => {
        item.show = false
      })
    }
  }

  const drawGlobalTrenchName = (checked: boolean) => {

    if (checked) {

      if (globalTrenchRef.current?.length) {

        globalTrenchRef.current.forEach(item => {
          item.show = true
        })

      } else {


        fetch(window.$$prefix + "/data/earthquake/global-trench-name.geojson")
          .then(res => res.json())
          .then(data => {
            Cesium.GeoJsonDataSource.load(data, {
              stroke: Cesium.Color.RED,
              fill: Cesium.Color.RED.withAlpha(0.2),
              strokeWidth: 2,
              markerSymbol: "circle"
            }).then(function (dataSource) {
              const viewer = viewerRef.current!;

              viewer.dataSources.add(dataSource);

              dataSource.entities.values.forEach(entity => {
                const props = entity.properties!.getValue();
                if (!props) return;

                const labelConfig = {
                  text: props.name || "海沟",
                  textColor: "#0307eeff", // 原始文字颜色配置
                  outlineColor: "#000000",
                  outlineWidth: 4, // 原100过大，修正为1
                  farDistance: 30000000,
                  nearDistance: 2000000
                };

                // 移除默认点/图标，避免重叠
                entity.billboard = undefined;
                entity.point = undefined;

                // 关键修正：将 color → fontColor
                entity.label = new Cesium.LabelGraphics({
                  text: labelConfig.text,
                  font: '30px sans-serif',
                  style: Cesium.LabelStyle.FILL_AND_OUTLINE, // 关键：同时显示描边和填充
                  outlineColor: Cesium.Color.fromCssColorString(labelConfig.outlineColor),
                  outlineWidth: labelConfig.outlineWidth,
                  fillColor: Cesium.Color.fromCssColorString(labelConfig.textColor),
                  horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                  verticalOrigin: Cesium.VerticalOrigin.CENTER,
                });
              });

              globalTrenchRef.current = dataSource.entities.values;
            });
          });

      }

    } else {
      globalTrenchRef.current!.forEach(item => {
        item.show = false
      })
    }
  }

  const drawGlobalEarthquakePoint = (checked: boolean) => {

    if (checked) {

      if (globalEarthquakePointRef.current?.length) {

        globalEarthquakePointRef.current.forEach(item => {
          item.show = true
        })

      } else {


        fetch(window.$$prefix + "/data/earthquake/global-earthquake-point.geojson")
          .then(res => res.json())
          .then(data => {
            const featrures = data.features || [];

            globalEarthquakePointRef.current = featrures.map((item: any) => {

              const position = Cesium.Cartesian3.fromDegrees(parseFloat(item.geometry.coordinates[0]), parseFloat(item.geometry.coordinates[1]));

              const props = item.properties || {}

              return viewerRef.current!.entities.add({
                position: position,
                point: {
                  color: Cesium.Color.WHITE,
                  pixelSize: (Number(props.size)) || 5,
                  outlineColor: Cesium.Color.GREEN,
                  outlineWidth: 2
                }
              })
            });
          });

      }

    } else {
      globalEarthquakePointRef.current!.forEach(item => {
        item.show = false
      })
    }
  }

  const drawGlobalVolcanoPoint = (checked: boolean) => {

    if (checked) {

      if (globalVolcanoPointRef.current?.length) {

        globalVolcanoPointRef.current.forEach(item => {
          item.show = true
        })

      } else {


        fetch(window.$$prefix + "/data/earthquake/global-volcano-point.geojson")
          .then(res => res.json())
          .then(data => {
            const featrures = data.features || [];

            globalVolcanoPointRef.current = featrures.map((item: any) => {

              const position = Cesium.Cartesian3.fromDegrees(parseFloat(item.geometry.coordinates[0]), parseFloat(item.geometry.coordinates[1]));

              const props = item.properties || {}

              return viewerRef.current!.entities.add({
                position: position,
                point: {
                  color: Cesium.Color.RED,
                  pixelSize: (Number(props.size)) || 5,
                  outlineColor: Cesium.Color.BLACK,
                  outlineWidth: 2

                }
              })
            });
          });

      }

    } else {
      globalVolcanoPointRef.current!.forEach(item => {
        item.show = false
      })
    }
  }


  const drawGlobalLandArcLine = (checked: boolean) => {
    if (checked) {

      if (globalLandArcLineRef.current?.length) {

        globalLandArcLineRef.current.forEach(item => {
          item.show = true
        })

      } else {

        fetch(window.$$prefix + "/data/earthquake/global-land-arc-line.geojson").then(res => res.json()).then(data => {
          Cesium.GeoJsonDataSource.load(data, {
            stroke: Cesium.Color.BROWN,
            fill: Cesium.Color.BROWN.withAlpha(0.2),
            strokeWidth: 2,
            markerSymbol: "circle"
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)
            globalLandArcLineRef.current = dataSource.entities.values;
          })
        })
      }

    } else {
      globalLandArcLineRef.current!.forEach(item => {
        item.show = false
      })
    }

  }

  const drawGlobalLandArcName = (checked: boolean) => {

    if (checked) {

      if (globalLandArcNameRef.current?.length) {

        globalLandArcNameRef.current.forEach(item => {
          item.show = true
        })

      } else {
        fetch(window.$$prefix + "/data/earthquake/global-land-arc-name.geojson")
          .then(res => res.json())
          .then(data => {
            Cesium.GeoJsonDataSource.load(data, {
              stroke: Cesium.Color.RED,
              fill: Cesium.Color.RED.withAlpha(0.2),
              strokeWidth: 2,
              markerSymbol: "circle"
            }).then(function (dataSource) {
              const viewer = viewerRef.current!;

              viewer.dataSources.add(dataSource);

              dataSource.entities.values.forEach(entity => {
                const props = entity.properties!.getValue();
                if (!props) return;

                const labelConfig = {
                  text: props.name || "岛",
                  textColor: "#fff", // 原始文字颜色配置
                  outlineColor: "#000000",
                  outlineWidth: 4, // 原100过大，修正为1
                  farDistance: 30000000,
                  nearDistance: 2000000
                };

                // 移除默认点/图标，避免重叠
                entity.billboard = undefined;
                entity.point = undefined;

                // 关键修正：将 color → fontColor
                entity.label = new Cesium.LabelGraphics({
                  text: labelConfig.text,
                  font: '20px sans-serif',
                  style: Cesium.LabelStyle.FILL_AND_OUTLINE, // 关键：同时显示描边和填充
                  outlineColor: Cesium.Color.fromCssColorString(labelConfig.outlineColor),
                  outlineWidth: labelConfig.outlineWidth,
                  fillColor: Cesium.Color.fromCssColorString(labelConfig.textColor),
                  horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                  verticalOrigin: Cesium.VerticalOrigin.CENTER,
                });
              });

              globalLandArcNameRef.current = dataSource.entities.values;
            });
          });

      }

    } else {
      globalLandArcNameRef.current!.forEach(item => {
        item.show = false
      })
    }
  }

  const drawGlobalLandArc = (checked: boolean) => {
    drawGlobalLandArcLine(checked)
    drawGlobalLandArcName(checked)
  }

  const drawGlobalRiftValley = (checked: boolean) => {
    drawGlobalRiftValleyLine(checked)
    drawGlobalRiftValleyName(checked)
  }
  const drawGlobalRiftValleyLine = (checked: boolean) => {
    if (checked) {

      if (globalRiftValleyLineRef.current?.length) {

        globalRiftValleyLineRef.current.forEach(item => {
          item.show = true
        })

      } else {

        fetch(window.$$prefix + "/data/earthquake/global-rift-valley-line.geojson").then(res => res.json()).then(data => {
          Cesium.GeoJsonDataSource.load(data, {
            stroke: Cesium.Color.GOLD,
            fill: Cesium.Color.GOLD.withAlpha(0.2),
            strokeWidth: 2,
            markerSymbol: "circle"
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)
            globalRiftValleyLineRef.current = dataSource.entities.values;
          })
        })
      }

    } else {
      globalRiftValleyLineRef.current!.forEach(item => {
        item.show = false
      })
    }

  }

  const drawGlobalRiftValleyName = (checked: boolean) => {

    if (checked) {

      if (globalRiftValleyNameRef.current?.length) {

        globalRiftValleyNameRef.current.forEach(item => {
          item.show = true
        })

      } else {


        fetch(window.$$prefix + "/data/earthquake/global-rift-valley-name.geojson")
          .then(res => res.json())
          .then(data => {
            Cesium.GeoJsonDataSource.load(data, {
              stroke: Cesium.Color.RED,
              fill: Cesium.Color.RED.withAlpha(0.2),
              strokeWidth: 2,
              markerSymbol: "circle"
            }).then(function (dataSource) {
              const viewer = viewerRef.current!;

              viewer.dataSources.add(dataSource);

              dataSource.entities.values.forEach(entity => {
                const props = entity.properties!.getValue();
                if (!props) return;

                const labelConfig = {
                  text: props.name || "",
                  textColor: "#fff", // 原始文字颜色配置
                  outlineColor: "#000000",
                  outlineWidth: 4, // 原100过大，修正为1
                  farDistance: 30000000,
                  nearDistance: 2000000
                };

                // 移除默认点/图标，避免重叠
                entity.billboard = undefined;
                entity.point = undefined;

                // 关键修正：将 color → fontColor
                entity.label = new Cesium.LabelGraphics({
                  text: labelConfig.text,
                  font: '20px sans-serif',
                  style: Cesium.LabelStyle.FILL_AND_OUTLINE, // 关键：同时显示描边和填充
                  outlineColor: Cesium.Color.fromCssColorString(labelConfig.outlineColor),
                  outlineWidth: labelConfig.outlineWidth,
                  fillColor: Cesium.Color.fromCssColorString(labelConfig.textColor),
                  horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                  verticalOrigin: Cesium.VerticalOrigin.CENTER,
                });
              });

              globalRiftValleyNameRef.current = dataSource.entities.values;
            });
          });

      }

    } else {
      globalRiftValleyNameRef.current!.forEach(item => {
        item.show = false
      })
    }
  }

  const playVideo = (src: string) => {
    modal.info({
      icon: null,
      title: '视频播放',
      content: <video src={src} style={{ width: '100%', height: '100%' }} controlsList="nodownload" controls autoPlay />,
      okText: '关闭',
      cancelText: '取消',
      width: 800,
      centered: true,
      onOk() {
      },
      onCancel() {
      }
    })
  }

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

        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(111.54, 34.85, 12000000),
        });
      }
    );

    (viewer.cesiumWidget.creditContainer as HTMLDivElement).style.display = "none";


    drawChinaBoundary()

    setupClickHandler(viewer);

    return () => viewer.destroy();
  }, []);


  return (
    <>
      {modalContext}
      <div className="canvas-container">
        <div className="canvas-container-body" ref={containerRef} />
        <div className="canvas-container-body-controls" >

          <Button type="primary" size="small" style={{ marginBottom: 4 }}
            onClick={() => {
              const src = window.$$prefix + '/data/earthquake/earthquake.mp4'

              playVideo(src)

            }}
          >地震视频</Button>
          <Form
            name="basic"
            labelAlign="left"
            labelCol={{ span: 20 }}
            labelWrap={true}
            wrapperCol={{ span: 4 }}
            initialValues={{
              drawStepDividingLine: false,
              drawGlobalPlateBoundary: false,
              drawGlobalPlateBoundaryName: false,
              drawGlobalTrenchName: false,
              drawGlobalEarthquakePoint: false,
              drawGlobalVolcanoPoint: false,
              drawGlobalLandArcLine: false
            }}
            autoComplete="off"
            onFieldsChange={(values) => {
              const name = values[0].name[0];

              const value = values[0].value;

              if (name === 'drawChinaEarthquakeArea') {
                drawChinaEarthquakeArea(value)
              }

              if (name === 'drawMainlandOutline') {
                drawMainlandOutline(value)
              }


              if (name === 'drawStepDividingLine') {
                drawStepDividingLine(value)
              }

              if (name === 'drawGlobalPlateBoundary') {
                drawGlobalPlateBoundary(value)
              }

              if (name === 'drawGlobalPlateBoundaryName') {
                drawGlobalPlateBoundaryName(value)
              }

              if (name === 'drawGlobalTrenchName') {
                drawGlobalTrenchName(value)
              }

              if (name === 'drawGlobalEarthquakePoint') {
                drawGlobalEarthquakePoint(value)
              }

              if (name === 'drawGlobalVolcanoPoint') {
                drawGlobalVolcanoPoint(value)
              }


              if (name === 'drawGlobalLandArc') {
                drawGlobalLandArc(value)
              }


              if (name === 'drawGlobalRiftValley') {
                drawGlobalRiftValley(value)
              }


            }}
          >
            <Form.Item name="drawChinaEarthquakeArea" valuePropName="checked" label={'中国主要地震带'} style={{ marginBottom: '4px' }}>
              <Checkbox></Checkbox>
            </Form.Item>
            <Form.Item name="drawStepDividingLine" valuePropName="checked" label={'梯度分界线'} style={{ marginBottom: '4px' }}>
              <Checkbox></Checkbox>
            </Form.Item>
            <Form.Item name="drawMainlandOutline" valuePropName="checked" label={'大陆板块'} style={{ marginBottom: '4px' }}>
              <Checkbox></Checkbox>
            </Form.Item>
            <Form.Item name="drawGlobalPlateBoundary" valuePropName="checked" label={'板块分界线'} style={{ marginBottom: '4px' }}>
              <Checkbox></Checkbox>
            </Form.Item>
            <Form.Item name="drawGlobalPlateBoundaryName" valuePropName="checked" label={'板块名称'} style={{ marginBottom: '4px' }}>
              <Checkbox></Checkbox>
            </Form.Item>

            <Form.Item name="drawGlobalTrenchName" valuePropName="checked" label={'主要海沟'} style={{ marginBottom: '4px' }}>
              <Checkbox></Checkbox>
            </Form.Item>

            <Form.Item name="drawGlobalEarthquakePoint" valuePropName="checked" label={'地震分布（近10年）'} style={{ marginBottom: '4px' }}>
              <Checkbox></Checkbox>
            </Form.Item>

            <Form.Item name="drawGlobalVolcanoPoint" valuePropName="checked" label={'火山分布'} style={{ marginBottom: '4px' }}>
              <Checkbox></Checkbox>
            </Form.Item>

            <Form.Item name="drawGlobalLandArc" valuePropName="checked" label={'主要岛弧'} style={{ marginBottom: '4px' }}>
              <Checkbox></Checkbox>
            </Form.Item>

            <Form.Item name="drawGlobalRiftValley" valuePropName="checked" label={'主要裂谷'} style={{ marginBottom: '4px' }}>
              <Checkbox></Checkbox>
            </Form.Item>

          </Form>

        </div>
      </div>
    </>

  );
};

export default Earthquake;
