import React, {useEffect, useState} from 'react'
import {Draggable} from 'react-beautiful-dnd'
import {getLongestName,} from "../API";
import './TodoItem.css'
import Timer from "./Timer";
import Slider from "./Slider";

const Todo = (props: {
    percent: number, todo: ITodo, active: boolean, done: boolean, index: number, bonusTime: number,
    callbackFromParent2(listInfo: number): void;
}) => {
    const [realTime, setTime] = useState<number>(0);
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
    const [color, setColor] = useState<string>('rgb(198,246,241)');

    useEffect(() => {
        handleLongest()
    },)
    useEffect(() => {
        if (props.active) {
            handleColor();
        }
    })
    const handleColor = (): void => {
        const diff = realTime - props.todo.time
        if (realTime <= props.todo.time+1000) {
            setColor('rgb(198,246,241)');
        } else if (props.bonusTime > 0) {
            if (diff > 4) {
                setColor('rgb(254,188,254)');
            }
            if (diff > 1) {
                setColor('rgb(255,202,255)');
            }
        } else if (props.bonusTime < 1) {
            setColor('rgb(252,190,236)');
        }
    }
    const handleLongest = (): void => {
        getLongestName()
            .then(({data: {longest}}: number | any) => setLong(longest))
            .catch((err: Error) => console.log(err))
    }
    let reducedTime =props.todo.time - props.todo.extra
    return (
        <Draggable draggableId={props.todo._id} index={props.index} isDragDisabled={props.done || props.active}>
            {provided => {
                const style = {
                    height: props.percent + '%',
                    color: props.done ? 'grey' : '',
                    ...provided.draggableProps.style,

                };
                return (
                    <div className="Card" ref={provided.innerRef}
                         {...provided.draggableProps}
                         {...provided.dragHandleProps} style={style}>
                        <Slider start={props.active} time={(realTime < reducedTime) ?
                            reducedTime : 0}/>
                        <div
                            className={(realTime < props.todo.time) ? "Card--text" : props.bonusTime > 0 ?
                                "Card--reverse" : "Card--reverse2"}
                            style={{
                                animationPlayState: props.active ? 'running' : 'paused',
                                animationDuration: reducedTime + 'ms, .5s',
                            }}>
                            <div className='name'
                                 style={{
                                     textDecoration: props.done ? 'line-through' : 'none',
                                     width: 50 + 5 * longest + "px", backgroundColor: props.done ? color : '',
                                     background: !props.active && !props.done ? 'rgba(240, 240, 240,1)' : '',
                                 }}>
                                {props.todo.name}</div>
                            <div className='description' style={{
                                textDecoration: props.done ? 'line-through' : 'none',
                                backgroundColor: props.done ? 'rgba(240, 240, 240, 1)' : '',
                                background: !props.active && !props.done ? 'rgb(230, 230, 230)' : '',
                            }}>{props.todo.description}</div>
                            <div className="time" style={{
                                backgroundColor: props.done && !props.active ? 'rgba(240, 240, 240, 1)' : '',
                                background: !props.active && !props.done ? 'rgb(230, 230, 230)' : '',
                            }}>
                                <div className="set-time">
                                    {Math.ceil(props.todo.time/1000) < Math.ceil(props.todo.initTime/1000) ?
                                        <span style={{display: 'inline'}}>
                                        <span className="crossedOut"
                                              style={{
                                                  color: 'grey',
                                                  opacity: '70%',
                                                  display: 'inline',
                                                  marginRight: '4px'
                                              }}>
                                            {Math.ceil(props.todo.initTime/1000)}</span>
                                            <span> {Math.ceil(props.todo.time/1000)}</span>
                                        </span> : props.active ? Math.ceil(reducedTime/1000)
                                            : Math.ceil(props.todo.initTime/1000 )} min
                                </div>
                                <Timer callbackFromParent={timeCallback} startTime={reducedTime}
                                       active={props.active}
                                       done={props.done}/>
                            </div>
                        </div>
                    </div>

                )
            }}
        </Draggable>
    )
}
export default Todo
