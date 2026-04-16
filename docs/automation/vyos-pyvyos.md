---
lastproofread: '2024-03-10'
---

(vyos-pyvyos)=

# pyvyos

pyvyos is a Python library designed for interacting with VyOS devices through
their API. This documentation is intended to guide you in using pyvyos for
programmatic management of your VyOS devices.

- [pyvyos Documentation on Read the Docs](https://pyvyos.readthedocs.io/en/latest/) provides detailed instructions
  on the installation, configuration, and operation of the pyvyos library.
- [pyvyos Source Code on GitHub](https://github.com/robertoberto/pyvyos)
  allows you to access and contribute to the library's code.
- [pyvyos on PyPI](https://pypi.org/project/pyvyos/) for easy installation
  via pip, the Python package installer. Execute `pip install pyvyos` in your
  terminal to install.

## Installation

You can install pyvyos using pip:

```bash
pip install pyvyos
```

## Getting Started

### Importing and Disabling Warnings for verify=False

```none
import urllib3
urllib3.disable_warnings()
```

### Using API Response Class

```none
@dataclass
class ApiResponse:
    status: int
    request: dict
    result: dict
    error: str
```

### Initializing a VyDevice Object

```none
from dotenv import load_dotenv
load_dotenv()

hostname = os.getenv('VYDEVICE_HOSTNAME')
apikey = os.getenv('VYDEVICE_APIKEY')
port = os.getenv('VYDEVICE_PORT')
protocol = os.getenv('VYDEVICE_PROTOCOL')
verify_ssl = os.getenv('VYDEVICE_VERIFY_SSL')

verify = verify_ssl.lower() == "true" if verify_ssl else True 

device = VyDevice(hostname=hostname, apikey=apikey, port=port, protocol=protocol, verify=verify)
```

## Using pyvyos

### Configure, then Set

```none
response = device.configure_set(path=["interfaces", "ethernet", "eth0", "address", "192.168.1.1/24"])
if not response.error:
    print(response.result)
```

### Configure, then Show a Single Object Value

```none
response = device.retrieve_return_values(path=["interfaces", "dummy", "dum1", "address"])
print(response.result)
```

### Configure, then Show Object

```none
response = device.retrieve_show_config(path=[])
if not response.error:
    print(response.result)
```

### Configure, then Delete Object

```none
response = device.configure_delete(path=["interfaces", "dummy", "dum1"])
```

### Configure, then Save

```none
response = device.config_file_save()
```

### Configure, then Save File

```none
response = device.config_file_save(file="/config/test300.config")
```

### Show Object

```none
response = device.show(path=["system", "image"])
print(response.result)
```

### Generate Object

```none
randstring = ''.join(random.choice(string.ascii_letters + string.digits) for _ in range(20))
keyrand =  f'/tmp/key_{randstring}'
response = device.generate(path=["ssh", "client-key", keyrand])
```

### Reset Object

```none
response = device.reset(path=["conntrack-sync", "internal-cache"])
if not response.error:
    print(response.result)
```

### Configure, then Load File

```none
response = device.config_file_load(file="/config/test300.config")
```

[pyvyos]: https://github.com/robertoberto/pyvyos
