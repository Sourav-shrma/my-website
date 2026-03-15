# This script downloads a mental health dataset from Hugging Face
# and formats it for AutoTrain fine-tuning

# To run this:
# 1. Download this file
# 2. Run: pip install datasets
# 3. Run: python format-dataset-for-autotrain.py
# 4. Upload the generated 'mental_health_autotrain.jsonl' to Hugging Face AutoTrain

from datasets import load_dataset
import json

# Load the mental health counseling dataset
print("Downloading mental health dataset...")
dataset = load_dataset("Amod/mental_health_counseling_conversations")

# Format for AutoTrain (chat format)
formatted_data = []

for item in dataset["train"]:
    # The dataset has 'Context' (user message) and 'Response' (counselor response)
    context = item.get("Context", "")
    response = item.get("Response", "")
    
    if context and response:
        # AutoTrain expects this chat format
        formatted_item = {
            "messages": [
                {
                    "role": "system",
                    "content": "You are a compassionate mental health companion. Respond with empathy, validate feelings, and offer supportive guidance. Use therapeutic techniques like CBT and mindfulness when appropriate. Never diagnose or replace professional help."
                },
                {
                    "role": "user", 
                    "content": context
                },
                {
                    "role": "assistant",
                    "content": response
                }
            ]
        }
        formatted_data.append(formatted_item)

# Save as JSONL file
output_file = "mental_health_autotrain.jsonl"
with open(output_file, "w", encoding="utf-8") as f:
    for item in formatted_data:
        f.write(json.dumps(item, ensure_ascii=False) + "\n")

print(f"Dataset formatted and saved to '{output_file}'")
print(f"Total conversations: {len(formatted_data)}")
print("\nNext steps:")
print("1. Go to https://huggingface.co/autotrain")
print("2. Create a new project")
print("3. Select 'LLM Fine-tuning' as the task")
print("4. Upload 'mental_health_autotrain.jsonl'")
print("5. Choose a base model (recommended: mistralai/Mistral-7B-Instruct-v0.2)")
print("6. Start training")
