#!/bin/bash

perl -pi -e 's/operations/Operations/g' ../src/services/nft-api.ts
perl -pi -e 's/components/Components/g' ../src/services/nft-api.ts
perl -pi -e 's/paths/Paths/g' ../src/services/nft-api.ts
perl -pi -e 's/external/External/g' ../src/services/nft-api.ts