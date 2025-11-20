import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

// Account için key'ler
const accountEnContent = fs.readFileSync(path.join(__dirname, '../src/account/messages/en.ts'), 'utf8');
const accountKeysMatch = accountEnContent.match(/const messages = \{([\s\S]*?)\};/);
const accountKeys = accountKeysMatch ? accountEnContent.match(/(\w+|"[^"]+"):/g).map(k => k.replace(/[":]/g, '')) : [];

// Login için key'ler
const loginEnContent = fs.readFileSync(path.join(__dirname, '../src/login/messages/en.ts'), 'utf8');
const loginKeysMatch = loginEnContent.match(/const messages = \{([\s\S]*?)\};/);
const loginKeys = loginKeysMatch ? loginEnContent.match(/(\w+|"[^"]+"):/g).map(k => k.replace(/[":]/g, '')) : [];

// Account dilleri
const accountLangs = ['ar', 'ca', 'cs', 'da', 'de', 'es', 'fi', 'fr', 'hu', 'it', 'ja', 'lt', 'lv', 'nl', 'no', 'pl', 'pt-BR', 'ru', 'sk', 'sv', 'zh-CN'];

// Login dilleri
const loginLangs = ['ar', 'ca', 'cs', 'da', 'de', 'el', 'es', 'fa', 'fi', 'fr', 'hu', 'it', 'ja', 'ka', 'lt', 'lv', 'nl', 'no', 'pl', 'pt', 'pt-BR', 'ru', 'sk', 'sv', 'th', 'uk', 'zh-CN', 'zh-TW'];

function extractKeysFromDefault(defaultMessages, keys) {
    const result = {};
    for (const key of keys) {
        if (defaultMessages[key] !== undefined) {
            result[key] = defaultMessages[key];
        }
    }
    return result;
}

function formatMessages(messages) {
    let result = 'const messages = {\n';
    for (const [key, value] of Object.entries(messages)) {
        const formattedKey = key.includes('-') || key.includes('.') ? `"${key}"` : key;
        const formattedValue = typeof value === 'string' ? `"${value.replace(/"/g, '\\"')}"` : JSON.stringify(value);
        result += `    ${formattedKey}: ${formattedValue},\n`;
    }
    result += '};';
    return result;
}

function parseTypeScriptMessages(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const messagesMatch = content.match(/const messages = \{([\s\S]*?)\};/);
    if (!messagesMatch) return {};
    
    const messagesStr = messagesMatch[1];
    const messages = {};
    
    // Tüm satırları al
    const lines = messagesStr.split('\n');
    let currentKey = null;
    let currentValue = '';
    let inString = false;
    let stringDelimiter = null;
    let braceCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (!line || line.startsWith('//')) continue;
        
        // Key bulma: key: veya "key": formatında
        const keyMatch = line.match(/^([\w-]+|"[^"]+"):\s*(.*)$/);
        if (keyMatch && !inString) {
            // Önceki key'i kaydet
            if (currentKey) {
                messages[currentKey] = currentValue.trim().replace(/^["']|["']$/g, '').replace(/,$/, '');
            }
            
            currentKey = keyMatch[1].replace(/["']/g, '');
            const rest = keyMatch[2];
            
            // Eğer value aynı satırda bitiyorsa
            if (rest.match(/^"[^"]*",?\s*$/)) {
                messages[currentKey] = rest.replace(/^["']|["']$/g, '').replace(/,$/, '');
                currentKey = null;
                currentValue = '';
            } else if (rest.startsWith('"')) {
                inString = true;
                stringDelimiter = '"';
                currentValue = rest.substring(1);
            } else {
                currentValue = rest;
            }
        } else if (currentKey) {
            // Value devam ediyor
            if (inString) {
                if (line.includes(stringDelimiter)) {
                    const endIndex = line.indexOf(stringDelimiter);
                    currentValue += '\n' + line.substring(0, endIndex);
                    messages[currentKey] = currentValue.replace(/\\"/g, '"').replace(/\\n/g, '\n');
                    currentKey = null;
                    currentValue = '';
                    inString = false;
                    stringDelimiter = null;
                } else {
                    currentValue += '\n' + line;
                }
            } else {
                currentValue += ' ' + line;
                if (line.endsWith(',') || line.endsWith(';')) {
                    const value = currentValue.trim().replace(/^["']|["']$/g, '').replace(/,$/, '');
                    messages[currentKey] = value;
                    currentKey = null;
                    currentValue = '';
                }
            }
        }
    }
    
    // Son key'i kaydet
    if (currentKey) {
        messages[currentKey] = currentValue.trim().replace(/^["']|["']$/g, '').replace(/,$/, '');
    }
    
    return messages;
}

function generateAccountTranslations() {
    console.log('Generating account translations...');
    for (const lang of accountLangs) {
        try {
            const defaultPath = path.join(__dirname, `../node_modules/keycloakify/src/account/i18n/messages_defaultSet/${lang}.ts`);
            const defaultMessages = parseTypeScriptMessages(defaultPath);
            const extracted = extractKeysFromDefault(defaultMessages, accountKeys);
            
            const content = `/* spell-checker: disable */
${formatMessages(extracted)}

export default messages;
/* spell-checker: enable */
`;
            
            const filePath = path.join(__dirname, '../src/account/messages', `${lang}.ts`);
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✓ Generated ${lang}.ts for account`);
        } catch (error) {
            console.error(`✗ Error generating ${lang}.ts for account:`, error.message);
        }
    }
}

function generateLoginTranslations() {
    console.log('Generating login translations...');
    for (const lang of loginLangs) {
        try {
            const defaultPath = path.join(__dirname, `../node_modules/keycloakify/src/login/i18n/messages_defaultSet/${lang}.ts`);
            const defaultMessages = parseTypeScriptMessages(defaultPath);
            const extracted = extractKeysFromDefault(defaultMessages, loginKeys);
            
            const content = `/* spell-checker: disable */
${formatMessages(extracted)}

export default messages;
/* spell-checker: enable */
`;
            
            const filePath = path.join(__dirname, '../src/login/messages', `${lang}.ts`);
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✓ Generated ${lang}.ts for login`);
        } catch (error) {
            console.error(`✗ Error generating ${lang}.ts for login:`, error.message);
        }
    }
}

// Çalıştır
generateAccountTranslations();
generateLoginTranslations();
console.log('Done!');

