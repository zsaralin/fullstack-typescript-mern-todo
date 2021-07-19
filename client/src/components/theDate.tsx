import React, { useState, useEffect } from 'react';

//Date component
export const DateComp = () => {
    const [theDate, setTheDate] = useState(new Date());

    useEffect(() => {
        const id = setInterval(() => setTheDate(new Date()));
        return () => {
            clearInterval(id);
        }
    }, []);

    return (
        <h4
        style = {{ fontSize: '20px', marginBottom: '3px'
        }}>{`${theDate.toLocaleDateString()}`}</h4>
    );

}

export default DateComp;