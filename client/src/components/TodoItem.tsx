import React, {useEffect, useState} from 'react'
import { Draggable } from 'react-beautiful-dnd'
import {getLongestName} from "../API";
import './TodoItem.css'

type Props = TodoProps & {
    updateTodo: (todo: ITodo) => void
    deleteTodo: (_id: string) => void
    index: number
    active: boolean
}
const Todo: React.FC<Props> = ({ todo, active, index }) => {
    const [longest, setLong] = useState<number>(50);
    useEffect(() => {
        handleLongest()
    },)
    const handleLongest = (): void => {
        getLongestName()
            .then(({ data: { longest} }:number|any) => setLong(longest))
            .catch((err: Error) => console.log(err))
    }

    return (
      <Draggable draggableId={todo._id} index={index} isDragDisabled={active}>
          {provided => (
    <div className='Card' ref={provided.innerRef}
         {...provided.draggableProps}
         {...provided.dragHandleProps}>
      <div className="Card--text"
           style={{
               border: active ? 'dotted': 'none',
               transitionProperty: 'background-position',
               transitionTimingFunction: 'linear',
               transitionDuration: todo.time*60/60+'s',
               backgroundPosition: active ? '0%': '100%',
               textDecoration: active ? 'line-through' : 'none',}}>
        <div className='name' style={{width: longest*6.5 + "px"}} > {todo.name} </div>
        <div className='description' style={{paddingBottom: todo.time/3 + '%'}}>{todo.description}</div>
          <div className="time">
              <div className="set-time">
                  {todo.time} min</div>
              <div className="real-time">
                  - min</div>
          </div>
      </div>
    </div>
          )}
      </Draggable>
  )
}

export default Todo
