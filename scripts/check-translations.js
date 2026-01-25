import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

// Keys for Account
const accountEnFile = path.join(__dirname, '../src/account/messages/en.ts');
const accountEnContent = fs.readFileSync(accountEnFile, 'utf8');
const accountKeys = [];
const accountKeyRegex = /^\s+([\w-]+|"[^"]+"):/gm;
let match;
while ((match = accountKeyRegex.exec(accountEnContent)) !== null) {
    accountKeys.push(match[1].replace(/["']/g, ''));
}

// Keys for Login
const loginEnFile = path.join(__dirname, '../src/login/messages/en.ts');
const loginEnContent = fs.readFileSync(loginEnFile, 'utf8');
const loginKeys = [];
const loginKeyRegex = /^\s+([\w-]+|"[^"]+"):/gm;
while ((match = loginKeyRegex.exec(loginEnContent)) !== null) {
    loginKeys.push(match[1].replace(/["']/g, ''));
}

console.log(`\n📊 Translation Check Report\n`);
console.log(`Total key count for Account: ${accountKeys.length}`);
console.log(`Total key count for Login: ${loginKeys.length}\n`);

// Account languages
const accountLangs = ['tr', 'ar', 'ca', 'cs', 'da', 'de', 'es', 'fi', 'fr', 'hu', 'it', 'ja', 'lt', 'lv', 'nl', 'no', 'pl', 'pt-BR', 'ru', 'sk', 'sv', 'zh-CN'];

// Login languages
const loginLangs = ['tr', 'ar', 'ca', 'cs', 'da', 'de', 'el', 'es', 'fa', 'fi', 'fr', 'hu', 'it', 'ja', 'ka', 'lt', 'lv', 'nl', 'no', 'pl', 'pt', 'pt-BR', 'ru', 'sk', 'sv', 'th', 'uk', 'zh-CN', 'zh-TW'];

function extractKeysFromFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const keys = [];
        const keyRegex = /^\s+([\w-]+|"[^"]+"):/gm;
        let match;
        while ((match = keyRegex.exec(content)) !== null) {
            keys.push(match[1].replace(/["']/g, ''));
        }
        return keys;
    } catch (error) {
        return [];
    }
}

function checkAccountTranslations() {
    console.log('🔍 Checking Account Translations...\n');
    let hasErrors = false;
    
    for (const lang of accountLangs) {
        const filePath = path.join(__dirname, '../src/account/messages', `${lang}.ts`);
        if (!fs.existsSync(filePath)) {
            console.log(`❌ ${lang}: File not found`);
            hasErrors = true;
            continue;
        }
        
        const keys = extractKeysFromFile(filePath);
        const missingKeys = accountKeys.filter(key => !keys.includes(key));
        const extraKeys = keys.filter(key => !accountKeys.includes(key));
        
        if (missingKeys.length > 0 || extraKeys.length > 0) {
            console.log(`⚠️  ${lang}: ${keys.length}/${accountKeys.length} key`);
            if (missingKeys.length > 0) {
                console.log(`   Missing keys: ${missingKeys.join(', ')}`);
            }
            if (extraKeys.length > 0) {
                console.log(`   Extra keys: ${extraKeys.join(', ')}`);
            }
            hasErrors = true;
        } else {
            console.log(`✅ ${lang}: All keys present (${keys.length}/${accountKeys.length})`);
        }
    }
    
    return hasErrors;
}

function checkLoginTranslations() {
    console.log('\n🔍 Checking Login Translations...\n');
    let hasErrors = false;
    
    for (const lang of loginLangs) {
        const filePath = path.join(__dirname, '../src/login/messages', `${lang}.ts`);
        if (!fs.existsSync(filePath)) {
            console.log(`❌ ${lang}: File not found`);
            hasErrors = true;
            continue;
        }
        
        const keys = extractKeysFromFile(filePath);
        const missingKeys = loginKeys.filter(key => !keys.includes(key));
        const extraKeys = keys.filter(key => !loginKeys.includes(key));
        
        if (missingKeys.length > 0 || extraKeys.length > 0) {
            console.log(`⚠️  ${lang}: ${keys.length}/${loginKeys.length} key`);
            if (missingKeys.length > 0) {
                console.log(`   Missing keys: ${missingKeys.join(', ')}`);
            }
            if (extraKeys.length > 0) {
                console.log(`   Extra keys: ${extraKeys.join(', ')}`);
            }
            hasErrors = true;
        } else {
            console.log(`✅ ${lang}: All keys present (${keys.length}/${loginKeys.length})`);
        }
    }
    
    return hasErrors;
}

const accountErrors = checkAccountTranslations();
const loginErrors = checkLoginTranslations();

console.log('\n' + '='.repeat(50));
if (accountErrors || loginErrors) {
    console.log('\n❌ Issues found in some translations!');
    console.log('💡 To fix translations: node scripts/fix-translations.js\n');
    process.exit(1);
} else {
    console.log('\n✅ All translations are correct and complete!\n');
    process.exit(0);
}
