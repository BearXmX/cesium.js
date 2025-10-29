import React, { useState, useEffect, useRef } from 'react'
import * as echarts from 'echarts'
import { Button, Modal, Select, Tooltip } from 'antd'
import { waterQualityChartsData } from './constance'
import classNames from 'classnames'

type waterQualityChartsPropsType = {
  year: number
  chartsContainerStyle?: React.CSSProperties
}

const waterQualityCharts: React.FC<waterQualityChartsPropsType> = (props) => {
  const [modal, modalContext] = Modal.useModal();

  const { year, chartsContainerStyle } = props

  const instance = useRef<HTMLDivElement>(null)

  const chartInstance = useRef<echarts.ECharts>(null)

  const [value, setValue] = useState<string>('a')

  const [folder, setFolder] = useState<boolean>(false)

  const list = [
    {
      value: 'a', label: <>化学需氧量（COD<span style={{ fontSize: 10 }}>Cr</span>）</>, yAxis: {
        interval: 50,
        min: 0,
        max: 200
      },
      description: '指用化学反应衡量水样中需要被氧化的还原性无机物和有机物（一般为有机物）所消耗的氧当量，是判断水环境是否受到污染的一个非常重要指标。在河流污染和工业废水性质的研究以及废水处理厂的运行管理中，它是一个重要的而且能较快测定的有机物污染参数，常以符号COD表示。'
    },
    {
      value: 'b', label: <>高锰酸盐指数（<span style={{ fontStyle: 'italic' }}>I</span><span style={{ fontSize: 10 }}>Mn</span>）</>, yAxis: {
        interval: 10,
        min: 0,
        max: 50
      },
      description: '高锰酸盐指数是以高锰酸钾为氧化剂，在酸性或碱性条件下处理水样时消耗的氧化剂量，以氧的毫克/升（mg/L）表示，主要用于评估饮用水、地表水及生活污水的水质指标.'
    },
    {
      value: 'c', label: <>五日生化需氧量（BOD<span style={{ fontSize: 10 }}>5</span>）</>, yAxis: {
        interval: 20,
        min: 0,
        max: 80
      },
      description: '反映水体中有机污染物被微生物分解所消耗溶解氧量的核心指标，其测定标准为在20℃恒温条件下连续培养5天。该指标通过测量微生物新陈代谢过程中溶解氧的消耗量，可评估水体受有机物污染程度—该值小于1mg/L表明水体清洁，超过3-4mg/L则判定为受污染。'
    },
    {
      value: 'd', label: <>氨氮（NH<span style={{ fontSize: 10 }}>3-</span>N）</>, yAxis: {
        interval: 10,
        min: 0,
        max: 30
      },
      description: '以游离氨（NH3）和铵离子（NH4+）形式存在的化合氮叫做氨氮。氨氮是水体中的营养素，可导致水富营养化现象产生，是水体中的主要耗氧污染物，对鱼类及某些水生生物有毒害'
    },
    {
      value: 'e', label: <>总磷（TP）</>, yAxis: {
        interval: 0.5,
        min: 0,
        max: 2
      },
      description: '总磷（TP）是水体或饲料中各种形态磷的总称，包括无机磷酸盐和有机磷化合物。'
    },
  ]

  const initCharts = (type: string) => {
    const chartDom = instance.current

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartDom, 'dark');
    }

    chartInstance.current!.resize()

    const option = {
      /*       title: {
              text: list.find(item => item.value === type)?.label,
              textStyle: {
                color: '#fff',
                fontSize: '14px',
              }
            }, */
      /*       tooltip: {
              trigger: 'axis'
            }, */
      legend: {
        top: '15px',
        left: '10px',
        data: ['上游（白鹤）', '下游（武宁路桥）', '全河平均',]
      },
      grid: {
        left: '1%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: waterQualityChartsData.filter(item => item.year <= year).map(item => item.year),
        axisLabel: { color: '#fff', fontSize: 10, rotate: 90, interval: 0, }
      },
      yAxis: {
        type: 'value',
        ...list.find(item => item.value === type)?.yAxis,
      },
      series: [
        {
          name: '上游（白鹤）',
          type: 'line',
          // 获取data里的数据
          data: waterQualityChartsData.filter(item => item.year <= year).map((item: any) => {
            return item[type][0].value
          })
        },
        {
          name: '下游（武宁路桥）',
          type: 'line',
          data: waterQualityChartsData.filter(item => item.year <= year).map((item: any) => item[type][1].value)
        },
        {
          name: '全河平均',
          type: 'line',
          data: waterQualityChartsData.filter(item => item.year <= year).map((item: any) => item[type][2].value)
        },
      ]
    };

    chartInstance.current.setOption(option, true);

    window.addEventListener('resize', () => {
      chartInstance.current!.resize()
    })
  }

  const showDescription = () => {
    const title = list.find(item => item.value === value)?.label
    const description = list.find(item => item.value === value)?.description

    modal.info({
      icon: null,
      title: title,
      content: <>{description}</>,
      okText: '关闭',
      cancelText: '取消',
      width: 400,
      centered: true,
      onOk() {
      },
      onCancel() {
      }
    })
  }

  useEffect(() => {
    initCharts(value)

    if (!folder) {
      initCharts(value)
    }
  }, [year, folder])

  return <>
    {modalContext}
    <div className={classNames('project-item-charts', {
      'project-item-charts-hide': folder
    })} style={chartsContainerStyle}>
      {
        <div style={{ width: '100%', height: '100%', display: !folder ? 'block' : 'none' }}>
          <div style={{ height: 35, display: 'flex', alignItems: 'center' }}>
            <Select
              size='small'
              value={value}
              style={{ width: 200, transform: 'translateY(6px)', marginBottom: 10 }}
              options={list}
              onChange={(val) => {
                setValue(val)
                initCharts(val)
              }}
            />
            <span style={{ color: '#fff', fontSize: 10 }}>（单位：mg/L）</span>
            <Button type='link' onClick={() => {
              showDescription()
            }}>指标说明</Button>
          </div>
          <div style={{ width: '100%', height: 'calc(100% - 50px)' }} ref={instance}></div>
          <div style={{ fontSize: 10, color: '#a0a0a0' }}>相关数据来自doi: 10.3969/j.issn.1674-6732.2023.04.012</div>
        </div>
      }
      {
        folder && <div className='project-item-charts-hide-title'>水质变化历年图表</div>
      }
      <div className='project-item-charts-folder' onClick={() => {
        setFolder(!folder)
      }}></div>
    </div >
  </>

}

export default waterQualityCharts