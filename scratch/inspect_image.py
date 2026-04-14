from PIL import Image

img = Image.open('/mnt/data/sreekumar/projects/AgenticAI/BigSkillChallenge/mobile/assets/domain/prize_card.png')
print(f"Size: {img.size}")
print(f"Mode: {img.mode}")
