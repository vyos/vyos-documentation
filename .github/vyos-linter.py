import os
import re
import ipaddress
import sys
import ast

IPV4SEG  = r'(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9])'
IPV4ADDR = r'(?:(?:' + IPV4SEG + r'\.){3,3}' + IPV4SEG + r')'
IPV6SEG  = r'(?:(?:[0-9a-fA-F]){1,4})'
IPV6GROUPS = (
    r'(?:' + IPV6SEG + r':){7,7}' + IPV6SEG,                  # 1:2:3:4:5:6:7:8
    r'(?:\s' + IPV6SEG + r':){1,7}:',                           # 1::                                 1:2:3:4:5:6:7::
    r'(?:' + IPV6SEG + r':){1,6}:' + IPV6SEG,                 # 1::8               1:2:3:4:5:6::8   1:2:3:4:5:6::8
    r'(?:' + IPV6SEG + r':){1,5}(?::' + IPV6SEG + r'){1,2}',  # 1::7:8             1:2:3:4:5::7:8   1:2:3:4:5::8
    r'(?:' + IPV6SEG + r':){1,4}(?::' + IPV6SEG + r'){1,3}',  # 1::6:7:8           1:2:3:4::6:7:8   1:2:3:4::8
    r'(?:' + IPV6SEG + r':){1,3}(?::' + IPV6SEG + r'){1,4}',  # 1::5:6:7:8         1:2:3::5:6:7:8   1:2:3::8
    r'(?:' + IPV6SEG + r':){1,2}(?::' + IPV6SEG + r'){1,5}',  # 1::4:5:6:7:8       1:2::4:5:6:7:8   1:2::8
    IPV6SEG + r':(?:(?::' + IPV6SEG + r'){1,6})',             # 1::3:4:5:6:7:8     1::3:4:5:6:7:8   1::8
    r':(?:(?::' + IPV6SEG + r'){1,7}|:)',                     # ::2:3:4:5:6:7:8    ::2:3:4:5:6:7:8  ::8       ::
    r'fe80:(?::' + IPV6SEG + r'){0,4}%[0-9a-zA-Z]{1,}',       # fe80::7:8%eth0     fe80::7:8%1  (link-local IPv6 addresses with zone index)
    r'::(?:ffff(?::0{1,4}){0,1}:){0,1}[^\s:]' + IPV4ADDR,     # ::255.255.255.255  ::ffff:255.255.255.255  ::ffff:0:255.255.255.255 (IPv4-mapped IPv6 addresses and IPv4-translated addresses)
    r'(?:' + IPV6SEG + r':){1,4}:[^\s:]' + IPV4ADDR,          # 2001:db8:3:4::192.0.2.33  64:ff9b::192.0.2.33 (IPv4-Embedded IPv6 Address)
)
IPV6ADDR = '|'.join(['(?:{})'.format(g) for g in IPV6GROUPS[::-1]])  # Reverse rows for greedy match

MAC = r'([0-9A-F]{2}[:-]){5}([0-9A-F]{2})'

NUMBER = r"([\s']\d+[\s'])"


def lint_mac(cnt, line):
    mac = re.search(MAC, line, re.I)
    if mac is not None:
        mac = mac.group()
        u_mac = re.search(r'((00)[:-](53)([:-][0-9A-F]{2}){4})', mac, re.I)
        m_mac = re.search(r'((90)[:-](10)([:-][0-9A-F]{2}){4})', mac, re.I)
        if u_mac is None and m_mac is None:
            return (f"Use MAC reserved for Documentation (RFC7042): {mac}", cnt, 'error')


def lint_ipv4(cnt, line):
    ip = re.search(IPV4ADDR, line, re.I)
    if ip is not None:
        ip = ipaddress.ip_address(ip.group().strip(' '))
        # https://docs.python.org/3/library/ipaddress.html#ipaddress.IPv4Address.is_private
        if ip.is_private is False and ip.is_multicast is False:
            return (f"Use IPv4 reserved for Documentation (RFC 5737) or private Space: {ip}", cnt, 'error')


def lint_ipv6(cnt, line):
    ip = re.search(IPV6ADDR, line, re.I)
    if ip is not None:
        ip = ipaddress.ip_address(ip.group().strip(' '))
        # https://docs.python.org/3/library/ipaddress.html#ipaddress.IPv4Address.is_private
        if ip.is_private is False and ip.is_multicast is False:
            return (f"Use IPv6 reserved for Documentation (RFC 3849) or private Space: {ip}", cnt, 'error')


def lint_AS(cnt, line):
    number = re.search(NUMBER, line, re.I)
    if number:
        pass
        # find a way to detect AS numbers


def lint_linelen(cnt, line):
    if len(line) > 80:
        return (f"Line too long: len={len(line)}", cnt, 'warning')


def handle_file(path, file):
    errors = []
    path = '/'.join(path)
    filepath = f"{path}/{file}"
    try:
        with open(filepath) as fp:
            line = fp.readline()
            cnt = 1
            while line:
                err_mac = lint_mac(cnt, line.strip())
                err_ip4 = lint_ipv4(cnt, line.strip())
                err_ip6 = lint_ipv6(cnt, line.strip())
                err_len = lint_linelen(cnt, line.strip())
                if err_mac:
                    errors.append(err_mac)
                if err_ip4:
                    errors.append(err_ip4)
                if err_ip6:
                    errors.append(err_ip6)
                if err_len:
                    errors.append(err_len)
                line = fp.readline()
                cnt += 1
    finally:
        fp.close()

    if len(errors) > 0:
        print(f"File: {filepath}")
        for error in errors:
            print(error)
        print('')
        return False

def handle_file_action(filepath):
    errors = []
    try:
        with open(filepath) as fp:
            line = fp.readline()
            cnt = 1
            while line:
                err_mac = lint_mac(cnt, line.strip())
                err_ip4 = lint_ipv4(cnt, line.strip())
                err_ip6 = lint_ipv6(cnt, line.strip())
                err_len = lint_linelen(cnt, line.strip())
                if err_mac:
                    errors.append(err_mac)
                if err_ip4:
                    errors.append(err_ip4)
                if err_ip6:
                    errors.append(err_ip6)
                if err_len:
                    errors.append(err_len)
                line = fp.readline()
                cnt += 1
    finally:
        fp.close()

    if len(errors) > 0:
        '''
        "::{$type} file={$filename},line={$line},col=$column::{$log}"
        '''
        print(f"File: {filepath}")
        for error in errors:
            print(f"::{error[2]} file={filepath},line={error[1]}::{error[0]}")
        print('')
        return False


def main():
    bool_error = True
    print('start')
    try:
        files = ast.literal_eval(sys.argv[1])
        for file in files:
                print(file)
                if file[-4:] == ".rst":
                    if handle_file_action(file) is False:
                        bool_error = False
    except Exception as e:
        print(e)    
        for root, dirs, files in os.walk("../docs"):
            path = root.split(os.sep)
            for file in files:
                if file[-4:] == ".rst":
                    if handle_file(path, file) is False:
                        bool_error = False
    return bool_error


if __name__ == "__main__":
    if main() == False:
        exit(1)
