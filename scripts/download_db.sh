#!/bin/bash

# ID pliku z linku Google Drive
FILE_ID="1haAYXCddXatyN8_dVwl3iMZ84OBvo5sI"
DESTINATION="../backend/app/database/scientists.db"

mkdir -p $(dirname "$DESTINATION")

#gdown- narzędzie do pobierania dużych plików Google Drive
gdown --id $FILE_ID -O $DESTINATION

echo "Baza danych została pobrana do:  ${DESTINATION}"
