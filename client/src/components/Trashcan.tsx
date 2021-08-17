import React from 'react'
import {FaRegTrashAlt} from "react-icons/fa";
import './cssFiles/Trashcan.css';

function Trashcan(props: { active: boolean, done: boolean, admin: boolean,
    _id: string, index: number,
    deletePres: (_id: string, index: number) => void}) {
    return (
        <button className="trashWrapper" disabled={props.active || props.done}
                style={{
                    display: !props.admin ? 'none' : '',
                    cursor: !props.active && !props.done ? 'pointer' : 'default'
                }}
                onClick={() => props.deletePres(props._id, props.index)}
        ><FaRegTrashAlt className="trashcan"/>
        </button>)
}
export default Trashcan
