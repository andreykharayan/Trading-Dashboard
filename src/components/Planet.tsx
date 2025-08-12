import { useEffect, useState } from "react";

const Planet = () => {
    const [visible, setVisible] = useState(false);
    const [hover, setHover] = useState(false);
    useEffect(() => { 
        const timer = setTimeout(() => setVisible(true), 2000);
        return () => clearTimeout(timer);
    }, []);

    return (

        /*<div className={`ufoMove transition-opacity duration-1000 ${
            visible ? "opacity-100" : "opacity-0" }`}>*/
        <div onMouseLeave={() => setHover(false)} onMouseEnter= {() => (setHover(true))} >
            <div 
                
            className={` ${ !hover ? "animation-UpDown" : "ufoMove"}`} >

            <img src="/ufo.png" alt="Planet" className="w-48 h-48 mx-auto" />


            </div>
        </div>
    );
};

export default Planet;