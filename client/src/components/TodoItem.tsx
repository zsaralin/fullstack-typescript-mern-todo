import React, {useEffect, useState} from 'react'
import { Draggable } from 'react-beautiful-dnd'
import {getLongestName, getSize,} from "../API";
import './TodoItem.css'
import Timer from "./Timer";
import Slider from "./Slider";

type Props = TodoProps & {
    updateTodo: (todo: ITodo) => void
    deleteTodo: (_id: string) => void
    index: number
    active: boolean
    done: boolean
    callbackFromParent(listInfo: number): void;
}
const Todo: React.FC<Props> = ({ todo, active, done, index ,callbackFromParent}) => {
    const overtimeFn = () => {
        callbackFromParent(todo.overtime);
    }
    useEffect(() => {
        overtimeFn()
    },)
    const [realTime, setTime] = useState<number>(0);
    // const minuteTime = Math.floor(realTime/60);
    const minuteTime = realTime;
    const timeCallback = (timerTime: number) => {
        setTime(timerTime);
    }
    const [longest, setLong] = useState<number>(0);
    const [sizeArr, setSize] = useState<number>(0);
    const [color, setColor] = useState<string>('rgb(198,246,241)');
    useEffect(() => {
        handleColor()
        handleLongest()
        handleSize()
    },)
    const handleColor = (): void => {
        const diff = minuteTime - todo.time
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
        setTimeout(() => {
        todo.overtime = 0;
        if(minuteTime>=todo.time){
            todo.overtime=minuteTime-todo.time+1;
        }},500);
    }
    return (
            <Draggable draggableId={todo._id} index={index} isDragDisabled={done || active} >
                {provided => {
                    const style = {
                        // height: (minuteTime < todo.time) ? (todo.time/sizeArr)*100+ '%':
                        height: (todo.time/sizeArr)*100 + '%',
                        textDecoration: done ? 'line-through' : 'none',
                        color: done? 'grey':'',
                        ...provided.draggableProps.style,
                    };
                    return (
                    <div className="Card" ref={provided.innerRef}
                         {...provided.draggableProps}
                         {...provided.dragHandleProps} style = {style}>
                        <Slider start={active} time={(minuteTime < todo.time) ? todo.time : 0}/>
                        <div className={(minuteTime < todo.time) ? "Card--text" : "Card--reverse"}
                             style={{
                                 animationDuration: todo.time/**60*/ + 's',
                                 animationPlayState: active ? 'running' : 'paused',
                                 backgroundColor: !active && !done ? 'rgb(245, 245, 245)' : '',
                                 // backgroundPosition: (minuteTime<todo.time) && active ? '0% 100%': '100% 0%',
                                 // textDecoration: done ? 'line-through' : 'none',
                             }}>
                            <div className='name'
                                 style={{
                                     width: 50 + 2 * longest + "px", backgroundColor: done ? color : '',
                                     background: !active && !done ? 'rgba(240, 240, 240,1)' : '',
                                 }}>
                                {todo.name} </div>
                            <div className='description' style={{
                                // paddingBottom: (minuteTime < todo.time) ? (todo.time/sizeArr)+ '%' : todo.time / (sizeArr/2) + (realTime/*/60*/ - todo.time) + '%',
                                backgroundColor: done ? 'rgba(240, 240, 240, 1)' : '',
                                background: !active && !done ? 'rgb(230, 230, 230)' : '',
                            }}>{todo.description} </div>
                            <div className="time" style={{backgroundColor: done ? 'rgba(240, 240, 240, 1)' : ''}}>
                                <div className="set-time" >
                                    {todo.time} {todo.overtime} min
                                </div>
                                <Timer callbackFromParent={timeCallback} initialMinute={todo.time} active={active}
                                       done={done}/>
                            </div>
                        </div>
                    </div>

                )}}
            </Draggable>
    )
}
export default Todo
