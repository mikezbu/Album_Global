import json
import tensorflow as tf
from tensorflow import keras
import numpy as np
import re
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
import io
import matplotlib.pyplot as plt
import requests
from flask import Flask, request, render_template, jsonify

app = Flask(__name__) 

# URL of the JSON file
url = 'https://storage.googleapis.com/learning-datasets/sarcasm.json'

# Specify the path where you want to save the file
# Example: save it in the same directory as your script
file_path = 'D:\\Career\\Projects\\NLP Nutrition\\sarcasm.json'

# Send a GET request to the URL
response = requests.get(url)

# Check if the request was successful
if response.status_code == 200:
    # Open a file to write the data to
    with open(file_path, 'wb') as f:
        f.write(response.content)
else:
    print("Failed to retrieve the file")

# Load the JSON data into Python
import json

# Open the file for reading
with open(file_path, 'r') as file:
    sarcasm_data = json.load(file)


input_sentence = input("Please enter a type of music genre you are interested in: ")

tokenizer = Tokenizer(num_words=100, oov_token='<OOV>')

tokenizer.fit_on_texts([input_sentence])

word_index = tokenizer.word_index

sequences = tokenizer.texts_to_sequences([input_sentence])

max_sequence_len = max(len(x) for x in sequences)

padded_sequences = pad_sequences(sequences, maxlen=max_sequence_len, padding='pre')

#setting up parameters for word processing and other

vocab_size = 50000
embedding_dim = 16 # setting up vector for embed
max_length = 100 # setting up max word length as 100 words
trunc_type='post' 
padding_type='post'
oov_tok = "<OOV>"
training_size = 20000

model = tf.keras.Sequential([
    tf.keras.layers.Embedding(vocab_size, embedding_dim, input_length=max_length), #setting up embedding for turning words into numbers that the program can understand
    tf.keras.layers.GlobalAveragePooling1D(), # setting general theme of words
    tf.keras.layers.Dense(24, activation='relu'), #like the gate produced earlier
    tf.keras.layers.Dense(1, activation='sigmoid') #introduces the values between 0 and 1, helps decide which category the input belongs to
])

model.compile(loss='binary_crossentropy', optimizer='adam', metrics=['accuracy']) #helps measure the model predictions, compared to the actual labels

# setting the lists to be sentences and labels
sentences = []
labels = []

# setting the sarcasm for the items in the model
for item in model:
    sentences.append(item['headline'])
    labels.append(item['is_sarcastic'])

training_sentences = sentences[0:training_size]
testing_sentences = sentences[training_size:]
training_labels = labels[0:training_size]
testing_labels = labels[training_size:]

# setting up the vocabulary size and tokens of the tokenizer

tokenizer = Tokenizer(num_words=vocab_size, oov_token=oov_tok)
tokenizer.fit_on_texts(training_sentences)

word_index = tokenizer.word_index

# making text to sequences longer, and separates them based off training or testing, initial length sentences or padded length sentences

training_sequences = tokenizer.texts_to_sequences(training_sentences)
training_padded = pad_sequences(training_sequences, maxlen=max_length, padding=padding_type, truncating=trunc_type)

testing_sequences = tokenizer.texts_to_sequences(testing_sentences)
testing_padded = pad_sequences(testing_sequences, maxlen=max_length, padding=padding_type, truncating=trunc_type)

# stores the sequential elements and density factors, individual to keras layers

model = tf.keras.Sequential([
    tf.keras.layers.Embedding(vocab_size, embedding_dim, input_length=max_length),
    tf.keras.layers.GlobalAveragePooling1D(),
    tf.keras.layers.Dense(24, activation='relu'),
    tf.keras.layers.Dense(1, activation='sigmoid')
])

#this tests the model compiler to see what is sarcastic and what is not

model.compile(loss='binary_crossentropy',optimizer='adam',metrics=['accuracy'])

model.summary()

#telling the model validation data is for testing on material learned for validation data
num_epochs = 50
history = model.fit(training_padded, training_labels, epochs=num_epochs, validation_data=(testing_padded, testing_labels), verbose=2)

#this plots the graph trend of performance over time, visualizaiton model
def plot_graphs(history, string):
    plt.plot(history.history[string])
    plt.plot(history.history['val_'+string])
    plt.xlabel("Epochs")
    plt.ylabel(string)
    plt.legend([string, 'val_'+string])
    plt.show()

@app.route('/', methods=['GET', 'POST'])
def home():
    if request.method == 'POST':
        text = request.form['text']
        sequence = tokenizer.texts_to_sequences([text])
        padded = pad_sequences(sequence, maxlen=max_length, padding='post', truncating='post')
        prediction = model.predict(padded)[0][0]
        return render_template('index.html', prediction=float(prediction), input_text=text)
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)


#determine the graphs accuracy and loss factors

plot_graphs(history, "accuracy")
plot_graphs(history, "loss")

# assigning key:value pairs for the words entered, and reversing word to index mapping allows for numeric identifiers to occur
reverse_word_index = dict([(value, key) for (key, value) in word_index.items()])

# working on converting a sequence of numbers back into words and combine them into a sentence
def decode_sentence(text):
    return ' '.join([reverse_word_index.get(i, '?') for i in text])

# print these sentences out
print(decode_sentence(training_padded[0]))
print(training_sentences[2])
print(labels[2])

print("final value of the work")

# provides the first layer of the keras model, which is an embedding layer  
e = model.layers[0]
weights = e.get_weights()[0]
print(weights.shape) # shape: (vocab_size, embedding_dim)

# demonstrates how to pre-process data 
sentence = ["Testing out Album Generation", "Which album is your favorite?"]
sequences = tokenizer.texts_to_sequences(sentence)
padded = pad_sequences(sequences, maxlen=max_length, padding=padding_type, truncating=trunc_type)
print(model.predict(padded))

