import * as Cesium from "cesium";
import { useEffect, useRef, useState } from "react";
import { Button, Checkbox, Form } from 'antd'
import DrawerCountour from "../../utils/countour";
import WaterPrimitive from "./water-primitive";

type SuzhouRiverPropsType = {

}

const SuzhouRiver: React.FC<SuzhouRiverPropsType> = (props) => {

  const containerRef = useRef<HTMLDivElement>(null);

  const viewerRef = useRef<Cesium.Viewer | null>(null);

  const suzhouRiverWaterPrimitivesRef = useRef<any[]>([]);

  const huangpuRiverWaterPrimitivesRef = useRef<any[]>([]);

  const wenzaobangWaterPrimitivesRef = useRef<any[]>([]);

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

          destination: Cesium.Cartesian3.fromDegrees(121.491185, 31.250281, 25000),
          /*          orientation: {
                     heading: 6.1552778668430514,
                     pitch: -0.774444999584774,
                     roll: 6.282667953914245
                   } */
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

      data.geometries.forEach((item: any) => {

        const coordinates = item.coordinates[0];
        const positions = coordinatesToPositions(coordinates);

        addWaterRegion(positions, suzhouRiverWaterPrimitivesRef.current)
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

      data.geometries.forEach((item: any) => {

        const coordinates = item.coordinates[0];
        const positions = coordinatesToPositions(coordinates);

        addWaterRegion(positions, huangpuRiverWaterPrimitivesRef.current)
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

      data.geometries.forEach((item: any) => {

        const coordinates = item.coordinates[0];
        const positions = coordinatesToPositions(coordinates);

        addWaterRegion(positions, wenzaobangWaterPrimitivesRef.current)
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

    return () => viewer.destroy();
  }, []);


  return (
    <div className="canvas-container">
      <div className="canvas-container-body" ref={containerRef} />
      <div style={{ position: "absolute", top: "10px", right: "10px", padding: "20px 20px", width: '200px', background: "rgba(83, 83, 83, 0.42)", borderRadius: "5px" }}>

        <Form
          name="basic"
          labelAlign="left"
          labelCol={{ span: 20 }}
          labelWrap={true}
          wrapperCol={{ span: 4 }}
          initialValues={{

          }}
          autoComplete="off"
          onFieldsChange={(values) => {
            const name = values[0].name[0];

            const value = values[0].value;


          }}
        >

        </Form>
      </div>

    </div>
  );
}

export default SuzhouRiver