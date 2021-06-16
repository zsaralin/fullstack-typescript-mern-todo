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
                setSeconds(seconds + 1);
            }
        }, 1000)
        return () => {
            clearInterval(myInterval);
        };
    });
    const someFn = () => {
        props.callbackFromParent(seconds);
    }
    useEffect(() => {
        someFn()
    },)
    return (
        //timer disappears when reducedTime < 4
        <div className="timer" style={{fontSize: "12px",}}>
            {props.active || props.done ? <div
                    style={{
                        display: props.done && Math.floor(seconds / 60) < 4 ||
                        props.startTime < 4 ? 'none' : '',
                    }}>
                    {Math.floor(seconds / 60)} min </div> :
                <div style={{display: props.startTime < 4 ? 'none' : ''}}> - min </div>
            }
        </div>
    )
}


export default Timer;