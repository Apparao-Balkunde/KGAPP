
import random

KOKAN_NAMES = ["Balu", "Tanya", "Vithu", "Gauri", "Pandurang", "Sakhu", "Raghoba", "Sonabai"]
CLOTHES = ["pheta", "kurta", "dhotar", "patal_sari", "lugade", "choli"]

def generate_player_data(player_id):
    name = random.choice(KOKAN_NAMES)
    costume = random.choice(CLOTHES)
    return {
        "id": player_id,
        "name": name,
        "costume": costume,
        "x": 0,
        "y": 0,
        "z": 0
    }
