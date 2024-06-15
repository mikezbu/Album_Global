import json
import tensorflow as tf
from tensorflow import keras
import numpy as np
import re
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
import io
import matplotlib.pyplot as plt

input_sentence = input("Please enter a type of music genre you are interested in: ")

tokenizer = Tokenizer(num_words=100, oov_token='<OOV>')

tokenizer.fit_on_texts([input_sentence])

word_index = tokenizer.word_index

sequences = tokenizer.texts_to_sequences([input_sentence])

max_sequence_len = max(len(x) for x in sequences)

padded_sequences = pad_sequences(sequences, maxlen=max_sequence_len, padding='pre')

#setting up parameters for word processing

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

for item in model:
    sentences.append(item['headline'])
    labels.append(item['is_sarcastic'])

training_sentences = sentences[0:training_size]
testing_sentences = sentences[training_size:]
training_labels = labels[0:training_size]
testing_labels = labels[training_size:]

tokenizer = Tokenizer(num_words=vocab_size, oov_token=oov_tok)
tokenizer.fit_on_texts(training_sentences)

word_index = tokenizer.word_index

training_sequences = tokenizer.texts_to_sequences(training_sentences)
training_padded = pad_sequences(training_sequences, maxlen=max_length, padding=padding_type, truncating=trunc_type)

testing_sequences = tokenizer.texts_to_sequences(testing_sentences)
testing_padded = pad_sequences(testing_sequences, maxlen=max_length, padding=padding_type, truncating=trunc_type)

model = tf.keras.Sequential([
    tf.keras.layers.Embedding(vocab_size, embedding_dim, input_length=max_length),
    tf.keras.layers.GlobalAveragePooling1D(),
    tf.keras.layers.Dense(24, activation='relu'),
    tf.keras.layers.Dense(1, activation='sigmoid')
])
model.compile(loss='binary_crossentropy',optimizer='adam',metrics=['accuracy'])

model.summary()

num_epochs = 50
history = model.fit(training_padded, training_labels, epochs=num_epochs, validation_data=(testing_padded, testing_labels), verbose=2)


def plot_graphs(history, string):
    plt.plot(history.history[string])
    plt.plot(history.history['val_'+string])
    plt.xlabel("Epochs")
    plt.ylabel(string)
    plt.legend([string, 'val_'+string])
    plt.show()

plot_graphs(history, "accuracy")
plot_graphs(history, "loss")

reverse_word_index = dict([(value, key) for (key, value) in word_index.items()])

def decode_sentence(text):
    return ' '.join([reverse_word_index.get(i, '?') for i in text])

print(decode_sentence(training_padded[0]))
print(training_sentences[2])
print(labels[2])

e = model.layers[0]
weights = e.get_weights()[0]
print(weights.shape) # shape: (vocab_size, embedding_dim)


out_v = io.open('vecs.tsv', 'w', encoding='utf-8')
out_m = io.open('meta.tsv', 'w', encoding='utf-8')
for word_num in range(1, vocab_size):
    word = reverse_word_index[word_num]
    embeddings = weights[word_num]
    out_m.write(word + "\n")
    out_v.write('\t'.join([str(x) for x in embeddings]) + "\n")
out_v.close()
out_m.close()

try:
    from google.colab import files
except ImportError:
    pass
else:
    files.download('vecs.tsv')
    files.download('meta.tsv')

sentence = ["Testing out Album Generation", "Which album is your favorite?"]
sequences = tokenizer.texts_to_sequences(sentence)
padded = pad_sequences(sequences, maxlen=max_length, padding=padding_type, truncating=trunc_type)
print(model.predict(padded))
