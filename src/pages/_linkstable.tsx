import React from "react";

type GraphData = {
    nodes: { id: string; group: number }[];
    links: { source: string; target: string }[];
};

type Props = {
    data: GraphData[];
    setData: (newValue: GraphData[]) => void;
};

const Table = ({ data, setData }: Props) => {
    const handleDelete = (id: number) => {
        const newData = [...data];
        newData[0].links.splice(id, 1);
        setData(newData);
    };

    return (
        <div className="max-h-[53vh] overflow-y-scroll">
            <table className="w-full">
                <thead>
                    <tr>
                        <th className="p-2 text-left font-black text-xl">Начало</th>
                        <th className="p-2 text-left font-black text-xl">Конец</th>
                        <th className="p-2"></th>
                    </tr>
                </thead>
                <tbody>
                    {data[0].links.map(({ source, target}, index) => (
                        <tr key={index}>
                            <td className="p-2">{source}</td>
                            <td className="p-2">{target}</td>
                            <td className="p-2">
                                <button
                                    onClick={() => handleDelete(index)}
                                    className="text-red-500 hover:text-red-700 font-bold"
                                >
                                    X
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

    );
};

export default Table;