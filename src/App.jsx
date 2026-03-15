import React, { useMemo, useState } from "react";

const theme = {
  ink: "#0f172a",
  sub: "#475569",
  line: "#e2e8f0",
  panel: "#ffffff",
  soft: "#f8fafc",
  indigo: "#4f46e5",
  purple: "#7c3aed",
  amber: "#f59e0b",
  green: "#16a34a",
};

const noteSections = [
  ["idSection", "1. ID"],
  ["hpiSection", "2. HPI Onset, Duration, Course"],
  ["psychHxSection", "3. Psychiatric Hx"],
  ["famHxSection", "4. Family Psychiatric Hx"],
  ["medicalSection", "5–6. Medical Hx / Systems Review"],
  ["personalSection", "7. Personal Hx"],
  ["mseSection", "8–9. MSE / Cognition"],
  ["formulationSection", "10–11. Impression / Formulation / Diagnosis"],
  ["planSection", "12. Plan"],
];

const instructionsSteps = [
  "Pick a case from the top scenario bar.",
  "Interview the patient in the simulation console.",
  "Use a hint only if you are stuck.",
  "Complete the MSE lab using the observed presentation.",
  "Review and edit the psychiatric assessment form.",
  "Compare your write-up with the model note.",
];

const coreChecklist = [
  {
    title: "ID + why now",
    questions: [
      "Name, age, relationship status, occupation, and financial context.",
      "Why the patient is presenting now.",
      "Major stressors or precipitants.",
    ],
  },
  {
    title: "HPI and symptom review",
    questions: [
      "Onset, duration, course, severity, and functional impact.",
      "Depression, mania, psychosis, anxiety, trauma, and sleep/appetite review when relevant.",
      "What helped before and what did not.",
    ],
  },
  {
    title: "Risk assessment",
    questions: [
      "Suicidal ideation, homicidal ideation, plan, intent, access to means, protective factors.",
      "Violence risk, inability to care for self, or need for inpatient level of care.",
    ],
  },
  {
    title: "Past / family / medical / social",
    questions: [
      "Past psychiatric treatment, admissions, meds, attempts, therapy.",
      "Family psychiatric history, substance use, and suicide history.",
      "Medical history, head injury, surgeries, alcohol, nicotine, caffeine, illicit substances.",
      "Living situation, supports, work, relationships, and functional decline.",
    ],
  },
  {
    title: "MSE + plan",
    questions: [
      "Appearance, behavior, speech, mood/affect, thought process/content, perception, insight, judgment.",
      "Use MMSE/MoCA if cognition is a real issue.",
      "Build a treatment, monitoring, and disposition plan.",
    ],
  },
];

const mseFields = [
  ["appearance", "Appearance"],
  ["behavior", "Behavior"],
  ["speech", "Speech"],
  ["mood", "Mood"],
  ["affect", "Affect"],
  ["perception", "Perception"],
  ["thoughtProcess", "Thought process"],
  ["thoughtContent", "Thought content"],
  ["concentration", "Concentration"],
  ["memory", "Memory"],
  ["insight", "Insight"],
  ["judgment", "Judgment"],
  ["orientation", "Orientation"],
];

const mseOptions = {
  appearance: ["", "Well-groomed", "Tired / mildly disheveled", "Guarded", "Hyperactive / intense", "Anxious / tense"],
  behavior: ["", "Cooperative", "Cooperative but slowed", "Guarded / suspicious", "Restless / overactive", "Hypervigilant"],
  speech: ["", "Normal", "Soft / slowed", "Pressured", "Anxious but normal rate"],
  mood: ["", "Depressed", "Elevated / expansive", "Anxious / frightened", "Frustrated"],
  affect: ["", "Constricted", "Expansive", "Anxious / constricted", "Mildly defensive but reactive"],
  perception: ["", "No hallucinations observed", "Auditory hallucinations by history", "Ideas of reference / psychotic features", "No primary psychosis"],
  thoughtProcess: ["", "Linear", "Flight of ideas / circumstantial", "Paranoid / mildly disorganized"],
  thoughtContent: ["", "Hopelessness / suicidal ideation", "Grandiosity / risky ideas", "Persecutory delusions / paranoia", "Trauma preoccupation", "Memory complaints / partial minimization"],
  concentration: ["", "Impaired", "Distractible", "Grossly intact", "Mildly impaired"],
  memory: ["", "Grossly intact", "Grossly intact by interview", "Impaired by history"],
  insight: ["", "Fair", "Poor", "Limited", "Partial"],
  judgment: ["", "Impaired", "Poor", "Fair but compromised", "Mildly impaired"],
  orientation: ["", "Intact", "Grossly intact", "Formal MMSE / MoCA indicated"],
};

const treatmentBuilders = {
  depression: {
    priority: "If suicidal ideation is active with plan, intent, or inability to safety plan, disposition comes before routine outpatient prescribing.",
    options: [
      {
        title: "SSRI option",
        med: "Sertraline",
        dose: "25 mg daily for several days, then 50 mg daily if tolerated",
        why: "Useful first-line antidepressant option with anxiety coverage and familiar outpatient use.",
      },
      {
        title: "Alternative SSRI",
        med: "Escitalopram",
        dose: "5 mg daily, then 10 mg daily if tolerated",
        why: "Another common first-line option when a simpler SSRI choice is preferred.",
      },
    ],
    monitoring: ["Suicidality changes", "Sleep and appetite", "GI upset or sexual adverse effects", "Adherence", "TSH and medical contributors when relevant"],
    nonpharm: ["Safety planning", "Secure means", "Psychotherapy referral", "Family or support involvement"],
    followUp: "High-risk patients need very close follow-up; many need inpatient admission instead of simple discharge with meds.",
  },
  mania: {
    priority: "Acute mania often needs containment and disposition planning before outpatient med tweaking. Poor insight matters.",
    options: [
      {
        title: "Acute antipsychotic option",
        med: "Olanzapine",
        dose: "5 to 10 mg nightly or in acute setting per clinical context",
        why: "Often considered when rapid control of mania or psychosis is needed.",
      },
      {
        title: "Mood stabilizer anchor",
        med: "Lithium or valproate",
        dose: "Only after confirming labs, monitoring, and appropriateness",
        why: "Useful for mood stabilization, but only with proper baseline assessment and follow-up.",
      },
    ],
    monitoring: ["Sleep", "Agitation", "Psychosis", "Lithium or valproate labs if used", "Metabolic monitoring if antipsychotic used"],
    nonpharm: ["Low-stimulation environment", "Collateral from family", "Assess decision-making capacity", "Hospitalization if unsafe"],
    followUp: "Often inpatient or urgent psychiatric follow-up, not routine delayed outpatient care.",
  },
  psychosis: {
    priority: "Rule out substances and medical causes while managing danger to self, others, or inability to care for self.",
    options: [
      {
        title: "Second-generation antipsychotic option",
        med: "Risperidone",
        dose: "0.5 to 1 mg nightly or twice daily depending clinical context",
        why: "Common starting option for psychotic symptoms in many teaching settings.",
      },
      {
        title: "Alternative SGA",
        med: "Olanzapine",
        dose: "5 mg nightly or per acute setting protocol",
        why: "Useful when sedation or stronger antipsychotic effect is desired, with metabolic caution.",
      },
    ],
    monitoring: ["EPS", "Metabolic monitoring", "Psychosis severity", "UDS and medical workup", "Adherence and collateral"],
    nonpharm: ["Reality-based supportive approach", "Avoid arguing with delusions", "Assess need for admission", "Family collateral"],
    followUp: "Urgent psychiatric follow-up or hospitalization depending safety and self-care.",
  },
  ptsd: {
    priority: "PTSD treatment is not just medication. Safety, trauma-informed care, and substance-use assessment matter.",
    options: [
      {
        title: "SSRI option",
        med: "Sertraline",
        dose: "25 mg daily, then 50 mg daily if tolerated",
        why: "Reasonable teaching example for PTSD with depressive or anxiety symptoms.",
      },
      {
        title: "Another SSRI option",
        med: "Escitalopram or similar SSRI approach",
        dose: "Low-dose start, then titrate based on tolerance",
        why: "Useful if an SSRI approach is chosen, while prioritizing trauma-focused therapy.",
      },
    ],
    monitoring: ["Alcohol use", "Sleep and nightmares", "Suicidality", "Avoidance and functioning", "Medication tolerance"],
    nonpharm: ["Trauma-focused therapy", "Safety planning", "Reduce alcohol as coping", "Sleep hygiene and support system engagement"],
    followUp: "Close outpatient follow-up if safe, with stronger substance-use intervention if alcohol becomes a bigger driver.",
  },
  neurocog: {
    priority: "Do not reflexively throw a psychotropic at memory decline. First think workup, safety, cognition testing, and caregiver support.",
    options: [
      {
        title: "Behavioral approach first",
        med: "No routine psychotropic as first move",
        dose: "Focus on workup and supports first",
        why: "Primary issue is cognitive decline, not necessarily a psychiatric med target.",
      },
      {
        title: "Target comorbidity only if present",
        med: "Treat depression, psychosis, or agitation only when clearly present and necessary",
        dose: "Use the lowest effective dose with careful monitoring",
        why: "Older adults are more vulnerable to adverse effects and polypharmacy problems.",
      },
    ],
    monitoring: ["MMSE / MoCA", "Functional decline", "Medication review", "B12 / TSH / reversible causes", "Caregiver burden and safety"],
    nonpharm: ["Driving and medication safety review", "Caregiver involvement", "Neurology or memory clinic referral", "Structured routine and supports"],
    followUp: "Usually outpatient memory workup unless delirium, acute safety problems, or inability to care for self is emerging.",
  },
};

const cases = [
  {
    id: "depression",
    label: "Depressive Disorders",
    title: "Major depression with suicidal ideation",
    accent: "linear-gradient(135deg,#4f46e5,#7c3aed)",
    opening: "I've been feeling extremely down for the past two months and lately I've started thinking everyone would be better off without me.",
    observed: ["tearful", "slowed", "soft speech", "constricted affect"],
    interviewFlow: ["id", "hpi", "mood", "safety", "psychHistory", "family", "medical", "personal", "mse"],
    prompts: [
      "What brings you in today?",
      "When did this start?",
      "How has your sleep been?",
      "Have you had thoughts of harming yourself?",
      "Any prior psychiatric treatment?",
      "Any family psychiatric history?",
    ],
    aliases: {
      id: ["name", "age", "occupation", "marital", "financial"],
      hpi: ["when did", "how long", "start", "trigger", "worse"],
      mood: ["depressed", "sad", "sleep", "appetite", "energy", "concentration", "hopeless", "interest"],
      safety: ["suicidal", "hurt yourself", "kill yourself", "plan", "means", "pills", "gun"],
      psychHistory: ["history", "hospitalized", "therapy", "psychiatrist", "medication"],
      family: ["family history", "mother", "father", "suicide in family"],
      medical: ["medical", "thyroid", "medications", "surgery", "alcohol", "substance"],
      personal: ["live", "support", "work", "relationship", "finances"],
      mse: ["mood", "affect", "insight", "judgment"],
    },
    responses: {
      id: "My name is Lauren. I'm 34, divorced, and I work as a medical assistant. Money has been tight lately.",
      hpi: "This episode started about two months ago after my divorce was finalized. The last week has been the worst part.",
      mood: "I'm sad most of the day, don't enjoy anything, sleep maybe 3 to 4 hours a night, lost around 10 pounds, and I can barely focus.",
      safety: "Yes, I've had thoughts about overdosing. I have pills at home. My kids and sister are the main things stopping me.",
      psychHistory: "I was diagnosed with depression before. No psych admissions. I did therapy in the past and used sertraline before.",
      family: "My mother has depression and one uncle died by suicide.",
      medical: "I have hypothyroidism and sometimes forget my medication. I drink occasionally on weekends. No other substances.",
      personal: "I live alone. My sister is supportive. I've been struggling at work and financially things have been stressful.",
      mse: "I feel exhausted and hopeless. I know something is wrong, but I don't trust myself alone tonight.",
    },
    model: {
      idSection: "Name: Lauren M.\nMarital status: Divorced\nSex: Female\nOccupation: Medical assistant\nAge: 34\nFinancial situation: Stress after divorce and reduced work functioning.",
      hpiSection: "Why present now: Worsening depression with suicidal ideation and functional decline.\nOnset: 2 months ago after divorce finalized.\nCourse: Daily symptoms, worse over the past week.\nSymptoms: Low mood, anhedonia, insomnia, weight loss, low energy, poor concentration, hopelessness.",
      psychHxSection: "Prior diagnosis of depression. Past therapy and sertraline use. No prior psychiatric hospitalization.",
      famHxSection: "Mother with depression. Maternal uncle died by suicide.",
      medicalSection: "Hypothyroidism. Inconsistent adherence with thyroid medication. Occasional alcohol. No other substances.",
      personalSection: "Divorced, employed, lives alone, supportive sister, financial and work stress.",
      mseSection: "Appearance/behavior: Tired, slowed.\nSpeech: Soft, slowed.\nMood/affect: Depressed, constricted.\nThought process: Linear.\nThought content: Hopelessness and suicidal ideation.\nInsight: Fair.\nJudgment: Impaired by suicidality.",
      formulationSection: "Major Depressive Disorder, recurrent, severe, without psychotic features. Biological vulnerability plus divorce and financial stress with current suicidal risk.",
      planSection: "CBC, CMP, TSH, pregnancy test if relevant, UDS if indicated. Consider inpatient admission, secure means, restart antidepressant if appropriate, safety plan, psychotherapy referral.",
    },
  },
  {
    id: "mania",
    label: "Bipolar and Related Disorders",
    title: "Mania with poor insight",
    accent: "linear-gradient(135deg,#2563eb,#7c3aed)",
    opening: "My family is overreacting. I don't need sleep, I have amazing ideas, and everyone keeps trying to slow me down.",
    observed: ["restless", "pressured speech", "expansive affect", "poor insight"],
    interviewFlow: ["id", "hpi", "mania", "psychosis", "safety", "psychHistory", "family", "medical", "personal", "mse"],
    prompts: [
      "What brings you in today?",
      "How much have you been sleeping?",
      "Any spending or risky behavior?",
      "Any special messages or things others do not notice?",
      "Any thoughts of harming yourself or others?",
      "Any prior bipolar treatment?",
    ],
    aliases: {
      id: ["name", "age", "occupation", "financial"],
      hpi: ["when did", "how long", "start", "trigger"],
      mania: ["sleep", "energy", "racing thoughts", "spending", "grandiose", "talking fast", "manic"],
      psychosis: ["voices", "hallucinations", "messages", "tv", "special meaning", "paranoid"],
      safety: ["suicidal", "homicidal", "violent", "aggressive", "hurt others"],
      psychHistory: ["bipolar", "hospitalized", "lithium", "medication", "therapy"],
      family: ["family history", "bipolar", "alcohol problems"],
      medical: ["medical", "head injury", "weed", "alcohol", "drugs"],
      personal: ["live", "support", "work", "finances"],
      mse: ["mood", "affect", "insight", "judgment"],
    },
    responses: {
      id: "I'm Darius, 29, single, working in sales, though I haven't really been going in. I've spent way too much money this week.",
      hpi: "This started about 8 or 9 days ago after I stopped lithium because it dulled me.",
      mania: "I've slept maybe 2 hours a night, have tons of energy, started three business ideas, and spent way too much money.",
      psychosis: "Sometimes I feel like the TV is sending me special messages.",
      safety: "No suicidal thoughts. I get irritable, but I don't have a plan to hurt anyone.",
      psychHistory: "I was diagnosed with bipolar disorder before and had prior psychiatric hospitalizations during manic episodes.",
      family: "My aunt had bipolar disorder and my dad had alcohol problems.",
      medical: "No major medical problems. I used weed a couple times this week. No head injury.",
      personal: "I live alone. My sister keeps checking on me. Work has fallen apart and my spending is out of control.",
      mse: "I feel better than everyone else right now. I don't think I need to be here.",
    },
    model: {
      idSection: "Name: Darius T.\nMarital status: Single\nSex: Male\nOccupation: Sales associate\nAge: 29\nFinancial situation: Significant impulsive overspending during current episode.",
      hpiSection: "Why present now: Family concern for mania, poor insight, decreased sleep, impulsive spending, occupational decline.\nOnset: 8–9 days ago after stopping lithium.\nCourse: Escalating over the past week.\nSymptoms: Grandiosity, decreased need for sleep, increased energy, risky spending, irritability.",
      psychHxSection: "Bipolar disorder with prior manic hospitalizations. Prior lithium treatment. Poor current adherence.",
      famHxSection: "Aunt with bipolar disorder. Father with alcohol problems.",
      medicalSection: "No major medical illness. Recent cannabis use. No head injury.",
      personalSection: "Lives alone, poor work attendance, impulsive spending, sister involved.",
      mseSection: "Appearance/behavior: Overly energized, restless.\nSpeech: Pressured.\nMood/affect: Elevated and expansive.\nThought process: Flight of ideas / circumstantial.\nThought content: Grandiosity and risky ideas.\nInsight: Poor.\nJudgment: Poor.",
      formulationSection: "Bipolar I disorder, current manic episode, with poor insight and psychotic features by history.",
      planSection: "CBC, CMP, TSH, UDS, medication levels if relevant. Acute mood stabilization, collateral, low-stimulation setting, likely inpatient admission if unsafe.",
    },
  },
  {
    id: "psychosis",
    label: "Schizophrenia Spectrum / Psychotic Disorders",
    title: "Paranoia and auditory hallucinations",
    accent: "linear-gradient(135deg,#0f766e,#14b8a6)",
    opening: "People in my apartment building have been tracking me, and I hear them talking about me through the vents.",
    observed: ["guarded", "suspicious", "tense", "internally preoccupied"],
    interviewFlow: ["id", "hpi", "psychosis", "safety", "psychHistory", "family", "medical", "personal", "mse"],
    prompts: [
      "What has been going on?",
      "When did this start?",
      "Are you hearing or seeing things other people do not?",
      "Do you feel watched or followed?",
      "Any thoughts of harming yourself or confronting anyone?",
      "Any prior psychiatric treatment?",
    ],
    aliases: {
      id: ["name", "age", "occupation", "financial"],
      hpi: ["when did", "how long", "start", "course"],
      psychosis: ["voices", "hallucinations", "paranoid", "delusions", "watched", "followed"],
      safety: ["suicidal", "homicidal", "violent", "confront", "hurt others"],
      psychHistory: ["hospitalized", "past psych", "therapy", "medications"],
      family: ["family history", "schizophrenia", "suicide in family"],
      medical: ["medical", "head injury", "weed", "alcohol", "drugs"],
      personal: ["live", "support", "work", "job", "functioning"],
      mse: ["mood", "affect", "insight", "judgment"],
    },
    responses: {
      id: "I'm Evan, 27. I used to work in IT, but I lost my job. Money has been tight since then.",
      hpi: "The paranoia started about four months ago, and the voices started several weeks after that. I've been isolating more and more.",
      psychosis: "I hear two male voices commenting on me. I also think my neighbors put cameras in my smoke detector.",
      safety: "I don't want to kill myself. I did think about confronting a neighbor because I felt threatened.",
      psychHistory: "No psychiatric hospitalizations. I was only treated for anxiety before.",
      family: "One cousin has schizophrenia.",
      medical: "I use cannabis once in a while, but this kept happening even when I stopped for a month. No head injury or major medical problem.",
      personal: "I live alone. My mom has been checking on me because I stopped functioning normally and lost my job.",
      mse: "I know people think this sounds strange, but it feels real to me.",
    },
    model: {
      idSection: "Name: Evan R.\nMarital status: Single\nSex: Male\nOccupation: Former IT worker, unemployed\nAge: 27\nFinancial situation: Strained after job loss.",
      hpiSection: "Why present now: Progressive paranoia, auditory hallucinations, isolation, and functional decline.\nOnset: Paranoia 4 months ago, voices weeks later.\nSymptoms: Hallucinations and persecutory beliefs.\nCourse: Persistent and worsening.",
      psychHxSection: "Prior treatment only for anxiety. No prior psych admissions.",
      famHxSection: "Cousin with schizophrenia.",
      medicalSection: "No major neurologic or medical condition reported. Intermittent cannabis use. No head injury.",
      personalSection: "Lives alone, mother involved, job loss due to functional decline, increasing social withdrawal.",
      mseSection: "Appearance/behavior: Guarded, suspicious.\nSpeech: Generally coherent.\nMood/affect: Anxious and tense.\nPerception: Auditory hallucinations.\nThought process: Paranoid / mildly disorganized.\nThought content: Persecutory delusions.\nInsight: Limited.\nJudgment: Impaired.",
      formulationSection: "Schizophrenia spectrum disorder with hallucinations, paranoia, occupational decline, and limited insight.",
      planSection: "CBC, CMP, TSH, UDS, B12, RPR/HIV if indicated, additional neurologic workup if atypical. Consider antipsychotic initiation and hospitalization if safety worsens.",
    },
  },
  {
    id: "ptsd",
    label: "Trauma- and Stressor-Related Disorders",
    title: "PTSD symptoms with avoidance and alcohol misuse",
    accent: "linear-gradient(135deg,#0ea5e9,#38bdf8)",
    opening: "Ever since the assault, I can't sleep, I keep reliving it, and I've been drinking more just to get through the nights.",
    observed: ["tense posture", "hypervigilant scanning", "anxious tone", "fatigued"],
    interviewFlow: ["id", "hpi", "anxiety", "safety", "psychHistory", "family", "medical", "personal", "mse"],
    prompts: [
      "Can you tell me what has been happening since the assault?",
      "When did the symptoms start?",
      "Are you having nightmares, flashbacks, or hypervigilance?",
      "Any thoughts of harming yourself?",
      "How much alcohol are you drinking?",
      "Who supports you right now?",
    ],
    aliases: {
      id: ["name", "age", "occupation", "financial"],
      hpi: ["when did", "how long", "start", "course", "avoid"],
      anxiety: ["trauma", "assault", "flashbacks", "nightmares", "ptsd", "panic", "hypervigilance"],
      safety: ["suicidal", "hurt yourself", "safe", "want to die"],
      psychHistory: ["therapy", "medications", "past psych", "history"],
      family: ["family history", "anxiety", "substance in family", "suicide in family"],
      medical: ["medical", "alcohol", "drink", "drugs", "head injury"],
      personal: ["live", "support", "work", "relationships"],
      mse: ["mood", "affect", "insight", "judgment"],
    },
    responses: {
      id: "I'm Nadia, 31, single, and I manage a restaurant. I had to change shifts, so money has been a little tighter lately.",
      hpi: "The symptoms started within a couple weeks after the assault about five months ago and haven't really let up.",
      anxiety: "I get flashbacks, nightmares, avoid going out at night, feel jumpy, and sometimes panic if someone walks behind me.",
      safety: "I've had thoughts like I can't keep living like this, but no plan or intent to kill myself.",
      psychHistory: "I tried therapy twice, but it felt overwhelming. I only got hydroxyzine from urgent care.",
      family: "My mom has anxiety and my dad had alcohol problems.",
      medical: "No major medical issues. I've been drinking 3 to 4 strong drinks at night some days to calm down or sleep.",
      personal: "I live with my cousin right now because I don't like being alone. Work and relationships feel smaller than they used to.",
      mse: "I feel on edge all the time and exhausted from not sleeping.",
    },
    model: {
      idSection: "Name: Nadia S.\nMarital status: Single\nSex: Female\nOccupation: Restaurant manager\nAge: 31\nFinancial situation: Mild strain after work changes.",
      hpiSection: "Why present now: Persistent trauma symptoms, sleep disturbance, avoidance, and increasing alcohol use.\nOnset: Within weeks of assault 5 months ago.\nSymptoms: Re-experiencing, nightmares, avoidance, hyperarousal, anxiety.\nCourse: Ongoing with poor resolution.",
      psychHxSection: "Limited therapy attempts, hydroxyzine from urgent care, no psychiatric hospitalization history.",
      famHxSection: "Mother with anxiety. Father with alcohol problems.",
      medicalSection: "No major medical illness reported. Alcohol use 3–4 strong drinks at night on some days.",
      personalSection: "Lives with cousin for support, reduced sense of safety when alone, work and relationships affected.",
      mseSection: "Appearance/behavior: Hypervigilant, tense.\nSpeech: Normal rate, anxious tone.\nMood/affect: Anxious, constricted.\nThought process: Linear.\nThought content: Trauma preoccupation.\nInsight: Fair.\nJudgment: Fair but using alcohol as coping.",
      formulationSection: "Posttraumatic Stress Disorder with alcohol misuse as coping and reduced functioning.",
      planSection: "Assess withdrawal risk, consider SSRI if appropriate, trauma-focused therapy, safety planning, reduce alcohol reliance, outpatient follow-up if safe.",
    },
  },
  {
    id: "neurocog",
    label: "Neurocognitive Disorders",
    title: "Progressive memory decline",
    accent: "linear-gradient(135deg,#059669,#10b981)",
    opening: "My daughter thinks I'm forgetting too much, but I think she's making a bigger deal out of it than it is.",
    observed: ["cooperative", "mildly defensive", "frustrated", "subtle memory gaps"],
    interviewFlow: ["id", "hpi", "cognition", "psychHistory", "family", "medical", "personal", "mse"],
    prompts: [
      "What kinds of memory problems have you noticed?",
      "When did this start?",
      "Any issues with driving, bills, or medications?",
      "Any family history of dementia?",
      "Who helps you at home?",
      "I would like to do a brief cognitive screen such as MMSE or MoCA.",
    ],
    aliases: {
      id: ["name", "age", "occupation", "financial"],
      hpi: ["when did", "how long", "start", "course", "getting lost"],
      cognition: ["memory", "forget", "confused", "bills", "medications", "moca", "mmse", "orientation"],
      psychHistory: ["psychiatric history", "therapy", "hospitalized", "depression", "anxiety"],
      family: ["family history", "dementia", "alzheim"],
      medical: ["medical", "stroke", "hearing", "medications", "head injury", "alcohol"],
      personal: ["live", "daughter", "support", "daily activities", "drive", "pay bills"],
      mse: ["mood", "affect", "insight", "judgment"],
    },
    responses: {
      id: "I'm Margaret, 74, widowed, and I used to teach elementary school. My daughter helps me with the bills now.",
      hpi: "This has been creeping up for about a year. Last month I got lost driving somewhere familiar and mixed up my pills twice.",
      cognition: "I forget appointments, lose track of conversations, and need reminders more than I used to. My daughter keeps pushing for a memory test.",
      psychHistory: "No major psychiatric history. I've never been psychiatrically hospitalized.",
      family: "My mother had dementia later in life.",
      medical: "I have hypertension and high cholesterol. No stroke history. My hearing isn't perfect. No major alcohol or drug use.",
      personal: "I live alone, but my daughter comes by every other day. I can still bathe and dress myself, but she took over the bills and helps with medications.",
      mse: "I get frustrated when I can't remember things, but I still think I'm doing better than my daughter says.",
    },
    model: {
      idSection: "Name: Margaret L.\nMarital status: Widowed\nSex: Female\nOccupation: Retired teacher\nAge: 74\nFinancial situation: Stable, but daughter now assists with bills.",
      hpiSection: "Why present now: Progressive memory decline with functional consequences.\nOnset: Gradual over about 1 year.\nSymptoms: Forgetfulness, getting lost, bill and medication errors.\nCourse: Progressive worsening.",
      psychHxSection: "No major psychiatric illness or hospitalization reported.",
      famHxSection: "Mother had dementia later in life.",
      medicalSection: "Hypertension, hyperlipidemia, hearing impairment. No major alcohol or illicit drug issue.",
      personalSection: "Widowed, retired, lives alone, daughter provides support and has assumed bill and medication help.",
      mseSection: "Appearance/behavior: Cooperative, mildly defensive.\nSpeech: Normal.\nMood/affect: Frustrated / anxious.\nThought process: Generally linear.\nThought content: Limited awareness of severity.\nInsight: Partial.\nJudgment: Mildly impaired.\nOrientation/MMSE: Formal MMSE or MoCA indicated.",
      formulationSection: "Major neurocognitive disorder versus mild neurocognitive disorder depending formal assessment and functional threshold.",
      planSection: "CBC, CMP, TSH, B12, medication review, consider brain imaging depending context, caregiver involvement, outpatient memory workup unless acute safety concerns.",
    },
  },
];

function normalize(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(" ")
    .filter(Boolean)
    .join(" ");
}

function fuzzyIncludes(text, phrase) {
  return normalize(text).includes(normalize(phrase));
}

function getNoteTemplate() {
  const blank = {};
  noteSections.forEach(([key]) => {
    blank[key] = "";
  });
  return blank;
}

function getBlankMSE() {
  const blank = {};
  mseFields.forEach(([key]) => {
    blank[key] = "";
  });
  return blank;
}

function appendLine(existing, prefix, text) {
  if (!text) return existing || "";
  const line = `${prefix}${text}`;
  if ((existing || "").includes(line)) return existing || "";
  return existing ? `${existing}\n${line}` : line;
}

function getAutofillMeta(domain) {
  const map = {
    id: { field: "idSection", prefix: "ID: " },
    hpi: { field: "hpiSection", prefix: "HPI: " },
    mood: { field: "hpiSection", prefix: "Mood symptoms: " },
    mania: { field: "hpiSection", prefix: "Mania symptoms: " },
    psychosis: { field: "hpiSection", prefix: "Psychosis symptoms: " },
    anxiety: { field: "hpiSection", prefix: "Anxiety / trauma symptoms: " },
    safety: { field: "hpiSection", prefix: "Safety details: " },
    psychHistory: { field: "psychHxSection", prefix: "Psychiatric history: " },
    family: { field: "famHxSection", prefix: "Family history: " },
    medical: { field: "medicalSection", prefix: "Medical / substance history: " },
    personal: { field: "personalSection", prefix: "Personal / social history: " },
    mse: { field: "mseSection", prefix: "MSE themes: " },
    cognition: { field: "mseSection", prefix: "Cognition: " },
  };
  return map[domain];
}

function findDomain(caseItem, question, covered) {
  const q = normalize(question);
  const entries = Object.entries(caseItem.aliases || {});
  for (const [domain, words] of entries) {
    if (words.some((word) => fuzzyIncludes(q, word))) return domain;
  }
  const remaining = caseItem.interviewFlow.filter((domain) => !covered.includes(domain));
  return remaining[0] || "general";
}

function buildMSEPreview(mseState) {
  return mseFields
    .map(([key, label]) => (mseState[key] ? `${label}: ${mseState[key]}` : null))
    .filter(Boolean)
    .join("\n");
}

function buildTreatmentPlan(caseItem) {
  const tx = treatmentBuilders[caseItem.id];
  if (!tx) return "";
  const first = tx.options[0];
  return [
    `Priority: ${tx.priority}`,
    `Example medication strategy: ${first.med}${first.dose ? ` — ${first.dose}` : ""}`,
    `Rationale: ${first.why}`,
    `Monitoring: ${tx.monitoring.join(", ")}`,
    `Non-pharmacologic interventions: ${tx.nonpharm.join(", ")}`,
    `Follow-up / disposition: ${tx.followUp}`,
  ].join("\n");
}

function metricCard(label, value, tone) {
  return (
    <div style={{ background: theme.panel, border: `1px solid ${theme.line}`, borderRadius: 16, padding: 14, boxShadow: "0 6px 16px rgba(15,23,42,0.04)" }}>
      <div style={{ fontSize: 12, color: theme.sub, marginBottom: 5 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 900, color: tone }}>{value}</div>
    </div>
  );
}

function pill(text, bg, color) {
  return <span style={{ padding: "6px 10px", borderRadius: 999, background: bg, color, fontSize: 12, fontWeight: 800 }}>{text}</span>;
}

function readonlyBlock(title, value) {
  return (
    <div style={{ background: theme.soft, border: `1px solid ${theme.line}`, borderRadius: 16, padding: 14 }}>
      <div style={{ fontWeight: 900, marginBottom: 8 }}>{title}</div>
      <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6, color: theme.sub, fontSize: 14 }}>{value}</div>
    </div>
  );
}

export default function PsychiatrySimLab() {
  const [selectedCaseId, setSelectedCaseId] = useState(cases[0].id);
  const [question, setQuestion] = useState("");
  const [activeTab, setActiveTab] = useState("instructions");

  const [transcripts, setTranscripts] = useState(() => Object.fromEntries(cases.map((c) => [c.id, [{ role: "patient", text: c.opening }]])));
  const [coverage, setCoverage] = useState(() => Object.fromEntries(cases.map((c) => [c.id, []])));
  const [hints, setHints] = useState(() => Object.fromEntries(cases.map((c) => [c.id, 0])));
  const [notes, setNotes] = useState(() => Object.fromEntries(cases.map((c) => [c.id, getNoteTemplate()])));
  const [mseByCase, setMseByCase] = useState(() => Object.fromEntries(cases.map((c) => [c.id, getBlankMSE()])));

  const currentCase = useMemo(() => cases.find((c) => c.id === selectedCaseId) || cases[0], [selectedCaseId]);
  const currentTranscript = transcripts[selectedCaseId] || [];
  const currentCoverage = coverage[selectedCaseId] || [];
  const currentHints = hints[selectedCaseId] || 0;
  const currentNote = notes[selectedCaseId] || getNoteTemplate();
  const currentMSE = mseByCase[selectedCaseId] || getBlankMSE();
  const questionsAsked = currentTranscript.filter((x) => x.role === "student").length;
  const suggestedMinimum = currentCase.interviewFlow.length + 4;

  function askQuestion() {
    if (!question.trim()) return;
    const domain = findDomain(currentCase, question, currentCoverage);
    const answer = domain === "general" ? "Can you ask that another way? I want to answer you, I am just not sure what you mean." : currentCase.responses[domain];

    setTranscripts((prev) => ({
      ...prev,
      [selectedCaseId]: [...(prev[selectedCaseId] || []), { role: "student", text: question.trim() }, { role: "patient", text: answer }],
    }));

    if (domain !== "general") {
      setCoverage((prev) => ({
        ...prev,
        [selectedCaseId]: prev[selectedCaseId].includes(domain) ? prev[selectedCaseId] : [...prev[selectedCaseId], domain],
      }));

      const meta = getAutofillMeta(domain);
      if (meta) {
        setNotes((prev) => ({
          ...prev,
          [selectedCaseId]: {
            ...prev[selectedCaseId],
            [meta.field]: appendLine(prev[selectedCaseId][meta.field], meta.prefix, answer),
          },
        }));
      }
    }

    setQuestion("");
  }

  function requestHint() {
    const unanswered = currentCase.interviewFlow.filter((d) => !currentCoverage.includes(d));
    const next = unanswered[0];
    const hintText = next ? `Hint: You have not asked about ${next} yet. Try one of the suggested questions below.` : "Hint: You have covered the main interview areas. Move to your assessment and plan.";
    setHints((prev) => ({ ...prev, [selectedCaseId]: (prev[selectedCaseId] || 0) + 1 }));
    setTranscripts((prev) => ({
      ...prev,
      [selectedCaseId]: [...(prev[selectedCaseId] || []), { role: "hint", text: hintText }],
    }));
  }

  function updateNote(field, value) {
    setNotes((prev) => ({
      ...prev,
      [selectedCaseId]: {
        ...prev[selectedCaseId],
        [field]: value,
      },
    }));
  }

  function updateMSE(field, value) {
    setMseByCase((prev) => ({
      ...prev,
      [selectedCaseId]: {
        ...prev[selectedCaseId],
        [field]: value,
      },
    }));
  }

  function insertMSEIntoNote() {
    const text = buildMSEPreview(currentMSE);
    setNotes((prev) => ({
      ...prev,
      [selectedCaseId]: {
        ...prev[selectedCaseId],
        mseSection: text,
      },
    }));
    setActiveTab("student");
  }

  function insertTreatmentPlanIntoNote() {
    const text = buildTreatmentPlan(currentCase);
    if (!text) return;
    setNotes((prev) => ({
      ...prev,
      [selectedCaseId]: {
        ...prev[selectedCaseId],
        planSection: text,
      },
    }));
    setActiveTab("student");
  }

  const tabButton = (id, label) => (
    <button
      onClick={() => setActiveTab(id)}
      style={{
        border: "none",
        borderRadius: 999,
        padding: "10px 14px",
        cursor: "pointer",
        fontWeight: 900,
        background: activeTab === id ? currentCase.accent : "#f1f5f9",
        color: activeTab === id ? "white" : theme.ink,
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg,#eef2ff 0%, #f8fafc 48%, #ffffff 100%)", padding: 24, fontFamily: "Inter, system-ui, sans-serif", color: theme.ink }}>
      <div style={{ maxWidth: 1500, margin: "0 auto" }}>
        <div style={{ background: currentCase.accent, color: "white", borderRadius: 28, padding: 28, boxShadow: "0 18px 40px rgba(79,70,229,0.24)", marginBottom: 20 }}>
          <div style={{ fontSize: 36, fontWeight: 950 }}>Psychiatry Simulation Lab</div>
          <div style={{ marginTop: 8, maxWidth: 980, opacity: 0.96, lineHeight: 1.65 }}>
            Interview the patient, complete the MSE, build the psychiatric assessment, and compare your work with a model note.
          </div>
        </div>

        <div style={{ background: "white", border: `1px solid ${theme.line}`, borderRadius: 22, padding: 16, boxShadow: "0 10px 28px rgba(15,23,42,0.06)", marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 13, color: theme.sub, fontWeight: 800, letterSpacing: "0.08em" }}>SCENARIO LIBRARY</div>
              <div style={{ fontSize: 20, fontWeight: 950 }}>Choose a case to begin</div>
            </div>
            <div style={{ background: theme.soft, border: `1px solid ${theme.line}`, borderRadius: 14, padding: "10px 12px" }}>
              <div style={{ fontSize: 12, color: theme.sub, fontWeight: 800 }}>Current case</div>
              <div style={{ fontSize: 14, fontWeight: 900, marginTop: 4 }}>{currentCase.title}</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4 }}>
            {cases.map((item) => {
              const selected = item.id === selectedCaseId;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedCaseId(item.id);
                    setActiveTab("instructions");
                  }}
                  style={{
                    minWidth: 240,
                    textAlign: "left",
                    border: "none",
                    borderRadius: 18,
                    padding: 16,
                    cursor: "pointer",
                    background: selected ? item.accent : theme.soft,
                    color: selected ? "white" : theme.ink,
                    flexShrink: 0,
                  }}
                >
                  <div style={{ fontWeight: 900 }}>{item.label}</div>
                  <div style={{ fontSize: 13, marginTop: 6, opacity: selected ? 0.95 : 0.8 }}>{item.title}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) minmax(380px, 0.95fr)", gap: 22, alignItems: "start" }}>
          <div style={{ background: theme.panel, border: `1px solid ${theme.line}`, borderRadius: 28, padding: 22, boxShadow: "0 18px 36px rgba(15,23,42,0.08)", display: "grid", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 14, alignItems: "start", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 13, color: theme.sub, fontWeight: 800, letterSpacing: "0.08em", marginBottom: 6 }}>SIMULATION CONSOLE</div>
                <div style={{ fontSize: 26, fontWeight: 950 }}>{currentCase.title}</div>
                <div style={{ fontSize: 14, color: theme.sub, marginTop: 6 }}>Use open questions first, then clarify with focused follow-ups.</div>
              </div>
              <div style={{ background: theme.soft, border: `1px solid ${theme.line}`, borderRadius: 16, padding: 12, minWidth: 250 }}>
                <div style={{ fontWeight: 900, marginBottom: 6 }}>Observed presentation</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{currentCase.observed.map((item) => pill(item, "#ede9fe", "#6d28d9"))}</div>
              </div>
            </div>

            <div style={{ background: "linear-gradient(180deg,#f8fafc,#ffffff)", border: `1px solid ${theme.line}`, borderRadius: 20, padding: 16, minHeight: 460, maxHeight: 580, overflowY: "auto" }}>
              {currentTranscript.map((entry, index) => (
                <div key={`${entry.role}-${index}`} style={{ display: "flex", justifyContent: entry.role === "student" ? "flex-end" : "flex-start", marginBottom: 12 }}>
                  <div style={{ maxWidth: "80%", padding: 14, borderRadius: 18, background: entry.role === "student" ? currentCase.accent : entry.role === "hint" ? "#fff7ed" : "white", color: entry.role === "student" ? "white" : theme.ink, border: entry.role === "hint" ? "1px solid #fdba74" : `1px solid ${theme.line}` }}>
                    <div style={{ fontSize: 11, fontWeight: 900, opacity: 0.68, marginBottom: 4 }}>{entry.role === "student" ? "Student" : entry.role === "hint" ? "Hint" : "Patient"}</div>
                    {entry.text}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") askQuestion();
                }}
                placeholder="Ask the patient a question..."
                style={{ flex: 1, padding: 14, borderRadius: 16, border: "1px solid #cbd5e1", outline: "none", fontSize: 14, background: "white" }}
              />
              <button onClick={askQuestion} style={{ padding: "14px 18px", border: "none", borderRadius: 16, cursor: "pointer", fontWeight: 900, color: "white", background: currentCase.accent }}>
                Ask
              </button>
            </div>

            <div style={{ background: "#fff7ed", border: "1px solid #fdba74", borderRadius: 18, padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontWeight: 900 }}>Hint</div>
                <div style={{ fontSize: 13, color: "#92400e" }}>Use this only when the student is stuck.</div>
              </div>
              <button onClick={requestHint} style={{ padding: "10px 14px", border: "none", borderRadius: 12, cursor: "pointer", fontWeight: 900, color: "white", background: "linear-gradient(120deg,#f59e0b,#f97316)" }}>
                Ask for hint
              </button>
            </div>

            <div style={{ background: theme.soft, border: `1px solid ${theme.line}`, borderRadius: 18, padding: 14 }}>
              <div style={{ fontWeight: 900, marginBottom: 8 }}>Suggested next questions</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {currentCase.prompts.map((prompt) => (
                  <button key={prompt} onClick={() => setQuestion(prompt)} style={{ padding: "8px 10px", border: "none", borderRadius: 999, cursor: "pointer", fontSize: 12, fontWeight: 800, background: "#eef2ff", color: "#3730a3" }}>
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10 }}>
              {metricCard("Questions asked", questionsAsked, theme.indigo)}
              {metricCard("Suggested minimum", suggestedMinimum, theme.purple)}
              {metricCard("Hints used", currentHints, theme.amber)}
            </div>
          </div>

          <div style={{ background: theme.panel, border: `1px solid ${theme.line}`, borderRadius: 22, padding: 16, boxShadow: "0 10px 28px rgba(15,23,42,0.06)" }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
              {tabButton("instructions", "Instructions")}
              {tabButton("student", "Assessment form")}
              {tabButton("mse", "MSE lab")}
              {tabButton("treatment", "Psych meds & monitoring")}
              {tabButton("example", "Model note")}
              {tabButton("checklist", "Checklist & debrief")}
            </div>

            {activeTab === "instructions" ? (
              <div style={{ display: "grid", gap: 12, maxHeight: 840, overflowY: "auto" }}>
                {instructionsSteps.map((step, index) => (
                  <div key={step} style={{ background: theme.soft, border: `1px solid ${theme.line}`, borderRadius: 16, padding: 14 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
                      <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#4338ca", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 13 }}>{index + 1}</div>
                      <div style={{ fontWeight: 900 }}>Step {index + 1}</div>
                    </div>
                    <div style={{ fontSize: 14, color: theme.sub, lineHeight: 1.6 }}>{step}</div>
                  </div>
                ))}
              </div>
            ) : activeTab === "student" ? (
              <div style={{ display: "grid", gap: 12, maxHeight: 840, overflowY: "auto" }}>
                {noteSections.map(([key, label]) => (
                  <div key={key} style={{ background: theme.soft, border: `1px solid ${theme.line}`, borderRadius: 16, padding: 12 }}>
                    <div style={{ fontWeight: 900, marginBottom: 6 }}>{label}</div>
                    <textarea
                      value={currentNote[key]}
                      onChange={(e) => updateNote(key, e.target.value)}
                      style={{ width: "100%", minHeight: key === "hpiSection" || key === "formulationSection" || key === "planSection" ? 140 : 96, borderRadius: 12, border: "1px solid #cbd5e1", padding: 10, boxSizing: "border-box", resize: "vertical", fontFamily: "inherit", fontSize: 14, background: "white" }}
                    />
                  </div>
                ))}
              </div>
            ) : activeTab === "mse" ? (
              <div style={{ display: "grid", gap: 12, maxHeight: 840, overflowY: "auto" }}>
                {mseFields.map(([key, label]) => (
                  <div key={key} style={{ background: theme.soft, border: `1px solid ${theme.line}`, borderRadius: 16, padding: 12 }}>
                    <div style={{ fontWeight: 900, marginBottom: 6 }}>{label}</div>
                    <select value={currentMSE[key]} onChange={(e) => updateMSE(key, e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 12, border: "1px solid #cbd5e1", background: "white", fontFamily: "inherit" }}>
                      {mseOptions[key].map((option) => (
                        <option key={option || "blank"} value={option}>{option || `Select ${label.toLowerCase()}`}</option>
                      ))}
                    </select>
                  </div>
                ))}
                <div style={{ background: "#ecfeff", border: "1px solid #a5f3fc", borderRadius: 16, padding: 12 }}>
                  <div style={{ fontWeight: 900, marginBottom: 8, color: "#155e75" }}>Generated MSE preview</div>
                  <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6, fontSize: 14, color: theme.sub }}>{buildMSEPreview(currentMSE) || "Choose findings above to build the MSE."}</div>
                </div>
                <button onClick={insertMSEIntoNote} style={{ padding: "12px 14px", border: "none", borderRadius: 14, cursor: "pointer", fontWeight: 900, color: "white", background: currentCase.accent }}>
                  Insert MSE into student form
                </button>
              </div>
            ) : activeTab === "treatment" ? (
              <div style={{ display: "grid", gap: 12, maxHeight: 840, overflowY: "auto" }}>
                <div style={{ background: "#eef2ff", border: `1px solid ${theme.line}`, borderRadius: 16, padding: 14 }}>
                  <div style={{ fontWeight: 900, marginBottom: 6 }}>Treatment builder</div>
                  <div style={{ fontSize: 14, color: theme.sub, lineHeight: 1.6 }}>
                    This tab is for teaching treatment logic, not blind prescribing. Use it to connect diagnosis → medication reasoning → monitoring → follow-up.
                  </div>
                </div>
                <div style={{ background: "#fff7ed", border: "1px solid #fdba74", borderRadius: 16, padding: 14 }}>
                  <div style={{ fontWeight: 900, marginBottom: 6, color: "#92400e" }}>Priority</div>
                  <div style={{ fontSize: 14, color: "#92400e", lineHeight: 1.6 }}>{treatmentBuilders[currentCase.id].priority}</div>
                </div>
                {treatmentBuilders[currentCase.id].options.map((option) => (
                  <div key={option.title} style={{ background: theme.soft, border: `1px solid ${theme.line}`, borderRadius: 16, padding: 14 }}>
                    <div style={{ fontWeight: 900, marginBottom: 6 }}>{option.title}</div>
                    <div style={{ fontSize: 14, color: theme.sub, lineHeight: 1.6 }}><strong>Medication:</strong> {option.med}</div>
                    <div style={{ fontSize: 14, color: theme.sub, lineHeight: 1.6 }}><strong>Example starting approach:</strong> {option.dose}</div>
                    <div style={{ fontSize: 14, color: theme.sub, lineHeight: 1.6 }}><strong>Why this might fit:</strong> {option.why}</div>
                  </div>
                ))}
                <div style={{ background: theme.soft, border: `1px solid ${theme.line}`, borderRadius: 16, padding: 14 }}>
                  <div style={{ fontWeight: 900, marginBottom: 8 }}>Monitoring / labs / follow-up</div>
                  <div style={{ display: "grid", gap: 6, fontSize: 14, color: theme.sub, lineHeight: 1.55 }}>
                    {treatmentBuilders[currentCase.id].monitoring.map((item) => (
                      <div key={item}>• {item}</div>
                    ))}
                  </div>
                  <div style={{ marginTop: 10, fontSize: 14, color: theme.sub, lineHeight: 1.6 }}><strong>Follow-up:</strong> {treatmentBuilders[currentCase.id].followUp}</div>
                </div>
                <div style={{ background: theme.soft, border: `1px solid ${theme.line}`, borderRadius: 16, padding: 14 }}>
                  <div style={{ fontWeight: 900, marginBottom: 8 }}>Non-pharmacologic pieces</div>
                  <div style={{ display: "grid", gap: 6, fontSize: 14, color: theme.sub, lineHeight: 1.55 }}>
                    {treatmentBuilders[currentCase.id].nonpharm.map((item) => (
                      <div key={item}>• {item}</div>
                    ))}
                  </div>
                </div>
                <button onClick={insertTreatmentPlanIntoNote} style={{ padding: "12px 14px", border: "none", borderRadius: 14, cursor: "pointer", fontWeight: 900, color: "white", background: currentCase.accent }}>
                  Insert treatment plan into student form
                </button>
              </div>
            ) : activeTab === "example" ? (
              <div style={{ display: "grid", gap: 12, maxHeight: 840, overflowY: "auto" }}>
                {readonlyBlock("1. ID", currentCase.model.idSection)}
                {readonlyBlock("2. HPI Onset, Duration, Course", currentCase.model.hpiSection)}
                {readonlyBlock("3. Psychiatric Hx", currentCase.model.psychHxSection)}
                {readonlyBlock("4. Family Psychiatric Hx", currentCase.model.famHxSection)}
                {readonlyBlock("5–6. Medical Hx / Systems Review", currentCase.model.medicalSection)}
                {readonlyBlock("7. Personal Hx", currentCase.model.personalSection)}
                {readonlyBlock("8–9. MSE / Cognition", currentCase.model.mseSection)}
                {readonlyBlock("10–11. Impression / Formulation / Diagnosis", currentCase.model.formulationSection)}
                {readonlyBlock("12. Plan", currentCase.model.planSection)}
              </div>
            ) : (
              <div style={{ display: "grid", gap: 12, maxHeight: 840, overflowY: "auto" }}>
                {coreChecklist.map((group) => (
                  <div key={group.title} style={{ background: theme.soft, border: `1px solid ${theme.line}`, borderRadius: 16, padding: 12 }}>
                    <div style={{ fontWeight: 900, marginBottom: 8 }}>{group.title}</div>
                    <div style={{ display: "grid", gap: 6, fontSize: 14, color: theme.sub, lineHeight: 1.55 }}>
                      {group.questions.map((q) => (
                        <div key={q}>• {q}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
