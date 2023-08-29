#!/bin/bash

# Get the name of the MP4 file.
filePath=$1
fileName=$(basename "$1")

ffmpeg -i $filePath "../media/$fileName.vtt"