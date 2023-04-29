import { useRef, useState } from "react";
import blobToBuffer from 'blob-to-buffer';



type LoadingProps = {
    loading: boolean;
    setLoading: (newValue: boolean) => void;
    loaded: boolean;
    setLoaded: (newValue: boolean) => void;
    data: [];
    setData: (newValue: []) => void;
  };

const UploadPage = ({loading, setLoading, loaded, setLoaded, data, setData}: LoadingProps) => {
    const [files, setFiles] = useState<File[]>([]);
    const [showUploadButton, setShowUploadButton] = useState(false);
    const [dragging, setDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();

        const fileList = Array.from(event.dataTransfer.files);
        const allowedTypes = ["image/jpeg",
            "image/png",
            "image/jpg",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/pdf"];
        let filteredFiles = fileList.filter((file) => allowedTypes.includes(file.type));

        if (filteredFiles.length == 0) {
            setDragging(false);
            return;
        }
        setFiles(filteredFiles);
        setShowUploadButton(true);
        setDragging(false);
    };

    const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const file = files[0];

        try {
            const websocket = new WebSocket('ws://localhost:8080');

            websocket.onopen = async () => {
                await blobToBuffer(file, async (err, buffer) => {
                    if (err) throw err;
                    const base64File = buffer.toString('base64');
                    websocket.send(JSON.stringify({ base64File, filename: file.name }));
                    setLoading(true);
                });

            };

            websocket.addEventListener('message', function (event) {
                const graphData = JSON.parse(event.data);
                setLoading(false);
                if (graphData.length > 0) {
                    setData(graphData);
                    setLoaded(true);
                }
            });
        } catch (e) {
            console.log(e);
        }
    };

    const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setShowUploadButton(false);
        setDragging(true);
    };

    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setDragging(false);
    };

    const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = Array.from(event.target.files ?? []);
        const allowedTypes = ["image/jpeg",
            "image/png",
            "image/jpg",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/pdf"];
        let filteredFiles = fileList.filter((file) => allowedTypes.includes(file.type));
        if (filteredFiles.length == 0) {
            return;
        }
        setFiles(filteredFiles);
        setShowUploadButton(true);
    };

    return (
        <div className="h-screen p-4">
            <div
                className={`h-full flex justify-center items-center text-lg font-bold \
                            ${showUploadButton ? "p-0 m-0" : `border-4 border-dashed ${dragging ? 'border-red-500' : 'border-gray-300'}`}`
                }
                onDragOver={(event) => event.preventDefault()}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {showUploadButton ? (
                    <div className="flex flex-col justify-center items-center">
                        <div className="flex flex-col justify-center items-center">
                            <h1 className="text-2xl font-bold mb-4">Загруженные файлы:</h1>
                            <ul className="list-disc list-inside">
                                {files.map((file, index) => (
                                    <li key={index}>{file.name}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="flex flex-row">
                            <form onSubmit={handleFormSubmit}>
                                <button
                                    type="submit"
                                    disabled={files.length === 0}
                                    className={`py-2 px-4 mt-2 rounded-md text-white font-bold ${files.length > 0 ? "bg-green-500 hover:bg-green-600" : "bg-gray-400 cursor-default"
                                        }`}
                                >
                                    Построить карту
                                </button>
                            </form>
                            <button
                                type="button"
                                className="py-2 px-4 mt-2 ml-10 rounded-md text-white font-bold bg-blue-500 hover:bg-blue-600"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                Выбрать другие файлы
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileInputChange}
                                className="hidden"
                                multiple
                            />
                        </div>

                    </div>
                ) : (
                    <div className="flex flex-col justify-center items-center">
                        <p className="text-center">Перетащите файлы сюда или</p>
                        <button
                            type="button"
                            className="py-2 px-4 mt-2 rounded-md text-white font-bold bg-blue-500 hover:bg-blue-600"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            Выбрать файлы
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileInputChange}
                            className="hidden"
                            multiple
                        />
                    </div>
                )}
            </div>
            <button className="absolute bottom-2 left-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                    <i className="fas fa-clock"></i>
            </button>
        </div>

    );
};


if (typeof window !== "undefined") {
    window.addEventListener("dragover", (event) => {
        event.preventDefault();
    });
}

export default UploadPage;