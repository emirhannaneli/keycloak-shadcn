import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Account dilleri
const accountLangs = ['ar', 'ca', 'cs', 'da', 'de', 'es', 'fi', 'fr', 'hu', 'it', 'ja', 'lt', 'lv', 'nl', 'no', 'pl', 'pt-BR', 'ru', 'sk', 'sv', 'zh-CN'];

// Login dilleri
const loginLangs = ['ar', 'ca', 'cs', 'da', 'de', 'el', 'es', 'fa', 'fi', 'fr', 'hu', 'it', 'ja', 'ka', 'lt', 'lv', 'nl', 'no', 'pl', 'pt', 'pt-BR', 'ru', 'sk', 'sv', 'th', 'uk', 'zh-CN', 'zh-TW'];

function generateAccountI18n() {
    const imports = accountLangs.map(lang => {
        const langVar = lang.replace('-', '_');
        return `import messages${langVar} from "./messages/${lang}";`;
    }).join('\n');
    
    const translations = accountLangs.map(lang => {
        const langVar = lang.replace('-', '_');
        return `        ${lang}: messages${langVar},`;
    }).join('\n');
    
    const content = `/* eslint-disable @typescript-eslint/no-unused-vars */
import { i18nBuilder } from "keycloakify/account";
import type { ThemeName } from "../kc.gen";
import messagesEn from "./messages/en";
import messagesTr from "./messages/tr";
${imports}

/** @see: https://docs.keycloakify.dev/features/i18n */
const { useI18n, ofTypeI18n } = i18nBuilder
    .withThemeName<ThemeName>()
    .withCustomTranslations({
        en: messagesEn,
        tr: messagesTr,
${translations}
    })
    .build();

type I18n = typeof ofTypeI18n;

export { useI18n, type I18n };
`;
    
    fs.writeFileSync(path.join(__dirname, '../src/account/i18n.ts'), content, 'utf8');
    console.log('✓ Updated src/account/i18n.ts');
}

function generateLoginI18n() {
    const imports = loginLangs.map(lang => {
        const langVar = lang.replace('-', '_');
        return `import messages${langVar} from "./messages/${lang}";`;
    }).join('\n');
    
    const translations = loginLangs.map(lang => {
        const langVar = lang.replace('-', '_');
        return `        ${lang}: messages${langVar},`;
    }).join('\n');
    
    const content = `/* eslint-disable @typescript-eslint/no-unused-vars */
import { i18nBuilder } from "keycloakify/login";
import type { ThemeName } from "../kc.gen";
import messagesEn from "./messages/en";
import messagesTr from "./messages/tr";
${imports}

/** @see: https://docs.keycloakify.dev/features/i18n */
const { useI18n, ofTypeI18n } = i18nBuilder
    .withThemeName<ThemeName>()
    .withCustomTranslations({
        en: messagesEn,
        tr: messagesTr,
${translations}
    })
    .build();

type I18n = typeof ofTypeI18n;

export { useI18n, type I18n };
`;
    
    fs.writeFileSync(path.join(__dirname, '../src/login/i18n.ts'), content, 'utf8');
    console.log('✓ Updated src/login/i18n.ts');
}

generateAccountI18n();
generateLoginI18n();
console.log('Done!');


