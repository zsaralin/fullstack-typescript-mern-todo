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
    const [didSkipSlots, setDidSkipSlots] = useState<boolean>(false);

    const [nonZeroTime, setZero] = useState<number>(0);

    //amount bonusTime decreases before decreasing meeting slots
    const [initBonus, setInitBonus] = useState<number>(0);
    //number of slots skipped before reaching a non-zero one
    const [skippedSlots, setSkippedSlots] = useState<number>(0);


    let origBonus = 5;
    const [bonusTime, setBonus] = useState<number>(origBonus);

    const timeCallback = (timerTime: number) => {
        if(timerTime != 0){setZero(timerTime)}
        setTime(timerTime);
    }
    useEffect(() => {
        if (selected !== undefined) {
            //if person goes overtime
            if (realTime > Math.round(selected.time - selected.extra) && !(cursor===todos.length-1 && bonusTime<=0)) {
                //increase selected.overtime so their box increases in size
                //only increase box when there is bonusTime or other people's time left to take from
                if(isTimeLeft()) selected.overtime = (realTime - Math.round(selected.time - selected.extra));

                //decrease other slots if bonusTime == 0
                if(cursor != todos.length - 1 || bonusTime >0){
                if (bonusTime < 1) {
                    setDidSkipSlots(false)
                    // setSkippedSlots(0)
                    let reducedSlot = cursor + selected.overtime-initBonus ;
                    while(reducedSlot >= todos.length ){
                        reducedSlot -= todos.length - cursor - 1;
                    }

                    // while(reducedSlot < todos.length && todos[reducedSlot].time == 1 && isTimeLeft()) {
                    //     reducedSlot += 1;
                    //     setDidSkipSlots(true)}
                    //     if (reducedSlot >= todos.length) {
                    //         while(todos[cursor + skippedSlots+1].time == 1){
                    //             setSkippedSlots(skippedSlots+1)
                    //         }
                    //         if (cursor + skippedSlots + 1 >= todos.length ) {
                    //             setSkippedSlots(0)
                    //         }
                    //         reducedSlot = cursor + skippedSlots + 1 ;
                            // setSkippedSlots(skippedSlots + 1)
                        // }

                    todos[0].name = reducedSlot.toString()
                    todos[reducedSlot].time > 1? todos[reducedSlot].time  -= 1: todos[reducedSlot].time = 1;
                    if(didSkipSlots){setSkippedSlots(skippedSlots+1)}
                } else{ //decrease bonusTime
                    setBonus(bonusTime - 1)
                    setInitBonus(initBonus + 1)
                }
            }}
        }
    })
    const getTodoTime = (): number => {
        let todoTime = 0;
        for (let i = 0; i < todos.length; i++) {
            todoTime += todos[i].time+todos[i].overtime - todos[i].extra;
        }
        return todoTime;
    }

    const getPercent = (todo: ITodo): number => {
        let percent = (todo.time - todo.extra+todo.overtime);
        // if(isPercentLeft()){ percent = todo.time - todo.extra + todo.overtime}
        percent = percent/(todoTime+bonusTime)*100
        if(percent<6.5){
            return (6.5);
        }
        return percent;
    }

    const isTimeLeft = () : boolean => {
        for (let i = cursor + 1; i < todos.length; i++) {
            if(todos[i].time != 1){
                return true}}
        return false;
    }


    const isSlotDecreased = (): number => {
        let numDecreased = 0;
        for (let i = cursor + 1; i < todos.length; i++) {
            if(todos[i].initTime>todos[i].time){
            numDecreased += todos[i].initTime-todos[i].time;}
            }
        return numDecreased;
    }
    let todoTime = getTodoTime();
    let slotDecreased = isSlotDecreased();

    useEffect(() => {
        if (downPress) {
            // let trumpetSound = new Audio(audio);
            // if(cursor == -1){trumpetSound.play()}
            setInitBonus(0)
            if(selected !== undefined) {
                //if person takes less than set time
                if (selected.overtime == 0 && nonZeroTime < (selected.time)) {
                    let difference = selected.time - nonZeroTime;
                    let subtract = Math.floor(slotDecreased/difference)
                    for (let i = cursor + 1; i < todos.length; i++) {
                        todos[i].time += subtract;
                        difference -= subtract;
                    }
                        //increase subsequent slots that are under time (until they are back to their set times)
                    if(slotDecreased>0){
                        for (let i = cursor + 1; i < todos.length; i++) {
                            while(difference > 0 && todos[i].time < todos[i].initTime) {
                                todos[i].time += 1;
                                difference -= 1;
                            }
                        }
                }else{
                    setBonus(bonusTime + difference);}
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
            if(cursor === 0){
                window.location.reload();
            }
            setBefore(todos[cursor-2])
            if(before !== undefined) {
                //if slot before took less than designated time
                if (before.extra > 0) {
                    let difference = before.extra;
                    before.extra = 0;
                    let subtract = Math.floor(slotDecreased / difference)
                    for (let i = cursor + 1; i < todos.length; i++) {
                        todos[i].time -= subtract;
                        difference -= subtract;
                    }
                    //increase subsequent slots that are under time (until they are back to their set times)
                    if (slotDecreased > 0) {
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
            setSelected(todos[cursor-1]);
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
                                            done={index < cursor }
                                            callbackFromParent2={timeCallback}
                                            percent={getPercent(todo)}
                                        />
                                    ))}
                                    {provided.placeholder}
                                    <BonusItem
                                        origBonus={origBonus} time={bonusTime} active={cursor === todos.length} done={cursor === todos.length + 1}
                                        percent={(bonusTime)/(todoTime + bonusTime)*100 }/>
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
