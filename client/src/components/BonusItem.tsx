import React, {useEffect, useState} from 'react'
import './BonusItem.css'
import Timer from "./Timer";
// import Timer from "./Timer";
import Slider from "./Slider";

function BonusItem(props: { active: boolean, done: boolean }){
    let fixedTime = 8;
    const [realTime, setTime] = useState<number>(0);
    const myCallback = (dataFromChild: number) => {
        setTime(dataFromChild);
    }
    const [color, setColor] = useState<string>('rgb(160,240,232)');
    useEffect(() => {
        handleColor()
    },)
    const handleColor = (): void => {
        const diff = realTime-fixedTime
        if(Math.abs(diff) <= 1){
            setColor('rgb(160,240,232)');
        }
        else if(diff > 4){
            setColor('rgb(255,125,255)');
        }
        else if(diff > 1){
            setColor('rgb(255,202,255)');
        }

    }
        return(
        <div className="bottom-panel" >
            <Slider start={props.active} time = {fixedTime}/>
            <div className={(realTime<fixedTime) ? "Bonus-text": "Bonus-reverse"}
                 style = {{
                     transitionDuration: (realTime<fixedTime) && props.active?
                     (fixedTime-realTime) +'s' : fixedTime+'s',
                     backgroundPosition: (realTime<fixedTime) && props.active ? '0% 100%': '100% 0%',
                     background: props.done? color:'',
                     textDecoration: props.done ? 'grey line-through' : 'none',}}>
            <div className="bonus" style={{height:fixedTime/3 + '%',
             }}> Bonus Time </div>
            <div className="bonus-time" style = {{color: "grey", textDecoration: props.done? 'grey line-through':'none',
                }}>
                <div className="set-time" >
                    {fixedTime} min</div>
                <Timer callbackFromParent={myCallback} initialMinute = {fixedTime} active = {props.active} done = {props.done} />
            </div>
        </div>
        </div>
        )}


export default BonusItem