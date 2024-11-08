'use client'
import { DictionaryType } from "@/lib/get-dictionary";
import { createContext, ReactNode, useContext } from "react";

interface I18nContextType {
    dictionaryEN: DictionaryType
    dictionaryVI: DictionaryType
    dictionaryJA: DictionaryType
}
interface I18nProviderProps {
    children: ReactNode;
    dictionaryVI: DictionaryType
    dictionaryEN: DictionaryType
    dictionaryJA: DictionaryType
}

const i18nContext = createContext<I18nContextType | null>(null)

export const I18nProvider = ({ children, dictionaryEN, dictionaryVI, dictionaryJA }: I18nProviderProps) => {
    const value = {
        dictionaryEN,
        dictionaryVI,
        dictionaryJA
    }
    return <i18nContext.Provider value={value}>{children}</i18nContext.Provider>
}


export const useI18n = (lang: string) => {
    const I18n = useContext(i18nContext)
    if (!I18n) {
        throw new Error('useI18n must be used within I18nProvider')
    }
    switch (lang) {
        case 'vi':
            return I18n.dictionaryVI
        case 'en':
            return I18n.dictionaryEN
        case 'ja':
            return I18n.dictionaryJA
        default:
            return I18n.dictionaryEN
    }
}