import React, {useEffect, useState} from 'react'
import {Draggable} from 'react-beautiful-dnd'

import './cssFiles/Presenter.css';
import './cssFiles/DiagonalCrossOut.css'

import Timer from "./Timer";
import Slider from "./Slider";
import Trashcan from "./Trashcan";

const Presenter = (props: {
    presenter: IPresenter, percent: number,
    active: boolean, done: boolean, admin: boolean,
    index: number, bonusTime: number, longestName: number,
    callbackFromParent(parentTime: number): void,
    deletePresApp: (_id: string, index: number) => void
}) => {
    const [realTime, setTime] = useState<number>(0);
    let reducedTime = props.presenter.time - props.presenter.extra

    //colour constants
    let DARK_GREY = 'rgb(230,230,230)' //darker grey
    let LIGHT_GREY = 'rgb(240,240,240)' //light grey

    //display constants
    let disReducedTime = Math.ceil(reducedTime / 1000);
    let disTime = Math.ceil(props.presenter.time / 1000);
    let disInitTime = Math.ceil(props.presenter.initTime / 1000);

    //approximate width of trashcan
    let TRASH_WIDTH = '17.5%';
    //max width of name component for all presenters
    let MAX_NAME_WIDTH = 90 + 6 * props.longestName;

    //set time using time from Timer class
    const timeCallback = (timerTime: number) => {
        setTime(timerTime);
    }

    //send time of presenter to App class
    useEffect(() => {
        props.callbackFromParent(realTime)
    }, [realTime])

    //returns color to indicate how much of the designated time was used
    function getColor() {
        const diff = realTime - props.presenter.time
        //less than or equal to designated time + 1 minute
        if (realTime <= props.presenter.time + 1000) {
            return 'rgb(198,246,241)';
        } else if (props.bonusTime > 0) {
            if (diff > 4) { //overtime
                return 'rgb(254,188,254)';
            }
            if (diff > 1) { //slightly overtime
                return 'rgb(255,202,255)';
            }
            //overtime and no more bonus time (cutting into people's time)
        } else if (props.bonusTime < 1) {
            return 'rgb(252,190,236)';
        }
    }

    return (
        <Draggable draggableId={props.presenter._id} index={props.index}
                   isDragDisabled={props.done || props.active || !props.admin}>
            {provided => {
                const style = {
                    height: props.percent + '%', ...provided.draggableProps.style,
                    color: props.done ? 'grey' : '', //grey text when presenter is done
                };
                return (
                    <div className="card" ref={provided.innerRef}
                         {...provided.draggableProps}
                         {...provided.dragHandleProps} style={style}>
                        <Slider start={props.active}
                                time={(realTime < reducedTime) ? reducedTime : 0}/>
                        <div
                            className={(realTime < props.presenter.time) ? "cardForward cardWrap" : props.bonusTime > 0 ?
                                "cardReverse cardWrap" : "cardReverseNoBonus cardWrap"}
                            style={{
                                //gradient is paused when presenter is not active
                                animationPlayState: props.active ? 'running' : 'paused',
                                //presenter gradient, transition to darker pink (when cutting into other presenters' time)
                                animationDuration: reducedTime + 'ms, .5s',
                            }}>
                            <div className='name'
                                 style={{
                                     textDecoration: props.done ? 'line-through' : 'none',
                                     //ensure same width for name section of all presenters
                                     width: MAX_NAME_WIDTH + "px",
                                     backgroundColor: props.done ? getColor() : !props.active ? LIGHT_GREY : '',
                                     textIndent: !props.admin ? TRASH_WIDTH : '', //create index where trashcan usually is
                                 }}>
                                <Trashcan active={props.active} done={props.done} admin={props.admin} _id = {props.presenter._id}
                                          index = {props.index} deletePres={props.deletePresApp}/>
                                {props.presenter.name}
                            </div>
                            <div className='description' style={{
                                textDecoration: props.done ? 'line-through' : 'none',
                                backgroundColor: props.done ? LIGHT_GREY : !props.active ? DARK_GREY : '',
                            }}>{props.presenter.description}
                            </div>
                            <div className="time" style={{
                                backgroundColor: props.done ? LIGHT_GREY : !props.active ? DARK_GREY : '',
                            }}>
                                <div className="setTime">
                                    {disTime > disInitTime ? //time is greater than initial time
                                        <span style={{display: 'inline'}}>
                                        <span className="crossedOut">
                                            {disInitTime}</span>
                                            <span> {disTime}</span>
                                        </span> : props.active ? disReducedTime
                                            : disInitTime} min
                                </div>
                                <Timer callbackFromParent={timeCallback} active={props.active} done={props.done}/>
                            </div>
                        </div>
                    </div>
                )
            }}
        </Draggable>
    )
}
export default Presenter
