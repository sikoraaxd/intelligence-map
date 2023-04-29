import React, { useState } from "react";
import Table from "./_termtable";

type GraphData = {
    nodes: { id: string; group: number }[];
    links: { source: string; target: string }[];
};

type Props = {
    data: GraphData[];
    setData: (newValue: GraphData[]) => void;
};

const TermsPanel = ({ data, setData }: Props) => {
    const [inputValue, setInputValue] = useState('');

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
      };
    
      const handleButtonClick = () => {
        const newData = [...data];
        const topicIndex = newData[0].nodes.findIndex((node) => node.id === inputValue);
        if (topicIndex == -1) {
            console.log('here');
            newData[0].nodes.push({id: inputValue, group:2});
            setData(newData);
        }
        setInputValue('');
      };

    return (
        <div className="w-96 p-4 bg-blue-500 rounded-md" >
            <Table data={data} setData={setData} />
            
            <span>Слово: </span><input className={"text-black"} type="text" value={inputValue} onChange={handleInputChange} />
            <button className="block w-full py-2 mt-2 font-bold text-white bg-green-500 rounded hover:bg-green-700"
                    onClick={handleButtonClick}>
                Добавить
            </button>
        </div>
    );
};

export default TermsPanel;