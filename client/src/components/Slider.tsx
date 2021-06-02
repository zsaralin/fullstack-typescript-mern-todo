import { GoTriangleRight } from 'react-icons/go';
import {IconContext} from "react-icons";
import React from 'react'
import './Slider.css'

function Slider(props: { start: boolean, time: number}){
        return(
            <div className = "slider" style = {{
                visibility: props.start? 'visible':'hidden',
                animationPlayState: props.start? 'running':'paused',
                animationDuration: props.start? props.time/**60*/ + 's':'0'}}>
                <IconContext.Provider value={{color: 'rgba(60, 60, 60, .6)' }}>
                    <GoTriangleRight  style= {{position: 'absolute', left:'-10px', top: '-12px', height: '30px'}} />
                </IconContext.Provider>
            </div>)
    }

export default Slider
