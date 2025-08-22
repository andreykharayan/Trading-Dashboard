import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import './index.css';
import { RegularLine, Candle } from './PriceChart';
//import { CandleData } from './types';
import Planet from './components/Planet';



//компонент для поиска цены по тикету

export const SearchTicker: React.FC = () => {
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

    const handleChangeGraphic = () => {
        setShowCandeles(prev => !prev);
    }

    const handleGetDaysPeriod = (days :number) => {
        setDaysPeriod(days);
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

            {/*const formattedCandles = ohlcRes.data.map([timestamp, open, high, low, close])
*/}
        } catch {
            setError('Ошибка при загрузке данных'); //ошибка запроса
        } finally {
            setLoading(false); //скрываем индикатор загрузки
        }

        
    };

    return (
        <div className='stars-bg'>
        
        <div className=' bg-no-repeat bg-cover bg-center w-screen h-screen'> 
            <div className="stars absolute blur-md bg-black/30 z-0" />
            
            <div className='w-full'>
                <Planet />
            {/*Форма поиска с полем ввода и кнопкой*/}  
            
            <div className='w-full grid justify-center items-center'>
                
                <div className='text-white text-8xl font-bold' style={{textShadow: '2px 2px 6px rgba(0, 0, 0, 0.7)'}}>CryptoSearch</div>
                {/*<div className="w-[300px] h-[150px] bg-black opacity-50 arc-top mx-auto mt-10"></div>*/}
            </div>
            <div className='flex justify-center items-center w-full h-[200px]'>
                
            <form onSubmit={handleSubmit} className='w-full flex justify-center items-center h-[100px]'>

                <input 
                
                    className="fieldOfValues w-[70%] h-[60px] mr-4 pt-2 pb-2 pr-2 pl-2 rounded-xl border-2
                    border-blue-500 bg-transparent bg-gradient-to-r from-[#1a61b6]/30 to-[#4371a7]/30 text-white text-3xl font-bold" type="text" value={ticker} onChange={(e) => setTicker(e.target.value)} 
                    placeholder='Input a ticker (e. bitcoin)'
                />
                <button type="submit" className='h-[60px] w-[100px] border-2 border-blue-500 border-opacity-70 
                bg-gradient-to-r from-[#4371a7] via-[#1a61b6] to-[#4371a7] hover:bg-700 text-white 
                text-xl font-bold py-2 px-4 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300'>Search</button>
            
            </form>
            </div>
            {/* Показываем индикатор загрузки */}
            {loading && <p>Загрузка..</p>} 

            {/* Показываем ошибку, если есть */}
            {error && <p style={{color: 'red'}}>{error}</p>}
            <div className='border-4 border-red-500'>
                {/* Показываем цену, если есть <PriceChart data={historyCandles} />  : ${price}*/}
                {price !== null && !loading && !error && (
                    <div className='flex justify-center items-center'>
                    <p className='titleValue pl-10 pr-10 pt-5 pb-5 text-white text-5xl font-bold' style={{textShadow: '2px 2px 6px rgba(0, 0, 0, 0.7)' }}>{ticker.toUpperCase()}</p>
                    </div>
                )}
                
                <div className=''>
                    <button style={{color: 'white'}} className='iconCharts rounded-xl p-2' onClick={handleChangeGraphic}>
                        
                        {showCandles ? <img className="w-5 h-5" src="icon_lineChart.png" /> : <img className="w-5 h-5" src="icon_candleChart.png" /> }
                        
                    </button>
                    <div className='w-full'>
                    {/*<h2 className='text-lg font-semibold mb-2 text-center text-white'>График за 7 дней</h2>*/}
                        <div className='grid'>
                            <div className='flex justify-end border-4 border-white bg-blue-500 text-white'>
                                <button className='' onClick={() => {
                                    handleGetDaysPeriod(7);
                                    }}>7d
                                </button>
                                <form onSubmit={handleSubmit}>
                                <button type="submit" className='' onClick={() => {
                                    handleGetDaysPeriod(14);
                                    }}>14d
                                </button>
                                </form>

                                <button className='' onClick={() => {
                                    handleGetDaysPeriod(30);
                                    }}>30d
                                </button>
                            </div>
                            <div className='border-4 border-green-500 '>
                                {showCandles ? 
                                    <div className='flex justify-center h-full w-full '>
                                        
                                        <Candle data={historyCandles} />
                                        
                                    </div>
                                    :
                                    <div className='flex justify-center items-center'>
                                        <RegularLine data={history} />
                                        
                                    </div>
                                }
                            </div>
                        </div>
                
                    
                    </div>
                </div>
            </div>
            </div>
        </div>
    </div>
    );
    
};