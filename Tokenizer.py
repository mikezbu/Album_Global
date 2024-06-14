import tensorflow as tf
from tensorflow import keras
import numpy as np
import re
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences

input_sentence = input("Please enter a sentence: ")

tokenizer = Tokenizer(num_words=100, oov_token='<OOV>')

tokenizer.fit_on_texts([input_sentence])

word_index = tokenizer.word_index
print(word_index)

sequences = tokenizer.texts_to_sequences([input_sentence])
print(sequences)

max_sequence_len = max(len(x) for x in sequences)

padded_sequences = pad_sequences(sequences, maxlen=max_sequence_len, padding='pre')
print(padded_sequences)
