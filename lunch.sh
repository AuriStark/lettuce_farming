#!/bin/bash

# start Backend
cd ./app/backend &&
npm run serve &

# start Frontend
cd ./app/frontend &&
npm run dev