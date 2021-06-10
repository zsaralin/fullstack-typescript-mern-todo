import React, {useEffect, useState} from 'react'
import { Draggable } from 'react-beautiful-dnd'
import {getLongestName, getSize,} from "../API";
import './TodoItem.css'
import Timer from "./Timer";
import Slider from "./Slider";

// type Props = TodoProps & {
//     index: number
//     active: boolean
//     done: boolean
//     percent: number
//     callbackFromParent(listInfo:number): void
// }
const Todo = (props:{ percent:number, todo: ITodo, active:boolean, done:boolean, index:number
    callbackFromParent2(listInfo: number): void;}) => {
    const [realTime, setTime] = useState<number>(0);
    // const minuteTime = Math.floor(realTime/60);
    const minuteTime = realTime;
    let totalOver = minuteTime-props.todo.time > 0 ?minuteTime-props.todo.time: 0 ;
    const timeCallback = (timerTime: number) => {
        setTime(timerTime);
    }
    const someFn = () => {
        props.callbackFromParent2(realTime);
    }
    useEffect(() => {
        someFn()
    },)
    const [longest, setLong] = useState<number>(0);
    const [, setSize] = useState<number>(0);
    const [color, setColor] = useState<string>('rgb(198,246,241)');
    useEffect(() => {
        handleColor()
        handleLongest()
        handleSize()
    },)
    const handleColor = (): void => {
        const diff = minuteTime - props.todo.time
        if (Math.abs(diff) <= 1) {
            setColor('rgb(198,246,241)');
        } else if (diff > 4) {
            setColor('rgb(255,125,255)');
        } else if (diff > 1) {
            setColor('rgb(255,202,255)');
        }
    }
    const handleLongest = (): void => {
        getLongestName()
            .then(({data: {longest}}: number | any) => setLong(longest))
            .catch((err: Error) => console.log(err))
    }
    const handleSize = (): void => {
        getSize()
            .then(({data: {sizeArr}}: number | any) => setSize(sizeArr))
            .catch((err: Error) => console.log(err))
    }
    useEffect(() => {
        handleOvertime()
    });
    function handleOvertime(){
        totalOver = minuteTime - props.todo.time;
    }
    return (
            <Draggable draggableId={props.todo._id} index={props.index} isDragDisabled={props.done || props.active} >
                {provided => {
                    const style = {
                        // height: (minuteTime < todo.time) ? (todo.time/sizeArr)*100+ '%':((todo.time+totalOver)/(sizeArr))*100+ '%',
                        height: props.todo.time < 2? '4%':props.percent + '%',
                        textDecoration: props.done ? 'line-through' : 'none',
                        color: props.done? 'grey':'',
                        ...provided.draggableProps.style,
                    };
                    return (
                    <div className="Card" ref={provided.innerRef}
                         {...provided.draggableProps}
                         {...provided.dragHandleProps} style = {style}>
                        <Slider start={props.active} time={(minuteTime < props.todo.time) ? props.todo.time : 0}/>
                        <div className={(minuteTime < props.todo.time) ? "Card--text" : "Card--reverse"}
                             style={{
                                 animationDuration: props.todo.time/**60*/ + 's',
                                 animationPlayState: props.active ? 'running' : 'paused',
                                 backgroundColor: !props.active && !props.done ? 'rgb(245, 245, 245)' : '',
                                 // backgroundPosition: (minuteTime<todo.time) && active ? '0% 100%': '100% 0%',
                                 // textDecoration: done ? 'line-through' : 'none',
                             }}>
                            <div className='name'
                                 style={{
                                     width: 50 + 7 * longest + "px", backgroundColor: props.done ? color : '',
                                     background: !props.active && !props.done ? 'rgba(240, 240, 240,1)' : '',
                                 }}>
                                {props.todo.name} </div>
                            <div className='description' style={{
                                // paddingBottom: (minuteTime < todo.time) ? (todo.time/sizeArr)+ '%' : todo.time / (sizeArr/2) + (realTime/*/60*/ - todo.time) + '%',
                                backgroundColor: props.done ? 'rgba(240, 240, 240, 1)' : '',
                                background: !props.active && !props.done ? 'rgb(230, 230, 230)' : '',
                            }}>{props.todo.description} </div>
                            <div className="time" style={{backgroundColor: props.done ? 'rgba(240, 240, 240, 1)' : ''}}>
                                <div className="set-time" >
                                    {props.todo.time} {totalOver} min
                                </div>
                                <Timer callbackFromParent={timeCallback} initialMinute={props.todo.time} active={props.active}
                                       done={props.done}/>
                            </div>
                        </div>
                    </div>

                )}}
            </Draggable>
    )
}
export default Todo
