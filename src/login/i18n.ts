/* eslint-disable @typescript-eslint/no-unused-vars */
import { i18nBuilder } from "keycloakify/login";
import type { ThemeName } from "../kc.gen";
import messagesEn from "./messages/en";
import messagesTr from "./messages/tr";
import messagesAr from "./messages/ar";
import messagesCa from "./messages/ca";
import messagesCs from "./messages/cs";
import messagesDa from "./messages/da";
import messagesDe from "./messages/de";
import messagesEl from "./messages/el";
import messagesEs from "./messages/es";
import messagesFa from "./messages/fa";
import messagesFi from "./messages/fi";
import messagesFr from "./messages/fr";
import messagesHu from "./messages/hu";
import messagesIt from "./messages/it";
import messagesJa from "./messages/ja";
import messagesKa from "./messages/ka";
import messagesLt from "./messages/lt";
import messagesLv from "./messages/lv";
import messagesNl from "./messages/nl";
import messagesNo from "./messages/no";
import messagesPl from "./messages/pl";
import messagesPt from "./messages/pt";
import messagesPt_BR from "./messages/pt-BR";
import messagesRu from "./messages/ru";
import messagesSk from "./messages/sk";
import messagesSv from "./messages/sv";
import messagesTh from "./messages/th";
import messagesUk from "./messages/uk";
import messagesZh_CN from "./messages/zh-CN";
import messagesZh_TW from "./messages/zh-TW";

/** @see: https://docs.keycloakify.dev/features/i18n */
const { useI18n, ofTypeI18n } = i18nBuilder
    .withThemeName<ThemeName>()
    .withCustomTranslations(
        {
            en: messagesEn,
            tr: messagesTr,
            ar: messagesAr,
            ca: messagesCa,
            cs: messagesCs,
            da: messagesDa,
            de: messagesDe,
            el: messagesEl,
            es: messagesEs,
            fa: messagesFa,
            fi: messagesFi,
            fr: messagesFr,
            hu: messagesHu,
            it: messagesIt,
            ja: messagesJa,
            ka: messagesKa,
            lt: messagesLt,
            lv: messagesLv,
            nl: messagesNl,
            no: messagesNo,
            pl: messagesPl,
            pt: messagesPt,
            "pt-BR": messagesPt_BR,
            ru: messagesRu,
            sk: messagesSk,
            sv: messagesSv,
            th: messagesTh,
            uk: messagesUk,
            "zh-CN": messagesZh_CN,
            "zh-TW": messagesZh_TW,
        }
    )
    .build();

type I18n = typeof ofTypeI18n;

export { useI18n, type I18n };
