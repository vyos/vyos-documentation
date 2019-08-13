# Contributor's Guide

1. fork the project on GitHub https://github.com/vyos/vyos-documentation
2. clone the fork to your local machine
    ```shell
    $ git clone https://github.com/YOUR_USERNAME/vyos-documentation
3. cd to your new local directory vyos-documentation
4. create a a new branch for your work. You can use a name that describes what you do.
    ```shell
   $ git checkout -b fix-vxlan-typo
    ```
5. make your changes.

   Please check the documentation if you aren't familiar with [sphinx-doc](http://http://www.sphinx-doc.org) or [reStructuredText](http://www.sphinx-doc.org/en/master/usage/restructuredtext/index.html)

   Note the following RFCs, which describe the reserved public IP addresses and autonomous system numbers for the documentation. [RFC5737](https://tools.ietf.org/html/rfc5737), [RFC3849](https://tools.ietf.org/html/rfc3849), [RFC5389](https://tools.ietf.org/html/rfc5398), [RFC7042](https://tools.ietf.org/html/rfc7042)

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
	$ cd docs
	$ make html
	```
    Sphinx will build the html files in the docs/_build folder

7. add the modified files
    ```shell
    $ git add path/to/filname
    ```
    or add all unstaged files
    ```shell
    $ git add .
    ````
8. commit your changes
    ```shell
    $ git commit -m "rename vxlan set syntax"
    ```
9. push your commits to your GitHub project:

    ```shell
    $ git push -u origin fix-vxlan-typo
    ```
10. submit a pull request.

    In GitHub, visit the main repository and you should see a banner
    suggesting to make a pull request. Fill out the form and describe what you do.
    
11. once pull resquests have been approved, you may want to locally update your forked repository too. First you'll have to add the remote upstream repository.
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

    Your remote repo on Github is called Origin, while the original repo you have forked is called Upstream.

    Now you can locally update your forked repo.
	```shell
	$ git fetch upstream
	$ git checkout master
	$ git merge upstream/master
	```
    If you want to update your fork on Github too:
	```shell
	$ git push origin master
	```

