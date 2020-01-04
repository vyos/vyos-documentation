from docutils import nodes, utils
from docutils.parsers.rst.roles import set_classes
from docutils.parsers.rst import Directive
from sphinx.util.docutils import SphinxDirective


def setup(app):

    app.add_config_value(
        'vyos_phabricator_url',
        'https://phabricator.vyos.net/', ''
    )
    app.add_role('vytask', vytask_role)
    app.add_role('cfgcmd', cmd_role)
    app.add_role('opcmd', cmd_role)

    print(app.config.vyos_phabricator_url)

    app.add_node(
        inlinecmd,
        html=(inlinecmd.visit_span, inlinecmd.depart_span),
        latex=(inlinecmd.visit_tex, inlinecmd.depart_tex),
        text=(inlinecmd.visit_span, inlinecmd.depart_span)
    )

    app.add_node(
        CmdDiv,
        html=(CmdDiv.visit_div, CmdDiv.depart_div),
        latex=(CmdDiv.visit_tex, CmdDiv.depart_tex),
        text=(CmdDiv.visit_div, CmdDiv.depart_div)
    )
    app.add_node(
        CmdBody,
        html=(CmdBody.visit_div, CmdBody.depart_div),
        latex=(CmdBody.visit_tex, CmdBody.depart_tex),
        text=(CmdBody.visit_div, CmdBody.depart_div)
    )
    app.add_node(
        CmdHeader,
        html=(CmdHeader.visit_div, CmdHeader.depart_div),
        latex=(CmdHeader.tex, CmdHeader.tex),
        text=(CmdHeader.visit_div, CmdHeader.depart_div)
    )
    app.add_node(CfgcmdList)
    app.add_directive('cfgcmdlist', CfgcmdlistDirective)

    app.add_node(OpcmdList)
    app.add_directive('opcmdlist', OpcmdlistDirective)

    app.add_directive('cfgcmd', CfgCmdDirective)
    app.add_directive('opcmd', OpCmdDirective)
    app.connect('doctree-resolved', process_cmd_nodes)


class CfgcmdList(nodes.General, nodes.Element):
    pass


class OpcmdList(nodes.General, nodes.Element):
    pass

import json

class CmdHeader(nodes.General, nodes.Element):

    @staticmethod
    def visit_div(self, node):
        self.body.append(self.starttag(node, 'div'))

    @staticmethod
    def depart_div(self, node=None):
        # self.body.append('</div>\n')
        self.body.append('<a class="cmdlink" href="#%s" ' %
                        node.children[0]['refid'] +
                        'title="%s"></a></div>' % (
                        'Permalink to this Command'))

    @staticmethod
    def tex(self, node=None):
        pass


class CmdDiv(nodes.General, nodes.Element):

    @staticmethod
    def visit_div(self, node):
        self.body.append(self.starttag(node, 'div'))

    @staticmethod
    def depart_div(self, node=None):
        self.body.append('</div>\n')

    @staticmethod
    def tex(self, node=None):
        pass

    @staticmethod
    def visit_tex(self, node=None):
        self.body.append('\n\n\\begin{changemargin}{0cm}{0cm}\n')

    @staticmethod
    def depart_tex(self, node=None):
        self.body.append('\n\\end{changemargin}\n\n')

class CmdBody(nodes.General, nodes.Element):

    @staticmethod
    def visit_div(self, node):
        self.body.append(self.starttag(node, 'div'))

    @staticmethod
    def depart_div(self, node=None):
        self.body.append('</div>\n')

    @staticmethod
    def visit_tex(self, node=None):
        self.body.append('\n\n\\begin{changemargin}{0.5cm}{0.5cm}\n')


    @staticmethod
    def depart_tex(self, node=None):
        self.body.append('\n\\end{changemargin}\n\n')


    @staticmethod
    def tex(self, node=None):
        pass


class inlinecmd(nodes.inline):

    @staticmethod
    def visit_span(self, node):
        self.body.append(self.starttag(node, 'span'))

    @staticmethod
    def depart_span(self, node=None):
        self.body.append('</span>\n')

    @staticmethod
    def visit_tex(self, node=None):
        self.body.append(r'\sphinxbfcode{\sphinxupquote{')
        #self.literal_whitespace += 1

    @staticmethod
    def depart_tex(self, node=None):
        self.body.append(r'}}')
        #self.literal_whitespace -= 1


class CfgcmdlistDirective(Directive):

    def run(self):
        return [CfgcmdList('')]


class OpcmdlistDirective(Directive):

    def run(self):
        return [OpcmdList('')]


class CmdDirective(SphinxDirective):

    has_content = True
    custom_class = ''

    def run(self):
        title_list = []
        content_list = []
        title_text = ''
        content_text = ''
        has_body = False

        cfgmode = self.custom_class + "cmd"

        if '' in self.content:
            index = self.content.index('')
            title_list = self.content[0:index]
            content_list = self.content[index + 1:]
            title_text = ' '.join(title_list)
            content_text = '\n'.join(content_list)
            has_body = True
        else:
            title_text = ' '.join(self.content)

        anchor_id = nodes.make_id(self.custom_class + "cmd-" + title_text)
        target = nodes.target(ids=[anchor_id])

        panel_name = 'cmd-{}'.format(self.custom_class)
        panel_element = CmdDiv()
        panel_element['classes'] += ['cmd', panel_name]

        heading_element = CmdHeader(title_text)
        title_nodes, messages = self.state.inline_text(title_text,
                                                       self.lineno)

        title = inlinecmd(title_text, '', *title_nodes)
        target['classes'] += []
        title['classes'] += [cfgmode]
        heading_element.append(target)
        heading_element.append(title)

        heading_element['classes'] += [self.custom_class + 'cmd-heading']

        panel_element.append(heading_element)

        append_list = {
            'docname': self.env.docname,
            'cmdnode': title.deepcopy(),
            'cmd': title_text,
            'target': target,
        }

        if cfgmode == 'opcmd':
            if not hasattr(self.env, "vyos_opcmd"):
                self.env.vyos_opcmd = []
            self.env.vyos_opcmd.append(append_list)

        if cfgmode == 'cfgcmd':
            if not hasattr(self.env, "vyos_cfgcmd"):
                self.env.vyos_cfgcmd = []
            self.env.vyos_cfgcmd.append(append_list)

        if has_body:
            body_element = CmdBody(content_text)
            self.state.nested_parse(
                content_list,
                self.content_offset,
                body_element
            )

            body_element['classes'] += [self.custom_class + 'cmd-body']
            panel_element.append(body_element)
        return [panel_element]


class OpCmdDirective(CmdDirective):
    custom_class = 'op'


class CfgCmdDirective(CmdDirective):
    custom_class = 'cfg'


def process_cmd_node(app, cmd, fromdocname):
    para = nodes.paragraph()
    newnode = nodes.reference(' ', ' ')
    innernode = cmd['cmdnode']
    newnode['refdocname'] = cmd['docname']
    newnode['refuri'] = app.builder.get_relative_uri(
        fromdocname, cmd['docname'])
    newnode['refuri'] += '#' + cmd['target']['refid']
    newnode['classes'] += ['cmdlink']
    newnode.append(innernode)
    para += newnode
    return para


def process_cmd_nodes(app, doctree, fromdocname):
    env = app.builder.env

    for node in doctree.traverse(CfgcmdList):
        content = []

        for cmd in sorted(env.vyos_cfgcmd, key=lambda i: i['cmd']):
            content.append(process_cmd_node(app, cmd, fromdocname))
        node.replace_self(content)

    for node in doctree.traverse(OpcmdList):
        content = []

        for cmd in sorted(env.vyos_opcmd, key=lambda i: i['cmd']):
            content.append(process_cmd_node(app, cmd, fromdocname))
        node.replace_self(content)


def vytask_role(name, rawtext, text, lineno, inliner, options={}, content=[]):
    app = inliner.document.settings.env.app
    base = app.config.vyos_phabricator_url
    ref = base + str(text)
    set_classes(options)
    node = nodes.reference(
        rawtext, utils.unescape(str(text)), refuri=ref, **options)
    return [node], []


def cmd_role(name, rawtext, text, lineno, inliner, options={}, content=[]):
    node = nodes.literal(text, text)
    return [node], []
