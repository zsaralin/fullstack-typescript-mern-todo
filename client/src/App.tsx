import React, {useEffect, useState} from 'react'
import TodoItem from './components/TodoItem'
import {DragDropContext, Droppable, DropResult} from 'react-beautiful-dnd'
import {getTodos,} from './API'
import BonusItem from "./components/BonusItem";
// @ts-ignore
import audio from './boop.mp3';
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
    const [selected, setSelected] = useState<ITodo>();
    const [before, setBefore] = useState<ITodo>();

    const [cursor, setCursor] = useState<number>(-1);

    const [realTime, setTime] = useState<number>(0);
    const [nonZeroTime, setZero] = useState<number>(0);
    const [prevTimeT, setPrevTime] = useState<number>(0);
    const [lastIndex, setLastIndex] = useState<number>(1);

    const [amountSubtract, setAmountSubtract] = useState<number>(0);

    let origBonus = 5;
    const [bonusTime, setBonus] = useState<number>(origBonus);

    const timeCallback = (timerTime: number) => {
        if (timerTime != 0 && timerTime != prevTimeT) {
            setZero(timerTime)
        }
        setTime(timerTime);
    }
    useEffect(() => {
        if (selected !== undefined) {
            //if person goes overtime
            if (realTime > Math.round(selected.time - selected.extra) && !(cursor === todos.length - 1 && bonusTime <= 0)) {
                //increase selected.overtime so their box increases in size
                //only increase box when there is bonusTime or other people's time left to take from
                if (isTimeLeft()) {
                    selected.overtime = (realTime - Math.round(selected.time - selected.extra));
                }

                //decrease other slots if bonusTime == 0
                if (cursor != todos.length - 1 || bonusTime > 0) {
                    if (bonusTime < 1) {
                        let reducedSlot2 = cursor + lastIndex;
                        if (isTimeLeft()) {
                            todos[reducedSlot2].time -= 1;
                            setAmountSubtract(amountSubtract + 1)
                            if (amountSubtract == 60) {
                                setLastIndex(lastIndex + 1);
                                setAmountSubtract(0)
                            }
                        }
                    } else { //decrease bonusTime
                        setBonus(bonusTime - 1)
                    }
                }
            }
        }
    })
    const getTodoTime = (): number => {
        let todoTime = 0;
        for (let i = 0; i < todos.length; i++) {
            todoTime += todos[i].time + todos[i].overtime - todos[i].extra;
        }
        return todoTime;
    }

    const getPercent = (todo: ITodo): number => {
        let percent = (todo.time - todo.extra + todo.overtime);
        percent = percent / (todoTime + bonusTime) * 100
        if (percent < 6.5) {
            return (6.5);
        }
        return percent;
    }

    const isTimeLeft = (): boolean => {
        for (let i = cursor + 1; i < todos.length; i++) {
            if (todos[i].time != 1) {
                return true
            }
        }
        return false;
    }

    const isSlotDecreased = (): number => {
        let numDecreased = 0;
        for (let i = cursor + 1; i < todos.length; i++) {
            if (todos[i].initTime > todos[i].time) {
                numDecreased += todos[i].initTime - todos[i].time;
            }
        }
        return numDecreased;
    }
    let todoTime = getTodoTime();
    let slotDecreased = isSlotDecreased();
    useEffect(() => {
        if (cursor + lastIndex >= todos.length && isTimeLeft()) {
            setLastIndex(1);
        }
    })
    useEffect(() => {
        if (cursor >= 0 && (cursor + lastIndex) < todos.length && todos[cursor + lastIndex].time == 1 && isTimeLeft()) {
            setLastIndex(lastIndex + 1)
        }
    })
    useEffect(() => {
        if (downPress) {
            setLastIndex(1);
            // let trumpetSound = new Audio(audio);
            // if(cursor == -1){trumpetSound.play()}
            if (selected !== undefined) {
                //if person takes less than set time
                if (selected.overtime == 0 && nonZeroTime < (selected.time)) {
                    let difference = selected.time - nonZeroTime;
                    if (slotDecreased > 0) {
                        let subtract = Math.floor(difference / slotDecreased)
                        //increase subsequent slots that are under time (until they are back to their set times)
                        for (let i = cursor + 1; i < todos.length; i++) {
                            if (todos[i].time < todos[i].initTime) {
                                todos[i].time += subtract;
                                difference -= subtract;
                            }
                        }
                        slotDecreased = isSlotDecreased()
                        for (let i = cursor + 1; i < todos.length; i++) {
                            while (difference > 0 && todos[i].time < todos[i].initTime) {
                                todos[i].time += 1;
                                difference -= 1;
                            }
                        }
                    }
                    todos[1].name = selected.time.toString()
                    selected.name = Math.ceil((difference/60)).toString();
                    setBonus(bonusTime + difference);
                    // setBonus(origBonus)
                    selected.extra += selected.time - nonZeroTime
                    // selected.time = nonZeroTime;
                }
            }

            if (cursor < todos.length) {
                setCursor(prevState =>
                    prevState < todos.length ? prevState + 1 : prevState)
            } else {
                setCursor(todos.length + 1);
            }
            setBefore(todos[cursor])
            setSelected(todos[cursor + 1]);
        }
    }, [downPress]);

    useEffect(() => {
        if (upPress) {
            setLastIndex(1)
            setPrevTime(nonZeroTime)
            if (cursor === 0) {
                window.location.reload();
            }
            setBefore(todos[cursor - 2])
            if (before !== undefined) {
                //if slot before took less than designated time
                if (before.extra > 0) {
                    let difference = before.extra;
                    before.extra = 0;
                    //increase subsequent slots that are under time (until they are back to their set times)
                    if (slotDecreased > 0) {
                        let subtract = Math.floor(difference / slotDecreased)
                        todos[0].name = subtract.toString();
                        for (let i = cursor + 1; i < todos.length; i++) {
                            todos[i].time -= subtract;
                            difference -= subtract;
                        }
                        for (let i = cursor + 1; i < todos.length; i++) {
                            while (difference > 0 && todos[i].time < todos[i].initTime) {
                                todos[i].time -= 1;
                                difference -= 1;
                            }
                        }
                    } else {
                        setBonus(bonusTime - difference);
                    }
                    // selected.time = nonZeroTime;
                }
            }
            setCursor(prevState => (prevState > 0 ? prevState - 1 : prevState));
            setSelected(todos[cursor - 1]);
        }
    }, [upPress]);


    const onDragEnd = ({source, destination}: DropResult) => {
        // Make sure we have a valid destination
        if (destination === undefined || destination === null ||
            destination.index < source.index && destination.index <= cursor) return null
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
            .then(({data: {todos}}: ITodo[] | any) => setTodos(todos))
            .catch((err: Error) => console.log(err))
    }
    useEffect(() => {
        fetchTodos();
    }, [])

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <main className='App'>
                <span>{nonZeroTime} {prevTimeT}</span>
                <div className='test'>
                    <Droppable droppableId='col-1' isDropDisabled={false}>
                        {provided => {
                            const style = {
                                // height: (todoTime - ((bonusTime) / (todoTime+bonusTime) * 100))/(todoTime) + '%' ,
                                color: 'black',
                                ...provided.droppableProps,
                            };
                            return (
                                <ul className="characters"
                                    {...provided.droppableProps} ref={provided.innerRef} style={style}>
                                    {todos.map((todo: ITodo, index) => (
                                        <TodoItem
                                            key={todo._id}
                                            todo={todo}
                                            index={index}
                                            active={index === cursor}
                                            done={index < cursor}
                                            callbackFromParent2={timeCallback}
                                            percent={getPercent(todo)}
                                            bonusTime={bonusTime}
                                        />
                                    ))}
                                    {provided.placeholder}
                                    <BonusItem
                                        origBonus={origBonus} time={bonusTime} active={cursor === todos.length}
                                        done={cursor === todos.length + 1}
                                        percent={(bonusTime) / (todoTime + bonusTime) * 100}/>
                                </ul>)
                        }}

                    </Droppable>

                </div>
                <button className="button"> Settings</button>
            </main>
        </DragDropContext>
    )
}

export default App
