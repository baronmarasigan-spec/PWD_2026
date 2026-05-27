
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export enum Language {
  EN = 'en',
  TL = 'tl'
}

interface Translations {
  [key: string]: {
    [Language.EN]: string;
    [Language.TL]: string;
  };
}

export const translations: Translations = {
  // Dashboard
  welcome: {
    [Language.EN]: 'Welcome',
    [Language.TL]: 'Maligayang pagdating'
  },
  how_can_we_assist: {
    [Language.EN]: 'How can we assist you today?',
    [Language.TL]: 'Paano namin kayo matutulungan ngayon?'
  },
  sign_out: {
    [Language.EN]: 'Sign Out',
    [Language.TL]: 'Mag-sign Out'
  },
  my_profile: {
    [Language.EN]: 'My Profile',
    [Language.TL]: 'Aking Profile'
  },
  my_profile_desc: {
    [Language.EN]: 'Review and update your personal profile, home address, and contact records.',
    [Language.TL]: 'Suriin at i-update ang iyong personal na profile, tirahan, at mga rekord ng contact.'
  },
  benefits: {
    [Language.EN]: 'Benefits',
    [Language.TL]: 'Mga Benepisyo'
  },
  benefits_desc: {
    [Language.EN]: 'Browse and apply for healthcare programs, financial aid, and mandatory discounts.',
    [Language.TL]: 'Mag-browse at mag-apply para sa mga programa sa kalusugan, tulong pinansyal, at mga diskwento.'
  },
  id_services: {
    [Language.EN]: 'ID Services',
    [Language.TL]: 'Serbisyo sa ID'
  },
  id_services_desc: {
    [Language.EN]: 'Apply for a new PWD ID card, process renewals, or track your application status.',
    [Language.TL]: 'Mag-apply para sa bagong PWD ID card, mag-renew, o i-track ang status ng iyong aplikasyon.'
  },
  citizen_concerns: {
    [Language.EN]: 'Citizen Concerns',
    [Language.TL]: 'Mga Reklamo'
  },
  citizen_concerns_desc: {
    [Language.EN]: 'Submit feedback, report accessibility issues, or request assistance from our office.',
    [Language.TL]: 'Magsumite ng feedback, mag-ulat ng mga isyu sa accessibility, o humingi ng tulong sa aming opisina.'
  },
  // Benefits Page
  benefits_header: {
    [Language.EN]: 'PWD Benefits & Support',
    [Language.TL]: 'Mga Benepisyo at Suporta para sa PWD'
  },
  benefits_subheader: {
    [Language.EN]: 'Access financial assistance, healthcare programs, and accessibility perks.',
    [Language.TL]: 'Kumuha ng tulong pinansyal, mga programa sa kalusugan, at mga pribilehiyo.'
  },
  apply_programs: {
    [Language.EN]: 'Apply for Programs',
    [Language.TL]: 'Mag-apply para sa mga Programa'
  },
  send_request: {
    [Language.EN]: 'Send Request',
    [Language.TL]: 'Ipadala ang Kahilingan'
  },
  request_sent: {
    [Language.EN]: 'Request Sent',
    [Language.TL]: 'Naipadala na ang Kahilingan'
  },
  // ID Services Page
  id_header: {
    [Language.EN]: 'PWD ID Card Services',
    [Language.TL]: 'Serbisyo para sa PWD ID Card'
  },
  id_subheader: {
    [Language.EN]: 'Manage your official PWD identification and digital credentials.',
    [Language.TL]: 'Pamahalaan ang iyong opisyal na PWD identification at digital credentials.'
  },
  apply_new_id: {
    [Language.EN]: 'Apply for New ID',
    [Language.TL]: 'Mag-apply para sa Bagong ID'
  },
  id_status: {
    [Language.EN]: 'ID Status',
    [Language.TL]: 'Status ng ID'
  },
  // Profile Page
  profile_header: {
    [Language.EN]: 'Personal Profile',
    [Language.TL]: 'Personal na Profile'
  },
  profile_subheader: {
    [Language.EN]: 'Manage your personal information and contact details.',
    [Language.TL]: 'Pamahalaan ang iyong personal na impormasyon at mga detalye ng contact.'
  },
  save_changes: {
    [Language.EN]: 'Save Changes',
    [Language.TL]: 'I-save ang mga Pagbabago'
  },
  // Complaints Page
  concerns_header: {
    [Language.EN]: 'Citizen Concerns & Feedback',
    [Language.TL]: 'Mga Reklamo at Feedback ng Mamamayan'
  },
  concerns_subheader: {
    [Language.EN]: 'Report issues or request assistance from our office.',
    [Language.TL]: 'Mag-ulat ng mga isyu o humingi ng tulong mula sa aming opisina.'
  },
  submit_concern: {
    [Language.EN]: 'Submit Concern',
    [Language.TL]: 'Ipasa ang Reklamo'
  },
  // Common
  verified: {
    [Language.EN]: 'Verified',
    [Language.TL]: 'Beripikado'
  },
  active: {
    [Language.EN]: 'Active',
    [Language.TL]: 'Aktibo'
  },
  digital: {
    [Language.EN]: 'Digital',
    [Language.TL]: 'Digital'
  },
  support: {
    [Language.EN]: 'Support',
    [Language.TL]: 'Suporta'
  },
  language: {
    [Language.EN]: 'Language',
    [Language.TL]: 'Wika'
  },
  back: {
    [Language.EN]: 'Back',
    [Language.TL]: 'Bumalik'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(Language.EN);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    if (!translations[key]) return key;
    return translations[key][language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
