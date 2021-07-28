import React, {useEffect, useState} from 'react'
import TodoItem from './components/TodoItem'
import {MdSettings} from 'react-icons/md';
import AddTodo from './components/AddTodo'
import {DragDropContext, Droppable, DropResult} from 'react-beautiful-dnd'
import {getMeetingLen, postMeetingLen, addTodo, deleteTodo} from './API'
import BonusItem from "./components/BonusItem";
import DateComp from './components/theDate';

// @ts-ignore
import audio from './fanfare.mp3';

function shuffleArray(array:any) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}
const useKeyPress = function (targetKey: string) {
    const [keyPressed, setKeyPressed] = useState(false);

    function downHandler({key}: { key: string }) {
        if (key === targetKey) {
            setKeyPressed(true);
        }
    }

    const upHandler = ({key}: { key: string }) => {
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
    },);
    return keyPressed;
};

const App: React.FC = () => {

    const socket = new WebSocket('wss://wuzsxfe473.execute-api.us-east-2.amazonaws.com/Dev')

    socket.addEventListener('open',() =>{
        console.log('WebSocket is connected')
    })

    socket.addEventListener('close' ,()=> console.log('WebSocket is closed'))

    socket.addEventListener('error', (e: any) => console.error('WebSocket is in error', e))

    const downPress = useKeyPress("ArrowDown");
    const upPress = useKeyPress("ArrowUp");

    const [todos, setTodos] = useState<ITodo[]>([]);

    const [selected, setSelected] = useState<ITodo>();
    const [before, setBefore] = useState<ITodo>();

    const [cursor, setCursor] = useState<number>(-1);

    const [realTime, setTime] = useState<number>(0);
    const [nonZeroTime, setZero] = useState<number>(0);

    const [lastIndex, setLastIndex] = useState<number>(0);
    const [amountSubtract, setAmountSubtract] = useState<number>(0);

    const [meetingLenMenu, setMeetingLenMenu] = useState(false);
    const [addTodoMenu, setAddTodoMenu] = useState(false);

    const toggleMeetingLenMenu = () => {
        setMeetingLenMenu(!meetingLenMenu);
    }
    const closeMenu = () => {
        setMeetingLenMenu(false);
        setAddTodoMenu(false);
    }
    const toggleAddTodoMenu = () => {
        setAddTodoMenu(!addTodoMenu);
    }


    const timeCallback = (timerTime: number) => {
        if (timerTime !== 0 && timerTime !== prevTime) {
            setZero(timerTime)
        }
        setTime(timerTime);
    }
    const getTodoTime = (): number => {
        let todoTime = 0;
        for (let i = 0; i < todos.length; i++) {
            todoTime += todos[i].time + todos[i].overtime - todos[i].extra;
        }
        return todoTime;
    }
    const getNonCompressedTodoTime = (): number => {
        let todoTime = 0;
        for (let i = 0; i < todos.length; i++) {
            todoTime += todos[i].nonCompressedTime;
        }
        return todoTime;
    }

    function getLongestName() {
        let longest = '';
        for (let i = 0; i < todos.length; i++) {
            if (todos[i].name.length >= longest.length) {
                longest = todos[i].name;
            }
        }
        return longest.length;
    }

    const [longestName, setLongestName] = useState<number>(0);
    const [todoTime, setTodoTime] = useState<number>(0);
    const [nonCompressedtodoTime, setNonCompressedTodoTime] = useState<number>(0);
    const [diff, setDiff] = useState<number>(0);
    const [index, setIndex] = useState<number>(cursor + 1);

    useEffect(() => {
        setTodoTime(getTodoTime())
        setNonCompressedTodoTime(getNonCompressedTodoTime())
        setLongestName(getLongestName());
    }, [todos])
    const [meetingLen, setMeetingLen] = useState<number>(0);
    const [tempMeeting, setTempMeeting] = useState<number>();
    const [origBonus, setOrigBonus] = useState<number>(0);
    useEffect(() => {
        if (meetingLen > todoTime) {
            setOrigBonus(meetingLen - nonCompressedtodoTime);
            setDiff(0)
        } else {
            setOrigBonus(0)
            if (meetingLen < todoTime) {
                setDiff(todoTime - meetingLen)
            }
        }
    }, [todoTime, meetingLen, index])
    const compressTodos = (): void => {
        if (todos[index] !== undefined) {
            if (todos[index].time >= 2000) {
                todos[index].initTime -= 1000;
                todos[index].time -= 1000;
                setDiff(diff - 1000)
            }
            setIndex(index + 1);
            if (index === todos.length - 1) {
                setIndex(cursor + 1);
            }
        }
        setTodoTime(getTodoTime);
    }
    useEffect(() => {
        if (diff > 0 && todoTime !== todos.length * 1000) {
            compressTodos();
        }
    }, [index, diff])

    const resetTodos = (): void => {
        for (let i = 0; i < todos.length; i++) {
            todos[i].initTime = todos[i].nonCompressedTime;
            todos[i].time = todos[i].nonCompressedTime;
        }
        setTodoTime(getTodoTime())
    }
    useEffect(() => {
        setIndex(0)
        resetTodos();
    }, [meetingLen])
    useEffect(() => {
        setBonus(origBonus)
    }, [origBonus])

    const [prevTime, setPrevTime] = useState<number>(0);
    useEffect(() => {
        // resetTodos()
        fetchMeetingLen()
    }, [])
    useEffect(() => {
        fetchTodos();
    }, [])

    const [bonusTime, setBonus] = useState<number>(0);
    useEffect(() => {
        if (selected !== undefined) {
            //if person goes overtime
            if (realTime > Math.round(selected.time - selected.extra) && !(cursor === todos.length - 1 && bonusTime <= 0)) {
                //increase selected.overtime so their box increases in size
                //only increase box when there is bonusTime or other people's time left to take from
                if (isTimeLeft() || bonusTime > 0) {
                    selected.overtime = (realTime - Math.round(selected.time - selected.extra));
                }
                //decrease other slots if bonusTime == 0
                if (bonusTime < 100) {
                    if (isTimeLeft()) {
                        let reducedSlot2 = cursor + lastIndex;
                        todos[reducedSlot2].time -= 100;
                        setAmountSubtract(amountSubtract + 100)
                        if (amountSubtract === 1000) {
                            setLastIndex(lastIndex + 1);
                            setAmountSubtract(0)
                        }
                    }
                } else if (bonusTime >= 100) {//decrease bonusTime
                    setBonus(bonusTime - 100)
                }
            }
        }
    }, [realTime])


    const getPercent = (todo: ITodo): number => {
        let percent = (todo.time - todo.extra + todo.overtime);
        percent = percent / (todoTime + bonusTime) * 100
        if (percent < 6.5) {
            return (6.5);
        }
        return percent;
    }
    const handleDeleteTodo = (_id: string, index: number): void => {
        deleteTodo(_id)
            .then(({status, }) => {
                if (status !== 200) {
                    throw new Error('Error! Todo not deleted')
                } else {
                    let extraBonus = todos[index].time;
                    todos.splice(index,1);
                    setBonus(bonusTime+extraBonus);
                    setOrigBonus(origBonus+extraBonus)
                }})
            .catch((err) => console.log(err))
    }
    const isTimeLeft = (): boolean => {
        for (let i = cursor + 1; i < todos.length; i++) {
            if (todos[i].time > 1000) {
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
    let slotDecreased = isSlotDecreased();
    useEffect(() => {
        if (cursor + lastIndex >= todos.length && isTimeLeft()) {
            setLastIndex(1);
        }
    }, [lastIndex])
    useEffect(() => {
        if (cursor >= 0 && (cursor + lastIndex) < todos.length && todos[cursor + lastIndex].time <= 1000 && isTimeLeft()) {
            setLastIndex(lastIndex + 1)
        }
    }, [lastIndex])
    useEffect(() => {
        if (downPress) {
            setLastIndex(1);
            let trumpetSound = new Audio(audio);
            if (cursor === -1) {
                trumpetSound.play()
            }
            if (selected !== undefined) {
                //if person takes less than set time
                if (selected.overtime === 0 && nonZeroTime < (selected.time)) {
                    let difference = selected.time - nonZeroTime;
                    slotDecreased = isSlotDecreased()
                    if (slotDecreased > 0) {
                        let subtract = Math.floor(difference / slotDecreased)
                        //increase subsequent slots that are under time (until they are back to their set times)
                        for (let i = cursor + 1; i < todos.length; i++) {
                            if (todos[i].time < todos[i].initTime) {
                                todos[i].time += subtract;
                                difference -= subtract;
                            }
                        }
                        for (let i = cursor + 1; i < todos.length; i++) {
                            while (difference > 0 && todos[i].time < todos[i].initTime) {
                                todos[i].time += 1;
                                difference -= 1;
                            }
                        }
                    }
                    setBonus(bonusTime + difference);
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
            setPrevTime(nonZeroTime);
            if (cursor === 0) {
                window.location.reload();
            }
            setBefore(todos[cursor - 2])
            if (before !== undefined) {
                //if slot before took less than designated time
                if (before.extra > 0) {
                    let difference = before.extra;
                    before.extra = 0;
                    if (slotDecreased > 0) {
                        let subtract = Math.floor(difference / slotDecreased)
                        for (let i = cursor + 1; i < todos.length; i++) {
                            todos[i].time -= subtract;
                            difference -= subtract;
                        }
                        //increase subsequent slots that are under time (until they are back to their set times)
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
            (destination.index < source.index && destination.index <= cursor)) {
            window.scrollTo(0, 0);
            return null;
        }
        // Make sure we're actually moving the item
        if (destination.index === source.index) {
            window.scrollTo(0, 0);
            return null;
        }
        // Move the item within the list
        // Start by making a new list without the dragged item
        const newList = todos.filter((_: any, idx: number) => idx !== source.index)
        // Then insert the item at the right location
        newList.splice(destination.index, 0, todos[source.index])
        // Update the list
        setTodos(newList)
        window.scrollTo(0, 0)
    }
    const fetchTodos = async () => {
        const response = await fetch('https://wuzsxfe473.execute-api.us-east-2.amazonaws.com/Dev/@connections')
        const body = await response.json();
        shuffleTodos(body)
    }
    // const fetchTodos = (): void => {
    //     getTodos2()
    //         .then(({data: {todos}}: ITodo[] | any) =>
    //             shuffleTodos(todos))
    //         .catch((err: Error) => console.log(err));
    // }
    function shuffleTodos(inputTodos: ITodo[]){
        let namesList: string[] = [];
        let finalList: ITodo[] = [];
        let todoList: ITodo[] = [];
        let otherList: ITodo[] = [];
        let interns = ['Daron','Srishti','Matthew','Vikram','Saralin', 'Damien','Tobias','Karthik','Michael']
        let fullTimers = ['Jo','Kendra', 'Qian', 'Bon', 'David']
        let finalWord = ['Fraser', 'Justin']
        shuffleArray(interns); shuffleArray(fullTimers); shuffleArray(finalWord)
        let orderList = interns.concat(fullTimers, finalWord);

        inputTodos.forEach(element => {
            if (orderList.includes(element.name)) {
                namesList.push(element.name);
                todoList.push(element)
            } else {
                otherList.push(element)
            }
        });
        otherList.forEach(element => {
            finalList.push(element);
        });
        for(let i=0;i<orderList.length;i++){
            if(namesList.includes(orderList[i])){
                let file = todoList[namesList.indexOf(orderList[i])]
                finalList.push(file);
            }}
        setTodos(finalList);
    }
    const fetchMeetingLen = (): void => {
        getMeetingLen()
            .then(({data: {meetingLen}}: number | any) => setMeetingLen(meetingLen * 1000))
            .catch((err: Error) => console.log(err));
    }

    const updateMeetingLen = (meetingLen: number): void => {
        postMeetingLen(meetingLen).then(response => {
            console.log(response)
        });
        setMeetingLen(meetingLen * 1000)
        setTempMeeting(undefined);
        setMeetingLenMenu(false)
    }


    const handleForm = (e: any) => {
        if (e.key === 'Enter') {
            if (tempMeeting != undefined) {
                updateMeetingLen(tempMeeting);
            }
            e.preventDefault();
        }
    }
    const handleFormOnSubmit = (e: any) => {
        e.preventDefault();
        if (tempMeeting != undefined) {
            updateMeetingLen(tempMeeting);
        }
    }
    const handleSaveTodo = (e: React.FormEvent, formData: ITodo): void => {
        e.preventDefault()
        addTodo(formData)
            .then(({status, data}) => {
                if (status !== 201) {
                    throw new Error('Error! Todo not saved')
                }
                if (data.todo) {
                    todos.push(data.todo)
                    setBonus(bonusTime - data.todo.time)
                    setOrigBonus(origBonus-data.todo.time)
                }
            })
            .catch((err) => console.log(err))
    }

    return (
        <main className='App' id="behindComponent">
            <DragDropContext onDragEnd={onDragEnd}>
                <form className="meetingLen" onSubmit={handleFormOnSubmit}
                      style={{display: !meetingLenMenu ? 'none' : ''}}>
                    <label> Meeting Length:
                        <input className="inputMeetingLen" onKeyDown={handleForm} onSubmit={handleFormOnSubmit}
                               type={meetingLenMenu ? "number" : "string"} defaultValue=""
                               onChange={(e: any) => setTempMeeting(e.target.value)} value={tempMeeting || ""}
                               id='meetingLen'/> min </label>
                    <button className="buttonStyle" disabled={tempMeeting == undefined} type='submit'>Submit</button>
                    <button className="xOutMeetingLen" onClick={toggleMeetingLenMenu}>x</button>
                </form>
                <div className="meetingLen" style={{display: !addTodoMenu ? 'none' : ''}}>
                    <AddTodo saveTodo={handleSaveTodo}/>
                    <button className="xOutMeetingLen" onClick={toggleAddTodoMenu}>x</button>
                </div>
                <div className='test' onClick={closeMenu}>
                    <div style={{display: 'flex', flexDirection: 'row'}}>
                        <h1 style={{fontSize: '30px', flex: '1 1', color: 'black'}}>Research Project Updates
                            Meeting </h1>
                        <div className="headerWrapper" style={{alignContent: 'right', textAlign: 'right'}}>
                            <div style={{fontSize: '20px', fontWeight: 'bold'}}> {meetingLen / 1000} min</div>
                            <DateComp/>
                        </div>
                    </div>
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
                                            deleteTodoApp={handleDeleteTodo}
                                            index={index}
                                            active={index === cursor}
                                            done={index < cursor}
                                            callbackFromParent2={timeCallback}
                                            percent={getPercent(todo)}
                                            bonusTime={bonusTime}
                                            longestName={longestName}
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
                <div className="topButton">
                    <div className="dropdown"><MdSettings size={26} color='rgb(200,200,200)'/>
                        <div className="dropdown-content">
                            <a onClick={toggleMeetingLenMenu}>Meeting length</a>
                            <a onClick={toggleAddTodoMenu}>Add Slot</a>
                        </div>
                    </div>
                </div>
            </DragDropContext>
        </main>
    )
}

export default App
