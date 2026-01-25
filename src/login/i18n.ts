/* eslint-disable @typescript-eslint/no-unused-vars */
import { i18nBuilder } from "keycloakify/login";
import type { ThemeName } from "../kc.gen";
import messagesEn from "./messages/en";
import messagesTr from "./messages/tr";
import messagesar from "./messages/ar";
import messagesca from "./messages/ca";
import messagescs from "./messages/cs";
import messagesda from "./messages/da";
import messagesde from "./messages/de";
import messagesel from "./messages/el";
import messageses from "./messages/es";
import messagesfa from "./messages/fa";
import messagesfi from "./messages/fi";
import messagesfr from "./messages/fr";
import messageshu from "./messages/hu";
import messagesit from "./messages/it";
import messagesja from "./messages/ja";
import messageska from "./messages/ka";
import messageslt from "./messages/lt";
import messageslv from "./messages/lv";
import messagesnl from "./messages/nl";
import messagesno from "./messages/no";
import messagespl from "./messages/pl";
import messagespt from "./messages/pt";
import messagespt_BR from "./messages/pt-BR";
import messagesru from "./messages/ru";
import messagessk from "./messages/sk";
import messagessv from "./messages/sv";
import messagesth from "./messages/th";
import messagesuk from "./messages/uk";
import messageszh_CN from "./messages/zh-CN";
import messageszh_TW from "./messages/zh-TW";

/** @see: https://docs.keycloakify.dev/features/i18n */
const { useI18n, ofTypeI18n } = i18nBuilder
    .withThemeName<ThemeName>()
    .withCustomTranslations({
        en: messagesEn,
        tr: messagesTr,
        ar: messagesar,
        ca: messagesca,
        cs: messagescs,
        da: messagesda,
        de: messagesde,
        el: messagesel,
        es: messageses,
        fa: messagesfa,
        fi: messagesfi,
        fr: messagesfr,
        hu: messageshu,
        it: messagesit,
        ja: messagesja,
        ka: messageska,
        lt: messageslt,
        lv: messageslv,
        nl: messagesnl,
        no: messagesno,
        pl: messagespl,
        pt: messagespt,
        "pt-BR": messagespt_BR,
        ru: messagesru,
        sk: messagessk,
        sv: messagessv,
        th: messagesth,
        uk: messagesuk,
        "zh-CN": messageszh_CN,
        "zh-TW": messageszh_TW,
    })
    .build();

type I18n = typeof ofTypeI18n;

export { useI18n, type I18n };
