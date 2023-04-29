import asyncio
import base64
import os
import websockets
import json
import nltk

from extract import get_data

from transform import (
    prepare_data,
    lemmatize_data,
    get_map_data
)



clients = set()


def save_tempfile(filedata):
    base64file = filedata['base64File']
    filename = filedata['filename']
    with open(filename, 'wb') as f:
        f.write(base64.b64decode(base64file))
    return


def remove_tempfile(filedata):
    os.remove(f'./{filedata["filename"]}')


async def server(websocket, path):
    global clients
    clients.add(websocket)
    async for message in websocket:
        filedata = json.loads(message)
        save_tempfile(filedata)
        data = get_data(filedata)
        data = prepare_data(data)
        data = lemmatize_data(data)
        remove_tempfile(filedata)
        graph = get_map_data(data) 

        await websocket.send(json.dumps([graph]))

    clients.remove(websocket)
    print('Connection closed:', websocket)


async def main():
    async with websockets.serve(server, "", port=8080, max_size=None):
        while True:
            await asyncio.sleep(1)


if __name__ == "__main__":
    nltk.download('stopwords')
    asyncio.run(main())