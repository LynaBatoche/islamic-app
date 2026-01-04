const express = require('express');
const cors = require('cors');
const { Coordinates, PrayerTimes, CalculationMethod, CalculationParameters, HighLatitudeRule, Qibla } = require('adhan');
const moment = require('moment');
const momentHijri = require('moment-hijri');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// API Routes

// Prayer Times API
app.get('/api/prayer-times/:date', (req, res) => {
  const { latitude, longitude, method = 2 } = req.query;
  const dateStr = req.params.date; // Format: YYYY-MM-DD

  if (!latitude || !longitude) {
    return res.status(400).json({
      code: 400,
      status: 'Bad Request',
      message: 'Latitude and longitude are required'
    });
  }

  const lat = Number.parseFloat(latitude);
  const lon = Number.parseFloat(longitude);
  
  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    return res.status(400).json({
      code: 400,
      status: 'Bad Request',
      message: 'Invalid latitude or longitude values'
    });
  }

  try {
    const coordinates = new Coordinates(lat, lon);
    const date = new Date(dateStr);
    const params = CalculationMethod.get(method) || CalculationMethod.get(2); // Default to Islamic Society of North America
    const prayerTimes = new PrayerTimes(coordinates, date, params);

    const timings = {
      Fajr: prayerTimes.fajr.toLocaleTimeString('en-US', { hour12: false }),
      Sunrise: prayerTimes.sunrise.toLocaleTimeString('en-US', { hour12: false }),
      Dhuhr: prayerTimes.dhuhr.toLocaleTimeString('en-US', { hour12: false }),
      Asr: prayerTimes.asr.toLocaleTimeString('en-US', { hour12: false }),
      Sunset: prayerTimes.sunset.toLocaleTimeString('en-US', { hour12: false }),
      Maghrib: prayerTimes.maghrib.toLocaleTimeString('en-US', { hour12: false }),
      Isha: prayerTimes.isha.toLocaleTimeString('en-US', { hour12: false }),
      Imsak: prayerTimes.imsak?.toLocaleTimeString('en-US', { hour12: false }) || null,
      Midnight: prayerTimes.middleOfTheNight?.toLocaleTimeString('en-US', { hour12: false }) || null
    };

    res.json({
      code: 200,
      status: 'OK',
      data: {
        timings,
        date: {
          readable: date.toDateString(),
          timestamp: date.getTime(),
          hijri: momentHijri(date).format('iYYYY/iMM/iDD')
        },
        meta: {
          latitude: lat,
          longitude: lon,
          timezone: 'UTC',
          method: {
            id: method,
            name: params.name || 'Islamic Society of North America'
          }
        }
      }
    });
  } catch (error) {
    console.error('Error calculating prayer times:', error);
    res.status(500).json({
      code: 500,
      status: 'Internal Server Error',
      message: 'Error calculating prayer times'
    });
  }
});

// Qibla Direction API
app.get('/api/qibla', (req, res) => {
  const { latitude, longitude } = req.query;

  if (!latitude || !longitude) {
    return res.status(400).json({
      code: 400,
      status: 'Bad Request',
      message: 'Latitude and longitude are required'
    });
  }

  const lat = Number.parseFloat(latitude);
  const lon = Number.parseFloat(longitude);
  
  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    return res.status(400).json({
      code: 400,
      status: 'Bad Request',
      message: 'Invalid latitude or longitude values'
    });
  }

  try {
    const coordinates = new Coordinates(lat, lon);
    const qiblaDirection = Qibla(coordinates);

    res.json({
      code: 200,
      status: 'OK',
      data: {
        direction: qiblaDirection,
        latitude: lat,
        longitude: lon
      }
    });
  } catch (error) {
    console.error('Error calculating Qibla direction:', error);
    res.status(500).json({
      code: 500,
      status: 'Internal Server Error',
      message: 'Error calculating Qibla direction'
    });
  }
});

// Geocoding API (simplified local version)
app.get('/api/geocode', async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({
      code: 400,
      status: 'Bad Request',
      message: 'Query parameter is required'
    });
  }

  try {
    // Use a free geocoding service or fallback to mock data
    const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5`, {
      headers: {
        'User-Agent': 'Islamic-Website/1.0'
      }
    });

    const results = response.data.map(item => ({
      place_id: item.place_id,
      licence: item.licence,
      osm_type: item.osm_type,
      osm_id: item.osm_id,
      lat: item.lat,
      lon: item.lon,
      class: item.class,
      type: item.type,
      place_rank: item.place_rank,
      importance: item.importance,
      addresstype: item.addresstype,
      name: item.name,
      display_name: item.display_name,
      boundingbox: item.boundingbox
    }));

    res.json(results);
  } catch (error) {
    console.error('Geocoding error:', error);
    // Fallback to mock data for major cities
    const mockResults = getMockGeocodingResults(q);
    res.json(mockResults);
  }
});

// Mock geocoding results for major cities
function getMockGeocodingResults(query) {
  const cities = {
    'mecca': { lat: '21.4225', lon: '39.8262', name: 'Mecca, Saudi Arabia' },
    'medina': { lat: '24.5247', lon: '39.5692', name: 'Medina, Saudi Arabia' },
    'jeddah': { lat: '21.4858', lon: '39.1925', name: 'Jeddah, Saudi Arabia' },
    'riyadh': { lat: '24.7136', lon: '46.6753', name: 'Riyadh, Saudi Arabia' },
    'cairo': { lat: '30.0444', lon: '31.2357', name: 'Cairo, Egypt' },
    'istanbul': { lat: '41.0082', lon: '28.9784', name: 'Istanbul, Turkey' },
    'london': { lat: '51.5074', lon: '-0.1278', name: 'London, UK' },
    'new york': { lat: '40.7128', lon: '-74.0060', name: 'New York, USA' },
    'paris': { lat: '48.8566', lon: '2.3522', name: 'Paris, France' },
    'dubai': { lat: '25.2048', lon: '55.2708', name: 'Dubai, UAE' }
  };

  const lowerQuery = query.toLowerCase();
  const result = cities[lowerQuery];

  if (result) {
    return [{
      place_id: Math.floor(Math.random() * 1000000),
      lat: result.lat,
      lon: result.lon,
      display_name: result.name,
      name: result.name.split(',')[0]
    }];
  }

  // Default fallback
  return [{
    place_id: Math.floor(Math.random() * 1000000),
    lat: '21.4225',
    lon: '39.8262',
    display_name: 'Mecca, Saudi Arabia',
    name: 'Mecca'
  }];
}

// Hijri Date API
app.get('/api/hijri-date', (req, res) => {
  const { date } = req.query;
  const gregorianDate = date ? new Date(date) : new Date();

  try {
    const hijriDate = momentHijri(gregorianDate);

    res.json({
      code: 200,
      status: 'OK',
      data: {
        hijri: {
          date: hijriDate.format('iYYYY/iMM/iDD'),
          month: hijriDate.format('iMMMM'),
          year: hijriDate.format('iYYYY'),
          day: hijriDate.format('iDD'),
          weekday: hijriDate.format('dddd')
        },
        gregorian: {
          date: gregorianDate.toISOString().split('T')[0],
          month: gregorianDate.toLocaleString('en', { month: 'long' }),
          year: gregorianDate.getFullYear(),
          day: gregorianDate.getDate(),
          weekday: gregorianDate.toLocaleString('en', { weekday: 'long' })
        }
      }
    });
  } catch (error) {
    console.error('Error calculating Hijri date:', error);
    res.status(500).json({
      code: 500,
      status: 'Internal Server Error',
      message: 'Error calculating Hijri date'
    });
  }
});

// Duas API
app.get('/api/duas/:category', (req, res) => {
  const category = req.params.category;
  const lang = req.query.lang || 'en';

  const duasData = {
    morning: [
      {
        id: 1,
        title: {
          en: 'Morning Supplication',
          fr: 'Supplication du Matin',
          ar: 'دعاء الصباح'
        },
        arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ',
        transliteration: 'Allahumma bika asbahna wa bika amsayna wa bika nahya wa bika namutu wa ilayka nushur',
        translation: {
          en: 'O Allah, by You we enter the morning and by You we enter the evening, by You we live and by You we die, and to You is the resurrection.',
          fr: 'Ô Allah, par Toi nous entrons le matin et par Toi nous entrons le soir, par Toi nous vivons et par Toi nous mourons, et vers Toi est la résurrection.',
          ar: 'اللهم بك أصبحنا وبك أمسينا وبك نحيا وبك نموت وإليك النشور'
        }
      },
      {
        id: 2,
        title: {
          en: 'Protection from Evil',
          fr: 'Protection contre le Mal',
          ar: 'الحماية من الشر'
        },
        arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
        transliteration: 'A\'udhu bikalimatillahi tammati min sharri ma khalaq',
        translation: {
          en: 'I seek refuge in the perfect words of Allah from the evil of what He has created.',
          fr: 'Je cherche refuge dans les paroles parfaites d\'Allah contre le mal de ce qu\'Il a créé.',
          ar: 'أعوذ بكلمات الله التامة من شر ما خلق'
        }
      },
      {
        id: 3,
        title: {
          en: 'Seeking Forgiveness',
          fr: 'Demander le Pardon',
          ar: 'طلب المغفرة'
        },
        arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
        transliteration: 'Allahumma anta rabbi la ilaha illa anta khalaqtani wa ana \'abduka wa ana \'ala \'ahdika wa wa\'dika ma istata\'tu a\'udhu bika min sharri ma sana\'tu abu\'u laka bini\'matika \'alayya wa abu\'u bidhanbi faghfir li fa innahu la yaghfirudh-dhunuba illa anta',
        translation: {
          en: 'O Allah, You are my Lord, there is no god but You. You created me and I am Your servant. I am faithful to my covenant and my promise as much as I can. I seek refuge in You from the evil of what I have done. I acknowledge Your favor upon me, and I acknowledge my sin. So forgive me, for indeed none forgives sins except You.',
          fr: 'Ô Allah, Tu es mon Seigneur, il n\'y a pas de divinité sauf Toi. Tu m\'as créé et je suis Ton serviteur. Je suis fidèle à Ton alliance et à Ta promesse autant que je peux. Je cherche refuge auprès de Toi contre le mal de ce que j\'ai fait. Je reconnais Ta faveur sur moi, et je reconnais mon péché. Pardonne-moi donc, car nul ne pardonne les péchés sauf Toi.',
          ar: 'اللهم أنت ربي لا إله إلا أنت خلقتني وأنا عبدك وأنا على عهدك ووعدك ما استطعت أعوذ بك من شر ما صنعت أبوء لك بنعمتك علي وأبوء بذنبي فاغفر لي فإنه لا يغفر الذنوب إلا أنت'
        }
      },
      {
        id: 4,
        title: {
          en: 'Blessing of the Day',
          fr: 'Bénédiction de la Journée',
          ar: 'بركة اليوم'
        },
        arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا وَرِزْقًا طَيِّبًا وَعَمَلًا مُتَقَبَّلًا',
        transliteration: 'Allahumma inni as\'aluka \'ilman nafi\'an wa rizqan tayyiban wa \'amalan mutaqabbalan',
        translation: {
          en: 'O Allah, I ask You for beneficial knowledge, good provision, and accepted deeds.',
          fr: 'Ô Allah, je Te demande une connaissance bénéfique, une bonne provision, et des œuvres acceptées.',
          ar: 'اللهم إني أسألك علماً نافعاً ورزقاً طيباً وعمالاً متقبلاً'
        }
      },
      {
        id: 5,
        title: {
          en: 'Protection from Satan',
          fr: 'Protection contre Satan',
          ar: 'الحماية من الشيطان'
        },
        arabic: 'أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ',
        transliteration: 'A\'udhu billahi minash-shaytanir-rajim',
        translation: {
          en: 'I seek refuge in Allah from the accursed Satan.',
          fr: 'Je cherche refuge auprès d\'Allah contre Satan le maudit.',
          ar: 'أعوذ بالله من الشيطان الرجيم'
        }
      },
      {
        id: 6,
        title: {
          en: 'Morning Remembrance',
          fr: 'Dhikr du Matin',
          ar: 'ذكر الصباح'
        },
        arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ عَدَدَ خَلْقِهِ وَرِضَا نَفْسِهِ وَزِنَةَ عَرْشِهِ وَمِدَادَ كَلِمَاتِهِ',
        transliteration: 'Subhanallah wa bihamdihi \'adada khalqihi wa rida nafsihi wa zinata \'arshihi wa midada kalimatihi',
        translation: {
          en: 'Glory be to Allah and praise be to Him, as much as the number of His creation, as much as pleases His Self, as much as the weight of His Throne, and as much as the ink of His words.',
          fr: 'Gloire à Allah et louange à Lui, autant que le nombre de Sa création, autant que plaît à Son âme, autant que le poids de Son Trône, et autant que l\'encre de Ses paroles.',
          ar: 'سبحان الله وبحمده عدد خلقه ورضا نفسه وزنة عرشه ومداد كلماته'
        }
      },
      {
        id: 7,
        title: {
          en: 'Seeking Guidance',
          fr: 'Demander la Guidance',
          ar: 'طلب الهداية'
        },
        arabic: 'اللَّهُمَّ أَهْدِنِي وَسَدِّدْنِي',
        transliteration: 'Allahumma ahdini wa saddidni',
        translation: {
          en: 'O Allah, guide me and make me steadfast.',
          fr: 'Ô Allah, guide-moi et affermis-moi.',
          ar: 'اللهم اهدني وسددني'
        }
      }
    ],
    evening: [
      {
        id: 1,
        title: {
          en: 'Evening Supplication',
          fr: 'Supplication du Soir',
          ar: 'دعاء المساء'
        },
        arabic: 'اللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ',
        transliteration: 'Allahumma bika amsayna wa bika asbahna wa bika nahya wa bika namutu wa ilayka al-masir',
        translation: {
          en: 'O Allah, by You we enter the evening and by You we enter the morning, by You we live and by You we die, and to You is the final return.',
          fr: 'Ô Allah, par Toi nous entrons le soir et par Toi nous entrons le matin, par Toi nous vivons et par Toi nous mourons, et vers Toi est le retour final.',
          ar: 'اللهم بك أمسينا وبك أصبحنا وبك نحيا وبك نموت وإليك المصير'
        }
      },
      {
        id: 2,
        title: {
          en: 'Protection at Night',
          fr: 'Protection la Nuit',
          ar: 'الحماية ليلاً'
        },
        arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
        transliteration: 'Bismillahi alladhi la yadurru ma\'asmihi shay\'un fil-ardi wa la fis-sama\'i wa huwa as-sami\'ul \'alim',
        translation: {
          en: 'In the name of Allah with whose name nothing on earth or in heaven can harm, and He is the All-Hearing, All-Knowing.',
          fr: 'Au nom d\'Allah avec le nom duquel rien sur terre ou dans le ciel ne peut nuire, et Il est l\'Audient, l\'Omniscient.',
          ar: 'بسم الله الذي لا يضر مع اسمه شيء في الأرض ولا في السماء وهو السميع العليم'
        }
      },
      {
        id: 3,
        title: {
          en: 'Before Sleeping',
          fr: 'Avant de Dormir',
          ar: 'قبل النوم'
        },
        arabic: 'اللَّهُمَّ إِنَّكَ خَلَقْتَ نَفْسِي وَأَنْتَ تَوَفَّاهَا أَنْتَ تَحْيِيهَا وَأَنْتَ تَمِيتُهَا',
        transliteration: 'Allahumma innaka khalaqta nafsi wa anta tawaffaha anta tahyiha wa anta tamitaha',
        translation: {
          en: 'O Allah, You have created my soul and You take it back. Unto You is its life and unto You is its death.',
          fr: 'Ô Allah, Tu as créé mon âme et Tu la reprends. À Toi appartient sa vie et à Toi appartient sa mort.',
          ar: 'اللهم إنك خلقت نفسي وأنت توفاها أنت تحييها وأنت تميتها'
        }
      },
      {
        id: 4,
        title: {
          en: 'Night Protection',
          fr: 'Protection Nocturne',
          ar: 'الحماية الليلية'
        },
        arabic: 'اللَّهُمَّ أَسْلَمْتُ نَفْسِي إِلَيْكَ وَوَجَّهْتُ وَجْهِي إِلَيْكَ وَفَوَّضْتُ أَمْرِي إِلَيْكَ وَأَلْجَأْتُ ظَهْرِي إِلَيْكَ رَغْبَةً وَرَهْبَةً إِلَيْكَ لَا مَلْجَأَ وَلَا مَنْجَا مِنْكَ إِلَّا إِلَيْكَ آمَنْتُ بِكِتَابِكَ الَّذِي أَنْزَلْتَ وَبِنَبِيِّكَ الَّذِي أَرْسَلْتَ',
        transliteration: 'Allahumma aslamtu nafsi ilayka wa wajjahtu wajhi ilayka wa fawwadtu amri ilayka wa alja\'tu zahri ilayka raghbatan wa rahbatan ilayka la malja\'a wa la manja minka illa ilayka amantu bikitabikalladhi anzalta wa binabiyyikalladhi arsalt',
        translation: {
          en: 'O Allah, I have submitted myself to You, turned my face towards You, entrusted my affairs to You, and taken You as my refuge in hope and fear of You. There is no refuge nor escape from You except to You. I believe in Your Book which You have revealed and in Your Prophet whom You have sent.',
          fr: 'Ô Allah, je me suis soumis à Toi, j\'ai tourné mon visage vers Toi, j\'ai confié mes affaires à Toi, et je me suis réfugié auprès de Toi avec espoir et crainte de Toi. Il n\'y a pas de refuge ni d\'échappatoire loin de Toi sauf vers Toi. Je crois en Ton Livre que Tu as révélé et en Ton Prophète que Tu as envoyé.',
          ar: 'اللهم أسلمت نفسي إليك ووجهت وجهي إليك وفوضت أمري إليك وألجأت ظهري إليك رغبة ورهبة إليك لا ملجأ ولا منجى منك إلا إليك آمنت بكتابك الذي أنزلت وبنبيك الذي أرسلت'
        }
      },
      {
        id: 5,
        title: {
          en: 'Safety in the Night',
          fr: 'Sécurité pendant la Nuit',
          ar: 'الأمان في الليل'
        },
        arabic: 'اللَّهُمَّ أَحْسِنْ عَاقِبَتَنَا فِي الْأُمُورِ كُلِّهَا وَأَجِرْنَا مِنْ خِزْيِ الدُّنْيَا وَعَذَابِ الْآخِرَةِ',
        transliteration: 'Allahumma ahsın \'aqibatana fil-umuri kulliha wa ajirna min khizyi ad-dunya wa \'adhabi al-akhirah',
        translation: {
          en: 'O Allah, make good our final outcome in all matters and protect us from the humiliation of this world and the punishment of the Hereafter.',
          fr: 'Ô Allah, rends bonne notre fin dans toutes les affaires et protège-nous de l\'humiliation de ce monde et du châtiment de l\'Au-delà.',
          ar: 'اللهم أحسن عاقبتنا في الأمور كلها وأجرنا من خزي الدنيا وعذاب الآخرة'
        }
      },
      {
        id: 6,
        title: {
          en: 'Evening Remembrance',
          fr: 'Dhikr du Soir',
          ar: 'ذكر المساء'
        },
        arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
        transliteration: 'Subhanallah wa bihamdihi',
        translation: {
          en: 'Glory be to Allah and praise be to Him.',
          fr: 'Gloire à Allah et louange à Lui.',
          ar: 'سبحان الله وبحمده'
        }
      },
      {
        id: 7,
        title: {
          en: 'Protection from Nightmares',
          fr: 'Protection contre les Cauchemars',
          ar: 'الحماية من الكوابيس'
        },
        arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ غَضَبِهِ وَعِقَابِهِ وَشَرِّ عِبَادِهِ وَمِنْ هَمَزَاتِ الشَّيَاطِينِ وَأَنْ يَحْضُرُونِ',
        transliteration: 'A\'udhu bikalimatillahi tammati min ghadabihi wa \'iqabihi wa sharri \'ibadihi wa min hamazati ash-shayatin wa an yahdurun',
        translation: {
          en: 'I seek refuge in the perfect words of Allah from His anger and punishment, from the evil of His servants, and from the whisperings of the devils and their presence.',
          fr: 'Je cherche refuge dans les paroles parfaites d\'Allah contre Sa colère et Son châtiment, contre le mal de Ses serviteurs, et contre les suggestions des diables et leur présence.',
          ar: 'أعوذ بكلمات الله التامة من غضبه وعقابه وشر عباده ومن همزات الشياطين وأن يحضرون'
        }
      }
    ],
    special: [
      {
        id: 1,
        title: {
          en: 'Ramadan Dua',
          fr: 'Doua du Ramadan',
          ar: 'دعاء رمضان'
        },
        arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ بِرَحْمَتِكَ الَّتِي وَسِعَتْ كُلَّ شَيْءٍ أَنْ تَغْفِرَ لِي ذُنُوبِي',
        transliteration: 'Allahumma inni as\'aluka birahmatika allati wasi\'at kulla shay\'in an taghfira li dhunubi',
        translation: {
          en: 'O Allah, I ask You by Your mercy that encompasses all things, to forgive me my sins.',
          fr: 'Ô Allah, je Te demande par Ta miséricorde qui englobe toutes choses, de me pardonner mes péchés.',
          ar: 'اللهم إني أسألك برحمتك التي وسعت كل شيء أن تغفر لي ذنوبي'
        }
      },
      {
        id: 2,
        title: {
          en: 'Eid Prayer Dua',
          fr: 'Doua de la Prière de l\'Aïd',
          ar: 'دعاء صلاة العيد'
        },
        arabic: 'اللَّهُ أَكْبَرُ اللَّهُ أَكْبَرُ لَا إِلَهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ اللَّهُ أَكْبَرُ وَلِلَّهِ الْحَمْدُ',
        transliteration: 'Allahu Akbar Allahu Akbar La ilaha illallah Wallahu Akbar Allahu Akbar wa lillahi alhamd',
        translation: {
          en: 'Allah is the Greatest, Allah is the Greatest. There is no deity but Allah, and Allah is the Greatest. Allah is the Greatest and to Allah belongs all praise.',
          fr: 'Allah est le Plus Grand, Allah est le Plus Grand. Il n\'y a pas de divinité sauf Allah, et Allah est le Plus Grand. Allah est le Plus Grand et à Allah appartient toute louange.',
          ar: 'الله أكبر الله أكبر لا إله إلا الله والله أكبر الله أكبر ولله الحمد'
        }
      },
      {
        id: 3,
        title: {
          en: 'Dua for the Sick',
          fr: 'Doua pour les Malades',
          ar: 'دعاء المريض'
        },
        arabic: 'اللَّهُمَّ رَبَّ النَّاسِ أَذْهِبِ الْبَأْسَ وَاشْفِ أَنْتَ الشَّافِي لَا شِفَاءَ إِلَّا شِفَاؤُكَ شِفَاءً لَا يُغَادِرُ سَقَمًا',
        transliteration: 'Allahumma rabban-nasi adhhibil ba\'sa washfi antash-shafi la shifa\'a illa shifa\'uka shifa\'an la yughadiru saqaman',
        translation: {
          en: 'O Allah, Lord of mankind, remove the harm and heal, You are the Healer. There is no healing except Your healing, a healing that leaves no disease behind.',
          fr: 'Ô Allah, Seigneur des hommes, éloigne le mal et guéris, Tu es le Guérisseur. Il n\'y a pas de guérison sauf Ta guérison, une guérison qui ne laisse pas de maladie derrière elle.',
          ar: 'اللهم رب الناس أذهب البأس واشف أنت الشافي لا شفاء إلا شفاؤك شفاء لا يغادر سقما'
        }
      },
      {
        id: 4,
        title: {
          en: 'Travel Dua',
          fr: 'Doua du Voyage',
          ar: 'دعاء السفر'
        },
        arabic: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ',
        transliteration: 'Subhana alladhi sakhkhara lana hadha wa ma kunna lahu muqrinin wa inna ila rabbina lamunqalibun',
        translation: {
          en: 'Glory be to Him who has subjected this to us, and we were not able to do it. And indeed, to our Lord we will return.',
          fr: 'Gloire à Celui qui nous a soumis ceci, et nous n\'étions pas capables de le faire. Et en vérité, vers notre Seigneur nous retournerons.',
          ar: 'سبحان الذي سخر لنا هذا وما كنا له مقرنين وإنا إلى ربنا لمنقلبون'
        }
      },
      {
        id: 5,
        title: {
          en: 'Dua for Forgiveness',
          fr: 'Doua du Pardon',
          ar: 'دعاء الاستغفار'
        },
        arabic: 'رَبِّ اغْفِرْ وَارْحَمْ وَأَنْتَ خَيْرُ الرَّاحِمِينَ',
        transliteration: 'Rabbighfir warham wa anta khayrur-rahimin',
        translation: {
          en: 'My Lord, forgive and have mercy, and You are the best of those who show mercy.',
          fr: 'Mon Seigneur, pardonne et fais miséricorde, et Tu es le Meilleur de ceux qui font miséricorde.',
          ar: 'رب اغفر وارحم وأنت خير الراحمين'
        }
      },
      {
        id: 6,
        title: {
          en: 'Dua for Parents',
          fr: 'Doua pour les Parents',
          ar: 'دعاء الوالدين'
        },
        arabic: 'رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا',
        transliteration: 'Rabbi irhamhuma kama rabbayani saghira',
        translation: {
          en: 'My Lord, have mercy on them as they raised me when I was young.',
          fr: 'Mon Seigneur, fais-leur miséricorde comme ils m\'ont élevé quand j\'étais petit.',
          ar: 'رب ارحمهما كما ربياني صغيراً'
        }
      },
      {
        id: 7,
        title: {
          en: 'Dua for Protection',
          fr: 'Doua de Protection',
          ar: 'دعاء الحماية'
        },
        arabic: 'حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ',
        transliteration: 'Hasbiyallah la ilaha illa huwa \'alayhi tawakkaltu wa huwa rabbul-\'arshil-\'azim',
        translation: {
          en: 'Allah is sufficient for me. There is no god but Him. In Him I put my trust, and He is the Lord of the Mighty Throne.',
          fr: 'Allah me suffit. Il n\'y a pas de divinité sauf Lui. En Lui je place ma confiance, et Il est le Seigneur du Trône majestueux.',
          ar: 'حسبي الله لا إله إلا هو عليه توكلت وهو رب العرش العظيم'
        }
      },
      {
        id: 8,
        title: {
          en: 'Dua for Success',
          fr: 'Doua du Succès',
          ar: 'دعاء النجاح'
        },
        arabic: 'اللَّهُمَّ لَا سَهْلَ إِلَّا مَا جَعَلْتَهُ سَهْلًا وَأَنْتَ تَجْعَلُ الْحَزْنَ إِذَا شِئْتَ سَهْلًا',
        transliteration: 'Allahumma la sahla illa ma ja\'altahu sahlan wa anta taj\'alul-hazna idha shi\'ta sahla',
        translation: {
          en: 'O Allah, there is no ease except what You make easy, and You make the difficulty easy if You wish.',
          fr: 'Ô Allah, il n\'y a pas de facilité sauf ce que Tu rends facile, et Tu rends la difficulté facile si Tu le veux.',
          ar: 'اللهم لا سهل إلا ما جعلته سهلاً وأنت تجعل الحزن إذا شئت سهلاً'
        }
      },
      {
        id: 9,
        title: {
          en: 'Dua for Wealth',
          fr: 'Doua de la Richesse',
          ar: 'دعاء الغنى'
        },
        arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا وَرِزْقًا حَلَالًا وَعَمَلًا صَالِحًا',
        transliteration: 'Allahumma inni as\'aluka \'ilman nafi\'an wa rizqan halalan wa \'amalan salihan',
        translation: {
          en: 'O Allah, I ask You for beneficial knowledge, lawful provision, and righteous deeds.',
          fr: 'Ô Allah, je Te demande une connaissance bénéfique, une provision licite, et des œuvres pieuses.',
          ar: 'اللهم إني أسألك علماً نافعاً ورزقاً حلالاً وعمالاً صالحاً'
        }
      },
      {
        id: 10,
        title: {
          en: 'Dua for Patience',
          fr: 'Doua de la Patience',
          ar: 'دعاء الصبر'
        },
        arabic: 'اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ',
        transliteration: 'Allahumma a\'inni \'ala dhikrika wa shukrika wa husni \'ibadatika',
        translation: {
          en: 'O Allah, help me to remember You, to thank You, and to worship You in the best manner.',
          fr: 'Ô Allah, aide-moi à Te souvenir, à Te remercier, et à T\'adorer de la meilleure manière.',
          ar: 'اللهم أعني على ذكرك وشكرك وحسن عبادتك'
        }
      }
    ]
  };

  if (!duasData[category]) {
    return res.status(404).json({
      code: 404,
      status: 'Not Found',
      message: 'Category not found'
    });
  }

  res.json({
    code: 200,
    status: 'OK',
    data: duasData[category].map(dua => ({
      ...dua,
      title: dua.title[lang] || dua.title.en,
      translation: dua.translation[lang] || dua.translation.en
    }))
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Islamic Website Backend Server running on port ${PORT}`);
  console.log(` Prayer Times API: http://localhost:${PORT}/api/prayer-times`);
  console.log(` Qibla API: http://localhost:${PORT}/api/qibla`);
  console.log(` Geocoding API: http://localhost:${PORT}/api/geocode`);
  console.log(` Hijri Date API: http://localhost:${PORT}/api/hijri-date`);
  console.log(` Duas API: http://localhost:${PORT}/api/duas/{category}`);
});

module.exports = app;