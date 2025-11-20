import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

// Account için key'ler
const accountEnFile = path.join(__dirname, '../src/account/messages/en.ts');
const accountEnContent = fs.readFileSync(accountEnFile, 'utf8');
const accountKeys = [];
const accountKeyRegex = /^\s+([\w-]+|"[^"]+"):/gm;
let match;
while ((match = accountKeyRegex.exec(accountEnContent)) !== null) {
    accountKeys.push(match[1].replace(/["']/g, ''));
}

// Login için key'ler
const loginEnFile = path.join(__dirname, '../src/login/messages/en.ts');
const loginEnContent = fs.readFileSync(loginEnFile, 'utf8');
const loginKeys = [];
const loginKeyRegex = /^\s+([\w-]+|"[^"]+"):/gm;
while ((match = loginKeyRegex.exec(loginEnContent)) !== null) {
    loginKeys.push(match[1].replace(/["']/g, ''));
}

console.log(`Account keys: ${accountKeys.length}`);
console.log(`Login keys: ${loginKeys.length}`);

// Account dilleri
const accountLangs = ['ar', 'ca', 'cs', 'da', 'de', 'es', 'fi', 'fr', 'hu', 'it', 'ja', 'lt', 'lv', 'nl', 'no', 'pl', 'pt-BR', 'ru', 'sk', 'sv', 'zh-CN'];

// Login dilleri
const loginLangs = ['ar', 'ca', 'cs', 'da', 'de', 'el', 'es', 'fa', 'fi', 'fr', 'hu', 'it', 'ja', 'ka', 'lt', 'lv', 'nl', 'no', 'pl', 'pt', 'pt-BR', 'ru', 'sk', 'sv', 'th', 'uk', 'zh-CN', 'zh-TW'];

function extractValueFromLine(line) {
    const match = line.match(/:\s*"((?:[^"\\]|\\.)*)"\s*,?\s*$/);
    if (match) {
        return match[1].replace(/\\"/g, '"').replace(/\\n/g, '\n');
    }
    return null;
}

function parseMessagesFile(filePath, requiredKeys) {
    try {
        // Önce require ile dene
        const require = createRequire(import.meta.url);
        try {
            const messages = require(filePath).default;
            // Eksik key'leri en'den ekle
            const enMessages = require('../src/account/messages/en.ts').default;
            for (const key of requiredKeys) {
                if (!messages[key] && enMessages[key]) {
                    messages[key] = enMessages[key];
                }
            }
            return messages;
        } catch {
            // require çalışmazsa dosyayı parse et
        }
    } catch {}
    
    const content = fs.readFileSync(filePath, 'utf8');
    const messages = {};
    
    // Regex ile tüm key-value çiftlerini bul
    const keyValuePattern = /(?:^|\n)\s*([\w-]+|"[^"]+"):\s*"((?:[^"\\]|\\.|\\n)*)"\s*,?\s*(?:\n|$)/gm;
    let match;
    
    while ((match = keyValuePattern.exec(content)) !== null) {
        const key = match[1].replace(/["']/g, '');
        let value = match[2];
        // Escape karakterlerini düzelt
        value = value.replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\\\/g, '\\');
        messages[key] = value;
    }
    
    // Çok satırlı string'ler için alternatif pattern
    const multilinePattern = /(?:^|\n)\s*([\w-]+|"[^"]+"):\s*"((?:[^"\\]|\\.|\\n)*)"\s*,?\s*(?:\n|$)/gm;
    while ((match = multilinePattern.exec(content)) !== null) {
        const key = match[1].replace(/["']/g, '');
        if (!messages[key]) {
            let value = match[2];
            value = value.replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\\\/g, '\\');
            messages[key] = value;
        }
    }
    
    // Eksik key'leri en'den ekle
    try {
        const require = createRequire(import.meta.url);
        const enMessages = require('../src/account/messages/en.ts').default;
        for (const key of requiredKeys) {
            if (!messages[key] && enMessages[key]) {
                messages[key] = enMessages[key];
            }
        }
    } catch {}
    
    return messages;
}

function formatMessages(messages) {
    let result = 'const messages = {\n';
    for (const [key, value] of Object.entries(messages)) {
        const formattedKey = key.includes('-') || key.includes('.') ? `"${key}"` : key;
        const formattedValue = typeof value === 'string' 
            ? `"${value.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"` 
            : JSON.stringify(value);
        result += `    ${formattedKey}: ${formattedValue},\n`;
    }
    result += '};';
    return result;
}

function fixAccountTranslations() {
    console.log('Fixing account translations...');
    for (const lang of accountLangs) {
        try {
            const defaultPath = path.join(__dirname, `../node_modules/keycloakify/src/account/i18n/messages_defaultSet/${lang}.ts`);
            const defaultMessages = parseMessagesFile(defaultPath, accountKeys);
            
            // Sadece gerekli key'leri al
            const extracted = {};
            for (const key of accountKeys) {
                if (defaultMessages[key]) {
                    extracted[key] = defaultMessages[key];
                }
            }
            
            const content = `/* spell-checker: disable */
${formatMessages(extracted)}

export default messages;
/* spell-checker: enable */
`;
            
            const filePath = path.join(__dirname, '../src/account/messages', `${lang}.ts`);
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✓ Fixed ${lang}.ts for account (${Object.keys(extracted).length} keys)`);
        } catch (error) {
            console.error(`✗ Error fixing ${lang}.ts for account:`, error.message);
        }
    }
}

function parseLoginMessagesFile(filePath, requiredKeys) {
    try {
        // Önce require ile dene
        const require = createRequire(import.meta.url);
        try {
            const messages = require(filePath).default;
            // Eksik key'leri en'den ekle
            const enMessages = require('../src/login/messages/en.ts').default;
            for (const key of requiredKeys) {
                if (!messages[key] && enMessages[key]) {
                    messages[key] = enMessages[key];
                }
            }
            return messages;
        } catch {
            // require çalışmazsa dosyayı parse et
        }
    } catch {}
    
    const content = fs.readFileSync(filePath, 'utf8');
    const messages = {};
    
    // Regex ile tüm key-value çiftlerini bul
    const keyValuePattern = /(?:^|\n)\s*([\w-]+|"[^"]+"):\s*"((?:[^"\\]|\\.|\\n)*)"\s*,?\s*(?:\n|$)/gm;
    let match;
    
    while ((match = keyValuePattern.exec(content)) !== null) {
        const key = match[1].replace(/["']/g, '');
        let value = match[2];
        // Escape karakterlerini düzelt
        value = value.replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\\\/g, '\\');
        messages[key] = value;
    }
    
    // Eksik key'leri en'den ekle
    try {
        const require = createRequire(import.meta.url);
        const enMessages = require('../src/login/messages/en.ts').default;
        for (const key of requiredKeys) {
            if (!messages[key] && enMessages[key]) {
                messages[key] = enMessages[key];
            }
        }
    } catch {}
    
    return messages;
}

function fixLoginTranslations() {
    console.log('Fixing login translations...');
    for (const lang of loginLangs) {
        try {
            const defaultPath = path.join(__dirname, `../node_modules/keycloakify/src/login/i18n/messages_defaultSet/${lang}.ts`);
            const defaultMessages = parseLoginMessagesFile(defaultPath, loginKeys);
            
            // Sadece gerekli key'leri al
            const extracted = {};
            for (const key of loginKeys) {
                if (defaultMessages[key]) {
                    extracted[key] = defaultMessages[key];
                }
            }
            
            const content = `/* spell-checker: disable */
${formatMessages(extracted)}

export default messages;
/* spell-checker: enable */
`;
            
            const filePath = path.join(__dirname, '../src/login/messages', `${lang}.ts`);
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✓ Fixed ${lang}.ts for login (${Object.keys(extracted).length} keys)`);
        } catch (error) {
            console.error(`✗ Error fixing ${lang}.ts for login:`, error.message);
        }
    }
}

fixAccountTranslations();
fixLoginTranslations();
console.log('Done!');

