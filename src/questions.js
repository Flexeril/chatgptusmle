export const questions = [
  {
    id: 1,
    subject: "Renal",
    system: "Kidney",
    difficulty: "Medium",
    tags: ["AKI", "ATN", "NSAIDs", "Urinalysis"],
    stem: `A 68-year-old man is brought to the emergency department by his wife because of worsening fatigue, decreased appetite, and swelling of his legs over the past 2 weeks. She says that over the last 2 days he has also seemed more confused and has had trouble following conversations. He has a history of hypertension, type 2 diabetes mellitus, and osteoarthritis of both knees. Three weeks ago, he developed worsening knee pain after helping his son move into a new apartment, and he has been taking an over-the-counter medication several times daily since then. His regular medications include lisinopril, hydrochlorothiazide, and metformin. He has no history of kidney disease.

On examination, temperature is 37.0°C, pulse is 96/min, respirations are 18/min, and blood pressure is 154/92 mm Hg. Bibasilar crackles are present. There is 2+ pitting edema of both lower extremities.

Laboratory studies show:
Sodium 138 mEq/L
Potassium 5.8 mEq/L
Bicarbonate 18 mEq/L
BUN 46 mg/dL
Creatinine 3.1 mg/dL

Two months ago, his creatinine was 1.0 mg/dL.

Urinalysis shows muddy brown granular casts.

Which of the following is the most likely underlying mechanism of this patient’s acute condition?`,
    options: {
      A: "Acute immune-mediated destruction of glomerular basement membrane",
      B: "Afferent arteriolar vasoconstriction causing decreased glomerular perfusion",
      C: "Eosinophilic infiltration of the renal interstitium due to drug hypersensitivity",
      D: "Deposition of antigen-antibody complexes in the mesangium and capillary loops",
      E: "Osmotic injury to the proximal tubular epithelium from filtered glucose",
      F: "Direct ischemic and toxic injury to renal tubular epithelial cells",
    },
    answer: "F",
    explanation:
      "Muddy brown granular casts point to acute tubular necrosis, caused by ischemic or toxic injury to tubular epithelial cells.",
  },

  {
    id: 2,
    subject: "Heme/Onc",
    system: "Hematology",
    difficulty: "Medium",
    tags: ["PNH", "Hemolysis", "Complement"],
    stem: `A 24-year-old woman comes to the physician because of fatigue, shortness of breath with exertion, and several episodes of dark urine in the morning over the past 4 months. She also reports intermittent abdominal pain. Examination shows mild conjunctival pallor.

Laboratory studies show:
Hemoglobin 8.9 g/dL
Leukocyte count 3,200/mm3
Platelet count 110,000/mm3
Reticulocyte count elevated
LDH elevated
Haptoglobin decreased
Direct antiglobulin test negative

A defect in which of the following processes is most likely responsible for this patient’s condition?`,
    options: {
      A: "Assembly of beta-globin chains",
      B: "Anchoring of complement-regulatory proteins to the cell membrane",
      C: "Synthesis of spectrin in the erythrocyte cytoskeleton",
      D: "Reduction of glutathione within erythrocytes",
      E: "Insertion of iron into protoporphyrin",
      F: "Class switching of immunoglobulin heavy chains",
    },
    answer: "B",
    explanation:
      "This is paroxysmal nocturnal hemoglobinuria due to defective anchoring of complement-regulatory proteins such as CD55 and CD59.",
  },

  {
    id: 3,
    subject: "Renal",
    system: "Kidney",
    difficulty: "Easy",
    tags: ["Nephritic syndrome", "PSGN", "Electron microscopy"],
    stem: `A 7-year-old boy is brought to the physician because of swelling around his eyes and ankles for 5 days. His mother says he had a sore throat about 2 weeks ago that resolved without treatment. Over the last 2 days, his urine has become dark. Blood pressure is elevated. Urinalysis shows hematuria and red blood cell casts. Serum complement C3 is decreased.

If a renal biopsy were performed, which of the following would most likely be seen on electron microscopy?`,
    options: {
      A: "Effacement of podocyte foot processes",
      B: "Subepithelial humps",
      C: "Linear IgG deposition along basement membrane",
      D: "Mesangial IgA deposition",
      E: "Tram-track appearance",
      F: "Wire-loop lesions",
    },
    answer: "B",
    explanation:
      "This is poststreptococcal glomerulonephritis, classically associated with subepithelial humps on electron microscopy.",
  },

  {
    id: 4,
    subject: "GI",
    system: "Gastrointestinal",
    difficulty: "Medium",
    tags: ["Colon cancer", "APC", "Adenoma-carcinoma sequence"],
    stem: `A 56-year-old man comes to the physician because of progressive fatigue and decreased exercise tolerance over the past 3 months. He has smoked 1 pack of cigarettes daily for 35 years. Physical examination shows conjunctival pallor. Colonoscopy reveals a large mass in the ascending colon. A biopsy specimen of this lesion is most likely to show a mutation in which of the following genes earliest in the typical sequence of tumor development?`,
    options: {
      A: "APC",
      B: "BRAF",
      C: "MLH1",
      D: "p53",
      E: "RAS",
      F: "SMAD4",
    },
    answer: "A",
    explanation:
      "In the classic adenoma-carcinoma sequence for colorectal cancer, APC mutation occurs early.",
  },

  {
    id: 5,
    subject: "Biochem",
    system: "Metabolism",
    difficulty: "Medium",
    tags: ["Urea cycle", "Hyperammonemia", "CPS I"],
    stem: `A newborn develops vomiting, lethargy, and seizures 2 days after birth. Laboratory studies show hyperammonemia. Orotic acid levels are decreased. Which of the following enzymes is most likely deficient?`,
    options: {
      A: "Arginase",
      B: "Carbamoyl phosphate synthetase I",
      C: "Dihydroorotate dehydrogenase",
      D: "Ornithine transcarbamylase",
      E: "UMP synthase",
      F: "Xanthine oxidase",
    },
    answer: "B",
    explanation:
      "Hyperammonemia with decreased orotic acid suggests carbamoyl phosphate synthetase I deficiency rather than OTC deficiency.",
  },
  {
  id: 6,
  subject: "Micro/Pharm",
  system: "Infectious Disease",
  difficulty: "Medium",
  tags: ["Endocarditis", "Viridans streptococci", "Aminoglycosides", "Protein synthesis inhibitors"],
  stem: `A 67-year-old woman with congenital bicuspid aortic valve is admitted to the hospital because of a 2-day history of fever and chills. Current medication is lisinopril. Temperature is 38.0°C (100.4°F), pulse is 90/min, respirations are 20/min, and blood pressure is 110/70 mm Hg. Cardiac examination shows a grade 3/6 systolic murmur that is best heard over the second right intercostal space. Blood culture grows viridans streptococci susceptible to penicillin. In addition to penicillin, an antibiotic synergistic to penicillin is administered that may shorten the duration of this patient's drug treatment. Which of the following is the most likely mechanism of action of this additional antibiotic on bacteria?`,
  options: {
    A: "Binding to DNA-dependent RNA polymerase",
    B: "Binding to the 30S ribosomal subunit",
    C: "Competition with para-aminobenzoic acid",
    D: "Inhibition of dihydrofolate reductase",
    E: "Inhibition of DNA gyrase",
  },
  answer: "B",
  explanation:
    "Viridans streptococcal endocarditis can be treated with penicillin plus an aminoglycoside for synergistic killing and shorter treatment duration. Aminoglycosides bind the 30S ribosomal subunit.",
},

{
  id: 7,
  subject: "GI",
  system: "Hepatobiliary",
  difficulty: "Medium",
  tags: ["Bilirubin", "Gilbert syndrome", "Unconjugated hyperbilirubinemia"],
  stem: `A 12-year-old girl is brought to the physician because of a 2-month history of intermittent yellowing of the eyes and skin. Physical examination shows no abnormalities except for jaundice. Her serum total bilirubin concentration is 3 mg/dL, with a direct component of 1 mg/dL. Serum studies show a haptoglobin concentration and AST and ALT activities that are within the reference ranges. There is no evidence of injury or exposure to toxins. Which of the following additional findings is most likely in this patient?`,
  options: {
    A: "Decreased activity of UDP glucuronosyltransferase",
    B: "Gallstones",
    C: "Increased hemolysis",
    D: "Increased serum alkaline phosphatase activity",
    E: "Ineffective erythropoiesis",
  },
  answer: "A",
  explanation:
    "This patient has mild intermittent unconjugated hyperbilirubinemia with otherwise normal liver studies and no evidence of hemolysis, consistent with Gilbert syndrome, caused by decreased UDP glucuronosyltransferase activity.",
},
  {
  id: 8,
  subject: "Pharm",
  system: "Autonomics",
  difficulty: "Medium",
  tags: ["Muscarinic receptors", "Acetylcholine", "Smooth muscle", "Cholinesterase inhibitors"],
  stem: `During an experiment, drug X is added to a muscle bath containing a strip of guinea pig intestinal smooth muscle. Agonists are then added to the bath, and the resultant effects on muscle tension are shown below.

Agonist                     Muscle Tension Before Drug X (g)    Muscle Tension After Drug X (g)
Vehicle                     6.0                                 6.1
Acetylcholine               11.3                                18.5
Norepinephrine              4.1                                 4.2

Which of the following types of drugs is most likely to produce effects most similar to those of drug X?`,
  options: {
    A: "Alpha-1 adrenergic antagonist",
    B: "Beta-adrenergic antagonist",
    C: "Cholinesterase inhibitor",
    D: "Monoamine oxidase inhibitor",
    E: "Muscarinic antagonist",
  },
  answer: "C",
  explanation:
    "Drug X selectively increases the response to acetylcholine without changing the response to norepinephrine, which is most consistent with a cholinesterase inhibitor that increases synaptic acetylcholine.",
  },
  {
    id: 9,
    subject: "OB/GYN",
    system: "Reproductive",
    difficulty: "Easy",
    tags: ["Rh incompatibility", "Anti-D immune globulin", "Alloimmunization"],
    stem: `A 30-year-old woman, gravida 2, para 0, aborta 1, at 28 weeks' gestation comes to the office for a prenatal visit. She has had one previous pregnancy resulting in a spontaneous abortion at 12 weeks' gestation. Today, her vital signs are within normal limits. Physical examination shows a uterus consistent in size with a 28-week gestation. Fetal ultrasonography shows a male fetus with no abnormalities. Her blood group is O, Rh-negative. The father's blood group is B, Rh-positive. The physician recommends administration of Rho(D) immune globulin to the patient. This treatment is most likely to prevent which of the following in this mother?`,
    options: {
      A: "Development of natural killer cells",
      B: "Development of polycythemia",
      C: "Formation of antibodies to RhD",
      D: "Generation of IgM antibodies from fixing complement in the fetus",
      E: "Immunosuppression caused by RhD on erythrocytes from the fetus",
    },
    answer: "C",
    explanation:
      "Rho(D) immune globulin is administered to Rh-negative mothers to prevent maternal sensitization (alloimmunization) and the subsequent formation of antibodies against Rh-positive fetal red blood cells.",
  },

  {
    id: 10,
    subject: "Cardiology",
    system: "Cardiovascular",
    difficulty: "Medium",
    tags: ["Cardiac tamponade", "Electrical alternans", "Pulsus paradoxus", "Uremic pericarditis"],
    stem: `A 55-year-old man is brought to the emergency department because of shortness of breath and confusion for 4 hours. He has hypertension and chronic kidney disease requiring hemodialysis. An ECG shows low voltage with electrical alternans. Physical examination is most likely to show which of the following findings?`,
    options: {
      A: "BP: 85/60 | Pulse: 120 | JVP: increased | Pulsus Paradoxus: increased",
      B: "BP: 85/60 | Pulse: 120 | JVP: increased | Pulsus Paradoxus: normal",
      C: "BP: 85/60 | Pulse: 120 | JVP: normal | Pulsus Paradoxus: normal",
      D: "BP: 120/80 | Pulse: 80 | JVP: increased | Pulsus Paradoxus: increased",
      E: "BP: 120/80 | Pulse: 80 | JVP: normal | Pulsus Paradoxus: increased",
      F: "BP: 120/80 | Pulse: 80 | JVP: normal | Pulsus Paradoxus: normal",
    },
    answer: "A",
    explanation:
      "The combination of electrical alternans and low voltage in a patient with CKD (predisposing to uremic pericarditis) strongly suggests cardiac tamponade. Tamponade presents with Beck's triad (hypotension, JVD, muffled heart sounds) and pulsus paradoxus.",
  },

  {
    id: 11,
    subject: "Endocrine/Pharm",
    system: "Endocrine",
    difficulty: "Easy",
    tags: ["Metformin", "Diabetes mellitus", "Gluconeogenesis"],
    stem: `A 52-year-old woman begins pharmacotherapy after being diagnosed with type 2 diabetes mellitus. Four weeks later, her hepatic glucose output is decreased, and target tissue glucose uptake and utilization are increased. Which of the following drugs was most likely prescribed for this patient?`,
    options: {
      A: "Acarbose",
      B: "Glyburide",
      C: "Metformin",
      D: "Nateglinide",
      E: "Repaglinide",
    },
    answer: "C",
    explanation:
      "Metformin's primary mechanism of action is the inhibition of hepatic gluconeogenesis (decreasing glucose output) and increasing peripheral glucose uptake and insulin sensitivity.",
  },
  {
    id: 12,
    subject: "Heme/Onc",
    system: "Hematology",
    difficulty: "Easy",
    tags: ["Thrombocytopenia", "HIV", "Primary hemostasis"],
    stem: `An asymptomatic 44-year-old man is found to have HIV infection during routine screening prior to donating blood. A complete blood count done at the time of the screening shows:

Hemoglobin: 10 g/dL
Hematocrit: 30%
Leukocyte count: 4600/mm³
Platelet count: 15,000/mm³
Prothrombin time: 12 sec (INR=1.1)
Partial thromboplastin time: 23 sec

Which of the following physical findings is most likely in this patient?`,
    options: {
      A: "Deep venous thrombosis",
      B: "Hemarthrosis",
      C: "Petechiae",
      D: "Subungual hemorrhage",
      E: "Visceral hematoma",
    },
    answer: "C",
    explanation:
      "The patient has severe thrombocytopenia (platelets < 20,000/mm³). Defects in primary hemostasis typically present with mucocutaneous bleeding, such as petechiae, purpura, or epistaxis.",
  },

  {
    id: 13,
    subject: "Immuno",
    system: "Immune System",
    difficulty: "Medium",
    tags: ["Serum sickness", "Type III hypersensitivity", "Immune complexes"],
    stem: `A 23-year-old woman with bone marrow failure is treated with a large dose of rabbit antithymocyte globulin. Ten days later, she develops fever, lymphadenopathy, arthralgias, and erythema on her hands and feet. Which of the following is the most likely cause of these symptoms?`,
    options: {
      A: "Cytokine secretion by natural killer cells",
      B: "Eosinophil degranulation",
      C: "Immune complex deposition in tissues",
      D: "Polyclonal T-lymphocyte activation",
      E: "Widespread apoptosis of B lymphocytes",
    },
    answer: "C",
    explanation:
      "This is a classic presentation of serum sickness, a type III hypersensitivity reaction occurring 5-14 days after exposure to foreign proteins. It is caused by the deposition of circulating immune complexes in tissues, which then fix complement.",
  },

  {
    id: 14,
    subject: "Ethics/Psych",
    system: "Behavioral Health",
    difficulty: "Easy",
    tags: ["Pain management", "Addiction risk", "Patient reassurance"],
    stem: `After being severely beaten and sustaining a gunshot wound to the abdomen, a 42-year-old woman undergoes resection of a perforated small bowel. During the operation, plastic reconstruction of facial fractures, and open reduction and internal fixation of the left femur are also done. Thirty-six hours postoperatively, she is awake but not completely alert. She is receiving intravenous morphine via a patient-controlled pump. She says that she needs the morphine to treat her pain, but she is worried that she is becoming addicted. She has no history of substance use disorder. She drinks one to two glasses of wine weekly. Which of the following initial actions by the physician is most appropriate?`,
    options: {
      A: "Reassure the patient that her chance of becoming addicted to narcotics is minuscule",
      B: "Maintain the morphine, but periodically administer intravenous naloxone",
      C: "Switch the patient to oral acetaminophen as soon as she can take medication orally",
      D: "Switch the patient to intramuscular lorazepam",
      E: "Switch the patient to intravenous phenobarbital",
    },
    answer: "A",
    explanation:
      "In the setting of acute, severe post-operative pain, the risk of developing a substance use disorder from short-term opioid use is very low, especially in a patient with no prior history. Reassurance is the best first step.",
  },

  {
    id: 15,
    subject: "Biochem",
    system: "Metabolism",
    difficulty: "Medium",
    tags: ["Malonyl-CoA", "Fatty acid oxidation", "Beta-oxidation", "CAT-1"],
    stem: `Six healthy subjects participate in a study of muscle metabolism during which hyperglycemia and hyperinsulinemia is induced. Muscle biopsy specimens obtained from the subjects during the resting state show significantly increased concentrations of malonyl-CoA. The increased malonyl-CoA concentration most likely directly inhibits which of the following processes in these subjects?`,
    options: {
      A: "Fatty acid oxidation",
      B: "Fatty acid synthesis",
      C: "Gluconeogenesis",
      D: "Glycogenolysis",
      E: "Glycolysis",
      F: "Oxidative phosphorylation",
    },
    answer: "A",
    explanation:
      "Malonyl-CoA is a potent inhibitor of carnitine acyltransferase I (CAT-1), the rate-limiting enzyme for the transport of fatty acids into the mitochondria. High levels thus inhibit beta-oxidation (fatty acid oxidation).",
  },

  {
    id: 16,
    subject: "Stats",
    system: "Public Health",
    difficulty: "Medium",
    tags: ["Clinical trial", "Study design", "Open-labeled study"],
    stem: `Over 1 year, a study is conducted to assess the antileukemic activity of a new tyrosine kinase inhibitor in patients with chronic myeloid leukemia in blast crisis. All patients enrolled in the study are informed that they would be treated with the tyrosine kinase inhibitor. They are assigned to successive dose cohorts of 300 to 1000 mg/day of the drug. Six to eight patients are assigned to each dose. Treatment efficacy is determined based on the results of complete blood counts and bone marrow assessments conducted regularly throughout the study. This study is best described as which of the following?`,
    options: {
      A: "Case-control study",
      B: "Crossover study",
      C: "Open-labeled clinical trial",
      D: "Randomized clinical trial",
      E: "Single-blind, randomized, controlled trial",
    },
    answer: "C",
    explanation:
      "Because both the researchers and the participants know which treatment is being administered (no blinding or placebo control was mentioned), this is an open-labeled clinical trial.",
  },
  {
    id: 17,
    subject: "Heme/Onc",
    system: "Cardiovascular",
    difficulty: "Easy",
    tags: ["Trousseau syndrome", "Pancreatic cancer", "DVT", "Hypercoagulability"],
    stem: `A 63-year-old man is brought to the emergency department because of a 4-day history of increasingly severe left leg pain and swelling of his left calf. He also has a 1-month history of increasingly severe upper midthoracic back pain. During this time, he has had a 9-kg (20-lb) weight loss despite no change in appetite. He has no history of major medical illness. His only medication is ibuprofen. He is 180 cm (5 ft 11 in) tall and weighs 82 kg (180 lb); BMI is 25 kg/m². His vital signs are within normal limits. On examination, lower extremity pulses are palpable bilaterally. The remainder of the physical examination shows no abnormalities. An x-ray of the thoracic spine shows no abnormalities. A CT scan of the abdomen shows a 3-cm mass in the body of the pancreas; there are liver metastases and encasement of the superior mesenteric artery. Ultrasonography of the left lower extremity shows a femoropopliteal venous clot. Which of the following is the most likely cause of this patient’s symptoms?`,
    options: {
      A: "Carcinoid syndrome",
      B: "Hypercoagulability from advanced malignancy",
      C: "Multiple endocrine neoplasia",
      D: "Splenic artery aneurysm and embolic disease of the left lower extremity",
      E: "Superior mesenteric artery syndrome",
    },
    answer: "B",
    explanation:
      "This patient presents with a pancreatic mass and a DVT, consistent with Trousseau syndrome (migratory thrombophlebitis or hypercoagulability of malignancy), where procoagulants released by the tumor lead to venous thrombosis.",
  },

  {
    id: 18,
    subject: "OB/GYN",
    system: "Reproductive",
    difficulty: "Medium",
    tags: ["Sertoli-Leydig tumor", "Virilization", "Ovarian mass", "Androgens"],
    stem: `A 40-year-old woman comes to the physician because of a 6-month history of increased facial hair growth. Her last menstrual period was 4 months ago. She is 165 cm (5 ft 5 in) tall and weighs 70 kg (154 lb); BMI is 26 kg/m². Her pulse is 80/min, and blood pressure is 130/82 mm Hg. Physical examination shows temporal balding and coarse dark hair on the upper lip and chin. Pelvic examination shows clitoral enlargement. Her serum testosterone concentration is increased. Serum concentrations of androstenedione, dehydroepiandrosterone, and urinary 17-ketosteroids are within the reference ranges. Ultrasonography of the pelvis shows a 12-cm ovarian mass. Which of the following best describes this mass?`,
    options: {
      A: "Granulosa tumor",
      B: "Ovarian carcinoid",
      C: "Sertoli-Leydig tumor",
      D: "Teratoma",
      E: "Thecoma",
    },
    answer: "C",
    explanation:
      "The rapid onset of virilization (clitoromegaly, balding, hirsutism) and an ovarian mass associated with high testosterone but normal adrenal androgens (DHEA) points to a Sertoli-Leydig cell tumor.",
  },

  {
    id: 19,
    subject: "Pathophysiology",
    system: "Immune System",
    difficulty: "Medium",
    tags: ["Inflammation", "Vascular permeability", "Edema", "Exudate"],
    stem: `A 35-year-old man comes to the physician because of pain and swelling of his right arm where he scraped it on a tree branch 2 days ago. His temperature is 38.3°C (101°F). Examination of the right forearm shows edema around a fluctuant erythematous lesion at the site of trauma. The area is extremely tender to palpation. Which of the following is most likely the primary mechanism of the development of edema in this patient?`,
    options: {
      A: "Degranulation of eosinophils",
      B: "Disruption of vascular basement membranes",
      C: "Increased hydrostatic pressure",
      D: "Release of thromboxane",
      E: "Separation of endothelial junctions",
    },
    answer: "E",
    explanation:
      "Inflammatory edema (exudate) is primarily caused by increased vascular permeability, which results from the contraction of endothelial cells and the subsequent separation of endothelial junctions, usually mediated by histamine, bradykinin, and leukotrienes.",
  },

  {
    id: 20,
    subject: "Neurology",
    system: "Nervous System",
    difficulty: "Medium",
    tags: ["Parinaud syndrome", "Pineal tumor", "Upward gaze", "Midbrain"],
    stem: `A 12-year-old boy is brought to the physician because of a 2-month history of headaches and a 6-day history of nausea and vomiting. Funduscopic examination shows bilateral papilledema. He walks with a broad-based gait. An MRI of the brain shows a tumor in the pineal region compressing the brain stem and leading to hydrocephalus. This patient most likely has impairment of which of the following oculomotor functions?`,
    options: {
      A: "Abduction",
      B: "Horizontal pursuit",
      C: "Optokinetic nystagmus",
      D: "Upward gaze",
      E: "Vestibulo-ocular reflex",
    },
    answer: "D",
    explanation:
      "A pineal region tumor can compress the dorsal midbrain (pretectal area and superior colliculi), causing Parinaud syndrome. The hallmark finding is a vertical gaze palsy, specifically an inability to look upward.",
  },
  {
  id: 20,
  subject: "Immunology",
  system: "Dermatology",
  difficulty: "Medium",
  tags: ["Hypersensitivity", "Contact dermatitis", "T cells", "Langerhans cells"],
  image: "/images/contact-dermatitis-rash.png",
  stem: `A 22-year-old woman comes to the office because of a 4-day history of an itchy, red rash on her right arm. She has no history of major medical illness and takes no medications. She says she has recently used a new hair dye. She is 165 cm (5 ft 5 in) tall and weighs 61 kg (135 lb); BMI is 23 kg/m². Her temperature is 37.0°C (98.6°F), pulse is 70/min, respirations are 22/min, and blood pressure is 115/70 mm Hg. Examination of the right forearm shows the findings in the photograph. Which of the following ligand → receptor pairs most likely played a primary role in the proliferation of the T lymphocytes present at the site of the rash?`,
  options: {
    A: "CD2 on T lymphocytes → intercellular adhesion molecule (ICAM)-3 on epidermal Langerhans cells",
    B: "CD28 on T lymphocytes → CD80 on epidermal Langerhans cells",
    C: "CD40L on T lymphocytes → CD40 on epidermal Langerhans cells",
    D: "CD45 on T lymphocytes → CD28 on epidermal Langerhans cells",
    E: "Lymphocyte function-associated antigen-1 on T lymphocytes → ICAM1 on epidermal Langerhans cells",
  },
  answer: "B",
  explanation:
    "This is allergic contact dermatitis, a type IV hypersensitivity reaction mediated by T cells. T-cell activation and proliferation require costimulation, especially CD28 on T cells binding CD80/CD86 on antigen-presenting cells such as Langerhans cells.",
  },
];