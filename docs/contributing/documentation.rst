.. _build:

Documentation
=============

As most software projects we also have a lack in documentation. We encourage
every VyOS user to help us improve our documentation. This will not only be
benefical four you (when reading something up) but also for the whole world.

If you are willing to contribute to our documentation this is the definate
guid how to do so.

Guide
-----

Updates to our documentation should be delivered by a GitHub pull-request. In
order to create a pull-request you need to fork our documentation code first.
This requires you already have a GitHub account.

1. Fork the project on GitHub https://github.com/vyos/vyos-documentation/fork
2. Clone your fork to your local machine
    ```shell
    $ git clone https://github.com/YOUR_USERNAME/vyos-documentation
    ```
3. Change to your new local directory vyos-documentation
4. Create a new branch for your work. You can use a name that describes what
   you do
    ```shell
   $ git checkout -b fix-vxlan-typo
    ```
5. Make all your changes - please keep out commit rules in mind. This mainly
   applies to a proper commit message describing your change. Please check the
   documentation if you aren't familiar with
   [sphinx-doc](http://http://www.sphinx-doc.org) or
   [reStructuredText](http://www.sphinx-doc.org/en/master/usage/restructuredtext/index.html)

   Note the following RFCs, which describe the reserved public IP addresses and
   autonomous system numbers for the documentation: RFC5737_, RFC3849_,
   RFC5389_ and RFC7042_:

   * 192.0.2.0/24
   * 198.51.100.0/24
   * 203.0.113.0/24
   * 2001:db8::/32
   * 16bit ASN: 64496 - 64511
   * 32bit ASN: 65536 - 65551
   * Unicast MAC Addresses: 00-53-00 to 00-53-FF
   * Multicast MAC-Addresses: 90-10-00 to 90-10-FF

   Please don't use other public address space.

6. Check your changes by locally building the documentation
	```shell
	$ cd docs; make html
	```
    Sphinx will build the html files in the ``docs/_build`` folder

7. Add modified files to Git index
    ```shell
    $ git add path/to/filname
    ```
    or add all unstaged files
    ```shell
    $ git add .
    ````

8. Commit your changes
    ```shell
    $ git commit -m "rename vxlan set syntax"
    ```

9. Push your commits to your GitHub project:
    ```shell
    $ git push -u origin fix-vxlan-typo
    ```

10. Submit pull-request.
    In GitHub visit the main repository and you should see a banner suggesting
    to make a pull request. Fill out the form and describe what you do.

11. Once pull resquests have been approved, you may want to locally update your
    forked repository too. First you'll have to add the remote upstream
    repository.

	```shell
	$ git remote add upstream https://github.com/vyos/vyos-documentation.git
	```

    Check your configured remote repositories.
	```shell
	$ git remote -v
	origin    https://github.com/YOUR_USERNAME/vyos-documentation.git (fetch)
	origin    https://github.com/YOUR_USERNAME/vyos.documentation.git (push)
	upstream  https://github.com/vyos/vyos-documentation.git (fetch)
	upstream  https://github.com/vyos/vyos-documentation.git (push)
	```

    Your remote repo on Github is called Origin, while the original repo you
    have forked is called Upstream.

    Now you can locally update your forked repo.
	```shell
	$ git fetch upstream
	$ git checkout master
	$ git merge upstream/master
	```

    If you want to update your fork on GitHub, too use the following:

	```shell
	$ git push origin master
	```

.. _RFC5737: https://tools.ietf.org/html/rfc5737
.. _RFC3849: https://tools.ietf.org/html/rfc3849
.. _RFC5389: https://tools.ietf.org/html/rfc5398
.. _RFC7042: https://tools.ietf.org/html/rfc7042

