
import * as fs from 'fs';
import * as path from 'path';
import { ai } from '../src/ai/genkit';

const MESSAGES_DIR = path.join(process.cwd(), 'messages');
const SOURCE_LOCALE = 'en';
const TARGET_LOCALE = 'fr';

async function translateText(text: string, targetLocale: string): Promise<string> {
  try {
    const { text: translated } = await ai.generate({
      prompt: `Translate the following text from English to ${targetLocale}. 
      Ensure the tone is professional, welcoming, and suitable for a coaching platform.
      Do not include any explanations, just the translated text.
      
      Text: "${text}"`,
    });
    return translated.trim();
  } catch (error) {
    console.error(`Error translating "${text}":`, error);
    return text; // Fallback to original
  }
}

async function processTranslations() {
  console.log(`Starting translation from ${SOURCE_LOCALE} to ${TARGET_LOCALE}...`);

  const sourcePath = path.join(MESSAGES_DIR, `${SOURCE_LOCALE}.json`);
  const targetPath = path.join(MESSAGES_DIR, `${TARGET_LOCALE}.json`);

  if (!fs.existsSync(sourcePath)) {
    console.error(`Source file not found: ${sourcePath}`);
    process.exit(1);
  }

  const sourceContent = JSON.parse(fs.readFileSync(sourcePath, 'utf-8'));
  let targetContent: any = {};

  if (fs.existsSync(targetPath)) {
    targetContent = JSON.parse(fs.readFileSync(targetPath, 'utf-8'));
  }

  let updatedCount = 0;

  // Recursive function to traverse and translate keys
  async function traverse(sourceObj: any, targetObj: any, pathPrefix = '') {
    for (const key in sourceObj) {
      const currentPath = pathPrefix ? `${pathPrefix}.${key}` : key;
      const sourceValue = sourceObj[key];
      
      if (typeof sourceValue === 'object' && sourceValue !== null) {
        if (!targetObj[key]) {
          targetObj[key] = {};
        }
        await traverse(sourceValue, targetObj[key], currentPath);
      } else if (typeof sourceValue === 'string') {
        // Translate if missing or if the value is obviously strictly equal to the english one (and long enough to likely not be a shared word)
        // Ideally we only translate missing keys to preserve manual edits.
        if (!targetObj[key]) {
             console.log(`Translating new key: ${currentPath}`);
             targetObj[key] = await translateText(sourceValue, TARGET_LOCALE);
             updatedCount++;
        }
      }
    }
  }

  await traverse(sourceContent, targetContent);

  fs.writeFileSync(targetPath, JSON.stringify(targetContent, null, 2));
  console.log(`Translation complete. Updated ${updatedCount} keys.`);
  console.log(`Wrote to ${targetPath}`);
}

processTranslations().catch(console.error);
