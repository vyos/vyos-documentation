:lastproofread: 2025-11-30

.. _upstream_packages:

#################
Upstream Packages
#################

Many base system packages are pulled straight from Debian's ``main`` and
``contrib`` repositories, but there are exceptions.

If you only want to build a fresh ISO image, you can skip
this section. This information may be useful for a deeper dive into VyOS.


.. stop_vyoslinter

System packages that are not directly pulled from Debian are built through a 
separate build system, ``build.py`` in the `vyos-build <https://github.com/vyos/vyos-build/tree/current/scripts/package-build>`__ repository.

.. start_vyoslinter
