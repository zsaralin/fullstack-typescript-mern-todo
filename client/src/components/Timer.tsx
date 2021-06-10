import React from 'react'
import { useState, useEffect } from 'react';


const Timer = (props:{ initialMinute: number, active: boolean, done: boolean
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
        <div className="timer" style={{fontSize: "17px"}}>
            {props.active || props.done ? <div> {Math.floor(seconds/*/60*/)} min </div> : <div> - min </div>
            }
        </div>
    )
    }


export default Timer;