import React, {useEffect, useState} from 'react'
import { Draggable } from 'react-beautiful-dnd'
import {getLongestName} from "../API";
import './TodoItem.css'
import Timer from "./Timer";
import Slider from "./Slider";

type Props = TodoProps & {
    updateTodo: (todo: ITodo) => void
    deleteTodo: (_id: string) => void
    index: number
    active: boolean
    done: boolean
}
const Todo: React.FC<Props> = ({ todo, active, done, index }) => {
    const [realTime, setTime] = useState<number>(0);
    // const minuteTime = Math.floor(realTime/60);
    const minuteTime = realTime;
    const myCallback = (dataFromChild: number) => {
        setTime(dataFromChild);
    }
    const [longest, setLong] = useState<number>(0);
    const [color, setColor] = useState<string>('rgb(160,240,232)');
    useEffect(() => {
        handleColor()
    },)
    const handleColor = (): void => {
        const diff = minuteTime-todo.time
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
    useEffect(() => {
        handleLongest()
    },)
    const handleLongest = (): void => {
        getLongestName()
            .then(({ data: { longest} }:number|any) => setLong(longest))
            .catch((err: Error) => console.log(err))
    }

    return (
    <Draggable draggableId={todo._id} index={index} isDragDisabled={done || active}>
          {provided => (
    <div className='Card' ref={provided.innerRef}
         {...provided.draggableProps}
         {...provided.dragHandleProps}>
        <Slider start={active} time = {(minuteTime<todo.time)?todo.time:0}/>
      <div className= {(minuteTime<todo.time) ? "Card--text": "Card--reverse"}
          style={{
               transitionDuration: (minuteTime<todo.time) ?
                   (todo.time-minuteTime)/**60*/ +'s' : todo.time/**60*/+'s',
               backgroundPosition: (minuteTime<todo.time) && active ? '0% 100%': '100% 0%',
              textDecoration: done ? 'line-through' : 'none',
           }}>
        <div className='name'
             style={{width: 50+4*longest + "px", backgroundColor: done ? color: '' }} >
            {todo.name} </div>
        <div className='description'  style={{
            paddingBottom: (minuteTime<todo.time) ? todo.time/3+'%': todo.time/3+(realTime/*/60*/-todo.time)/2 + '%',
            backgroundColor: done ? 'rgba(230, 230, 230, 1)': ''
        }}>{todo.description}</div>
          <div className="time" style = {{backgroundColor: done ? 'rgba(230, 230, 230, 1)': ''}}>
              <div className="set-time" >
                  {todo.time} min</div>
              <Timer callbackFromParent={myCallback} initialMinute = {todo.time} active = {active} done = {done}  />

          </div>
      </div>
    </div>
          )}
      </Draggable>
  )
}

export default Todo
