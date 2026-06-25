"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { createT, type Lang } from "@/lib/translations";

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: ReturnType<typeof createT>;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "vi",
  setLang: () => {},
  t: createT("vi"),
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("vi");

  useEffect(() => {
    const saved = localStorage.getItem("av_lang") as Lang;
    if (saved === "en" || saved === "vi") setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("av_lang", l);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: createT(lang) }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);
