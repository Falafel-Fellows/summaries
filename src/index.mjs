import { Configuration, OpenAIApi } from "openai";
import {readChunk} from 'read-chunk';
import { text } from "stream/consumers";
import fs from "fs"
import assert from "node:assert"

assert(process.env.OPENAI_API_KEY, "missing API KEY")

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const subtitleFile = process.argv[2]

const chatCompletionDefaultConfig = {
    model: "gpt-3.5-turbo-16k",
    temperature: 1,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
}
const summarize = async (textToAnalyze, systemMessage, maxTokens = 1024) => {
  const response = await openai.createChatCompletion({
    ...chatCompletionDefaultConfig,
    max_tokens:  maxTokens,
    messages: [
      {
        "role": "system",
        "content": systemMessage
      },
      {
        "role": "user",
        "content": textToAnalyze
      }
    ],
  }).catch((e) => {
    console.log(e.toJSON())
  })
  return response;
}


const startPosition = 0
const chunkLength = 35000


const totalSubtitleSize = fs.statSync(subtitleFile).size
const numberOfChunks = Math.ceil(totalSubtitleSize / chunkLength)
const chunkStarts = Array(numberOfChunks).fill(null).map((item, index) => index*chunkLength)
console.log({chunkStarts})

let timestamps = []

// TODO: figure out why order of the chunks are not preserved
const chunks = await Promise.all(chunkStarts.map((startPosition) => {
  return readChunk(subtitleFile, {length: chunkLength, startPosition})
}))

Promise.all(chunks.map((chunk, partNumber) => {
  const systemMessage = `Here is the part number ${partNumber}, your job is to summarize it`
  const textToAnalyze = chunk.toString()
  const timestampRegex = /(\d{2}:\d{2}:\d{2}\.\d{3})/;
  // Find the first match using the regex
  const firstTimestampMatch = textToAnalyze.match(timestampRegex);

  // Extract the timestamp if a match was found
  const firstTimestamp = firstTimestampMatch ? firstTimestampMatch[1] : null;
  timestamps.push(firstTimestamp)
  return summarize(textToAnalyze, systemMessage)
})).then(async summaries => {
  console.log({timestamps})
  const summariesText = summaries.reduce((acc, curr, index) => {
    console.log(curr.data.choices[0].finish_reason)
    return `${acc}\n ${timestamps[index]}\n ${curr.data.choices[0].message.content}`
  }, "")
  console.log(summariesText)
  //const systemMessage = `You summarize text, the provided input will be parts of a meeting. Split your summary into topics.`
  const systemMessage = `You summarize text, the provided input will be parts of a meeting. Identify the main topics discussed and list them.`
  const finalSummary = await summarize(summariesText, systemMessage)
  console.log(JSON.stringify(finalSummary.data, " ", 2))
})

