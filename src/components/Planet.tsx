import { useEffect, useState } from "react";
import '../index.css';
import { isHover } from "react-financial-charts";
import {motion} from "framer-motion";

const Planet = () => {
    const [visible, setVisible] = useState(false);
    const [hover, setHover] = useState(false);
    const [returning, setReturning] = useState(false);

    useEffect(() => { 
        const timer = setTimeout(() => setVisible(true), 2000);
        return () => clearTimeout(timer);
    }, []);


    const handleMouseEnter = () => {
        setHover(true);
        setReturning(false);
    }

    const handleMouseLeave = () => {
        setHover(false);
        setReturning(false);
        setTimeout(() => {
            setReturning(true);
        }, 3000)
    }

    return (

        /*<div className={`ufoMove transition-opacity duration-1000 ${
            visible ? "opacity-100" : "opacity-0" }`}>*/
        <div> 
        
            <motion.div onMouseEnter= {() => handleMouseEnter()} onMouseLeave={() => handleMouseLeave()}
            
                animate={hover ? {y: -600} : returning ?  {y: [0, -20, -50, 0]} : {}}
                transition={{duration: hover ? 1 : 1.5, ease: "easeInOut"}}
            
            >

            <img src="/ufo.png" alt="Planet" className="w-48 h-48 mx-auto" />

            
            </motion.div>
        </div>
    );
};

export default Planet;