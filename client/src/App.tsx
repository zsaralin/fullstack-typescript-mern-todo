import React, {useEffect, useState} from 'react'
import TodoItem from './components/TodoItem'
import {DragDropContext, Droppable, DropResult} from 'react-beautiful-dnd'
import {getTodos, updateTodo, deleteTodo} from './API'
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

    const [todos, setTodos] = useState<ITodo[]>([]);
    const [selected, setSelected] =  useState<ITodo>();
    const downPress = useKeyPress("ArrowDown");
    const upPress = useKeyPress("ArrowUp");
    const [cursor, setCursor] = useState<number>(-1);

    useEffect(() => {
        if (downPress) {
            if(cursor < todos.length){
            setCursor(prevState =>
                prevState < todos.length ? prevState + 1 : prevState
            )
            }
            else{
                setCursor(todos.length+1);
            }

            setSelected(todos[cursor]);
            let before = todos[cursor-1];
            if (before!== undefined){ before.status = true}
            if (selected!== undefined){ selected.status = true}
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

  useEffect(() => {
    fetchTodos()

  }, [])

  const fetchTodos = (): void => {
    getTodos()
    .then(({ data: { todos } }: ITodo[] | any) => setTodos(todos))
    .catch((err: Error) => console.log(err))
  }

  const handleUpdateTodo = (todo: ITodo): void => {
    updateTodo(todo)
    .then(({ status, data }) => {
        if (status !== 200) {
          throw new Error('Error! Todo not updated')
        }
        setTodos(data.todos)
      })
      .catch((err) => console.log(err))
  }

  const handleDeleteTodo = (_id: string): void => {
    deleteTodo(_id)
    .then(({ status, data }) => {
        if (status !== 200) {
          throw new Error('Error! Todo not deleted')
        }
        setTodos(data.todos)
      })
      .catch((err) => console.log(err))
  }
        return (
            <DragDropContext onDragEnd={onDragEnd}>
            <main className='App' >
                <div className='test'>
                {/*<Slider start = {cursor != -1} margin-top: />*/}
                <Droppable droppableId='col-1' isDropDisabled={false} >
                    {provided => (
                <ul className="characters" {...provided.droppableProps} ref={provided.innerRef}>
                    {todos.map((todo: ITodo, index) => (
                        <TodoItem
                            key={todo._id}
                            updateTodo={handleUpdateTodo}
                            deleteTodo={handleDeleteTodo}
                            todo={todo}
                            index= {index}
                            active={index===cursor}
                            done = {index <= cursor-1}/>
                    ))}
                    {provided.placeholder}
                </ul> )}
                </Droppable>

                <BonusItem
                active = {cursor === todos.length} done = {cursor === todos.length+1}/>
                <button className = "button"> Settings </button>
                </div>
            </main>
            </DragDropContext>
        )
    }

export default App
