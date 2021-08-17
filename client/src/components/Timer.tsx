import React from 'react'
import { useState, useEffect } from 'react';

const Timer = (props:{ active: boolean, done: boolean,
    callbackFromParent(listInfo: number): void;
}) => {
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        let myInterval: any = null;

        //send time from Timer to other components
        props.callbackFromParent(seconds);
        if (props.active) {
            myInterval = setInterval(() => {
                setSeconds((seconds) => seconds + 100);
            }, 80);
        }
        return () => {
            clearInterval(myInterval);
        };
    });
    return (
        <div className="timer" style={{fontSize: "10px", marginTop: '-2%'}}>
            {props.active || props.done ? <div>
                    {Math.floor(seconds / 1000)} min </div> : //timer is active
                <div> - min </div> //timer is inactive (presenter is not presenting)
            }
        </div>
    )
}

export default Timer;