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
    const handleDelete = (id: string) => {
        const newData = [...data];
        newData[0].nodes = newData[0].nodes.filter((node) => node.id !== id);
        newData[0].links = newData[0].links.filter((node) => node.source !== id && node.target !== id);
        setData(newData);
    };

    return (
        <div className="max-h-60 overflow-y-scroll">
            <table className="w-full">
                <thead>
                    <tr>
                        <th className="p-2 text-left font-black text-xl">Терм</th>
                        <th className="p-2"></th>
                    </tr>
                </thead>
                <tbody>
                    {data[0].nodes.map(({ id, group }) => (
                        group == 2 ?
                            <tr key={id}>
                                <td className="p-2">{id}</td>
                                <td className="p-2">
                                    <button
                                        onClick={() => handleDelete(id)}
                                        className="text-red-500 hover:text-red-700 font-bold"
                                    >
                                        X
                                    </button>
                                </td>
                            </tr>
                            : null
                    ))}
                </tbody>
            </table>
        </div>

    );
};

export default Table;