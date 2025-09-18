import React, {useEffect, useState} from "react";
import '../index.css';

export default function Error404() {

    return (

        <>
        <div className="flex">


            <div className="spaceDude ">


                <img className="spaceDudeImg" src="spaceDude.png" alt="spaceDude" />


            </div>

        
            <div className="error404text w-full h-1/2 flex text-white">
            
                <div className="numbers grid">

                    <div className="flex justify-end">

                        <div className="four grid">

                            4
                            

                        </div>
                                
                        <div className="zero">

                            0
                        </div>

                        <div className="four">

                            4
                        </div>

                    </div>

                    <div className="flex justify-center mr-5">

                        <div className="four opacity-30">

                            4

                        </div>
                                
                        <div className="zero opacity-30">

                            0
                        </div>

                        <div className="four opacity-30">

                            4
                        </div>

                    </div>

                    <div className="flex justify-center mr-10">

                        <div className="four opacity-10">

                            4

                        </div>
                                
                        <div className="zero opacity-10">

                            0
                        </div>

                        <div className="four opacity-10">

                            4
                        </div>

                    </div>

                </div>
                

           



            </div>
        
        </div>
        </>

    );


}