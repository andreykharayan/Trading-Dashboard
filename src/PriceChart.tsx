import React from 'react';

import {
  LineChart, Line, XAxis as XAxisLine, YAxis as YAxisLine, CartesianGrid, Tooltip, AreaChart, Area, ResponsiveContainer
} from 'recharts';
import { useState } from "react";
import {
  CandlestickSeries, Chart, ChartCanvas, discontinuousTimeScaleProvider,
  XAxis as XAxisRFC, YAxis as YAxisRFC, OHLCTooltip, MouseCoordinateX, MouseCoordinateY
} from "react-financial-charts";



interface CandleData {
    date: Date;
    open: number;
    high: number;
    low: number;
    close: number;
}

interface CandleChartProps {
    data: CandleData[];
}

interface LineChartPoint {
    date: string;
    price: number;
}


interface LineChartProps {
    data: LineChartPoint[]; 
    /*lines: RegularData[];*/
    /*showCandles: boolean;*/
}


//
export const CandleChart: React.FC<CandleChartProps> = ({data}) => {
    const sorted = [...data].sort((a, b) => +a.date - +b.date);
    const scaleProvider = discontinuousTimeScaleProvider.inputDateAccessor((d: CandleData) => d.date);
    const {data: chartData, xScale, xAccessor, displayXAccessor} = scaleProvider(sorted);

    const xExtents: [number, number] = [
        xAccessor(chartData[Math.max(0, chartData.length - 100)]),
        xAccessor(chartData[chartData.length - 1]),
    ];

    return (

      <ChartCanvas
      useCrossHairStyleCursor={false}
      height ={400}
      width={800}
      ratio={1}
      
      margin={{left: 50, right: 50, top: 0, bottom: 30}}
      seriesName='Cripto'
      data={chartData}
      xScale={xScale}
      xAccessor={xAccessor}
      displayXAccessor={displayXAccessor}
      xExtents={xExtents}

      > 
      <CartesianGrid strokeDasharray="3 3" />
      <Chart id={1} yExtents={(d: CandleData) => [d.high, d.low]}>
        <XAxisRFC axisAt="bottom" orient="bottom" strokeStyle="#ff0000ff"  tickLabelFill="#9CA3AF"   />
        <YAxisRFC axisAt="left" orient="left" strokeStyle="#b700ffff"  />
        <CandlestickSeries 
        
            yAccessor={(d: CandleData) => ({
                open: d.open,
                high: d.high,
                low: d.low,
                close: d.close,
            })}

        />
        
      </Chart>
    </ChartCanvas>
    );
};


export const Candle: React.FC<CandleChartProps> = ({data}) => {
    

    return (
        
        <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow">

                <CandleChart data={data} />
               
        </div>
       
    );
   
};

export const RegularLineChart: React.FC<LineChartProps> = ({data}) => {
    return (

        /* ResponsiveContainer делает график адаптивным по ширине и высоте */
            <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} >
            
            {/* Сетка графика */}
            <CartesianGrid strokeDasharray="3 3" />
            {/* Ось Х даты */}
            <XAxisLine dataKey="date" domain={["auto", "auto"]} />
            {/* Ось У - цены, автоматически подстраивается */}
            <YAxisLine domain={["auto", "auto"]} />
            {/*Всплывающие подсказки при наведении */}
            <Tooltip />
            {/* Линия графика #812AFA*/}
            <Area 
            
                type="monotone"
                dataKey="price"
                name='Цена в $'
                stroke="#00FFFF"
                strokeWidth={2}
                dot={{ r: 1, fill: '#10b981' }}
                activeDot={{r: 6, fill: 'red'}}

            />


            <defs>

                <linearGradient id="colorFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor='#00ffff' stopOpacity={0.4} />
                    <stop offset="100%"  stopColor='#001f33' stopOpacity={0.5} />



                </linearGradient>

            </defs>
            </AreaChart></ResponsiveContainer>

    );
}

export const RegularLine: React.FC<LineChartProps> = ({data}) => {
    

    
    return (
        
        <div className="graphicLine w-[80%] h-80  bg-transparent bg-gradient-to-r from-[#1a61b6]/30 to-[#4371a7]/3 dark:bg-gray-900 rounded-lg p-4 shadow">

                <RegularLineChart data={data} />
               
        </div>
       
    );
   
};



