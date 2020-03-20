# ZWoT Implement
###### tags: `Master Thesis Code`
* Introduction
    * It depends on mdns/dns-sd mechinsm and optimize the performance.
        * Packet traffic
            * Decrease packet amounts from n^2 to n
        * Unifiable Expression
            * Add other search function to improve the Qos performance
* Software Architecture
    * Service Discovery Manager
        * it is used to discovery all devices on the networks
    * Unifiable Expression Parser
        * It responses for Condition judgment, when user want to look.
    * WTM 
        * WTM is Hypermedia format on [W3C](https://www.w3.org/Submission/wot-model/) 
    * API Gateway
        * It disposes for http request and navigates Model or Model
    * Backend
        * It disposes on reply wtm messages back.
    * WebThing
        * To init the WoT devices.

![](https://i.imgur.com/qPBQlMM.png)

* Dynamic illustration
    * The Client wants to find specific devices, then it query a packages included some requirements.
    * The corrosponded devices send back access url to client.
![](https://i.imgur.com/02zQ2nF.png)

* Environment
    * At least Nodejs v8.10.0

