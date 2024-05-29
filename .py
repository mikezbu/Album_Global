#preliminary chatbot

# chat bot
import numpy as np
import pandas as pd
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

def setup_chatbot():
    tokenizer = AutoTokenizer.from_pretrained("microsoft/DialoGPT-medium")
    model = AutoModelForCausalLM.from_pretrained("microsoft/DialoGPT-medium")
    return tokenizer, model

def chat(tokenizer, model):

    print("Hello! I'm a chatbot. How can I help you today? (Type 'quit' to exit)")
    chat_history_ids = None
    while True:

        user_input = input("You: ")
        if user_input.lower() == 'quit':
            break

        new_user_input_ids = tokenizer.encode(user_input + tokenizer.eos_token, return_tensors='pt')
        bot_input_ids = torch.cat([chat_history_ids, new_user_input_ids], dim=1) if chat_history_ids is not None else new_user_input_ids

        chat_history_ids = model.generate(bot_input_ids, max_length=1000, pad_token_id=tokenizer.eos_token_id)

        response = tokenizer.decode(chat_history_ids[:, bot_input_ids.shape[-1]:][0], skip_special_tokens=True)
        print("Bot:", response)

def main():
    tokenizer, model = setup_chatbot()
    chat(tokenizer, model)

if __name__ == "__main__":
    main()
