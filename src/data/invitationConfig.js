/**
 * Central Configuration for Neha Prabhakar Kadam & Chinmay Devidas Pawar's Engagement Invitation
 */
export const invitationConfig = {
  couple: {
    bride: {
      en: 'Neha',
      mr: 'नेहा',
      shortEn: 'Neha',
      shortMr: 'नेहा',
      fullNameEn: 'Neha Prabhakar Kadam',
      fullNameMr: 'चि. सौ. कां. नेहा प्रभाकर कदम',
      parentsEn: 'D/o Smt. & Shri Prabhakar Kadam',
      parentsMr: 'सुपुत्री: सौ. व श्री. प्रभाकर कदम',
      titleEn: 'Bride-to-be',
      titleMr: 'चि. सौ. कां. वधू'
    },
    groom: {
      en: 'Chinmay',
      mr: 'चिन्मय',
      shortEn: 'Chinmay',
      shortMr: 'चिन्मय',
      fullNameEn: 'Chinmay Devidas Pawar',
      fullNameMr: 'चि. चिन्मय देविदास पवार',
      parentsEn: 'S/o Smt. & Shri Devidas Pawar',
      parentsMr: 'सुपुत्र: सौ. व श्री. देविदास पवार',
      titleEn: 'Groom-to-be',
      titleMr: 'चि. वर'
    },
    family: {
      en: 'Kadam & Pawar Families',
      mr: 'कदम व पवार परिवार'
    },
    monogram: 'N & C',
    monogramMarathi: 'ने & चि'
  },
  event: {
    date: '2026-12-19', // YYYY-MM-DD (19 December 2026)
    targetCountdownISO: '2026-12-19T10:30:00+05:30', // Saturday, 19 Dec 2026 10:30 AM IST
    timezone: 'Asia/Kolkata',
    displayDate: {
      en: 'Saturday, 19 December 2026',
      mr: 'शनिवार, १९ डिसेंबर २०२६'
    },
    time: {
      en: '10:30 AM (Auspicious Muhurat)',
      mr: 'सकाळी १०:३० वा. (शुभ मुहूर्त)',
      isConfirmed: true
    },
    venue: {
      nameEn: 'Supreme Banquets Hall',
      nameMr: 'सुप्रीम बँक्वेट्स हॉल',
      addressEn: 'Manpada, Thane West, Thane - 400610',
      addressMr: 'मानपाडा, ठाणे (पश्चिम), ठाणे - ४००६१०',
      cityEn: 'Thane West, Thane 400610',
      cityMr: 'ठाणे (पश्चिम), ठाणे ४००६१०',
      landmarkEn: 'Near Manpada Junction, Ghodbunder Road',
      landmarkMr: 'मानपाडा जंक्शन जवळ, घोडबंदर रोड',
      isConfirmed: true,
      mapLink: 'https://maps.google.com/?q=Supreme+Banquets+Hall,+Manpada,+Thane+West,+Thane+400610',
      mapEmbedUrl: 'https://www.google.com/maps?q=Supreme+Banquets+Hall,+Manpada,+Thane+West,+Thane+400610&output=embed'
    }
  },
  music: {
    src: './music/romantic_instrumental.wav',
    title: 'Maharashtrian Royal Traditional Ambient Instrumental',
  },
  social: {
    whatsappShareText: (url, lang = 'en') => {
      if (lang === 'mr') {
        return `॥ श्री गणेशाय नमः ॥\n\nआप्तेष्टांच्या आशीर्वादाने, नेहा प्रभाकर कदम आणि चिन्मय देविदास पवार यांच्या साखरपुड्याच्या आनंदसोहळ्यास आपणास सस्नेह आमंत्रण!\n\nशुभ दिनांक: शनिवार, १९ डिसेंबर २०२६\nशुभ वेळ: सकाळी १०:३० वा.\nस्थळ: सुप्रीम बँक्वेट्स हॉल, मानपाडा, ठाणे (पश्चिम) - ४००६१०\n\nडिजिटल निमंत्रण व नकाशा पाहण्यासाठी येथे क्लिक करा:\n${url}`;
      }
      return `॥ Shree Ganeshay Namah ॥\n\nWith the divine blessings of our families, you are warmly invited to celebrate the engagement ceremony of Neha Prabhakar Kadam & Chinmay Devidas Pawar!\n\nDate: Saturday, 19 December 2026\nTime: 10:30 AM (Auspicious Muhurat)\nVenue: Supreme Banquets Hall, Manpada, Thane West, Thane - 400610\n\nView official digital invitation & location map here:\n${url}`;
    }
  }
};
