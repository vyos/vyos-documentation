
########
RSA-Keys
########
RSA can be used for services such as key exchanges and for encryption purposes.
To make IPSec work with dynamic address on one/both sides, we will have to use
RSA keys for authentication. They are very fast and easy to setup.

First, on both routers run the operational command “generate vpn rsa-key 
bits 2048”. You may choose different length than 2048 of course.

.. code-block:: none

  vyos@left# run generate vpn rsa-key bits 2048
  Generating rsa-key to /config/ipsec.d/rsa-keys/localhost.key

  Your new local RSA key has been generated
  The public portion of the key is:

  0sAQO2335[long string here]

Please note down this public key, as you have to add this RSA key in the opposite router.

.. code-block:: none

  set vpn rsa-keys rsa-key-name LEFT rsa-key KEYGOESHERE

Now you are ready to setup IPsec. The key points:

1. Since both routers do not know their effective public addresses, we set the local-address of the peer to "any".
2. On the initiator, we set the peer address to its public address, but on the responder we only set the id.
3. On the initiator, we need to set the remote-id option so that it can identify IKE traffic from the responder correctly.
4. On the responder, we need to set the local id so that initiator can know who's talking to it for the point #3 to work.
5. Don't forget to enable NAT traversal on both sides, "set vpn ipsec nat-traversal enable".

LEFT SIDE:

.. code-block:: none

  set vpn rsa-keys rsa-key-name RIGHT rsa-key <PUBLIC KEY FROM THE RIGHT>

  set vpn ipsec ipsec-interfaces interface eth0
  set vpn ipsec nat-traversal 'enable'

  set vpn ipsec esp-group MyESPGroup proposal 1 encryption aes128
  set vpn ipsec esp-group MyESPGroup proposal 1 hash sha1

  set vpn ipsec ike-group MyIKEGroup proposal 1 dh-group 2
  set vpn ipsec ike-group MyIKEGroup proposal 1 encryption aes128
  set vpn ipsec ike-group MyIKEGroup proposal 1 hash sha1

  set vpn ipsec site-to-site peer 192.0.2.60 authentication mode rsa
  set vpn ipsec site-to-site peer 192.0.2.60 authentication id @LEFT
  set vpn ipsec site-to-site peer 192.0.2.60 authentication rsa-key-name RIGHT
  set vpn ipsec site-to-site peer 192.0.2.60 authentication remote-id RIGHT
  set vpn ipsec site-to-site peer 192.0.2.60 default-esp-group MyESPGroup
  set vpn ipsec site-to-site peer 192.0.2.60 ike-group MyIKEGroup
  set vpn ipsec site-to-site peer 192.0.2.60 local-address any
  set vpn ipsec site-to-site peer 192.0.2.60 connection-type initiate
  set vpn ipsec site-to-site peer 192.0.2.60 tunnel 1 local prefix 192.168.99.1/32
  set vpn ipsec site-to-site peer 192.0.2.60 tunnel 1 remote prefix 192.168.99.2/32

RIGHT SIDE:

.. code-block:: none

  set vpn rsa-keys rsa-key-name LEFT rsa-key <PUBLIC KEY FROM THE LEFT>

  set vpn ipsec ipsec-interfaces interface eth0
  set vpn ipsec nat-traversal 'enable'

  set vpn ipsec esp-group MyESPGroup proposal 1 encryption aes128
  set vpn ipsec esp-group MyESPGroup proposal 1 hash sha1

  set vpn ipsec ike-group MyIKEGroup proposal 1 dh-group 2
  set vpn ipsec ike-group MyIKEGroup proposal 1 encryption aes128
  set vpn ipsec ike-group MyIKEGroup proposal 1 hash sha1

  set vpn ipsec site-to-site peer @LEFT authentication id @RIGHT
  set vpn ipsec site-to-site peer @LEFT authentication mode rsa
  set vpn ipsec site-to-site peer @LEFT authentication rsa-key-name LEFT
  set vpn ipsec site-to-site peer @LEFT connection-type respond
  set vpn ipsec site-to-site peer @LEFT default-esp-group MyESPGroup
  set vpn ipsec site-to-site peer @LEFT ike-group MyIKEGroup
  set vpn ipsec site-to-site peer @LEFT local-address any
  set vpn ipsec site-to-site peer @LEFT tunnel 1 local prefix 192.168.99.2/32
  set vpn ipsec site-to-site peer @LEFT tunnel 1 remote prefix 192.168.99.1/32

