'''
Parse gettext pot files and extract path:line and msgid information
compare this with downloaded files from localazy
the output are the elements which are downloaded but not needed anymore.
TODO: better output
'''

import os
from babel.messages.pofile import read_po


def extract_content(file):
    content = []
    with open(file) as f:
        data = read_po(f)
    for message in data:
        if message.id:
            content.append(message)
    return content


gettext_dir = "docs/_build/gettext"
gettext_ext = ".pot"
original_content = list()

language_dir = "docs/_locale"
language_ext = ".pot"
language_content = dict()

# get gettext filepath
for (dirpath, dirnames, filenames) in os.walk(gettext_dir):
    for file in filenames:
        if gettext_ext in file:
            original_content.extend(extract_content(f"{dirpath}/{file}"))

# get filepath per language
languages = next(os.walk(language_dir))[1]
for language in languages:

    language_content[language] = list()
    for (dirpath, dirnames, filenames) in os.walk(f"{language_dir}/{language}"):
        for file in filenames:
            if language_ext in file:
                language_content[language].extend(extract_content(f"{dirpath}/{file}"))



for lang in language_content.keys():
    for message in language_content[lang]:
        found = False
        for ori_message in original_content:
            if ori_message.id == message.id:
                found = True
        if not found:
            print()
            print(f"{lang}: {message.id}")
            for loc in message.locations:
                print(f"{loc[0]}:{loc[1]}")
            
