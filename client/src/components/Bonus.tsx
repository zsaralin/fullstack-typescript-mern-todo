import React, {useState} from 'react'
import './cssFiles/Bonus.css'
import Timer from "./Timer";
import Slider from "./Slider";
import './cssFiles/DiagonalCrossOut.css'

function Bonus(props: { origBonus: number, time: number, active: boolean, done: boolean, height: number }) {
    const [realTime, setTime] = useState<number>(0);
    const origBonus = Math.ceil(props.origBonus/1000)
    const time = Math.ceil(props.time/1000)

    //set time using time from Timer class
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

    //returns background color of bonus time
    function backgroundColor(){
        if(props.done){
            return getColor();
        } else if(!props.done && !props.active){
            return 'rgb(245, 245, 245)'
        }
    }


    return (
        <div className="bottomPanel" style={{
            height: props.height + '%',
            display: props.height < 6.25 ? 'none' : '',
        }}>
            <Slider start={props.active} time={props.time}/>
            <div className={(realTime < props.time) ? "bonusForward bonusWrap" : "bonusReverse bonusWrap"}
                 style={{
                     animationDuration: props.time + 'ms',
                     animationPlayState: props.active ? 'running' : 'paused',
                     background: backgroundColor(),
                     textDecoration: props.done ? 'grey line-through' : 'none',
                 }}>
                <div className="bonus">Bonus Time</div>
                <div className="bonusTime" style={{
                    display: props.height < 6.25 ? 'none' : '',
                    textDecoration: props.done ? 'grey line-through' : 'none'}}>
                    <div className="setBonus">
                        {origBonus !== time ?
                            <span style={{display: 'inline'}}>
                                        <span className="crossedOut"> {origBonus}</span>
                                            <span> {time}</span>
                                        </span> : origBonus} min
                        <Timer callbackFromParent={myCallback} active={props.active} done={props.done}/>
                    </div>
                </div>
            </div>
        </div>
    )
}


export default Bonus