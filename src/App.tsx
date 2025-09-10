import * as Cesium from "cesium";
import { useEffect, useRef, useState } from "react";
import { contours } from "d3-contour";

import { Button } from 'antd'
import './ContourAnalysis'

const App = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);

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
    });

    viewerRef.current = viewer;

    Cesium.createWorldTerrainAsync({ requestVertexNormals: true, requestWaterMask: true }).then(
      async (terrain) => {
        viewer.terrainProvider = terrain;

        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(86.55, 27.99, 3000),
        });
      }
    );

    (viewer.cesiumWidget.creditContainer as HTMLDivElement).style.display = "none";

    return () => viewer.destroy();
  }, []);


  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      <Button type="primary" style={{ position: "absolute", top: "10px", left: "10px" }} onClick={() => {
        // @ts-ignore
        let contourAnalysis = new window.ContourAnalysis(viewerRef.current);
        let options = {
          countorLineList: [],
        };
        contourAnalysis.createContour(options);
      }}>绘制等高线</Button>
    </div>
  );
};

export default App;
