import * as Cesium from "cesium";
import { useEffect, useRef, useState } from "react";
import { Button, Checkbox, Form, Modal } from 'antd'
import DrawerCountour from "@/utils/countour";
import * as gui from 'lil-gui'
import SampleLabel from "@/utils/plugins/sample-label";

const YellowRiver = () => {

  const [modal, modalContext] = Modal.useModal();

  const containerRef = useRef<HTMLDivElement>(null);

  const viewerRef = useRef<Cesium.Viewer | null>(null);

  const guiRef = useRef<gui.GUI | null>(null);

  const administrativeRegionRef = useRef<Cesium.Entity[]>([]);

  const yellowRiverBranchRef = useRef<Cesium.Entity[]>([]);

  const yellowRiverAreaProvinceRef = useRef<Cesium.Entity[]>([]);

  const loessPlateauAreaRef = useRef<Cesium.Entity[]>([]);

  const yuhegudaoRef = useRef<Cesium.Entity[]>([]);
  const yuhegudaoNameRef = useRef<Cesium.Entity[]>([]);

  const donghangudaoRef = useRef<Cesium.Entity[]>([]);
  const donghangudaoNameRef = useRef<Cesium.Entity[]>([]);

  const xihangudaoRef = useRef<Cesium.Entity[]>([]);
  const xihangudaoNameRef = useRef<Cesium.Entity[]>([]);

  const beisonggudaoRef = useRef<Cesium.Entity[]>([]);
  const beisonggudaoNameRef = useRef<Cesium.Entity[]>([]);

  const mingqinggudaoRef = useRef<Cesium.Entity[]>([]);
  const mingqinggudaoNameRef = useRef<Cesium.Entity[]>([]);

  const nansonggudaoRef = useRef<Cesium.Entity[]>([]);
  const nansonggudaoNameRef = useRef<Cesium.Entity[]>([]);


  const dayuzhishuiControlRef = useRef<gui.Controller>(null);
  const jinfuzhiheControlRef = useRef<gui.Controller>(null);

  const cultureInstanceList = useRef<{
    position: Cesium.Cartesian3
    text: string,
    instance: SampleLabel
    key: string
  }[]>([]);

  const yellowRiverAreaCityInstanceList = useRef<{
    position: Cesium.Cartesian3
    text: string,
    instance: SampleLabel
    key: string
  }[]>([]);

  const yellowRiverSubsectionInstanceList = useRef<{
    position: Cesium.Cartesian3
    text: string,
    instance: SampleLabel
    key: string
  }[]>([]);

  const historyChangeFlyTo = [115.90403078006872, 36.31340804490251, 2000000] as [number, number, number]

  const dayuzhishuiPosition = [116.22661380997462, 38.46902808366483] as [number, number]

  const jinfuzhihePosition = [117.34955300977958, 34.30129280137265] as [number, number]

  const initCultureIntanceList = () => {

    cultureInstanceList.current = [
      {
        position: Cesium.Cartesian3.fromDegrees(...dayuzhishuiPosition, 20),
        text: '大禹治水',
        instance: null,
        key: 'dayuzhishui'
      },
      {
        position: Cesium.Cartesian3.fromDegrees(...jinfuzhihePosition, 20),
        text: '靳辅治河',
        instance: null,
        key: 'jinfuzhihe'
      }
    ].map(item => {
      const instance = new SampleLabel(viewerRef.current!, item.position, item.text, {
        containerBackgroundUrlType: 'story',
        defaultVisible: false,
        clickCallback: () => {

          const modalOptions = {
            icon: null,
            title: item.text,
            okText: '关闭',
            cancelText: '关闭',
            width: 800,
            centered: true,
          }


          if (item.key === 'dayuzhishui') {
            modal.info({
              ...modalOptions,
              content: <div style={{ textIndent: '2em', maxHeight: '600px', overflow: 'auto', lineHeight: '32px' }}>
                <p>
                  大约在4000多年前，中国的黄河流域洪水为患，尧命鲧负责领导与组织治水工作。鲧采取“水来土挡”的策略治水。鲧治水失败后由其独子禹主持治水大任。</p>
                <p>
                  舜帝说：“禹，你也谈谈高见吧。”禹拜谢说：“是啊，君王，我说些什么呢？我整天考虑的是孜孜不倦地工作。” 皋陶说：“哦，到底是些什么工作？” 禹说：“大水与天相接，浩浩荡荡包围 了大山，淹没了山丘，民众被大水吞没。我乘坐着四种交通工具， 顺着山路砍削树木作路标，和伯益一起把刚猎获的鸟兽送给民众。
                  我疏通了九州的河流，使大水流进四海，还疏通了田间小沟，使 田里的水都流进大河。我和后稷一起播种粮食，为民众提供谷物 和肉食。
                  还发展贸易，互通有无，使民众安定下来，各个诸侯国 开始得到治理。” 皋陶说：“是啊。你这番话说得真好。”</p>
                <p>
                  以后禹首先就带着尺、绳等测量工具到中国的主要山脉、河流作了一番严密的考察。大禹在河北东部、河南东部、山东西部、南部，以及淮河北部考察。
                  一次，他们来到了河南洛阳南郊。这里有座高山，属秦岭山脉的余脉，一直延续到中岳嵩山，峰峦奇特，犹如一座东西走向的天然屏障。
                  高山中段有一个天然的缺口，涓涓的细流就由隙缝轻轻流过</p>
                <p>
                  他还发现龙门山口过于狭窄，难以通过汛期洪水；还发现黄河淤积，流水不畅。于是禹大刀阔斧，改“堵”为“疏”。就是疏通河道，拓宽峡口，让洪水能更快地通过。
                  禹采用了“治水须顺水性，水性就下，导之入海“。高处就凿通，低处就疏导”的治水思想。根据轻重缓急，定了一个治的顺序，先从首都附近地区开始，再扩展到其它各地。
                </p>
                <p>
                  大禹决定集中治水的人力，在群山中开道。艰苦的劳动，损坏了一件件石器、木器、骨器工具。人的损失就更大，有的被山石砍伤了，有的上山时摔死了，有的被洪水卷走了。
                  可是，他们仍然毫不动摇，坚持劈山不止。在这艰辛的日日夜夜里，大禹的脸晒黑了，人累瘦了，甚至连小腿肚子上的汗毛都被磨光了，脚指甲也因长期泡在水里而脱落，但他还在操作着、指挥着。
                  在他的带动下，治水进展神速，大山终于豁然屏开，形成两壁对峙之势，洪水由此一泻千里，向下游流去，江河从此畅通</p>
                <p>
                  大禹治水在中华文明发展史上起重要作用。在治水过程中，大禹依靠艰苦奋斗、因势利导、科学治水、以人为本的理念，克服重重困难，终于取得了治水的成功。
                  由此形成以公而忘私、民族至上、民为邦本、科学创新等为内涵的大禹治水精神。大禹治水精神是中华民族精神的源头和象征。</p>
              </div>,
            })
          }

          if (item.key === 'jinfuzhihe') {
            modal.info({
              ...modalOptions,
              content: <div style={{ textIndent: '2em', maxHeight: '600px', overflow: 'auto', lineHeight: '32PX' }}>
                <div>
                  <h3><span>靳辅治河：清初的黄河保卫战</span></h3>
                  <p><span>靳辅（1633—1692），字紫垣，辽阳人，汉军镶黄旗。他是清代最著名的治水专家，其治黄功绩彪炳史册，与他的幕僚、后世被誉为“水神”的</span>
                    <strong><span>陈潢</span></strong><span>紧密相连。他们的故事始于康熙十六年（1677年）。</span>
                  </p>
                  <h4><strong><span>一、 临危受命：接手一个“烂摊子”</span></strong></h4>
                  <p><span>康熙十五年（1676年），黄河流域发生了大规模水患，情况极其严峻：</span></p>
                  <ul>
                    <li>
                      <p><strong><span>淮扬七州县沦为泽国</span></strong><span>：黄河、淮河同时暴涨，洪水冲决江苏高家堰大堤三十四处，淮扬地区的七个州县（今扬州、淮安一带）被彻底淹没。</span></p>
                    </li>
                    <li>
                      <p>
                        <strong><span>运河漕运命脉中断</span></strong><span>：贯穿南北的大运河，其江北段被黄河泥沙淤塞，漕运完全瘫痪。这对于刚刚平定三藩之乱、亟需稳定经济的清王朝来说，是致命的打击。</span>
                      </p>
                    </li>
                    <li>
                      <p><strong><span>“河弊”深重</span></strong><span>：治河机构（河道总督衙门）腐败不堪，治河经费被层层克扣，工程质量低劣，往往“岁修岁决”。</span></p>
                    </li>
                  </ul>
                  <p><span>面对如此危局，时年四十五岁的安徽巡抚靳辅，因其干练的才能被康熙帝看中，被破格提拔为</span><strong><span>河道总督</span></strong>
                    <span>。这是一个风险极高的职位，前任多位总督都因治河不力而被革职问罪。</span>
                  </p>
                  <h4><strong><span>二、 实地勘察与系统规划：陈潢的奇谋</span></strong></h4>
                  <p><span>靳辅深知治河非同小可，他做的第一件事不是坐在衙门里发号施令，而是</span><strong><span>亲自进行实地勘察</span></strong><span>。他带着精通水文的幕僚</span>
                    <strong><span>陈潢</span></strong><span>，历时两个多月，“跋涉险阻，上下数百里，一一审度”。</span>
                  </p>
                  <p><span>陈潢在此过程中发挥了至关重要的作用。他打破了传统的治水观念，运用了惊人的科学方法：</span></p>
                  <ul>
                    <li>
                      <p><strong><span>“彻水之法”</span></strong><span>：发明了测量流速和流量的方法，科学地掌握了黄河的水文数据。</span></p>
                    </li>
                    <li>
                      <p><strong><span>“分流与束水攻沙”相结合</span></strong>
                        <span>：他继承了明代潘季驯“束水攻沙”的核心思想（即收紧河道，提高流速，让水流自身的力量冲刷泥沙），但并不拘泥于此。他创造性地提出，在河水暴涨时，需要</span><strong><span>分流</span></strong><span>以减杀水势；而在平时，则要</span><strong><span>束水</span></strong><span>以攻沙。这是一个辩证的、系统性的治理思路。</span>
                      </p>
                    </li>
                  </ul>
                  <p>
                    <span>基于详实的勘察和陈潢的科学理论，靳辅向康熙帝上奏《经理河工八疏》，提出了一个</span><strong><span>空前宏大且耗资巨大的全面治理方案</span></strong><span>，包括疏浚河道、加固堤防、修建减水坝、堵塞决口等一系列工程。康熙帝虽然对巨额预算感到震惊，但最终被其详尽的规划所说服，全力支持。</span>
                  </p>
                  <h4><strong><span>三、 十年艰辛：八大工程与卓著成效</span></strong></h4>
                  <p><span>从康熙十七年（1678年）开始，靳辅和陈潢开始了长达十年的艰难治河历程。其主要工程可概括为以下几个方面：</span></p>
                  <ol>
                    <li>
                      <p>
                        <strong><span>疏浚清口</span></strong><span>：“清口”是黄、淮、运三条河流的交汇处，是治河的关键。靳辅组织人力大规模疏浚了被泥沙淤塞的清口，使淮水能顺利流入黄河，借助淮河的清水来冲刷黄河的浊沙（“以清刷浊”）。</span>
                      </p>
                    </li>
                    <li>
                      <p>
                        <strong><span>加固高家堰</span></strong><span>：高家堰是洪泽湖东岸的堤坝，是保护里下河地区免受淮河洪水侵袭的屏障。靳辅将原有单薄的土堤大规模加固、延长、增高，将其建成一道坚固的石工墙，有效抬高了洪泽湖的水位，迫使淮水全力冲向清口，冲刷黄河泥沙。</span>
                      </p>
                    </li>
                    <li>
                      <p>
                        <strong><span>修筑“减水坝”</span></strong><span>：这是陈潢的一大创举。在河道狭窄或险要地段的主堤之外，另修一道</span><strong><span>遥堤</span></strong><span>。在两堤之间，选择适当位置修建</span><strong><span>减水坝</span></strong><span>（类似现代的水闸或溢洪道）。当黄河水位暴涨，威胁主堤安全时，洪水可从减水坝溢出，流入遥堤之外的蓄滞洪区，从而保障主堤和运河的安全。待洪水消退，漫出的水又可回归主河道。这完美体现了“分流”与“束水”的结合。</span>
                      </p>
                    </li>
                    <li>
                      <p>
                        <strong><span>疏通运河</span></strong><span>：开挖了一条名为</span><strong><span>中河</span></strong><span>（又称中运河）的人工河道。使得漕运船只从江苏宿迁到清河县（今淮阴）的一段，可以完全避开一百八十里黄河风涛之险，直接在河水平稳的中河内航行，大大提高了漕运的安全和效率。这是中国运河史上的一大里程碑。</span>
                      </p>
                    </li>
                    <li>
                      <p><strong><span>堵塞决口</span></strong><span>：成功堵塞了包括杨家庄在内的数十处大小决口，让黄河回归主河道。</span></p>
                    </li>
                  </ol>
                  <p><span>经过近十年的努力，黄河“水归故道，漕运无阻”，大片被淹没的土地重新变为良田，取得了前所未有的成效。康熙帝南巡时，亲眼看到治河成果，大加赞赏，亲自书写《阅河堤诗》赐给靳辅。</span></p>
                  <h4><strong><span>四、 政争与悲剧：忠臣蒙冤</span></strong></h4>
                  <p><span>然而，巨大的成功也带来了巨大的争议和嫉妒。靳辅的治河策略触及了多方利益：</span></p>
                  <ul>
                    <li>
                      <p>
                        <strong><span>“下河”争议</span></strong><span>：在如何治理黄河入海口附近的低洼地区（下河地区）问题上，靳辅主张“筑堤束水入海”，而另一位大臣于成龙（并非后来那位著名的清官于成龙）则主张“疏通海口”。两人在朝廷上激烈辩论。靳辅的方案更科学，但需要占用大量农田修筑堤坝，遭到地方豪强的强烈反对。</span>
                      </p>
                    </li>
                    <li>
                      <p><strong><span>触及利益集团</span></strong><span>：靳辅的严厉作风和巨大权力，触动了从地方到中央的许多腐败官僚的利益，他们联合起来攻击靳辅。</span></p>
                    </li>
                    <li>
                      <p>
                        <strong><span>“屯田”事件</span></strong><span>：靳辅和陈潢为解决军饷和河工费用，将水退后形成的肥沃河滩地招募流民屯垦，收租以补充河工开支。这本是好事，却被政敌诬告为“霸占民田”。</span>
                      </p>
                    </li>
                  </ul>
                  <p><span>最终，在康熙二十七年（1688年），靳辅被革职，陈潢更被削职逮问，冤死狱中。一位天才的水利科学家落得如此下场，令人扼腕叹息。</span></p>
                  <h4><strong><span>五、 历史功绩与评价</span></strong></h4>
                  <p><span>靳辅被革职后，黄河再次频发险情，证明了他的方法不可或缺。康熙三十一年（1692年），康熙帝重新起用靳辅为河道总督，但年迈的靳辅上任仅半年就积劳成疾，病逝于任上。</span></p>
                  <p><strong><span>靳辅和陈潢的治河功绩是永恒的：</span></strong></p>
                  <ul>
                    <li>
                      <p><strong><span>系统治理</span></strong><span>：他们将黄河、淮河、运河视为一个整体系统进行综合治理，思路远超前人。</span></p>
                    </li>
                    <li>
                      <p><strong><span>科学创新</span></strong><span>：陈潢的理论和实践将中国古代水利工程学推向了顶峰。</span></p>
                    </li>
                    <li>
                      <p><strong><span>保障安定</span></strong><span>：他们基本稳定了清初的黄河河道，此后数十年未发生大改道，为“康乾盛世”的到来奠定了重要的物质基础（保障漕运和农业）。</span></p>
                    </li>
                    <li>
                      <p><strong><span>精神楷模</span></strong><span>：靳辅公而忘私，“自受事以后，日与工匠夫役为伍，风雨栉沐，长期驻守在治河第一线”。陈潢更是为治河事业奉献了全部智慧乃至生命。</span>
                      </p>
                    </li>
                  </ul>
                  <p><span>康熙帝后来评价道：“靳辅自受事以后，斟酌时宜，相度形势，兴建工程，准酌得宜……裨益漕运民生，厥功懋焉。”后世则将靳辅与汉代的王景、明代的潘季驯并列为中国历史上的“治黄三巨人”。</span></p>
                  <p>
                    <span>靳辅与陈潢的故事，不仅是一段驯服洪水的史诗，更是一曲关于理想、坚持与牺牲的悲壮挽歌，深刻体现了人类与自然博弈的复杂与艰辛。</span>
                  </p>
                </div>
              </div>
            })
          }
        }
      });

      return {
        ...item,
        instance
      }
    })
  }

  const initYellowRiverAreaCity = () => {

    yellowRiverAreaCityInstanceList.current = [
      {
        position: Cesium.Cartesian3.fromDegrees(113.63347196165603,
          34.749234812398115, 20),
        text: '郑州市',
        instance: null,
        key: 'zhengzhoushi'
      },
      {
        position: Cesium.Cartesian3.fromDegrees(115.49679039259848,
          35.25467337564086, 20),
        text: '菏泽市',
        instance: null,
        key: 'hezeshi'
      },
      {
        position: Cesium.Cartesian3.fromDegrees(101.76560988176715,
          36.62741711989274, 20),
        text: '西宁市',
        instance: null,
        key: 'xiningshi'
      },
      {
        position: Cesium.Cartesian3.fromDegrees(103.78327390724866,
          36.07726675570002, 20),
        text: '兰州市',
        instance: null,
        key: 'lanzhoushi'
      },
      {
        position: Cesium.Cartesian3.fromDegrees(112.53321374491901,
          37.86001460264656, 20),
        text: '太原市',
        instance: null,
        key: 'taiyuanshi'
      },
      {
        position: Cesium.Cartesian3.fromDegrees(106.21382373287798,
          38.47223420584143, 20),
        text: '银川市',
        instance: null,
        key: 'yinchuanshi'
      },
      {
        position: Cesium.Cartesian3.fromDegrees(106.21382373287798,
          38.47223420584143, 20),
        text: '银川市',
        instance: null,
        key: 'yinchuanshi'
      },
      {
        position: Cesium.Cartesian3.fromDegrees(108.9409382315867,
          34.29707135981137, 20),
        text: '西安市',
        instance: null,
        key: 'xianshi'
      },
      {
        position: Cesium.Cartesian3.fromDegrees(107.31417624573231,
          40.760193834638244, 20),
        text: '巴彦淖尔',
        instance: null,
        key: 'bayannaoshi'
      },
      {
        position: Cesium.Cartesian3.fromDegrees(116.98764637644916,
          36.65355257715363, 20),
        text: '济南市',
        instance: null,
        key: 'jinanshi'
      },
    ].map(item => {
      const instance = new SampleLabel(viewerRef.current!, item.position, item.text, {
        containerBackgroundUrlType: 'position',
        defaultVisible: false,
      });

      return {
        ...item,
        instance
      }
    })

  }

  const initYellowRiverSubsection = () => {

    yellowRiverSubsectionInstanceList.current = [
      {
        position: Cesium.Cartesian3.fromDegrees(111.04,
          40.16, 20),
        text: '上中游分界点：河口镇',
        instance: null,
        key: 'hekouzhen'
      },
      {
        position: Cesium.Cartesian3.fromDegrees(113.28,
          34.57, 20),
        text: '中下游分界点：桃花峪',
        instance: null,
        key: 'taohuayu'
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

  const guiControls = {
    drawAdministrativeRegion: false,

    drawYellowRiverBranch: false,
    drawYellowRiverAreaProvince: false,
    drawLoessPlateauArea: false,
    drawYellowRiverAreaCity: false,
    drawYellowRiverSubsectionPoint: false,

    drawYuhegudao: false,
    drawXihangudao: false,
    drawDonghangudao: false,
    drawBeisonggudao: false,
    drawMingqinggudao: false,
    drawNansonggudao: false,

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
      const visible = cultureInstanceList.current.find(item => item.key === 'dayuzhishui')?.instance?.toggleVisible(true)

      if (visible) {
        dayuzhishuiControlRef.current?.setValue(true)
        dayuzhishuiControlRef.current?.updateDisplay()
        cameraFlyTo(...[...dayuzhishuiPosition, 500000])
      }

    },
    jinfuzhihe: () => {

      const visible = cultureInstanceList.current.find(item => item.key === 'jinfuzhihe')?.instance?.toggleVisible(true)

      if (visible) {
        jinfuzhiheControlRef.current?.setValue(true)
        jinfuzhiheControlRef.current?.updateDisplay()
        cameraFlyTo(...[...jinfuzhihePosition, 500000])
      }
    }
  };

  const initGui = () => {
    if (guiRef.current) {
      guiRef.current.destroy()
      guiRef.current = null
    }

    guiRef.current = new gui.GUI({})

    guiRef.current.title('黄河')

    const regionControls = guiRef.current.addFolder('主要区域')

    const videoControls = guiRef.current.addFolder('黄河科普')

    const mainControls = guiRef.current.addFolder('相关区域')

    const historyChangeContols = guiRef.current.addFolder('历史改道')

    const cultureControls = guiRef.current.addFolder('人文历史')

    /* 主要区域 */
    regionControls.add(guiControls, 'drawAdministrativeRegion').name('行政区域').onChange((value: boolean) => {
      drawAdministrativeRegion(value)
    })

    /* 科普视频 */
    videoControls.add(guiControls, 'showVideo').name('我们的母亲河')

    /* 主要区域 */
    mainControls.add(guiControls, 'drawYellowRiverBranch').name('黄河支流').onChange((value: boolean) => {
      drawYellowRiverBranch(value)
    })

    const yellowRiverAreaProvinceControl = mainControls.add(guiControls, 'drawYellowRiverAreaProvince').name('黄河流域').onChange((value: boolean) => {
      drawYellowRiverAreaProvince(value)
    })

    mainControls.add(guiControls, 'drawLoessPlateauArea').name('黄土高原').onChange((value: boolean) => {
      drawLoessPlateauArea(value)
    })

    mainControls.add(guiControls, 'drawYellowRiverAreaCity').name('流经城市').onChange((value: boolean) => {
      yellowRiverAreaCityInstanceList.current.forEach(item => item.instance?.toggleVisible(value))
      yellowRiverAreaProvinceControl.setValue(value)
      yellowRiverAreaProvinceControl.updateDisplay()

      if (value) {
        cameraFlyTo(113.63347196165603, 34.749234812398115, 1000000)
      }
    })
    mainControls.add(guiControls, 'drawYellowRiverSubsectionPoint').name('上中下游分界点').onChange((value: boolean) => {
      yellowRiverSubsectionInstanceList.current.forEach(item => item.instance?.toggleVisible(value))

      if (value) {
        cameraFlyTo(111.04, 40.16, 1000000)
      }
    })


    /* 历史改道 */
    dayuzhishuiControlRef.current = historyChangeContols.add(guiControls, 'drawYuhegudao').name('禹河故道').onChange((value: boolean) => {
      if (value) {
        cameraFlyTo(...historyChangeFlyTo)
      }
      drawYuhegudao(value)
    })

    historyChangeContols.add(guiControls, 'drawXihangudao').name('西汉故道').onChange((value: boolean) => {
      if (value) {
        cameraFlyTo(...historyChangeFlyTo)
      }
      drawXihangudao(value)
    })

    historyChangeContols.add(guiControls, 'drawDonghangudao').name('东汉故道').onChange((value: boolean) => {
      if (value) {

        cameraFlyTo(...historyChangeFlyTo)
      }
      drawDonghangudao(value)
    })

    historyChangeContols.add(guiControls, 'drawBeisonggudao').name('北宋故道').onChange((value: boolean) => {
      if (value) {

        cameraFlyTo(...historyChangeFlyTo)
      }
      drawBeisonggudao(value)
    })

    historyChangeContols.add(guiControls, 'drawNansonggudao').name('南宋故道').onChange((value: boolean) => {
      if (value) {

        cameraFlyTo(...historyChangeFlyTo)
      }
      drawNansonggudao(value)
    })

    jinfuzhiheControlRef.current = historyChangeContols.add(guiControls, 'drawMingqinggudao').name('明清故道').onChange((value: boolean) => {

      if (value) {
        cameraFlyTo(...historyChangeFlyTo)
      }

      drawMingqinggudao(value)
    })

    /* 人文历史 */

    cultureControls.add(guiControls, 'dayuzhishui').name('大禹治水')
    cultureControls.add(guiControls, 'jinfuzhihe').name('靳辅治河')

  }

  const cameraFlyTo = (longitude: number, latitude: number, height: number = 4000000) => {
    viewerRef.current!.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
    })
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

  const drawAdministrativeRegion = (checked: boolean) => {
    if (checked) {

      if (administrativeRegionRef.current?.length) {

        administrativeRegionRef.current.forEach(item => {
          item.show = true
        })

      } else {
        fetch(window.$$prefix + "/data/china/china.geojson").then(res => res.json()).then(data => {
          Cesium.GeoJsonDataSource.load(data, {
            stroke: Cesium.Color.BROWN.withAlpha(0.8),
            fill: Cesium.Color.WHITE.withAlpha(0.5),
            strokeWidth: 0.8,
            markerSymbol: "circle"
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)
            administrativeRegionRef.current = dataSource.entities.values
          });

        });
      }

    } else {
      administrativeRegionRef.current!.forEach(item => {
        item.show = false
      })
    }
  };

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

  const drawYuhegudao = (checked: boolean) => {

    if (checked) {

      if (yuhegudaoRef.current?.length) {

        yuhegudaoRef.current.forEach(item => {
          item.show = true
        })

        yuhegudaoNameRef.current.forEach(item => {
          item.show = true
        })


      } else {

        const color = Cesium.Color.VIOLET

        fetch(window.$$prefix + "/data/yellow-river/yuhegudao.geojson").then(res => res.json()).then(data => {
          Cesium.GeoJsonDataSource.load(data, {
            stroke: color,
            fill: color.withAlpha(0.2),
            strokeWidth: 4,
            markerSymbol: "circle"
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)
            yuhegudaoRef.current = dataSource.entities.values
          });
        });

        yuhegudaoNameRef.current.push(viewerRef.current!.entities.add({
          position: Cesium.Cartesian3.fromDegrees(117.34429640994914, 39.59296969230597),
          label: {
            text: "禹河古道",
            font: "18px sans-serif",
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            outlineWidth: 2,
            outlineColor: color,
            fillColor: Cesium.Color.WHITE,
          }
        }))
      }

    } else {
      yuhegudaoRef.current!.forEach(item => {
        item.show = false
      })

      yuhegudaoNameRef.current!.forEach(item => {
        item.show = false
      })
    }


  }

  const drawDonghangudao = (checked: boolean) => {

    if (checked) {

      if (donghangudaoRef.current?.length) {

        donghangudaoRef.current.forEach(item => {
          item.show = true
        })

        donghangudaoNameRef.current.forEach(item => {
          item.show = true
        })


      } else {

        const color = Cesium.Color.ORANGE

        fetch(window.$$prefix + "/data/yellow-river/donghangudao.geojson").then(res => res.json()).then(data => {
          Cesium.GeoJsonDataSource.load(data, {
            stroke: color,
            fill: color.withAlpha(0.2),
            strokeWidth: 4,
            markerSymbol: "circle"
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)
            donghangudaoRef.current = dataSource.entities.values
          });
        });

        donghangudaoNameRef.current.push(viewerRef.current!.entities.add({
          position: Cesium.Cartesian3.fromDegrees(117.7107197633053, 37.67839224617755),
          label: {
            text: "东汉故道",
            font: "18px sans-serif",
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            outlineWidth: 2,
            outlineColor: color,
            fillColor: Cesium.Color.WHITE,
          }
        }))
      }

    } else {
      donghangudaoRef.current!.forEach(item => {
        item.show = false
      })

      donghangudaoNameRef.current.forEach(item => {
        item.show = true
      })
    }


  }

  const drawXihangudao = (checked: boolean) => {

    if (checked) {

      if (xihangudaoRef.current?.length) {

        xihangudaoRef.current.forEach(item => {
          item.show = true
        })

        xihangudaoNameRef.current.forEach(item => {
          item.show = true
        })

      } else {

        const color = Cesium.Color.BROWN

        fetch(window.$$prefix + "/data/yellow-river/xihangudao.geojson").then(res => res.json()).then(data => {
          Cesium.GeoJsonDataSource.load(data, {
            stroke: color,
            fill: color.withAlpha(0.2),
            strokeWidth: 4,
            markerSymbol: "circle"
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)
            xihangudaoRef.current = dataSource.entities.values
          });
        });

        xihangudaoNameRef.current.push(viewerRef.current!.entities.add({
          position: Cesium.Cartesian3.fromDegrees(117.16475899411333, 38.87213207639694),
          label: {
            text: "西汉故道",
            font: "18px sans-serif",
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            outlineWidth: 2,
            outlineColor: color,
            fillColor: Cesium.Color.WHITE,
          }
        }))
      }

    } else {
      xihangudaoRef.current!.forEach(item => {
        item.show = false
      })

      xihangudaoNameRef.current.forEach(item => {
        item.show = false
      })
    }


  }

  const drawBeisonggudao = (checked: boolean) => {

    if (checked) {

      if (beisonggudaoRef.current?.length) {

        beisonggudaoRef.current.forEach(item => {
          item.show = true
        })

        beisonggudaoNameRef.current.forEach(item => {
          item.show = true
        })


      } else {

        const color = Cesium.Color.THISTLE

        fetch(window.$$prefix + "/data/yellow-river/beisonggudao.geojson").then(res => res.json()).then(data => {
          Cesium.GeoJsonDataSource.load(data, {
            stroke: color,
            fill: color.withAlpha(0.2),
            strokeWidth: 4,
            markerSymbol: "circle"
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)
            beisonggudaoRef.current = dataSource.entities.values
          });
        });


        const beisonggudaoName = [
          {
            position: Cesium.Cartesian3.fromDegrees(115.82154578431262, 38.015631919408),
            text: '北宋故道（北流）'
          },
          {
            position: Cesium.Cartesian3.fromDegrees(117.41979162899403, 38.153555435893274),
            text: '北宋故道（东流）'
          },
        ]

        beisonggudaoName.forEach(item => {
          beisonggudaoNameRef.current.push(viewerRef.current!.entities.add({
            position: item.position,
            label: {
              text: item.text,
              font: "18px sans-serif",
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              outlineWidth: 2,
              outlineColor: color,
              fillColor: Cesium.Color.WHITE,
            }
          }))
        })
      }

    } else {
      beisonggudaoRef.current!.forEach(item => {
        item.show = false
      })

      beisonggudaoNameRef.current.forEach(item => {
        item.show = false
      })
    }

  }

  const drawMingqinggudao = (checked: boolean) => {

    if (checked) {

      if (mingqinggudaoRef.current?.length) {

        mingqinggudaoRef.current.forEach(item => {
          item.show = true
        })

        mingqinggudaoNameRef.current.forEach(item => {
          item.show = true
        })

      } else {

        const color = Cesium.Color.DARKBLUE

        fetch(window.$$prefix + "/data/yellow-river/mingqinggudao.geojson").then(res => res.json()).then(data => {
          Cesium.GeoJsonDataSource.load(data, {
            stroke: color,
            fill: color.withAlpha(0.2),
            strokeWidth: 4,
            markerSymbol: "circle"
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)
            mingqinggudaoRef.current = dataSource.entities.values
          });

          mingqinggudaoNameRef.current.push(viewerRef.current!.entities.add({
            position: Cesium.Cartesian3.fromDegrees(116.89789938054952, 34.002151532164426),
            label: {
              text: "明清故道",
              font: "18px sans-serif",
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              outlineWidth: 2,
              outlineColor: color,
              fillColor: Cesium.Color.WHITE,

            }
          }))
        });

      }
    } else {
      mingqinggudaoRef.current!.forEach(item => {
        item.show = false
      })

      mingqinggudaoNameRef.current.forEach(item => {
        item.show = true
      })

    }
  }

  const drawNansonggudao = (checked: boolean) => {

    if (checked) {

      if (nansonggudaoRef.current?.length) {

        nansonggudaoRef.current.forEach(item => {
          item.show = true
        })

        nansonggudaoNameRef.current.forEach(item => {
          item.show = true
        })


      } else {

        const color = Cesium.Color.LIGHTGREEN

        fetch(window.$$prefix + "/data/yellow-river/nansonggudao.geojson").then(res => res.json()).then(data => {
          Cesium.GeoJsonDataSource.load(data, {
            stroke: color,
            fill: color.withAlpha(0.2),
            strokeWidth: 4,
            markerSymbol: "circle"
          }).then(function (dataSource) {
            viewerRef.current!.dataSources.add(dataSource)
            nansonggudaoRef.current = dataSource.entities.values
          });
        });


        const nansonggudaoName = [
          {
            position: Cesium.Cartesian3.fromDegrees(115.83909059918128, 34.9316807722699),
            text: '南宋故道'
          },
          {
            position: Cesium.Cartesian3.fromDegrees(115.83245563677772, 35.57573482173487),
            text: '南宋北岔流'
          },
          {
            position: Cesium.Cartesian3.fromDegrees(114.97118922424879, 34.2832804070269),
            text: '南宋南岔流'
          },
        ]

        nansonggudaoName.forEach(item => {
          nansonggudaoNameRef.current.push(viewerRef.current!.entities.add({
            position: item.position,
            label: {
              text: item.text,
              font: "14px sans-serif",
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              outlineWidth: 2,
              outlineColor: color,
              fillColor: Cesium.Color.WHITE,
            }
          }))
        })
      }

    } else {
      nansonggudaoRef.current!.forEach(item => {
        item.show = false
      })

      nansonggudaoNameRef.current.forEach(item => {
        item.show = false
      })
    }
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
        cameraFlyTo(106.42574140217508, 37.565051396604, 4000000)
      }
    );

    (viewer.cesiumWidget.creditContainer as HTMLDivElement).style.display = "none";

    fetch(window.$$prefix + "/data/china/china-boundary.geojson").then(res => res.json()).then(data => {
      Cesium.GeoJsonDataSource.load(data, {
        stroke: Cesium.Color.BROWN,
        fill: Cesium.Color.BROWN.withAlpha(0.2),
        strokeWidth: 2,
        markerSymbol: "circle"
      }).then(function (dataSource) {
        viewer.dataSources.add(dataSource)
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

    initClickHandler(viewer)

    initCultureIntanceList()

    initYellowRiverAreaCity()

    initYellowRiverSubsection()

    initGui()

    return () => {
      viewer.destroy();
      guiRef.current?.destroy()
    }
  }, []);


  return (
    <div className="canvas-container">
      {modalContext}
      <div className="canvas-container-body" ref={containerRef} />
    </div>
  );
};

export default YellowRiver;
