import React, {useEffect, useState} from 'react'
import Settings from "./components/Settings";
import PresenterList from "./components/PresenterList";
import MeetingLenMenu from "./components/MeetingLenMenu";
import AddPresMenu from "./components/AddPresMenu";

import {DragDropContext, DropResult} from 'react-beautiful-dnd'
import {getPresDatabase, addPres, deletePres, getMeetingLen, postMeetingLen} from './API'
import {BrowserRouter as Router, Route, Switch,} from "react-router-dom";

// @ts-ignore
import audio from './fanfare.mp3';
import TimeMenu from "./components/TimeMenu";

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
    const [lastIndex, setLastIndex] = useState<number>(1);

    //time that has been subtracted from pres when active pres is overtime
    const [amountSubtract, setAmountSubtract] = useState<number>(0);

    //total (compressed) time of all presenters
    const [totTime, setTotTime] = useState<number>(0);

    //difference between meeting len and total time of presenters
    const [diff, setDiff] = useState<number>(0);
    const [compressIndex, setCompressIndex] = useState<number>(cursor + 1);

    const [meetingLen, setMeetingLen] = useState<number>(0);
    // const [tempMeeting, setTempMeeting] = useState<number>();

    const [origBonus, setOrigBonus] = useState<number>(0);
    const [bonusTime, setBonus] = useState<number>(0);

    //boolean values to display menu/dropdown text
    const [meetingLenMenu, setMeetingLenMenu] = useState(false);
    const [addPresMenu, setAddPresMenu] = useState(false);
    const [timeMenu, setTimeMenu] = useState(false);
    const [presenterWarning, setPresenterWarning] = useState(false);

    //meeting in seconds (for demo) or minutes (for actual meetings)
    const [isDemo, setDemo] = useState(false);

    let isAdmin = window.location.pathname === '/admin' //true if pathname is admin
    let bonusActive = cursor === pres.length && bonusTime > 0//true when bonus time is active
    let bonusDone = cursor === pres.length + 1 && bonusTime > 0//true when bonus time is done

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
    //drag and drop presenters
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
        //send new order to all clients
        const msg = {name: "presOrder", pres: newList}
        ws.send(JSON.stringify(msg))
        window.scrollTo(0, 0)
    }
    const toggleMeetingLenMenu = () => {
        setMeetingLenMenu(!meetingLenMenu);
        setAddPresMenu(false)
        setTimeMenu(false);
    }
    const toggleTimeMenu = () => {
        setTimeMenu(!timeMenu);
        setAddPresMenu(false)
        setMeetingLenMenu(false)
    }
    const toggleAddPresMenu = () => {
        setAddPresMenu(!addPresMenu);
        setMeetingLenMenu(false)
        setTimeMenu(false)
    }
    const togglePresenterWarning = () => {
        setPresenterWarning(!presenterWarning);
    }
    const closeMenu = () => {
        if (isAdmin) {
            setMeetingLenMenu(false);
            setAddPresMenu(false);
            setTimeMenu(false)
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
                let presDecreased = getTimeLost();
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
                setBonus(bonusTime + difference);

                selected.extra += selected.time - realTime
            }
        }
    }

    function beforeUnderTime() {
        if (before !== undefined) {
            //if slot before took less than designated time
            if (before.extra > 0) {
                let difference = before.extra;
                let timeLost = getTimeLost();
                before.extra = 0;
                if (timeLost > 0) {
                    let subtract = Math.floor(difference / timeLost)
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

    function presOvertime() {
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
                        if (cursor + lastIndex >= pres.length) { //reset lastIndex at 1
                            setLastIndex(getLastIndex(1));
                        }
                        pres[cursor + lastIndex].time -= 100;
                        setAmountSubtract(amountSubtract + 100)
                        if (amountSubtract === 1000) { //when 1 minute has been taken from presenter, move to next presenter
                            if (lastIndex + 1 < pres.length) {
                                setLastIndex(getLastIndex(lastIndex + 1));
                            }
                            //if presenter with index = cursor + lastIndex is <= 1 minute, begin taking time from next presenter
                            else { //reset lastIndex at 1 if cursor + lastIndex >= pres.length
                                setLastIndex(getLastIndex(1));
                            }
                            setAmountSubtract(0)
                        }
                    }
                } else if (bonusTime >= 100) { //decrease bonusTime
                    setBonus(bonusTime - 100)
                }
            }
        }
    }

    //time is taken from presenter with index = cursor + lastIndex when active pres is overtime
    function getLastIndex(lastIndex: number) {
        //find next presenter with time > 1 min
        for (let i = cursor + lastIndex; i < pres.length; i++) {
            if (pres[i].time > 1000) {
                return i - cursor;
            }
        }
        //if no presenter following lastIndex with time > 1 min and presenter at cursor + 1 has time < 1
        //find next presenter after cursor + 1 with time > 1 min
        if (pres[cursor + 1].time <= 1000) {
            for (let i = cursor + 2; i < pres.length; i++) {
                if (pres[i].time > 1000) {
                    return i - cursor;
                }
            }
        } //otherwise, return 1 (reset lastIndex at 1)
        return 1;
    }

    //when down key is pressed
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

    //when up key is pressed
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

    //returns total (compressed) time of presenters
    const getTotTime = () => {
        let totTime = 0;
        for (let i = 0; i < pres.length; i++) {
            totTime += pres[i].time + pres[i].overtime - pres[i].extra;
        }
        return totTime;
    }
    //returns true if any presenter has time > 1 minute
    const isTimeLeft = () => {
        for (let i = cursor + 1; i < pres.length; i++) {
            if (pres[i].time > 1000) {
                return true
            }
        }
        return false;
    }
    //returns total time lost for all presenters (from people going overtime)
    const getTimeLost = (): number => {
        let timeLost = 0;
        for (let i = cursor + 1; i < pres.length; i++) {
            if (pres[i].initTime > pres[i].time) {
                timeLost += pres[i].initTime - pres[i].time;
            }
        }
        return timeLost;
    }

    //change meeting style (seconds or minutes)
    function changeMeetingStyle(){
        setDemo(!isDemo)
    }

    useEffect(() => { //get meeting length and presenters at start
        fetchMeetingLen()
    }, [])
    useEffect(() => { //get meeting length and presenters at start
        fetchPres();
    }, [])
    useEffect(() => { //when delete/add pres, get and set new total time
        setTotTime(getTotTime())
    }, [pres])
    useEffect(() => {
        if (meetingLen > totTime) { //set bonus time
            setOrigBonus(meetingLen - totTime);
            setDiff(0)
        } else {
            setOrigBonus(0) //set diff to trigger compressPres
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
        setCompressIndex(0) //reset start index for compress pres
        resetPres(); //reset pres times when meeting len changes
    }, [meetingLen])
    useEffect(() => { //set bonusTime when origBonus changes
        setBonus(origBonus)
    }, [origBonus])
    useEffect(() => {
        presOvertime() //
    }, [realTime])
    useEffect(() => { //refresh all clients if admin refreshes
        window.onbeforeunload = () => {
            if (isAdmin) {
                ws.send('refresh')
            }
        }
    })
    useEffect(() => {
        if (presenterWarning) {
            setTimeout(() => {
                togglePresenterWarning();
            }, 1000)
        }
    }, [presenterWarning])

    //delete pres in database
    const handleDeletePres = (_id: string, index: number): void => {
        deletePres(_id)
            .then(({status,}) => {
                if (status !== 200) {
                    throw new Error('Error! Presenter not deleted')
                } else {
                    //send index of deleted pres to all clients
                    const msg = {name: "deletePres", index: index};
                    ws.send(JSON.stringify(msg))
                }
            })
            .catch((err) => console.log(err))
    }
    //delete pres in frontend
    const deletePresHelper = (index: number) => {
        pres.splice(index, 1);
        setPres(pres)
        resetPres()
        //ensure same order of presenters after pres is deleted
        const msg = {name: "presOrder", pres: pres}
        ws.send(JSON.stringify(msg))
    }
    //only admin can control the meeting with up/down keys
    useEffect(() => {
        if (downPress && isAdmin) {
            ws.send('downPress')
        }
    }, [downPress]);
    useEffect(() => {
        if (upPress && isAdmin) {
            ws.send('upPress')
        }
    }, [upPress]);

    //get pres from database, and shuffle order
    const fetchPres = (): void => {
        getPresDatabase()
            .then(({data: {pres}}: IPresenter[] | any) =>
                shufflePres(pres))
            .catch((err: Error) => console.log(err));
    }

    //shuffle pres
    function shufflePres(inputPres: IPresenter[]) {
        //hardcoded arrays
        let interns = ['Daron', 'Srishti', 'Matthew', 'Vikram', 'Saralin', 'Damien', 'Tobias', 'Karthik', 'Michael']
        let fullTimers = ['Jo', 'Kendra', 'Qian', 'Bon', 'David', 'Frederik']
        let finalWord = ['Fraser', 'Justin']

        let namesList: string[] = [];
        let finalList: IPresenter[] = [];
        let presList: IPresenter[] = [];
        let otherList: IPresenter[] = []; //presenters not in hardcoded arrays

        //shuffle each array
        shuffleArray(interns);
        shuffleArray(fullTimers);
        shuffleArray(finalWord)
        //combine 3 arrays into one
        let orderedList = interns.concat(fullTimers, finalWord);

        inputPres.forEach(element => {
            if (orderedList.includes(element.name)) {
                namesList.push(element.name);
                presList.push(element)
            } else {
                otherList.push(element)
            }
        });
        //add other presenters (not in hardcoded arrays) to final list
        otherList.forEach(element => {
            finalList.push(element);
        });
        for (let i = 0; i < orderedList.length; i++) {
            if (namesList.includes(orderedList[i])) {
                let file = presList[namesList.indexOf(orderedList[i])]
                finalList.push(file);
            }
        }
        for (let i = 0; i < finalList.length; i++) {
            minToSec(finalList[i]);
        }

        setPres(finalList);
        //send order of presenters to each client
        const msg = {name: "presOrder", pres: finalList}
        ws.send(JSON.stringify(msg))
    }

    //convert time (minutes in DB) to seconds
    function minToSec(pres: IPresenter) {
        pres.time = pres.time * 1000;
        pres.initTime = pres.initTime * 1000;
        pres.nonCompressedTime = pres.nonCompressedTime * 1000;
    }

    //get meetingLen from database, set meetingLen in seconds
    function fetchMeetingLen() {
        getMeetingLen()
            .then(({data: {meetingLen}}: number | any) => setMeetingLen(meetingLen * 1000))
            .catch((err: Error) => console.log(err));
    }

    //update meetingLen in database, set meetingLen in seconds
    const handleMeetingLen = (e: React.FormEvent, meetingLen: number | undefined): void => {
        e.preventDefault()
        if (meetingLen !== undefined) {
            postMeetingLen(meetingLen).then(response => {
                console.log(response)
            });
            setMeetingLen(meetingLen * 1000)
            setMeetingLenMenu(false)
            //send new meetingLen to each client
            const msg = {name: "meetingLen", meetingLen: meetingLen}
            ws.send(JSON.stringify(msg))
        }
    }

    const handleAddPres = (e: React.FormEvent, formData: IPresenter): void => {
        e.preventDefault()
        let presNames = pres.map(a => a.name); //array of pres names
        //if new presenter name does not already exist in pres array AND bonus time is not active --> add pres
        if (!presNames.includes(formData.name) && !bonusActive) {
            addPres(formData)
                .then(({status, data}) => {
                    if (status !== 201) {
                        throw new Error('Error! Presenter not saved')
                    } else if (data.presenter) {
                        const msg = {name: "addPres", newPres: data.presenter}
                        ws.send(JSON.stringify(msg))
                        setAddPresMenu(false)
                    }
                })
                .catch((err) => console.log(err))
        } else { //display warning as either presenter name is not unique, or bonus time is active
            togglePresenterWarning()
        }
    }
    //add pres to frontend
    const addPresHelper = (newPres: IPresenter) => {
        minToSec(newPres) //convert time to seconds
        pres.push(newPres) //add new pres to pres array
        setPres(pres) //update state of pres array
        resetPres()
        const msg = {name: "presOrder", pres: pres} //send new order of presenters to each client
        ws.send(JSON.stringify(msg))
    }

    return (
        <Router>
            <main className='App'>
                <Switch>
                    <Route exact path="/">
                        <DragDropContext onDragEnd={onDragEnd}>
                            <PresenterList
                                meetingLen={meetingLen} isAdmin={isAdmin} pres={pres}
                                cursor={cursor} bonusTime={bonusTime} origBonus={origBonus} totTime={totTime}
                                bonusActive={bonusActive} bonusDone={bonusDone} closeMenu={closeMenu}
                                timeCallback={timeCallback} handleDeletePres={handleDeletePres}/>
                        </DragDropContext>
                    </Route>
                    <Route exact path="/admin">
                        <DragDropContext onDragEnd={onDragEnd}>
                            <MeetingLenMenu meetingLenCallback={handleMeetingLen}
                                            meetingLenMenu={meetingLenMenu}
                                            toggleMeetingLenMenu={toggleMeetingLenMenu}/>
                            <AddPresMenu toggleAddPresMenu={toggleAddPresMenu} addPresMenu={addPresMenu}
                                         bonusActive={bonusActive} handleAddPres={handleAddPres}
                                         presenterWarning={presenterWarning}/>
                            <PresenterList
                                meetingLen={meetingLen} isAdmin={isAdmin} pres={pres}
                                cursor={cursor} bonusTime={bonusTime} origBonus={origBonus} totTime={totTime}
                                bonusActive={bonusActive} bonusDone={bonusDone} closeMenu={closeMenu}
                                timeCallback={timeCallback} handleDeletePres={handleDeletePres}/>
                            <TimeMenu changeMeetingStyle={changeMeetingStyle} toggleTimeMenu={toggleTimeMenu} isDemo={isDemo}
                            timeMenu={timeMenu}/>
                            <Settings toggleMeetingLenMenu={toggleMeetingLenMenu}
                                      toggleAddPresMenu={toggleAddPresMenu} toggleTimeMenu={toggleTimeMenu}/>
                        </DragDropContext>
                    </Route>
                </Switch>
            </main>
        </Router>
    );
}

export default App
