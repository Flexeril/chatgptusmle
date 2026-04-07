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
];