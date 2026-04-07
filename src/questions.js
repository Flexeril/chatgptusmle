export const questions = [
  {
    id: 1,
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
    subject: "Renal",
  },
  {
    id: 2,
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
    subject: "Heme/Onc",
  },
  {
    id: 3,
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
    subject: "Renal",
  },
  {
    id: 4,
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
    subject: "GI",
  },
  {
    id: 5,
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
    subject: "Biochem",
  },
];