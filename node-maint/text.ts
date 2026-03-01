import { OpenAI } from 'openai';
import natural from 'natural';
import nlp from 'compromise';
import langdetect from 'langdetect';

export async function isEnglish(text: string): Promise<boolean> {
  const lang = langdetect.detectOne(text);
  return lang === 'en';
}

// Define the type for the chat message analysis result
interface ChatAnalysisResult {
  tags: string[];
  summary: string;
  entities: string[];
}

// Function to call the OpenAI API for analyzing a chat message
export async function analyzeTextWithGPT(message: string, { apiKey }: { apiKey: string }): Promise<ChatAnalysisResult> {
  const openai = new OpenAI({ apiKey });

  const prompt = `
    Analyze the following chat message and provide tags, a summary, and entities for future reference:
  
    Message: ${message}
  
    Tags:
    Summary:
    Entities:
    `;

  try {
    const messages = [];
    messages.push({ role: 'user', content: prompt });
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 150,
      n: 1,
      stop: null,
      temperature: 0.7,
    });

    const completion = response.choices[0].message.content.trim();
    return refineAnalysis(completion, message);
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    // throw error;
    const tags = refineTags(extractKeywords(message));
    const summary = generateSummary(message);
    const entities = recognizeEntities(message);

    return { tags, summary, entities };
  }
}

// Function to refine the analysis result
function refineAnalysis(completion: string, message: string): ChatAnalysisResult {
  const tagsMatch = completion.match(/Tags:\s*(.*)/);
  const summaryMatch = completion.match(/Summary:\s*(.*)/);
  const entitiesMatch = completion.match(/Entities:\s*(.*)/);

  let tags = tagsMatch ? tagsMatch[1].split(',').map((tag) => tag.trim()) : [];
  let summary = summaryMatch ? summaryMatch[1] : '';
  let entities = entitiesMatch ? entitiesMatch[1].split(',').map((entity) => entity.trim()) : [];

  // Refine tags by removing common words and duplicates
  tags = refineTags(tags);

  // Generate a better summary if the initial summary is the same as the input message
  if (!summary || summary === message) {
    summary = generateSummary(message);
  }

  return { tags, summary, entities };
}

// List of common stopwords to remove
const stopwords = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'by',
  'for',
  'from',
  'has',
  'he',
  'in',
  'is',
  'it',
  'its',
  'of',
  'on',
  'that',
  'the',
  'to',
  'was',
  'were',
  'will',
  'with',
]);

// Function to refine tags by removing common words and duplicates
function refineTags(tags: string[]): string[] {
  return [...new Set(tags.filter((tag) => !stopwords.has(tag.toLowerCase())))];
}

// Function to generate a better summary using NLP
function generateSummary(message: string): string {
  const doc = nlp(message);
  const sentences = doc.sentences().out('array');
  return sentences.length > 1 ? `${sentences[0]}...` : message;
}

// Keyword Extraction with natural
export function extractKeywords(message: string): string[] {
  const tokenizer = new natural.WordTokenizer();
  const tfidf = new natural.TfIdf();

  tfidf.addDocument(message);
  const keywords: { term: string; tfidf: number }[] = [];
  tfidf.listTerms(0).forEach((item) => {
    keywords.push({ term: item.term, tfidf: item.tfidf });
  });

  return keywords.slice(0, 10).map((keyword) => keyword.term); // top 10 keywords
}

// Summarization with compromise
export function summarizeMessage(message: string): string {
  const doc = nlp(message);
  const sentences = doc.sentences().out('array');
  return sentences.length > 1 ? `${sentences[0]}...` : message;
}

// Entity Recognition with compromise
export function recognizeEntities(message: string): string[] {
  const doc = nlp(message);
  const entities = doc.people().out('array').concat(doc.places().out('array')).concat(doc.organizations().out('array'));

  // @ts-ignore
  return [...new Set(entities)]; // remove duplicates
}

// Function to calculate the complexity score of the message
export function calculateComplexity(message: string): number {
  const words = message.split(/\W+/).length;
  const sentences = message.split(/[.!?]+/).length;
  const averageWordsPerSentence = words / sentences;
  return Math.min(10, Math.max(1, averageWordsPerSentence / 2)); // Scale complexity score between 1 and 10
}

// Main function to analyze chat message
export async function analyzeText(
  message: string,
  opts: any = { enableApiFallback: false, apiKey: null }
): Promise<ChatAnalysisResult> {
  if (!message) {
    return { tags: [], summary: '', entities: [] };
  }

  const complexityScore = calculateComplexity(message);

  if (opts.enableApiFallback && complexityScore > 7) {
    return await analyzeTextWithGPT(message, opts);
  } else {
    const tags = refineTags(extractKeywords(message));
    const summary = generateSummary(message);
    const entities = recognizeEntities(message);

    return { tags, summary, entities };
  }
}
