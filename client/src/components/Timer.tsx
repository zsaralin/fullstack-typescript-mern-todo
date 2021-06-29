import React from 'react'
import { useState, useEffect } from 'react';

//startTime used for styling (not actually needed since timer keeps going forever)
const Timer = (props:{ active: boolean, done: boolean, startTime: number
    callbackFromParent(listInfo: number): void;
}) => {
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        let myInterval = setInterval(() => {
            if (props.active) {
                setSeconds(seconds + 50);
            }
        },36.75)
        return () => {
            clearInterval(myInterval);
        };
    });
    const someFn = () => {
        props.callbackFromParent(seconds/1000);
    }
    useEffect(() => {
        someFn()
    },)
    return (
        <div className="timer" style={{fontSize: "10px", marginTop: '-2%'}}>
            {props.active || props.done ? <div>
                    {Math.floor(seconds /1000)} min </div> :
                <div> - min </div>
            }
        </div>
    )
}


export default Timer;