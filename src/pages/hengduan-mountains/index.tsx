import * as Cesium from "cesium";
import { useEffect, useRef } from "react";
import DrawCountour from "@/utils/countour";
import * as gui from 'lil-gui'

const HengduanMountains = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);

  const guiRef = useRef<gui.GUI | null>(null);

  const guiControls = {
    countour: () => {
      getCameraParams()
    },
  };

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

  // @ts-ignore
  window.getCameraParams = getCameraParams

  const initGui = () => {
    if (guiRef.current) {
      guiRef.current.destroy()
      guiRef.current = null
    }

    guiRef.current = new gui.GUI({})

    guiRef.current.title('横断山脉')

    guiRef.current.add(guiControls, 'countour').name('获取参数')
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
          destination: Cesium.Cartesian3.fromDegrees(99.05746825, 29.35850818, 4863.54),
          orientation: {
            heading: 2.9208046571239317,
            pitch: -0.12289746941645263,
            roll: 6.283132085195532
          }
        });
      }
    );

    (viewer.cesiumWidget.creditContainer as HTMLDivElement).style.display = "none";

    initClickHandler(viewer);

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

export default HengduanMountains;
