import { Configuration, OpenAIApi } from "openai";
import {readChunk} from 'read-chunk';
import { text } from "stream/consumers";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const request = async () => {
  // const textToAnalyze = (await readChunk('../media/work-session-58.mp4.vtt', {length: 37000, startPosition: 0})).toString();
  const textToAnalyze = (await readChunk('../media/work-session-58.mp4.vtt', {length: 35000, startPosition: 37001})).toString();
  console.log(textToAnalyze.substring(-100))

  const firstContext = "In this coding video session, the individuals f, m, and s discuss various coding topics. Here are the key points discussed:\n\n- They talk about starting the work session and the task at hand.\n- They mention testing and reviewing unit tests for a certain project.\n- They discuss the difficulties of pushing changes to a specific branch and how to resolve the issue.\n- They mention the need to allow maintainers to edit a certain branch in order to resolve pushing issues.\n- They discuss GitHub permissions and how to grant access to certain teams or individuals.\n- They try to find a way to add containers and collaborate in the project.\n- They discuss the failed unit tests and attempt to fix them by adjusting the text and expectations.\n- They discuss the changing roles and elements on a webpage and how it affects testing.\n- They mention the importance of avoiding too much reliance on specific text in tests.\n- They discuss the difference between buttons and links in terms of accessibility and testing.\n- They discuss the challenges of testing specific components and elements within a webpage.\n- They mention the importance of adjusting tests based on changes in the code or UI.\n- They continue reviewing and adjusting failing unit tests for better accuracy.\n- They discuss the challenges of finding the correct elements when testing specific scenarios.\n- They continue"

  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo-16k",
    messages: [
      {
        "role": "system",
        "content": "You are a summarizer for coding video sessions, there are 3 people (f, m and s)."
      },
      {
        "role": "system",
        "content": `Assume you are dealing with the second part of the session and you already have this summary for the first part: ${firstContext}`
      },
      {
        "role": "user",
        "content": textToAnalyze
      }
    ],
    temperature: 1,
    max_tokens: 256,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  }).catch((e) => {
    console.log(e.toJSON())
  })

  console.log(JSON.stringify(response.data, ' ', 2));
  return response;
}

try {
  request();
} catch(e) {
  
}