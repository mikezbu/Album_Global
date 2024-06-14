import tensorflow as tf
from tensorflow import keras
import numpy as np
import importlib
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences

sentences = [
    'Importing into AWS',
    'Albums highest in popularity'
]

tokenizer = Tokenizer(num_words=100, oov_token = '<OOV>')

# Fit the tokenizer on the texts
tokenizer.fit_on_texts(sentences)

# Get the word index map
word_index = tokenizer.word_index
print(word_index)

# Convert texts to sequences
sequences = tokenizer.texts_to_sequences(sentences)
print(sequences)

# Correct usage of texts_to_sequences
input_sequences = tokenizer.texts_to_sequences(sentences)

# Calculate the maximum sequence length
max_sequence_len = max(len(x) for x in input_sequences)

# Pad the sequences 
padded_sequences = pad_sequences(input_sequences, maxlen=max_sequence_len, padding='pre')
print(padded_sequences)
