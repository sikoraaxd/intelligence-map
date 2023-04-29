
from PyPDF2 import PdfReader
import docx
import pytesseract
from PIL import Image
import io


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