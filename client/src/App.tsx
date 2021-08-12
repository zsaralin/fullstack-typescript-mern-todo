import React, {useEffect, useState} from 'react'
import TodoItem from './components/TodoItem'
import {MdSettings} from 'react-icons/md';
import AddTodo from './components/AddTodo'
import {DragDropContext, Droppable, DropResult} from 'react-beautiful-dnd'
import {addTodo, deleteTodo, getMeetingLen, getTodos2, postMeetingLen} from './API'
import BonusItem from "./components/BonusItem";
import DateComp from './components/theDate';
import {BrowserRouter as Router, Route, Switch, } from "react-router-dom";
// @ts-ignore
import audio from './fanfare.mp3';

const ws = new WebSocket("ws://localhost:8000");

// const history = useHistory()
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
    const [todos, setTodos] = useState<ITodo[]>([]);

    const [selected, setSelected] = useState<ITodo>();
    const [before, setBefore] = useState<ITodo>();

    const [cursor, setCursor] = useState<number>(-1);

    const [realTime, setTime] = useState<number>(0);
    const [nonZeroTime, setZero] = useState<number>(0);

    const [lastIndex, setLastIndex] = useState<number>(0);
    const [amountSubtract, setAmountSubtract] = useState<number>(0);

    const [meetingLenMenu, setMeetingLenMenu] = useState(false);
    const [presenterWarning, setPresenterWarning] = useState(false);

    const [addTodoMenu, setAddTodoMenu] = useState(false);

    const downPress = useKeyPress("ArrowDown");
    const upPress = useKeyPress("ArrowUp");
    ws.addEventListener('open', function() {
        console.log("Connected to server");
    });
    ws.onmessage=  (event) =>{
        if(event.data === 'downPress'){
            downPressFn();}
        else if(event.data === 'upPress'){
            upPressFn();}
        else if(event.data === 'refresh'){
            window.location.reload();
        }
        else if(JSON.parse(event.data).name === 'deleteTodo'){
            const object = JSON.parse(event.data);
            deleteTodoHelper(object.index)
        }
        else if(JSON.parse(event.data).name === 'addTodo'){
            const object = JSON.parse(event.data);
            addTodoHelper(object.newTodo)
        }
        else if(JSON.parse(event.data).name === 'meetingLen'){
            const object = JSON.parse(event.data);
            setMeetingLen(object.meetingLen*1000)
        }
        else if(JSON.parse(event.data).name === 'todosOrder'){
            const object = JSON.parse(event.data);
            setTodos(object.todos)
        }
    }
    const toggleMeetingLenMenu = () => {
        setMeetingLenMenu(!meetingLenMenu);
        if(addTodoMenu){setAddTodoMenu(false)}
    }
    const closeMenu = () => {
        setMeetingLenMenu(false);
        setAddTodoMenu(false);
    }
    const toggleAddTodoMenu = () => {
        setAddTodoMenu(!addTodoMenu);
        if(meetingLenMenu){setMeetingLenMenu(false)}
    }
    const togglePresenterWarning = () => {
        setPresenterWarning(!presenterWarning);
    }
    function dropDownText(){
        if((cursor === todos.length && bonusTime > 0)){
            return 'Unable to add presenters during bonus time'
        }
        else{
            return 'Presenter already in meeting!'
        }
    }
    function downPressFn(){
        setLastIndex(1);
        let trumpetSound = new Audio(audio);
        trumpetSound.muted = true;
        if (cursor === -1) {
            trumpetSound.muted=false;
            const playPromise = trumpetSound.play();

            if (playPromise !== undefined) {
                playPromise
                    .then(_ => {
                        // Automatic playback started!
                        // Show playing UI.
                        console.log("audio played auto");
                    })
                    .catch(error => {
                        // Auto-play was prevented
                        // Show paused UI.
                        console.log(error);
                    });
            }
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

    function upPressFn() {
        setLastIndex(1)
        setPrevTime(nonZeroTime);
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
    const timeCallback = (timerTime: number) => {
        if (timerTime !== 0 && timerTime !== prevTime) {
            setZero(timerTime)
        }
        setTime(timerTime);
    }
    // const getTodoTime = (): number => {
    //     let todoTime = 0;
    //     for (let i = 0; i < todos.length; i++) {
    //         todoTime += todos[i].time + todos[i].overtime - todos[i].extra;
    //     }
    //     return todoTime;
    // }
    // const getNonCompressedTodoTime = (): number => {
    //     let todoTime = 0;
    //     for (let i = 0; i < todos.length; i++) {
    //         todoTime += todos[i].nonCompressedTime;
    //     }
    //     return todoTime;
    // }

    function getLongestName() {
        let longest = '';
        for (let i = 0; i < todos.length; i++) {
            if (todos[i].name.length >= longest.length) {
                longest = todos[i].name;
            }
        }
        return longest.length;
    }

    const [todoTime, setTodoTime ] = useState<number>(0);
    const [nonCompressedtodoTime, setNonCompressedTodoTime] = useState<number>(0);
    const [diff, setDiff] = useState<number>(0);
    const [index, setIndex] = useState<number>(cursor + 1);



    const [meetingLen, setMeetingLen] = useState<number>(0);
    const [tempMeeting, setTempMeeting] = useState<number>();
    const [origBonus, setOrigBonus] = useState<number>(0);
    const [bonusTime, setBonus] = useState<number>(0);
    useEffect(() => {
        let todoTime = 0;
        for (let i = 0; i < todos.length; i++) {
            todoTime += todos[i].nonCompressedTime;
        }
        setNonCompressedTodoTime(todoTime);
    }, [todos])
    useEffect(() => {
        if (meetingLen > todoTime) {
                setOrigBonus(meetingLen - getTodoTime());
                setDiff(0)
        } else {
            setOrigBonus(0)
            if (meetingLen < todoTime) {
                setDiff(todoTime - meetingLen)
            }
        }

    }, [todoTime, meetingLen, index, nonCompressedtodoTime])
    function compressTodos() {
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
        setTodoTime(getTodoTime());
    }
    useEffect(() => {
        if (diff > 0 && todoTime !== todos.length * 1000) {
            compressTodos();
        }
    }, [index, diff])

    function resetTodos() {
        for (let i = 0; i < todos.length; i++) {
            todos[i].initTime = todos[i].nonCompressedTime;
            todos[i].time = todos[i].nonCompressedTime;
        }
        setTodoTime(getTodoTime())
    }
    const getTodoTime=()=> {
        let todoTime = 0;
        for (let i = 0; i < todos.length; i++) {
            todoTime += todos[i].time + todos[i].overtime - todos[i].extra;
        }
        return todoTime;
    }
    useEffect(() => {
        setIndex(0)
        resetTodos();
    }, [meetingLen])

    useEffect(() => {
        const todoTime = getTodoTime();
        setTodoTime(todoTime)
    }, [todos])
    const [prevTime, setPrevTime] = useState<number>(0);
    useEffect(() => {
        // resetTodos()
        fetchMeetingLen()
    }, [])
    useEffect(() => {
        fetchTodos();
    }, [])
    useEffect(() => {
        setBonus(origBonus)
    }, [origBonus])
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
                    console.log(index)
                    var msg = {name: "deleteTodo", index:index}
                    ws.send(JSON.stringify(msg))
                }})
            .catch((err) => console.log(err))
    }
    useEffect(() => {
        window.onbeforeunload = () => {
            if (window.location.pathname === '/admin') {
                ws.send('refresh')
            }
        }
    })
    const deleteTodoHelper=(index:number)=>{
        // let extraBonus = todos[index].time;
        todos.splice(index,1);
        // setBonus(bonusTime+extraBonus);
        // setOrigBonus(origBonus+extraBonus)
        setTodos(todos)
        resetTodos()
        var msg = {name:"todosOrder", todos: todos}
        ws.send(JSON.stringify(msg))
    }

    const isTimeLeft=()=>{
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
    }, [lastIndex, cursor, todos])
    useEffect(() => {
        if (presenterWarning){
            setTimeout(()=>{
                togglePresenterWarning();
            }, 1000)
            }
    }, [presenterWarning])
    useEffect(() => {
        if (cursor >= 0 && (cursor + lastIndex) < todos.length && todos[cursor + lastIndex].time <= 1000 && isTimeLeft()) {
            setLastIndex(lastIndex + 1)
        }
    }, [lastIndex, cursor, todos])
    useEffect(() => {
        if (downPress && window.location.pathname === '/admin') {
            ws.send('downPress')
        }
    }, [downPress]);

    useEffect(() => {
        if (upPress && window.location.pathname === '/admin') {
            ws.send('upPress')
    }}, [upPress]);

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
        var msg = {name:"todosOrder", todos: newList}
        ws.send(JSON.stringify(msg))
        window.scrollTo(0, 0)
    }

    const fetchTodos = (): void => {
        getTodos2()
            .then(({data: {todos}}: ITodo[] | any) =>
                shuffleTodos(todos))
            .catch((err: Error) => console.log(err));
    }
    function shuffleTodos(inputTodos: ITodo[]){
        let namesList: string[] = [];
        let finalList: ITodo[] = [];
        let todoList: ITodo[] = [];
        let otherList: ITodo[] = [];
        let interns = ['Daron','Srishti','Matthew','Vikram','Saralin', 'Damien','Tobias','Karthik','Michael']
        let fullTimers = ['Jo','Kendra', 'Qian', 'Bon', 'David', 'Frederik']
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
        var msg = {name:"todosOrder", todos: finalList}
        ws.send(JSON.stringify(msg))
    }
    function fetchMeetingLen(){
        getMeetingLen()
            .then(({data: {meetingLen}}: number | any) => setMeetingLen(meetingLen * 1000))
            .catch((err: Error) => console.log(err));
    }

    const updateMeetingLen = (meetingLen: number | undefined): void => {
        if (meetingLen !== undefined) {
            postMeetingLen(meetingLen).then(response => {
                console.log(response)
            });
            setMeetingLen(meetingLen * 1000)
            setTempMeeting(undefined);
            setMeetingLenMenu(false)
            var msg = {name:"meetingLen", meetingLen: meetingLen}
            ws.send(JSON.stringify(msg))
        }
    }

    const handleForm = (e: any) => {
        if (e.key === 'Enter') {
            // if (tempMeeting != undefined) {
                updateMeetingLen(tempMeeting);
            // }
            e.preventDefault();
        }
    }
    const handleFormOnSubmit = (e: any) => {
        e.preventDefault();
        if (tempMeeting !== undefined) {
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
                    let result = todos.map(a => a.name);
                    if(!result.includes(data.todo.name) && !(cursor === todos.length && bonusTime>0)){
                        var msg = {name: "addTodo", newTodo: data.todo}
                        ws.send(JSON.stringify(msg))
                    }
                    else{
                        togglePresenterWarning()
                    }
                }

            })
            .catch((err) => console.log(err))
    }
    const addTodoHelper = (todo: ITodo) => {
        todos.push(todo)
        // setBonus(bonusTime - todo.time)
        // setOrigBonus(origBonus-todo.time)
        setTodos(todos)
        var msg = {name:"todosOrder", todos: todos}
        ws.send(JSON.stringify(msg))
    }
    return (
        <Router>
        <main className='App' id="behindComponent">
            <Switch>
                <Route exact path = "/">
            <DragDropContext onDragEnd={onDragEnd} >
                <div className='test' style = {{marginRight: '3.2%'}} >
                    <div style={{display: 'flex', flexDirection: 'row'}}>
                        <h1 style={{fontSize: '30px', flex: '1 1', color: 'black'}}>Research Project Updates
                            Meeting </h1>
                        <div className="headerWrapper" style={{alignContent: 'right', textAlign: 'right'}}>
                            <div style={{fontSize: '20px', fontWeight: 'bold'}}> {meetingLen / 1000} min</div>
                            <DateComp/>
                        </div>
                    </div>
                    <Droppable droppableId='col-1' isDropDisabled={true}>
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
                                            admin={false}
                                            key={todo._id}
                                            todo={todo}
                                            deleteTodoApp={handleDeleteTodo}
                                            index={index}
                                            active={index === cursor}
                                            done={index < cursor}
                                            callbackFromParent2={timeCallback}
                                            percent={getPercent(todo)}
                                            bonusTime={bonusTime}
                                            longestName={getLongestName()}
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
            </DragDropContext>
                </Route>
                <Route exact path = "/admin">
                    <DragDropContext onDragEnd={onDragEnd}>
                        <form className="meetingLen1" onSubmit={handleFormOnSubmit}
                              style={{display: !meetingLenMenu ? 'none' : ''}}>
                            <label> Meeting Length:
                                <input className="inputMeetingLen" onKeyDown={handleForm} onSubmit={handleFormOnSubmit}
                                       type={meetingLenMenu ? "number" : "string"}
                                       onChange={(e: any) => setTempMeeting(e.target.value)} value={tempMeeting || ""}
                                       id='meetingLen'/> min
                            </label>
                            <button className="buttonStyle" disabled={tempMeeting === undefined} type='submit'>Submit</button>
                            <button className="xOutMeetingLen" onClick={toggleMeetingLenMenu}>x</button>
                        </form>
                        <div className="meetingLenWrapper">
                            <div className="meetingLen" style={{display: !addTodoMenu ? 'none' : ''}}>
                                <AddTodo saveTodo={handleSaveTodo}/>
                                <button className="xOutMeetingLen" onClick={toggleAddTodoMenu}>x</button>
                            </div>
                            <div className='meetingLen'
                                 style={{width: '13%', opacity: !presenterWarning? 0:'100%', transition:
                                         !presenterWarning? 'opacity 5s':'opacity 1s'}}> {dropDownText()}</div>
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
                                                    admin={true}
                                                    key={todo._id}
                                                    todo={todo}
                                                    deleteTodoApp={handleDeleteTodo}
                                                    index={index}
                                                    active={index === cursor}
                                                    done={index < cursor}
                                                    callbackFromParent2={timeCallback}
                                                    percent={getPercent(todo)}
                                                    bonusTime={bonusTime}
                                                    longestName={getLongestName()}
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
                                    <div className = "option" onClick={toggleMeetingLenMenu}>Meeting length</div>
                                    <div className = "option" onClick={toggleAddTodoMenu}>Add Slot</div>
                                </div>
                            </div>
                        </div>
                    </DragDropContext>
                </Route>
            </Switch>
        </main>
        </Router>

    );
}

export default App
