:lastproofread: 2023-12-15

.. _vyos-pyvyos:

PyVyOS
======

PyVyOS is a Python library for interacting with VyOS devices via their API. 
This documentation guides you on using PyVyOS to manage your VyOS devices programmatically. 
The complete PyVyOS documentation is available on [Read the Docs](https://pyvyos.readthedocs.io/en/latest/), 
and the library can be found on [GitHub](https://github.com/robertoberto/pyvyos) 
and [PyPI](https://pypi.org/project/pyvyos/).

Installation
------------

You can install PyVyOS using pip:

.. code-block:: bash

    pip install pyvyos

Getting Started
---------------

### Importing and Disabling Warnings for verify=False

.. code-block:: none

    import urllib3
    urllib3.disable_warnings()

### Using API Response Class

.. code-block:: none

    @dataclass
    class ApiResponse:
        status: int
        request: dict
        result: dict
        error: str

### Initializing a VyDevice Object

.. code-block:: none

    from dotenv import load_dotenv
    load_dotenv()

    hostname = os.getenv('VYDEVICE_HOSTNAME')
    apikey = os.getenv('VYDEVICE_APIKEY')
    port = os.getenv('VYDEVICE_PORT')
    protocol = os.getenv('VYDEVICE_PROTOCOL')
    verify_ssl = os.getenv('VYDEVICE_VERIFY_SSL')

    verify = verify_ssl.lower() == "true" if verify_ssl else True 

    device = VyDevice(hostname=hostname, apikey=apikey, port=port, protocol=protocol, verify=verify)

Using PyVyOS
------------

### Configure, then Set

.. code-block:: none

    response = device.configure_set(path=["interfaces", "ethernet", "eth0", "address", "192.168.1.1/24"])
    if not response.error:
        print(response.result)

### Configure, then Show a Single Object Value

.. code-block:: none

    response = device.retrieve_return_values(path=["interfaces", "dummy", "dum1", "address"])
    print(response.result)

### Configure, then Show Object

.. code-block:: none

    response = device.retrieve_show_config(path=[])
    if not response.error:
        print(response.result)

### Configure, then Delete Object

.. code-block:: none

    response = device.configure_delete(path=["interfaces", "dummy", "dum1"])

### Configure, then Save

.. code-block:: none

    response = device.config_file_save()

### Configure, then Save File

.. code-block:: none

    response = device.config_file_save(file="/config/test300.config")

### Show Object

.. code-block:: none

    response = device.show(path=["system", "image"])
    print(response.result)

### Generate Object

.. code-block:: none

    randstring = ''.join(random.choice(string.ascii_letters + string.digits) for _ in range(20))
    keyrand =  f'/tmp/key_{randstring}'
    response = device.generate(path=["ssh", "client-key", keyrand])

### Reset Object

.. code-block:: none

    response = device.reset(path=["conntrack-sync", "internal-cache"])
    if not response.error:
        print(response.result)

### Configure, then Load File

.. code-block:: none

    response = device.config_file_load(file="/config/test300.config")

. _pyvyos: https://github.com/robertoberto/pyvyos