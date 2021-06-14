import React, {useEffect, useState} from 'react'
import './BonusItem.css'
import Timer from "./Timer";
// import Timer from "./Timer";
import Slider from "./Slider";

function BonusItem(props: { time: number, active: boolean, done: boolean, percent: number }){
    const [realTime, setTime] = useState<number>(0);
    const myCallback = (dataFromChild: number) => {
        setTime(dataFromChild);
    }
    const [color, setColor] = useState<string>('rgb(160,240,232)');
    useEffect(() => {
        handleColor()
    },)
    const handleColor = (): void => {
        const diff = realTime-props.time
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
        <div className="bottom-panel" style = {{
            height: props.percent+'%', display: props.time <1 ?'none':''}}>
            <Slider start={props.active} time = {props.time}/>
            <div className={(realTime<props.time) ? "Bonus-text": "Bonus-reverse"}
                 style = {{
                     animationDuration: props.time+'s',
                     // height: props.percent+'%',
                     height: '100%',
                     animationPlayState: props.active? 'running':'paused',
                     background: props.done ? color:'',
                     textDecoration: props.done ? 'grey line-through' : 'none',}}>
                <div className="bonus" style={{textIndent: props.time < 3 ? '-9999px':'',
                    background: !props.active && !props.done? 'rgb(245, 245, 245)': '',}}> Bonus Time </div>
                <div className="bonus-time" style = {{
                    textIndent: props.time < 3 ? '300%':'',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    color: "grey", textDecoration: props.done? 'grey line-through':'none',
                    background: !props.active && !props.done? 'rgb(245, 245, 245)': '',}}>
                <div className="set-time">
                    {props.time} min</div>
                <Timer callbackFromParent={myCallback} active = {props.active} done = {props.done} />
            </div>
        </div>
        </div>
        )}


export default BonusItem