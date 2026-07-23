import React, { useState, useEffect } from "react";

/* ============================================================
   SURVIVE 3 DAYS IN ANCIENT ROME — playable prototype
   Rome, August 117 AD. Trajan is dying in Cilicia.
   Hidden flags. Delayed deaths. Every death is a history lesson.
   ============================================================ */

// ---------- content helpers ----------
const R = (text, verum, next, set = [], clear = []) => ({ text, verum, next, set, clear });
const DEATH = (cause, text, verum) => ({ death: true, cause, text, verum });

// ============================================================
// SCENE GRAPH
// Scene: { day, time, place, text|fn, choices|fn, enter?(flags)->redirect }
// Choice: { label, result | resolve(flags)->result, lockedIf?(flags)->string }
// ============================================================
const SCENES = {
  // ==================== SENATOR ====================
  sen_d1_am: {
    day: 1, time: "MANE", place: "YOUR ATRIUM, ESQUILINE HILL",
    text: "The salutatio. Forty clients crowd your atrium for the morning greeting, each wanting a favor, a coin, a word. One — a freedman with courier friends at Ostia — leans close. 'Trajan is dead at Selinus,' he whispers. 'Hadrian named heir on the deathbed. No one in Rome knows yet.' It is unconfirmed. It may be a trap. It may be the most valuable sentence you will ever hear.",
    choices: [
      { label: "Raise a cup before your clients and toast 'the Emperor Hadrian.'",
        result: R("Forty men hear you name a new emperor while the old one may yet live. Some cheer. Two exchange glances and slip out early. If the rumor is false, you have just committed treason before witnesses.",
          "Prematurely hailing a successor while an emperor lived could be prosecuted as maiestas — treason against the imperial majesty. Under bad emperors, maiestas trials fed on exactly such witnessed words.",
          "sen_d1_pm", ["toasted"]) },
      { label: "Say nothing. Hand out the sportula and dismiss them early.",
        result: R("You press the small coin basket into each hand and clear the atrium before the whisper can spread further under your roof. The freedman leaves looking wounded — he brought you gold and you paid him bronze.",
          "The sportula, a daily handout of coins or food, was the glue of the patron-client system. A patron's reputation lived or died on how he treated the men who crowded his door at dawn.",
          "sen_d1_pm") },
      { label: "Write privately to Attianus, the Praetorian Prefect, pledging loyalty to Hadrian.",
        result: R("You seal the letter with your ring and hand it to a trusted slave. But every letter in Rome travels through hands, and wax seals can be lifted with a hot knife. Somewhere between your desk and the Castra Praetoria, your words now exist outside your control.",
          "Acilius Attianus, Praetorian Prefect and Hadrian's former guardian, managed the succession from Rome. Letters were routinely intercepted; Romans wrote sensitive things in allusion, or not at all.",
          "sen_d1_pm", ["letter_out"]) },
    ],
  },
  sen_d1_pm: {
    day: 1, time: "VESPERE", place: "THE FORUM, THEN HOME",
    text: "An invitation arrives on fine papyrus: dinner tonight at the house of an ally of Lusius Quietus — the Moorish general, twice consul, hero of the Parthian war, and the man Hadrian most fears. The dining couches of Rome are where factions are built. Refusing has a price. Attending has a bigger one.",
    choices: [
      { label: "Attend. Recline, eat, and say absolutely nothing.",
        result: R("The talk over the boar and the Falernian is careful, then less careful. 'The army loves Quietus,' someone says. 'Adoptions made on deathbeds can be examined.' You study your wine. But you are here, on this couch, and couches are remembered.",
          "Roman conspiracies were built at dinner parties, and prosecutions were built on guest lists. Being present when treason was spoken — even silently — could be enough for a delator to work with.",
          "sen_d1_night_dinner", ["seen_at_dinner"]) },
      { label: "Attend, and murmur that the army's opinion deserves weight.",
        result: R("Heads turn. Your host smiles and refills your cup himself. You have said nothing illegal — merely that legions have opinions. In this room, tonight, it was enough. You are one of them now, whether you meant it or not.",
          "Within a year of Trajan's death, four ex-consuls — including Lusius Quietus — were executed for alleged conspiracy against Hadrian. The Senate never forgave Hadrian for it. The men's actual guilt is still debated.",
          "sen_d1_night_dinner", ["conspirator", "seen_at_dinner"]) },
      { label: "Decline, pleading a sudden fever. Send your smoothest slave with the excuse.",
        result: R("Your slave delivers the apology with a convincing description of your chills. You dine alone on eggs and cabbage, a healthy man pretending to sweat. It is the coward's move. Cowards are alive in surprising numbers.",
          "Feigned illness was Rome's all-purpose social escape hatch. Under Domitian's terror, senators had perfected the art of being too sick to attend anything that could later be prosecuted.",
          "sen_d1_night_home") },
    ],
  },
  sen_d1_night_dinner: {
    day: 1, time: "NOX", place: "THE DINING COUCH",
    text: "The final course. Your host — Quietus's man — proposes a toast 'to loyalty' and watches you over the rim of his cup. Your wine arrives poured separately from the krater everyone else shares. You lift it. Under the honey and spice there is a faint, wrong bitterness, like almonds left too long.",
    choices: [
      { label: "Drink. To hesitate is to insult your host before the whole room.",
        result: DEATH("POISONED AT DINNER",
          "You drink. Courtesy first — that was always your rule. The burning starts in your throat before the cup is back on the table. Your limbs go distant. The room's conversation continues politely around you as you slide from the couch. Your host does not look over. He already knows what he will tell the vigiles: a weak heart, too much wine.",
          "Poison was the Roman elite's quiet weapon — aconite and hemlock left few marks a Roman physician could prove. Emperors employed professional tasters; the job existed because it was needed. Your host was testing whether you could be controlled. Dead men cannot testify about tonight's guest list.") },
      { label: "Refuse it openly and ask for wine from the shared krater.",
        result: R("A beat of silence. Your host's smile does not move but something behind it closes. 'Of course,' he says, and has the krater brought. You have survived the cup and made an enemy who now knows you suspect him — and suspicious men who leave his house alive are loose ends.",
          "Sharing wine from a common mixing bowl, the krater, was the norm at Roman dinners — which is exactly why a separately poured cup was a red flag any careful guest watched for.",
          "sen_d2_am", ["host_enemy"]) },
      { label: "Let your sleeve catch the cup as you gesture. A clumsy accident.",
        result: R("The wine spreads across the mosaic like a stain of blood. You apologize too much, laugh at yourself, accept a fresh cup poured — you make sure of it — from the common krater. Your host watches the spilled wine being mopped and says, pleasantly, 'No omen intended, I hope.' You survive on manners.",
          "Spilled wine was read as an omen, which made a 'clumsy' spill a socially survivable way to refuse a cup. Roman dining etiquette had escape hatches, and the long-lived knew them all.",
          "sen_d2_am") },
    ],
  },
  sen_d1_night_home: {
    day: 1, time: "NOX", place: "YOUR STUDY",
    text: "You are reading Pliny by lamplight when a client arrives breathless at your door. He was serving at tonight's dinner — the one you declined. 'They spoke your name,' he says. 'Someone said the fever was convenient. Someone else said you could be counted on regardless.' Your absence has been enrolled as attendance.",
    choices: [
      { label: "Write a letter tonight to a friendly consular, denying any connection.",
        result: R("You write it carefully — too carefully. A denial of a thing not yet publicly alleged is itself a kind of confession that you knew. You seal it anyway and send it into the dark, one more piece of you now traveling through other men's hands.",
          "Roman letters were dictated, copied by slaves, carried by hand, and kept for decades. Cicero's private correspondence survived to be published; senators of this era wrote knowing every line might one day be read aloud in a courtroom.",
          "sen_d2_am", ["letter_out"]) },
      { label: "Do nothing. A denial dignifies the association.",
        result: R("You send the client home with a coin and go to bed. In the dark you rehearse the sentence you may need: 'I was ill; ask my household.' Sleep comes late. But nothing written tonight can be twisted tomorrow.",
          "The safest words in Rome were the ones never spoken. Tacitus, who lived through Domitian's terror, made silence itself a theme — survival as the art of being unquotable.",
          "sen_d2_am") },
      { label: "Go to the dinner now, late, to see for yourself who is there.",
        result: R("You arrive as the couches are emptying, claiming your fever broke. You see who is there — and they see you, freshly recovered, arriving under torchlight at a gathering you will later wish had no witnesses. Curiosity is now on the guest list.",
          "Arrivals and departures at Roman houses happened in public view — torchbearers, litter slaves, doorkeepers. Half the city's intelligence network was simply people watching doorways.",
          "sen_d2_am", ["seen_at_dinner"]) },
    ],
  },
  sen_d2_am: {
    day: 2, time: "MANE", place: "THE BASILICA JULIA",
    text: "A man falls into step beside you under the arcade — oiled hair, senator's smile, no senator's ring. A delator: a professional informer who eats what the treason courts kill. 'Sad days coming,' he says. 'Lists being made. Your name could appear on the accusing side of one — or the other side. A gift of twenty thousand sesterces would clarify my memory of where I've seen you.'",
    choices: [
      { label: "Pay him. Twenty thousand sesterces buys a lot of forgetting.",
        result: R("The sum nearly empties your strongbox — and paying an informer once is an invitation, not a settlement. But he will not come back within three days, and three days is the length of your problem. He bows like an old friend and is gone.",
          "Delatores — freelance accusers — were paid a quarter of a convicted man's estate under Roman law, which made accusation itself a profitable industry. Successful ones grew rich; hated ones were occasionally thrown to the arena by new emperors seeking popularity.",
          "sen_d2_pm", ["broke"]) },
      { label: "Refuse. You will not be milked by a courtroom parasite.",
        result: R("'A man of principle,' he says, with real delight, as if you have handed him something better than money. 'They convict so well.' He melts into the arcade crowd. You have made an enemy whose entire profession is the destruction of men like you.",
          "The best defense against a delator was to be unprosecutable — no letters, no witnessed words, no couch at the wrong dinner. Principle without a clean record was, in the treason courts, merely material.",
          "sen_d2_pm", ["delator_enemy"]) },
      { label: "Threaten to denounce HIM — informers have enemies too.",
        resolve: (f) => f.has("letter_out")
          ? R("He laughs — and quotes your own letter back to you, word for word, including the phrase you regretted as you sealed it. Someone in the chain of hands sold him a copy. 'Denounce me,' he says, 'and this reaches the Prefect with my annotations.' You walk away with your threat hanging dead in the air, and your letter alive in his strongbox.",
              "Intercepted correspondence was standard evidence in Roman treason trials. A letter's wording, stripped of context and read by a hostile voice in court, convicted men who had written only careful ambiguities.",
              "sen_d2_pm", ["conspirator"])
          : R("You name two men he ruined and one praetor who would enjoy his file. His smile thins. Informers survive by choosing soft targets, and you have just priced yourself out of the category. He tips his head — professional respect — and goes to find easier meat.",
              "Delatores were universally loathed and periodically purged; Titus had them whipped and expelled from Italy. An informer's own survival depended on never accusing someone with the standing to accuse back.",
              "sen_d2_pm") },
    ],
  },
  sen_d2_pm: {
    day: 2, time: "VESPERE", place: "THE FORUM ROMANUM",
    text: "It breaks at the ninth hour. Couriers from Brundisium, official seals: TRAJAN IS DEAD. HADRIAN, ADOPTED SON, IMPERATOR. The Forum becomes a single organism — grief for the old emperor, calculation about the new one, and everywhere the question no one asks aloud: adopted when, exactly? Witnessed by whom? Crowds are forming to acclaim Hadrian. Being seen — or not seen — is now a political act.",
    choices: [
      { label: "Join the acclamation loudly, in the open, where all Rome can witness.",
        result: R("You cheer until your throat burns, in the front rank, where senators and spies alike can mark you. If you toasted Hadrian yesterday, today makes it prescience instead of treason. Loyalty, publicly performed, is the cheapest armor in Rome.",
          "Public acclamation was constitutional machinery, not mere noise: emperors were formally hailed by soldiers, Senate, and people. Absence from the right acclamation was noticed and recorded.",
          "sen_d2_night", [], ["toasted"]) },
      { label: "Call on Quietus's ally — face to face — to say you want no part of any faction.",
        result: R("He receives you in the same room as last night's couches. 'Of course,' he says warmly. 'No part. None of us wants any part.' You leave certain he understood — and certain that his doorkeeper, his torchboys, and whoever watches his street have now logged your second visit in two days to the most dangerous address in Rome.",
          "Roman surveillance was ambient: doorkeepers, slaves, neighbors, and the frumentarii — soldier-couriers who doubled as the emperor's eyes. Visiting a suspect house to proclaim innocence created exactly the record it meant to erase.",
          "sen_d2_night", ["seen_at_dinner"]) },
      { label: "Go home, bar the door, and let history happen without your face in it.",
        result: R("You spend the evening of the succession behind your own walls, listening to the roar from the Forum rise and fall like surf. Invisible men are not acclaimed — but they are not counted among the doubters either. It is a wager on being forgettable.",
          "For most of the Senate, regime change was survived precisely this way: attend nothing, sign nothing, wait. Pliny's letters show senators who outlived three emperors by being reliably, deliberately unremarkable.",
          "sen_d2_night") },
    ],
  },
  sen_d2_night: {
    day: 2, time: "NOX", place: "YOUR STUDY",
    text: "The city outside is torchlight and shouting. On your desk: every letter you have kept — drafts, replies, years of careful and less-careful words. Tomorrow the Senate sits under a new emperor whose men will be reading rooms exactly like this one. Every politician in Rome is performing the same midnight arithmetic over the same brazier.",
    choices: [
      { label: "Burn everything. Ash testifies for no one.",
        result: R("You feed years of correspondence to the brazier and watch your own handwriting curl and vanish. Whatever your letters could have proven — guilt or innocence — they now prove nothing. You are, on papyrus at least, a man without a past.",
          "Burning papers before a purge was a Roman ritual. When Nero fell, and again after Domitian, the smell of burning papyrus reportedly hung over the better neighborhoods of Rome for days.",
          "sen_d3_senate", ["papers_burned"], ["letter_out"]) },
      { label: "Hide them beneath the floor of the household shrine.",
        result: R("You pry up the stone before the lararium and seal your past beneath the household gods. If men come searching, they may not violate the shrine. May not. You replace the stone and notice your hands are not quite steady.",
          "The lararium, the household shrine, held real protective force — but Praetorian searches under nervous emperors respected very little. Hidden documents that survived became evidence; the hiding itself became proof of guilty knowledge.",
          "sen_d3_senate", ["kept_letters"]) },
      { label: "Keep them at hand. Letters can convict other men too — leverage is armor.",
        result: R("You sort them instead of burning them: which lines implicate whom, which friendships can be converted to shields. It is a dangerous inventory. A man holding evidence against others is holding evidence — full stop — and everyone at those dinners knows you have it.",
          "Mutual incrimination was the Senate's balance of terror: everyone had dined with everyone. But in an actual purge, holding leverage made you a priority target — the first arrests were of men who knew things.",
          "sen_d3_senate", ["kept_letters"]) },
    ],
  },
  sen_d3_senate: {
    day: 3, time: "MANE", place: "THE CURIA JULIA",
    enter: (f) => {
      if (f.has("conspirator")) return "sen_death_purge";
      if (f.has("delator_enemy") && f.has("kept_letters")) return "sen_death_denounced";
      return null;
    },
    text: (f) => "The Senate sits to confirm Hadrian. Praetorians line the walls — an honor guard, officially. The delator you met yesterday sits in the gallery with a writing tablet." +
      (f.has("delator_enemy") ? " He finds your face and holds it, then — finding nothing in his files worth spending on you, because you left him nothing on papyrus — moves his gaze to richer prey." : "") +
      " The consul calls for expressions of loyalty. Senators rise one by one. Your turn comes. The room waits.",
    choices: [
      { label: "Praise Hadrian: his adoption, his wisdom, the army's love for him.",
        result: R("You give the new reign exactly what new reigns require: warm, specific, forgettable praise. Somewhere behind you a stylus scratches your name into the record on the correct side of history. You sit down alive.",
          "The Senate confirmed Hadrian's powers while he was still in Syria; he did not reach Rome for nearly a year. The Senate's formal acclamations were recorded verbatim — being quotably loyal was a survival skill.",
          "sen_survive") },
      { label: "Rise and deliver a long, loving eulogy of Trajan — the greatest of emperors.",
        result: DEATH("CONDEMNED FOR THE WRONG EULOGY",
          "You speak of Trajan's conquests, his justice, his refusal to execute senators — and you feel the room's temperature drop as every careful man hears what your grief is saying: that the dead emperor was better than the living one, that deathbed adoptions witnessed by a wife and a prefect deserve examination. The Praetorians at the wall are no longer decorative. You are invited to withdraw, then invited to a smaller room, and the questions there do not stop for three days, after which, formally regretted by the Senate, you do.",
          "Under the emperors, praise of the past became a recognized form of dissent — Tacitus wrote that even biographies of dead republicans were burned as treasonous. Mourning Trajan too loudly in August 117 was heard, correctly, as questioning Hadrian's succession.") },
      { label: "When your turn comes, bow deeply and yield your time in reverent silence.",
        result: R("You rise, bow toward the imperial chair that Hadrian will not sit in for months, and yield. Silence, delivered with enough reverence, reads as being overcome by the moment. No stylus can transcribe what you did not say. You sit down alive.",
          "Senatorial silence was an art form with a vocabulary of its own — Tacitus built his history of the era around it. Under the Empire, the unquotable senator was the senator who died of old age.",
          "sen_survive") },
    ],
  },
  sen_death_purge: {
    death: true, cause: "EXECUTED IN THE SUCCESSION PURGE",
    text: "You never reach your seat. Two Praetorians step from the wall as you enter the Curia — courteous, immovable — and walk you to a room where a prefect's freedman reads aloud, in a bored voice, the words you spoke on a dining couch two nights ago: the army's opinion deserves weight. There were three informers on those couches. There always are. The sentence is confirmed by the Senate you served, which is the point of making the Senate confirm it.",
    verum: "In 118 AD, four ex-consuls — Lusius Quietus, Avidius Nigrinus, Cornelius Palma, and Publilius Celsus — were executed for allegedly plotting against Hadrian, on the Senate's own order. Hadrian swore he had not commanded it and spent his reign shadowed by the Senate's hatred anyway. Dinner-party words, reported by informers, were the standard raw material of such cases.",
  },
  sen_death_denounced: {
    death: true, cause: "CONVICTED BY YOUR OWN LETTERS",
    text: "The delator rises in the gallery before the loyalty vote and asks the consuls' indulgence: he has evidence touching the security of the new emperor. The Praetorians who search your house are efficient; the ones who pry up the shrine stone are apologetic about it. Your letters are read aloud in the Curia by a man who pauses meaningfully at every ambiguity you ever wrote. Ambiguity, read aloud by an enemy, is confession. The estate is confiscated; the informer's quarter-share makes him rich.",
    verum: "Roman law awarded a successful accuser one quarter of the condemned's estate, making delation a career. Documents were the treason court's favorite evidence: a letter's tone could not defend itself, and 'guilty knowledge' could be inferred from the mere act of hiding papers.",
  },
  sen_survive: {
    survive: true,
    text: (f) => "Dawn, the fourth day. The city smells of incense and horse sweat; couriers gallop for Syria with the Senate's decree. You are alive — " +
      (f.has("broke") ? "poorer by an informer's fee, " : "") +
      (f.has("host_enemy") ? "owed a grudge by a man who poisons wine, " : "") +
      "and you have learned the great lesson of senatorial life: in a succession, the winners are not the brave or the brilliant. They are the unquotable.",
    verum: "Hadrian ruled for twenty-one years. The senators who flourished under him were, almost without exception, the ones invisible in the sources for August 117 — the men who attended nothing, signed nothing, and praised precisely on cue.",
  },

  // ==================== MERCHANT ====================
  mer_d1_am: {
    day: 1, time: "MANE", place: "THE EMPORIUM DOCKS, BELOW THE AVENTINE",
    text: "Your grain ship from Alexandria is four days overdue. Every day late, the whispers get cheaper: storm off Crete, they say. Your rival Norbanus finds you on the dock, sympathetic as a knife. 'Terrible, the sea. I'll take your share of the cargo off your hands — sight unseen, forty percent of contract price. Cash today.' Behind him, a moneylender's clerk waits his turn like a second symptom.",
    choices: [
      { label: "Sell to Norbanus. Forty percent of something beats all of nothing.",
        result: R("You take his coin and his condolences, both slightly damp. It is real money in a bad week — but it is less than half your stake, and if that ship rounds the breakwater tomorrow, you will watch Norbanus unload your fortune with your own eyes.",
          "Maritime trade was Rome's great gamble: a single grain run from Alexandria could double an investment or vanish entirely. Buying distressed cargo shares from nervous merchants was its own predatory profession on the Ostia docks.",
          "mer_d1_pm", ["sold_cargo"]) },
      { label: "Hold. Ships are late more often than they are lost.",
        result: R("You send Norbanus off with dockside courtesies and spend an hour watching the horizon like every ruined merchant in every cautionary tale. The odds genuinely favor you. That is what odds are for — favoring men right up until they don't.",
          "Ancient ships hugged coasts and waited out weather; a four-day delay usually meant a harbor, not a wreck. But there was no insurance in the modern sense and no news faster than the ship itself.",
          "mer_d1_pm", ["holding"]) },
      { label: "Borrow against the cargo from the moneylender's clerk. Trade on, full strength.",
        result: R("The clerk writes the contract with terrifying speed: principal plus interest that makes your teeth ache, secured on a cargo currently located somewhere between here and Egypt. You leave with a heavy purse and a heavier signature. In this city, debt has employees.",
          "Roman maritime loans (fenus nauticum) legally ran to extraordinary rates because the lender ate the sea-risk — but dockside lenders blurred the lines, and Roman debt collection was private, muscular, and largely beyond the law's interest.",
          "mer_d1_pm", ["in_debt", "holding"]) },
    ],
  },
  mer_d1_pm: {
    day: 1, time: "VESPERE", place: "THE VICUS TUSCUS",
    text: "The day's trading leaves your purse heavy — and heaviness, after dark, is a symptom with one cure. The argentarii on the Vicus Tuscus are still at their tables, changing money and taking deposits for a fee. Your warehouse has a loose flagstone only you know. Or there is the oldest bank in the world: your own belt, under your own hand.",
    choices: [
      { label: "Deposit with the argentarii and take a receipt.",
        result: R("The banker weighs, bites, counts, and writes you a receipt in a hand like marching soldiers. The fee stings. Walking home with papyrus instead of silver, you notice how much lighter the night feels when you are not worth killing.",
          "Roman argentarii took deposits, changed currency, and honored written orders — recognizable banking. Receipts and account books from exactly this era survive; the fee bought what it still buys: not being the man carrying the money.",
          "mer_d1_night", ["banked"]) },
      { label: "Hide it under the warehouse flagstone. Free, and no banker's fee.",
        result: R("You work the stone up by lamplight, nest the purse beneath it, and sweep dust across the seams. Perfectly safe — provided no one ever watches a warehouse at night, follows a merchant's routine, or knows what loose stones sound like underfoot. You sleep on top of your fortune either way.",
          "Coin hoards under floors are among archaeology's most common Roman finds — which is itself the grim joke: every excavated hoard is a hiding place that worked and an owner who never came back for it.",
          "mer_d1_night", ["hidden_coin"]) },
      { label: "Carry it. Money within reach is money that works.",
        result: R("The belt sits snug against your ribs, and every transaction tomorrow is one reach away. You tell yourself you walk no differently. Men who watch docks for a living can price the contents of a stranger's belt from thirty feet in bad light.",
          "Juvenal, writing in this decade, catalogued the fates of Romans out after dark and reserved a special dry pity for anyone worth robbing. Street crime was ubiquitous and investigation of it essentially nonexistent.",
          "mer_d1_night", ["carrying_coin"]) },
    ],
  },
  mer_d1_night: {
    day: 1, time: "NOX", place: "CHOOSING A ROOF",
    text: "Night, and Rome's second city wakes — the delivery carts banned by day now thunder through the dark. You need a roof. A fourth-floor room in a Subura insula costs two asses and smells of everyone who ever slept there. The inn by the Forum Boarium costs twenty and locks its doors. Or there is your own warehouse: free, familiar, and full of things other people want.",
    choices: [
      { label: "The insula room. Two asses. You've slept in worse.",
        result: R("Four flights up a staircase you can feel flexing, into a room where the wall shows daylight at the seams — or would, if there were daylight. Below you: a cookshop, two families, a lamp-maker, and everyone's charcoal braziers. You sleep the sleep of a man saving eighteen asses.",
          "Most of Rome's million people lived in insulae — timber-framed apartment blocks, often shoddily built and chronically on fire. The higher the floor, the cheaper the rent and the longer the escape. Juvenal: the last man to burn is the one under the roof tiles.",
          "mer_d2_fire", ["in_insula"]) },
      { label: "The inn. Twenty asses buys walls of actual stone and a door that bars.",
        lockedIf: (f) => f.has("in_debt") ? "The moneylender's contract emptied your ready coin — the innkeeper does not take promises." : null,
        result: R("Stone walls, a bar on the door, a stable-boy who will wake you at dawn. It costs what a laborer earns in two days, and you pay it the way rich men pay for things that keep them boring: gladly.",
          "Roman inns (cauponae) had rough reputations — Cicero's letters treat them as dens of thieves — but a barred private room in a stone building was genuine security by insula standards. Safety, then as now, was a thing the poor could not buy.",
          "mer_d2_inn", ["at_inn"]) },
      { label: "The warehouse cot, among your own amphorae. Free.",
        result: R("You string the cot between an oil shipment and the grain sacks, with a boat-hook in reach and the harbor's noise for a lullaby. Everything you own is within twenty feet of you. That thought is comfortable right up until you wake to hear that someone else has done the same arithmetic.",
          "Ostia and Rome's warehouses (horrea) were prime targets for organized theft; the larger ones hired their own night watchmen and the imperial ones were garrisoned. A merchant alone with his stock was his own security.",
          "mer_d2_thieves", ["in_warehouse"]) },
    ],
  },
  mer_d2_fire: {
    day: 2, time: "ANTE LUCEM", place: "THE INSULA, FOURTH FLOOR",
    text: "You wake choking. Smoke — thick, greasy, boiling up through the floorboards from the cookshop below. Screaming on the stairs already. The staircase is the only way down and the glow through your doorway says the second floor is already alight. The window shows forty feet of dark and cobbles. You have seconds and one working thought.",
    choices: [
      { label: "The stairs. Now. Through the smoke before the flames own them.",
        result: R("You take the stairs blind, one hand on the wall, through heat like an open oven door, and burst into the street with your eyebrows crisped and your lungs full of knives. Behind you the staircase becomes a chimney. The insula burns to its bones in an hour while the vigiles work the neighboring roofs — saving the block, not the building.",
          "The vigiles — Rome's 7,000-man fire brigade — fought fires mainly by demolishing buildings around them to make firebreaks. For anyone above the second floor, survival came down to beating the fire to the stairs. There were no ladders that reached, and no other way down.",
          "mer_d2_flood", ["lost_lodgings"]) },
      { label: "The window. Forty feet, but the fall is survivable — the fire is not.",
        result: DEATH("KILLED IN A FALL FROM THE FOURTH FLOOR",
          "You hang from the sill to shorten the drop, the way you once saw a sailor do from a yardarm, and let go. The sailor was falling into water. The cobbles of the Subura are older than the Republic and exactly as forgiving. The vigiles find you before dawn and add you to the night's tally — one of the quiet majority of fire deaths that never touched a flame.",
          "Juvenal's third Satire runs the black joke in real time: smoke rising, the man under the tiles still asleep, and the choice between burning and jumping. Falls from upper stories — during fires and without them — were a leading killer in a city stacked four and five wooden floors high.") },
      { label: "Wake the neighbors first — the family with children is one floor down.",
        result: DEATH("KILLED IN THE COLLAPSE OF A BURNING INSULA",
          "You take the stairs down one flight and hammer on their door, shouting fire in three languages. You hear the children waking as the floor beneath you lets go — cheap timber, overloaded, twenty years past its builder's conscience — and drops you into the burning cookshop with the building following you down. The family gets out through the noise you made. That will have to do.",
          "Insulae were speculative builds — Crassus made a fortune buying burning and collapsing ones — and structural failure during fires killed rescuers routinely. Roman moralists praised exactly this death and Roman builders kept making it available.") },
    ],
  },
  mer_d2_thieves: {
    day: 2, time: "ANTE LUCEM", place: "YOUR WAREHOUSE",
    text: "You wake to the sound of your own stock moving. Two shapes between the amphorae, working by shuttered lantern — quiet, practiced, unhurried. Dock men, by the shoulders on them. They have not seen the cot. The boat-hook is in your hand before you are fully awake, which is exactly the problem: what the hand wants to do next.",
    choices: [
      { label: "Lie still. Stock can be replaced.",
        resolve: (f) => f.has("hidden_coin")
          ? R("You watch through slitted eyes as they clear two racks of oil — and then one of them stops, taps his heel on the floor, and works up the loose flagstone as if he set it there himself. Your purse leaves in his shirt. They were watching the warehouse when you hid it. You keep your life and lose the rest, in the correct order.",
              "Warehouse theft in Ostia and Rome was organized labor — dockworkers, watchmen, and receivers in efficient chains. Hiding places were only as secret as the walls around them, and warehouses have many eyes.",
              "mer_d2_flood", ["broke"], ["hidden_coin"])
          : R("You lie still as stone while they clear two racks of oil amphorae and fade out the way they came. It is a genuine loss and it stings. It is also, you reflect in the settling dark, the cheapest price on tonight's menu.",
              "Rome had no public prosecution of theft — recovering stolen goods was the victim's private problem. Merchants wrote off 'shrinkage' to organized dock gangs as a cost of trade, and the smart ones never interrupted it in person.",
              "mer_d2_flood") },
      { label: "Rise with the boat-hook. It is YOUR stock, and you have reach on them.",
        result: DEATH("KILLED DEFENDING YOUR OWN WAREHOUSE",
          "You come up off the cot with the hook swinging and catch the first one across the shoulder — and the second one, who has done this before, comes in under your reach with eight inches of dock knife. You learn in your last minute that reach only matters for the first blow, and that men who rob warehouses at night plan for the owner. They finish loading before they leave. Professionals.",
          "Roman law permitted killing a night thief — but the law said nothing about surviving the attempt. With no police response and no consequences likely either way, confrontation was a pure test of violence, and dock gangs were better at it than merchants.") },
      { label: "Shout 'FIRE! FIRE IN THE HORREA!' at the top of your lungs.",
        result: R("Nothing empties Roman streets into motion like that word. Shutters bang open, someone takes up the cry, and a vigiles whistle answers from two streets over. Your visitors evaporate mid-lift, leaving an amphora rocking on the floor. Fire is the one emergency this city takes seriously — you have just borrowed its entire nervous system for free.",
          "Fear of fire was Rome's one universal civic reflex — the vigiles responded to alarms with real speed because a warehouse fire could take twenty blocks. False alarm was an offense; being alive to be fined for it was the point.",
          "mer_d2_flood") },
    ],
  },
  mer_d2_inn: {
    day: 2, time: "ANTE LUCEM", place: "THE INN BY THE FORUM BOARIUM",
    text: "Shouting in the street wakes you. From the inn's upper gallery you see it: an orange glow over the Subura, sparks lifting like a second sky of wrong stars. An insula is burning — maybe the one you almost slept in. The bucket chains are forming. A wall of that height, burning, can come down across half a street.",
    choices: [
      { label: "Run to help. Every pair of hands matters on a chain.",
        result: DEATH("CRUSHED BY A COLLAPSING WALL AT A FIRE",
          "You take a place on the chain, passing water toward heat you can feel from fifty feet. The vigiles are shouting something — you understand it one second too late, when the insula's street wall, burned through at the second floor, folds outward across the bucket line. Four floors of brick and timber. The men at the chain's far end survive to dig. You are not at the far end.",
          "The vigiles' own casualty problem was collapse, not flame — burning insulae shed walls without warning, and their standard tactic was demolition at a distance with hooks and catapults for exactly this reason. Volunteer helpers who crowded close were killed at Roman fires with grim regularity.") },
      { label: "Watch the wind from the gallery. If it turns this way, wake the inn.",
        result: R("You stand watch like a ship's officer, reading the sparks. The wind holds west; the fire eats its block and starves at the firebreak the vigiles cut. You go back to bed having contributed exactly nothing, which is sometimes what survival looks like.",
          "Fire behavior was practical knowledge every Roman city-dweller carried: wind direction, spark fall, which districts burned fastest. Nero's fire of 64 AD had shown what happened when the wind won; the city had rebuilt with wider streets partly to change those odds.",
          "mer_d2_flood") },
      { label: "Go back to bed. You paid twenty asses precisely so tonight would not be your problem.",
        result: R("You listen to the distant roar for a while, note that it is distant, and sleep. In the morning the Subura smells of wet char and someone else's ruin. Rome's oldest survival principle: the disaster you paid to be elsewhere for is a purchase, not a sin.",
          "Fires were so routine in Rome that Juvenal listed them alongside falling roof tiles and chamber pots emptied from windows as ordinary hazards of the city — the ambient price of living in a million-person wooden anthill.",
          "mer_d2_flood") },
    ],
  },
  mer_d2_flood: {
    day: 2, time: "MANE", place: "THE EMPORIUM DISTRICT",
    text: "Morning brings a brown sky upriver and older dockmen frowning at the water. The Tiber is rising — the wharf steps lose a course of stone every hour. Your ground-floor grain and goods will rot in an hour of floodwater. Porters are charging triple and getting it. Your back is one man's back. The river does not negotiate.",
    choices: [
      { label: "Pay the porters triple. Everything to the upper floor by noon.",
        lockedIf: (f) => (f.has("broke") ? "Your coin is gone — the porters laugh at credit on a flood morning." : (f.has("in_debt") ? "Everything you have is spoken for by the moneylender's contract. Porters take coin, not stories." : null)),
        result: R("The porters work like the professionals triple pay makes of them, and by noon your stock sits a floor above the river's reach. You watch the Tiber take the wharf street with your hands empty and your goods dry. Expensive. Correct.",
          "Tiber floods drowned Rome's low districts every few years — Tacitus and Pliny both record catastrophic ones. Grain was the flood's favorite victim: wet grain heats, molds, and can even combust, which is why Rome's great horrea were built with raised floors.",
          "mer_d2_pm") },
      { label: "Move it yourself. Every sack, every amphora, one back, all day.",
        result: R("You carry until your hands stop closing properly and then you carry more, up the same stairs, hour after hour, racing a river. By dusk it is done and you are a wrung rag with a wrenched shoulder and a tremor in your legs that will not stop. The stock is safe. The body has taken out its own loan.",
          "A standard Roman grain sack ran to about 28 kilograms and professional saccarii moved them all day as a trade with its own guild. One man doing a porter crew's work in a day was the kind of exertion period medical writers blamed for fevers, ruptures, and sudden collapse.",
          "mer_d2_pm", ["exhausted"]) },
      { label: "Risk it. The river has bluffed before.",
        result: R("The river was not bluffing. By the eighth hour there is a foot of brown water across your floor and your grain is drinking it. What the flood does not take outright, the mold will. You stand in your doorway doing arithmetic that keeps arriving at the same sum: you now owe more than you own.",
          "Flooded grain was a total loss — mold toxins made it unsellable even to fraudsters with standards. Uninsured single-owner losses to flood and fire were the standard route by which Roman merchants fell out of the trade, and into debt they could not service.",
          "mer_d2_pm", ["in_debt", "broke"]) },
    ],
  },
  mer_d2_pm: {
    day: 2, time: "VESPERE", place: "THE DOCKS",
    enter: (f) => (f.has("holding") ? null : "mer_d2_pm_sold"),
    text: "A shout runs down the wharf ahead of her: your ship. The Isis Pelagia rounds the bend low in the water and tired, four days of storm-shelter at Puteoli behind her. Then the master meets your eye from the rail, and you know before he says it: seawater in the hold. Perhaps half the grain is spoiled — bilge-soaked, salt-bitter, sprouting.",
    choices: [
      { label: "Accept it, sell the sound half fast, and thank Neptune for half.",
        resolve: (f) => f.has("in_debt")
          ? R("The sound grain sells briskly — Rome always buys — and by lamplight you count out the moneylender's principal and his tooth-aching interest, and clear the contract with a margin thin as papyrus. You are free, unrich, and alive to trade tomorrow. In this business, that is called a good year.",
              "Half-cargoes and salvage sales were routine outcomes of ancient shipping. Clearing a maritime loan after a bad voyage — rather than defaulting into a collector's hands — was the difference between a hard season and a broken life.",
              "mer_d3_settle", [], ["in_debt"])
          : R("The sound grain sells by nightfall — this city inhales wheat — and the spoiled half goes to a pig-feed man for an insult of a price you take anyway. You end the day poorer than your hopes and richer than your fears, which is the grain trade in one sentence.",
              "Rome consumed perhaps 200,000 tonnes of imported grain a year, much of it from Egypt. A merchant's half-spoiled cargo still found buyers within hours — the city's appetite was the one constant in a business made of weather.",
              "mer_d3_settle") },
      { label: "Sue the shipmaster. The law of carriage exists for exactly this.",
        result: R("The master shrugs you toward the law with the serenity of a man who has been sued in four provinces. A jurist takes your retainer and explains, at length, the difference between sea-peril and negligence, and how many months it takes to prove one is the other. Your grain rots while your case ripens. Your coin is now papyrus.",
          "Roman commercial law was sophisticated — carriage liability, general average, the lot — and Roman litigation was slow, expensive, and public. Merchants mostly settled on the dock; the courts were where working capital went to hibernate.",
          "mer_d3_settle", ["broke"]) },
      { label: "Blend the spoiled grain into the sound at one part in four. Sell it all to the dole contractor.",
        result: R("Mixed carefully, chalk-dusted to dry the look of it, the whole cargo passes the contractor's sleepy inspection and you are paid in full — better than full. It is the easiest money of your career. The contractor supplies the grain dole. The dole is inspected, eventually, by men who work for the Prefect of the Annona, and adulterated imperial grain is not a private dispute.",
          "Grain fraud against the annona — Rome's public dole — was among the most seriously policed commercial crimes in the empire, because bread riots toppled governments. Inspectors existed, informers were rewarded, and contractors caught passing bad grain did not protect their suppliers.",
          "mer_d3_settle", ["fraud"]) },
    ],
  },
  mer_d2_pm_sold: {
    day: 2, time: "VESPERE", place: "THE DOCKS",
    text: "A shout runs down the wharf: the Isis Pelagia, four days late, storm-sheltered at Puteoli and heavy with grain — half of it spoiled by bilge water, the dock talk says, but half of a full hold is still a fortune. Norbanus stands at the gangway supervising the unloading of what was yours, wearing the smile of a man whose condolences have appreciated. He sees you watching and has the grace to nod.",
    choices: [
      { label: "Congratulate him to his face. The docks should see you take it standing.",
        result: R("You shake his hand and admire his luck loudly enough for the wharf to hear, and something shifts in how the dock men look at you — a merchant who can lose like that is a merchant whose word survives his purse. Norbanus, discomfited by grace, offers you first refusal on his next syndicate. It costs him nothing. Someday it may not.",
          "Reputation was a Roman merchant's working capital — trade ran on partnerships, credit, and syndicated cargo shares among men who had to trust each other across sea lanes. How a man bore a loss was commercial information, and everyone was watching.",
          "mer_d3_settle") },
      { label: "Offer to broker his sale for a commission. You know the buyers; he knows it.",
        result: R("Norbanus, who would rather pay you than the brokers he'd have to find, takes the deal on the spot. You spend the evening selling your own former grain for another man's profit and a real commission — swallowing exactly as much pride as the coin weighs. It weighs enough.",
          "Middlemen and brokers were thick on the Roman docks — access to buyers was itself a sellable asset. Merchants moved fluidly between owning cargo, brokering it, and financing it, as capital and luck allowed.",
          "mer_d3_settle") },
      { label: "Spread word that the 'sound' half is bilge-tainted too. Let his fortune sour.",
        result: R("A word to two talkative buyers and a doubt is born, toddling down the wharf by noon. Norbanus's price sags — and then his answer arrives: he opens random sacks in public, lets buyers chew the grain, and asks, loudly, who profits from the lie. Heads turn toward you. On these docks, everyone trades again tomorrow, and today has been noted.",
          "Commercial slander in a face-to-face market was a boomerang — Roman merchants operated in tight, permanent communities where information about information was tracked. A trader caught poisoning the well found his own credit quietly repriced.",
          "mer_d3_settle", ["dock_enemy"]) },
    ],
  },
  mer_d3_settle: {
    day: 3, time: "MANE", place: "YOUR WAREHOUSE DOOR",
    enter: (f) => {
      if (f.has("fraud")) return "mer_d3_fraud";
      if (f.has("in_debt")) return "mer_d3_collector";
      return null;
    },
    text: "The river is falling, the city is drying, and the ledger says today is settlement day: three buyers across Rome owe you payment, and the largest — a builder on the far side of the Subura — pays only today, only in person, only until dusk. The money you collect today is the difference between a season and a struggle. The route is the whole question.",
    choices: [
      { label: "The long way round by the river and the fora. Safe streets, slow miles.",
        result: R("You take the wide, patrolled, daylight streets, collecting as you go — and the miles eat the day exactly as feared. You reach the builder's district at dusk with his payment still uncollected and a decision waiting for you in the failing light.",
          "Rome's main fora and processional streets were relatively safe by day — crowded, watched, occasionally patrolled. The city's danger was concentrated in when and where: after dark, off the main routes, in the poor districts. Time and geography were the actual security system.",
          "mer_d3_night") },
      { label: "Straight through the Subura at midday. Fast, crowded, and done by dusk.",
        result: R("The Subura by day is loud, close, and mostly harmless — the pickpockets are professionals with no interest in scenes. You collect all three payments with the sun still up, your purse now genuinely heavy, and only the walk home between you and a good season.",
          "The Subura — Rome's dense, poor, notorious central district — was by day simply where most Romans lived and shopped; Julius Caesar grew up there. Its evil reputation was a nighttime reputation. Timing, not avoidance, was how working Romans used their own city.",
          "mer_d3_night", ["carrying_coin"]) },
      { label: "Hire a local boy as guide and send word ahead to each buyer to have coin ready.",
        result: R("The boy costs a sestertius and is worth ten — he knows which alleys connect and which merely look like they do, and your advance word means no waiting at any door. You finish the circuit by the ninth hour, purse heavy, daylight to spare, and one small local now invested in your continued existence.",
          "Local knowledge was a real commodity in a city of a million with no street signs and no maps for sale. Hiring neighborhood guides, messengers, and errand boys was ordinary practice — Rome ran on an informal economy of small paid favors.",
          "mer_d3_night", ["carrying_coin"]) },
    ],
  },
  mer_d3_collector: {
    day: 3, time: "MANE", place: "YOUR WAREHOUSE DOOR",
    text: "They arrive with the working day: the moneylender's freedman, ledger under his arm, flanked by two Thracians whose knuckles are their letters of introduction. 'The contract matures today,' the freedman says pleasantly, finding your name with his finger. 'Principal and interest. The good news is that my principal prefers money to unpleasantness. The other news is that he does accept unpleasantness.'",
    choices: [
      { label: "Pay in full. Whatever it empties.",
        lockedIf: (f) => f.has("broke") ? "You have nothing left to pay with. The freedman's finger stays on your name." : null,
        result: R("You count it out to the last sestertius while the Thracians watch with the mild disappointment of men paid to be unnecessary. The freedman writes PERSOLVIT beside your name and even bows. You are stripped nearly clean, and cleanly free — no lien, no muscle, no tomorrow-problem. It cost everything except the things that matter.",
          "Roman debt enforcement began with courts but ran, in practice, on private muscle and social ruin. A debtor who paid on the day kept the one asset the trade could not replace: the standing to borrow again.",
          "mer_d3_night", ["broke"], ["in_debt"]) },
      { label: "Offer surety and swear payment in ten days. Negotiate like the merchant you are.",
        result: R("The freedman hears your terms with genuine professional courtesy, agrees to ten days — and then nods to the shorter Thracian, who takes your left hand in a grip like a dock winch and removes your smallest finger with a knife and no malice whatsoever. 'Surety,' the freedman explains, wrapping it in cloth for you, 'and a reminder. Ten days.' The pain arrives a heartbeat after the disbelief.",
          "Extra-legal debt collection in Rome ran on exemplary violence — the law's slow remedies coexisted with a faster private system. Physicians like Galen treated its results without recording its causes. An untreated wound in a city without antisepsis now became its own creditor.",
          "mer_d3_night_wounded", ["wound_untreated", "broke"], ["in_debt"]) },
      { label: "Refuse. This is Rome — there are laws, courts, praetors.",
        result: DEATH("BEATEN TO DEATH BY A MONEYLENDER'S COLLECTORS",
          "You cite the praetor's edict. The freedman sighs like a man watching weather arrive and steps outside to check the street while the Thracians teach you the difference between the law of Rome and the physics of Rome. They are careful at first — damaged debtors can sometimes still pay — and then, as you keep shouting about courts, less careful. The freedman notes the outcome in his ledger under a heading that has its own column.",
          "Roman law did protect debtors from private violence — on papyrus. Enforcement required the victim to initiate action, and the urban poor and indebted knew the arithmetic: no police would come, no magistrate would act unbidden, and moneylenders' crews faced consequences approximately never.") },
    ],
  },
  mer_d3_fraud: {
    day: 3, time: "MANE", place: "YOUR WAREHOUSE DOOR",
    text: "The dole contractor is at your door before the heat, and he has not come alone: four men with the annona's badge and the calm of officials who are never wrong twice. On the cart behind them, a sack of your grain, opened. The chalk shows in the morning light like snow on plowed ground. 'Adulterated grain,' the contractor says, 'sold against the Prefect's contract. My inspectors answer to Rome. The question is what you answer with.'",
    choices: [
      { label: "Refund double and beg his discretion. Grovel like your life depends on it.",
        result: R("You empty the strongbox, the flagstone, and your dignity in that order — double the price, plus a 'consideration' for the inspectors' flexible memories. The contractor, who wants his supply chain more than your head, takes it and lets the matter die. You are ruined and breathing. In the annona trade, that is called mercy.",
          "The Prefect of the Annona commanded real investigative teeth because grain fraud threatened public order itself. In practice, first offenses with full restitution were often settled privately — contractors needed suppliers, and Roman enforcement at every level ran on negotiated discretion.",
          "mer_d3_night", ["broke"], ["fraud"]) },
      { label: "Deny everything. Chalk? Any dock in Ostia could have chalked it.",
        result: DEATH("DROWNED IN THE TIBER OVER THE DOLE GRAIN",
          "You perform outrage well — well enough that the contractor stops arguing, which you briefly mistake for winning. That night, walking home, you acquire an escort of dock men you have never met, and the conversation they invite you to happens at the river stairs. The annona's officials file no report. The Tiber files all of them the same way. The current takes the question of your guilt downstream toward Ostia, resolved.",
          "Threats to the grain dole were existential politics — emperors had fallen over bread. When formal prosecution was inconvenient, Rome's commercial world had older remedies; bodies in the Tiber were common enough that fishing them out was a recognized, unenviable trade.") },
      { label: "Flee the city tonight. Puteoli has docks and no one who knows your face.",
        result: R("You are on a hired mule before the ninth hour with what fits in two panniers, your warehouse abandoned to your creditors and your name abandoned to the annona's files. Puteoli will take a man who knows grain and asks no questions loudly. It is not death. It is everything short of it.",
          "Flight was Rome's great unwritten remedy — the empire was vast, records were local, and ports absorbed men with pasts. Debtors and small criminals vanished into provincial cities constantly, trading everything they had built for the one asset that traveled: their skills.",
          "mer_survive_fled") },
    ],
  },
  mer_d3_night: {
    day: 3, time: "NOX", place: "THE STREETS OF THE SUBURA",
    enter: (f) => (f.has("wound_untreated") ? "mer_d3_night_wounded" : null),
    text: (f) => "Dusk goes to dark between one street and the next, and Rome changes owners. The lamps of the cookshops gutter out; the delivery carts begin their thunder; and you are " + (f.has("carrying_coin") || !f.has("broke") ? "carrying everything the day earned" : "carrying little but your skin, which you would also prefer to keep") + ", with the width of the Subura between you and your own door. Torch-boys and hired blades loiter at the crossroads shrine, for a price.",
    choices: [
      { label: "Hire two torchbearers and a bodyguard for the crossing.",
        lockedIf: (f) => f.has("broke") ? "You cannot pay them. The link-boys look through you like glass." : null,
        result: R("Light and muscle, the two commodities the night sells. Your little convoy moves through the dark streets like a lit ship, and the shapes in the doorways stay shapes in doorways — the whole transaction of the Roman night conducted correctly: you paid to be expensive to rob. Your own bar drops behind you. Day four is an hour of sleep away.",
          "Wealthy Romans never walked at night unescorted — torchbearers, slaves, and hired guards were standard. Juvenal's mugging victim is precisely the man of middling means: too poor for an escort, too prosperous to be worthless. Safety after dark was a purchased good.",
          "mer_survive") },
      { label: "Walk it alone, fast and dark. You know these streets.",
        resolve: (f) => (f.has("carrying_coin") || !f.has("broke"))
          ? DEATH("STABBED FOR YOUR PURSE IN THE SUBURA",
              "You move quick and quiet, hugging the walls, and you are three streets from home when the man ahead of you stops being a drunk and the doorway behind you empties. It is brief and almost businesslike. They take the belt, the purse, the cloak, and the sandals, and leave the rest of you in the gutter for the carts to find. Around you the insulae sleep on; a scream in the Subura at night is weather.",
              "Juvenal, writing within a few years of this night, joked that only a fool went out to dinner in Rome without first making his will. The city of a million had no street lighting and no night patrol against crime — the vigiles fought fires. Bodies found at dawn were the ordinary price of the dark.")
          : R("You move quick and quiet, and the shapes in the doorways read you correctly: a man with nothing, walking like a man with nothing. Poverty, tonight, is the disguise that works. You reach your door unrobbed because you were not worth the trouble — the one mercy this city extends reliably.",
              "The Roman night's predation was economically rational — link-boys, taverners, and robbers all worked the same information: who was carrying. Juvenal's satire pities the man with a purse; the man without one walked through the same streets in a kind of invisibility.",
              "mer_survive") },
      { label: "Sleep in the doorway of the crossroads shrine until dawn. Lose the night; keep the man.",
        result: R("You fold yourself into the shrine's doorway among the offerings and the other prudent cowards, and pass the night cold, cramped, and continuous. The builder's contract needed you home tonight; it will be angry, and it will be negotiable, because you will be alive to negotiate it. Dawn finds you stiff, solvent, and breathing.",
          "Crossroads shrines (compita) were the Roman street's sacred furniture, and their thresholds offered a sliver of customary protection. Choosing a lost contract over a night crossing was the working merchant's real calculus — the sources are full of men who did not.",
          "mer_survive") },
    ],
  },
  mer_d3_night_wounded: {
    day: 3, time: "NOX", place: "A COOKSHOP BENCH, THE SUBURA'S EDGE",
    text: "By nightfall the hand has its own heartbeat. The wrapping is soaked through, the flesh around the wound is hot and shining, and a red line has begun its quiet journey up the wrist. You know what the line means — every dock man does. Across the street, a retired army surgeon keeps a shop, lamp still lit. The Temple of Aesculapius is an island away. Your bed is nearer than either.",
    choices: [
      { label: "The army surgeon. Whatever he says must come off, comes off.",
        result: R("The surgeon looks at the red line for three seconds, names a price, and has you drink most of a jar of strong wine while his slave heats the iron. What follows you will not remember in order: the saw is quick because he has done this a hundred times in Dacia, and the cautery is worse than the saw. You wake before dawn short a finger and part of your hand, fevered, alive, and — he says, checking the line has stopped — likely to stay that way.",
          "Roman military surgeons were the empire's best trauma medics — amputation of infected limbs was established practice, done fast with dedicated saws, ligatures, and cautery, and survival rates for early amputation were genuinely decent. It was the era's one reliable answer to the red line of spreading infection.",
          "mer_survive_maimed") },
      { label: "The Temple of Aesculapius. The god heals what iron cannot.",
        result: DEATH("DEAD OF SEPSIS ON THE GOD'S ISLAND",
          "The priests are kind. They wash the hand, speak the prayers, and give you a sleeping draught so the god may visit your dreams with a cure. The god, tonight, is occupied. You dream of the river. By the second dawn the red line has reached your shoulder and the fever is a furnace with your name on it, and the priests, who have seen this many times, move you gently to the porch where such patients wait. The island receives the dying with great tenderness. It has had four hundred years of practice.",
          "The Tiber Island temple genuinely functioned as Rome's refuge for the desperately sick — but against systemic bacterial infection, the era's medicine had prayers, poultices, and one working tool: the knife, taken early. By the time the red streaks of septicemia climbed the arm, even the army's surgeons usually declined to cut.") },
      { label: "Home, wine, and sleep. Bodies mend. You have a contract at dawn.",
        result: DEATH("DEAD OF AN UNTREATED WOUND",
          "You bar your own door, drink until the hand quiets, and sleep. The fever wakes with you, moves in, and unpacks. By the second night you cannot rise; by the third the room is full of people who are not there. You die in your own bed above your own warehouse, which is more than most of this city manages — killed not by the Thracian's knife but by the four days you gave what it left behind.",
          "Before germ theory, Romans read infection's stages with hard-won accuracy — Celsus records the signs — but treatment windows were everything. Minor wounds were a leading killer of working Romans; the sources are full of men dead a week after an injury they worked through.") },
    ],
  },
  mer_survive: {
    survive: true,
    text: (f) => "Dawn, the fourth day. The Tiber is back in its bed, the Subura's char smell is fading, and you are at your own table doing what merchants do the morning after surviving: the ledger. " +
      (f.has("broke") ? "The coin column is a ruin — but the name at the top of the page is not. " : "The season stands in profit. ") +
      "Three days in this city, and it tried the fire, the river, the knife, and the contract on you. Trade, you conclude, is the practice of outliving your own luck.",
    verum: "Rome's commerce ran on men exactly like this — small and middling merchants absorbing uninsurable risk in a city that was itself the most dangerous thing they traded with. The ones who lasted were rarely the boldest; they were the ones who paid for the inn, banked the coin, and knew which nights to lose a contract.",
  },
  mer_survive_maimed: {
    survive: true,
    text: "Dawn, the fourth day, through a fever that is breaking instead of building. The bandaged hand will learn its new shape; the surgeon says men work docks with worse. In the ledger's coin column: almost nothing. In the other column, the one the trade never writes down: alive, name intact, and in possession of the era's most expensive education. You will trade again. Carefully.",
    verum: "Amputation survivors were a visible part of every Roman port and army town — the empire's medicine could not stop infection, but taken early, its surgery could outrun it. A maimed hand was a common price of working life, and the trades absorbed such men as a matter of course.",
  },
  mer_survive_fled: {
    survive: true,
    text: "Dawn, the fourth day, on the road south with the Alban hills going pink on your left. Rome is a smudge of smoke behind you, holding your warehouse, your name, and a file with the annona. Puteoli holds a harbor full of grain ships and no one who knows your face. You are alive, anonymous, and starting from your skills. In this empire, that has always been enough to start from.",
    verum: "The Roman empire's size was itself an escape mechanism — no central registry tracked ordinary people across provinces, and port cities perpetually absorbed skilled men with unexamined pasts. 'Leaving for the provinces' was the standard Roman ending for stories that could not end in Rome.",
  },

  // ==================== FARMER ====================
  far_d1_am: {
    day: 1, time: "MANE", place: "A TENANT FARM, THE ROMAN CAMPAGNA",
    text: "The wheat stands one week from ripe — the best crop in three years — and the sky over the Alban hills is building the particular bruised gray that means hail. Into this arrives Felix, your landlord's steward, on a good mule, with the ledger. The rent falls due this week. He looks at the sky, then at the wheat, then at you, and lets the arithmetic introduce itself.",
    choices: [
      { label: "Harvest now, green. A small sure crop beats a big dead one.",
        result: R("You put the sickle in a week early and take a diminished, damp-kerneled harvest that the miller will discount hard — but it will be in the barn when the sky opens. Felix watches the first swaths fall and makes a small mark in the ledger: rent forthcoming. The gray in the west keeps building.",
          "Roman agronomists — Cato, Varro, Columella — all preach the same anxious gospel: harvest timing was the tenant's biggest annual gamble, and the careful writers repeatedly advise taking a lesser sure crop over risking a storm. They wrote for landowners; tenants ran the same gamble with no reserves.",
          "far_d1_pm", ["harvested"]) },
      { label: "Wait for full ripeness. Seven days of nerve buys a third more grain.",
        result: R("You send Felix off with promises and watch the sky like a defendant watching a jury. A third more grain is the difference between paying rent with something left over and paying rent with nothing — if the week holds. The wheat whispers in a wind that is starting to smell like rain.",
          "The yield difference between green and dead-ripe wheat was substantial, and Roman tenant margins were thin enough to make the gamble rational. Hail, the campagna's late-summer specialty, could flatten and thresh a standing crop into the mud in a quarter hour.",
          "far_d1_pm", ["waiting"]) },
      { label: "Pledge the standing crop itself to Felix as this year's rent. Let the risk be shared.",
        result: R("Felix accepts the pledge with suspicious ease, writing it into the ledger in full sentences: the crop, as it stands, against the year's rent. You feel clever until you re-run the clause in your head on his mule's departing dust: if the crop fails, you have not paid the rent — you have merely promised it. The risk is not shared. It has been notarized.",
          "Pledging future crops against rent (colonia partiaria and its uglier cousins) was standard on Roman estates — and heavily lopsided. The legal sources show tenants bound to deliver regardless of yield, with crop failure converting directly into carried debt owed to the landlord.",
          "far_d1_pm", ["crop_pledged", "waiting"]) },
    ],
  },
  far_d1_pm: {
    day: 1, time: "VESPERE", place: "THE WHEAT FIELD",
    text: "Working fast in the failing light, your hand slips on a sweat-slick haft and the sickle takes its price: a deep, ugly slice across your left forearm, immediately generous with blood. It is a working wound — every farmer carries the scars of a dozen — but this one is deep enough to see into, and the light is going, and the work is not done.",
    choices: [
      { label: "Wash it with wine, pack it with honey, bind it clean. Lose the hour.",
        result: R("You do it the way your father did: sour wine sluiced through the cut until it runs clean, honey packed in, a boiled strip of linen bound tight. It costs the day's last working hour and it hurts like judgment. The bleeding stops. The arm will stiffen. It will also, most likely, heal.",
          "Wine and honey were the era's genuinely effective wound care — wine's acidity and honey's antibacterial action were real, and Celsus prescribes both. Roman farmers without physicians carried a folk protocol that modern medicine largely vindicates. The hour it cost was the actual price of survival.",
          "far_d1_night") },
      { label: "Bind it with a strip of your tunic and keep cutting. Wheat doesn't wait.",
        result: R("A field rag, a hard knot pulled with your teeth, and back to the sickle. The wound throbs in rhythm with the work and the rag goes stiff and brown, and by dark you have finished the section — and carried a day of field dirt, sweat, and chaff inside a closed cut. It aches deep. You have felt worse. That is what you tell yourself.",
          "Tetanus and wound sepsis were endemic killers of ancient farm labor — soil bacteria in a deep cut, sealed under a dirty binding, was the classic route. The sources' constant refrain of 'a small wound, then the fever' describes one of the era's most common deaths.",
          "far_d1_night", ["wound_untreated"]) },
      { label: "Walk to the Temple of Aesculapius on the Tiber Island. Do it properly.",
        result: R("Three hours' walk each way for a priest to wash the wound with vinegar and wine, dress it with skill, and speak the words over it. The dressing is genuinely the best you have ever worn. The cost is the evening and the dawn — a full working day gone from a farm in its most dangerous week, and the field half-cut behind you.",
          "The Aesculapius temple functioned as the poor's hospital, and its practical care — washing, dressing, rest — had real value quite apart from the god. But for a tenant farmer, a day's pilgrimage during harvest was a luxury priced in crop, which is why most bound their wounds in the field and worked on.",
          "far_d1_night", ["lost_day"]) },
    ],
  },
  far_d1_night: {
    day: 1, time: "NOX", place: "THE FARMHOUSE",
    text: "You are woken by your wife's voice with the flat calm that frightens you more than screaming: the youngest is burning. The boy shakes under every blanket you own, teeth chattering in the August heat, skin like a bread oven. You have seen this fever before — everyone in the campagna has. It comes off the marshes in the hot months, burns in waves a day apart, and takes children more often than it leaves them.",
    choices: [
      { label: "Cool cloths, willow-bark tea, and the vigil. Fight it with patience.",
        result: R("You and your wife trade watches through the night — cloths from the spring bucket, sips of bitter willow tea when he surfaces, your voice low and steady when the shaking peaks. Toward dawn the wave passes and he sleeps, gray but breathing. It will come back tomorrow or the day after; the waves always come back. But he is one night stronger.",
          "Tertian fever — malaria, endemic in the Roman campagna — burned in the paroxysm cycles Roman medicine described precisely without understanding. Supportive care genuinely improved survival, and willow bark (a true antipyretic) was in the folk pharmacy. DNA from Roman-era cemeteries has confirmed falciparum malaria as a mass killer of Italian children.",
          "far_d2_am") },
      { label: "Fetch the wandering healer from the crossroads inn. He has amulets, and the lancet.",
        result: R("The healer arrives smelling of wine and importance, hangs a written charm at the boy's throat, and then produces the lancet: the fever, he explains, is an excess of blood, and must be let. You hold your son's arm and watch a cup of his strength drain into a bowl, because the man with the lancet speaks with confidence and you are a farmer holding a burning child at midnight. The boy is whiter afterward. The healer calls it progress and charges accordingly.",
          "Itinerant healers worked the Roman countryside selling charms, drugs, and bloodletting — and bleeding a malarial child was actively harmful, deepening the anemia the parasite was already causing. The confident wrongness of period medicine was, for the rural poor, a paid-for hazard of its own.",
          "far_d2_am", ["child_bled", "broke"]) },
      { label: "Carry him to Rome at first light. The city has real physicians.",
        result: R("You wrap the boy and are on the road before the birds, his heat soaking through the blanket against your chest, the farm — the crop, the animals, the unbarred door — shrinking behind you in the dark. It is three hours' walk to the bridges. Whatever the storm and the world do to an empty farm today, they will do it without you.",
          "Rome had trained physicians, but for a fevered child their pharmacy held little a village vigil didn't — while an abandoned smallholding in harvest week was catastrophically vulnerable. The rural poor's impossible choices between labor and care are a constant of the agricultural sources.",
          "far_d2_am", ["gone_to_rome"]) },
    ],
  },
  far_d2_am: {
    day: 2, time: "MANE", place: "THE FIELD, UNDER A BLACK SKY",
    enter: (f) => {
      if (f.has("gone_to_rome")) return "far_d2_am_rome";
      if (f.has("harvested")) return "far_d2_am_safe";
      return null;
    },
    text: "It comes at mid-morning with almost no warning — the light goes green, the wind dies, and then the sky opens with hail like slung stones. You stand in the doorway watching the best crop in three years being threshed into the mud by the fistful. Half the field is down in the first minutes. The other half is going. Between the house and the far section, lightning has begun to walk the tree line.",
    choices: [
      { label: "Into it. Cut and carry what's still standing — every sheaf is bread.",
        result: DEATH("KILLED BY THE STORM IN YOUR OWN FIELD",
          "You work in the white roar with your head down, cutting armfuls of battered wheat, deaf and half-blind, the hail opening cuts on your scalp and shoulders. You do not hear anything different before the lightning finds the field's one walnut tree, thirty feet from your bent back. Your wife finds you when the storm passes, face-down among the sheaves you saved. Four of them. The mud takes the rest by evening.",
          "Roman agricultural writers treated storm deaths as an ordinary occupational fact — lightning, exposure, and hail injuries during salvage attempts recur in the sources, and lightning-struck ground was so familiar it had its own ritual status (bidental). The instinct to save the crop killed farmers regularly; the crop, the writers note dryly, never returned the favor.") },
      { label: "Shelter. Let it take the wheat. A crop can be regrown by a living man.",
        result: R("You stand with your family in the doorway and make yourself watch — it feels obscurely owed, witnessing the year's work die. Twenty minutes of white noise, then sun, then steam rising off a field of flattened straw and pounded grain. The loss is total and you are dry, whole, and standing in it. Somewhere the arithmetic of rent has just changed shape.",
          "A mature hailstorm could destroy a wheat crop with industrial completeness — the stones threshed grain from the ear into mud where it rotted or sprouted. For tenants, a hailed-out year converted instantly into debt; for the prudent ones, it was survived in a doorway, which the agronomists counted as wisdom.",
          "far_d2_pm", ["crop_lost"]) },
      { label: "The seed grain. Just the stored seed — drag it to the high shelf before the wet gets in.",
        result: R("You spend the storm's worst minutes not in the field but in the barn, hauling the sealed seed jars up to the dry shelf while hail hammers the roof like a legion drumming. The standing crop dies in the mud outside. The seed — next year, in clay — stays dry. When the roar stops, you have lost the harvest and saved the future, which is the oldest trade in farming.",
          "Seed corn was sacrosanct in ancient farming — Roman writers rank eating or losing the seed as the final stage of ruin, because it converted one bad year into permanent collapse. The tenant's real wealth was not the standing crop but the ability to plant again.",
          "far_d2_pm", ["crop_lost", "seed_saved"]) },
    ],
  },
  far_d2_am_safe: {
    day: 2, time: "MANE", place: "THE FARMYARD",
    text: "The storm arrives at mid-morning and finds your field already stubble — the hail hammers harmlessly on a harvest that is in the barn, green and discounted and safe. You stand in the doorway watching your neighbors' standing wheat go down along the whole valley, and feel the specific guilty lightness of a man whose caution has just been paid in full. By noon, the road past your gate has traffic: neighbors, coming to ask.",
    choices: [
      { label: "Lend grain to the worst-hit neighbors against repayment at the next harvest.",
        result: R("You measure out loans from your diminished, precious store — hard-headed ones, witnessed and marked on tally sticks, but at neighbor's terms, not a lender's. The valley notes it. In the campagna, where the towns are far and the law is farther, the neighbors you hold up in a bad year are the wall that holds you up in yours.",
          "Reciprocal lending between smallholders was the countryside's real insurance system — Roman rural life ran on webs of witnessed favor and obligation that the legal sources barely see. A farmer's standing with his neighbors was a survival asset as real as his seed corn.",
          "far_d2_pm", ["good_neighbor"]) },
      { label: "Sell to them at the storm price. Scarcity is the market speaking.",
        result: R("You sell at what the day will bear, which is triple yesterday's price, and the coin is real and heavy. So are the faces. Nothing is said — the campagna does not say things — but tally is kept out here as strictly as in any banker's ledger, and you have just been entered on a page you may not enjoy when your own bad year arrives.",
          "Profiteering from local dearth was among the countryside's deepest grievances — grain hoarding and storm-pricing recur in ancient complaints and occasionally in riots. The rural economy punished it slowly and socially: in withheld labor, withheld witnesses, and withheld help.",
          "far_d2_pm", ["storm_profiteer"]) },
      { label: "Keep every grain. Rent is due, the winter is long, and charity starts at your own table.",
        result: R("You shake your head at the gate, civilly, all day. It is defensible — Felix's rent will eat most of the barn as it is, and your children eat before anyone's — and each refusal costs a little of something you cannot weigh. The neighbors go on down the road. The valley is long. So is its memory.",
          "Subsistence margins made rural generosity genuinely dangerous — a tenant's surplus after rent could be measured in weeks of food. The sources' picture of peasant life is neither warm solidarity nor cold isolation, but a constant, calculated rationing of both.",
          "far_d2_pm") },
    ],
  },
  far_d2_am_rome: {
    day: 2, time: "MANE", place: "ROME, THEN THE ROAD HOME",
    text: "The physician near the Tiber bridges is honest, which costs extra: the fever is the marsh kind, he says; the boy is strong; cool him, feed him when the waves pass, and the rest belongs to the gods — no cutting, no bleeding. You carry your son home lighter by a fee and heavier by hope, and crest the last hill at noon to find the storm has been to the farm before you: the crop flattened into the mud, the door standing open, and stranger's bootprints in the yard mud going in — and out.",
    choices: [
      { label: "Inventory the loss calmly. Whatever is gone is gone; count what remains.",
        result: R("The thieves were quick and knowing: the coin pot from the hearth-hole, the flitch of bacon, the good iron tools. They left the seed jars — sealed clay is slow work — and the animals scattered but findable. You settle the boy, and count: crop dead, coin gone, seed alive, family alive. It is a short list. You have started over from shorter.",
          "Rural theft during absences was endemic — isolated farmsteads had no protection but presence, and the countryside's petty criminals tracked exactly who was away. The legal sources treat farm burglary as ubiquitous; the practical sources advise never leaving a holding empty, which the poor could not always obey.",
          "far_d2_pm", ["crop_lost", "broke", "seed_saved"]) },
      { label: "Follow the bootprints. They are two hours old and heavy-laden.",
        result: R("You track them a mile toward the drover's road before the prints join cart ruts and dissolve into everyone's. Standing there with your sickle and your rage and your fevered son back at the farm, the arithmetic completes itself: two or more men, laden but armed, against one exhausted farmer. You walk home having lost the goods and kept the only thing the thieves left you: yourself.",
          "There was no rural police power — pursuit of thieves was the victim's private right and private risk. The jurists' careful rules about killing thieves mattered little in practice; countryside score-settling was governed by force, and the sources are frank that lone pursuit of armed men was a way to die twice.",
          "far_d2_pm", ["crop_lost", "broke", "seed_saved"]) },
      { label: "Go to Felix the steward. The estate has riders; theft on its tenants is theft on its rents.",
        result: R("Felix hears you out with genuine attention — a robbed tenant is a rent problem — and sends two estate riders down the drover's road by mid-afternoon. They return at dusk with your iron tools, recovered from a fence at the crossroads inn, and with the coin and bacon long gone. The estate's protection is real, you note, exactly as far as the estate's interest runs. Felix makes a mark in the ledger. Everything with Felix becomes a mark in the ledger.",
          "Great estates were the countryside's actual power — landlords' men provided the protection the state didn't, and tenants traded autonomy for it. Patronage was never free: every intervention deepened the dependency that defined the colonate hardening across exactly this period.",
          "far_d2_pm", ["crop_lost", "steward_favor", "seed_saved"]) },
    ],
  },
  far_d2_pm: {
    day: 2, time: "VESPERE", place: "THE ROAD TO THE NUNDINAE",
    text: "Tomorrow is the nundinae — market day at the crossroads town — and tonight is the walk there, cart creaking, to be at a stall by dawn. What you carry decides your winter: the barn's sellable margin is thin, and the sealed seed jars sit in the cart's shadow like an answer you are not supposed to give. Coin is the one thing rent, debt, and physicians all accept.",
    choices: [
      { label: "Carry only the true surplus. The seed jars stay home on the shelf.",
        result: R("You load what the family can spare and not a jar more, and the cart rolls light. At the stall it will earn modest coin honestly, and next spring the fields will be sown whatever this winter does. It is the decision your father would have made, mostly because he did, every year, including the bad ones.",
          "The nundinae — the eight-day market cycle — was the rural economy's heartbeat, where farm surplus became the coin that paid rents and taxes. Selling only true surplus while guarding seed was subsistence farming's prime directive across the ancient world.",
          "far_d2_night") },
      { label: "Load the seed grain too. Coin now; the spring can be negotiated later.",
        result: R("The jars go on the cart, and the cart rolls heavy and profitable. Seed sells at premium — it is clean, sound, and everyone knows it — and by tomorrow you will hold more coin than this farm has seen in two years. And next spring you will stand at the edge of your own plowed fields with empty hands, buying seed at spring prices from men who know exactly how much you need it.",
          "Eating or selling the seed corn was antiquity's universal metaphor for terminal desperation because it was the real mechanism of ruin: it converted one survivable crisis into a permanent one. Spring seed prices, set by those who had it for those who didn't, completed the trap.",
          "far_d2_night", ["seed_sold"]) },
      { label: "Skip the market. Stay, mend, and keep the family close this once.",
        result: R("You spend the evening on the roof patch and the fence gap, with the boy dozing in the shade and the farm gathered close around you like a held breath. No coin comes of it. Some weeks the correct harvest is the fence, the roof, and the child getting one uninterrupted day of his father. The rent will not agree. The rent is not everything.",
          "The sources see the Roman countryside almost entirely through production — but demographers note the obvious: smallholdings survived on the constant physical maintenance and family labor the ledgers never priced. A skipped market was real lost coin and sometimes the correct investment.",
          "far_d3_am_home") },
    ],
  },
  far_d2_night: {
    day: 2, time: "NOX", place: "THE VIA APPIA, AMONG THE TOMBS",
    text: "The road runs between the tomb monuments, pale in the dark, when the torchlight ahead resolves into three men. Army cloaks, but wrong — no unit, no order, spears held like farm tools. Deserters or discharged men gone feral; the roads have grown them all summer. 'Late to be hauling,' the middle one says, pleasantly, stepping into the cart's path. 'Road toll.' The tombs watch. The nearest living help is two miles behind you.",
    choices: [
      { label: "Hand over the cart, the goods, everything. Empty hands, open face.",
        result: R("You step back from the cart and hold your hands where the torchlight finds them, and the three of them take it all with the efficiency of men who have done this weekly since spring — cart, mule, cargo, your knife, and the coin in your belt. What they do not take: interest in a farmer with nothing left. Their light bobs away south. You stand among the tombs breathing, robbed to the skin and precisely alive.",
          "Banditry was endemic on Roman roads — even the great highways near the capital — and it surged with every war's discharged and deserted soldiers. Roman advice on robbery was unanimous and unheroic: resistance converted a property crime into a killing, and the tombs lining the roads out of Rome were full of the argument's losers.",
          "far_d3_am", ["broke"]) },
      { label: "Fight. The sickle is in your hand and the first one is inside its reach.",
        result: DEATH("SPEARED BY DESERTERS ON THE VIA APPIA",
          "You are fast for a farmer, and the sickle opens the middle one's arm before his surprise ends — and then the other two do the thing you could not: they work together, one high, one low, the way the army drilled into them before the army lost them. It is over in less time than the argument took. They right the cart, calm the mule, and roll south with your winter, leaving you among the tombs with the other permanent residents of the road.",
          "The spear-armed robber bands of the Roman roads were frequently ex-military — trained, coordinated, and casually lethal against civilians. Tomb inscriptions along the roads out of Rome record the standard ending in a standard formula: interfectus a latronibus — killed by bandits. It was common enough to be a category.") },
      { label: "Abandon the road. Into the tombs and the marsh ground beyond — no cart, no light, no path.",
        resolve: (f) => R("You are over the wheel and between the monuments before the middle one finishes his sentence, and they do not follow past the second row of tombs — the cart is the prize, and the marsh dark beyond the tombs is nobody's friend. You give them the cart. The marsh gives you three hours of black water to the knee, tomb-cold and humming with the night's insects, before you strike the drover's track home." + (f.has("fevered") ? "" : " By the time your own gate looms up, you are shaking — soaked, spent, and stung a hundred times — and telling yourself it is only the cold."),
          "The marshes flanking the roads south of Rome — the Pontine country above all — were the deadliest malaria zone in Italy, and Romans knew their night air killed without knowing the mosquito was the blade. Fleeing into the marsh traded a robber's spear for a slower gamble: the fever that came ten days or two after the crossing.",
          "far_d3_am", f.has("fevered") ? ["broke"] : ["broke", "fevered"]) },
    ],
  },
  far_d3_am: {
    day: 3, time: "MANE", place: "THE FARMYARD",
    enter: (f) => (f.has("crop_pledged") && f.has("crop_lost")) ? "far_d3_reckoning" : null,
    text: (f) => "Felix's mule turns in at your gate with the sun barely up, the ledger riding before him like a standard. The storm has redrawn every tenancy in the valley and he has been at it since dawn, farm by farm. " + (f.has("crop_lost") ? "Your dead field says most of it for you. " : "Your barn, at least, holds a crop. ") + "He dismounts, finds your name, and reads out the year's rent in the flat voice stewards keep for arithmetic. The number has not changed. Numbers never do.",
    choices: [
      { label: "Pay what the barn and purse hold, and ask openly for terms on the rest.",
        resolve: (f) => f.has("broke")
          ? R("You lay out what little the road and the storm left you, and name it honestly: a fraction. Felix counts it, looks at you for a long moment — the look of a man pricing not a debt but a debtor — and writes terms: the balance carried to next harvest, at the estate's interest. It is a leash. It is also another year on the land, and you take it the way tenants have always taken it: with thanks you do not feel.",
              "Carried arrears at landlord's interest were the mechanism binding tenants ever tighter across this period — each bad year converting into debt that made leaving impossible. Historians trace the later colonate, tenants legally tied to their land, to exactly this ratchet of ordinary seasons.",
              "far_d3_pm", ["bonded_debt"])
          : R("You count out the rent across the ledger — most of what the barn and the market earned — and Felix writes PERSOLVIT beside your name with the nearest thing to warmth the ledger allows. Another year secured. What is left in the barn after his mule turns out the gate is thin. It is also, entirely, yours.",
              "Rent commonly consumed the great share of a tenant's yield — the surviving leases and the agronomists' figures suggest margins that made every year a near-run thing. 'Paid in full' was the tenant's whole victory condition, purchased annually with almost everything.",
              "far_d3_pm") },
      { label: "Argue the storm. Half the valley is flattened — the estate must remit rents or lose its tenants.",
        result: R("You make the case standing straight, and Felix hears it — it is even true, and he knows it better than you, having ridden the valley since dawn. 'Remission is the master's to grant,' he says at last, 'and I will carry the request.' He writes it down: the tenant petitions. It is not nothing. It is also now in the ledger that you are a tenant who petitions, and ledgers are read in winters to come.",
          "Rent remission after disaster was a recognized practice — Pliny's letters show him granting it on his own estates as both mercy and management. But it was grace, not right: the tenant's only lever was the landlord's fear of vacant land, and stewards kept careful note of which tenants pulled it.",
          "far_d3_pm", ["petitioned"]) },
      { label: "Meet him at the gate with the sickle still in your hand from the morning's work. Let the tool talk.",
        result: R("You do not raise it. You do not need to; you simply fail to put it down, and let Felix read the yard — the man, the blade, the two days of catastrophe behind the man's eyes. He conducts the rent conversation from the mule, briefly, and turns out the gate early. It feels like a victory for most of an hour, until you remember that stewards also keep ledgers of yards they will not enter alone, and that the estate has men for whom such yards are the job.",
          "Violence against stewards happened — rural sources record assaulted agents and burned ledgers — and it summoned the estate's real power: bailiffs' crews, the landlord's town connections, magistrates who dined at his table. The tenant who frightened a steward had scheduled a later, larger visit.",
          "far_d3_pm", ["steward_enemy"]) },
    ],
  },
  far_d3_am_home: {
    day: 3, time: "MANE", place: "THE FARMYARD",
    enter: (f) => (f.has("crop_pledged") && f.has("crop_lost")) ? "far_d3_reckoning" : null,
    text: "Felix's mule turns in at your gate with the sun barely up. The storm has redrawn every tenancy in the valley, and he has been at it since dawn, farm by farm, the ledger riding before him like a standard. He dismounts, finds your name, and reads out the year's rent in the flat voice stewards keep for arithmetic.",
    choices: [
      { label: "Pay what you can and ask for terms on the balance.",
        result: R("You lay out the coin and kind the farm can spare and name the shortfall honestly. Felix counts, considers, and writes terms: the balance carried to harvest at the estate's interest. Another year on the land, on a leash. Tenants have taken worse trades every year since tenancy was invented.",
          "Carried arrears at landlord's interest were the quiet mechanism binding Roman tenants to their land — each shortfall a link. The later colonate, tenants legally tied to the soil, grew from exactly this ordinary arithmetic repeated across ordinary years.",
          "far_d3_pm", ["bonded_debt"]) },
      { label: "Pay in full, whatever it strips from the barn.",
        result: R("It takes nearly everything sellable the farm holds, but PERSOLVIT goes in the ledger beside your name, and Felix's mule turns out the gate leaving you paid-up, cleaned-out, and owing no man. The winter will be thin soup and mended clothes. It will be yours.",
          "Surviving Roman leases and the agronomists' own figures suggest rent consumed the great share of tenant yield. Full payment was purchased annually with almost the entire margin — and it bought the only security a tenant had: another year.",
          "far_d3_pm") },
      { label: "Ask Felix — directly — whether the estate needs a second steward's man for the valley.",
        result: R("Felix looks up from the ledger, recalculating you. The estate does, as it happens, need eyes in the upper valley — a tenant who reports, collects small rents, carries messages, for remission of part of his own. It is a real offer and you both know its price: your neighbors' faces when they learn whose man you are. He gives you until the nundinae to answer.",
          "Estates recruited their stewards' networks from among tenants — trusted men who traded standing with their neighbors for standing with the ledger. It was one of the countryside's few ladders, and everyone knew what it was made of.",
          "far_d3_pm", ["stewards_offer"]) },
    ],
  },
  far_d3_reckoning: {
    day: 3, time: "MANE", place: "THE FARMYARD",
    text: "Felix does not dismount this time. He reads it from the mule, from the ledger, in the voice of a man executing rather than deciding: the crop, pledged as rent, has failed; the pledge therefore stands as debt; the debt exceeds the tenancy's worth. The estate's terms follow, and there are exactly three, and he has the patience to wait while you understand that all three are real: bondage, flight, or the two large men waiting up the road in case a tenant chooses poorly.",
    choices: [
      { label: "Accept debt bondage. Your labor is the estate's until the ledger says otherwise.",
        result: R("You put your mark on it in the yard where you were, until this morning, a tenant. The terms are exact: your labor, and your family's at need, at the estate's direction, wages set against the debt, the debt at interest. Felix, not unkindly, notes that men have worked out of it. He does not say how many. You are alive, on your land, and no longer entirely your own — the oldest surviving arrangement in the countryside's long memory.",
          "Debt bondage was a real and legal Roman institution — the indebted poor pledged labor against arrears in arrangements that shaded from employment into something older. The jurists policed the line between debtor and slave with definitions; the ledgers policed it with interest. Alive, bound, and working was the countryside's most common form of ruin.",
          "far_survive_bonded") },
      { label: "Flee. Tonight, with the family and what carries, to the city that swallows everyone.",
        result: R("You leave in the dark between moonset and dawn — the family, the seed jars if you have them, the tools that carry — and the tenancy behind you defaults to the estate with your debt still written in it. Rome absorbs you by noon: a fourth-floor room in a Subura insula, day labor at the docks for you, piecework for your wife. The city is loud, filthy, dangerous, and completely indifferent to Felix's ledger. You have traded a countryside that owned you for a city that has never heard of you.",
          "Flight from rural debt into the anonymous city was constant — Rome's insulae were full of the countryside's escapees, and no mechanism tracked ordinary defaulters across the walls. The city's bottom rungs were brutal, but they were rungs; the historians' picture of Rome's million includes, always, this steady inflow of the fled.",
          "far_survive_fled") },
      { label: "Defy him. This land has your father's sweat in it and your children's future. Let them come.",
        result: DEATH("BEATEN TO DEATH BY THE ESTATE'S MEN",
          "You say no in the yard, in front of your family, with your feet planted in your father's dirt, and it is the truest sentence you have spoken all year. Felix sighs and raises a hand toward the road. The two men are professionals of a particular rural kind, and they are not instructed to kill you — that is simply a place beatings sometimes go, and everyone up the chain has language for it: the tenant resisted; the men exceeded; regrettable. The estate absorbs the tenancy by month's end. The ledger, as always, balances.",
          "The countryside's real law was the estate's capacity for violence — bailiffs' crews enforced evictions and collections with force that magistrates, who dined with landlords, rarely examined. Rural sources record beaten tenants as background noise. Defiance without power behind it was not resistance; it was a cause of death.") },
    ],
  },
  far_d3_pm: {
    day: 3, time: "VESPERE", place: "THE FARMHOUSE",
    enter: (f) => {
      if (f.has("wound_untreated")) return "far_d3_wound";
      if (f.has("fevered")) return "far_d3_fever";
      return null;
    },
    text: (f) => "The afternoon is quiet in the way the country is quiet after a hard reckoning — hens, wind in the stubble, the boy " + (f.has("child_bled") ? "still gray and slow from the healer's lancet, but holding" : "sitting up and complaining about the soup, which is how children announce their survival") + ". There is one honest afternoon of work in front of you and, for the first time in three days, a choice with no knife hidden in it.",
    choices: [
      { label: "Walk the field and plan next year in the ruined stubble.",
        result: R("You pace the flattened field slantwise, reading it like a ledger of your own: where the water stood, where the soil held, what a smart man plants after a hailed-out wheat year. By the time the light goes long you have next spring drawn in your head, furrow by furrow. It is only a plan. Farms are made of only-plans, laid end to end for generations.",
          "Roman farming knowledge was exactly this — accumulated local judgment about soil, water, and rotation, of which the agronomists' books are the merest written shadow. The tenant's real capital was carried in the head and passed at the field's edge, father to child.",
          "far_survive") },
      { label: "Mend the tools and grease the cart. Iron and wood are the winter's other harvest.",
        result: R("You spend the light on edges and axles: the sickle peened and stoned, the mattock re-hafted, the cart's dry hub greased with the last of the tallow. Nothing about the day will appear in any ledger, and by dark the farm is measurably harder to kill. Maintenance is the prayer that answers itself.",
          "Iron tools were serious capital for smallholders — a sickle or plowshare represented weeks of surplus, and their care appears in the agronomists as near-religious duty. Farms failed through neglected edges and rotten hubs as surely as through hail.",
          "far_survive") },
      { label: "Sit with the boy and teach him the stars as the light goes. The farm can have tomorrow.",
        result: R("You take him out to the dooryard wrapped in the good blanket and give him the sky: the Wagon, the Dog Star that brings the fevers, the road of milk the gods spilled. He falls asleep against your arm mid-question. Three days tried every way to make this impossible, and here it is anyway — the entire point of the whole endeavor, breathing slowly against your side.",
          "Roman farm families navigated the year by exactly these stars — Sirius's rising marked the dangerous fever season, and the agricultural calendar was written in the sky before it was written anywhere. What the sources cannot record, though the tombstones' grief attests it, is this hour.",
          "far_survive") },
    ],
  },
  far_d3_wound: {
    day: 3, time: "VESPERE", place: "THE FARMHOUSE",
    text: "It announces itself when you finally unwrap the field rag: the forearm hot and tight as a wineskin, the cut's edges gray, and — your stomach drops as you turn the arm to the light — a thin red line running from the wound toward the elbow, like a road being surveyed toward your heart. Every farmer knows the red road and where it goes. Two miles east, the army keeps a remount station with a surgeon. The temple is four hours. The night is one.",
    choices: [
      { label: "The army surgeon at the remount station. Now, walking, before dark.",
        result: R("The surgeon — twenty years of Dacia and Parthia in his forearms — reads the red line in one glance and does not offer choices: the arm below the elbow is the price, tonight, or the arm and then the man are the price this week. You drink what he gives you. The saw and the iron take less time than the walk did. You surface near midnight, short a forearm, blazing with a fever he calls 'the right kind,' and alive in the way that has an afterward.",
          "Roman military surgeons were the ancient world's best trauma practitioners, and early amputation ahead of spreading infection was their one reliable answer to septicemia — practiced fast, with purpose-made saws, ligatures, and cautery. Taken in time, it worked often enough to fill the empire with one-armed veterans of their own farms.",
          "far_survive_maimed") },
      { label: "The Temple of Aesculapius. Four hours is nothing; the god has healed worse.",
        result: DEATH("DEAD OF SEPSIS AT THE GOD'S THRESHOLD",
          "You walk through the night on will and willow tea, the arm carried before you like an offering, and reach the island as the sky grays. The priests are kind, and honest in the way of men who have watched at many bedsides: the red road has reached past your shoulder, and what is running in your blood now is beyond poultice, prayer, or — they send for him anyway — the knife. They give you the porch that faces the morning sun, and the draught that makes the leaving gentle. The god's island has received the dying with tenderness for four hundred years. It knows its work.",
          "By the time septicemia's red streaking passed the major joints, ancient medicine was out of moves — even army surgeons declined to cut once the infection ran systemic. The four hours to the temple were four hours the bacteria also used; in the era's arithmetic of infection, distance and delay were the actual causes of death.") },
      { label: "Wine, honey, a fresh binding, and bed. You beat everything else this week.",
        result: DEATH("DEAD OF THE WOUND YOU WORKED THROUGH",
          "You treat it now, properly, the way you should have in the field — wine, honey, clean linen — and it is two days too late to be treatment; it is grooming. The fever takes you before midnight. On the second day you tell your wife things you believe are important about the south field. On the third the red road completes its survey. You die in your own bed, of a sickle you owned, on land you rented, having been killed on Day One by an hour you chose not to lose.",
          "Sepsis from field wounds was one of the ancient countryside's great killers precisely because of this window: the same wine-and-honey care that reliably worked in the first hour did nothing after the infection established. Roman medical writers knew the timing mattered without knowing why. The bacteria did not require anyone's understanding.") },
    ],
  },
  far_d3_fever: {
    day: 3, time: "VESPERE", place: "THE FARMHOUSE",
    text: "It arrives in the late afternoon exactly as it arrived for your son: cold to the bone under the August sun, then the shaking, then heat like the inside of a kiln. The marsh crossing, two nights ago, presenting its bill. You know this fever's rhythm — a wave, a respite, a wave — and you know the one rule the campagna's dead did not follow: the body fights it or does anything else, never both.",
    choices: [
      { label: "Bed. Cloths, willow tea, and total surrender to the vigil. The farm waits.",
        result: R("You hand the farm to your wife and the fever your whole attention, and it is a real fight — the second wave in the night is worse than anything the week has offered, and you surface from it wrung gray. But you surface. By the fourth day the waves are spacing out, the way they do for the ones who rest. The campagna's oldest bargain: the fever takes a tithe of everyone and the whole of those who will not stop.",
          "Malaria survival in the ancient world tracked exactly this: rest, hydration, and fever management through the paroxysm cycles gave the immune system its chance, and willow bark's salicin was a genuine antipyretic. The campagna's populations carried hard-won behavioral knowledge — and partial genetic resistances — from millennia of exactly this bargain.",
          "far_survive_fevered") },
      { label: "Work through it. The reckoning left too much undone, and waves have gaps.",
        result: DEATH("DEAD OF THE MARSH FEVER, STANDING UP",
          "You use the gaps between waves the way the week has taught you to use everything — the roof patch in the first respite, the fence in the second — and the third wave arrives while you are on the ladder, and it is not like the others. The world goes narrow and ringing. Your wife finds you in the yard, the fever burning so high your skin hurts her hands, and there is no fourth respite; the falciparum kind, worked instead of rested, goes to the brain. You die at dawn on the day you were meant to survive, killed by the week's one enemy that only ever asked you to lie down.",
          "Falciparum malaria — confirmed by DNA in Roman-era Italian cemeteries — kills through exactly this progression, and exertion during paroxysms measurably worsens outcomes. Cerebral malaria's course was well known to the campagna without being understood: the fever that took the ones who would not stop was proverbial.") },
      { label: "Send for the crossroads healer and his lancet. Confidence is half of medicine.",
        result: DEATH("BLED TO DEATH'S DOOR BY THE HEALER'S LANCET",
          "The healer arrives, pronounces the blood overheated, and opens your vein with professional briskness — a full cup, then, seeing no improvement, another. What the fever's parasite was already doing to your blood, the lancet completes. You slide from fevered into gray, from gray into cold, with the healer narrating progress to your wife at every stage. He is gone with his fee before the end, which is the following noon. He believed every word he said. That is the terrifying part.",
          "Bloodletting a malarial patient compounded the disease's own hemolytic anemia — the treatment and the parasite destroyed blood together. Humoral medicine's confidence was total and its practitioners sincere; the era's rural sick were often finished by therapy. It would remain medicine's most durable killing error for another seventeen centuries.") },
    ],
  },
  far_survive: {
    survive: true,
    text: (f) => "Dawn, the fourth day. The rooster makes its announcement; the boy argues with breakfast; the stubble field steams. You walk the yard with a cup of posca doing the sum three days could not prevent: " +
      (f.has("bonded_debt") ? "in debt to the ledger, " : "") +
      (f.has("seed_sold") ? "the seed sold and spring mortgaged, " : "") +
      (f.has("broke") ? "robbed to the skin, " : "") +
      "and every member of this household breathing. Out here, that has never once been the whole story. It has always been the only sentence that matters.",
    verum: "The Roman empire was, beneath everything, tens of millions of exactly these households — tenant families whose margin over disaster was one storm, one fever, one ledger entry wide. The historians see them only in aggregate. Their victory condition, invisible to every source, was the fourth dawn.",
  },
  far_survive_bonded: {
    survive: true,
    text: "Dawn, the fourth day, and the light comes up on the same fields under a different arithmetic: your labor is the estate's now, wages against the debt, the debt at interest. Your wife is already calculating what the family's hands can earn back by spring; the boy, recovering, knows nothing of ledgers yet. You are alive, together, on the land — bound to it now by rope instead of roots. Men have worked out of it. You intend to be counted among them.",
    verum: "Debt bondage was rural Rome's great gray zone — legally free men whose labor was pledged until ledgers said otherwise, an arrangement the jurists distinguished from slavery with definitions the daily experience often blurred. It was survivable, occasionally escapable, and increasingly, across this century, where tenancy led.",
  },
  far_survive_fled: {
    survive: true,
    text: "Dawn, the fourth day, four floors above a Subura street already roaring. Your wife is asleep; the boy — city air being no worse for fevers than marsh air — watches carts through the gap in the shutter, amazed. At the docks they take on day labor at the second hour. You have farmed your last furrow and joined the city of a million strangers, where Felix's ledger has no page and no one has ever heard your father's name. It cost everything you built. It bought everything you are.",
    verum: "Rome's population was sustained by exactly this inflow — the countryside's fled and failed, absorbed by the insulae and the labor markets. The city's bottom rung was crowded, brutal, and genuinely anonymous: for rural debtors, urban anonymity was the empire's one free good.",
  },
  far_survive_maimed: {
    survive: true,
    text: "Dawn, the fourth day, in the remount station's sick bay with the right kind of fever burning itself out. The stump is dressed, the surgeon satisfied, and your wife — sent for at midnight — asleep in the chair with the boy in her lap. One-armed farmers work these valleys everywhere; the surgeon has a leather-and-hook man in town he recommends. The arm bought the man. Standing in the market of this particular week, you know exactly how good a price that was.",
    verum: "One-armed and one-handed workers were a fixture of the Roman countryside and its ports — early amputation was the era's one effective answer to septic wounds, and its survivors returned to adapted labor as a matter of course. Roman prosthetics existed and worked; Pliny records a general with an iron hand.",
  },
  far_survive_fevered: {
    survive: true,
    text: "Dawn, the fourth day — the fifth wave never came. You are wrung out, gray, ten years older this week, and propped in the dooryard with the boy beside you, the two of you convalescing competitively. The farm stands. The family stands. The fever will live in your blood now, returning some autumns, the campagna's permanent tax. You pay it. Everyone here pays it. The receipt is the morning.",
    verum: "Malaria survivors carried the parasite for years, with relapses the campagna treated as seasonal weather. Chronic malaria shaped Roman Italy demographically — depressing rural lifespans, emptying whole districts, and selecting the genetic resistances still traceable in the region. Living with it was not recovery; it was citizenship.",
  },
};

// ============================================================
// PROFESSIONS
// ============================================================
const PROFESSIONS = [
  { id: "sen", name: "SENATOR", char: "M·CASSIVS RVFVS", start: "sen_d1_am",
    blurb: "Wealth, rank, and a seat in the Curia — in the deadliest news cycle of a generation. Your threats are words, letters, and dinner invitations. Nothing here will chase you. Everything here will remember you." },
  { id: "mer", name: "MERCHANT", char: "T·FABIVS CORVVS", start: "mer_d1_am",
    blurb: "A grain trader of the Emporium docks. Your threats are fire, floodwater, debt, and the streets after dark. Money solves most of them. Running out of it, at the wrong hour, solves you." },
  { id: "far", name: "FARMER", char: "GAIVS", start: "far_d1_am",
    blurb: "A tenant of the malarial campagna in harvest week. Your threats are weather, biology, the ledger, and the road. No one is hunting you. The world is simply, patiently, trying to kill you." },
];

// ============================================================
// COMPONENT
// ============================================================
export default function SurviveRome() {
  const [screen, setScreen] = useState("title"); // title | select | scene | interlude | death | survived
  const [prof, setProf] = useState(null);
  const [sceneId, setSceneId] = useState(null);
  const [flags, setFlags] = useState(new Set());
  const [payload, setPayload] = useState(null); // interlude/death data
  const [verumCount, setVerumCount] = useState(0);
  const [deathCount, setDeathCount] = useState(0);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  const resolveScene = (id, f) => {
    let cur = SCENES[id];
    let curId = id;
    let guard = 0;
    while (cur && cur.enter && guard++ < 6) {
      const redirect = cur.enter(f);
      if (!redirect) break;
      curId = redirect;
      cur = SCENES[redirect];
    }
    return [curId, cur];
  };

  const startProfession = (p) => {
    setProf(p);
    setFlags(new Set());
    const [id] = resolveScene(p.start, new Set());
    setSceneId(id);
    setScreen("scene");
  };

  const chooseOption = (choice) => {
    const result = choice.resolve ? choice.resolve(flags) : choice.result;
    if (result.death) {
      setDeathCount((d) => d + 1);
      setVerumCount((v) => v + 1);
      setPayload(result);
      setScreen("death");
      return;
    }
    const next = new Set(flags);
    (result.set || []).forEach((s) => next.add(s));
    (result.clear || []).forEach((c) => next.delete(c));
    setFlags(next);
    setVerumCount((v) => v + 1);
    setPayload({ ...result, nextFlags: next });
    setScreen("interlude");
  };

  const continueOn = () => {
    const f = payload.nextFlags;
    const [id, sc] = resolveScene(payload.next, f);
    if (sc.death) {
      setDeathCount((d) => d + 1);
      setVerumCount((v) => v + 1);
      setPayload(sc);
      setScreen("death");
      return;
    }
    if (sc.survive) {
      setPayload(sc);
      setScreen("survived");
      return;
    }
    setSceneId(id);
    setScreen("scene");
  };

  const scene = sceneId ? SCENES[sceneId] : null;
  const sceneText = scene ? (typeof scene.text === "function" ? scene.text(flags) : scene.text) : "";
  const sceneChoices = scene ? (typeof scene.choices === "function" ? scene.choices(flags) : scene.choices) : [];
  const roman = (n) => ["I", "II", "III"][n - 1] || n;

  // ---------- styles ----------
  const css = `
    .sr-root { min-height: 100vh; background: #17120E; color: #E9DFC9; font-family: 'EB Garamond', Georgia, serif; display: flex; justify-content: center; padding: 0 16px; }
    .sr-col { width: 100%; max-width: 640px; padding: 40px 0 64px; }
    .sr-fade { animation: srfade .5s ease both; }
    @keyframes srfade { from { opacity: 0; } to { opacity: 1; } }
    @media (prefers-reduced-motion: reduce) { .sr-fade { animation: none; } }
    .sr-disp { font-family: 'Cinzel', 'Trajan Pro', serif; letter-spacing: .18em; }
    .sr-eyebrow { font-family: 'Cinzel', serif; font-size: 11px; letter-spacing: .34em; color: #C9973C; text-transform: uppercase; }
    .sr-rule { border: 0; border-top: 1px solid #3A2E22; margin: 20px 0; }
    .sr-body { font-size: 19px; line-height: 1.62; }
    .sr-choice { display: block; width: 100%; text-align: left; background: #201913; color: #E9DFC9; border: 1px solid #3A2E22; padding: 14px 16px; margin: 10px 0; font-family: 'EB Garamond', serif; font-size: 17.5px; line-height: 1.45; cursor: pointer; transition: border-color .15s, background .15s; border-radius: 2px; }
    .sr-choice:hover:not(:disabled), .sr-choice:focus-visible { border-color: #C9973C; background: #261E16; outline: none; }
    .sr-choice:focus-visible { box-shadow: 0 0 0 2px #C9973C55; }
    .sr-choice:disabled { opacity: .45; cursor: not-allowed; font-style: italic; }
    .sr-num { color: #C9973C; font-family: 'Cinzel', serif; font-size: 13px; letter-spacing: .1em; margin-right: 10px; }
    .sr-verum { background: #1D1A12; border-left: 3px solid #6F7F5F; padding: 14px 16px; margin-top: 22px; font-size: 16.5px; line-height: 1.55; color: #CFC7AC; border-radius: 0 2px 2px 0; }
    .sr-verum b { font-family: 'Cinzel', serif; font-size: 11px; letter-spacing: .3em; color: #8FA07B; display: block; margin-bottom: 6px; font-weight: 600; }
    .sr-btn { background: none; border: 1px solid #C9973C; color: #C9973C; font-family: 'Cinzel', serif; letter-spacing: .24em; font-size: 13px; padding: 12px 26px; cursor: pointer; margin-top: 26px; transition: background .15s, color .15s; border-radius: 2px; }
    .sr-btn:hover, .sr-btn:focus-visible { background: #C9973C; color: #17120E; outline: none; }
    .sr-tomb { border: 2px solid #8B8578; outline: 1px solid #58534A; outline-offset: 5px; background: linear-gradient(175deg, #2A2620, #211D18); padding: 34px 26px; text-align: center; margin-top: 8px; border-radius: 2px; }
    .sr-panel { background: #241009; border: 1px solid #57241A; padding: 22px 22px 26px; border-radius: 2px; }
  `;

  return (
    <div className="sr-root">
      <style>{css}</style>
      <div className="sr-col">

        {screen === "title" && (
          <div className="sr-fade" style={{ textAlign: "center", paddingTop: 48 }}>
            <div className="sr-eyebrow">ROMA · MENSE AVGVSTO · A·D· CXVII</div>
            <h1 className="sr-disp" style={{ fontSize: 34, fontWeight: 700, margin: "26px 0 6px", lineHeight: 1.3 }}>
              SVRVIVE THREE DAYS<br />IN ANCIENT ROME
            </h1>
            <hr className="sr-rule" style={{ width: 120, margin: "26px auto", borderColor: "#C9973C" }} />
            <p className="sr-body" style={{ maxWidth: 480, margin: "0 auto", color: "#CFC7AC" }}>
              The Emperor Trajan is dying two thousand miles away, and nobody in the city knows it yet.
              The city itself — fire, fever, floodwater, the ledger, the dark — does not care who rules it.
            </p>
            <p style={{ fontSize: 15.5, color: "#8B8578", maxWidth: 440, margin: "18px auto 0", fontStyle: "italic" }}>
              Most who attempt this do not live to the fourth dawn. Every death is a history lesson. Choose carefully; the danger is rarely where the drama is.
            </p>
            <button className="sr-btn" onClick={() => setScreen("select")}>BEGIN</button>
          </div>
        )}

        {screen === "select" && (
          <div className="sr-fade">
            <div className="sr-eyebrow" style={{ textAlign: "center" }}>CHOOSE YOUR LIFE</div>
            <hr className="sr-rule" />
            {PROFESSIONS.map((p) => (
              <button key={p.id} className="sr-choice" style={{ padding: "18px 18px" }} onClick={() => startProfession(p)}>
                <span className="sr-disp" style={{ fontSize: 17, color: "#C9973C", display: "block", marginBottom: 4 }}>{p.name}</span>
                <span style={{ fontSize: 13, letterSpacing: ".2em", color: "#8B8578", fontFamily: "'Cinzel', serif", display: "block", marginBottom: 8 }}>{p.char}</span>
                <span style={{ color: "#CFC7AC" }}>{p.blurb}</span>
              </button>
            ))}
            {deathCount > 0 && (
              <p style={{ textAlign: "center", color: "#8B8578", fontSize: 15, marginTop: 18, fontStyle: "italic" }}>
                Deaths so far: {deathCount} · History lessons collected: {verumCount}
              </p>
            )}
          </div>
        )}

        {screen === "scene" && scene && (
          <div className="sr-fade" key={sceneId}>
            <div className="sr-eyebrow">DIES {roman(scene.day)} · {scene.time} · {scene.place}</div>
            <hr className="sr-rule" />
            <p className="sr-body">{sceneText}</p>
            <div style={{ marginTop: 26 }}>
              {sceneChoices.map((c, i) => {
                const lock = c.lockedIf ? c.lockedIf(flags) : null;
                return (
                  <button key={i} className="sr-choice" disabled={!!lock} onClick={() => chooseOption(c)}>
                    <span className="sr-num">{["I", "II", "III", "IV"][i]}</span>
                    {lock ? lock : c.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {screen === "interlude" && payload && (
          <div className="sr-fade">
            <div className="sr-eyebrow">WHAT FOLLOWED</div>
            <hr className="sr-rule" />
            <p className="sr-body">{payload.text}</p>
            <div className="sr-verum"><b>VERUM · WHAT HISTORY SAYS</b>{payload.verum}</div>
            <button className="sr-btn" onClick={continueOn}>CONTINVE</button>
          </div>
        )}

        {screen === "death" && payload && (
          <div className="sr-fade">
            <div className="sr-panel">
              <p className="sr-body" style={{ marginTop: 0 }}>{payload.text}</p>
            </div>
            <div className="sr-tomb" style={{ marginTop: 26 }}>
              <div className="sr-disp" style={{ fontSize: 26, color: "#B8B2A3", letterSpacing: ".4em" }}>D·M</div>
              <div className="sr-disp" style={{ fontSize: 16, color: "#E9DFC9", margin: "14px 0 4px" }}>{prof?.char}</div>
              <div style={{ fontFamily: "'Cinzel', serif", fontSize: 11.5, letterSpacing: ".22em", color: "#8B8578" }}>{prof?.name} OF ROME</div>
              <hr className="sr-rule" style={{ width: 90, margin: "16px auto", borderColor: "#58534A" }} />
              <div className="sr-disp" style={{ fontSize: 13.5, color: "#C9973C", lineHeight: 1.7 }}>{payload.cause}</div>
              <div style={{ fontSize: 14.5, color: "#8B8578", marginTop: 12, fontStyle: "italic" }}>
                He did not see the fourth dawn. · A·D· CXVII
              </div>
            </div>
            <div className="sr-verum"><b>VERUM · WHAT HISTORY SAYS</b>{payload.verum}</div>
            <div style={{ textAlign: "center" }}>
              <button className="sr-btn" onClick={() => setScreen("select")}>LIVE AGAIN</button>
            </div>
          </div>
        )}

        {screen === "survived" && payload && (
          <div className="sr-fade" style={{ textAlign: "center" }}>
            <div className="sr-eyebrow">DIES IV · PRIMA LVCE</div>
            <h2 className="sr-disp" style={{ fontSize: 28, fontWeight: 700, margin: "20px 0 4px", color: "#C9973C" }}>VIXIT</h2>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: 12, letterSpacing: ".28em", color: "#8B8578" }}>HE LIVED · {prof?.char}</div>
            <hr className="sr-rule" style={{ width: 120, margin: "24px auto", borderColor: "#C9973C" }} />
            <p className="sr-body" style={{ textAlign: "left" }}>
              {typeof payload.text === "function" ? payload.text(flags) : payload.text}
            </p>
            <div className="sr-verum" style={{ textAlign: "left" }}><b>VERUM · WHAT HISTORY SAYS</b>{payload.verum}</div>
            <p style={{ color: "#8B8578", fontSize: 15, marginTop: 20, fontStyle: "italic" }}>
              History lessons collected: {verumCount} · Deaths along the way: {deathCount}
            </p>
            <button className="sr-btn" onClick={() => setScreen("select")}>LIVE ANOTHER LIFE</button>
          </div>
        )}

      </div>
    </div>
  );
}
