import * as Cesium from "cesium";
import { useEffect, useRef } from "react";
import WaterPrimitive from "@/utils/plugins/water-primitive";
import * as gui from 'lil-gui'

type SuzhouRiverPropsType = {

}

const SuzhouRiver: React.FC<SuzhouRiverPropsType> = (props) => {

  const containerRef = useRef<HTMLDivElement>(null);

  const viewerRef = useRef<Cesium.Viewer | null>(null);

  const guiRef = useRef<gui.GUI | null>(null);

  const suzhouRiverWaterPrimitivesRef = useRef<any[]>([]);

  const huangpuRiverWaterPrimitivesRef = useRef<any[]>([]);

  const wenzaobangWaterPrimitivesRef = useRef<any[]>([]);

  const guiControls = {
    history: () => {
      viewerRef.current?.camera.flyTo({ destination: Cesium.Cartesian3.fromDegrees(121.44681124210383, 31.253252971821134, 300) });

      // 添加瓦片图
      const imageryLayer = viewerRef.current!.imageryLayers.addImageryProvider(
        new Cesium.UrlTemplateImageryProvider({
          url: window.$$prefix + "/image/tif-png7/{z}/{x}/{y}.png",
          maximumLevel: 19,
        })
      );

      // 设置右边显示历史影像
      imageryLayer.splitDirection = Cesium.SplitDirection.RIGHT;

      // slider 控制
      const slider = document.getElementById("slider");

      slider!.style.display = "block";

      // @ts-ignore
      viewerRef.current!.scene.splitPosition = 0.5; // 默认中间分割

      let handler = false;
      slider!.addEventListener("mousedown", () => handler = true);
      window.addEventListener("mouseup", () => handler = false);
      window.addEventListener("mousemove", (e) => {
        if (!handler) return;
        const splitPos = e.clientX / window.innerWidth;
        slider!.style.left = (splitPos * 100) + "%";
        viewerRef.current!.scene.splitPosition = splitPos;
      });
    },
  };

  const initGui = () => {
    if (guiRef.current) {
      guiRef.current.destroy()
      guiRef.current = null
    }

    guiRef.current = new gui.GUI({})

    guiRef.current.title('苏州河')

    guiRef.current.add(guiControls, 'history').name('加载历史影像')

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

  const addWaterRegion = (positions: any, instance: any[]) => {
    let waterPrimitive = new WaterPrimitive(positions, {
      baseWaterColor: Cesium.Color.AQUA.withAlpha(0.6),
      normalMap: window.$$prefix + '/waterNormalsSmall.jpg',
      frequency: 1000.0,
      animationSpeed: 0.01,
      amplitude: 10,
      specularIntensity: 10
    });


    viewerRef.current!.scene.primitives.add(waterPrimitive); //添加到场景

    instance.push(waterPrimitive);
  }

  const coordinatesToPositions = (coordinates: any[]) => {

    let positions = [] as any;
    coordinates.map(c => {

      positions.push(Cesium.Cartesian3.fromDegrees(c[0], c[1], 0))
    });

    return positions;
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
          destination: Cesium.Cartesian3.fromDegrees(121.491185, 31.250281, 25000),
        });
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

    fetch(window.$$prefix + "/data/china/shanghai-area.geojson").then(res => res.json()).then(data => {
      Cesium.GeoJsonDataSource.load(data, {
        stroke: Cesium.Color.PINK,
        fill: Cesium.Color.PINK.withAlpha(0.2),
        strokeWidth: 2,
        markerSymbol: "circle"
      }).then(function (dataSource) {
        viewer.dataSources.add(dataSource)
      })
    })

    fetch(window.$$prefix + "/data/suzhou-river/suzhou-river.geojson").then(res => res.json()).then(data => {

      data.features.forEach((item: any) => {

        item.geometry.geometries.forEach((v: any) => {
          const coordinates = v.coordinates[0];

          const positions = coordinatesToPositions(coordinates);

          addWaterRegion(positions, suzhouRiverWaterPrimitivesRef.current)
        })

      })

      /*       Cesium.GeoJsonDataSource.load(data, {
              stroke: Cesium.Color.YELLOW,
              fill: Cesium.Color.YELLOW.withAlpha(0.2),
              strokeWidth: 4,
              markerSymbol: "circle"
            }).then(function (dataSource) {
              viewer.dataSources.add(dataSource)
            }); */

      // 绘制文字
      viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(121.451185, 31.250281),
        label: {
          text: "苏州河",
          font: "30px sans-serif",
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          outlineWidth: 2,
          outlineColor: Cesium.Color.BLACK,
          fillColor: Cesium.Color.YELLOW,
        }
      })

    });

    fetch(window.$$prefix + "/data/suzhou-river/huangpu-river.geojson").then(res => res.json()).then(data => {

      data.features.forEach((item: any) => {

        item.geometry.geometries.forEach((v: any) => {
          const coordinates = v.coordinates[0];

          const positions = coordinatesToPositions(coordinates);

          addWaterRegion(positions, huangpuRiverWaterPrimitivesRef.current)
        })

      })

      // 绘制文字
      viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(121.531185, 31.241281),
        label: {
          text: "黄埔江",
          font: "40px sans-serif",
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          outlineWidth: 2,
          outlineColor: Cesium.Color.BLACK,
          fillColor: Cesium.Color.YELLOW,
        }
      })
    });

    fetch(window.$$prefix + "/data/suzhou-river/wenzaobang.geojson").then(res => res.json()).then(data => {

      data.features.forEach((item: any) => {

        item.geometry.geometries.forEach((v: any) => {
          const coordinates = v.coordinates[0];

          const positions = coordinatesToPositions(coordinates);

          addWaterRegion(positions, wenzaobangWaterPrimitivesRef.current)
        })

      })

      // 绘制文字
      viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(121.451185, 31.342281),
        label: {
          text: "蕰藻浜",
          font: "26px sans-serif",
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          outlineWidth: 2,
          outlineColor: Cesium.Color.BLACK,
          fillColor: Cesium.Color.YELLOW,
        }
      })
    })

    initClickHandler(viewer);

    initGui()

    return () => {
      viewer.destroy()
      guiRef.current?.destroy()
    };
  }, []);


  return (
    <div className="canvas-container">
      <div className="canvas-container-body" ref={containerRef} />
      <div id="slider" style={{ display: 'none' }}></div>
    </div>
  );
}

export default SuzhouRiver