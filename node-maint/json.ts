import { cleanJSON } from './string';

export function parse(str) {
  if (str === 'null') return undefined;
  // Extract the JSON part from the str using a regex that matches the JSON structure
  const jsonMatch = str.match(/(\[|\{)[^]*(\]|\})/);
  if (!jsonMatch) {
    // console.error('No valid JSON found')
    return undefined;
  }

  const jsonString = jsonMatch[0].replace(/\bundefined\b/g, 'null');

  // Remove single-line and multi-line comments using regex
  const cleanedResponse = jsonString.replace(/\/\/.*|\/\*[^]*?\*\//g, '');

  // Parse the cleaned JSON string
  try {
    const json = JSON.parse(cleanedResponse);
    return json;
  } catch (error) {
    console.error('Error parsing JSON:', error, cleanedResponse);
    return undefined;
  }
}
