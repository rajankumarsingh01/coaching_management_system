import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'hi' ? 'en' : 'hi';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="rounded border border-white/30 px-3 py-1 text-xs font-medium hover:bg-white/10"
    >
      {i18n.language === 'hi' ? 'English' : 'हिंदी'}
    </button>
  );
};

export default LanguageSwitcher;