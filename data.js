

const ERAS = [
  {
    id: 'spring-autumn',
    period: 'Spring & Autumn Period',
    year: 'c. 514 BCE',
    yearNumeric: -514,
    placeholderZh: '吴国',
    placeholderLabel: 'State of Wu',
    photo: 'images/era_wu.jpg',
    photoAlt: 'Reconstruction of Chang Gate during the State of Wu',
    caption: 'Founded by Wu Zixu as a gate of the great walled city of Gusu — capital of the State of Wu.',
    sepia: 1.0,
    info: {
      title: 'Origins — Gate of the State of Wu',
      body: 'Chang Gate was conceived by the statesman Wu Zixu (伍子胥) around 514 BCE, one of eight water gates built into the city walls of Gusu — present-day Suzhou. The gate commanded the western waterway route, a strategic passage for Wu\'s military campaigns and trade. Legend holds that when Wu Zixu was wrongfully executed, his eyes were hung above this very gate so he could watch the fall of the kingdom he served.',
      source: 'Shiji (史記) by Sima Qian; Suzhou Local Chronicles'
    }
  },
  {
    id: 'tang-dynasty',
    period: 'Tang Dynasty',
    year: 'c. 618–907 CE',
    yearNumeric: 750,
    placeholderZh: '唐朝',
    placeholderLabel: 'Tang Dynasty',
    photo: 'images/era_tang.jpg',
    photoAlt: 'Chang Gate area during the Tang Dynasty',
    caption: 'A city of silk and poetry — Zhang Ji immortalised these canal banks in a single night\'s verse.',
    sepia: 0.85,
    info: {
      title: 'Tang Prosperity — A City of Poets',
      body: 'Suzhou flourished under the Tang as the empire\'s foremost silk-producing city. Chang Gate presided over the busiest canal junction west of the city walls. It was here, moored beneath a cold autumn moon, that the poet Zhang Ji (張繼) wrote \'Maple Bridge Night Mooring\' (楓橋夜泊). The temple bell of Hanshan, still heard today, rang out across these same waters over a thousand years ago.',
      source: 'Zhang Ji, \'Fēng Qiáo Yè Bó\' (楓橋夜泊), c. 756 CE; Tang Shi (唐詩)'
    }
  },
  {
    id: 'song-dynasty',
    period: 'Song Dynasty',
    year: 'c. 960–1279 CE',
    yearNumeric: 1100,
    placeholderZh: '宋朝',
    placeholderLabel: 'Song Dynasty',
    photo: 'images/era_song.jpg',
    photoAlt: 'Chang Gate depicted on the Pingjiang Map of 1229',
    caption: 'Immortalised on the Pingjiang Map of 1229 — the oldest surviving city map in China.',
    sepia: 0.75,
    info: {
      title: 'Song Cartography — Mapped in Stone',
      body: 'The Song dynasty left us the Pingjiang Map (平江圖), carved into stone in 1229 CE — the oldest surviving city map of Suzhou. Chang Gate appears clearly on its western edge, connected to a dense web of canals and streets. The surrounding district became one of the wealthiest commercial quarters in southern China.',
      source: 'Pingjiang Map (平江圖), 1229 CE, Suzhou Stele Museum'
    }
  },
  {
    id: 'ming-dynasty',
    period: 'Ming Dynasty',
    year: 'c. 1368–1644 CE',
    yearNumeric: 1500,
    placeholderZh: '明朝',
    placeholderLabel: 'Ming Dynasty',
    photo: 'images/era_ming.jpg',
    photoAlt: 'Chang Gate Ming Dynasty fortifications',
    caption: 'Rebuilt in granite and brick — the double gate tower that defined Chang Gate for centuries.',
    sepia: 0.65,
    info: {
      title: 'Ming Reconstruction — Granite & Brick',
      body: 'The Ming emperors undertook extensive fortification of China\'s cities. Chang Gate was substantially rebuilt with thick granite masonry, a reinforced city wall, and the distinctive double-tower gatehouse whose silhouette endured into the twentieth century. Private gardens and teahouses flourished in the shadow of the garrison walls.',
      source: 'Ming Shilu (明實錄); Suzhou Prefectural Gazetteer (蘇州府志)'
    }
  },
  {
    id: 'qing-republic',
    period: 'Late Qing & Republic',
    year: 'c. 1860s–1940s',
    yearNumeric: 1900,
    placeholderZh: '近代',
    placeholderLabel: 'Modern Era',
    photo: 'images/era_qing.jpg',
    photoAlt: 'Historical photograph of Chang Gate circa 1880–1920',
    caption: 'Photographed for the first time — a city caught between its ancient past and uncertain modernity.',
    sepia: 0.4,
    info: {
      title: 'Camera & Conflict — The First Photographs',
      body: 'The Taiping Rebellion (1850–64) devastated Suzhou and left Chang Gate badly damaged. Western missionaries and travellers in the 1870s–90s left the earliest photographic record of the gate. The Republican era brought roads and demolition — most city walls were torn down, but Chang Gate and its flanking wall sections were spared.',
      source: 'John Thomson photographic archive, c. 1870; Suzhou Municipal Archives, 1920s–40s'
    }
  },
  {
    id: 'contemporary',
    period: 'Contemporary',
    year: 'Present day',
    yearNumeric: 2024,
    placeholderZh: '今日',
    placeholderLabel: 'Today',
    photo: 'images/era_modern.jpg',
    photoAlt: 'Chang Gate today, restored national heritage landmark',
    caption: 'Restored and designated a national heritage site — 2,500 years of history in living stone.',
    sepia: 0.0,
    info: {
      title: 'Heritage Today — 阊门 Restored',
      body: 'Chang Gate was designated a national heritage site and underwent comprehensive restoration through the 1990s and 2000s. The rebuilt gate tower and original city wall sections now anchor a public park on Suzhou\'s western ring canal. The Shantang Street canal district — 3.5 km to Tiger Hill — has been restored as a living heritage quarter of traditional shophouses, teahouses, and gardens.',
      source: 'Suzhou Heritage Conservation Bureau, 2010; UNESCO Creative City designation, 2004'
    }
  }
];

const PUZZLE_LAYERS = [
  {
    id: 'roof',
    name: 'Roof Ridgeline',
    nameZh: '屋脊',
    desc: 'The ornate curved ridgeline — the crown of the gate tower.'
  },
  {
    id: 'tower',
    name: 'Gate Tower',
    nameZh: '城楼',
    desc: 'The double-storey watchtower standing above the gate arch.'
  },
  {
    id: 'arch',
    name: 'Gate Arch',
    nameZh: '城门洞',
    desc: 'The grand arched opening through which boats and travellers passed.'
  },
  {
    id: 'wall',
    name: 'City Wall',
    nameZh: '城墙',
    desc: 'The massive granite city wall flanking the gate on both sides.'
  },
  {
    id: 'canal',
    name: 'Canal & Moat',
    nameZh: '护城河',
    desc: 'The western ring canal and defensive moat at the base of the gate.'
  }
];

const TREASURE_DATA = [
  {
    eraId: 'spring-autumn',
    clue: 'Wu Zixu\'s emblem — look to the upper-left, where the general surveyed the land.',
    relic: 'Bronze Sword of Wu Zixu',
    zone: { x: 5, y: 5, w: 25, h: 25 }
  },
  {
    eraId: 'tang-dynasty',
    clue: 'Zhang Ji moored his boat at night. Find where lantern light reflected on the water — lower-right.',
    relic: 'Tang Poet\'s Lantern',
    zone: { x: 60, y: 55, w: 30, h: 30 }
  },
  {
    eraId: 'song-dynasty',
    clue: 'The cartographer\'s mark — find the engraved stone in the lower-right of the map district.',
    relic: 'Pingjiang Map Fragment',
    zone: { x: 65, y: 65, w: 25, h: 25 }
  },
  {
    eraId: 'ming-dynasty',
    clue: 'The gate keeper\'s seal — pressed into the granite cornerstone at the base of the left tower.',
    relic: 'Ming Gate Keeper\'s Seal',
    zone: { x: 10, y: 65, w: 22, h: 25 }
  },
  {
    eraId: 'qing-republic',
    clue: 'The first photograph was taken from across the canal. Find the vantage point — centre-right.',
    relic: 'Victorian Camera Plate',
    zone: { x: 55, y: 30, w: 28, h: 28 }
  },
  {
    eraId: 'modern-era',
    clue: 'The heritage plaque is mounted on the restored wall. Look to the lower-centre of the gate.',
    relic: 'National Heritage Plaque',
    zone: { x: 35, y: 60, w: 30, h: 25 }
  }
];

const CHAT_KB = [
  {
    keys: ['wu zixu', '伍子胥', 'who built', 'who founded', 'founder', 'founded', 'origin', 'first built', 'when built', 'spring autumn', 'state of wu', 'gusu'],
    answer: "Chang Gate was conceived around 514 BCE by the statesman and general Wu Zixu (伍子胥), who served the State of Wu. It was one of eight water gates built into the walls of Gusu — the ancient capital that became modern Suzhou.\n\nLegend says that after Wu Zixu was wrongfully executed by his own king, his eyes were hung above this very gate so he could watch the kingdom of Wu fall. Within a generation, it did."
  },
  {
    keys: ['zhang ji', 'maple bridge', 'feng qiao', '楓橋', '枫桥', 'night mooring', 'poem', 'poet', 'poetry', 'tang poet'],
    answer: "Around 756 CE, the Tang poet Zhang Ji (張繼) moored his boat for the night near Chang Gate and wrote 'Maple Bridge Night Mooring' (楓橋夜泊) — one of the most famous poems in Chinese literature.\n\nThe poem ends with the bell of Hanshan Temple ringing out across the cold autumn water to a traveller who cannot sleep. That same temple bell, just west of Chang Gate, still rings today over the same canal."
  },
  {
    keys: ['grand canal', 'canal', '运河', '大运河', 'waterway', 'water gate', 'boats'],
    answer: "Chang Gate was a water gate — boats passed through it, not just people. It anchored the Western Ring Canal, which fed directly into the Grand Canal network linking Suzhou to Beijing in the north and Hangzhou in the south.\n\nThis is why the gate mattered economically: silk, grain and porcelain moving up the Grand Canal had to pass through Suzhou's western waterfront, and Chang Gate was its gateway."
  },
  {
    keys: ['taiping', 'rebellion', 'damaged', 'destroyed', 'war', 'battle', 'thomson', 'photograph', 'photo'],
    answer: "The Taiping Rebellion (1850–1864) devastated Suzhou. The city changed hands violently, the population collapsed, and Chang Gate was badly damaged in the fighting.\n\nIt was during the slow recovery afterwards, in the 1870s–80s, that Western photographers — most famously the Scottish photographer John Thomson — produced the earliest surviving photographs of the gate."
  },
  {
    keys: ['pingjiang', '平江', 'map', 'cartograph', 'oldest map', 'stele'],
    answer: "The Pingjiang Map (平江圖) was carved into stone in 1229 CE during the Southern Song. It is the oldest surviving city map of any Chinese city.\n\nChang Gate appears clearly on its western edge, surrounded by a dense web of canals. The original stone is preserved at the Suzhou Stele Museum."
  },
  {
    keys: ['silk', 'textile', 'weaving', 'merchant', 'paradise', '上有天堂'],
    answer: "From the Tang dynasty onwards, Suzhou was the empire's foremost silk-producing city. By the Ming and Qing, the district just inside Chang Gate held the country's largest concentration of silk workshops, dye houses and brokers.\n\nThe phrase 'Up in heaven there is paradise; on earth there is Suzhou and Hangzhou' (上有天堂，下有蘇杭) dates from this period of wealth."
  },
  {
    keys: ['hanshan', '寒山', 'temple', 'monk', 'bell', 'cold mountain'],
    answer: "Hanshan Temple (寒山寺) sits about a kilometre west of Chang Gate, on the bank of the Maple Bridge canal. Founded in the 6th century, it took its name from the eccentric Tang-era poet-monk Hanshan ('Cold Mountain').\n\nThe temple's bronze bell is the one Zhang Ji heard in his famous poem, and visitors still go on New Year's Eve to hear it struck 108 times."
  },
  {
    keys: ['shantang', '山塘', 'street', 'tiger hill', '虎丘', 'bai juyi', '白居易'],
    answer: "Shantang Street (山塘街) runs about 3.5 km from Chang Gate north-west to Tiger Hill. Both the street and its parallel canal were dug around 825 CE on the order of the poet-magistrate Bai Juyi (白居易), then governor of Suzhou.\n\nIt is now restored as a heritage quarter of traditional shophouses, teahouses and water-side restaurants."
  },
  {
    keys: ['ming', 'fortif', 'wall', 'granite', 'tower', 'rebuilt', 'reconstruct', 'masonry'],
    answer: "Under the Ming, Chang Gate was substantially rebuilt with thick granite masonry and the distinctive double-tower gatehouse whose silhouette survived into the twentieth century. The wider city wall was reinforced at the same time.\n\nIn the shadow of these new fortifications, private gardens and teahouses flourished — many of the famous Suzhou gardens that survive today were laid out in this period."
  },
  {
    keys: ['today', 'modern', 'now', 'restored', 'restoration', 'heritage', 'unesco', 'present', 'park'],
    answer: "Chang Gate was designated a national heritage site and underwent comprehensive restoration through the 1990s and 2000s. The rebuilt gate tower and surviving wall sections now anchor a public park on Suzhou's western ring canal.\n\nThe surrounding Shantang Street district has been restored as a living heritage quarter, and Suzhou as a whole was named a UNESCO Creative City in 2004."
  },
  {
    keys: ['eight gate', '8 gate', 'other gate', 'how many gate', 'pan gate', 'panmen'],
    answer: "Ancient Suzhou had eight water gates set into its walls, each paired with a land gate so that both boats and people could pass. Chang Gate (阊门) guarded the north-west; the others were Pan, Xu, Feng, Lou, Xiang, Pingmen and Qimen.\n\nOf the eight, Chang Gate is the most famous — partly because of its commercial wealth, partly because of its role in the Wu Zixu legend."
  },
  {
    keys: ['garden', 'classical garden', 'humble administrator', 'lingering', 'master of the nets'],
    answer: "Suzhou's classical gardens — the Humble Administrator's Garden, the Lingering Garden, the Master of the Nets, and others — were laid out by retired scholar-officials from the Song through the Qing. Nine of them are inscribed as a UNESCO World Heritage Site.\n\nMost lie within the old walled city, a short walk inside Chang Gate."
  },
  {
    keys: ['meaning', 'name mean', 'why called', 'what does chang', '阊', 'character'],
    answer: "The character 阊 (chāng) refers, in classical usage, to the gates of heaven — and by extension to the principal western gate of a great city. So 阊门 (Chāngmén) means something like 'Heaven's Gate' or 'Great Western Gate'.\n\nThis matches its position in the city plan: Chang Gate is the most important of Suzhou's western gates, facing the canals that lead out toward the Yangtze."
  },
  {
    keys: ['suzhou', '苏州', 'jiangsu', 'venice of the east'],
    answer: "Suzhou (苏州) sits in Jiangsu Province on the Yangtze delta, about 100 km west of Shanghai. Founded in 514 BCE — the same moment Chang Gate was built — it is one of the oldest continuously inhabited cities in China.\n\nIts dense canal network earned it the nickname 'Venice of the East', and its silk, gardens and scholarship made it one of the wealthiest cities in the empire for over a thousand years."
  }
];
