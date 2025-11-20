/* eslint-disable @typescript-eslint/no-unused-vars */
import { i18nBuilder } from "keycloakify/account";
import type { ThemeName } from "../kc.gen";
import messagesEn from "./messages/en";
import messagesTr from "./messages/tr";

/** @see: https://docs.keycloakify.dev/features/i18n */
const { useI18n, ofTypeI18n } = i18nBuilder
    .withThemeName<ThemeName>()
    .withCustomTranslations({
        en: messagesEn,
        tr: messagesTr,
    })
    .build();

type I18n = typeof ofTypeI18n;

export { useI18n, type I18n };
