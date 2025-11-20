/* eslint-disable @typescript-eslint/no-unused-vars */
import { i18nBuilder } from "keycloakify/account";
import type { ThemeName } from "../kc.gen";
import messagesEn from "./messages/en";
import messagesTr from "./messages/tr";
import messagesAr from "./messages/ar";
import messagesCa from "./messages/ca";
import messagesCs from "./messages/cs";
import messagesDa from "./messages/da";
import messagesDe from "./messages/de";
import messagesEs from "./messages/es";
import messagesFi from "./messages/fi";
import messagesFr from "./messages/fr";
import messagesHu from "./messages/hu";
import messagesIt from "./messages/it";
import messagesJa from "./messages/ja";
import messagesLt from "./messages/lt";
import messagesLv from "./messages/lv";
import messagesNl from "./messages/nl";
import messagesNo from "./messages/no";
import messagesPl from "./messages/pl";
import messagesPt_BR from "./messages/pt-BR";
import messagesRu from "./messages/ru";
import messagesSk from "./messages/sk";
import messagesSv from "./messages/sv";
import messagesZh_CN from "./messages/zh-CN";

/** @see: https://docs.keycloakify.dev/features/i18n */
const { useI18n, ofTypeI18n } = i18nBuilder
    .withThemeName<ThemeName>()
    .withCustomTranslations({
        en: messagesEn,
        tr: messagesTr,
        ar: messagesAr,
        ca: messagesCa,
        cs: messagesCs,
        da: messagesDa,
        de: messagesDe,
        es: messagesEs,
        fi: messagesFi,
        fr: messagesFr,
        hu: messagesHu,
        it: messagesIt,
        ja: messagesJa,
        lt: messagesLt,
        lv: messagesLv,
        nl: messagesNl,
        no: messagesNo,
        pl: messagesPl,
        "pt-BR": messagesPt_BR,
        ru: messagesRu,
        sk: messagesSk,
        sv: messagesSv,
        "zh-CN": messagesZh_CN,
    })
    .build();

type I18n = typeof ofTypeI18n;

export { useI18n, type I18n };
