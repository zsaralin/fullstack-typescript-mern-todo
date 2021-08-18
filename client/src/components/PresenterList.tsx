import React from 'react'
import Header from "./Header";
import {Droppable} from "react-beautiful-dnd";
import Presenter from "./Presenter";
import Bonus from "./Bonus";
import './cssFiles/PresenterList.css'

function PresenterList(props: {
    meetingLen: number, isAdmin: boolean, pres: IPresenter[] ,
    cursor: number, bonusTime: number, origBonus: number, totTime: number,
    bonusActive: boolean, bonusDone: boolean,closeMenu:()=>void,
    timeCallback:(presenterTime: number)=>void,
    handleDeletePres:(_id: string, index: number)=>void }) {

    let SETTINGS_WIDTH = '3.2%'; //width of settings button

    //returns height (in percent) of presenter's slot
    const getHeight = (presenter: IPresenter): number => {
        let height = (presenter.time - presenter.extra + presenter.overtime);
        height = height / (props.totTime + props.bonusTime) * 100
        if (height < 6.5) {
            return (6.5); //minimum height
        }
        return height;
    }

    //returns length of longest pres name (to ensure same width for name component of all presenters)
    function getLongestName() {
        let longest = '';
        for (let i = 0; i < props.pres.length; i++) {
            if (props.pres[i].name.length >= longest.length) {
                longest = props.pres[i].name;
            }
        }
        return longest.length;
    }

    return (
        <div className='presWrapper' style={{marginRight: props.isAdmin ? '0' : SETTINGS_WIDTH}}
             onClick={props.closeMenu}>
            <Header meetingLen={props.meetingLen}/>
            <Droppable droppableId='col-1' isDropDisabled={!props.isAdmin}>
                {provided => {
                    return (
                        <ul className="pres"
                            {...provided.droppableProps} ref={provided.innerRef}>
                            {props.pres.map((presenter: IPresenter, index) => (
                                <Presenter
                                    key={presenter._id} presenter={presenter} index={index}
                                    active={index === props.cursor} done={index < props.cursor}
                                    height={getHeight(presenter)} bonusTime={props.bonusTime}
                                    callbackFromParent={props.timeCallback}
                                    longestName={getLongestName()}
                                    deletePresApp={props.handleDeletePres}
                                    admin={props.isAdmin}
                                />
                            ))}
                            {provided.placeholder}
                            <Bonus
                                origBonus={props.origBonus} time={props.bonusTime}
                                active={props.bonusActive} done={props.bonusDone}
                                height={(props.bonusTime) / (props.totTime + props.bonusTime) * 100}/>
                        </ul>)
                }}
            </Droppable>
        </div>)
}

export default PresenterList
