.. _contrib-documentation:

Documentation
-------------

VyOS documentation is written in reStructuredText and generated to Read the Docs
pages with Sphinx, as per the Python tradition, as well as PDF files for offline
use through LaTeX.

We welcome all sorts of contributions to the documentation. Not just
new additions but also corrections to existing documentation.

Guidelines
^^^^^^^^^^

There are a few things to keep in mind when contributing to the
documentation, for the sake of consistency and readability.

Take a look at the :doc:`/documentation` page for an intricate explanation
of the documentation process.

The following is a quick summary of the rules:

- Use American English at all times. It's always a good idea to run
  your text through a grammar and spell checker, such as `Grammarly`_.
- Don't forget to update ``index.rst`` when adding a new node.
- Try not to exceed 80 characters per line, but don't break URLs over this.
- Properly quote commands, filenames and brief code snippets with double backticks.
- Use literal blocks for longer snippets.
- Leave a newline before and after a header.
- Indent with two spaces.
- When in doubt, follow the style of existing documentation.

And finally, remember that the reStructuredText files aren't
exclusively for generating HTML and PDF. They should be human-readable
and easily perused from a console.

Building
^^^^^^^^

The source is kept in the Git repository
https://github.com/vyos/vyos-documentation

You can follow the instructions in the README to build and test your changes.

You can either install Sphinx (and TeX Live for PDF output) and build the
documentation locally, or use the `Dockerfile`_ to build it in a container.

.. _Dockerfile: https://github.com/vyos/vyos-documentation/blob/master/docker/Dockerfile
.. _Grammarly: https://www.grammarly.com/
