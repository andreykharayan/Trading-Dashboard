import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import './index.css';
import { RegularLine, Candle } from './PriceChart';
import ExchangeRate from './components/ExchangeRate';
import Loading from './components/Loading';
//import { CandleData } from './types';

import Error404 from './components/Error404';
import Planet from './components/Planet';
import Earth from './components/Earth';
import {motion} from "framer-motion";
import SearchTV from './components/SearchTV';



type ConfigData = {
    left: number,
    right: number
}

export const SearchTicker: React.FC = () => {

    const [config, setConfig] = useState<ConfigData | null>(null)

    useEffect(() => {
        const run = async () => {
            setLoading(true);
            let randomParameter = Math.random() * 10;
            try {
                const responce = await fetch (`system_config.json?randomParameter=${encodeURIComponent(randomParameter)}`);
                if (!responce.ok) throw new Error('Failed to fetch config');
                const data: ConfigData = await responce.json()
                
                console.log('confJson', data);
                

                setConfig(data);
                
            } catch(err) {
                console.error(err);
            }
        }
        run();
    }, []);



    var arrayPosition: Array<string> = ["left", "right"];

    const [CNY, setCNY] = useState<number | null>(null);
    const [EURO, setEURO] = useState<number | null>(null);
    const [USD, setUSD] = useState<number | null>(null);

    const [sendData, setSendData] = useState(false);

    //состояние для ввода тикера

    const [ticker, setTicker] = useState('');

    //Condition for input a days period

    const [daysPeriod, setDaysPeriod] = useState<number | null>(7);

    //состояние для хранения полученной цены (число или нулл)

    const [price, setPrice] = useState<number | null>(null);

    //состояние для отображение загрузки

    const [loading, setLoading] = useState(false);

    //состояние для ошибок

    const [error, setError] = useState('');

    //состояние для истории
    const [history, setHistory] = useState<{date: string; price: number}[]>([]);

    const [historyCandles, setHistoryCandles] = useState<CandleData[]>([]);

    const [showCandles, setShowCandeles] = useState(false);

    const [moved, setMoved] = useState(false);

    const [dragIndex, setDragIndex] = useState<number | null>(null);

    const [glowDay, setGlowDay] = useState<number | 7>(7);

    const [planetGo, setPlanetGo] = useState(false);

    const handleChangeGraphic = () => {
        setShowCandeles(prev => !prev);
        console.log(config);
    }

    const handleGetDaysPeriod = (days :number) => {
        setDaysPeriod(days);
    }

    const handleDragStart = (index: number) => {
        setDragIndex(index);
        
    }

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    }

    const handleDrop = (dropIndex: number) => {
        // Если ничего не перетаскивали или бросили на то же место — ничего не делаем
        if (dragIndex == null || dragIndex === dropIndex ) return;
        

        
        //console.log(result);

        setDragIndex(null);
        
    }


    //функция, которая вызывается при отправке формы (поиске)
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!ticker.trim()) return;

        try {
            setLoading(true); //показываем индикатор загрузки
            setError(''); //очищаем ошибки
            setPrice(null); //сбрасываем предыдущую цену
            //setHistoryCandles([]);

            //пример запроса к бесплатному API CoinGecko для криптовалюты
            const response = await axios.get (
                `https://api.coingecko.com/api/v3/simple/price?ids=${ticker.toLowerCase()}&vs_currencies=usd`
            );


            //проверяем пришли ли данные по тикеру
            const data = response.data;
            if (data && data[ticker.toLowerCase()] && data[ticker.toLowerCase()].usd) {
                setPrice(data[ticker.toLowerCase()].usd); // сохраняем цену
                console.log('price', data[ticker.toLowerCase()].usd);
            } else {
                setError('Тикер не найден');//выводим ошибку
            }

            const historyRes = await axios.get(
                `https://api.coingecko.com/api/v3/coins/${ticker.toLowerCase()}/market_chart?vs_currency=usd&days=${daysPeriod}`
            );

            const formatted = historyRes.data.prices.map(([timestamp, price] : [number, number]) => ({
                date: new Date(timestamp).toLocaleDateString(), price
            }));
            setHistory(formatted);
           

            const ohlcRes = await axios.get( 
                `https://api.coingecko.com/api/v3/coins/${ticker.toLowerCase()}/ohlc?vs_currency=usd&days=${daysPeriod}`
            );

            const formattedCandles = ohlcRes.data.map(([timestamp, open, high, low, close] : [number, number, number, number, number]) => ({
                    date: new Date(timestamp),
                    open,
                    high,
                    low,
                    close
                })
            );
            setHistoryCandles(formattedCandles);
            setMoved(true);
            setSendData(true);


            
        } catch {
            setError('Ошибка при загрузке данных'); //ошибка запроса
        } finally {
            setLoading(false); //скрываем индикатор загрузки
        }

        setPlanetGo(true);
    };


    const handleSetGlowDay = (day: number) => {

        if (day === 7 || day === 14 || day === 30) {
            setGlowDay(day);
        } else {
            setGlowDay(7);
        }
        
    };


    
    // единый обработчик по строке тикера
    const fetchByTicker = async (q: string) => {
        if (!q.trim()) return;
        const id = q.toLowerCase();
    
        try {
        setPlanetGo(true);                 // запускаем полёт/камеру
        setLoading(true);
        setError('');
        setPrice(null);
        setHistory([]);
        setHistoryCandles([]);
        setSendData(false);
    
        // 1) Цена
        const priceRes = await axios.get(
            `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`
        );
        const p = priceRes.data?.[id]?.usd;
        if (typeof p !== 'number') {
            setError('Тикер не найден');
            return;
        }
        setPrice(p);
    
        // 2) История (линейный график)
        const histRes = await axios.get(
            `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${daysPeriod ?? 7}`
        );
        const formatted = histRes.data.prices.map(
            ([timestamp, price]: [number, number]) => ({
            date: new Date(timestamp).toLocaleDateString(),
            price,
            })
        );
        setHistory(formatted);
    
        // 3) Свечи (OHLC)
        const ohlcRes = await axios.get(
            `https://api.coingecko.com/api/v3/coins/${id}/ohlc?vs_currency=usd&days=${daysPeriod ?? 7}`
        );
        const formattedCandles = ohlcRes.data.map(
            ([timestamp, open, high, low, close]: [number, number, number, number, number]) => ({
            date: new Date(timestamp),
            open, high, low, close,
            })
        );
        setHistoryCandles(formattedCandles);
    
        setMoved(true);
        setSendData(true);
        } catch (e) {
        console.error(e);
        setError('Ошибка при загрузке данных');
        } finally {
        setLoading(false);
        }
    };
  
  


    const handleSearchFromTV = async (q: string) => {
        if (!q.trim()) return;
        setTicker(q);          // синхронизация заголовка/ценника
        setPlanetGo(true);     // полет планеты/камера
        await fetchByTicker(q) // твой общий загрузчик (axios + setState)
      };

    return (
        <div className='stars-bg'>

        {/*<div className='error404class absolute top-1/2  border-4 border-yellow-500'>
            <Error404 />
    </div>*/}
        
        <div className='relative w-screen h-sreen '>


        <div className='absolute w-full overflow-hidden right-0 border-green-500 text-white'>

            <div className='relative h-screen w-full'>
                
                    <Planet go={planetGo} />
                    
                        <SearchTV onSubmit={(ticker) => {
                            // твой submit: запросы, запуск анимаций планеты и т.д.
                            handleSearchFromTV(ticker);
                        }} />
                    
                    
            </div>

        </div>


        </div>

        

        <ExchangeRate 
            setCNY = {setCNY}
        />
        <div className=' bg-no-repeat bg-cover bg-center w-screen h-screen'> 
            <div className="stars absolute blur-md bg-black/30 z-0" />
            
            <div className='w-full'>
                <div className='grid justify-center items-center'>
                    
                </div>
            {/*Форма поиска с полем ввода и кнопкой*/}  
            {/*
            <div className='w-full grid justify-center items-center'>
                <motion.h1 
                    initial={{x: "-50%", y: "0", left: "0", top: "0"}}
                    animate={
                        moved ? {top: "10px", left: "20px", x: 0, y: 0, fontSize: "50px"} : {top: "50%", left: "50%", x: "-50%", y: "-80%", fontSize: "150px"}
                    }
                    transition={{duration: 2, ease: "easeOut"}}
                    className='absolute text-xl'
                >

                    <div className='text-white font-bold' style={{textShadow: '2px 2px 6px rgba(0, 0, 0, 0.7)'}}>CryptoSearch{config?.left}{config?.right}</div>

                </motion.h1>
                
            </div>
            */}
            {/*<div className="w-[300px] h-[150px] bg-black opacity-50 arc-top mx-auto mt-10"></div>*/}
            <div className='flex justify-start items-center w-full h-[200px]'>
                
            {/*<form onSubmit={handleSubmit} className='w-full flex justify-center items-center h-[100px]'>

                <input 
                
                    className="fieldOfValues w-[70%] h-[60px] mr-4 pt-2 pb-2 pr-2 pl-2 rounded-xl border-2
                    border-blue-500 bg-transparent bg-gradient-to-r from-[#1a61b6]/30 to-[#4371a7]/30 text-white text-3xl font-bold" type="text" value={ticker} onChange={(e) => setTicker(e.target.value)} 
                    placeholder='Input a ticker (e. bitcoin)'
                />
                <button
                    type="submit"
                    className="relative group inline-flex items-center justify-center px-5 h-12 rounded-xl
                                font-semibold text-white bg-[#1a3a6a] hover:bg-[#20467f] transition-colors
                                shadow-[0_0_20px_rgba(50,140,255,.25)]"
                    >
                    <span className="relative z-10">Search</span>

                    
                    <span className="glow-ring pointer-events-none absolute inset-0 rounded-xl"></span>
                    
                    <span className="glow-outer pointer-events-none absolute -inset-1 rounded-[1.25rem]"></span>
                </button>
            
            </form>*/}
            </div>
            {/* Показываем индикатор загрузки */}
            {loading && <p>Загрузка..</p>} 

            {/* Показываем ошибку, если есть */}
            {error && <p style={{color: 'red'}}>{error}</p>}

            {sendData && config && (
            <div className=' flex justify-end'>
                <div className='w-[80%]'>
                {/* Показываем цену, если есть <PriceChart data={historyCandles} />  : ${price}*/}
                {price !== null && !loading && !error && (
                    <div className='boxWithPrice grid gap-4'>
                        <div className='flex justify-center'>
                            <p className='titleValue pl-10 pr-10 pt-2 pb-2 text-white text-5xl font-bold' style={{textShadow: '2px 2px 6px rgba(0, 0, 0, 0.7)' }}>{ticker.toUpperCase()}</p>
                        </div>
                        <div className='flex justify-center'>
                            <p className='titlePrice m-5 text-white font-bold text-2xl' style={{ boxShadow: `0 0 10px cyan`}}>$ {price}</p>
                        </div>
                    
                    </div>
                )}
                
                <div className='boxWithChart border-4 border-cyan-500 rounded-3xl'>
                    <button style={{color: 'white'}} className='iconCharts rounded-xl ml-2 mt-2 p-2' onClick={handleChangeGraphic}>
                        
                        {showCandles ? <img className="w-5 h-5" src="icon_lineChart.png" /> : <img className="w-5 h-5" src="icon_candleChart.png" /> }
                        
                    </button>
                    <div className='w-full'>
                    {/*<h2 className='text-lg font-semibold mb-2 text-center text-white'>График за 7 дней</h2>   rounded-lg border-2 border-cyan-500 shadow-lg shadow-cyan-500/50*/}
                        <div className='yourChart grid gap-10'>
                            <div className='selectDays flex justify-center gap-4 text-xl text-white'>
                                <button className='' onClick={() => {
                                    handleGetDaysPeriod(7); handleSetGlowDay(7);
                                    }} style={glowDay === 7 ? {boxShadow: `0 0 5px cyan`} : {} }><div className='flex justify-center items-center pt-1 pb-1 pl-3 pr-3'>
                                        
                                        
                                            7D
                                    
                                    </div>
                                </button>
                                <form onSubmit={handleSubmit}>
                                <button className='' onClick={() => {
                                    handleGetDaysPeriod(14); handleSetGlowDay(14);
                                    }} style={glowDay === 14 ? {boxShadow: `0 0 5px cyan`} : {} }><div className='flex justify-center items-center pt-1 pb-1 pl-3 pr-3'>
                                        
                                        
                                            14D
                                    
                                    </div>
                                </button>
                                </form>

                                <button className='' onClick={() => {
                                    handleGetDaysPeriod(30); handleSetGlowDay(30);
                                    }} style={glowDay === 30 ? {boxShadow: `0 0 5px cyan`} : {} }><div className='flex justify-center items-center pt-1 pb-1 pl-3 pr-3'>
                                        
                                        
                                            30D
                                    
                                    </div>
                                </button>
                            </div>
                            <div className='flex justify-center'>
                                {/*<div className='dropPositionLeft w-[10%]  text-white'>
                                    
                                    
                                    left 
                                    <div draggable="true" className='w-full h-[50%] border-4 border-red-500 rounded-full text-white text-2xl font-bold'

                                        onDragStart={() => {
                                            handleDragStart(config.left);
                                            
                                        }}

                                        onDragOver={handleDragOver} 
                                        onDrop={() => handleDrop(config.left)}
                                    
                                    >


                                    </div>
                                    {CNY}

                                </div>*/}
                                <div className='w-full'>
                                {showCandles ? 
                                    <div className='flex justify-center'>
                                        
                                        <Candle data={historyCandles} />
                                        
                                    </div>
                                    :
                                    <div className='flex justify-center items-center'>
                                        <RegularLine data={history} />
                                        
                                    </div>
                                }
                                </div>
                                {/*<div className='dropPositionRight w-[10%] border-4 border-purple-500 text-white'>
                                    
                                    right
                                
                                    <div draggable="true" className='w-full h-[50%] border-4 border-red-500 rounded-full text-white text-2xl font-bold'

                                        onDragStart={() => {
                                            handleDragStart(config.right);
                                        }}
                                        
                                        onDragOver={handleDragOver} 
                                        onDrop={() => handleDrop(config.right)}
                                    
                                    >

                                    </div>
                                
                                </div>*/}
                            </div>
                        </div>
                
                    
                    </div>
                </div>
                </div>
            </div>
            )}
            </div>
        </div>
    </div>
    );
    
};
