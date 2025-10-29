import React, { useState, useEffect, useRef } from 'react'
import * as echarts from 'echarts'
import { Button, Modal, Select, Tooltip } from 'antd'
import classNames from 'classnames'

type WavesChartsPropsType = {
  chartsContainerStyle?: React.CSSProperties
}

const WavesCharts: React.FC<WavesChartsPropsType> = (props) => {

  const { chartsContainerStyle } = props
  const [modal, modalContext] = Modal.useModal();

  const instance = useRef<HTMLDivElement>(null)

  const chartInstance = useRef<echarts.ECharts>(null)

  const [folder, setFolder] = useState<boolean>(false)

  const initCharts = () => {
    const chartDom = instance.current

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartDom, 'dark');
    }

    chartInstance.current!.resize()

    const date = [] as number[];

    const data = [] as number[];;

    fetch(window.$$prefix + '/data/earthquake/wenchuan-earthquake-waves-data.json').then(res => res.json()).then(res => {
      const content = res

      content.x.forEach((item: number) => {
        date.push(item)
      })

      content.y.forEach((item: number) => {
        data.push(item)
      })

      const options = {
        tooltip: {
          trigger: 'axis',
          position: function (pt: any) {
            return [pt[0], '50%'];
          }
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: date,
          axisTick: {
            show: true
          },
          // 单位
          axisLabel: {
            formatter: function (val: number) {
              return val + 's'
            }
          },
          name: '时间（单位：秒）'
        },
        yAxis: {
          type: 'value',
          interval: 200,
          min: -1000,
          max: 1000,
          name: '加速度（单位：cm/s²）'
        },
        dataZoom: [
          {
            type: 'inside',
            start: 0,
            end: 100
          },
          {
            start: 0,
            end: 100
          }
        ],
        series: [
          {
            name: '加速度',
            type: 'line',
            symbol: 'none',
            sampling: 'lttb',
            itemStyle: {
              color: 'rgb(255, 70, 131)'
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: 'rgb(255, 158, 68)'
                },
                {
                  offset: 1,
                  color: 'rgb(255, 70, 131)'
                }
              ])
            },
            data: data
          }
        ]
      };

      chartInstance.current!.setOption(options, true);
    })



    window.addEventListener('resize', () => {
      chartInstance.current!.resize()
    })
  }

  const showDescription = () => {


    modal.info({
      icon: null,
      title: '地震信息',
      content: <>
        <p><span style={{ fontWeight: 'bold' }}>地震时间</span>：2008年5月12日 14:28:04（北京时间）</p>
        <p><span style={{ fontWeight: 'bold' }}>地震名称</span>：汶川地震</p>
        <p><span style={{ fontWeight: 'bold' }}>震源位置</span>：31.000N, 103.400E</p>
        <p><span style={{ fontWeight: 'bold' }}>震源深度</span>：14公里</p>
        <p><span style={{ fontWeight: 'bold' }}>震级</span>：8.0（Ms，表示面波震级）</p>
        <br />
        <h3><span style={{ fontWeight: 'bold' }}>观测台信息</span></h3>
        <p><span style={{ fontWeight: 'bold' }}>台站代码</span>：051WCW</p>
        <p><span style={{ fontWeight: 'bold' }}>台站条件</span>：冲积层（Alluvium，意味着该台站位于河流沉积的松散土层上）</p>
        <p><span style={{ fontWeight: 'bold' }}>仪器类型</span>：ETNA（这是一种地震仪器类型，常用于测量地震的加速度）</p>
        <p><span style={{ fontWeight: 'bold' }}>观测点</span>：地面（即地震波是直接在地面上测量的）</p>
        <br />
        <h3><span style={{ fontWeight: 'bold' }}>数据采集细节</span></h3>
        <p><span style={{ fontWeight: 'bold' }}>观测方向</span>：东西向（COMP.EW，表示观测的方向是东西向，主要是测量地震波在该方向的加速度）</p>
        <p><span style={{ fontWeight: 'bold' }}>未修正加速度单位</span>：厘米/秒²（cm/sec²，表示测得的加速度单位）</p>
        <p><span style={{ fontWeight: 'bold' }}>采样点数</span>：36,000个点（表示总共记录了36,000个数据点）</p>
        <p><span style={{ fontWeight: 'bold' }}>采样间隔</span>：0.005秒（表示每个采样点之间的时间间隔为0.005秒，即每秒记录200次数据）</p>
        <br />
        <h3><span style={{ fontWeight: 'bold' }}>地震波特征</span></h3>
        <p><span style={{ fontWeight: 'bold' }}>峰值加速度</span>：957.7 cm/sec²（这表示在观测到的最大加速度值是957.7厘米每秒每秒）</p>
        <p><span style={{ fontWeight: 'bold' }}>峰值发生时刻</span>：33.01秒（表示峰值加速度出现在地震发生后33.01秒时）</p>
        <p><span style={{ fontWeight: 'bold' }}>持续时间</span>：180秒（表示该地震波的持续时间为180秒）</p>
        <p><span style={{ fontWeight: 'bold' }}>前震时间</span>：20秒（地震发生前20秒即已开始记录前震活动）</p></>,
      okText: '关闭',
      cancelText: '取消',
      width: 600,
      centered: true,
      onOk() {
      },
      onCancel() {
      }
    })
  }


  useEffect(() => {
    initCharts()

    if (!folder) {
      initCharts()
    }
  }, [folder])

  return <>
    {modalContext}
    <div className={classNames('project-item-charts', {
      'project-item-charts-hide': folder
    })} style={chartsContainerStyle}>
      {
        <div style={{ width: '100%', height: '100%', display: !folder ? 'block' : 'none' }}>
          <div style={{ height: '40px', color: 'white', lineHeight: '40px' }}>
            汶川大地震地震波 <span style={{ fontSize: 12 }}>2008年5月12日 14:28:04（北京时间）</span>
            <Button type='link' onClick={() => {
              showDescription()
            }}>详情</Button>
          </div>
          <div style={{ width: '100%', height: 'calc(100% - 40px)' }} ref={instance}></div>
        </div>
      }
      {
        folder && <div className='project-item-charts-hide-title'>汶川大地震地震波</div>
      }
      <div className='project-item-charts-folder' onClick={() => {
        setFolder(!folder)
      }}></div>
    </div >
  </>

}

export default WavesCharts