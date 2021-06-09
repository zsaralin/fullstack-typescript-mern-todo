import React, {useEffect, useState} from 'react'
import TodoItem from './components/TodoItem'
import {DragDropContext, Droppable, DropResult} from 'react-beautiful-dnd'
import {getTodos,} from './API'
import BonusItem from "./components/BonusItem";

const useKeyPress = function(targetKey: string) {
    const [keyPressed, setKeyPressed] = useState(false);

    function downHandler({ key }: { key: string }) {
        if (key === targetKey) {
            setKeyPressed(true);
        }
    }
    const upHandler = ({ key }: { key: string }) => {
        if (key === targetKey) {
            setKeyPressed(false);
        }
    };

    React.useEffect(() => {
        window.addEventListener("keydown", downHandler);
        window.addEventListener("keyup", upHandler);

        return () => {
            window.removeEventListener("keydown", downHandler);
            window.removeEventListener("keyup", upHandler);
        };
    });

    return keyPressed;
};

const App: React.FC = () => {

    const downPress = useKeyPress("ArrowDown");
    const upPress = useKeyPress("ArrowUp");

    const [todos, setTodos] = useState<ITodo[]>([]);
    const [selected, setSelected] =  useState<ITodo>();
    const [cursor, setCursor] = useState<number>(-1);

    const [realTime, setTime] = useState<number>(0);
    let totalOver = 0;

    useEffect(() => {
        let myInterval = setInterval(() => {
            if (cursor != -1) {
                setTime(realTime + 1);
            }
        }, 1000)
        return () => {
            clearInterval(myInterval);
        };
    });
    const getTodoTime = (): number => {
        let todoTime = 0;
        for(let i=0; i<todos.length; i++){
            todoTime += todos[i].time;
        }
        return todoTime;
    }
    let todoTime = getTodoTime();
    let bonusTime = 8;

    useEffect(() => {
        if (downPress) {
            if (cursor < todos.length) {
                setCursor(prevState =>
                    prevState < todos.length ? prevState + 1 : prevState)
            } else {
                setCursor(todos.length + 1);
            }

            setSelected(todos[cursor]);

            let before = todos[cursor - 1];
            if (before !== undefined) {
                before.status = true
            }
            if (selected !== undefined) {
                selected.status = true
            }
        }
    }, [downPress]);

    useEffect(() => {
        if (upPress) {
            setCursor(prevState => (prevState > 0 ? prevState - 1 : prevState));
            setSelected(todos[cursor]);
            let before = todos[cursor+1];
            if (before!== undefined){ before.status = false}
            if (selected!== undefined){ selected.status = true}
        }
    }, [upPress]);

    const onDragEnd = ({ source, destination }: DropResult) => {
        // Make sure we have a valid destination
        if (destination === undefined || destination === null ||
            destination.index < source.index && destination.index <= cursor ) return null
        // Make sure we're actually moving the item
        if (destination.index === source.index) return null
        // Move the item within the list
        // Start by making a new list without the dragged item
        const newList = todos.filter((_: any, idx: number) => idx !== source.index)
        // Then insert the item at the right location
        newList.splice(destination.index, 0, todos[source.index])
        // Update the list
          setTodos(newList)
    }

  const fetchTodos = (): void => {
    getTodos()
    .then(({ data: { todos } }: ITodo[] | any) => setTodos(todos))
    .catch((err: Error) => console.log(err))
  }
    useEffect(() => {
        fetchTodos();
    }, [])

        return (
            <DragDropContext onDragEnd={onDragEnd}>
            <main className='App' >
                <span>{realTime} {totalOver}</span>
                <div className='test'>
                <Droppable droppableId='col-1' isDropDisabled={false} >
                    {provided => {
                        const style = {
                            height: todoTime/(todoTime+bonusTime)*100,
                            ...provided.droppableProps,
                        };
                        return (
                <ul className="characters"
                    {...provided.droppableProps} ref={provided.innerRef} style = {style}>
                    {todos.map((todo: ITodo, index) => (
                        <TodoItem
                            key={todo._id}
                            todo={todo}
                            index= {index}
                            active={index===cursor}
                            done = {index <= cursor-1}/>
                    ))}
                    {provided.placeholder}
                </ul> )}}
                </Droppable>
                <BonusItem
                active = {cursor === todos.length} done = {cursor === todos.length+1}
                percent = {bonusTime/(bonusTime+todoTime)*100}/>
                </div>
                <button className = "button"> Settings </button>
            </main>
            </DragDropContext>
        )
    }

export default App
