import os

def write(path, code):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(code.strip() + '\n')
    print(f'Wrote {path}')
