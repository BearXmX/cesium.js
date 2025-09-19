import * as Cesium from "cesium";
import { useEffect, useRef } from "react";
import DrawCountour from "@/utils/countour";
import * as gui from 'lil-gui'

const SheshanMountain: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);

  const guiRef = useRef<gui.GUI | null>(null);

  const guiControls = {
    countour: () => {
      fetch(window.$$prefix + "/data/sheshan-mountain/sheshan-mountain.geojson").then(res => res.json()).then(data => {
        const ellipseContour = DrawCountour.drawShapeByGeojson(viewerRef.current!, data);
      })
    },
  };

  const initGui = () => {
    if (guiRef.current) {
      guiRef.current.destroy()
      guiRef.current = null
    }

    guiRef.current = new gui.GUI({})

    guiRef.current.title('佘山')

    guiRef.current.add(guiControls, 'countour').name('绘制佘山等高线')

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


      /*       baseLayer: new Cesium.ImageryLayer(new Cesium.WebMapTileServiceImageryProvider({
              url: "http://t0.tianditu.gov.cn/img_w/wmts?tk=03e1637ffbffc98d74b6ead0631a29d4",
              layer: 'img',
              style: 'default',
              format: 'tiles',
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
          destination: Cesium.Cartesian3.fromDegrees(121.19439881893892, 31.085280932994194, 1400),
          orientation: {
            heading: 6.1552778668430514,
            pitch: -0.774444999584774,
            roll: 6.282667953914245
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

export default SheshanMountain;
