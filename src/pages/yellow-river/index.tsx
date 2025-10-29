import * as Cesium from "cesium";
import { useEffect, useRef, useState, type JSX } from "react";
import { Button, Checkbox, Form, Modal, notification } from 'antd'
import * as gui from 'lil-gui'
import SampleLabel from "@/utils/plugins/sample-label";
import ImageText from "@/utils/plugins/image-text";
import { cangzhoujueheStory, dahongshuiStory, dayuzhishuiStory, duchongzijuehuangheStory, handaidiyicijuekouStory, huangfanquReason, huayuankoujuediStory, jialuzhiheStory, jindiStory, jinfuzhiheStory, sanmenxiashuiku, shanghusaojuekouStory, taihanggudiStory, xiaolangdishuiku, xingxiuhai, yellowRiverEnding, yellowRiverOrigin, zhihesanceStory } from "./constance";
import CommonMap, { type CommonMapInstanceType } from "@/components/common-map";

const YellowRiver = () => {
  const [notificationApi, notificationContextHolder] = notification.useNotification()
  const [modal, modalContext] = Modal.useModal();

  const mapIntance = useRef<CommonMapInstanceType>(null);
  const viewerRef = useRef<Cesium.Viewer>(null);
  const guiRef = useRef<gui.GUI | null>(null);

  const administrativeRegionRef = useRef<Cesium.Entity[]>([]);
  const yellowRiverBranchRef = useRef<Cesium.Entity[]>([]);
  const yellowRiverAreaProvinceRef = useRef<Cesium.Entity[]>([]);
  const loessPlateauAreaRef = useRef<Cesium.Entity[]>([]);
  const yuhegudaoRef = useRef<Cesium.Entity[]>([]);
  const xihangudaoRef = useRef<Cesium.Entity[]>([]);
  const donghangudaoRef = useRef<Cesium.Entity[]>([]);
  const beisonggudaoRef = useRef<Cesium.Entity[]>([]);
  const mingqinggudaoRef = useRef<Cesium.Entity[]>([]);
  const nansonggudaoRef = useRef<Cesium.Entity[]>([]);
  const daluzeRef = useRef<Cesium.Entity[]>([]);
  const dayezeRef = useRef<Cesium.Entity[]>([]);
  const luoshuiRef = useRef<Cesium.Entity[]>([]);
  const jishuiRef = useRef<Cesium.Entity[]>([]);
  const huaiheRef = useRef<Cesium.Entity[]>([]);
  const huangfanqu = useRef<Cesium.Entity[]>([]);
  const qianhaianxianRef = useRef<Cesium.Entity[]>([]);
  const haianxian11Ref = useRef<Cesium.Entity[]>([]);
  const haianxian1048Ref = useRef<Cesium.Entity[]>([]);
  const haianxian1128Ref = useRef<Cesium.Entity[]>([]);
  const haianxian1855Ref = useRef<Cesium.Entity[]>([]);

  const xingxiuhaiRef = useRef<Cesium.Entity[]>([]);
  const yanshanshanmaiRef = useRef<Cesium.Entity[]>([]);
  const taihangshanmaiRef = useRef<Cesium.Entity[]>([])
  const dabieshanRef = useRef<Cesium.Entity[]>([])
  const taishanRef = useRef<Cesium.Entity[]>([])
  const shandongqiulingRef = useRef<Cesium.Entity[]>([])

  const pointInstanceList = useRef<
    {
      type: string
      data: {
        position: [number, number, number]
        text: string
        instance: SampleLabel | ImageText | null
        key: string
        [key: string]: any
      }[]
    }[]
  >([])

  const historyChangeFlyTo = [116.68159000606285, 37.064512255466, 2000000] as [number, number, number]

  const drawGeometry = (show: boolean, ref: React.RefObject<Cesium.Entity[]>, url: string, texts: { position: Cesium.Cartesian3, text: string, fontSize?: number }[], options: Cesium.GeoJsonDataSource.LoadOptions & { color?: Cesium.Color }) => {
    if (show) {

      if (ref.current?.length) {

        ref.current.forEach(item => {
          item.show = true
        })

      } else {
        fetch(url).then(res => res.json()).then(data => {
          Cesium.GeoJsonDataSource.load(data, {
            markerSymbol: "circle",
            ...options
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)
            ref.current.push(...dataSource.entities.values)
          });
        });

        texts.forEach(item => {
          ref.current.push(viewerRef.current!.entities.add({
            position: item.position,
            label: {
              text: item.text,
              font: `${item.fontSize || 16}px sans-serif`,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              outlineWidth: 2,
              outlineColor: options.color || options.fill?.withAlpha(1),
              fillColor: Cesium.Color.WHITE,
              disableDepthTestDistance: Number.POSITIVE_INFINITY, // 添加这一行，使标签始终在最前
            }
          }))
        })
      }

    } else {
      ref.current!.forEach(item => {
        item.show = false
      })
    }
  }

  const guiControls = {
    drawAdministrativeRegion: false,

    drawYellowRiverBranch: false,
    drawYellowRiverAreaProvince: false,
    drawLoessPlateauArea: false,
    drawYellowRiverAreaCity: false,
    drawYellowRiverSubsectionPoint: false,
    drawXingxiuhai: false,

    drawYuhegudao: false,
    drawXihangudao: false,
    drawDonghangudao: false,
    drawBeisonggudao: false,
    drawMingqinggudao: false,
    drawNansonggudao: false,

    drawDaluze: false,
    drawDayeze: false,
    drawDapishan: false,
    drawLuoshui: false,
    drawJishui: false,
    drawHuaihe: false,
    drawHuangfanqu: false,
    drawHuangfanquCity: false,
    drawYellowRiverOrigin: false,
    drawYellowRiverEnding: false,

    drawQianhaianxian: false,
    draw11haianxian: false,
    draw1048haianxian: false,
    draw1128haianxian: false,
    draw1855haianxian: false,

    drawSanmenxiashuiku: false,
    drawXiaolangdishuiku: false,

    drawYanshan: false,
    drawTaihangshan: false,
    drawDabieshan: false,
    drawTaishan: false,

    drawShandongqiuling: false,

    showVideo: () => {
      modal.info({
        icon: null,
        title: '视频播放',
        content: <video src={window.$$prefix + '/data/yellow-river/yellow-river.mp4'} style={{ width: '100%', height: '100%' }} controlsList="nodownload" controls autoPlay />,
        okText: '关闭',
        cancelText: '取消',
        width: 800,
        centered: true,
        onOk() {
        },
        onCancel() {
        }
      })
    },

    dayuzhishui: () => {
      const visible = pointInstanceList.current.find(item => item.type === 'story')?.data.find(item => item.key === 'dayuzhishui')?.instance?.toggleVisible(true)

      if (visible) {
        cameraFlyTo(116.04987694946415, 38.60306708197618, 1000000)
      }
    },
    jinfuzhihe: () => {

      const visible = pointInstanceList.current.find(item => item.type === 'story')?.data.find(item => item.key === 'jinfuzhihe')?.instance?.toggleVisible(true)

      if (visible) {
        cameraFlyTo(117.26616152861372, 34.57448473156657, 1000000)
      }
    },
    jindi: () => {
      const visible = pointInstanceList.current.find(item => item.type === 'story')?.data.find(item => item.key === 'jindi')?.instance?.toggleVisible(true)
      if (visible) {
        cameraFlyTo(114.88677333671359, 35.89746983824332, 1000000)
      }
    },
    handaidiyicijuekou: () => {
      const visible = pointInstanceList.current.find(item => item.type === 'story')?.data.find(item => item.key === 'handaidiyicijuekou')?.instance?.toggleVisible(true)
      if (visible) {
        cameraFlyTo(114.80936023649383, 35.49292826726047, 500000)
      }
    },
    zhihesance: () => {
      const visible = pointInstanceList.current.find(item => item.type === 'story')?.data.find(item => item.key === 'zhihesance')?.instance?.toggleVisible(true)
      if (visible) {
        cameraFlyTo(116.44621506571357, 36.62260463431871, 500000)
      }
    },

    shanghusaojuekou: () => {
      const visible = pointInstanceList.current.find(item => item.type === 'story')?.data.find(item => item.key === 'shanghusaojuekou')?.instance?.toggleVisible(true)
      if (visible) {
        cameraFlyTo(115.20188832898367, 35.915408206884734, 500000)
      }
    },

    cangzhoujuehe: () => {
      const visible = pointInstanceList.current.find(item => item.type === 'story')?.data.find(item => item.key === 'cangzhoujuehe')?.instance?.toggleVisible(true)
      if (visible) {
        cameraFlyTo(117.26095275524415, 37.84287738576768, 500000)
      }
    },
    duchongzijuehuanghe: () => {
      const visible = pointInstanceList.current.find(item => item.type === 'story')?.data.find(item => item.key === 'duchongzijuehuanghe')?.instance?.toggleVisible(true)
      if (visible) {
        cameraFlyTo(114.56643458617901,
          35.22796493474452, 500000)
      }
    },

    jialuzhihe: () => {
      const visible = pointInstanceList.current.find(item => item.type === 'story')?.data.find(item => item.key === 'jialuzhihe')?.instance?.toggleVisible(true)
      if (visible) {
        cameraFlyTo(115.54658441512163, 34.92097596134248, 500000)
      }
    },
    taihanggudi: () => {
      const visible = pointInstanceList.current.find(item => item.type === 'story')?.data.find(item => item.key === 'taihanggudi')?.instance?.toggleVisible(true)
      if (visible) {
        cameraFlyTo(114.7604178601743, 34.92833125262554, 500000)
      }
    },
    dahongshui: () => {
      const visible = pointInstanceList.current.find(item => item.type === 'story')?.data.find(item => item.key === 'dahongshui')?.instance?.toggleVisible(true)
      if (visible) {
        cameraFlyTo(114.72518924096642, 34.894459870606894, 500000)
      }
    },
    huayuankoujuedi: () => {
      const visible = pointInstanceList.current.find(item => item.type === 'story')?.data.find(item => item.key === 'huayuankoujuedi')?.instance?.toggleVisible(true)
      if (visible) {
        cameraFlyTo(113.66065082655547, 34.9151151808567, 500000)
      }
    },

  };

  const initGui = () => {
    if (guiRef.current) {
      guiRef.current.destroy()
      guiRef.current = null
    }

    guiRef.current = new gui.GUI({})

    guiRef.current.title('黄河')

    /*     const videoControls = guiRef.current.addFolder('黄河科普') */

    const regionControls = guiRef.current.addFolder('主要区域')

    const mainControls = guiRef.current.addFolder('相关区域')

    const mountainsControls = guiRef.current.addFolder('相关山脉&丘陵')

    const historyChangeContols = guiRef.current.addFolder('黄河历史')
    const comprehensiveManagementContols = guiRef.current.addFolder('综合治理')

    /* 科普视频 */
    /*     videoControls.add(guiControls, 'showVideo').name('我们的母亲河') */

    /* 主要区域 */
    regionControls.add(guiControls, 'drawAdministrativeRegion').name('行政区域').onChange((value: boolean) => {
      drawAdministrativeRegion(value)

      if (value) {
        cameraFlyTo(106.42574140217508, 37.565051396604, 7000000)
      }
    })



    /* 主要区域 */
    mainControls.add(guiControls, 'drawYellowRiverOrigin').name('黄河源').onChange((value: boolean) => {
      const visible = pointInstanceList.current.find(item => item.type === 'subsection')?.data.find(item => item.key === 'huangheyuan')?.instance?.toggleVisible(value)
      notificationApi.destroy()

      if (visible) {
        cameraFlyTo(97.04069987777802, 34.958347022701574, 332850.10)

        notificationApi.info({
          style: {
            maxHeight: '100%',
          },
          message: `黄河源`,
          description: yellowRiverOrigin,
          placement: 'bottomLeft',
          duration: null,
        })
      } else {

      }
    })

    mainControls.add(guiControls, 'drawYellowRiverEnding').name('黄河终点').onChange((value: boolean) => {
      const visible = pointInstanceList.current.find(item => item.type === 'subsection')?.data.find(item => item.key === 'huanghezhongdian')?.instance?.toggleVisible(value)
      notificationApi.destroy()

      if (visible) {
        cameraFlyTo(119.26772836452857, 37.78279740624965, 332850.10)

        notificationApi.info({
          style: {
            maxHeight: '100%',
          },
          message: `黄河终点`,
          description: yellowRiverEnding,
          placement: 'bottomLeft',
          duration: null,
        })
      }
    })

    mainControls.add(guiControls, 'drawXingxiuhai').name('星宿海').onChange((value: boolean) => {
      drawXingxiuhai(value)
      notificationApi.destroy()
      if (value) {
        cameraFlyTo(96.86575686785437,
          35.09537674678664, 232850.10)


        notificationApi.info({
          style: {
            maxHeight: '100%',
          },
          message: `星宿海`,
          description: xingxiuhai,
          placement: 'bottomLeft',
          duration: null,
        })
      }
    })

    mainControls.add(guiControls, 'drawYellowRiverBranch').name('黄河支流').onChange((value: boolean) => {
      drawYellowRiverBranch(value)

      if (value) {
        cameraFlyTo(106.42574140217508, 37.565051396604, 4000000)
      }
    })

    const yellowRiverAreaProvinceControl = mainControls.add(guiControls, 'drawYellowRiverAreaProvince').name('黄河流域').onChange((value: boolean) => {
      drawYellowRiverAreaProvince(value)
    })

    mainControls.add(guiControls, 'drawLoessPlateauArea').name('黄土高原').onChange((value: boolean) => {
      drawLoessPlateauArea(value)
    })

    mainControls.add(guiControls, 'drawYellowRiverAreaCity').name('流经城市').onChange((value: boolean) => {
      pointInstanceList.current.find(item => item.type === 'city')?.data.forEach(item => item.instance?.toggleVisible(value))
      yellowRiverAreaProvinceControl.setValue(value)
      yellowRiverAreaProvinceControl.updateDisplay()

      if (value) {
        cameraFlyTo(109.45936235563758, 36.31925612853817, 2200000)
      }
    })

    mainControls.add(guiControls, 'drawYellowRiverSubsectionPoint').name('上中下游分界点').onChange((value: boolean) => {
      pointInstanceList.current.find(item => item.type === 'subsection')?.data.filter(item => item.key === 'hekouzhen' || item.key === 'taohuayu').forEach(item => item.instance?.toggleVisible(value))

      if (value) {
        cameraFlyTo(113.07157684715946, 38.465983825955824, 2000000)
      }
    })


    mountainsControls.add(guiControls, 'drawYanshan').name('燕山山脉').onChange((value: boolean) => {
      drawYanshan(value)

      if (value) {
        cameraFlyTo(116.78817946526377, 40.6572191087334, 1178754.27)
      }
    })

    mountainsControls.add(guiControls, 'drawTaihangshan').name('太行山脉').onChange((value: boolean) => {
      drawTaihangshan(value)

      if (value) {
        cameraFlyTo(113.78817946526377, 38.6572191087334, 1178754.27)
      }
    })

    mountainsControls.add(guiControls, 'drawDabieshan').name('大别山').onChange((value: boolean) => {
      drawDabieshan(value)

      if (value) {
        cameraFlyTo(114.98085265425988, 31.022506540238034, 1178754.27)
      }
    })

    mountainsControls.add(guiControls, 'drawTaishan').name('泰山').onChange((value: boolean) => {
      drawTaishan(value)

      if (value) {
        cameraFlyTo(117.43052049639384, 36.60956250931563, 1178754.27)
      }
    })

    mountainsControls.add(guiControls, 'drawShandongqiuling').name('山东半岛丘陵').onChange((value: boolean) => {
      drawShandongqiuling(value)

      if (value) {
        cameraFlyTo(119.05410235919894, 36.26120646107691, 1178754.27)
      }
    })



    /* 历史改道 */
    const shangguHistoryChangeContols = historyChangeContols.addFolder('上古时期')
    const xihanHistoryChangeContols = historyChangeContols.addFolder('西汉时期')
    const donghanHistoryChangeContols = historyChangeContols.addFolder('东汉时期')
    const beisongHistoryChangeContols = historyChangeContols.addFolder('北宋时期')
    const nansongHistoryChangeContols = historyChangeContols.addFolder('南宋、元时期')
    const mingqingHistoryChangeContols = historyChangeContols.addFolder('明清时期')
    const minguoHistoryChangeContols = historyChangeContols.addFolder('民国现代')

    /* 上古时期 */
    shangguHistoryChangeContols.add(guiControls, 'drawYuhegudao').name('禹河故道').onChange((value: boolean) => {
      if (value) {
        cameraFlyTo(...historyChangeFlyTo)
      }
      drawYuhegudao(value)
    })

    shangguHistoryChangeContols.add(guiControls, 'drawQianhaianxian').name('前602年海岸线').onChange((value: boolean) => {
      if (value) {
        cameraFlyTo(...[117.35668606, 38.71223645, 386645.66])
      }
      drawQianhaianxian(value)
    })

    shangguHistoryChangeContols.add(guiControls, 'drawDaluze').name('大陆泽').onChange((value: boolean) => {
      if (value) {
        cameraFlyTo(...historyChangeFlyTo)
      }
      drawDaluze(value)
    })

    shangguHistoryChangeContols.add(guiControls, 'drawDapishan').name('大伾山').onChange((value: boolean) => {
      const visible = pointInstanceList.current.find(item => item.type === 'mountain')?.data.find(item => item.key === 'dapishan')?.instance?.toggleVisible(value)
      if (value) {
        cameraFlyTo(...historyChangeFlyTo)
      }
    })

    shangguHistoryChangeContols.add(guiControls, 'drawLuoshui').name('漯水').onChange((value: boolean) => {
      drawLuoshui(value)
      if (value) {
        cameraFlyTo(...historyChangeFlyTo)
      }
    })

    shangguHistoryChangeContols.add(guiControls, 'drawJishui').name('济水').onChange((value: boolean) => {
      drawJishui(value)
      if (value) {
        cameraFlyTo(...historyChangeFlyTo)
      }
    })

    shangguHistoryChangeContols.add(guiControls, 'drawHuaihe').name('淮水').onChange((value: boolean) => {
      if (value) {

        cameraFlyTo(...historyChangeFlyTo)
      }
      drawHuaihe(value)
    })

    shangguHistoryChangeContols.add(guiControls, 'dayuzhishui').name('大禹治水')

    /* 西汉时期 */
    xihanHistoryChangeContols.add(guiControls, 'drawXihangudao').name('西汉故道').onChange((value: boolean) => {
      if (value) {
        cameraFlyTo(...historyChangeFlyTo)
      }
      drawXihangudao(value)
    })

    xihanHistoryChangeContols.add(guiControls, 'draw11haianxian').name('11年海岸线').onChange((value: boolean) => {
      if (value) {
        cameraFlyTo(...[119.21084204606973, 36.79462374587151, 386645.66])
      }
      draw11haianxian(value)
    })

    xihanHistoryChangeContols.add(guiControls, 'jindi').name('秦始皇修金堤')

    xihanHistoryChangeContols.add(guiControls, 'handaidiyicijuekou').name('汉代第一次重大决口')

    /* 东汉时期 */
    donghanHistoryChangeContols.add(guiControls, 'drawDonghangudao').name('东汉故道').onChange((value: boolean) => {
      if (value) {

        cameraFlyTo(...historyChangeFlyTo)
      }
      drawDonghangudao(value)
    })
    donghanHistoryChangeContols.add(guiControls, 'zhihesance').name('贾让“治河三策”')

    /* 北宋时期 */
    beisongHistoryChangeContols.add(guiControls, 'drawBeisonggudao').name('北宋故道').onChange((value: boolean) => {
      if (value) {

        cameraFlyTo(...historyChangeFlyTo)
      }
      drawBeisonggudao(value)
    })


    beisongHistoryChangeContols.add(guiControls, 'draw1048haianxian').name('1048年海岸线').onChange((value: boolean) => {
      if (value) {
        cameraFlyTo(...[118.14110060972419,
          38.59447489359524, 486645.66])
      }
      draw1048haianxian(value)
    })

    beisongHistoryChangeContols.add(guiControls, 'shanghusaojuekou').name('商胡埽决口')
    beisongHistoryChangeContols.add(guiControls, 'cangzhoujuehe').name('瀛洲、沧州决河')

    /* 南宋时期 */
    nansongHistoryChangeContols.add(guiControls, 'drawNansonggudao').name('南宋、元故道').onChange((value: boolean) => {
      if (value) {

        cameraFlyTo(...historyChangeFlyTo)
      }
      drawNansonggudao(value)
    })

    nansongHistoryChangeContols.add(guiControls, 'draw1128haianxian').name('1128年海岸线').onChange((value: boolean) => {
      if (value) {
        cameraFlyTo(...[118.07657317356775,
          38.06196564614787, 386645.66])
      }
      draw1128haianxian(value)
    })

    nansongHistoryChangeContols.add(guiControls, 'drawDayeze').name('大野泽').onChange((value: boolean) => {
      if (value) {

        cameraFlyTo(...historyChangeFlyTo)
      }
      drawDayeze(value)
    })
    nansongHistoryChangeContols.add(guiControls, 'duchongzijuehuanghe').name('杜充自决黄河')
    nansongHistoryChangeContols.add(guiControls, 'jialuzhihe').name('贾鲁治河')

    /* 明清时期 */
    mingqingHistoryChangeContols.add(guiControls, 'drawMingqinggudao').name('明清故道').onChange((value: boolean) => {

      if (value) {
        cameraFlyTo(...historyChangeFlyTo)
      }

      drawMingqinggudao(value)
    })
    mingqingHistoryChangeContols.add(guiControls, 'draw1855haianxian').name('1855年海岸线').onChange((value: boolean) => {
      if (value) {
        cameraFlyTo(...[119.05540293025302,
          37.44453910849387, 386645.66])
      }
      draw1855haianxian(value)
    })

    mingqingHistoryChangeContols.add(guiControls, 'taihanggudi').name('刘大夏太行古堤')
    mingqingHistoryChangeContols.add(guiControls, 'jinfuzhihe').name('靳辅治河')

    /* 民国现代 */
    minguoHistoryChangeContols.add(guiControls, 'dahongshui').name('1933大洪水')
    minguoHistoryChangeContols.add(guiControls, 'huayuankoujuedi').name('花园口决堤')

    minguoHistoryChangeContols.add(guiControls, 'drawHuangfanqu').name('黄泛区').onChange((value: boolean) => {
      notificationApi.destroy()

      if (value) {
        cameraFlyTo(...[116.73033509260588, 32.792614986138204, historyChangeFlyTo[2]])
        notificationApi.info({
          style: {
            maxHeight: '100%',
          },
          message: `黄泛区蔓延的地理因素`,
          description: huangfanquReason,
          placement: 'bottomLeft',
          duration: null,
        })
      }

      drawHuangfanqu(value)
    })
    minguoHistoryChangeContols.add(guiControls, 'drawHuangfanquCity').name('黄泛区主要城市').onChange((value: boolean) => {
      const visible = pointInstanceList.current.find(item => item.type === 'huangfanqu-city')?.data.forEach(item => item?.instance?.toggleVisible(value))

      if (value) {
        cameraFlyTo(...[116.47675963287809, 33.87155722863262, historyChangeFlyTo[2] / 2.8])
      }
    })

    /* 综合治理 */
    comprehensiveManagementContols.add(guiControls, 'drawXiaolangdishuiku').name('小浪底水库').onChange((value: boolean) => {
      const visible = pointInstanceList.current.find(item => item.type === 'reservoir')?.data.find(item => item.key === 'xiaolangdishuiku')?.instance?.toggleVisible(value)
      notificationApi.destroy()

      if (value) {

        viewerRef.current!.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(112.53075748, 34.88594434, 1548.71),
          orientation: {
            heading: 5.073720142042852,
            pitch: -1.2591800141292224,
            roll: 0.00010255291219962714
          }
        });

        notificationApi.info({
          style: {
            maxHeight: '100%',
          },
          message: `小浪底水库`,
          description: xiaolangdishuiku,
          placement: 'bottomLeft',
          duration: null,
        })
      }
    })

    comprehensiveManagementContols.add(guiControls, 'drawSanmenxiashuiku').name('三门峡水库').onChange((value: boolean) => {
      const visible = pointInstanceList.current.find(item => item.type === 'reservoir')?.data.find(item => item.key === 'sanmenxiashuiku')?.instance?.toggleVisible(value)
      notificationApi.destroy()

      if (value) {

        viewerRef.current!.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(111.11700500, 34.77034728, 3817.55),
          orientation: {
            heading: 1.2687880432952277,
            pitch: -1.4791303213012164,
            roll: 0.0014787389090145098
          }
        });

        notificationApi.info({
          style: {
            maxHeight: '100%',
          },
          message: `三门峡水库`,
          description: sanmenxiashuiku,
          placement: 'bottomLeft',
          duration: null,
        })
      }
    })
  }

  const cameraFlyTo = (longitude: number, latitude: number, height: number = 4000000) => {
    viewerRef.current!.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
    })
  }

  const drawAdministrativeRegion = (checked: boolean) => {
    drawGeometry(checked, administrativeRegionRef, window.$$prefix + "/data/china/china.geojson", [], {
      stroke: Cesium.Color.BROWN.withAlpha(0.8),
      fill: Cesium.Color.WHITE.withAlpha(0.5),
      strokeWidth: 0.8,
    })

  };

  const drawYellowRiverBranch = (checked: boolean) => {
    drawGeometry(checked, yellowRiverBranchRef, window.$$prefix + "/data/yellow-river/yellow-river-branch.geojson", [], {
      stroke: Cesium.Color.YELLOW,
      fill: Cesium.Color.YELLOW.withAlpha(0.1),
      strokeWidth: 0.5,
    })
  }

  const drawYellowRiverAreaProvince = (checked: boolean) => {
    drawGeometry(checked, yellowRiverAreaProvinceRef, window.$$prefix + "/data/yellow-river/yellow-river-area-province.geojson", [], {
      stroke: Cesium.Color.PINK,
      fill: Cesium.Color.PINK.withAlpha(0.5),
      strokeWidth: 0.5,
    })
  }

  const drawLoessPlateauArea = (checked: boolean) => {
    drawGeometry(checked, loessPlateauAreaRef, window.$$prefix + "/data/yellow-river/loess-plateau-area.geojson", [], {
      stroke: Cesium.Color.ORANGE,
      fill: Cesium.Color.ORANGE.withAlpha(0.4),
      strokeWidth: 0.5,
    })
  }

  const drawYuhegudao = (checked: boolean) => {
    const color = Cesium.Color.VIOLET

    drawGeometry(checked, yuhegudaoRef, window.$$prefix + "/data/yellow-river/yuhegudao.geojson", [
      {
        position: Cesium.Cartesian3.fromDegrees(117.34429640994914, 39.59296969230597),
        text: "禹河古道\n前2278-前602",
      }
    ], {
      stroke: color,
      fill: color.withAlpha(0.2),
      strokeWidth: 4,
    })
  }

  const drawDaluze = (checked: boolean) => {
    const color = Cesium.Color.CYAN

    drawGeometry(checked, daluzeRef, window.$$prefix + "/data/yellow-river/daluze.geojson", [
      {
        position: Cesium.Cartesian3.fromDegrees(114.29593465100123,
          37.45570063279759),
        text: "大陆泽",
      }
    ], {
      stroke: color,
      fill: color.withAlpha(0.2),
      strokeWidth: 4,

    })
  }

  const drawLuoshui = (checked: boolean) => {
    const color = Cesium.Color.PURPLE

    drawGeometry(checked, luoshuiRef, window.$$prefix + "/data/yellow-river/luoshui.geojson", [
      {
        position: Cesium.Cartesian3.fromDegrees(116.10791182717689,
          36.734390277000436),
        text: "漯水",
      }
    ], {
      stroke: color,
      fill: color.withAlpha(0.2),
      strokeWidth: 4,

    })
  }

  const drawJishui = (checked: boolean) => {
    const color = Cesium.Color.SKYBLUE

    drawGeometry(checked, jishuiRef, window.$$prefix + "/data/yellow-river/jishui.geojson", [
      {
        position: Cesium.Cartesian3.fromDegrees(118.21759204487076,
          37.78853128065295),
        text: "济水",
      }
    ], {
      stroke: color,
      fill: color.withAlpha(0.2),
      strokeWidth: 4,

    })
  }

  const drawDonghangudao = (checked: boolean) => {
    const color = Cesium.Color.ORANGE

    drawGeometry(checked, donghangudaoRef, window.$$prefix + "/data/yellow-river/donghangudao.geojson", [
      {
        position: Cesium.Cartesian3.fromDegrees(116.76065926984457, 37.96615236929079),
        text: "东汉故道\n11-1048",
      }
    ], {
      stroke: color,
      fill: color.withAlpha(0.2),
      strokeWidth: 4,

    })
  }

  const drawXihangudao = (checked: boolean) => {

    const color = Cesium.Color.BROWN

    drawGeometry(checked, xihangudaoRef, window.$$prefix + "/data/yellow-river/xihangudao.geojson", [
      {
        position: Cesium.Cartesian3.fromDegrees(117.16475899411333, 38.87213207639694),
        text: "西汉故道\n前602-11",
      }
    ], {
      stroke: color,
      fill: color.withAlpha(0.2),
      strokeWidth: 4,

    })
  }

  const drawBeisonggudao = (checked: boolean) => {

    const color = Cesium.Color.THISTLE

    drawGeometry(checked, beisonggudaoRef, window.$$prefix + "/data/yellow-river/beisonggudao.geojson", [
      {
        position: Cesium.Cartesian3.fromDegrees(115.82154578431262, 38.015631919408),
        text: '北宋故道（北流）\n1048-1128',
      },
      {
        position: Cesium.Cartesian3.fromDegrees(117.41979162899403, 38.153555435893274),
        text: '北宋故道（东流）\n1048-1128',
      },
    ], {
      stroke: color,
      fill: color.withAlpha(0.2),
      strokeWidth: 4,

    })
  }
  const drawMingqinggudao = (checked: boolean) => {
    const color = Cesium.Color.DARKBLUE

    drawGeometry(checked, mingqinggudaoRef, window.$$prefix + "/data/yellow-river/mingqinggudao.geojson", [
      {
        position: Cesium.Cartesian3.fromDegrees(116.89789938054952, 34.002151532164426),
        text: "明清故道\n1368-1855",
      },
    ], {
      stroke: color,
      fill: color.withAlpha(0.2),
      strokeWidth: 4,

    })
  }
  const drawNansonggudao = (checked: boolean) => {
    const color = Cesium.Color.FUCHSIA
    drawGeometry(checked, nansonggudaoRef, window.$$prefix + "/data/yellow-river/nansonggudao.geojson", [
      {
        position: Cesium.Cartesian3.fromDegrees(115.83909059918128, 34.9316807722699),
        text: '南宋、元故道\n1128-1368'
      },
      {
        position: Cesium.Cartesian3.fromDegrees(117.25871558918108, 35.12197753878519),
        text: '南宋北岔流'
      },
      {
        position: Cesium.Cartesian3.fromDegrees(114.97118922424879, 34.2832804070269),
        text: '南宋南岔流'
      },
    ], {
      stroke: color,
      fill: color.withAlpha(0.2),
      strokeWidth: 4,

    })
  }
  const drawDayeze = (checked: boolean) => {
    const color = Cesium.Color.CYAN

    drawGeometry(checked, dayezeRef, window.$$prefix + "/data/yellow-river/dayeze.geojson", [
      {
        position: Cesium.Cartesian3.fromDegrees(116.46380530896955,
          35.70172754553374),
        text: "大野泽",
      }
    ], {
      stroke: color,
      fill: color.withAlpha(0.2),
      strokeWidth: 4,

    })
  }
  const drawHuaihe = (checked: boolean) => {
    const color = Cesium.Color.TEAL

    drawGeometry(checked, huaiheRef, window.$$prefix + "/data/yellow-river/huaihe.geojson", [
      {
        position: Cesium.Cartesian3.fromDegrees(118.88638657830545,
          33.76783089303769),
        text: "淮河",
      }
    ], {
      stroke: color,
      fill: color.withAlpha(0.2),
      strokeWidth: 4,

    })
  }

  const drawHuangfanqu = (checked: boolean) => {
    const color = Cesium.Color.ORANGE

    drawGeometry(checked, huangfanqu, window.$$prefix + "/data/yellow-river/huangfanqu.geojson", [
      {
        position: Cesium.Cartesian3.fromDegrees(117.18229966881717,
          33.598661423934004),
        text: "黄泛区",
      }
    ], {
      stroke: Cesium.Color.TRANSPARENT,
      fill: color.withAlpha(0.8),
      strokeWidth: 4,
    })
  }

  const drawQianhaianxian = (checked: boolean) => {
    const color = Cesium.Color.fromCssColorString('#006eff')

    drawGeometry(checked, qianhaianxianRef, window.$$prefix + "/data/yellow-river/qian-602-haianxian.geojson", [
      {
        position: Cesium.Cartesian3.fromDegrees(116.86843775419166,
          39.42381075024779),
        text: "前602年海岸线",
      }
    ], {
      stroke: color.withAlpha(0.8),
      fill: color.withAlpha(0.8),
      strokeWidth: 2,

    })
  }

  const draw11haianxian = (checked: boolean) => {
    const color = Cesium.Color.fromCssColorString('#00ffffff')

    drawGeometry(checked, haianxian11Ref, window.$$prefix + "/data/yellow-river/11-haianxian.geojson", [
      {
        position: Cesium.Cartesian3.fromDegrees(119.21084204606973,
          36.79462374587151),
        text: "11年海岸线",
      }
    ], {
      stroke: color.withAlpha(0.8),
      fill: color.withAlpha(0.8),
      strokeWidth: 2,

    })
  }

  const draw1048haianxian = (checked: boolean) => {
    const color = Cesium.Color.fromCssColorString('#00ff88ff')

    drawGeometry(checked, haianxian1048Ref, window.$$prefix + "/data/yellow-river/1048-haianxian.geojson", [
      {
        position: Cesium.Cartesian3.fromDegrees(118.0322329489798,
          39.71886717899871),
        text: "1048年海岸线",
      }
    ], {
      stroke: color.withAlpha(0.8),
      fill: color.withAlpha(0.8),
      strokeWidth: 2,

    })
  }

  const draw1128haianxian = (checked: boolean) => {
    const color = Cesium.Color.fromCssColorString('#77f700ff')

    drawGeometry(checked, haianxian1128Ref, window.$$prefix + "/data/yellow-river/1128-haianxian.geojson", [
      {
        position: Cesium.Cartesian3.fromDegrees(118.07657317356775,
          38.06196564614787),
        text: "1128年海岸线",
      }
    ], {
      stroke: color.withAlpha(0.8),
      fill: color.withAlpha(0.8),
      strokeWidth: 2,

    })
  }

  const draw1855haianxian = (checked: boolean) => {
    const color = Cesium.Color.fromCssColorString('#4a00f7ff')

    drawGeometry(checked, haianxian1855Ref, window.$$prefix + "/data/yellow-river/1855-haianxian.geojson", [
      {
        position: Cesium.Cartesian3.fromDegrees(119.05540293025302,
          37.44453910849387),
        text: "1855年海岸线",
      }
    ], {
      stroke: color.withAlpha(0.8),
      fill: color.withAlpha(0.8),
      strokeWidth: 2,

    })
  }

  const drawXingxiuhai = (checked: boolean) => {

    const color = Cesium.Color.CYAN

    drawGeometry(checked, xingxiuhaiRef, window.$$prefix + "/data/yellow-river/xingxiuhai.geojson", [
      {
        position: Cesium.Cartesian3.fromDegrees(96.86575686785437,
          35.09537674678664),
        text: "星宿海",
      }
    ], {
      stroke: color,
      fill: color.withAlpha(0.2),
      strokeWidth: 4,
    })
  }

  const drawYanshan = (checked: boolean) => {

    const color = Cesium.Color.fromCssColorString('#43e479ff')

    drawGeometry(checked, yanshanshanmaiRef, window.$$prefix + "/data/yellow-river/yanshan.geojson", [
      {
        position: Cesium.Cartesian3.fromDegrees(116.39553953124192,
          40.90127913930519),
        text: "燕山",
      }
    ], {
      stroke: color,
      fill: color.withAlpha(0.8),
      strokeWidth: 2,
    })
  }

  const drawTaihangshan = (checked: boolean) => {

    const color = Cesium.Color.fromCssColorString('#43e479ff')

    drawGeometry(checked, taihangshanmaiRef, window.$$prefix + "/data/yellow-river/taihangshan.geojson", [
      {
        position: Cesium.Cartesian3.fromDegrees(112.96971001677872,
          39.61792177702133),
        text: "太行山脉",
      }
    ], {
      stroke: color,
      fill: color.withAlpha(0.8),
      strokeWidth: 2,
    })
  }

  const drawDabieshan = (checked: boolean) => {

    const color = Cesium.Color.fromCssColorString('#43e479ff')

    drawGeometry(checked, dabieshanRef, window.$$prefix + "/data/yellow-river/dabieshan.geojson", [
      {
        position: Cesium.Cartesian3.fromDegrees(114.41424974288323,
          31.141458547179752),
        text: "大别山",
      }
    ], {
      stroke: color,
      fill: color.withAlpha(0.8),
      strokeWidth: 2,
    })
  }

  const drawTaishan = (checked: boolean) => {

    const color = Cesium.Color.fromCssColorString('#43e479ff')

    drawGeometry(checked, taishanRef, window.$$prefix + "/data/yellow-river/taishan.geojson", [
      {
        position: Cesium.Cartesian3.fromDegrees(117.48050375009417,
          36.71990242407065),
        text: "泰山",
      }
    ], {
      stroke: color,
      fill: color.withAlpha(0.8),
      strokeWidth: 2,
    })
  }

  const drawShandongqiuling = (checked: boolean) => {

    const color = Cesium.Color.fromCssColorString('#43e479ff')

    drawGeometry(checked, shandongqiulingRef, window.$$prefix + "/data/yellow-river/shandongqiuling.geojson", [
      {
        position: Cesium.Cartesian3.fromDegrees(118.76230518148944,
          36.122097885429966),
        text: "山东丘陵",
        fontSize: 18,
      }
    ], {
      stroke: color,
      fill: color.withAlpha(0.4),
      strokeWidth: 2,
    })
  }

  useEffect(() => {
    viewerRef.current = mapIntance.current?.getViewer()!

    drawGeometry(true, { current: [] }, window.$$prefix + "/data/china/china-boundary.geojson", [], {
      stroke: Cesium.Color.BROWN,
      fill: Cesium.Color.BROWN.withAlpha(0.2),
      strokeWidth: 4,
    })

    drawGeometry(true, { current: [] }, window.$$prefix + "/data/yellow-river/yellow-river.geojson", [], {
      stroke: Cesium.Color.YELLOW,
      fill: Cesium.Color.YELLOW.withAlpha(0.2),
      strokeWidth: 4,
    })

    initGui()

    fetch(window.$$prefix + '/data/yellow-river/points.json')
      .then(res => res.json())
      .then(data => {
        const list = data as {
          data: typeof pointInstanceList.current
        }
        pointInstanceList.current = list.data.map(item => {
          return {
            ...item,
            data: item.data.map(v => {
              const instance =
                v.type === 'SampleLabel'
                  ? new SampleLabel(viewerRef.current!, Cesium.Cartesian3.fromDegrees(...v.position), v.text, {
                    containerBackgroundUrlType: v.containerBackgroundUrlType,
                    defaultVisible: v.defaultVisible,
                    indicationLineColor: v.indicationLineColor,
                    clickCallback() {
                      if (item.type === 'story') {
                        const modalOptions = {
                          icon: null,
                          title: v.text,
                          okText: '关闭',
                          cancelText: '关闭',
                          width: 800,
                          centered: true,
                          closable: true,
                        }

                        const modalStory: Record<string, React.ReactNode> = {
                          dayuzhishui: dayuzhishuiStory,

                          jindi: jindiStory,
                          handaidiyicijuekou: handaidiyicijuekouStory,
                          zhihesance: zhihesanceStory,
                          shanghusaojuekou: shanghusaojuekouStory,
                          cangzhoujuehe: cangzhoujueheStory,
                          duchongzijuehuanghe: duchongzijuehuangheStory,
                          jialuzhihe: jialuzhiheStory,
                          taihanggudi: taihanggudiStory,
                          jinfuzhihe: jinfuzhiheStory,
                          dahongshui: dahongshuiStory,
                          huayuankoujuedi: huayuankoujuediStory
                        }

                        modal.info({
                          ...modalOptions,
                          content: modalStory[v.key] || null,
                        })
                      }
                    },
                  })
                  : v.type === 'ImageText'
                    ? new ImageText(viewerRef.current!, Cesium.Cartesian3.fromDegrees(...v.position), v.image, v.content, {
                      defaultVisible: v.defaultVisible,
                    })
                    : null

              return {
                ...v,
                instance,
              }
            }),
          }
        })
      })



    const texts = [
      {
        text: '华',
        position: [111.3262674547979, 38.53333697645296]
      },
      {
        text: '北',
        position: [113.41137405293155, 38.53333697645296]
      },
      {
        text: '平',
        position: [115.4602985897172, 38.41332308710166]
      },
      {
        text: '原',
        position: [117.23490100647336, 38.50714501772409]
      },
      {
        text: '江',
        position: [113.08432723857378, 32.03840482886292]
      },
      {
        text: '淮',
        position: [115.3880323330428, 32.03840482886292]
      },
      {
        text: '平',
        position: [117.77939040052772, 32.03840482886292]
      },
      {
        text: '原',
        position: [120.02831898723194, 32.03840482886292]
      }
    ]

    texts.forEach(item => {
      viewerRef.current?.entities.add({
        position: Cesium.Cartesian3.fromDegrees(...item.position as [number, number]),
        label: {
          text: item.text,
          font: `28px sans-serif`,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          outlineWidth: 2,
          outlineColor: Cesium.Color.RED,
          fillColor: Cesium.Color.WHITE,
          disableDepthTestDistance: Number.POSITIVE_INFINITY, // 添加这一行，使标签始终在最前
        }
      })
    })

    return () => {
      guiRef.current?.destroy()
    }
  }, []);

  return (
    <>
      {notificationContextHolder}
      {modalContext}
      <CommonMap ref={mapIntance} terrainInitCallback={() => {
        cameraFlyTo(106.42574140217508, 37.565051396604, 4000000)
      }}></CommonMap>
    </>

  );
};

export default YellowRiver;
