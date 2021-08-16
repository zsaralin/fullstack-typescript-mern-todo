import React, {useState} from 'react'
import './BonusItem.css'
import Timer from "./Timer";
import Slider from "./Slider";

function BonusItem(props: { origBonus: number, time: number, active: boolean, done: boolean, percent: number }) {
    const [realTime, setTime] = useState<number>(0);

    const myCallback = (time: number) => {
        setTime(time);
    }

    //returns color to indicate how much of the designated bonus time was used
    function getColor() {
        const diff = realTime - props.time
        if (diff > 4) { //overtime
            return 'rgb(255,125,255)';
        } else if (diff > 1) { //slightly overtime
            return 'rgb(255,202,255)';
        } else { //undertime
            return 'rgb(160,240,232)';
        }
    }

    function backgroundColor(){
        if(props.done){
            return getColor();
        } else if(!props.done && !props.active){
            return 'rgb(245, 245, 245)'
        }
    }

    return (
        <div className="bottomPanel" style={{
            height: props.percent + '%'
        }}>
            <Slider start={props.active} time={props.time}/>
            <div className={(realTime < props.time) ? "bonusForward bonusWrap" : "bonusReverse bonusWrap"}
                 style={{
                     animationDuration: props.time + 'ms',
                     animationPlayState: props.active ? 'running' : 'paused',
                     background: backgroundColor(),
                     textDecoration: props.done ? 'grey line-through' : 'none',
                 }}>
                <div className="bonus" style={{
                    // background: !props.active && !props.done ? 'rgb(245, 245, 245)' : '',
                }}>Bonus Time
                </div>
                <div className="bonusTime" style={{
                    display: props.percent < 6.25 ? 'none' : '',
                    textDecoration: props.done ? 'grey line-through' : 'none',
                    // background: !props.active && !props.done ? 'rgb(245, 245, 245)' : '',
                }}>
                    <div className="setBonus">
                        {Math.ceil(props.origBonus / 1000) !== Math.ceil(props.time / 1000) ?
                            <span style={{display: 'inline'}}>
                                        <span className="crossedOut">
                                            {Math.ceil(props.origBonus / 1000)}</span>
                                            <span> {Math.ceil(props.time / 1000)}</span>
                                        </span> : Math.ceil(props.origBonus / 1000)} min
                        <Timer callbackFromParent={myCallback} active={props.active} done={props.done}/>
                    </div>
                </div>
            </div>
        </div>
    )
}


export default BonusItem