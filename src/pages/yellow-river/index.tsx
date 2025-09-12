import * as Cesium from "cesium";
import { useEffect, useRef, useState } from "react";
import { Button, Checkbox, Form } from 'antd'
import DrawerCountour from "../../utils/countour";

const YellowRiver = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);

  const yellowRiverBranchRef = useRef<Cesium.Entity[]>([]);

  const yellowRiverAreaProvinceRef = useRef<Cesium.Entity[]>([]);

  const loessPlateauAreaRef = useRef<Cesium.Entity[]>([]);

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
          destination: Cesium.Cartesian3.fromDegrees(111.54, 34.85, 4000000),
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



    const positions = [{ lon: '110.1042', lat: '37.4324' }, { lon: '108.4434', lat: '40.3717' }]

    // 标点

    const pointInstance = positions.map(item => {

      const position = Cesium.Cartesian3.fromDegrees(parseFloat(item.lon), parseFloat(item.lat));

      return viewer.entities.add({
        position: position,
        point: {
          color: Cesium.Color.RED,
          pixelSize: 8,
          outlineColor: Cesium.Color.GREEN,
        }
      })

    })

    return () => viewer.destroy();
  }, []);


  return (
    <div className="canvas-container">
      <div className="canvas-container-body" ref={containerRef} />
      <div className="canvas-container-body-controls">

        <Form
          name="basic"
          labelAlign="left"
          labelCol={{ span: 20 }}
          labelWrap={true}
          wrapperCol={{ span: 4 }}
          initialValues={{
            drawYellowRiverBranch: false,
            drawYellowRiverAreaProvince: false,
            drawLoessPlateauArea: false
          }}
          autoComplete="off"
          onFieldsChange={(values) => {
            const name = values[0].name[0];

            const value = values[0].value;

            if (name === 'drawYellowRiverBranch') {
              drawYellowRiverBranch(value)
            }

            if (name === 'drawYellowRiverAreaProvince') {
              drawYellowRiverAreaProvince(value)
            }

            if (name === 'drawLoessPlateauArea') {
              drawLoessPlateauArea(value)
            }

          }}
        >

          <Form.Item name="drawYellowRiverBranch" valuePropName="checked" label={'黄河支流'} style={{ marginBottom: '5px' }}>
            <Checkbox></Checkbox>
          </Form.Item>

          <Form.Item name="drawYellowRiverAreaProvince" valuePropName="checked" label={'黄河流域省域'} style={{ marginBottom: '5px' }}>
            <Checkbox></Checkbox>
          </Form.Item>
          <Form.Item name="drawLoessPlateauArea" valuePropName="checked" label={'黄土高原区域'} style={{ marginBottom: '5px' }}>
            <Checkbox></Checkbox>
          </Form.Item>
        </Form>
      </div>

    </div>
  );
};

export default YellowRiver;
