import { Configuration, OpenAIApi } from "openai";
import {readChunk} from 'read-chunk';
import { text } from "stream/consumers";
import fs from "fs"

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const subtitleFile = process.argv[2]

const chatCompletionDefaultConfig = {
    model: "gpt-3.5-turbo-16k",
    temperature: 1,
    max_tokens: 256,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
}
const summarize = async (textToAnalyze, systemMessage) => {
  const response = await openai.createChatCompletion({
    ...chatCompletionDefaultConfig,
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
const chunkStarts = Array(numberOfChunks).fill(null).map((item, index) => index*chunkLength )

Promise.all(chunkStarts.map(async (startPosition, partNumber) => {
  const systemMessage = `You are receiving the subtitles of part ${partNumber} of a work session between 3 fellows and you have to summarize it.`
  const textToAnalyze = (await readChunk(subtitleFile, {length: chunkLength, startPosition})).toString();
  return summarize(textToAnalyze, systemMessage)
})).then(async summaries => {
  const summariesText = summaries.reduce((acc, curr) => {
    return `${acc}\n ${curr.data.choices[0].message.content}`
  }, "")
  console.log(summariesText)
  const systemMessage = `You summarize text, the provided input will be parts of a meeting.`
  const finalSummary = await summarize(summariesText, systemMessage)
  console.log(JSON.stringify(finalSummary.data, " ", 2))
})

