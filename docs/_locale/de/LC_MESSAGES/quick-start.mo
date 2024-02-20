��    S      �  q   L        j     �  |  F   	  4   W	  =   �	  _   �	  �   *
  V   *     �     �  �   �  �   t     �  S        j  �   �  �   X     3  D   C     �     �  #   �  �   �    z  �   �  �     1   �     �  "  �  �     �   �  �   ]  |   Q     �  �   �  	   �  �   �  �   x  '    %  :     `  >   x     �  �   �  f   x  B   �     "     9     Y     w     �     �  )   �  '   �       +     [   B  ]   �  G   �  E   D  G   �    �  �   �   �   �!  �   "  m   �"  �   #  �   $  �   �$    �%  r  �&  �   (  C  �(  �   �)    �*  �   �+  �   $,  a   �,  d    -  `   �-  \   �-  Z   C.  �   �.  j   y/  �  �/  F   x1  4   �1  =   �1  _   22  �   �2  V   �3     �3     4  �   4  �   �4     a5  S   ~5     �5  �   �5  �   �6     �7  D   �7     �7     8  #   8  �   A8    �8  �   �9  �   :  1   ;     ?;  "  T;  �   w<  �   =  �   �=  |   �>     6?  �   ??  	   @  �   @  �   �@  '  zA  %  �B     �C  >   �C     D  �   #D  f   �D  B   GE     �E     �E     �E     �E     �E     F  )   F  '   GF     oF  +   ~F  [   �F  ]   G  G   dG  E   �G  G   �G    :H  �   CI  �   �I  �   �J  m   K  �   }K  �   tL  �   gM    �M  r  O  �   zP  C  Q  �   PR    �R  �   �S  �   �T  a   &U  d   �U  `   �U  \   NV  Z   �V             ?                            B      D   $   Q          4      9       R   8      =   @      J       5   H   A           C   <   K      6      P           (              3   .   E   2          :   1   "      '      M   I       #         G           O   )   >   L       *   /             !   %       S             ,                    7          	           ;   
   0          -      F       &          +   N       A default action of ``return``, which returns the packet back to the original chain if no action is taken. A new firewall structure—which uses the ``nftables`` backend, rather than ``iptables``—is available on all installations starting from VyOS ``1.4-rolling-202308040557``. The firewall supports creation of distinct, interlinked chains for each `Netfilter hook <https://wiki.nftables.org/wiki-nftables/index.php/Netfilter_hooks>`_ and allows for more granular control over the packet filtering process. A rule to ``accept`` packets from established and related connections. A rule to ``drop`` packets from invalid connections. Add a set of firewall policies for our outside/WAN interface. After every configuration change, you need to apply the changes by using the following command: After switching to :ref:`quick-start-configuration-mode` issue the following commands, and your system will listen on every interface for incoming SSH connections. You might want to check the :ref:`ssh` chapter on how to listen on specific addresses only. After switching to :ref:`quick-start-configuration-mode` issue the following commands: Allow Access to Services Allow Management Access Alternatively, instead of configuring the ``CONN_FILTER`` chain described above, you can take the more traditional stateful connection filtering approach by creating rules on each hook's chain: Alternatively, you can take the more traditional stateful connection filtering approach by creating rules on each base hook's chain: Apply the firewall policies: As above, commit your changes, save the configuration, and exit configuration mode: Block Incoming Traffic By default, VyOS is in operational mode, and the command prompt displays a `$`. To configure VyOS, you will need to enter configuration mode, resulting in the command prompt displaying a `#`, as demonstrated below: By default, VyOS is in operational mode, and the command prompt displays a ``$``. To configure VyOS, you will need to enter configuration mode, resulting in the command prompt displaying a ``#``, as demonstrated below: Commit and Save Commit changes, save the configuration, and exit configuration mode: Configuration Mode Configure Firewall Groups Configure Stateful Packet Filtering Configure a rule on the ``input`` hook filter to jump to the ``VyOS_MANAGEMENT`` chain when new connections are addressed to port 22 (SSH) on the router itself: Create a new chain (``OUTSIDE-IN``) which will drop all traffic that is not explicity allowed at some point in the chain. Then, we can jump to that chain from the ``forward`` hook when traffic is coming from the ``WAN`` interface group and is addressed to our local network. DHCP clients will be assigned IP addresses within the range of `192.168.0.9 - 192.168.0.254` and have a domain name of `internal-network` DHCP clients will be assigned IP addresses within the range of ``192.168.0.9 - 192.168.0.254`` and have a domain name of ``internal-network`` DHCP leases will hold for one day (86400 seconds) DHCP/DNS quick-start Documentation for most of the new firewall CLI can be found in the :ref:`firewall` chapter.The legacy firewall is still available for versions before ``1.4-rolling-202308040557`` and can be found in the :ref:`firewall-legacy` chapter. The examples in this section use the new configuration. Especially if you are allowing SSH remote access from the outside/WAN interface, there are a few additional configuration steps that should be taken. Finally, configure the ``VyOS_MANAGEMENT`` chain to accept connection from the ``LAN`` interface group while limiting requests coming from the ``WAN`` interface group to 4 per minute: Finally, try and SSH into the VyOS install as your new user. Once you have confirmed that your new user can access your router without a password, delete the original ``vyos`` user and completely disable password authentication for :ref:`ssh`: Finally, we can now configure access to the services running on this router, allowing all connections coming from localhost: Firewall First, create a new dedicated chain (``VyOS_MANAGEMENT``) for management access, which returns to the parent chain if no action is taken. Add a rule to accept traffic from the ``LAN`` interface group: Hardening Here we're allowing the router to respond to pings. Then, we can allow access to the DNS recursor we configured earlier, accepting traffic bound for port 53 from all hosts on the ``NET-INSIDE-v4`` network: If you wanted to enable SSH access to your firewall from the outside/WAN interface, you could create some additional rules to allow that kind of traffic. In this case, we will create two interface groups — a ``WAN`` group for our interfaces connected to the public internet and a ``LAN`` group for the interfaces connected to our internal network. Additionally, we will create a network group, ``NET-INSIDE-v4``, that contains our internal subnet. In this case, we will create two interface groups—a ``WAN`` group for our interfaces connected to the public internet and a ``LAN`` group for the interfaces connected to our internal network. Additionally, we will create a network group, ``NET-INSIDE-v4``, that contains our internal subnet. Interface Configuration Most installations would choose this option, and will contain: NAT Now that we have configured stateful connection filtering to allow traffic from established and related connections, we can block all other incoming traffic addressed to our local network. Once your configuration works as expected, you can save it permanently by using the following command: Only hosts from your internal/LAN network can use the DNS recursor Option 1: Common Chain Option 1: Global State Policies Option 2: Common/Custom Chain Option 2: Per-Hook Chain Option 3: Per-Hook Chain Quick Start Replace the default ``vyos`` system user: Replace the default `vyos` system user: SSH Management Set up :ref:`ssh_key_based_authentication`: The address range `192.168.0.2/24 - 192.168.0.8/24` will be reserved for static assignments The address range ``192.168.0.2/24 - 192.168.0.8/24`` will be reserved for static assignments The chain we will create is called ``CONN_FILTER`` and has three rules: The default gateway and DNS recursor address will be `192.168.0.1/24` The default gateway and DNS recursor address will be ``192.168.0.1/24`` The firewall begins with the base ``filter`` tables you define for each of the ``forward``, ``input``, and ``output`` Netfiter hooks. Each of these tables is populated with rules that are processed in order and can jump to other chains for more granular filtering. The following settings will configure :ref:`source-nat` rules for our internal/LAN network, allowing hosts to communicate through the outside/WAN network via IP masquerade. The following settings will configure DHCP and DNS services on your internal/LAN network, where VyOS will act as the default gateway and DNS server. Then, we can jump to the common chain from both the ``forward`` and ``input`` hooks as the first filtering rule in the respective chains: These rules allow SSH traffic and rate limit it to 4 requests per minute. This blocks brute-forcing attempts: This chapter will guide you on how to get up to speed quickly using your new VyOS system. It will show you a very basic configuration example that will provide a :ref:`nat` gateway for a device with two network interfaces (``eth0`` and ``eth1``). This chapter will guide you on how to get up to speed quickly using your new VyOS system. It will show you a very basic configuration example that will provide a :ref:`nat` gateway for a device with two network interfaces (`eth0` and `eth1`). This configuration creates a proper stateful firewall that blocks all traffic which was not initiated from the internal/LAN side first. To make firewall configuration easier, we can create groups of interfaces, networks, addresses, ports, and domains that describe different parts of our network. We can then use them for filtering within our firewall rulesets, allowing for more concise and readable configuration. Using options defined in ``set firewall global-options state-policy``, state policy rules that applies for both IPv4 and IPv6 are created. These global state policies also applies for all traffic that passes through the router (transit) and for traffic originated/destinated to/from the router itself, and will be avaluated before any other rule defined in the firewall. VyOS will serve as a full DNS recursor, replacing the need to utilize Google, Cloudflare, or other public DNS servers (which is good for privacy) We can create a common chain for stateful connection filtering of multiple interfaces (or multiple netfilter hooks on one interface). Those individual chains can then jump to the common chain for stateful connection filtering, returning to the original chain for further rule processing if no action is taken on the packet. We can now configure access to the router itself, allowing SSH access from the inside/LAN network and rate limiting SSH access from the outside/WAN network. We should also block all traffic destinated to the router itself that isn't explicitly allowed at some point in the chain for the ``input`` hook. As we've already configured stateful packet filtering above, we only need to set the default action to ``drop``: With the new firewall structure, we have have a lot of flexibility in how we group and order our rules, as shown by the three alternative approaches below. With the new firewall structure, we have have a lot of flexibility in how we group and order our rules, as shown by the two alternative approaches below. You now should have a simple yet secure and functioning router to experiment with further. Enjoy! Your internal/LAN interface will be ``eth1``. It will use a static IP address of ``192.168.0.1/24``. Your internal/LAN interface will be `eth1`. It will use a static IP address of `192.168.0.1/24`. Your outside/WAN interface will be ``eth0``. It will receive its interface address via DHCP. Your outside/WAN interface will be `eth0`. It will receive its interface address via DHCP. MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8
Content-Transfer-Encoding: 8bit
X-Generator: Localazy (https://localazy.com)
Project-Id-Version: 
Language: de
Plural-Forms: nplurals=2; plural=(n==1) ? 0 : 1;
 A default action of ``return``, which returns the packet back to the original chain if no action is taken. A new firewall structure—which uses the ``nftables`` backend, rather than ``iptables``—is available on all installations starting from VyOS ``1.4-rolling-202308040557``. The firewall supports creation of distinct, interlinked chains for each `Netfilter hook <https://wiki.nftables.org/wiki-nftables/index.php/Netfilter_hooks>`_ and allows for more granular control over the packet filtering process. A rule to ``accept`` packets from established and related connections. A rule to ``drop`` packets from invalid connections. Add a set of firewall policies for our outside/WAN interface. After every configuration change, you need to apply the changes by using the following command: After switching to :ref:`quick-start-configuration-mode` issue the following commands, and your system will listen on every interface for incoming SSH connections. You might want to check the :ref:`ssh` chapter on how to listen on specific addresses only. After switching to :ref:`quick-start-configuration-mode` issue the following commands: Allow Access to Services Allow Management Access Alternatively, instead of configuring the ``CONN_FILTER`` chain described above, you can take the more traditional stateful connection filtering approach by creating rules on each hook's chain: Alternatively, you can take the more traditional stateful connection filtering approach by creating rules on each base hook's chain: Apply the firewall policies: As above, commit your changes, save the configuration, and exit configuration mode: Block Incoming Traffic By default, VyOS is in operational mode, and the command prompt displays a `$`. To configure VyOS, you will need to enter configuration mode, resulting in the command prompt displaying a `#`, as demonstrated below: By default, VyOS is in operational mode, and the command prompt displays a ``$``. To configure VyOS, you will need to enter configuration mode, resulting in the command prompt displaying a ``#``, as demonstrated below: Commit and Save Commit changes, save the configuration, and exit configuration mode: Configuration Mode Configure Firewall Groups Configure Stateful Packet Filtering Configure a rule on the ``input`` hook filter to jump to the ``VyOS_MANAGEMENT`` chain when new connections are addressed to port 22 (SSH) on the router itself: Create a new chain (``OUTSIDE-IN``) which will drop all traffic that is not explicity allowed at some point in the chain. Then, we can jump to that chain from the ``forward`` hook when traffic is coming from the ``WAN`` interface group and is addressed to our local network. DHCP clients will be assigned IP addresses within the range of `192.168.0.9 - 192.168.0.254` and have a domain name of `internal-network` DHCP clients will be assigned IP addresses within the range of ``192.168.0.9 - 192.168.0.254`` and have a domain name of ``internal-network`` DHCP leases will hold for one day (86400 seconds) DHCP/DNS quick-start Documentation for most of the new firewall CLI can be found in the :ref:`firewall` chapter.The legacy firewall is still available for versions before ``1.4-rolling-202308040557`` and can be found in the :ref:`firewall-legacy` chapter. The examples in this section use the new configuration. Especially if you are allowing SSH remote access from the outside/WAN interface, there are a few additional configuration steps that should be taken. Finally, configure the ``VyOS_MANAGEMENT`` chain to accept connection from the ``LAN`` interface group while limiting requests coming from the ``WAN`` interface group to 4 per minute: Finally, try and SSH into the VyOS install as your new user. Once you have confirmed that your new user can access your router without a password, delete the original ``vyos`` user and completely disable password authentication for :ref:`ssh`: Finally, we can now configure access to the services running on this router, allowing all connections coming from localhost: Firewall First, create a new dedicated chain (``VyOS_MANAGEMENT``) for management access, which returns to the parent chain if no action is taken. Add a rule to accept traffic from the ``LAN`` interface group: Hardening Here we're allowing the router to respond to pings. Then, we can allow access to the DNS recursor we configured earlier, accepting traffic bound for port 53 from all hosts on the ``NET-INSIDE-v4`` network: If you wanted to enable SSH access to your firewall from the outside/WAN interface, you could create some additional rules to allow that kind of traffic. In this case, we will create two interface groups — a ``WAN`` group for our interfaces connected to the public internet and a ``LAN`` group for the interfaces connected to our internal network. Additionally, we will create a network group, ``NET-INSIDE-v4``, that contains our internal subnet. In this case, we will create two interface groups—a ``WAN`` group for our interfaces connected to the public internet and a ``LAN`` group for the interfaces connected to our internal network. Additionally, we will create a network group, ``NET-INSIDE-v4``, that contains our internal subnet. Interface Configuration Most installations would choose this option, and will contain: NAT Now that we have configured stateful connection filtering to allow traffic from established and related connections, we can block all other incoming traffic addressed to our local network. Once your configuration works as expected, you can save it permanently by using the following command: Only hosts from your internal/LAN network can use the DNS recursor Option 1: Common Chain Option 1: Global State Policies Option 2: Common/Custom Chain Option 2: Per-Hook Chain Option 3: Per-Hook Chain Quick Start Replace the default ``vyos`` system user: Replace the default `vyos` system user: SSH Management Set up :ref:`ssh_key_based_authentication`: The address range `192.168.0.2/24 - 192.168.0.8/24` will be reserved for static assignments The address range ``192.168.0.2/24 - 192.168.0.8/24`` will be reserved for static assignments The chain we will create is called ``CONN_FILTER`` and has three rules: The default gateway and DNS recursor address will be `192.168.0.1/24` The default gateway and DNS recursor address will be ``192.168.0.1/24`` The firewall begins with the base ``filter`` tables you define for each of the ``forward``, ``input``, and ``output`` Netfiter hooks. Each of these tables is populated with rules that are processed in order and can jump to other chains for more granular filtering. The following settings will configure :ref:`source-nat` rules for our internal/LAN network, allowing hosts to communicate through the outside/WAN network via IP masquerade. The following settings will configure DHCP and DNS services on your internal/LAN network, where VyOS will act as the default gateway and DNS server. Then, we can jump to the common chain from both the ``forward`` and ``input`` hooks as the first filtering rule in the respective chains: These rules allow SSH traffic and rate limit it to 4 requests per minute. This blocks brute-forcing attempts: This chapter will guide you on how to get up to speed quickly using your new VyOS system. It will show you a very basic configuration example that will provide a :ref:`nat` gateway for a device with two network interfaces (``eth0`` and ``eth1``). This chapter will guide you on how to get up to speed quickly using your new VyOS system. It will show you a very basic configuration example that will provide a :ref:`nat` gateway for a device with two network interfaces (`eth0` and `eth1`). This configuration creates a proper stateful firewall that blocks all traffic which was not initiated from the internal/LAN side first. To make firewall configuration easier, we can create groups of interfaces, networks, addresses, ports, and domains that describe different parts of our network. We can then use them for filtering within our firewall rulesets, allowing for more concise and readable configuration. Using options defined in ``set firewall global-options state-policy``, state policy rules that applies for both IPv4 and IPv6 are created. These global state policies also applies for all traffic that passes through the router (transit) and for traffic originated/destinated to/from the router itself, and will be avaluated before any other rule defined in the firewall. VyOS will serve as a full DNS recursor, replacing the need to utilize Google, Cloudflare, or other public DNS servers (which is good for privacy) We can create a common chain for stateful connection filtering of multiple interfaces (or multiple netfilter hooks on one interface). Those individual chains can then jump to the common chain for stateful connection filtering, returning to the original chain for further rule processing if no action is taken on the packet. We can now configure access to the router itself, allowing SSH access from the inside/LAN network and rate limiting SSH access from the outside/WAN network. We should also block all traffic destinated to the router itself that isn't explicitly allowed at some point in the chain for the ``input`` hook. As we've already configured stateful packet filtering above, we only need to set the default action to ``drop``: With the new firewall structure, we have have a lot of flexibility in how we group and order our rules, as shown by the three alternative approaches below. With the new firewall structure, we have have a lot of flexibility in how we group and order our rules, as shown by the two alternative approaches below. You now should have a simple yet secure and functioning router to experiment with further. Enjoy! Your internal/LAN interface will be ``eth1``. It will use a static IP address of ``192.168.0.1/24``. Your internal/LAN interface will be `eth1`. It will use a static IP address of `192.168.0.1/24`. Your outside/WAN interface will be ``eth0``. It will receive its interface address via DHCP. Your outside/WAN interface will be `eth0`. It will receive its interface address via DHCP. 