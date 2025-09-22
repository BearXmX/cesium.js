import * as Cesium from "cesium";
import { useEffect, useRef } from "react";
import WaterPrimitive from "@/utils/plugins/water-primitive";
import * as gui from 'lil-gui'
import SampleLabel from "@/utils/plugins/sample-label";
import { notification } from 'antd'
import landUseType1958 from "@/assets/suzhou-river/land-use-type-1958.png";
import landUseType1989 from "@/assets/suzhou-river/land-use-type-1989.png";
import landUseType2021 from "@/assets/suzhou-river/land-use-type-2021.png";

type SuzhouRiverPropsType = {

}

const SuzhouRiver: React.FC<SuzhouRiverPropsType> = (props) => {
  const [notificationApi, notificationContextHolder] = notification.useNotification();

  const containerRef = useRef<HTMLDivElement>(null);

  const viewerRef = useRef<Cesium.Viewer | null>(null);

  const guiRef = useRef<gui.GUI | null>(null);

  const suzhouRiverWaterPrimitivesRef = useRef<any[]>([]);

  const huangpuRiverWaterPrimitivesRef = useRef<any[]>([]);

  const wenzaobangWaterPrimitivesRef = useRef<any[]>([]);

  const suzhouRiverSubsectionInstanceList = useRef<{
    position: Cesium.Cartesian3
    text: string,
    instance: SampleLabel
    key: string
  }[]>([]);

  const suzhouRiverWaterQualityCheckpointInstanceList = useRef<{
    position: Cesium.Cartesian3
    text: string,
    instance: SampleLabel
    key: string
  }[]>([]);

  const suzhouOrganismSamplingPointInstanceList = useRef<{
    position: Cesium.Cartesian3
    text: string,
    instance: SampleLabel
    key: string
  }[]>([]);


  const initSuzhouRiverSubsection = () => {

    suzhouRiverSubsectionInstanceList.current = [
      {
        position: Cesium.Cartesian3.fromDegrees(121.3434840671743,
          31.241460134456975, 20),
        text: '上中游分界点：外环线交界处附近',
        instance: null,
        key: 'waihuanxianjiaohechu'
      },
      {
        position: Cesium.Cartesian3.fromDegrees(121.46746389388825,
          31.242487823822824, 20),
        text: '中下游分界点：西藏路桥附近',
        instance: null,
        key: 'xizangluqiao'
      },
    ].map(item => {
      const instance = new SampleLabel(viewerRef.current!, item.position, item.text, {
        containerBackgroundUrlType: 'subsection',
        defaultVisible: false,
      });

      return {
        ...item,
        instance
      }
    })
  }

  const cartesian3ToDegrees = (cartesian: Cesium.Cartesian3, ellipsoid: Cesium.Ellipsoid) => {
    // 如果未指定椭球体，使用默认的WGS84椭球体
    ellipsoid = ellipsoid || Cesium.Ellipsoid.WGS84;

    // 将笛卡尔坐标转换为弧度表示的地理坐标（包含经度、纬度和高度）
    const cartographic = ellipsoid.cartesianToCartographic(cartesian);

    // 将弧度转换为度
    const longitude = Cesium.Math.toDegrees(cartographic.longitude);
    const latitude = Cesium.Math.toDegrees(cartographic.latitude);
    const height = cartographic.height;

    // 返回转换后的结果
    return {
      longitude: longitude,  // 经度（度）
      latitude: latitude,    // 纬度（度）
      height: height         // 高度（米）
    };
  }

  const initSuzhouRiverWaterQualityCheckpoint = () => {
    suzhouRiverWaterQualityCheckpointInstanceList.current = [
      {
        position: Cesium.Cartesian3.fromDegrees(121.06882662310454,
          31.27132274728444, 20),
        text: '赵屯采样点',
        instance: null,
        key: 'zhaotun'
      },
      {
        position: Cesium.Cartesian3.fromDegrees(121.13957587143663,
          31.276408039162483, 20),
        text: '白鹤监测点',
        instance: null,
        key: 'baihe'
      },
      {
        position: Cesium.Cartesian3.fromDegrees(121.2056800976854,
          31.262942190328197, 20),
        text: '黄渡监测点',
        instance: null,
        key: 'huangdu'
      },
      {
        position: Cesium.Cartesian3.fromDegrees(121.29782792888692,
          31.2325661633712, 20),
        text: '华漕监测点',
        instance: null,
        key: 'huangcao'
      },
      {
        position: Cesium.Cartesian3.fromDegrees(121.3705260355628,
          31.22211701517949, 20),
        text: '北新泾桥检测点',
        instance: null,
        key: 'beixinjingqiao'
      },
      {
        position: Cesium.Cartesian3.fromDegrees(121.42163373492512,
          31.238061858433714, 20),
        text: '武宁路桥检测点',
        instance: null,
        key: 'wuningluqiao'
      },
      {
        position: Cesium.Cartesian3.fromDegrees(121.47199395014944,
          31.24337872925361, 20),
        text: '浙江路桥检测点',
        instance: null,
        key: 'zhejiangluqiao'
      },
    ].map(item => {
      const instance = new SampleLabel(viewerRef.current!, item.position, item.text, {
        containerBackgroundUrlType: 'position',
        defaultVisible: false,
        clickCallback() {

          const { longitude, latitude, height } = cartesian3ToDegrees(item.position, Cesium.Ellipsoid.WGS84);

          viewerRef.current?.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, height + 1500)
          })
        },
      });

      return {
        ...item,
        instance
      }
    })
  }

  const initSuzhouOrganismSamplingPoint = () => {
    suzhouOrganismSamplingPointInstanceList.current = [
      {
        position: Cesium.Cartesian3.fromDegrees(121.06882662310454,
          31.27132274728444, 20),
        text: '赵屯采样点',
        instance: null,
        key: 'zhaotun'
      },
      {
        position: Cesium.Cartesian3.fromDegrees(121.13957587143663,
          31.276408039162483, 20),
        text: '白鹤采样点',
        instance: null,
        key: 'baihe'
      },
      {
        position: Cesium.Cartesian3.fromDegrees(121.15127478095383,
          31.24785027197842, 20),
        text: '油墩港采样点',
        instance: null,
        key: 'youdungang'
      },
      {
        position: Cesium.Cartesian3.fromDegrees(121.18644985325142,
          31.286938997290594, 20),
        text: '蕰藻浜采样点',
        instance: null,
        key: 'youdungang'
      },
      {
        position: Cesium.Cartesian3.fromDegrees(121.2056800976854,
          31.262942190328197, 20),
        text: '黄渡采样点',
        instance: null,
        key: 'huangdu'
      },
      {
        position: Cesium.Cartesian3.fromDegrees(121.21606433578347,
          31.23870109831264, 20),
        text: '新通波塘采样点',
        instance: null,
        key: 'xintongbotang'
      },

      {
        position: Cesium.Cartesian3.fromDegrees(121.3050986802439,
          31.23013495530406, 20),
        text: '封浜河口采样点',
        instance: null,
        key: 'fengbanghekou'
      },
      {
        position: Cesium.Cartesian3.fromDegrees(121.3705260355628,
          31.22211701517949, 20),
        text: '北新泾采样点',
        instance: null,
        key: 'beixinjing'
      },
      {
        position: Cesium.Cartesian3.fromDegrees(121.40609682263974,
          31.224322543280437, 20),
        text: '中山西路桥采样点',
        instance: null,
        key: 'zhongshanxiluqiao'
      },
      {
        position: Cesium.Cartesian3.fromDegrees(121.42163373492512,
          31.238061858433714, 20),
        text: '武宁路桥采样点',
        instance: null,
        key: 'wuningluqiao'
      },
      {
        position: Cesium.Cartesian3.fromDegrees(121.43933081962545,
          31.25147040235041, 20),
        text: '昌化路桥采样点',
        instance: null,
        key: 'changhualuqiao'
      },
      {
        position: Cesium.Cartesian3.fromDegrees(121.45839629705713,
          31.243381599059376, 20),
        text: '成都路桥采样点',
        instance: null,
        key: 'chengduluqiao'
      },
      {
        position: Cesium.Cartesian3.fromDegrees(121.48578360715773,
          31.24565877260106, 20),
        text: '外白渡桥采样点',
        instance: null,
        key: 'waibaiduqiao'
      },
    ].map(item => {
      const instance = new SampleLabel(viewerRef.current!, item.position, item.text, {
        containerBackgroundUrlType: 'position',
        defaultVisible: false,
        clickCallback() {

          const { longitude, latitude, height } = cartesian3ToDegrees(item.position, Cesium.Ellipsoid.WGS84);

          viewerRef.current?.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, height + 1500)
          })
        },
      });

      return {
        ...item,
        instance
      }
    })
  }


  const guiControls = {
    drawSuzhouRiverSubsectionPoint: false,
    drawWaterQualitycheckpoint: false,
    drawSuzhouRiverOrganismSamplingPoint: false,
    drawSuzhouRiverUpstreamSegment: false,
    drawSuzhouRiverMidstreamSegment: false,
    drawSuzhouRiverDownstreamSegment: false,
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

    showLandUseType: () => {
      notificationApi.info({
        message: `用地类型分布图`,
        description: <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ display: 'inline-block', width: 20, height: 10, backgroundColor: '#9ed08a' }}></span>农业用地&nbsp;&nbsp;
            <span style={{ display: 'inline-block', width: 20, height: 10, backgroundColor: '#f1718b' }}></span>工业用地&nbsp;&nbsp;
            <span style={{ display: 'inline-block', width: 20, height: 10, backgroundColor: '#00a550' }}></span>城市绿地
          </div>
          <img src={landUseType2021} width={'100%'} alt="" />
          <div style={{ textAlign: 'center' }}>2021年</div>
          <img src={landUseType1989} width={'100%'} alt="" />
          <div style={{ textAlign: 'center' }}>1989年</div>
          <img src={landUseType1958} width={'100%'} alt="" />
          <div style={{ textAlign: 'center' }}>1958年</div>
        </>,
        placement: 'bottomLeft',
        duration: null,
      });
    }
  };

  const initGui = () => {
    if (guiRef.current) {
      guiRef.current.destroy()
      guiRef.current = null
    }

    guiRef.current = new gui.GUI({})

    guiRef.current.title('苏州河')

    const historyControls = guiRef.current.addFolder('历史影像')

    const suzhouRiverAreaControls = guiRef.current.addFolder('区域划分')

    const waterQualityControls = guiRef.current.addFolder('水质')

    /*     const soilControls = guiRef.current.addFolder('土壤') */

    const organismControls = guiRef.current.addFolder('生物')

    const landUseTypeControls = guiRef.current.addFolder('用地类型')

    /* 历史影像 */
    historyControls.add(guiControls, 'history').name('加载恒丰路历史影像')

    /* 区域划分 */
    suzhouRiverAreaControls.add(guiControls, 'drawSuzhouRiverSubsectionPoint').name('上中游分界点').onChange((value: boolean) => {

      suzhouRiverSubsectionInstanceList.current.forEach(item => item.instance?.toggleVisible(value))

      if (value) {
        viewerRef.current?.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(121.42928466816858,
            31.23850311074299, 20000),
        })
      }
    });

    suzhouRiverAreaControls.add(guiControls, 'drawSuzhouRiverUpstreamSegment').name('上游段').onChange((value: boolean) => {
      suzhouRiverWaterPrimitivesRef.current[0].appearance.material.uniforms.baseWaterColor = value ? Cesium.Color.GREEN.withAlpha(1) : Cesium.Color.AQUA.withAlpha(0.6)
      if (value) {
        viewerRef.current?.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(121.21475984777767,
            31.262530333046115, 15000),
        })
      }
    });

    suzhouRiverAreaControls.add(guiControls, 'drawSuzhouRiverMidstreamSegment').name('中游段').onChange((value: boolean) => {
      suzhouRiverWaterPrimitivesRef.current[1].appearance.material.uniforms.baseWaterColor = value ? Cesium.Color.TOMATO.withAlpha(1) : Cesium.Color.AQUA.withAlpha(0.6)
      if (value) {
        viewerRef.current?.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(121.41021285316776,
            31.230596040912467, 15000),
        })
      }
    });

    suzhouRiverAreaControls.add(guiControls, 'drawSuzhouRiverDownstreamSegment').name('下游段').onChange((value: boolean) => {
      suzhouRiverWaterPrimitivesRef.current[2].appearance.material.uniforms.baseWaterColor = value ? Cesium.Color.GOLD.withAlpha(1) : Cesium.Color.AQUA.withAlpha(0.6)
      if (value) {
        viewerRef.current?.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(121.48179504826629,
            31.246186434358357, 10000),
        })
      }
    });

    /* 水质 */
    const drawWaterQualitycheckpointControl = waterQualityControls.add(guiControls, 'drawWaterQualitycheckpoint').name('水质检测点').onChange((value: boolean) => {
      suzhouRiverWaterQualityCheckpointInstanceList.current.forEach(item => item.instance?.toggleVisible(value))

      if (value) {
        suzhouOrganismSamplingPointInstanceList.current.forEach(item => item.instance?.toggleVisible(false))
        drawSuzhouRiverOrganismSamplingPointControl.setValue(false)
        drawSuzhouRiverOrganismSamplingPointControl.updateDisplay()

        viewerRef.current?.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(121.2969150311974,
            31.247713859928712, 50000),
        })
      }
    });

    /* 生物 */
    const drawSuzhouRiverOrganismSamplingPointControl = organismControls.add(guiControls, 'drawSuzhouRiverOrganismSamplingPoint').name('生物采样点').onChange((value: boolean) => {
      suzhouOrganismSamplingPointInstanceList.current.forEach(item => item.instance?.toggleVisible(value))

      if (value) {
        suzhouRiverWaterQualityCheckpointInstanceList.current.forEach(item => item.instance?.toggleVisible(false))
        drawWaterQualitycheckpointControl.setValue(false)
        drawWaterQualitycheckpointControl.updateDisplay()

        viewerRef.current?.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(121.2969150311974,
            31.247713859928712, 50000),
        })
      }
    });

    landUseTypeControls.add(guiControls, 'showLandUseType').name('用地类型分布')

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

        const coordinates = item.geometry.coordinates[0];

        const positions = coordinatesToPositions(coordinates);

        addWaterRegion(positions, suzhouRiverWaterPrimitivesRef.current)

      })

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

        const coordinates = item.geometry.coordinates[0];

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

      data.features.forEach((item: any) => {

        const coordinates = item.geometry.coordinates[0];

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

    initClickHandler(viewer);

    initGui()

    initSuzhouRiverSubsection()
    initSuzhouRiverWaterQualityCheckpoint()
    initSuzhouOrganismSamplingPoint()

    return () => {
      viewer.destroy()
      guiRef.current?.destroy()
    };
  }, []);


  return (
    <div className="canvas-container">
      {notificationContextHolder}
      <div className="canvas-container-body" ref={containerRef} />
      <div id="slider" style={{ display: 'none' }}></div>
    </div>
  );
}

export default SuzhouRiver