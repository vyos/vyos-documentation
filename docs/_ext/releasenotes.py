from datetime import datetime
from phabricator import Phabricator
import argparse

parser = argparse.ArgumentParser()
parser.add_argument("-t", "--token", type=str, help="API token", required=True)
parser.add_argument("-b", "--branch", nargs="+", help="List of github branches", required=True)

args = parser.parse_args()


phab = Phabricator(host='https://phabricator.vyos.net/api/', token=args.token)

'''
# code to find new PHIDs
# show project ids
projects = phab.project.query(limit=200)
for project in projects.response['data']:
    print(projects.response['data'][project]['phid'], projects.response['data'][project]['name'])
'''

projects = {
    'equuleus': {
        'phid': 'PHID-PROJ-zu26ui4vbmvykpjtepij',
        'name': '1.3 Equuleus',
        'filename': 'docs/changelog/1.3.rst',
        'tasks': [],
        'releasenotes': []
    },
    'current': {
        'phid': 'PHID-PROJ-m4utvy456e2shcprpq3b',
        'name': '1.4 Sagitta',
        'filename': 'docs/changelog/1.4.rst',
        'tasks': [],
        'releasenotes': []
    }
}

for b in args.branch:
    if b not in projects.keys():
        raise Exception('given branch not defined')

# get project tasks

for project in projects:
    if project not in args.branch:
        continue

    _after = None

    # get tasks from API
    while True:
        #print(f'get {_after}')
        _tasks = phab.maniphest.search(
            constraints={
                'projects': [projects[project]['phid']],
                #'statuses': ['closed'],
            },
            after=_after)

        projects[project]['tasks'].extend(_tasks.response['data'])
        _after = _tasks.response['cursor']['after']
        if _after is None:
            break
    
    # prepare tasks for release notes
    for task in projects[project]['tasks']:
        if task['fields']['status']['value'] in ['resolved']:
            #_info = phab.maniphest.info(task_id=task['id'])
            #_info = _info.response
            releasenote = {}
            releasenote['type'] = task['fields']['subtype']
            date = datetime.fromtimestamp(task['fields']['dateClosed'])
            releasenote['closedate'] = date.strftime('%Y-%m-%d')
            releasenote['name'] = task['fields']['name']
            releasenote['id'] = task['id']
            #print(f"{project}: {task['fields']['status']} {task['id']}")
            projects[project]['releasenotes'].append(releasenote)
    
    projects[project]['releasenotes'] = sorted(
                projects[project]['releasenotes'], key = lambda x: x['closedate'],
                reverse=True
    )
    
    rst_text = "#" * len(projects[project]['name'])
    rst_text += f"\n{projects[project]['name']}\n"
    rst_text += "#" * len(projects[project]['name'])
    rst_text += "\n"

    rst_text += "\n"
    rst_text += "..\n"
    rst_text += "   Please don't add anything by hand.\n"
    rst_text += "   This file is managed by the script:\n"
    rst_text += "   _ext/releasenotes.py\n"

    date = None
    for rn in projects[project]['releasenotes']:
        if date != rn['closedate']:
            rst_text += "\n\n"
            rst_text += f"{rn['closedate']}\n"
            underline = '=' * len(rn['closedate'])
            rst_text += f"{underline}\n\n"
        date = rn['closedate']
        rst_text += f"* :vytask:`T{rn['id']}` ({rn['type']}): {rn['name']}\n"
    
    f = open(projects[project]['filename'], "w")
    f.write(rst_text)
    f.close()
