#!/usr/bin/env bash
forever stop "squads-web"
netstat -tulpn | grep ::88

