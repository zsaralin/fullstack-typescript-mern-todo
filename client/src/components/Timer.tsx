import React from 'react'
import { useState, useEffect } from 'react';

const Timer = (props:{ active: boolean, done: boolean, debug: boolean,
    callbackFromParent(listInfo: number): void;
}) => {
    const [seconds, setSeconds] = useState(0);
    let inc = props.debug ? 100:1; //increment value
    let ms = props.debug ? 80: 1000;
    let div = props.debug ? 1000: 60;
    useEffect(() => {
        let myInterval: any = null;

        //send time from Timer to other components
        props.callbackFromParent(seconds);
        if (props.active) {
            myInterval = setInterval(() => {
                setSeconds((seconds) => seconds + inc);
            }, ms);
        }
        return () => {
            clearInterval(myInterval);
        };
    });
    return (
        <div className="timer" style={{fontSize: "10px", marginTop: '-2%'}}>
            {props.active || props.done ? <div>
                    {Math.floor(seconds / div)} min </div> : //timer is active
                <div> - min </div> //timer is inactive (presenter is not presenting)
            }
        </div>
    )
}

export default Timer;