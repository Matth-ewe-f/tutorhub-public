import React, { useState, useEffect } from 'react';

const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const TimeSlot = ({ intervalIndex, selectActive, isSelected, onToggle }) => {
    const borderClass = intervalIndex % 2 !== 0 ? "border-dashed" : "border-solid";
    const backgroundColor = isSelected ? "bg-green-200" : "bg-white";
    return (
      <div
        className={`border-t border-black h-6 ${borderClass} ${backgroundColor} cursor-pointer`}
        onClick={selectActive ? () => onToggle(intervalIndex) : undefined}
      />
    );
};

const DayColumn = ({ day, selectActive, selections, onToggle }) => {
    const intervals = Array.from({ length: 48 }, (_, index) => index);
    
    return (
      <div className="flex flex-col border-y border-l border-black last:border-r">
        <div className="text-center font-bold">{day}</div>
        {intervals.map(interval => (
          <TimeSlot
            key={interval}
            intervalIndex={interval + daysOfWeek.indexOf(day) * 48} // Calculate global index based on day and local index
            selectActive={selectActive}
            isSelected={selections[interval + daysOfWeek.indexOf(day) * 48]}
            onToggle={onToggle}
          />
        ))}
      </div>
    );
};

const WeekGrid = ({ selectActive, selections, onToggle }) => {
    return (
        <div className="grid grid-cols-8"> 
            <HourLabels />
            {daysOfWeek.map((day, index) => (
                <DayColumn key={index} day={day} selectActive={selectActive} selections={selections} onToggle={onToggle} />
            ))}
        </div>
    );
};

const HourLabels = () => {
    const hours = Array.from({ length: 24 }, (_, index) => `${index}:00`);
    
    return (
      <div className="flex flex-col justify-between h-full py-3">
        {hours.map((hour, index) => (
          <div key={index} className="text-right text-xs pr-2 h-12 leading-6 font-bold">{hour}</div>
        ))}
      </div>
    );
};

const Page = ({ availability }) => {
    const [select, setSelect] = useState(false);
    const [selections, setSelections] = useState(new Array(336).fill(0));
  
    useEffect(() => {
      setSelections(availability);  
    }, [availability]); 
  
    const toggleSelection = (index) => {
      setSelections(prevSelections => {
        const newSelections = [...prevSelections];
        newSelections[index] = newSelections[index] === 0 ? 1 : 0;
        return newSelections;
      });
    };

    return (
    <div className="p-5">
        <WeekGrid selectActive={select} selections={selections} onToggle={toggleSelection} />
    </div>
    );
};

export default Page;