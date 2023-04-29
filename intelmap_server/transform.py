import pymorphy2
import re

from sklearn.feature_extraction.text import CountVectorizer
from sklearn.decomposition import LatentDirichletAllocation
import nltk
from nltk import word_tokenize
from nltk.corpus import stopwords



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