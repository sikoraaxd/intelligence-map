import React, { useState } from "react";
import Table from "./_linkstable";

type GraphData = {
    nodes: { id: string; group: number }[];
    links: { source: string; target: string }[];
};

type Props = {
    data: GraphData[];
    setData: (newValue: GraphData[]) => void;
};

const LinksPanel = ({ data, setData }: Props) => {
    const [selectedSource, setSelectedSource] = useState("");
    const [selectedTarget, setSelectedTarget] = useState("");

    const handleSourceChange = (event) => {
        setSelectedSource(event.target.value);
    };

    const handleTargetChange = (event) => {
        setSelectedTarget(event.target.value);
    };
    
    const handleButtonClick = () => {
        if (selectedSource == "" || selectedTarget == "" || 
            selectedSource == selectedTarget) {
            return;
        }
        const newData = [...data];
        newData[0].links.push({source: selectedSource, target: selectedTarget});
        setData(newData);
    };

    return (
        <div className="w-96 p-4 bg-blue-500 rounded-md" >
            <Table data={data} setData={setData} />
            
            <select value={selectedSource} onChange={handleSourceChange}
                    className="text-black">
                {data[0].nodes.map(({id, group}, index) => (
                    <option key={index} value={id}>
                        {id}
                    </option>
                ))}
            </select>
            <span> -------- </span>
            <select value={selectedTarget} onChange={handleTargetChange} 
                    className="text-black">
                {data[0].nodes.map(({id, group}, index) => (
                    <option key={index} value={id}>
                        {id}
                    </option>
                ))}
            </select>
            <button className="block w-full py-2 mt-2 font-bold text-white bg-green-500 rounded hover:bg-green-700"
                    onClick={handleButtonClick}>
                Добавить
            </button>
        </div>
    );
};

export default LinksPanel;