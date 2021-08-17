import React, {useEffect, useState} from 'react'
import Presenter from './components/Presenter'
import AddPres from './components/AddPres'
import Bonus from "./components/Bonus";
import DateComp from './components/theDate';
import {DragDropContext, Droppable, DropResult} from 'react-beautiful-dnd'
import {getPresDatabase, addPres, deletePres, getMeetingLen, postMeetingLen} from './API'
import {MdSettings} from 'react-icons/md'; //settings icon
import {BrowserRouter as Router, Route, Switch,} from "react-router-dom";

// @ts-ignore
import audio from './fanfare.mp3';
let trumpetSound = new Audio(audio);
trumpetSound.muted = true;

const ws = new WebSocket("ws://localhost:8000");

//shuffle array of participants so order of meeting isn't the same for every meeting
function shuffleArray(array: any) {
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

    function upHandler({key}: { key: string }) {
        if (key === targetKey) {
            setKeyPressed(false);
        }
    }

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
    const downPress = useKeyPress("ArrowDown");
    const upPress = useKeyPress("ArrowUp");

    const [pres, setPres] = useState<IPresenter[]>([]); //array of presenters

    const [selected, setSelected] = useState<IPresenter>(); //active presenter
    const [before, setBefore] = useState<IPresenter>(); //previous active presenter

    const [cursor, setCursor] = useState<number>(-1); //index of active presenter

    const [realTime, setTime] = useState<number>(0);

    //index of pres that time is currently being taken from
    const [lastIndex, setLastIndex] = useState<number>(0);
    //time that has been subtracted from pres when active pres is overtime
    const [amountSubtract, setAmountSubtract] = useState<number>(0);

    //total (compressed) time of all presenters
    const [totTime, setTotTime] = useState<number>(0);

    //difference between meeting len and total time of presenters
    const [diff, setDiff] = useState<number>(0);
    const [compressIndex, setCompressIndex] = useState<number>(cursor + 1);

    const [meetingLen, setMeetingLen] = useState<number>(0);
    const [tempMeeting, setTempMeeting] = useState<number>();

    const [origBonus, setOrigBonus] = useState<number>(0);
    const [bonusTime, setBonus] = useState<number>(0);

    //boolean values to display menu/dropdown text
    const [meetingLenMenu, setMeetingLenMenu] = useState(false);
    const [addPresMenu, setAddPresMenu] = useState(false);
    const [presenterWarning, setPresenterWarning] = useState(false);

    ws.addEventListener('open', function () {
        console.log("Connected to server");
    });
    ws.onmessage = (event) => {
        if (event.data === 'downPress') {
            downPressFn();
        } else if (event.data === 'upPress') {
            upPressFn();
        } else if (event.data === 'refresh') {
            window.location.reload();
        } else if (JSON.parse(event.data).name === 'deletePres') {
            const object = JSON.parse(event.data);
            deletePresHelper(object.index)
        } else if (JSON.parse(event.data).name === 'addPres') {
            const object = JSON.parse(event.data);
            addPresHelper(object.newPres)
        } else if (JSON.parse(event.data).name === 'meetingLen') {
            const object = JSON.parse(event.data);
            setMeetingLen(object.meetingLen * 1000)
        } else if (JSON.parse(event.data).name === 'presOrder') {
            const object = JSON.parse(event.data);
            setPres(object.pres)
        }
    }
    const toggleMeetingLenMenu = () => {
        setMeetingLenMenu(!meetingLenMenu);
        if (addPresMenu) {
            setAddPresMenu(false)
        }
    }
    const closeMenu = () => {
        setMeetingLenMenu(false);
        setAddPresMenu(false);
    }
    const toggleAddPresMenu = () => {
        setAddPresMenu(!addPresMenu);
        if (meetingLenMenu) {
            setMeetingLenMenu(false)
        }
    }
    const togglePresenterWarning = () => {
        setPresenterWarning(!presenterWarning);
    }

    function getLongestName() {
        let longest = '';
        for (let i = 0; i < pres.length; i++) {
            if (pres[i].name.length >= longest.length) {
                longest = pres[i].name;
            }
        }
        return longest.length;
    }
    //returns special case text for addPres functionality
    function dropDownText() {
        if ((cursor === pres.length && bonusTime > 0)) {
            return 'Unable to add presenters during bonus time'
        } else {
            return 'Presenter already in meeting!'
        }
    }

    function playTrumpetSound() {
            trumpetSound.muted = false;
            const playPromise = trumpetSound.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(_ => {
                        console.log("audio played auto");
                    })
                    .catch(error => {
                        console.log(error);
                    });
            }
    }

    //if pres takes less than set time
    function presUnderTime() {
        if (selected !== undefined) {
            if (selected.overtime === 0 && realTime < selected.time) {
                let difference = selected.time - realTime;
                let presDecreased = numDecreased();
                //if other pres are under time
                if (presDecreased > 0) {
                    let subtract = Math.floor(difference / presDecreased)
                    //increase subsequent pres that are under time (until they are back to their set times)
                    for (let i = cursor + 1; i < pres.length; i++) {
                        if (pres[i].time < pres[i].initTime) {
                            pres[i].time += subtract;
                            difference -= subtract;
                        }
                    }
                    for (let i = cursor + 1; i < pres.length; i++) {
                        while (difference > 0 && pres[i].time < pres[i].initTime) {
                            pres[i].time += 1;
                            difference -= 1;
                        }
                    }
                }
                if (difference > 0) {
                    setBonus(bonusTime + difference);
                }
                selected.extra += selected.time - realTime
            }
        }
    }

    function beforeUnderTime(){
        if (before !== undefined) {
            //if slot before took less than designated time
            if (before.extra > 0) {
                let difference = before.extra;
                let presDecreased = numDecreased();
                before.extra = 0;
                if (presDecreased > 0) {
                    let subtract = Math.floor(difference / presDecreased)
                    for (let i = cursor + 1; i < pres.length; i++) {
                        pres[i].time -= subtract;
                        difference -= subtract;
                    }
                    //increase subsequent slots that are under time (until they are back to their set times)
                    for (let i = cursor + 1; i < pres.length; i++) {
                        while (difference > 0 && pres[i].time < pres[i].initTime) {
                            pres[i].time -= 1;
                            difference -= 1;
                        }
                    }
                } else {
                    setBonus(bonusTime - difference);
                }
            }
        }
    }

    function downPressFn() {
        //play sound only when meeting starts (cursor = -1 --> cursor = 0)
        if (cursor === -1) {
            playTrumpetSound();
        }
        setLastIndex(1);
        presUnderTime();
        if (cursor < pres.length) {
            setCursor(prevState =>
                prevState < pres.length ? prevState + 1 : prevState)
        } else {
            setCursor(pres.length + 1);
        }
        setBefore(pres[cursor])
        setSelected(pres[cursor + 1]);
    }

    function upPressFn() {
        setLastIndex(1);
        beforeUnderTime();
        setBefore(pres[cursor - 2]);
        setCursor(prevState => (prevState > 0 ? prevState - 1 : prevState));
        setSelected(pres[cursor - 1]);
    }

    //set time of each presenter back to original non compressed time
    function resetPres() {
        for (let i = 0; i < pres.length; i++) {
            pres[i].initTime = pres[i].nonCompressedTime;
            pres[i].time = pres[i].nonCompressedTime;
        }
        setTotTime(getTotTime())
    }

    //returns total (compressed) time of presenters
    const getTotTime = () => {
        let totTime = 0;
        for (let i = 0; i < pres.length; i++) {
            totTime += pres[i].time + pres[i].overtime - pres[i].extra;
        }
        return totTime;
    }

    //get time from presenter
    const timeCallback = (presenterTime: number) => {
        setTime(presenterTime);
    }

    //compress time of presenters if meetingLen< total time of presenters
    function compressPres() {
        if (pres[compressIndex] !== undefined) {
            if (pres[compressIndex].time > 1000) {
                pres[compressIndex].initTime -= 1000;
                pres[compressIndex].time -= 1000;
                setDiff(diff - 1000)
            }
            setCompressIndex(compressIndex + 1);
            if (compressIndex === pres.length - 1) {
                setCompressIndex(cursor + 1);
            }
        }
        setTotTime(getTotTime());
    }

    useEffect(() => { //get meeting length and presenters at start
        fetchPres();
        fetchMeetingLen()
    }, [])
    useEffect(() => {
        if (meetingLen > totTime) {
            setOrigBonus(meetingLen - totTime);
            setDiff(0)
        } else {
            setOrigBonus(0)
            if (meetingLen < totTime) {
                setDiff(totTime - meetingLen)
            }
        }
    }, [totTime, meetingLen])
    useEffect(() => {
        if (diff > 0 && totTime !== pres.length * 1000) {
            compressPres();
        }
    }, [compressIndex, diff])
    useEffect(() => {
        resetPres(); //reset pres times when meeting len changes
        setCompressIndex(0) //if need be, compress pres time beginning with the first pres
    }, [meetingLen])
    useEffect(() => { //when delete/add pres, get and set new total time
        setTotTime(getTotTime())
    }, [pres])
    useEffect(() => { //set bonusTime when origBonus changes
        setBonus(origBonus)
    }, [origBonus])
    useEffect(() => {
        if (selected !== undefined) {
            //if person goes overtime
            if (realTime > Math.round(selected.time - selected.extra) && !(cursor === pres.length - 1 && bonusTime <= 0)) {
                //increase selected.overtime so their box increases in size
                //only increase box when there is bonusTime or other people's time left to take from
                if (isTimeLeft() || bonusTime > 0) {
                    selected.overtime = (realTime - Math.round(selected.time - selected.extra));
                }
                //decrease other slots if bonusTime == 0
                if (bonusTime < 100) {
                    if (isTimeLeft()) {
                        let reducedSlot2 = cursor + lastIndex;
                        pres[reducedSlot2].time -= 100;
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

    const getPercent = (presenter: IPresenter): number => {
        let percent = (presenter.time - presenter.extra + presenter.overtime);
        percent = percent / (totTime + bonusTime) * 100
        if (percent < 6.5) {
            return (6.5);
        }
        return percent;
    }
    const handleDeletePres = (_id: string, index: number): void => {
        deletePres(_id)
            .then(({status,}) => {
                if (status !== 200) {
                    throw new Error('Error! Presenter not deleted')
                } else {
                    console.log(index)
                    var msg = {name: "deletePres", index: index}
                    ws.send(JSON.stringify(msg))
                }
            })
            .catch((err) => console.log(err))
    }
    useEffect(() => {
        window.onbeforeunload = () => {
            if (window.location.pathname === '/admin') {
                ws.send('refresh')
            }
        }
    })
    const deletePresHelper = (index: number) => {
        pres.splice(index, 1);
        setPres(pres)
        resetPres()
        var msg = {name: "presOrder", pres: pres}
        ws.send(JSON.stringify(msg))
    }

    const isTimeLeft = () => {
        for (let i = cursor + 1; i < pres.length; i++) {
            if (pres[i].time > 1000) {
                return true
            }
        }
        return false;
    }

    const numDecreased = (): number => {
        let numDecreased = 0;
        for (let i = cursor + 1; i < pres.length; i++) {
            if (pres[i].initTime > pres[i].time) {
                numDecreased += pres[i].initTime - pres[i].time;
            }
        }
        return numDecreased;
    }
    useEffect(() => {
        if (cursor + lastIndex >= pres.length && isTimeLeft()) {
            setLastIndex(1);
        }
    }, [lastIndex, cursor, pres])
    useEffect(() => {
        if (presenterWarning) {
            setTimeout(() => {
                togglePresenterWarning();
            }, 1000)
        }
    }, [presenterWarning])
    useEffect(() => {
        if (cursor >= 0 && (cursor + lastIndex) < pres.length && pres[cursor + lastIndex].time <= 1000 && isTimeLeft()) {
            setLastIndex(lastIndex + 1)
        }
    }, [lastIndex, cursor, pres])
    useEffect(() => {
        if (downPress && window.location.pathname === '/admin') {
            ws.send('downPress')
        }
    }, [downPress]);

    useEffect(() => {
        if (upPress && window.location.pathname === '/admin') {
            ws.send('upPress')
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
        const newList = pres.filter((_: any, idx: number) => idx !== source.index)
        // Then insert the item at the right location
        newList.splice(destination.index, 0, pres[source.index])
        // Update the list
        setPres(newList)
        var msg = {name: "presOrder", pres: newList}
        ws.send(JSON.stringify(msg))
        window.scrollTo(0, 0)
    }

    const fetchPres = (): void => {
        getPresDatabase()
            .then(({data: {pres}}: IPresenter[] | any) =>
                shufflePres(pres))
            .catch((err: Error) => console.log(err));
    }

    function shufflePres(inputPres: IPresenter[]) {
        let namesList: string[] = [];
        let finalList: IPresenter[] = [];
        let presList: IPresenter[] = [];
        let otherList: IPresenter[] = [];
        let interns = ['Daron', 'Srishti', 'Matthew', 'Vikram', 'Saralin', 'Damien', 'Tobias', 'Karthik', 'Michael']
        let fullTimers = ['Jo', 'Kendra', 'Qian', 'Bon', 'David', 'Frederik']
        let finalWord = ['Fraser', 'Justin']
        shuffleArray(interns);
        shuffleArray(fullTimers);
        shuffleArray(finalWord)
        let orderList = interns.concat(fullTimers, finalWord);

        inputPres.forEach(element => {
            if (orderList.includes(element.name)) {
                namesList.push(element.name);
                presList.push(element)
            } else {
                otherList.push(element)
            }
        });
        otherList.forEach(element => {
            finalList.push(element);
        });
        for (let i = 0; i < orderList.length; i++) {
            if (namesList.includes(orderList[i])) {
                let file = presList[namesList.indexOf(orderList[i])]
                finalList.push(file);
            }
        }
        for (let i = 0; i < finalList.length; i++) {
            finalList[i].time = finalList[i].time * 1000;
            finalList[i].initTime = finalList[i].initTime * 1000;
            finalList[i].nonCompressedTime = finalList[i].nonCompressedTime * 1000;
        }
        setPres(finalList);
        var msg = {name: "presOrder", pres: finalList}
        ws.send(JSON.stringify(msg))
    }

    function fetchMeetingLen() {
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
            var msg = {name: "meetingLen", meetingLen: meetingLen}
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
    const handleSavePres = (e: React.FormEvent, formData: IPresenter): void => {
        e.preventDefault()
        addPres(formData)
            .then(({status, data}) => {
                if (status !== 201) {
                    throw new Error('Error! Presenter not saved')
                }
                if (data.presenter) {
                    let result = pres.map(a => a.name);
                    if (!result.includes(data.presenter.name) && !(cursor === pres.length && bonusTime > 0)) {
                        var msg = {name: "addPres", newPres: data.presenter}
                        ws.send(JSON.stringify(msg))
                    } else {
                        togglePresenterWarning()
                    }
                }

            })
            .catch((err) => console.log(err))
    }
    const addPresHelper = (newPres: IPresenter) => {
        newPres.time = newPres.time * 1000;
        newPres.nonCompressedTime = newPres.nonCompressedTime * 1000;
        newPres.initTime = newPres.initTime * 1000;

        pres.push(newPres)
        setPres(pres)
        var msg = {name: "presOrder", pres: pres}
        ws.send(JSON.stringify(msg))
    }
    return (
        <Router>
            <main className='App' id="behindComponent">
                <Switch>
                    <Route exact path="/">
                        <DragDropContext onDragEnd={onDragEnd}>
                            <div className='test' style={{marginRight: '3.2%'}}>
                                <div style={{display: 'flex', flexDirection: 'row'}}>
                                    <h1 style={{fontSize: '30px', flex: '1 1', color: 'black'}}>Research Project Updates
                                        Meeting </h1>
                                    <div className="headerWrapper" style={{alignContent: 'right', textAlign: 'right'}}>
                                        <div style={{fontSize: '20px', fontWeight: 'bold'}}> {meetingLen / 1000} min
                                        </div>
                                        <DateComp/>
                                    </div>
                                </div>
                                <Droppable droppableId='col-1' isDropDisabled={true}>
                                    {provided => {
                                        const style = {
                                            color: 'black',
                                            ...provided.droppableProps,
                                        };
                                        return (
                                            <ul className="characters"
                                                {...provided.droppableProps} ref={provided.innerRef} style={style}>
                                                {pres.map((presenter: IPresenter, index) => (
                                                    <Presenter
                                                        admin={false}
                                                        key={presenter._id}
                                                        presenter={presenter}
                                                        deletePresApp={handleDeletePres}
                                                        index={index}
                                                        active={index === cursor}
                                                        done={index < cursor}
                                                        callbackFromParent={timeCallback}
                                                        percent={getPercent(presenter)}
                                                        bonusTime={bonusTime}
                                                        longestName={getLongestName()}
                                                    />
                                                ))}
                                                {provided.placeholder}
                                                <Bonus
                                                    origBonus={origBonus} time={bonusTime}
                                                    active={cursor === pres.length}
                                                    done={cursor === pres.length + 1}
                                                    percent={(bonusTime) / (totTime + bonusTime) * 100}/>
                                            </ul>)
                                    }}

                                </Droppable>
                            </div>
                        </DragDropContext>
                    </Route>
                    <Route exact path="/admin">
                        <DragDropContext onDragEnd={onDragEnd}>
                            <form className="meetingLen1" onSubmit={handleFormOnSubmit}
                                  style={{display: !meetingLenMenu ? 'none' : ''}}>
                                <label> Meeting Length:
                                    <input className="inputMeetingLen" onKeyDown={handleForm}
                                           onSubmit={handleFormOnSubmit}
                                           type={meetingLenMenu ? "number" : "string"}
                                           onChange={(e: any) => setTempMeeting(e.target.value)}
                                           value={tempMeeting || ""}
                                           id='meetingLen'/> min
                                </label>
                                <button className="buttonStyle" disabled={tempMeeting === undefined}
                                        type='submit'>Submit
                                </button>
                                <button className="xOutMeetingLen" onClick={toggleMeetingLenMenu}>x</button>
                            </form>
                            <div className="meetingLenWrapper">
                                <div className="meetingLen" style={{display: !addPresMenu ? 'none' : ''}}>
                                    <AddPres savePres={handleSavePres}/>
                                    <button className="xOutMeetingLen" onClick={toggleAddPresMenu}>x</button>
                                </div>
                                <div className='meetingLen'
                                     style={{
                                         width: '13%', opacity: !presenterWarning ? 0 : '100%', transition:
                                             !presenterWarning ? 'opacity 5s' : 'opacity 1s'
                                     }}> {dropDownText()}</div>
                            </div>
                            <div className='test' onClick={closeMenu}>
                                <div style={{display: 'flex', flexDirection: 'row'}}>
                                    <h1 style={{fontSize: '30px', flex: '1 1', color: 'black'}}>Research Project Updates
                                        Meeting </h1>
                                    <div className="headerWrapper" style={{alignContent: 'right', textAlign: 'right'}}>
                                        <div style={{fontSize: '20px', fontWeight: 'bold'}}> {meetingLen / 1000} min
                                        </div>
                                        <DateComp/>
                                    </div>
                                </div>
                                <Droppable droppableId='col-1' isDropDisabled={false}>
                                    {provided => {
                                        const style = {
                                            color: 'black',
                                            ...provided.droppableProps,
                                        };
                                        return (
                                            <ul className="characters"
                                                {...provided.droppableProps} ref={provided.innerRef} style={style}>
                                                {pres.map((presenter: IPresenter, index) => (
                                                    <Presenter
                                                        admin={true}
                                                        key={presenter._id}
                                                        presenter={presenter}
                                                        deletePresApp={handleDeletePres}
                                                        index={index}
                                                        active={index === cursor}
                                                        done={index < cursor}
                                                        callbackFromParent={timeCallback}
                                                        percent={getPercent(presenter)}
                                                        bonusTime={bonusTime}
                                                        longestName={getLongestName()}
                                                    />
                                                ))}
                                                {provided.placeholder}
                                                <Bonus
                                                    origBonus={origBonus} time={bonusTime}
                                                    active={cursor === pres.length}
                                                    done={cursor === pres.length + 1}
                                                    percent={(bonusTime) / (totTime + bonusTime) * 100}/>
                                            </ul>)
                                    }}

                                </Droppable>
                            </div>
                            <div className="topButton">
                                <div className="dropdown"><MdSettings size={26} color='rgb(200,200,200)'/>
                                    <div className="dropdown-content">
                                        <div className="option" onClick={toggleMeetingLenMenu}>Meeting length</div>
                                        <div className="option" onClick={toggleAddPresMenu}>Add Presenter</div>
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
