import React from 'react'
import { useState, useEffect } from 'react';

const MyTimer = (props:{ active: boolean, done: boolean,
    callbackFromParent(listInfo: number): void
    // callbackFromParentMil(listInfo: number): void;
}) => {
    const [time, setTime] = useState(0);
    // const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        let myInterval: any = null;
        props.callbackFromParent(time);
        if (props.active) {
            myInterval = setInterval(() => {
                setTime((time) => time + 50);
                // props.callbackFromParent(time);
            }, 36.65);
        } else {
            clearInterval(myInterval);
        }
        return () => {
            clearInterval(myInterval);
        };
    });
    return (
        <div className="timer" style={{
            fontSize: "10px", marginTop: '-2%',
        }}>
            {props.active || props.done ? <div> {Math.floor(time / 1000)} min
                </div> :
                <div> - min </div>
            }
        </div>
    );
}

export default MyTimer;