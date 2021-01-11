#!/bin/bash

curl --header "Content-Type: application/json" --request POST --data '{"private_key":"ea3c91d79ab4f5015d31f9ead58575d6085df5a772a3269e", "co2":300.1, "tempC": 32.4, "humidity": 10.0, "mic": 10.0,"auxPressure": 10.0,"auxTempC": 10.0,"aux001": 10.0,"aux002": 10.0}' http://192.168.1.163:3000/data/ebc41413413c7880cac893f03918587f4da3b19492431625

