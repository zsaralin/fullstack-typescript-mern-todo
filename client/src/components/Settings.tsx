import React from 'react'
import {MdSettings} from "react-icons/md";

function Settings(props: {toggleMeetingLenMenu(): void; toggleAddPresMenu(): void; }) {
    return (
        <div className="topButton">
            <div className="dropdown"><MdSettings size={26} color='rgb(200,200,200)'/>
                <div className="dropdown-content">
                    <div className="option" onClick={props.toggleMeetingLenMenu}>Meeting length</div>
                    <div className="option" onClick={props.toggleAddPresMenu}>Add Presenter</div>
                </div>
            </div>
        </div>)
}
export default Settings
