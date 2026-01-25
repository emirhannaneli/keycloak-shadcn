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

console.log(`\n📊 Çeviri Kontrol Raporu\n`);
console.log(`Account için toplam key sayısı: ${accountKeys.length}`);
console.log(`Login için toplam key sayısı: ${loginKeys.length}\n`);

// Account dilleri
const accountLangs = ['tr', 'ar', 'ca', 'cs', 'da', 'de', 'es', 'fi', 'fr', 'hu', 'it', 'ja', 'lt', 'lv', 'nl', 'no', 'pl', 'pt-BR', 'ru', 'sk', 'sv', 'zh-CN'];

// Login dilleri
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
    console.log('🔍 Account Çevirileri Kontrol Ediliyor...\n');
    let hasErrors = false;
    
    for (const lang of accountLangs) {
        const filePath = path.join(__dirname, '../src/account/messages', `${lang}.ts`);
        if (!fs.existsSync(filePath)) {
            console.log(`❌ ${lang}: Dosya bulunamadı`);
            hasErrors = true;
            continue;
        }
        
        const keys = extractKeysFromFile(filePath);
        const missingKeys = accountKeys.filter(key => !keys.includes(key));
        const extraKeys = keys.filter(key => !accountKeys.includes(key));
        
        if (missingKeys.length > 0 || extraKeys.length > 0) {
            console.log(`⚠️  ${lang}: ${keys.length}/${accountKeys.length} key`);
            if (missingKeys.length > 0) {
                console.log(`   Eksik key'ler: ${missingKeys.join(', ')}`);
            }
            if (extraKeys.length > 0) {
                console.log(`   Fazla key'ler: ${extraKeys.join(', ')}`);
            }
            hasErrors = true;
        } else {
            console.log(`✅ ${lang}: Tüm key'ler mevcut (${keys.length}/${accountKeys.length})`);
        }
    }
    
    return hasErrors;
}

function checkLoginTranslations() {
    console.log('\n🔍 Login Çevirileri Kontrol Ediliyor...\n');
    let hasErrors = false;
    
    for (const lang of loginLangs) {
        const filePath = path.join(__dirname, '../src/login/messages', `${lang}.ts`);
        if (!fs.existsSync(filePath)) {
            console.log(`❌ ${lang}: Dosya bulunamadı`);
            hasErrors = true;
            continue;
        }
        
        const keys = extractKeysFromFile(filePath);
        const missingKeys = loginKeys.filter(key => !keys.includes(key));
        const extraKeys = keys.filter(key => !loginKeys.includes(key));
        
        if (missingKeys.length > 0 || extraKeys.length > 0) {
            console.log(`⚠️  ${lang}: ${keys.length}/${loginKeys.length} key`);
            if (missingKeys.length > 0) {
                console.log(`   Eksik key'ler: ${missingKeys.join(', ')}`);
            }
            if (extraKeys.length > 0) {
                console.log(`   Fazla key'ler: ${extraKeys.join(', ')}`);
            }
            hasErrors = true;
        } else {
            console.log(`✅ ${lang}: Tüm key'ler mevcut (${keys.length}/${loginKeys.length})`);
        }
    }
    
    return hasErrors;
}

const accountErrors = checkAccountTranslations();
const loginErrors = checkLoginTranslations();

console.log('\n' + '='.repeat(50));
if (accountErrors || loginErrors) {
    console.log('\n❌ Bazı çevirilerde sorunlar bulundu!');
    console.log('💡 Çevirileri düzeltmek için: node scripts/fix-translations.js\n');
    process.exit(1);
} else {
    console.log('\n✅ Tüm çeviriler doğru ve eksiksiz!\n');
    process.exit(0);
}
