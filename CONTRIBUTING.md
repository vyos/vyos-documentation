# Contributor's Guide

1. fork the project on GitHub https://github.com/vyos/vyos-documentation
2. clone the fork
3. create a a new branch for your work. You can use a name that describes what you do.
    ```shell
    git checkout -b fix-vxlan-typo
    ```
4. make your changes.

   Please check the documation, if you don't familiar with [sphinx-doc](http://http://www.sphinx-doc.org) or [reStructuredText](http://www.sphinx-doc.org/en/master/usage/restructuredtext/index.html)

   Note the following RFCs, which describe the reserved public IP addresses and autonomous system numbers for the documentation. Please don't use other public address space.

   * [RFC5737](https://tools.ietf.org/html/rfc5737)
   * [RFC3849](https://tools.ietf.org/html/rfc3849)
   * [RFC5389](https://tools.ietf.org/html/rfc5398)



5. add the modified files
    ```shell
    git add path/to/filname
    ```
    or add all unstaged files
    ```shell
    git add .
    ````
6. commit your changes
    ```shell
    git commit -m "rename vxlan set syntax"
    ```
7. push your commits to your GitHub project:

    ```shell
    git push -u origin fix-vxlan-typo
    ```
8.  Submit a pull request.

    In GitHub, visit the main repository and you should see a banner
    suggesting to make a pull request. Fill out the form and describe what you do.