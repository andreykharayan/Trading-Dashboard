import React from "react";
import axios from 'axios';
import { useEffect, useState, useMemo, useRef } from "react";


import '../index.css';
import { data } from "framer-motion/client";

type Rates = {
    amount?: number,
    base: string,
    date?: string,
    rates: Record<string, number>
}



const ExchangeRate: React.FC = ({setCNY}) => {

    let CountriesRates = new Map<string, number>();
    const [database, setDatabase] = useState<Rates | null>(null);
    const [current, setCurrent] = useState<string | null>(null);

    type Codes = "China" | "EU" | "UK" | "Canada";

    const countries: Record<Codes, string> = {
        "China" : "CNY",
        "EU" : "EUR",
        "UK" : "GBP",
        "Canada" : "CAD"
    }

   
    
    useEffect(() => {
        //https://api.frankfurter.app/latest?from=USD&to=CNY
        (async () => {
            const entries = Object.entries(countries);
            const results = await Promise.all(`https://api.frankfurter.app/latest?from=USD&to=CNY`);
        });
        
    }, []);
    
    return null;

}
export default ExchangeRate;