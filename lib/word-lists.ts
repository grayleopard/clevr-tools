export interface Quote {
  text: string;
  attribution: string;
}

// 200 most common English words
export const english200: string[] = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "i",
  "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
  "this", "but", "his", "by", "from", "they", "we", "her", "she", "or",
  "an", "will", "my", "one", "all", "would", "there", "their", "what", "so",
  "up", "out", "if", "about", "who", "get", "which", "go", "me", "when",
  "make", "can", "like", "time", "no", "just", "him", "know", "take", "people",
  "into", "year", "your", "good", "some", "could", "them", "see", "other", "than",
  "then", "now", "look", "only", "come", "its", "over", "think", "also", "back",
  "after", "use", "two", "how", "our", "work", "first", "well", "way", "even",
  "new", "want", "because", "any", "these", "give", "day", "most", "us", "great",
  "between", "need", "large", "under", "never", "each", "right", "hand", "high", "place",
  "such", "again", "few", "case", "turn", "every", "same", "tell", "does", "set",
  "three", "own", "point", "home", "read", "world", "still", "went", "last", "long",
  "say", "help", "put", "different", "away", "ask", "men", "run", "small", "end",
  "while", "move", "try", "night", "live", "old", "number", "write", "part", "against",
  "keep", "thing", "begin", "where", "life", "much", "many", "before", "start", "might",
  "show", "city", "play", "open", "name", "close", "seem", "together", "next", "group",
  "leave", "change", "room", "call", "water", "side", "been", "head", "house", "school",
  "should", "state", "become", "both", "study", "real", "team", "very", "being", "story",
  "another", "often", "must", "young", "important", "until", "children", "food", "second", "let"
];

// 1000 most common English words (first 200 + 800 more)
export const english1000: string[] = [
  ...english200,
  "money", "once", "free", "power", "public", "face", "water", "body", "music", "color",
  "order", "fire", "south", "problem", "piece", "told", "found", "knew", "since", "family",
  "against", "example", "given", "himself", "felt", "already", "country", "plant", "north", "black",
  "white", "hard", "strong", "feel", "rather", "early", "light", "voice", "inside", "line",
  "low", "outside", "behind", "river", "small", "enough", "across", "later", "four", "five",
  "six", "seven", "eight", "nine", "ten", "hundred", "thousand", "half", "true", "stand",
  "speak", "write", "bring", "hear", "watch", "happen", "send", "fall", "carry", "break",
  "clear", "force", "meet", "check", "past", "cut", "done", "ground", "fine", "cause",
  "least", "full", "between", "special", "able", "upon", "simple", "either", "care", "draw",
  "idea", "rest", "along", "floor", "town", "return", "mind", "heart", "kind", "front",
  "class", "above", "control", "below", "quite", "build", "field", "third", "general", "cover",
  "air", "land", "surface", "material", "note", "single", "though", "certain", "usually", "hold",
  "form", "natural", "common", "period", "pattern", "usually", "result", "question", "answer", "white",
  "person", "almost", "north", "near", "morning", "animal", "friend", "matter", "perhaps", "rule",
  "model", "center", "south", "father", "mother", "always", "often", "never", "certain", "something",
  "nothing", "everything", "everyone", "someone", "anyone", "somewhere", "anywhere", "everywhere", "whenever", "whatever",
  "however", "therefore", "although", "because", "whether", "through", "during", "within", "without", "beyond",
  "toward", "forward", "around", "better", "further", "rather", "almost", "enough", "especially", "exactly",
  "finally", "generally", "however", "including", "instead", "probably", "quickly", "recently", "several", "simply",
  "sometimes", "suddenly", "therefore", "together", "usually", "usually", "various", "already", "another", "because",
  "believe", "between", "cannot", "children", "country", "decided", "different", "during", "everything", "example",
  "following", "himself", "however", "important", "interest", "itself", "language", "little", "money", "morning",
  "mountain", "nothing", "number", "outside", "parents", "picture", "quickly", "really", "remember", "school",
  "second", "should", "someone", "sometimes", "something", "started", "student", "teacher", "through", "together",
  "toward", "trouble", "under", "usually", "wanted", "watch", "water", "where", "whether", "which",
  "while", "white", "whole", "whose", "within", "without", "world", "write", "wrong", "young",
  "across", "almost", "although", "among", "answer", "beautiful", "before", "being", "better", "black",
  "blood", "body", "bright", "broken", "brown", "building", "business", "bought", "called", "came",
  "careful", "carry", "century", "chance", "character", "charge", "church", "clear", "close", "cold",
  "coming", "company", "complete", "corner", "could", "culture", "dead", "death", "deep", "direction",
  "doctor", "doing", "dollar", "door", "dream", "drive", "east", "eight", "energy", "entire",
  "evening", "event", "ever", "every", "exactly", "face", "fact", "fall", "false", "feel",
  "feeling", "floor", "force", "forget", "form", "found", "friend", "game", "garden", "given",
  "glass", "going", "golden", "gone", "government", "great", "green", "grew", "ground", "grow",
  "grown", "guess", "happy", "hard", "heart", "heavy", "help", "history", "home", "hope",
  "hour", "human", "hundred", "idea", "instead", "island", "issue", "itself", "join", "just",
  "kept", "kind", "knew", "knowledge", "land", "later", "learn", "leave", "level", "likely",
  "little", "local", "love", "made", "matter", "maybe", "meeting", "mind", "month", "moon",
  "more", "moving", "music", "nature", "near", "need", "news", "next", "night", "north",
  "nothing", "notice", "object", "office", "once", "open", "order", "others", "outside", "paper",
  "perhaps", "phone", "piece", "plan", "plant", "point", "police", "political", "poor", "power",
  "practice", "present", "pretty", "probably", "process", "program", "provide", "public", "quite", "radio",
  "ready", "reason", "receive", "red", "region", "remain", "report", "require", "rest", "result",
  "return", "right", "river", "road", "short", "simple", "since", "sister", "size", "skin",
  "sleep", "slow", "slowly", "sound", "speak", "spend", "spring", "start", "stay", "step",
  "stop", "store", "street", "strong", "study", "summer", "support", "sure", "table", "talk",
  "teach", "thank", "themselves", "these", "thinking", "thousand", "total", "town", "training", "travel",
  "tree", "truth", "understand", "until", "upon", "usually", "value", "view", "visit", "voice",
  "walk", "wall", "war", "warm", "west", "whole", "wind", "winter", "wish", "woman",
  "word", "working", "worth", "writing", "year", "yesterday", "yourself", "above", "across", "agree",
];

export const quotes: Quote[] = [
  { text: "The only way to do great work is to love what you do. If you have not found it yet keep looking and do not settle.", attribution: "Steve Jobs" },
  { text: "In the middle of every difficulty lies opportunity.", attribution: "Albert Einstein" },
  { text: "It does not matter how slowly you go as long as you do not stop.", attribution: "Confucius" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", attribution: "Eleanor Roosevelt" },
  { text: "Life is what happens when you are busy making other plans.", attribution: "John Lennon" },
  { text: "You must be the change you wish to see in the world.", attribution: "Mahatma Gandhi" },
  { text: "The best time to plant a tree was twenty years ago. The second best time is now.", attribution: "Chinese Proverb" },
  { text: "Do what you can with what you have where you are.", attribution: "Theodore Roosevelt" },
  { text: "Success is not final and failure is not fatal. It is the courage to continue that counts. Every champion was once a contender that refused to give up.", attribution: "Vince Lombardi" },
  { text: "We are what we repeatedly do. Excellence then is not an act but a habit. The things you do every day matter more than what you do once in a while.", attribution: "Aristotle" },
  { text: "Reading is to the mind what exercise is to the body. The more that you read the more things you will know. The more that you learn the more places you will go.", attribution: "Dr. Seuss" },
  { text: "Happiness is not something ready made. It comes from your own actions. Every morning we are born again and what we do today is what matters most.", attribution: "Dalai Lama" },
  { text: "The greatest glory in living lies not in never falling but in rising every time we fall. Life is really simple but we insist on making it complicated. The purpose of our lives is to be happy.", attribution: "Nelson Mandela" },
  { text: "Two roads diverged in a wood and I took the one less traveled by and that has made all the difference.", attribution: "Robert Frost" },
  { text: "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.", attribution: "Ralph Waldo Emerson" },
  { text: "In three words I can sum up everything I have learned about life. It goes on.", attribution: "Robert Frost" },
  { text: "Ask not what your country can do for you but ask what you can do for your country.", attribution: "John F. Kennedy" },
  { text: "The way to get started is to quit talking and begin doing. Your time is limited so do not waste it living someone else's life.", attribution: "Walt Disney" },
  { text: "If you look at what you have in life you will always have more. If you look at what you do not have in life you will never have enough.", attribution: "Oprah Winfrey" },
  { text: "If you set your goals ridiculously high and it is a failure you will fail above everyone else's success.", attribution: "James Cameron" },
  { text: "You miss one hundred percent of the shots you do not take.", attribution: "Wayne Gretzky" },
  { text: "Whether you think you can or you think you cannot you are right.", attribution: "Henry Ford" },
  { text: "I have learned that people will forget what you said and people will forget what you did but people will never forget how you made them feel.", attribution: "Maya Angelou" },
  { text: "Spread love everywhere you go. Let no one ever come to you without leaving happier.", attribution: "Mother Teresa" },
  { text: "When you reach the end of your rope tie a knot in it and hang on.", attribution: "Franklin D. Roosevelt" },
  { text: "Always remember that you are absolutely unique. Just like everyone else.", attribution: "Margaret Mead" },
  { text: "Do not go where the path may lead. Go instead where there is no path and leave a trail.", attribution: "Ralph Waldo Emerson" },
  { text: "You will face many defeats in life but never let yourself be defeated.", attribution: "Maya Angelou" },
  { text: "The greatest glory in living lies not in never falling but in rising every time we fall.", attribution: "Nelson Mandela" },
  { text: "In the end it is not the years in your life that count but the life in your years.", attribution: "Abraham Lincoln" },
  { text: "Never let the fear of striking out keep you from playing the game.", attribution: "Babe Ruth" },
  { text: "Life is either a daring adventure or nothing at all.", attribution: "Helen Keller" },
  { text: "Many of life's failures are people who did not realize how close they were to success when they gave up.", attribution: "Thomas A. Edison" },
  { text: "You have brains in your head. You have feet in your shoes. You can steer yourself any direction you choose.", attribution: "Dr. Seuss" },
  { text: "If life were predictable it would cease to be life and be without flavor.", attribution: "Eleanor Roosevelt" },
  { text: "If you want to live a happy life tie it to a goal not to people or things.", attribution: "Albert Einstein" },
  { text: "Never let the fear of striking out keep you from playing the game.", attribution: "Babe Ruth" },
  { text: "Money and success do not change people. They merely amplify what is already there.", attribution: "Will Smith" },
  { text: "Your time is limited so do not waste it living someone else's life. Do not let the noise of others' opinions drown out your own inner voice.", attribution: "Steve Jobs" },
  { text: "Not all those who wander are lost.", attribution: "J.R.R. Tolkien" },
  { text: "It is during our darkest moments that we must focus to see the light.", attribution: "Aristotle" },
  { text: "Whoever is happy will make others happy too.", attribution: "Anne Frank" },
  { text: "Do not judge each day by the harvest you reap but by the seeds that you plant.", attribution: "Robert Louis Stevenson" },
  { text: "The only impossible journey is the one you never begin.", attribution: "Tony Robbins" },
  { text: "In this life we cannot do great things. We can only do small things with great love.", attribution: "Mother Teresa" },
  { text: "Only a life lived for others is a life worthwhile.", attribution: "Albert Einstein" },
  { text: "The purpose of our lives is to be happy.", attribution: "Dalai Lama" },
  { text: "You only live once but if you do it right once is enough.", attribution: "Mae West" },
  { text: "Live in the sunshine swim in the sea drink the wild air.", attribution: "Ralph Waldo Emerson" },
  { text: "Go confidently in the direction of your dreams. Live the life you have imagined.", attribution: "Henry David Thoreau" },
  { text: "When you reach the end of your rope tie a knot in it and hang on.", attribution: "Franklin D. Roosevelt" },
];

// ─── Passages for passage-based typing mode ─────────────────────────────────
// 40+ original passages, each 60-120 words, covering varied topics

export const passages: string[] = [
  // ── Science & Nature (8) ──

  // 1. Clouds / Weather
  "Clouds are not simply decorations in the sky; they are engines of weather, carrying billions of tons of water across continents. A single cumulonimbus thunderhead can tower forty thousand feet into the atmosphere and release energy equivalent to several nuclear warheads. Yet for all their power, clouds begin with something remarkably small: a speck of dust or pollen around which moisture condenses. The next time you watch clouds drift overhead, consider that each one is a miniature laboratory where temperature, pressure, and humidity interact in ways that meteorologists are still working to fully understand.",

  // 2. Ocean depth
  "The ocean covers more than seventy percent of our planet, yet we have explored less than five percent of it. Deep beneath the surface, entire ecosystems thrive in complete darkness, sustained by chemical energy rather than sunlight. Giant squid, bioluminescent jellyfish, and creatures we have not yet named drift through waters that no human eye has ever seen. The pressure at the deepest point in the Mariana Trench is over a thousand times atmospheric pressure at sea level. Every expedition to the deep sea returns with new discoveries, reminding us that the greatest frontier may not be outer space but the world beneath the waves.",

  // 3. Tree communication
  "Trees appear to stand in solitude, but beneath the forest floor lies a vast network of fungal threads connecting their roots. Through this network, often called the wood wide web, trees share sugars, water, and chemical warning signals with their neighbors. When an insect attacks one tree, it can send compounds through the fungal links that prompt nearby trees to produce defensive chemicals before the pest arrives. Mother trees have been observed channeling extra nutrients to their seedlings, especially those growing in deep shade. Forests, it turns out, are not collections of competing individuals but cooperative communities whose survival depends on mutual support.",

  // 4. Universe scale
  "If you could travel at the speed of light, it would still take over four years to reach the nearest star beyond our sun. The Milky Way alone contains an estimated two hundred billion stars, and the observable universe holds roughly two trillion galaxies. These numbers are so large that they lose meaning without analogy. Imagine every grain of sand on every beach on Earth; there are more stars in the universe than all of those grains combined. We live on a pale blue dot orbiting one ordinary star in an unimaginably vast cosmos, and everything we have ever known fits within that single pixel of light.",

  // 5. Bird migration
  "Twice a year, billions of birds undertake journeys that span thousands of miles, crossing oceans, deserts, and mountain ranges with astonishing precision. The Arctic tern holds the record, traveling from pole to pole and back again each year, a round trip of roughly forty-four thousand miles. Scientists have discovered that migrating birds navigate using a combination of the Earth's magnetic field, the position of the sun and stars, and even scent. Some species fly nonstop for days, sleeping with one half of their brain at a time. Migration is one of nature's most demanding feats, and it happens largely unseen above our heads.",

  // 6. Water cycle
  "Every glass of water you drink has been on an extraordinary journey. The same molecules have cycled through clouds, rivers, glaciers, and living organisms for billions of years. Water evaporates from the ocean, rises into the atmosphere, condenses into clouds, and falls back to Earth as rain or snow. Some of it seeps deep underground, where it may remain for thousands of years before resurfacing in a spring. The water cycle has no beginning and no end; it is a continuous loop powered by the sun's energy and shaped by gravity. In a very real sense, you are drinking the same water the dinosaurs drank.",

  // 7. Autumn leaves
  "In autumn, deciduous trees perform a quiet chemical spectacle. As daylight shortens and temperatures drop, trees stop producing chlorophyll, the green pigment that drives photosynthesis. Without its vivid green mask, the leaf reveals pigments that were present all along: yellow xanthophylls and orange carotenoids. Meanwhile, some species manufacture anthocyanins, producing brilliant reds and purples. This transformation is not waste; it is a strategic retreat. The tree reabsorbs valuable nutrients from its leaves before dropping them, recycling nitrogen and phosphorus for the coming spring. What we admire as scenery is actually a carefully orchestrated act of survival and preparation.",

  // 8. Coral reefs
  "Coral reefs occupy less than one percent of the ocean floor, yet they support roughly twenty-five percent of all marine species. Each reef is built by tiny animals called polyps, which secrete calcium carbonate skeletons over hundreds of years. These living structures provide shelter, breeding grounds, and hunting territory for an extraordinary diversity of life. Reefs also protect coastlines from storm surges and generate billions of dollars in tourism and fishing revenue. However, rising ocean temperatures cause coral bleaching, a stress response that can be fatal if prolonged. The fate of coral reefs is one of the most urgent conservation challenges of our time.",

  // ── Technology (6) ──

  // 9. How the internet works
  "When you load a web page, your request travels through a chain of systems that would have seemed like science fiction a few decades ago. Your device sends a signal to a local router, which forwards it to your internet service provider, which routes it across undersea fiber-optic cables to a data center that might be on a different continent. There, a server retrieves the page you requested and sends it back through the same global network in a fraction of a second. This entire process relies on standardized protocols that allow billions of devices to communicate seamlessly, making the internet one of humanity's greatest collaborative achievements.",

  // 10. Personal computers history
  "The personal computer revolution began not in corporate boardrooms but in garages and hobby clubs. In the mid-nineteen seventies, enthusiasts soldered together kits like the Altair 8800, programming them with toggle switches and blinking lights. Within a decade, machines like the Apple II and IBM PC brought computing into homes and offices worldwide. The graphical user interface, pioneered at Xerox PARC and popularized by Apple and Microsoft, transformed computers from tools for specialists into appliances for everyone. Today we carry more computing power in our pockets than existed in entire buildings during the early days of the space program.",

  // 11. GPS
  "The Global Positioning System relies on a constellation of at least twenty-four satellites orbiting roughly twelve thousand miles above the Earth. Each satellite broadcasts a signal containing its position and the precise time from an onboard atomic clock. Your GPS receiver picks up signals from four or more satellites simultaneously and calculates the distance to each one based on how long the signal took to arrive. By triangulating these distances, the receiver pinpoints your location to within a few meters. The entire system depends on corrections for the curvature of space-time predicted by Einstein's theory of relativity; without those corrections, GPS positions would drift by miles each day.",

  // 12. Smartphones
  "A modern smartphone contains more technology than most people realize. Its touchscreen is a layered sandwich of glass, conductive film, and display pixels, each responding to the electrical charge in your fingertip. Inside, a system-on-chip integrates a processor, graphics unit, modem, and machine-learning accelerator onto a piece of silicon smaller than a postage stamp. Sensors for motion, light, pressure, and magnetic fields feed data to the operating system dozens of times per second. The result is a device that serves as a camera, map, library, wallet, and communication hub, all powered by a battery that lasts an entire day on a single charge.",

  // 13. Search engines
  "Search engines sift through billions of web pages to deliver relevant results in milliseconds. The process begins with crawlers, automated programs that follow links across the internet and index the text they find. When you type a query, the search engine consults its index and ranks pages using hundreds of factors, including keyword relevance, site authority, freshness of content, and user engagement signals. Early search engines ranked pages mostly by keyword frequency, but modern algorithms use machine learning to understand the intent behind your words. The seemingly simple act of searching the web is backed by one of the most sophisticated information-retrieval systems ever built.",

  // 14. Encryption
  "Every time you send a message through a secure app or enter a password on a website, encryption protects your data from prying eyes. Modern encryption works by scrambling information with a mathematical key so complex that even the fastest supercomputers would need billions of years to crack it by brute force. Public-key cryptography, invented in the nineteen seventies, allows two parties to communicate securely without ever meeting in person to exchange a secret code. This technique underpins online banking, digital signatures, and private messaging. In an age when data travels across open networks, encryption is the invisible lock that keeps our digital lives secure.",

  // ── History & Culture (6) ──

  // 15. Printing press
  "Before the printing press, books were copied by hand, a painstaking process that could take months for a single volume. When Johannes Gutenberg introduced movable type in the fourteen fifties, he did more than speed up book production; he democratized knowledge itself. Within fifty years, an estimated twenty million volumes had been printed across Europe. Ideas that once circulated among a tiny elite now reached merchants, clergy, and curious minds in distant towns. The printing press accelerated the Renaissance, fueled the Reformation, and laid the groundwork for the scientific revolution. It remains one of the most transformative inventions in human history.",

  // 16. Ancient timekeeping
  "Long before clocks existed, people measured time by observing the natural world. Egyptians tracked the movement of stars across the night sky and divided daylight into twelve hours using shadow clocks, a precursor to the sundial. Water clocks, which measured time by the steady flow of liquid through a small opening, appeared in multiple civilizations independently. Incense clocks burned at a known rate, releasing different scents to mark the passing hours. Each of these devices reflected a deep human need to organize life around reliable intervals, a need that eventually drove the invention of mechanical clocks and the precise timekeeping we depend on today.",

  // 17. Written language origins
  "Writing did not emerge from a desire to record poetry or philosophy; its earliest forms were accounting tools. Around five thousand years ago, Sumerian scribes in Mesopotamia pressed wedge-shaped marks into clay tablets to track grain, livestock, and trade goods. Over centuries, these symbols evolved from simple pictures into the abstract characters of cuneiform, capable of expressing laws, stories, and prayers. Writing systems arose independently in Egypt, China, and Mesoamerica as well, each reflecting the unique needs of its culture. The invention of writing transformed human society by allowing knowledge to outlast the memory of any single person.",

  // 18. Silk Road
  "The Silk Road was not a single road but a web of overland and maritime routes stretching from China to the Mediterranean. For more than a thousand years, merchants carried silk, spices, precious metals, and gemstones across deserts and mountain passes, braving bandits, sandstorms, and extreme temperatures. Along the way, ideas traveled too: religions, scientific knowledge, musical instruments, and agricultural techniques spread between civilizations that might never have encountered one another otherwise. The Silk Road was as much an exchange of culture as of commerce, weaving together the histories of dozens of societies into a shared human story.",

  // 19. Coffee origins
  "Legend holds that an Ethiopian goat herder named Kaldi noticed his goats dancing with unusual energy after eating berries from a certain shrub. Whether or not the story is true, coffee cultivation began in the highlands of Ethiopia and spread to the Arabian Peninsula by the fifteenth century. Coffeehouses in cities like Mecca and Istanbul became vibrant centers of conversation, debate, and intellectual exchange, earning the nickname schools of the wise. When coffee reached Europe in the seventeenth century, it transformed social life there as well. Today, coffee is the second most traded commodity on Earth, and its journey from berry to cup spans continents and centuries.",

  // 20. Libraries
  "Libraries have served as guardians of knowledge for thousands of years. The ancient Library of Alexandria, founded in the third century before the common era, aimed to collect every text in the known world and reportedly held hundreds of thousands of scrolls. Medieval monasteries preserved classical works through centuries of upheaval by copying manuscripts one page at a time. Public lending libraries, which emerged in the nineteenth century, extended access to people of all backgrounds. Today, digital libraries make millions of texts available to anyone with an internet connection. The form has changed dramatically, but the mission remains the same: to make knowledge freely available to all who seek it.",

  // ── Everyday Life (6) ──

  // 21. Science of cooking
  "Cooking is chemistry you can eat. When you sear a steak, the Maillard reaction transforms amino acids and sugars on the surface into hundreds of flavorful compounds, producing the rich brown crust that no amount of slow cooking can replicate. Whipping egg whites introduces air bubbles that are stabilized by unfolding proteins, creating the structure of a meringue. Bread rises because yeast consumes sugar and releases carbon dioxide, which is trapped by gluten strands in the dough. Understanding these reactions does not diminish the art of cooking; it deepens the cook's control and opens the door to creative experimentation in the kitchen.",

  // 22. Why we sleep
  "Sleep is not a passive shutdown of the brain; it is an active and essential biological process. During deep sleep, the body repairs tissues, strengthens the immune system, and consolidates memories from the day. The brain's glymphatic system flushes out toxic waste products that accumulate during waking hours, a cleaning cycle that may help protect against neurodegenerative disease. Rapid eye movement sleep, the phase associated with vivid dreaming, plays a role in emotional regulation and creative problem-solving. Chronic sleep deprivation has been linked to heart disease, obesity, and impaired cognitive function. Few health interventions are as powerful, or as free, as a good night of rest.",

  // 23. Habit formation
  "Habits form through a loop of cue, routine, and reward that becomes automatic with repetition. When you first learn to drive, every action requires conscious attention; after months of practice, you navigate familiar routes almost without thinking. Neuroscience shows that habitual behaviors shift from the prefrontal cortex, responsible for deliberate decision-making, to the basal ganglia, which handles automatic routines. This shift frees mental energy for other tasks but also explains why bad habits are so hard to break. The most effective strategy for building new habits is to attach them to existing cues and to make the desired behavior as easy and rewarding as possible.",

  // 24. Benefits of walking
  "Walking is one of the simplest and most underrated forms of exercise. A brisk thirty-minute walk raises the heart rate, improves circulation, and triggers the release of endorphins that lift mood and reduce stress. Regular walking has been shown to lower blood pressure, improve cholesterol levels, and reduce the risk of type two diabetes. Beyond physical health, walking stimulates creative thinking; many writers and philosophers have credited long walks with their best ideas. Unlike high-intensity workouts, walking requires no equipment, no gym membership, and no recovery time. It is an activity almost anyone can do, almost anywhere, at any age.",

  // 25. How memory works
  "Memory is not a single filing cabinet but a network of interconnected systems. Short-term memory holds information for seconds to minutes, like a phone number you repeat while searching for a pen. When the brain decides that information matters, it encodes it into long-term memory through a process called consolidation, which depends heavily on sleep. Retrieval is not a perfect playback; each time you recall a memory, you subtly reconstruct it, which is why eyewitness accounts can be unreliable. Emotional experiences tend to be remembered more vividly because the amygdala amplifies the encoding process. Understanding how memory works can help us study more effectively and treat its disorders with greater precision.",

  // 26. Decision making
  "Every day, the average person makes thousands of decisions, from what to eat for breakfast to how to respond to an unexpected email. Research shows that decision quality tends to decline as the day progresses, a phenomenon known as decision fatigue. This is one reason many successful leaders simplify routine choices, wearing the same outfit or eating the same meal, to conserve mental energy for decisions that truly matter. Emotions play a larger role in decision-making than most people realize; individuals with damage to emotional centers of the brain struggle to make even simple choices. Good decisions often require balancing rational analysis with intuitive judgment.",

  // ── Philosophy & Motivation (6) ──

  // 27. Value of curiosity
  "Curiosity is the engine that drives discovery. It is what compelled early humans to explore beyond the next hill, what motivated astronomers to build telescopes, and what pushes scientists to ask questions that have no immediate practical value. Curious people tend to learn faster, adapt more readily to change, and find deeper satisfaction in their work. Yet curiosity requires a certain comfort with not knowing, a willingness to sit with uncertainty rather than reaching for the nearest easy answer. In a world that rewards quick certainty, cultivating genuine curiosity is both a discipline and a gift, one that keeps the mind alive and growing long after formal education ends.",

  // 28. Why failure is useful
  "Failure carries a stigma that far exceeds its actual danger. In reality, most meaningful achievements are preceded by a string of unsuccessful attempts. Thomas Edison tested thousands of materials before finding a suitable filament for the light bulb; each failed experiment eliminated a possibility and narrowed the search. Failure provides information that success cannot: it reveals flawed assumptions, highlights weaknesses, and forces a reassessment of strategy. The key distinction is between failing and being defeated. Failing is a temporary event that offers a lesson; being defeated is a mindset that refuses to try again. Those who learn to treat setbacks as data, rather than verdicts, build resilience that compounds over time.",

  // 29. Importance of perspective
  "Two people can witness the same event and walk away with entirely different interpretations. Perspective shapes not only what we notice but how we feel about it. A delayed flight is an inconvenience to one traveler and a welcome chance to read to another. Psychologists call this reframing, and it is one of the most powerful tools for managing stress and maintaining well-being. Shifting perspective does not mean ignoring reality; it means choosing which aspects of reality to emphasize. Over time, the habit of looking for alternative viewpoints broadens understanding, deepens empathy, and turns rigid thinking into flexible problem-solving.",

  // 30. Small actions compounding
  "A single push-up will not transform your body, and a single page of reading will not make you wise. But repeated daily over months and years, small actions accumulate into remarkable results. This principle, often called compounding, applies far beyond finance. Relationships deepen through many small gestures of kindness, not grand declarations. Skills sharpen through thousands of short practice sessions, not marathon efforts. The challenge is that early progress is nearly invisible, which tempts people to quit before the curve bends upward. Patience and consistency are not glamorous virtues, but they are the foundation upon which almost every lasting achievement is built.",

  // 31. Practice and mastery
  "Mastery is not a talent you are born with; it is a process you commit to. Researchers who study expert performance consistently find that deliberate practice, focused effort aimed at improving specific weaknesses, matters far more than natural ability. A concert pianist does not simply play pieces from start to finish; she isolates difficult passages, experiments with fingering, and repeats trouble spots until they become second nature. The path to mastery is rarely exciting. It involves repetition, correction, and long stretches where progress feels invisible. But those who persist discover that competence breeds confidence, and confidence fuels the motivation to keep pushing further.",

  // 32. Creativity
  "Creativity is often misunderstood as a flash of inspiration that strikes without warning. In practice, creative breakthroughs tend to follow a pattern: immersion in a problem, a period of incubation during which the subconscious mind works behind the scenes, and then a sudden insight that connects previously unrelated ideas. The most creative people are not necessarily the most gifted; they are the most prolific. They produce a large volume of work, accept that much of it will be mediocre, and trust that quality emerges from quantity. Creativity is less about waiting for the muse and more about showing up consistently and being willing to make something imperfect.",

  // ── Writing & Language (4) ──

  // 33. Clear writing
  "Clear writing is clear thinking made visible. When a sentence is hard to understand, the problem usually lies not in the reader's comprehension but in the writer's lack of clarity about what they mean. The remedy is ruthless simplicity: short sentences, concrete nouns, active verbs, and the removal of every word that does not earn its place. Good writing does not require a large vocabulary or elaborate constructions; it requires the discipline to say exactly what you mean and nothing more. The best prose is like a window: the reader looks through it to the idea without noticing the glass.",

  // 34. English language evolution
  "English is a language that has never stood still. It began as a cluster of Germanic dialects brought to Britain in the fifth century, absorbed thousands of Latin and French words after the Norman Conquest, and borrowed freely from Greek, Arabic, Hindi, and dozens of other languages as trade and empire expanded its reach. Shakespeare invented words we still use today; so did scientists, sailors, and slang. Unlike French or Spanish, English has no official academy governing its rules. It evolves through use, shaped by millions of speakers who bend it daily to fit new ideas. Its messiness is also its strength: a vocabulary unmatched in size and flexibility.",

  // 35. Punctuation's role
  "Punctuation may seem like a set of minor marks, but it carries enormous power. A comma can change the meaning of a sentence entirely; consider the difference between inviting someone to eat, grandma, and inviting someone to eat grandma. Semicolons link related ideas that could stand alone; dashes insert dramatic pauses or asides. The period is an act of authority, declaring that a thought is complete. Without punctuation, written language would be an unbroken stream of words, forcing readers to guess where one idea ends and another begins. These small marks are the traffic signals of prose, guiding the reader safely through the writer's thoughts.",

  // 36. Power of storytelling
  "Humans have been telling stories for as long as we have had language, and probably longer. Cave paintings, epic poems, folk tales, novels, and films all serve the same fundamental purpose: making sense of experience by shaping it into a narrative with characters, conflict, and resolution. Stories engage the brain differently from facts alone; neuroscience shows that a well-told story activates the same regions in the listener's brain as in the teller's, creating a kind of neural synchrony. This is why a single story can change minds in ways that a mountain of data cannot. Stories do not just convey information; they create shared understanding.",

  // ── Sports & Health (4) ──

  // 37. How muscles grow
  "Muscle growth begins with damage. When you lift a weight heavy enough to challenge your muscles, the effort creates microscopic tears in the muscle fibers. In the hours and days that follow, your body repairs those tears by fusing fibers together, producing strands that are thicker and stronger than before. This process, called hypertrophy, depends on adequate protein intake, sufficient rest, and progressive overload, meaning you must gradually increase the demands on your muscles over time. Without that escalating challenge, the body adapts and growth stalls. Building muscle is not about a single intense workout; it is about the steady accumulation of stress, recovery, and adaptation over weeks and months.",

  // 38. Science of hydration
  "Water makes up roughly sixty percent of your body weight and is involved in nearly every biological process, from regulating temperature to transporting nutrients to cushioning joints. Even mild dehydration, a loss of just one to two percent of body weight in fluid, can impair concentration, reduce endurance, and increase perceived effort during exercise. Thirst is not always a reliable indicator; by the time you feel thirsty, you may already be mildly dehydrated. The amount of water a person needs varies with activity level, climate, and body size, but a general guideline is to drink enough so that your urine is a pale straw color throughout the day.",

  // 39. Stretching
  "Stretching is one of the most debated topics in exercise science. Static stretching, holding a position for thirty seconds or more, was once considered essential before any physical activity. Recent research suggests that static stretches before explosive movements can actually reduce power output temporarily. Dynamic stretching, which involves controlled movements through a full range of motion, is now preferred as a warm-up because it raises muscle temperature and prepares the nervous system for action. After exercise, gentle static stretches may help restore flexibility and promote relaxation. The best stretching routine depends on the activity, the individual's goals, and how the body responds.",

  // 40. Athletic mindset
  "Elite athletes often say that performance is ninety percent mental, and while the exact number is debatable, the sentiment holds truth. The ability to stay focused under pressure, recover quickly from mistakes, and maintain confidence through slumps separates good athletes from great ones. Sports psychologists teach techniques like visualization, in which athletes mentally rehearse successful performances, and self-talk, the practice of replacing negative internal dialogue with constructive cues. These are not mystical practices; they are trainable skills that reshape how the brain responds to stress. The strongest competitor is not always the most physically gifted but the one whose mind remains steady when the stakes are highest.",

  // ── Bonus passages for variety (2 extra) ──

  // 41. Sound and music
  "Sound is vibration traveling through air, but music is something more. When a melody reaches your ears, the auditory cortex processes pitch, rhythm, and timbre, while the limbic system responds with emotion. A minor key can evoke sadness; a driving beat can trigger excitement. Music activates the brain's reward pathways, releasing dopamine in patterns similar to those produced by food or social connection. This explains why a favorite song can lift your mood in seconds or why a lullaby calms a restless infant. Across every culture ever studied, humans make music, suggesting it is not a luxury but a fundamental part of what it means to be human.",

  // 42. Optical illusions
  "Optical illusions are not flaws in your vision; they are windows into how your brain constructs reality. Your eyes send raw data to the visual cortex, which interprets that data using shortcuts built over millions of years of evolution. These shortcuts usually work well, but they can be tricked. The famous Muller-Lyer illusion makes two lines of equal length appear different because of the arrow-like fins at their ends. Your brain interprets the fins as depth cues and adjusts its size estimate accordingly. Studying illusions teaches us that perception is not a passive recording of the world but an active, and sometimes fallible, process of construction.",
];

// ─── Advanced Passages for technical typing practice ─────────────────────────
// 20+ original passages with parentheses, semicolons, colons, dashes, numbers,
// and domain-specific multi-syllable vocabulary

export const advancedPassages: string[] = [
  // ── Programming & CS (4) ──

  // 1. How compilers work
  "Modern compilers transform high-level source code into machine-executable instructions through a multi-stage pipeline: lexical analysis, parsing, semantic analysis, optimization, and code generation. Each phase reduces abstraction — converting human-readable constructs into intermediate representations and, ultimately, into architecture-specific assembly. The optimization stage alone can involve 30+ distinct passes, including dead-code elimination, loop unrolling, and register allocation. GCC 14.2, for instance, supports over 200 individual optimization flags; most developers simply use -O2 or -O3 and trust the compiler's judgment, accepting a reasonable trade-off between compilation speed and runtime performance.",

  // 2. TCP vs UDP
  "The Transmission Control Protocol (TCP) and User Datagram Protocol (UDP) represent two fundamentally different approaches to network communication. TCP is connection-oriented: before any data flows, both endpoints complete a three-way handshake (SYN, SYN-ACK, ACK) to establish a reliable channel with guaranteed delivery and in-order sequencing. UDP, by contrast, is connectionless — it fires datagrams without acknowledgment, trading reliability for speed. Video conferencing and online gaming typically prefer UDP because a dropped packet at 60 fps matters less than the 50-200 ms latency penalty that TCP's retransmission logic would introduce; file transfers and web browsing rely on TCP's guarantees.",

  // 3. Database ACID properties
  "Relational databases enforce four guarantees — collectively known as ACID — to ensure data integrity under concurrent access: Atomicity (transactions commit fully or not at all), Consistency (every transaction moves the database from one valid state to another), Isolation (concurrent transactions behave as if executed serially), and Durability (committed data survives crashes). Achieving true isolation is expensive; most systems offer configurable levels (Read Uncommitted, Read Committed, Repeatable Read, Serializable) that trade strictness for throughput. PostgreSQL 16, for example, defaults to Read Committed and uses multi-version concurrency control (MVCC) with row-level locking to minimize contention between readers and writers.",

  // 4. Big-O notation
  "Big-O notation describes how an algorithm's resource consumption scales with input size (n), abstracting away constant factors and lower-order terms. A hash table lookup averages O(1) — constant time regardless of table size — while a naive nested-loop comparison runs in O(n^2), doubling the input quadruples the work. Sorting algorithms illustrate the practical impact: merge sort and heapsort guarantee O(n log n) worst-case performance, whereas quicksort averages O(n log n) but degrades to O(n^2) on pathological inputs without randomized pivoting. For a dataset of 10 million records, the difference between O(n log n) and O(n^2) can mean seconds versus days of computation.",

  // ── Science & Medicine (4) ──

  // 5. mRNA vaccines
  "Messenger RNA (mRNA) vaccines work by delivering synthetic instructions that teach cells to produce a harmless piece of a pathogen — typically the spike protein of SARS-CoV-2. The mRNA is encapsulated in lipid nanoparticles (roughly 80-100 nm in diameter) that fuse with cell membranes and release their payload into the cytoplasm. Ribosomes translate the mRNA into spike proteins, which migrate to the cell surface and trigger both innate and adaptive immune responses: antibody production by B-cells and targeted killing by cytotoxic T-cells. Crucially, mRNA never enters the nucleus and cannot alter host DNA; it degrades within 48-72 hours, leaving only immunological memory behind.",

  // 6. DNA replication
  "DNA replication begins when the enzyme helicase unwinds the double helix at origins of replication, creating a Y-shaped structure called the replication fork. DNA polymerase III synthesizes new strands exclusively in the 5'-to-3' direction; the leading strand is copied continuously, but the lagging strand must be assembled in short segments (Okazaki fragments, roughly 1,000-2,000 nucleotides in prokaryotes). DNA ligase then seals the gaps between fragments. The process is remarkably accurate — polymerase's built-in 3'-to-5' exonuclease proofreading corrects approximately 99% of mismatches — yielding a final error rate of about 1 per 10^9 bases after mismatch-repair enzymes complete their work.",

  // 7. MRI physics
  "Magnetic resonance imaging (MRI) exploits the quantum property of nuclear spin — specifically, the spin-1/2 of hydrogen protons abundant in body water and fat. A superconducting magnet (typically 1.5T or 3.0T) aligns proton spins along its field; a radiofrequency pulse at the Larmor frequency (approximately 63.87 MHz at 1.5T) tips them into a transverse plane. As protons relax back to equilibrium, they emit signals whose timing encodes tissue properties: T1 relaxation distinguishes fat from fluid; T2 relaxation highlights edema and pathology. Gradient coils encode spatial information by varying the magnetic field linearly, and a Fourier transform converts the raw signal (k-space data) into cross-sectional images.",

  // 8. Semiconductor transistors
  "A MOSFET (metal-oxide-semiconductor field-effect transistor) controls current flow through a silicon channel using a gate electrode separated from the substrate by a thin oxide layer (SiO2 or high-k dielectric). When the gate voltage exceeds the threshold voltage (Vt, typically 0.2-0.7 V in modern nodes), an inversion layer forms at the p-n junction, allowing electrons to flow between source and drain. As manufacturers shrank transistors from 10 um in 1971 to 3 nm in 2023, leakage current and quantum tunneling became critical obstacles — prompting innovations like FinFET (introduced at 22 nm) and gate-all-around (GAA) architectures. Moore's law, which predicted a doubling of transistor density every 18-24 months, is widely considered to be approaching its physical limits.",

  // ── Finance & Economics (4) ──

  // 9. Compound interest mechanics
  "Compound interest — sometimes called the eighth wonder of the world (an anecdote often attributed to Einstein, though unverified) — is calculated using the formula A = P(1 + r/n)^(nt), where P is the principal, r the annual rate, n the compounding frequency, and t the time in years. A $10,000 investment at 7% compounded monthly grows to approximately $19,672 in 10 years and $76,123 in 30 years; the majority of that growth occurs in the final decade. However, inflation erodes purchasing power: at a 3% annual inflation rate, that $76,123 would be worth roughly $31,400 in today's dollars — illustrating why real (inflation-adjusted) returns matter more than nominal ones.",

  // 10. Stock market order books
  "At the heart of every stock exchange is the order book — a real-time ledger of buy (bid) and sell (ask) orders organized by price and arrival time. The bid-ask spread (the gap between the highest bid and lowest ask) reflects market liquidity; spreads on heavily traded stocks like AAPL or MSFT can be as narrow as $0.01, while thinly traded securities may show spreads exceeding $0.50. When a trader submits a market order, it executes immediately at the best available price; a limit order, by contrast, sits in the book until the price target is met. Modern matching engines process orders in microseconds (often under 10 us), and high-frequency trading firms invest millions in co-location to shave nanoseconds off their execution times.",

  // 11. Central bank inflation tools
  "Central banks manage inflation primarily through three mechanisms: adjusting the policy interest rate (the federal funds rate in the U.S., currently targeting a range set by the FOMC), conducting open market operations (buying or selling government securities to expand or contract the money supply), and forward guidance (communicating future policy intentions to shape market expectations). During the 2008-2009 financial crisis, the Federal Reserve introduced quantitative easing (QE) — purchasing over $4.5 trillion in bonds — to lower long-term rates when the short-term rate hit its zero lower bound. Critics argue QE inflates asset prices disproportionately, widening wealth inequality; supporters counter that it prevented a deflationary spiral that could have deepened the recession by 3-5 percentage points.",

  // 12. Balance sheet structure
  "A balance sheet captures a company's financial position at a specific moment and obeys a fundamental equation: Assets = Liabilities + Shareholders' Equity. Assets are divided into current (cash, receivables, inventory — items convertible to cash within 12 months) and non-current (property, equipment, intangible assets like patents). Liabilities follow the same split: current obligations (accounts payable, short-term debt due within a year) versus long-term debt and deferred tax liabilities. The working capital ratio (current assets / current liabilities) signals short-term health; a ratio below 1.0 suggests potential liquidity risk. Analysts compare balance sheets across periods to detect trends in leverage, asset efficiency, and capital allocation strategy.",

  // ── Engineering & Architecture (4) ──

  // 13. Bridge load distribution
  "Bridge engineers must account for two categories of loading: dead load (the permanent weight of the structure itself — steel, concrete, railings) and live load (variable forces from traffic, pedestrians, wind, and seismic activity). Arch bridges transfer loads primarily through compression, directing forces along curved paths into abutments; suspension bridges rely on tension in main cables draped between towers, with vertical hangers distributing the deck load. Safety factors — typically 1.5-2.5 for highway bridges per AASHTO specifications — ensure that the structure can withstand loads well beyond expected maximums. The Golden Gate Bridge, completed in 1937, was designed for a dead load of approximately 22,000 tons and a live load capacity that allows 6 lanes of simultaneous traffic.",

  // 14. Earthquake-resistant design
  "Earthquake-resistant buildings employ several strategies to survive ground shaking without collapse. Base isolation decouples the structure from the ground using elastomeric bearings or friction pendulum systems, reducing horizontal acceleration by 50-80%. Shear walls — thick reinforced-concrete panels — resist lateral forces by transferring them directly to the foundation; moment-resisting frames achieve similar goals through rigid beam-column connections that flex without breaking. Engineers use both the Richter scale (measuring seismic energy logarithmically) and the Modified Mercalli Intensity scale (I-XII, describing observed effects) to characterize earthquakes. Japan's 2011 Tohoku earthquake (magnitude 9.1) demonstrated that even well-designed structures face limits when ground motion exceeds design-basis assumptions.",

  // 15. Electrical grid balancing
  "Power grids must maintain a precise balance between electricity generation and consumption at all times; in North America, this equilibrium is reflected in a system frequency of 60 Hz (50 Hz in Europe and most of Asia). When demand exceeds supply, frequency dips; when supply exceeds demand, it rises. Grid operators maintain spinning reserves — generators running but not fully loaded — that can ramp up within seconds to correct imbalances. Demand response programs incentivize large consumers to reduce load during peak periods, avoiding the need for expensive peaking plants. As intermittent renewables (solar, wind) grow from 5% to 30%+ of capacity, energy storage systems (lithium-ion batteries, pumped hydro) become critical to maintaining grid stability.",

  // 16. Water treatment
  "Municipal water treatment transforms raw surface water into potable supply through a carefully sequenced process. Coagulation introduces chemicals (typically aluminum sulfate or ferric chloride) that neutralize the charge on suspended particles, causing them to clump together (flocculation) into larger aggregates called floc. Sedimentation allows floc to settle by gravity in large basins with retention times of 2-4 hours. The clarified water then passes through granular media filters (sand, anthracite, or activated carbon) to remove remaining particles. Disinfection — usually with chlorine at 0.5-2.0 mg/L residual — eliminates pathogens; pH is adjusted to 6.5-8.5 to prevent pipe corrosion. Final turbidity must measure below 1.0 NTU (nephelometric turbidity units) before distribution to consumers.",

  // ── Law & Governance (2) ──

  // 17. Patent application evaluation
  "The patent examination process evaluates whether an invention meets three core requirements: novelty (the invention must not already exist in the prior art), non-obviousness (the invention must represent a meaningful advance beyond what a person skilled in the field would consider routine), and utility (it must have a specific, practical application). Examiners search patent databases, academic journals, and commercial products to identify prior art that might anticipate or render the claims obvious. Under 35 U.S.C. Section 122, most applications are published 18 months after filing, regardless of whether a patent is ultimately granted; this publication ensures the public benefits from disclosed knowledge even if the claims are rejected after examination.",

  // 18. Appellate court proceedings
  "Appellate courts review lower-court decisions using different standards depending on the type of issue raised. Questions of law receive de novo review — the appellate panel examines the legal question fresh, with no deference to the trial court's conclusion. Factual findings, by contrast, are reviewed under a clearly-erroneous (civil) or substantial-evidence (administrative) standard, requiring significant deference. Discretionary rulings (evidentiary decisions, sentencing choices) face the most deferential abuse-of-discretion standard. Amicus curiae (\"friend of the court\") briefs, filed by interested non-parties, provide additional perspectives on complex legal questions. When federal circuit courts reach conflicting conclusions — a circuit split — the Supreme Court may grant certiorari (review roughly 70-80 cases per term from 7,000+ petitions) to resolve the inconsistency.",

  // ── Mathematics & Statistics (2) ──

  // 19. Central limit theorem
  "The central limit theorem (CLT) states that the distribution of sample means approaches a normal (Gaussian) distribution as the sample size increases, regardless of the shape of the underlying population distribution — provided the population has a finite variance. In practice, statisticians often apply a rule of thumb: n >= 30 is generally sufficient for the CLT to yield a reasonable approximation, though highly skewed distributions may require larger samples (n >= 50 or more). This theorem underpins confidence intervals, hypothesis testing, and quality control; it explains why the bell curve appears so frequently in empirical data. Without the CLT, inferential statistics — the ability to draw conclusions about populations from samples — would lack its most fundamental mathematical justification.",

  // 20. RSA encryption and prime factorization
  "RSA encryption, published by Rivest, Shamir, and Adleman in 1977, relies on the computational asymmetry between multiplication and factorization of large primes. Key generation begins by selecting two large primes (p and q, each typically 1024-2048 bits), computing their product n = p * q, and deriving the public exponent e (commonly 65,537) and private exponent d using Euler's totient function: phi(n) = (p - 1)(q - 1). Encrypting a message m produces ciphertext c = m^e mod n; decrypting reverses the operation via c^d mod n. The security assumption is that factoring n (a 2048-bit integer has roughly 617 decimal digits) is computationally infeasible with classical hardware — though Shor's algorithm on a sufficiently large quantum computer could break RSA in polynomial time.",
];
