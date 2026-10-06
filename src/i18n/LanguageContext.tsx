import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DEFAULT_LANGUAGE,
  Language,
  TranslationDict,
  translations,
} from './translations';

const LANGUAGE_KEY = '@app_language';

/**
 * Path key yang valid untuk `t()`, mis. `'about.title'` atau `'form.shiftN'`.
 * Diturunkan dari struktur kamus sehingga salah tulis key terdeteksi compiler.
 */
type Leaves<T> = T extends string
  ? ''
  : {
      [K in keyof T & string]: T[K] extends string
        ? K
        : `${K}.${Leaves<T[K]>}`;
    }[keyof T & string];

export type TranslationKey = Leaves<TranslationDict>;

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  /** Ambil teks untuk `key`. `params` mengisi placeholder `{nama}`. */
  t: (
    key: TranslationKey,
    params?: Record<string, string | number>
  ) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined
);

const getByPath = (dict: TranslationDict, key: string): string | undefined => {
  return key.split('.').reduce<any>((acc, part) => acc?.[part], dict);
};

const interpolate = (
  template: string,
  params?: Record<string, string | number>
): string => {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name) =>
    params[name] !== undefined ? String(params[name]) : match
  );
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);

  // Pulihkan preferensi bahasa yang tersimpan saat app dibuka.
  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(LANGUAGE_KEY)
      .then((saved) => {
        if (cancelled) return;
        if (saved === 'id' || saved === 'en') setLanguageState(saved);
      })
      .catch((e) => console.error('Gagal memuat preferensi bahasa:', e));
    return () => {
      cancelled = true;
    };
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    AsyncStorage.setItem(LANGUAGE_KEY, lang).catch((e) =>
      console.error('Gagal menyimpan preferensi bahasa:', e)
    );
  }, []);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>): string => {
      const dict = translations[language] as TranslationDict;
      const value = getByPath(dict, key) ?? getByPath(translations.id, key) ?? key;
      return interpolate(value, params);
    },
    [language]
  );

  const value = useMemo(
    () => ({ language, setLanguage, t }),
    [language, setLanguage, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = (): LanguageContextValue => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useTranslation harus dipakai di dalam <LanguageProvider>');
  }
  return ctx;
};
