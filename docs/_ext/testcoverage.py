'''
generate json with all commands from xml for vyos documentation coverage
'''

import sys
import os
import json
import re
import logging
import datetime

from io import BytesIO
from lxml import etree as ET
import shutil

default_constraint_err_msg = "Invalid value"
validator_dir = ""


input_data = [
    {
        "kind": "cfgcmd",
        "input_dir": "_include/vyos-1x/interface-definitions/",
        "schema_file": "_include/vyos-1x/schema/interface_definition.rng",
        "files": []
    },
    {
        "kind": "opcmd",
        "input_dir": "_include/vyos-1x/op-mode-definitions/",
        "schema_file": "_include/vyos-1x/schema/op-mode-definition.rng",
        "files": []
    }
]

vyos_commands_dir = "_include/coverage"

node_data = {
    'cfgcmd': {},
    'opcmd': {},
}


def get_vyos_commands():
    return_data = None
    for (dirpath, dirnames, filenames) in os.walk(vyos_commands_dir):
        for file in filenames:
            with open(f"{vyos_commands_dir}/{file}") as f:
                data = json.load(f)
            
            if not return_data:
                return_data = data
            
            # find latestes export
            if datetime.datetime.fromisoformat(return_data['date']) < datetime.datetime.fromisoformat(data['date']):
                return_data = data
    
    return return_data



def get_properties(p):
    props = {}
    props['valueless'] = False

    try:
        if p.find("valueless") is not None:
            props['valueless'] = True
    except:
        pass

    if p is None:
        return props

    # Get the help string
    try:
        props["help"] = p.find("help").text
    except:
        pass

    # Get value help strings
    try:
        vhe = p.findall("valueHelp")
        vh = []
        for v in vhe:
            vh.append( (v.find("format").text, v.find("description").text) )
        props["val_help"] = vh
    except:
        props["val_help"] = []

    # Get the constraint statements
    error_msg = default_constraint_err_msg
    # Get the error message if it's there
    try:
        error_msg = p.find("constraintErrorMessage").text
    except:
        pass
    

    vce = p.find("constraint")
    vc = []
    if vce is not None:
        # The old backend doesn't support multiple validators in OR mode
        # so we emulate it

        regexes = []
        regex_elements = vce.findall("regex")
        if regex_elements is not None:
            regexes = list(map(lambda e: e.text.strip(), regex_elements))
        if "" in regexes:
            print("Warning: empty regex, node will be accepting any value")

        validator_elements = vce.findall("validator")
        validators = []
        if validator_elements is not None:
            for v in validator_elements:
                v_name = os.path.join(validator_dir, v.get("name"))

                # XXX: lxml returns None for empty arguments
                v_argument = None
                try:
                    v_argument = v.get("argument")
                except:
                    pass
                if v_argument is None:
                    v_argument = ""

                validators.append("{0} {1}".format(v_name, v_argument))


        regex_args = " ".join(map(lambda s: "--regex \\\'{0}\\\'".format(s), regexes))
        validator_args = " ".join(map(lambda s: "--exec \\\"{0}\\\"".format(s), validators))
        validator_script = '${vyos_libexec_dir}/validate-value.py'
        validator_string = "exec \"{0} {1} {2} --value \\\'$VAR(@)\\\'\"; \"{3}\"".format(validator_script, regex_args, validator_args, error_msg)

        props["constraint"] = validator_string

    # Get the completion help strings
    try:
        che = p.findall("completionHelp")
        ch = ""
        for c in che:
            scripts = c.findall("script")
            paths = c.findall("path")
            lists = c.findall("list")

            # Current backend doesn't support multiple allowed: tags
            # so we get to emulate it
            comp_exprs = []
            for i in lists:
                comp_exprs.append("echo \"{0}\"".format(i.text))
            for i in paths:
                comp_exprs.append("/bin/cli-shell-api listNodes {0}".format(i.text))
            for i in scripts:
                comp_exprs.append("sh -c \"{0}\"".format(i.text))
            comp_help = " && ".join(comp_exprs)
            props["comp_help"] = comp_help
    except:
        props["comp_help"] = []

    # Get priority
    try:
        props["priority"] = p.find("priority").text
    except:
        pass

    # Get "multi"
    if p.find("multi") is not None:
        props["multi"] = True

    # Get "valueless"
    if p.find("valueless") is not None:
        props["valueless"] = True

    return props

def process_node(n, f):


    props_elem = n.find("properties")
    children = n.find("children")
    command = n.find("command")
    children_nodes = []
    owner = n.get("owner")
    node_type = n.tag
    defaultvalue = n.find("defaultValue")

    if defaultvalue is not None:
        defaultvalue = defaultvalue.text


    name = n.get("name")
    props = get_properties(props_elem)

    if node_type != "node":
        if "valueless" not in props.keys():
            props["type"] = "txt"
    if node_type == "tagNode":
        props["tag"] = "True"
    
    if node_type == "node" and children is not None:
        inner_nodes = children.iterfind("*")
        index_child = 0
        for inner_n in inner_nodes:
            children_nodes.append(process_node(inner_n, f))
            index_child = index_child + 1

    if node_type == "tagNode" and children is not None:
        inner_nodes = children.iterfind("*")
        index_child = 0
        for inner_n in inner_nodes:
            children_nodes.append(process_node(inner_n, f))
            index_child = index_child + 1
    else:
        # This is a leaf node
        pass
    
    if command is not None:
        test_command = True
    else:
        test_command = False
    node = {
        'name': name,
        'type': node_type,
        'children': children_nodes,
        'props': props,
        'command': test_command,
        'filename': f,
        'defaultvalue': defaultvalue

    }
    return node



def create_commands(data, parent_list=[], level=0):
    result = []
    command = {
        'name': [],
        'help': None,
        'tag_help': [],
        'level': level,
        'no_childs': False,
        'filename': None,
        'defaultvalue': None,
    }
    command['filename'] = data['filename']
    command['defaultvalue'] = data['defaultvalue']
    command['name'].extend(parent_list)
    command['name'].append(data['name'])

    if data['type'] == 'tagNode':
        command['name'].append("<" + data['name'] + ">")

    if 'val_help' in data['props'].keys():
        for val_help in data['props']['val_help']:
            command['tag_help'].append(val_help)
    
    if len(data['children']) == 0:
        command['no_childs'] = True
    
    if data['command']:
        command['no_childs'] = True
    
    try:
        help_text = data['props']['help']
        command['help'] = re.sub(r"[\n\t]*", "", help_text)
        
    except:
        command['help'] = ""
    
    command['valueless'] = data['props']['valueless']
    
    if 'children' in data.keys():
        children_bool = True
        for child in data['children']:
            result.extend(create_commands(child, command['name'], level + 1))
    
    if command['no_childs']:
        result.append(command)
    


    return result


def include_file(line, input_dir):
    string = ""
    if "#include <include" in line.strip():
        include_filename = line.strip().split('<')[1][:-1]
        with open(input_dir + include_filename) as ifp:
            iline = ifp.readline()
            while iline:
                string = string + include_file(iline.strip(), input_dir)
                iline = ifp.readline()
    else:
        string = line
    return string


def get_working_commands():
    for entry in input_data:
        for (dirpath, dirnames, filenames) in os.walk(entry['input_dir']):
            entry['files'].extend(filenames)
            break

        for f in entry['files']:

            string = ""
            with open(entry['input_dir'] + f) as fp:
                line = fp.readline()
                while line:                
                    string = string + include_file(line.strip(), entry['input_dir'])
                    line = fp.readline()

            try:
                xml = ET.parse(BytesIO(bytes(string, 'utf-8')))
            except Exception as e:
                print("Failed to load interface definition file {0}".format(f))
                print(e)
                sys.exit(1)

            override_defaults(xml)
            
            try:
                relaxng_xml = ET.parse(entry['schema_file'])
                validator = ET.RelaxNG(relaxng_xml)

                if not validator.validate(xml):
                    print(validator.error_log)
                    print("Interface definition file {0} does not match the schema!".format(f))
                    #sys.exit(1)
            except Exception as e:
                print("Failed to load the XML schema {0}".format(entry['schema_file']))
                print(e)
                sys.exit(1)

            root = xml.getroot()
            nodes = root.iterfind("*")
            for n in nodes:
                node_data[entry['kind']][f] = process_node(n, f)

    # build config tree and sort

    config_tree_new = {
        'cfgcmd': {},
        'opcmd': {},
    }

    for kind in node_data:
        for entry in node_data[kind]:
            node_0 = node_data[kind][entry]['name']
            
            if node_0 not in config_tree_new[kind].keys():
                config_tree_new[kind][node_0] = {
                    'name': node_0,
                    'type': node_data[kind][entry]['type'],
                    'props': node_data[kind][entry]['props'],
                    'children': [],
                    'command': node_data[kind][entry]['command'],
                    'filename': node_data[kind][entry]['filename'],
                    'defaultvalue': node_data[kind][entry]['defaultvalue']
                }
            config_tree_new[kind][node_0]['children'].extend(node_data[kind][entry]['children'])
    
    result = {
        'cfgcmd': [],
        'opcmd': [],
    }
    for kind in  config_tree_new:
        for e in config_tree_new[kind]:
            if config_tree_new[kind][e]['name']:
                result[kind].extend(create_commands(config_tree_new[kind][e]))
    
    for cmd in result['cfgcmd']:
        cmd['cmd'] = " ".join(cmd['name'])
    for cmd in result['opcmd']:
        cmd['cmd'] = " ".join(cmd['name'])
    return result

def override_defaults(xml):
    root = xml.getroot()
    defv = {}

    xpath_str = f'//defaultValue'
    xp = xml.xpath(xpath_str)

    for element in xp:
        ap = element.xpath('ancestor::*[@name]')
        defv.setdefault((ap[-1].get("name"), str(ap[:-1])), []).append(element)

    for k, v in defv.items():
        if len(v) > 1:
            override_element(v)

def override_element(l: list):
    if len(l) < 2:
        return

    # assemble list of leafNodes of overriding defaultValues, for later removal
    parents = []
    for el in l[1:]:
        parents.append(el.getparent())

    # replace element with final override
    l[0].getparent().replace(l[0], l[-1])

    # remove all but overridden element
    for el in parents:
        el.getparent().remove(el)

if __name__ == "__main__":
    get_vyos_commands()
