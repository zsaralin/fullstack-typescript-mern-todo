import React, {useEffect, useState} from 'react'
import {Draggable} from 'react-beautiful-dnd'
import './TodoItem.css'
import Timer from "./Timer";
import Slider from "./Slider";
import {FaRegTrashAlt} from "react-icons/fa";

const Todo = (props: {
    admin: boolean, percent: number, todo: ITodo, active: boolean, done: boolean, index: number, bonusTime: number, longestName :number,
    callbackFromParent2(listInfo: number): void, deleteTodoApp: (_id: string, index:number) => void
}) => {

    const [realTime, setTime] = useState<number>(0);
    const timeCallback = (timerTime: number) => {
        setTime(timerTime);
    }

    useEffect(() => {
        const sendTimeParent = props.callbackFromParent2
        sendTimeParent(realTime);
    }, [realTime, props.callbackFromParent2])

    //returns color to indicate how much of the designated time was used
    function getColor(){
        const diff = realTime-props.todo.time
        //less than or equal to designated time + 1 minute
        if (realTime <= props.todo.time + 1000) {
            return 'rgb(198,246,241)';
        } else if (props.bonusTime > 0) {
            if (diff > 4) { //overtime
                return 'rgb(254,188,254)';
            }
            if (diff > 1) { //slightly overtime
                return 'rgb(255,202,255)';
            }
            //overtime and no more bonus time (cutting into people's time)
        } else if (props.bonusTime < 1) {
            return 'rgb(252,190,236)';
        }
    }

    let reducedTime = props.todo.time - props.todo.extra
    return (
        <Draggable draggableId={props.todo._id} index={props.index} isDragDisabled={props.done || props.active|| !props.admin}>
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
                                     width: 60 + 9 * props.longestName + "px",
                                     backgroundColor: props.done ? getColor() : !props.active ? 'rgba(240, 240, 240,1)' : '',
                                     textIndent: !props.admin?'17.5%':'',
                                 }}>
                                <button className="trashWrapper" disabled={props.active || props.done}
                                        style={{display: !props.admin? 'none':'',cursor: !props.active && !props.done ? 'pointer' : 'default'}}
                                        onClick={() => props.deleteTodoApp(props.todo._id, props.index)}
                                ><FaRegTrashAlt className="trashcan"/>
                                </button>
                                {props.todo.name}
                            </div>
                            <div className='description' style={{
                                textDecoration: props.done ? 'line-through' : 'none',
                                backgroundColor: props.done ? 'rgba(240, 240, 240, 1)' : !props.active ? 'rgb(230, 230, 230)' : '',
                            }}>{props.todo.description}
                            </div>
                            <div className="time" style={{
                                backgroundColor: props.done ? 'rgba(240, 240, 240, 1)' : !props.active ? 'rgb(230, 230, 230)' : '',
                            }}>
                                <div className="set-time">
                                    {Math.ceil(props.todo.time / 1000) < Math.ceil(props.todo.initTime / 1000) ?
                                        <span style={{display: 'inline'}}>
                                        <span className="crossedOut"
                                        >
                                            {Math.ceil(props.todo.initTime / 1000)}</span>
                                            <span> {Math.ceil(props.todo.time / 1000)}</span>
                                        </span> : props.active ? Math.ceil(reducedTime / 1000)
                                            : Math.ceil(props.todo.initTime / 1000)} min
                                </div>
                                <Timer callbackFromParent={timeCallback}
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
