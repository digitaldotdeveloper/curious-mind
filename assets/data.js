/* Curious Mind — catalogue + store data.
   Plain classic script (no modules) so everything works straight off file://. */

var CATALOGUE = [
  {
    id:"the-long-attention", title:"The Long Attention", author:"Iris Halvard",
    cat:"Essays", pages:214, price:9, year:2025, rating:4.6, reviews:212,
    c:["#9785B9","#5e5080"], art:"orbit", featured:true, badge:"Editor's pick",
    blurb:"Twelve rooms, real and imagined, where thinking is allowed to take its time.",
    about:[
      "Attention is usually described as a muscle, which flatters us — muscles answer to effort. Halvard argues it answers to conditions instead, and then spends twelve essays building the rooms those conditions live in: a library with no clock, a night bus, a kitchen at four in the morning.",
      "Written over six years and largely in the margins of other work, this is a book about the twelfth minute — the one that arrives only after the backlog has finished filing itself, and the one almost nobody stays for."
    ],
    chapter:{ title:"One · The Room With No Clock", paras:[
      "There is a particular kind of quiet that only arrives after the twelfth minute. Before that, the mind is still filing things — the unanswered message, the thing you said in 2011, the low hum of a task you have not started. The first eleven minutes belong to the backlog. The twelfth belongs to you.",
      "I learned this by accident, in a reading room that had been stripped of its clock during a renovation and never given a new one. Nobody complained. What people did instead was stay longer, and then apologise for staying longer, as though the building had tricked them.",
      "We talk about attention as if it were a muscle, which flatters us: muscles respond to effort. Attention responds to conditions. You cannot will yourself into depth any more than you can will yourself asleep. You can only build the room, dim the lights, and wait out the twelfth minute.",
      "This book is a set of rooms. Some of them are literal — a library, a night bus, a kitchen at 4am. Others are shapes of time: the long walk, the second reading, the argument you lose slowly. What they share is that none of them can be hurried, and all of them give something back to the person willing not to hurry.",
      "A warning, then, in the spirit of full disclosure: nothing in here will make you faster."
    ]},
    contents:["The Room With No Clock","Against the Notification","A Short History of the Long Walk","Second Readings","The Argument You Lose Slowly","Night Bus","What the Backlog Wants","Four in the Morning","On Being Bored Correctly","The Twelfth Minute","Company","Leaving the Room"]
  },
  {
    id:"soft-machinery", title:"Soft Machinery", author:"Noor El-Amin",
    cat:"Fiction", pages:302, price:11, year:2025, rating:4.8, reviews:341,
    c:["#F8BBD7","#c2708f"], art:"waves", featured:true, badge:"Bestseller",
    blurb:"A weather machine, a courtyard, and a woman who repairs things by listening to them.",
    about:[
      "In a district where the sky has been municipal property for three generations, the machine in the courtyard begins to cough. Yara is not the first engineer they call, but she is the first who sits down and listens before opening anything.",
      "El-Amin's debut novel is patient, funny and quietly devastating about inheritance — of machines, of grudges, of weather."
    ],
    chapter:{ title:"One · The Woman Who Repaired Weather", paras:[
      "The machine had been coughing for a week before Yara agreed to look at it, and by then half the district had stopped pretending the sky was an accident.",
      "It sat in the courtyard the way old machines do — patiently, and slightly too large for the space that had been left for it. Brass where brass had been affordable, painted tin where it had not. Somebody's grandmother had scratched her initials into the housing plate, and somebody's grandson had polished around them rather than over them.",
      "“It doesn't want rain,” said the boy who had been sent to fetch her. He said it with total confidence, the way children report the moods of objects.",
      "Yara set her bag down and listened. That was the whole of her method, though nobody paid her for listening; they paid her for the part afterwards, the part with the tools. A machine tells you what it needs in the first minute and then spends the next hour repeating itself more loudly. The trick is to be there for the first minute.",
      "Above the courtyard the clouds were doing something they had not been designed to do."
    ]},
    contents:["The Woman Who Repaired Weather","Housing Plate","What the Grandmother Wrote","Dry Season","The Committee for Clear Skies","Brass","A Loud Hour","The Second Machine","Inheritance","Rain, Eventually"]
  },
  {
    id:"notes-on-not-knowing", title:"Notes on Not Knowing", author:"P. Vasquez",
    cat:"Philosophy", pages:168, price:8, year:2024, rating:4.4, reviews:158,
    c:["#7A7D7D","#33313b"], art:"grid", featured:true,
    blurb:"On the difference between ignorance and the deliberate, useful blank.",
    about:[
      "Most of what we call thinking is retrieval: a question arrives, we open the drawer, and out comes the nearest previously-formed opinion, still warm. Vasquez calls this serviceable and occasionally correct, and declines to call it thinking.",
      "A short book with an unpleasant exercise at the end of every chapter."
    ],
    chapter:{ title:"One · In Praise of the Blank", paras:[
      "Not knowing has a bad reputation, largely earned in rooms where somebody was about to be graded.",
      "But there is a difference between ignorance and the blank. Ignorance is not knowing and not noticing. The blank is the deliberate, uncomfortable act of holding a question open past the moment your mind offers you a serviceable answer — because the serviceable answer is almost always the last one you heard, wearing your own voice.",
      "Most of what we call thinking is retrieval. You are handed a question, you reach into the drawer, and you produce the nearest previously-formed opinion, still warm. This is efficient and it is occasionally correct, and it is not thinking.",
      "The exercise I want to propose is small and unpleasant. Take one question you believe you have settled. Say aloud what you believe. Then say: and I could be wrong about that, and mean it for a full breath. Most people cannot. That breath is the whole subject of this book."
    ]},
    contents:["In Praise of the Blank","The Drawer","Serviceable Answers","On Being Talked Out Of Things","The Full Breath","Disagreement as Equipment","What Certainty Costs","Closing the Question"]
  },
  {
    id:"a-field-guide-to-doubt", title:"A Field Guide to Doubt", author:"Marta Lindqvist",
    cat:"Field guides", pages:240, price:12, year:2025, rating:4.7, reviews:196,
    c:["#8fcfc0","#3f7f74"], art:"peaks", featured:true,
    blurb:"Arranged by habitat rather than taxonomy, because that is how you meet them.",
    about:[
      "Doubts, like birds, are easiest to identify by behaviour rather than plumage. Lindqvist catalogues thirty-one species, from the Common Hesitation to the entirely useless Late Doubt, with notes on habitat, call and season.",
      "Illustrated throughout, and organised so you can find the thing that is bothering you at 3am without reading the whole book."
    ],
    chapter:{ title:"One · How to Identify a Doubt in the Wild", paras:[
      "Doubts, like birds, are easiest to identify by behaviour rather than plumage.",
      "The Common Hesitation is the one you will meet first. It is small, grey, and arrives on the threshold of any decision that costs money. It is not dangerous. It is, in fact, useful — it is the mind checking its pockets before leaving the house.",
      "Far rarer is the Late Doubt, which appears only after the thing is done and cannot be undone. It has no practical function whatsoever, which is why so much of our energy is spent feeding it.",
      "Learning the difference is not a matter of intelligence. It is a matter of patience and field time: sitting still long enough that the doubt forgets you are watching it and begins to behave normally. This guide is arranged by habitat rather than taxonomy, because that is how you will actually encounter them — at work, at 3am, at the table with people you love."
    ]},
    contents:["How to Identify a Doubt in the Wild","Habitat: The Desk","Habitat: The Small Hours","Habitat: The Table","The Common Hesitation","The Late Doubt","Seasonal Species","Calls and Songs","Feeding","When Not to Intervene"]
  },
  {
    id:"everything-is-a-draft", title:"Everything Is a Draft", author:"Kenji Aoyama",
    cat:"Design", pages:190, price:10, year:2024, rating:4.5, reviews:263,
    c:["#BDBDBD","#6f6f72"], art:"burst", featured:true,
    blurb:"The most expensive lie in this profession is the word final.",
    about:[
      "A working designer's argument that nothing is ever finished — it is only shipped, and shipping is a budget decision rather than a state of grace.",
      "Practical, occasionally rude, and full of the sort of advice that only sounds obvious after somebody has said it."
    ],
    chapter:{ title:"One · Nothing Is Finished, Some Things Are Shipped", paras:[
      "The most expensive lie in this profession is the word final. It appears in file names — ‘final’, ‘final2’, ‘final-actual-final’ — and every one of those names is a small monument to somebody's optimism.",
      "A thing is not finished when it stops changing. It is finished when the cost of changing it exceeds what the change would buy you. That is a budget, not a state of grace, and it should be spoken about in those terms.",
      "This reframing does more than soothe. It tells you what to do next. If nothing is final, then the question is never “is it good” — an unanswerable, morale-shaped question — but “what is the cheapest change that would make it noticeably better,” which is a question with an actual answer and usually a short one.",
      "Everything in this book follows from that: the drafts, the reviews, the arguments about type size that are never really about type size."
    ]},
    contents:["Nothing Is Finished","The Cheapest Change","Reviews That Work","Arguments About Type Size","Taste, Briefly","Shipping as a Budget","The Second Version","Leaving It Alone"]
  },
  {
    id:"small-hours", title:"Small Hours", author:"Rune Petrov",
    cat:"Poetry", pages:96, price:7, year:2025, rating:4.3, reviews:88,
    c:["#b3a4d6","#4d3f70"], art:"moon",
    blurb:"Eleven poems written between two and five, which is a warning about the tone.",
    about:[
      "Three in the morning is not a time, it is a place, and everyone there has arrived by a different road. Petrov's second collection maps that place: fridges, streetlamps, the argument for order made badly and kept up all night.",
      "Short, and best read in one sitting — preferably not at three in the morning."
    ],
    chapter:{ title:"One · Small Hours", paras:[
      "Three in the morning is not a time. It is a place, and everyone there has arrived by a different road.",
      "the fridge hums two notes / and the second one is a lie / that the first one forgives //",
      "There are eleven poems in this section and all of them were written between two and five, which is not a boast — it is a warning about the tone.",
      "the street repeats itself / lamp, gap, lamp, gap, lamp — / the argument for order / made badly, and kept up all night //",
      "You are meant to read these slowly, and preferably not at three in the morning, though I know exactly how that instruction will be received."
    ]},
    contents:["Small Hours","Fridge, Two Notes","Lamp, Gap, Lamp","Nobody Is Awake On Purpose","Four","The Road You Took","Morning, Reluctantly"]
  },
  {
    id:"the-quiet-corner", title:"The Quiet Corner", author:"Curious Mind",
    cat:"Anthology", pages:340, price:14, year:2026, rating:4.9, reviews:74,
    c:["#f0bf9e","#bb7150"], art:"orbit", badge:"New",
    blurb:"The house anthology: everything that survived being read twice.",
    about:[
      "Every year we ask the same question of everything we read: does it still move, six months later, without the mood you were in when you found it? Most books do not survive that question.",
      "This is not a best-of. It is a room we furnished slowly, where the pieces do not match and the mismatch is the point."
    ],
    chapter:{ title:"One · A Quiet Corner", paras:[
      "This collection began as a shelf and refused to stay one.",
      "Every year we ask the same question of everything we read: does it still move, six months later, without the mood you were in when you found it? Most books do not survive that question. Nothing here failed it.",
      "What follows is not a best-of. It is closer to a room we furnished slowly, where the pieces do not match and the mismatch is the point — an essay on attention sitting next to a poem about a fridge, because on some nights those are the same subject.",
      "Read it in any order. Skip anything. That is the whole permission structure of this book, and honestly of the shop that made it."
    ]},
    contents:["A Quiet Corner","Twenty-One Pieces","Notes on the Selection","Where These Came From"]
  },
  {
    id:"the-cartographers-apology", title:"The Cartographer's Apology", author:"Selin Aydın",
    cat:"Fiction", pages:276, price:11, year:2024, rating:4.5, reviews:187,
    c:["#8aa9c9","#3d5a7a"], art:"tide",
    blurb:"He drew the coast wrong on purpose. Forty years later, the coast agreed.",
    about:[
      "A mapmaker introduces one deliberate error into an official survey — a bay that does not exist — and spends the rest of his life watching the world quietly rearrange itself to accommodate it.",
      "A novel about the authority of documents, and what happens to a lie that is useful enough."
    ],
    chapter:{ title:"One · The Bay That Wasn't", paras:[
      "The error was small enough to be a slip of the hand and deliberate enough to have taken him an afternoon.",
      "On the survey of 1961 there is a bay on the northern coast, roughly nine kilometres east of the lighthouse, shaped a little like a comma. There is no bay. There has never been a bay. There is a straight and unremarkable stretch of shingle that has been straight and unremarkable since before anyone thought to write it down.",
      "He never explained it, and by the time anyone thought to ask, explaining had become impossible: the fishing co-operative had been named after the bay, then a bus stop, then a school. A place does not need to exist in order to be somewhere people are from.",
      "What follows is not a defence. He did not think he had done anything requiring one, which is the part his daughter could never forgive."
    ]},
    contents:["The Bay That Wasn't","Survey of 1961","The Co-operative","A Bus Stop","His Daughter","Nine Kilometres East","Corrections","The Apology"]
  },
  {
    id:"against-efficiency", title:"Against Efficiency", author:"Tomas Brandt",
    cat:"Essays", pages:198, price:9, year:2025, rating:4.2, reviews:141,
    c:["#7c6aa3","#3f3459"], art:"ladder",
    blurb:"Every hour you save has to go somewhere. Brandt asks where.",
    about:[
      "A sceptical tour of the optimisation industry, from the stopwatch to the productivity app, arguing that efficiency is not a value but a transfer — time moved from one place to another, usually upward.",
      "Bracing, well-sourced and unexpectedly warm about the people it disagrees with."
    ],
    chapter:{ title:"One · Where the Saved Hour Goes", paras:[
      "Nobody has ever saved an hour. Hours cannot be stored. What we call saving is always moving: an hour taken out of one activity and put into another, and the interesting question — the only question, really — is who chose the destination.",
      "The stopwatch arrived in the workshop long before it arrived in the home, and it arrived carrying an argument: that the time between motions was waste. It is worth sitting with how strange that idea is. The time between motions is also where you notice things.",
      "I want to be careful here, because there is a lazy version of this argument that ends in a kind of decorative slowness — the expensive candle version of resistance. That is not what I mean, and the people who need this argument least are the ones who will find it most charming.",
      "This book is about who gets to decide where your saved hour lands. Everything else is bookkeeping."
    ]},
    contents:["Where the Saved Hour Goes","The Stopwatch in the Workshop","The Stopwatch in the Kitchen","Slack","Decorative Slowness","The Optimisation Industry","Who Chooses","A Modest Inefficiency"]
  },
  {
    id:"how-to-sit-still", title:"How to Sit Still", author:"Amara Okonkwo",
    cat:"Field guides", pages:152, price:8, year:2026, rating:4.6, reviews:119,
    c:["#e9a8b6","#a5546a"], art:"rings", badge:"New",
    blurb:"A practical book, with no incense in it whatsoever.",
    about:[
      "Okonkwo is a physiotherapist, not a monk, and this is a book about the body's objections to stillness — the itch at four minutes, the fidget at seven, the sudden urgent memory at eleven.",
      "Practical, secular and full of things you can test in the next ten minutes."
    ],
    chapter:{ title:"One · The Itch at Four Minutes", paras:[
      "Sit down, do nothing, and time it. Somewhere around the fourth minute something will itch. It is almost never a real itch.",
      "The body has a small repertoire of objections it raises when you stop giving it instructions, and it raises them in a reliable order. Four minutes: the itch. Seven: the fidget, usually a foot. Eleven: a memory of something you have not done, delivered with tremendous urgency and no useful detail.",
      "None of this is a failure of character. It is a nervous system checking whether the silence is dangerous, and it will keep checking until it has enough evidence to stand down. Your job is not to win the argument. Your job is to be boring enough that the argument stops being interesting.",
      "We will build up to ten minutes. Not because ten is magic, but because the twelfth minute — where the interesting part lives — is not reachable from a standing start."
    ]},
    contents:["The Itch at Four Minutes","What the Body Is Asking","Seven: The Fidget","Eleven: The Urgent Memory","Being Boring on Purpose","Ten Minutes","Where to Sit","Afterwards"]
  },
  {
    id:"the-weight-of-small-decisions", title:"The Weight of Small Decisions", author:"Jonas Reiter",
    cat:"Philosophy", pages:224, price:10, year:2024, rating:4.4, reviews:167,
    c:["#8f9bb3","#40485c"], art:"dots",
    blurb:"The large decisions were made for you by four hundred small ones.",
    about:[
      "Reiter's claim is that we misplace our moral attention: we agonise over the handful of decisions that feel weighty and sleepwalk through the hundreds that actually compose a life.",
      "Clear, unhurried, and quietly demanding."
    ],
    chapter:{ title:"One · The Four Hundred", paras:[
      "You will make somewhere around four hundred decisions today, and you will experience perhaps two of them as decisions.",
      "The two will feel heavy. You will turn them over, seek counsel, possibly lose sleep. The other three hundred and ninety-eight will pass as reflex: what you looked at, what you didn't, whose message you answered first, how long you gave someone before you stopped listening.",
      "My claim is not that the small ones matter more. It is that the large ones are usually already decided by the time they arrive, and what decided them was the accumulated shape of the small ones. By the time a decision feels weighty, you are mostly ratifying.",
      "This is either good news or extremely bad news, depending on how you feel about the last six months."
    ]},
    contents:["The Four Hundred","Reflex","Ratifying","The Shape of Six Months","Attention as Ethics","Small Repairs","What Is Actually Choosable","Beginning Again on a Tuesday"]
  },
  {
    id:"marginalia", title:"Marginalia", author:"Various hands",
    cat:"Anthology", pages:288, price:13, year:2025, rating:4.7, reviews:96,
    c:["#c9a8d6","#6b4c85"], art:"arc",
    blurb:"What forty readers wrote in the margins, collected with permission.",
    about:[
      "For two years we asked readers to send us photographs of their marked-up pages. This is what came back: arguments with dead authors, shopping lists, one marriage proposal, and a great deal of underlining.",
      "A strange, moving portrait of what reading actually looks like when nobody is watching."
    ],
    chapter:{ title:"One · In the Margins", paras:[
      "The first submission was a photograph of a page with a single word written beside the seventh line: “no.”",
      "No context, no signature, no indication of what had provoked it. We printed it and pinned it to the wall, and over the following two years it was joined by four hundred others — arguments with dead authors, shopping lists, dates, one marriage proposal written across the endpapers of a book about soil.",
      "Marginalia is the only writing most people do without an audience in mind, which makes it the most honest writing there is. It is also, almost always, embarrassing. Everyone who gave us permission asked at least once whether they could take it back.",
      "Nobody did."
    ]},
    contents:["In the Margins","“no.”","Arguments With the Dead","Shopping Lists","Dates and Weather","The Proposal","Underlining","Permission"]
  }
];

/* Currencies — indicative demo rates against USD. */
var CURRENCIES = {
  USD:{sym:"$",  rate:1,     name:"US Dollar",       after:false, dec:2},
  EUR:{sym:"€", rate:0.92, name:"Euro",         after:false, dec:2},
  GBP:{sym:"£", rate:0.79, name:"British Pound",after:false, dec:2},
  CAD:{sym:"CA$",rate:1.36,  name:"Canadian Dollar", after:false, dec:2},
  AUD:{sym:"A$", rate:1.51,  name:"Australian Dollar",after:false,dec:2},
  AED:{sym:"AED",rate:3.67,  name:"UAE Dirham",      after:true,  dec:2},
  SAR:{sym:"SAR",rate:3.75,  name:"Saudi Riyal",     after:true,  dec:2},
  INR:{sym:"₹", rate:83.2,name:"Indian Rupee",  after:false, dec:0},
  JPY:{sym:"¥", rate:151, name:"Japanese Yen",  after:false, dec:0},
  BRL:{sym:"R$", rate:5.42,  name:"Brazilian Real",  after:false, dec:2}
};

/* Country → default currency + VAT rate applied to digital goods (demo values). */
var COUNTRIES = [
  {c:"AE",n:"United Arab Emirates",cur:"AED",vat:.05},
  {c:"AR",n:"Argentina",cur:"USD",vat:.21},
  {c:"AU",n:"Australia",cur:"AUD",vat:.10},
  {c:"AT",n:"Austria",cur:"EUR",vat:.20},
  {c:"BE",n:"Belgium",cur:"EUR",vat:.21},
  {c:"BR",n:"Brazil",cur:"BRL",vat:0},
  {c:"CA",n:"Canada",cur:"CAD",vat:.05},
  {c:"CL",n:"Chile",cur:"USD",vat:.19},
  {c:"CN",n:"China",cur:"USD",vat:.06},
  {c:"CO",n:"Colombia",cur:"USD",vat:.19},
  {c:"HR",n:"Croatia",cur:"EUR",vat:.25},
  {c:"CY",n:"Cyprus",cur:"EUR",vat:.19},
  {c:"CZ",n:"Czechia",cur:"EUR",vat:.21},
  {c:"DK",n:"Denmark",cur:"EUR",vat:.25},
  {c:"EG",n:"Egypt",cur:"USD",vat:.14},
  {c:"EE",n:"Estonia",cur:"EUR",vat:.22},
  {c:"FI",n:"Finland",cur:"EUR",vat:.24},
  {c:"FR",n:"France",cur:"EUR",vat:.20},
  {c:"DE",n:"Germany",cur:"EUR",vat:.19},
  {c:"GR",n:"Greece",cur:"EUR",vat:.24},
  {c:"HK",n:"Hong Kong SAR",cur:"USD",vat:0},
  {c:"HU",n:"Hungary",cur:"EUR",vat:.27},
  {c:"IS",n:"Iceland",cur:"EUR",vat:.24},
  {c:"IN",n:"India",cur:"INR",vat:.18},
  {c:"ID",n:"Indonesia",cur:"USD",vat:.11},
  {c:"IE",n:"Ireland",cur:"EUR",vat:.23},
  {c:"IL",n:"Israel",cur:"USD",vat:.17},
  {c:"IT",n:"Italy",cur:"EUR",vat:.22},
  {c:"JP",n:"Japan",cur:"JPY",vat:.10},
  {c:"JO",n:"Jordan",cur:"USD",vat:.16},
  {c:"KE",n:"Kenya",cur:"USD",vat:.16},
  {c:"KW",n:"Kuwait",cur:"USD",vat:0},
  {c:"LV",n:"Latvia",cur:"EUR",vat:.21},
  {c:"LB",n:"Lebanon",cur:"USD",vat:.11},
  {c:"LT",n:"Lithuania",cur:"EUR",vat:.21},
  {c:"LU",n:"Luxembourg",cur:"EUR",vat:.17},
  {c:"MY",n:"Malaysia",cur:"USD",vat:.06},
  {c:"MT",n:"Malta",cur:"EUR",vat:.18},
  {c:"MX",n:"Mexico",cur:"USD",vat:.16},
  {c:"MA",n:"Morocco",cur:"USD",vat:.20},
  {c:"NL",n:"Netherlands",cur:"EUR",vat:.21},
  {c:"NZ",n:"New Zealand",cur:"AUD",vat:.15},
  {c:"NG",n:"Nigeria",cur:"USD",vat:.075},
  {c:"NO",n:"Norway",cur:"EUR",vat:.25},
  {c:"OM",n:"Oman",cur:"USD",vat:.05},
  {c:"PK",n:"Pakistan",cur:"USD",vat:.16},
  {c:"PE",n:"Peru",cur:"USD",vat:.18},
  {c:"PH",n:"Philippines",cur:"USD",vat:.12},
  {c:"PL",n:"Poland",cur:"EUR",vat:.23},
  {c:"PT",n:"Portugal",cur:"EUR",vat:.23},
  {c:"QA",n:"Qatar",cur:"USD",vat:0},
  {c:"RO",n:"Romania",cur:"EUR",vat:.19},
  {c:"SA",n:"Saudi Arabia",cur:"SAR",vat:.15},
  {c:"RS",n:"Serbia",cur:"EUR",vat:.20},
  {c:"SG",n:"Singapore",cur:"USD",vat:.09},
  {c:"SK",n:"Slovakia",cur:"EUR",vat:.20},
  {c:"SI",n:"Slovenia",cur:"EUR",vat:.22},
  {c:"ZA",n:"South Africa",cur:"USD",vat:.15},
  {c:"KR",n:"South Korea",cur:"USD",vat:.10},
  {c:"ES",n:"Spain",cur:"EUR",vat:.21},
  {c:"SE",n:"Sweden",cur:"EUR",vat:.25},
  {c:"CH",n:"Switzerland",cur:"EUR",vat:.081},
  {c:"TW",n:"Taiwan",cur:"USD",vat:.05},
  {c:"TH",n:"Thailand",cur:"USD",vat:.07},
  {c:"TR",n:"Türkiye",cur:"EUR",vat:.20},
  {c:"UA",n:"Ukraine",cur:"EUR",vat:.20},
  {c:"GB",n:"United Kingdom",cur:"GBP",vat:.20},
  {c:"US",n:"United States",cur:"USD",vat:0},
  {c:"UY",n:"Uruguay",cur:"USD",vat:.22},
  {c:"VN",n:"Vietnam",cur:"USD",vat:.10}
];

/* Promo codes (demo). */
var PROMOS = {
  "SLOWREAD":{off:.15, label:"15% off"},
  "MARGINALIA":{off:.20, label:"20% off"},
  "FIRSTSHELF":{off:.10, label:"10% off"}
};
