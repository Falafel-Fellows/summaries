#!/bin/bash

# Get the name of the MP4 file.
fileName=$(basename "$1")

# Extract the closed captions from the MP4 file.
ffmpeg -i "../media/$fileName" "../media/$fileName.vtt"