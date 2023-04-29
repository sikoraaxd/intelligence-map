import asyncio
import base64
import io
import os
import websockets
import json
from PyPDF2 import PdfReader
import docx
import pytesseract
from PIL import Image
import pymorphy2
import re

from sklearn.feature_extraction.text import CountVectorizer
from sklearn.decomposition import LatentDirichletAllocation
import nltk
from nltk import word_tokenize
from nltk.corpus import stopwords

clients = set()


def save_tempfile(filedata):
    base64file = filedata['base64File']
    filename = filedata['filename']
    with open(filename, 'wb') as f:
        f.write(base64.b64decode(base64file))
    return

def remove_tempfile(filedata):
    os.remove(f'./{filedata["filename"]}')


def from_image(filename, image_data=None):
    if image_data:
        image = Image.open(io.BytesIO(image_data))
    else:
        image = Image.open(filename)
    path_to_tesseract = "./Tesseract-OCR/tesseract.exe"
    pytesseract.pytesseract.tesseract_cmd = path_to_tesseract
    text = pytesseract.image_to_string(image, lang= 'rus')
    return text


def from_pdf_images(filename):
    doc_text = ''
    reader = PdfReader(filename)
    pages = reader.pages

    for page in pages:
        for image_file_object in page.images:
            doc_text += from_image(filename = '', image_data = image_file_object.data) + ' '

    return doc_text


def from_doc(filename):
    doc_text = ''
    doc = docx.Document(filename)
    for paragraph in doc.paragraphs:
        text = paragraph.text
        if text:
            doc_text += text + ' '
    return doc_text


def from_pdf(filename):
    doc_text = ''
    reader = PdfReader(filename)
    pages = reader.pages
    for page in pages:
        text = page.extract_text()
        if text:
            doc_text += text + ' '
    
    if doc_text == '':
        doc_text = from_pdf_images(filename)
    return doc_text


def get_data(filedata):
    extension = filedata['filename'].rsplit('.')[-1]
    data = ''
    if extension in ['doc', 'docx']:
        data = from_doc(filedata['filename'])
    elif extension in ['png', 'jpg', 'jpeg']:
        data = from_image(filedata['filename'])
    elif extension in ['pdf']:
        data = from_pdf(filedata['filename'])
    return data


def prepare_data(data):
    data = re.sub(r"\s+", " ", data)
    data = re.sub(r"[^а-яА-Я\s\n]", "", data)
    stop_words = stopwords.words('russian')
    prepared_data = [word for word in data.split() if word not in stop_words]
    return ' '.join(prepared_data)


def lemmatize_data(data):
    morph = pymorphy2.MorphAnalyzer()
    words = data.split()
    lemmas = []
    for word in words:
        parsed_word = morph.parse(word)[0]
        lemmas.append(parsed_word.normal_form)
        
    lemmatized_text = ' '.join(lemmas)
    return lemmatized_text

def get_map_data(data):
    vectorizer = CountVectorizer()
    X = vectorizer.fit_transform([data])

    lda = LatentDirichletAllocation(learning_method='online')
    lda.fit(X)

    topic_names = {}
    feature_names = vectorizer.get_feature_names_out()
    for idx, topic in enumerate(lda.components_):
        top_words = [feature_names[i] for i in topic.argsort()[:-5:-1]]
        topic_names[f'Topic {idx}'] = top_words

    result = {
        "nodes": [{ "id": "Документ", "group": 0 }],
        "links": []
    }

    for topic in topic_names:
        topic_name = topic_names[topic][0]
        
        if {'id':topic_name, 'group': 1} not in result['nodes']:
            result['nodes'].append({'id':topic_name, 'group': 1})
            result['links'].append({ "source": "Документ", "target": topic_name })

        for term in topic_names[topic][1:]:
            if {'id':term, 'group': 2} not in result['nodes'] and {'id':term, 'group': 1} not in result['nodes']:
                result['nodes'].append({'id':term, 'group': 2})

                if { "source": topic_name, "target": term } not in result['links']:
                    result['links'].append({ "source": topic_name, "target": term })

    for i, elem in enumerate(result['nodes']):
        for j, next_elem in enumerate(result['nodes']):
            if i == j:
                continue
            
            if elem['id'] == next_elem['id']:
                if elem['group'] < next_elem['group']:
                    result['nodes'].remove(next_elem)
                else: 
                    result['nodes'].remove(elem)
                    break

    return result


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