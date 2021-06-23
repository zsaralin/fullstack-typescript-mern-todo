import React, {useEffect, useState} from 'react'
import './BonusItem.css'
import Timer from "./Timer";
// import Timer from "./Timer";
import Slider from "./Slider";

function BonusItem(props: { origBonus: number, time: number, active: boolean, done: boolean, percent: number }){
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
                <div className="bonus" style={{textIndent: props.percent < 6.25 ? '-9999px':'',
                    background: !props.active && !props.done? 'rgb(245, 245, 245)': '',}}>Bonus Time</div>
                <div className="bonus-time" style = {{
                    display: props.percent < 6.25 ? 'none':'',
                    overflow: 'hidden',
                    color: "grey", textDecoration: props.done? 'grey line-through':'none',
                    background: !props.active && !props.done? 'rgb(245, 245, 245)': '',}}>
                <div className="set-bonus">
                    {props.origBonus !== Math.ceil(props.time)  ?
                        <span style={{display: 'inline'}}>
                                        <span className="crossedOut"
                                              style={{color: 'grey', opacity: '70%',display: 'inline', marginRight: '4px'}}>
                                            {props.origBonus}</span>
                                            <span> {Math.ceil(props.time)}</span>
                                        </span>:props.origBonus} min
                <Timer callbackFromParent={myCallback} active = {props.active} done = {props.done}
                startTime = {props.time}/>
            </div>
        </div>
        </div>
        </div>
        )}


export default BonusItem