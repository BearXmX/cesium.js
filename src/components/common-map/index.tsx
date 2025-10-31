import { Spin } from "antd";
import * as Cesium from "cesium";
import React, { useEffect, useImperativeHandle, useState } from "react";
import { useRef } from "react";

export type CommonMapPropsType = {
  /** @description 地形加载完的回调 */
  terrainInitCallback?: () => void
  containerStyle?: React.CSSProperties
}

export type CommonMapInstanceType = {
  getViewer: () => Cesium.Viewer
}

const CommonMap = React.forwardRef<CommonMapInstanceType, CommonMapPropsType>((props, instance) => {

  const { terrainInitCallback } = props

  const [loading, setLoading] = useState<boolean>(true)

  const containerRef = useRef<HTMLDivElement>(null);

  const viewerRef = useRef<Cesium.Viewer | null>(null);

  useImperativeHandle(instance, () => {
    return {
      getViewer() {
        return viewerRef.current!
      }
    }
  })

  /** @description 获取当前相机参数 */
  const getCameraParams = (viewerRef: React.RefObject<Cesium.Viewer | null>) => {
    const camera = viewerRef.current!.camera

    // 获取相机位置（笛卡尔坐标）
    const position = camera.position

    // 获取方向参数
    const heading = camera.heading
    const pitch = camera.pitch
    const roll = camera.roll

    // 转换为经纬度
    const cartographic = Cesium.Cartographic.fromCartesian(position)
    const lon = Cesium.Math.toDegrees(cartographic.longitude)
    const lat = Cesium.Math.toDegrees(cartographic.latitude)
    const height = cartographic.height

    // 生成flyTo代码
    const code = `viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(${lon.toFixed(8)}, ${lat.toFixed(8)}, ${height.toFixed(2)}),
        orientation: {
            heading: ${heading},
            pitch: ${pitch},
            roll: ${roll}
        }
    });`

    console.log(code)

    return code
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


      getCameraParams(viewerRef)
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }


  const init = () => {
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

    viewer.scene.globe.showGroundAtmosphere = false;

    (viewer.cesiumWidget.creditContainer as HTMLDivElement).style.display = "none";

    viewerRef.current = viewer;

    Cesium.createWorldTerrainAsync({ requestVertexNormals: true, requestWaterMask: true }).then(
      async (terrain) => {
        viewer.terrainProvider = terrain;
        setLoading(false)
        if (typeof terrainInitCallback === 'function') {
          terrainInitCallback()
        }
      }
    ).finally(() => {
      setLoading(false)
    });

    initClickHandler(viewer)

    viewerRef.current = viewer;
  }

  useEffect(() => {
    init()

    return () => {
      viewerRef.current!.destroy()
    }
  }, [])

  return (
    <>
      {
        loading && <div className="canvas-container-loading" style={{
          position: 'fixed',
          width: '100vw',
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 999999999,
          background: '#000'
        }}>
          <Spin spinning={true} tip={<div style={{ width: 200, transform: 'translateX(-50%)' }}>加载中...</div>}>
            <></>
          </Spin>
        </div>
      }
      <div className="canvas-container" style={props.containerStyle}>
        <div className="canvas-container-body" ref={containerRef} />
      </div>
    </>

  );
})

export default CommonMap;
