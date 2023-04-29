import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import NodesPanel from "./_topicpanel";
import TermsPanel from "./_termpanel";
import LinksPanel from "./_linkspanel";

type GraphData = {
    nodes: { id: string; group: number }[];
    links: { source: string; target: string }[];
};

type Props = {
    data: GraphData[];
    setData: (newValue: GraphData[]) => void;
    loaded: boolean;
    setLoaded: (newValue: boolean) => void;
};

const Graphs = ({ data, setData, loaded, setLoaded }: Props) => {
    const ref = useRef<SVGSVGElement>(null);
    const [showEdit, setShowEdit] = useState(false);

    const handleRemoveNode = () => {
        setShowEdit(!showEdit);
    };

    const handleHome = () => {
        setLoaded(false);
        setData([]);
    };

    useEffect(() => {
        if (!ref.current) return;

        const svg = d3.select(ref.current);
        svg.selectAll('*').remove();

        const { width, height } = svg.node().getBoundingClientRect();

        data.forEach((graph, index) => {
            const xOffset = 0;
            const yOffset = 0;
            const graphGroup = svg.append("g").attr("class", `graph-${index}`).attr("transform", `translate(${xOffset},${yOffset})`);

            const links = graph.links.map((link) =>
                Object.create({
                    ...link,
                    source: link.source,
                    target: link.target,
                    id: `${link.source}-${link.target}`,
                })
            );

            const simulation = d3.forceSimulation(graph.nodes)
                .force("link", d3.forceLink().id((d) => d.id).distance(50).links(links))
                .force("center", d3.forceCenter(width / 2, height / 2))
                .force("collide", d3.forceCollide().radius(60))
                .force("radial", d3.forceRadial(60, width / 2, height / 2).strength(0.1))
                .force("x", d3.forceX().strength(0.1).x(d => Math.min(width, Math.max(0, d.x))))
                .force("y", d3.forceY().strength(0.1).y(d => Math.min(height, Math.max(0, d.y))));

            const link = graphGroup
                .selectAll("line")
                .data(links, (d) => (d as any).id)
                .enter()
                .append("line")
                .attr("stroke", "#999")
                .attr("stroke-opacity", 0.6)
                .attr("stroke-width", 2);


            const text = graphGroup
                .selectAll("text")
                .data(graph.nodes)
                .enter()
                .append("text")
                .text((d) => d.id)
                .attr("font-size", (d) => (d.group === 0 ? "1.3em" : "1em"))
                .attr("text-anchor", "middle")
                .attr("font-weight", (d) => (d.group === 0 ? "800" :
                    (d.group === 1 ? "bold" : "regular")))
                .attr("dx", 4)
                .attr("dy", 4)
                .style("user-select", "none")
                .attr("fill", (d) => (d.group === 0 ? "red" :
                    (d.group === 1 ? "orange" : "#03fe49")));

            const rect = graphGroup
                .selectAll("rect")
                .data(graph.nodes)
                .enter()
                .insert("rect", "text")
                .attr("width", 60)
                .attr("height", 30)
                .attr("fill", "#1b1c1e");

            simulation.nodes(graph.nodes).on("tick", () => {
                link
                    .attr("x1", (d) => (d.source as any).x)
                    .attr("y1", (d) => (d.source as any).y)
                    .attr("x2", (d) => (d.target as any).x)
                    .attr("y2", (d) => (d.target as any).y)
                    .attr("stroke-width", (d) => d.weight * 2);

                rect.attr("x", (d) => (d as any).x - 30).attr("y", (d) => (d as any).y - 15);
                text.attr("x", (d) => (d as any).x).attr("y", (d) => (d as any).y);
            });
        })
    }, [data])
    return (
        <>
            <svg ref={ref} className="w-screen h-screen" />
            <div className="absolute top-0 left-0 p-4 z-10">
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    onClick={handleHome}>
                    <i className="fas fa-home"></i>
                </button>
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-5"
                    onClick={handleRemoveNode}>
                    <i className="fas fa-pen"></i>
                </button>
            </div>
            {showEdit ?
                <div>
                    <div className="absolute top-32 z-20">
                        <NodesPanel
                            data={data}
                            setData={setData} />
                    </div>
                    <div className="absolute top-2/4 z-20">
                        <TermsPanel
                            data={data}
                            setData={setData} />
                    </div>
                    <div className="absolute top-40 z-20 right-0">
                        <LinksPanel
                            data={data}
                            setData={setData} />
                    </div>
                </div> : null}

        </>

    );
}

export default Graphs;
