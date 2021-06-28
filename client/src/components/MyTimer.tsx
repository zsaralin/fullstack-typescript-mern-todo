import React from 'react'
import { useState, useEffect } from 'react';
// import Timer from "react-compound-timer";

const MyTimer = (props:{ active: boolean, done: boolean,
    callbackFromParent(listInfo: number): void
    // callbackFromParentMil(listInfo: number): void;
}) => {
    const [seconds, setSeconds] = useState(0);
    // const [milSeconds, setMilSeconds] = useState(0);

    useEffect(() => {
        let secondInterval = setInterval(() => {
            if (props.active) {
                setSeconds(seconds + 1)
            }
        }, 1000)
        return () => {
            clearInterval(secondInterval);
            // clearInterval(milInterval);
        };
    });
    // useEffect(() => {
    //     let milInterval = setInterval(() => {
    //         if (props.active) {
    //             setMilSeconds(milSeconds + 1)
    //             if (milSeconds == 100) {
    //                 setSeconds(seconds + 1)
    //                 setMilSeconds(0)
    //             }
    //         }
    //     }, 10)
    //     return () => {
    //         clearInterval(milInterval);
    //     };
    // });
    const sendSeconds = () => {
        props.callbackFromParent(seconds);
    }
    useEffect(() => {
        sendSeconds()
    },)
    // const sendMilSecond = () => {
    //     props.callbackFromParentM(milSeconds);
    // }
    // useEffect(() => {
    //     sendMilSecond()
    // },)
    return (
        <div className="timer" style={{fontSize: "10px", marginTop: '-2%'}}>
            {props.active || props.done ? <div> {seconds} min
                    {/*<Timer start = {props.active}>*/}
                    {/*        <React.Fragment>*/}
                    {/*            <div>*/}
                    {/*    <Timer.Seconds/> min*/}
                    {/*            </div></React.Fragment>*/}
                    {/*</Timer>*/}
                </div> :
                <div> - min </div>
            }
        </div>
    )
}

export default MyTimer;