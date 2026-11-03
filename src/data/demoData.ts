import { AnalysisResult, PatientProfile, TestTrendItem } from '../types';

export const DEMO_PATIENT: PatientProfile = {
  name: 'Alex Morgan',
  age: 42,
  gender: 'Male',
  height: '178 cm (5 ft 10 in)',
  weight: '84 kg (185 lbs)',
  existingConditions: ['Slightly Elevated Blood Pressure'],
  lifestyle: {
    smoking: 'Never',
    alcohol: 'Occasional',
    activityLevel: 'Lightly active',
    dietType: 'Standard Western Diet (Moderate carbs/processed foods)',
  },
  familyHistory: 'Father diagnosed with Type 2 Diabetes at age 55; maternal grandfather had coronary heart disease.',
};

export const DEMO_ANALYSIS: AnalysisResult = {
  id: 'demo-report-current',
  reportDate: new Date().toISOString().split('T')[0],
  uploadedFileName: 'Demo_Comprehensive_Metabolic_Lipid_Panel.pdf',
  isDemo: true,
  patientProfile: DEMO_PATIENT,
  aiSummary:
    'The laboratory evaluation displays key indicators warranting attention, specifically in carbohydrate metabolism (fasting blood glucose and HbA1c in the pre-diabetes threshold) and lipid profiles (mildly elevated LDL cholesterol and triglycerides). Hemoglobin and Vitamin D also demonstrate lower-than-optimal levels. Kidney and liver enzyme parameters remain comfortably within standard reference limits.',
  riskAssessment: {
    riskLevel: 'Moderate',
    summaryText:
      'Moderate overall risk profile driven primarily by early metabolic markers (mildly elevated blood sugar and glycated hemoglobin) accompanied by borderline lipid elevation and suboptimal Vitamin D. These non-diagnostic flags represent manageable metabolic patterns that respond well to proactive nutritional, physical activity, and physician-guided interventions.',
    keyFindings: [
      'Elevated Fasting Glucose (118 mg/dL) and HbA1c (5.9%) suggesting early metabolic stress',
      'Borderline-High Total Cholesterol (224 mg/dL) and LDL (142 mg/dL)',
      'Mildly Elevated Triglycerides (195 mg/dL)',
      'Below-range Hemoglobin (10.8 g/dL) indicating mild anemia tendencies',
      'Suboptimal Vitamin D 25-OH (18.2 ng/mL)',
      'Preserved Liver and Kidney filtration markers (Creatinine, ALT, AST normal)',
    ],
    normalCount: 6,
    abnormalCount: 6,
    totalCount: 12,
  },
  tests: [
    {
      id: 'demo-1',
      testName: 'Hemoglobin',
      category: 'Complete Blood Count (CBC)',
      resultValue: '10.8',
      numericValue: 10.8,
      unit: 'g/dL',
      referenceRange: '13.5 - 17.5',
      minRange: 13.5,
      maxRange: 17.5,
      status: 'Low',
      generalExplanation:
        'Hemoglobin is an iron-rich protein in red blood cells responsible for carrying oxygen from the lungs throughout the entire body.',
      abnormalExplanation:
        'A value below 13.5 g/dL can be associated with insufficient dietary iron, decreased red blood cell production, minor occult blood loss, or vitamin deficiencies (such as B12 or folate).',
      healthRelevance:
        'Suboptimal levels may cause feelings of generalized fatigue, reduced exercise stamina, mild brain fog, or pale skin tone.',
      cautiousNote:
        'A low result does not confirm chronic disease; it should be explored with a primary care physician to check iron stores (ferritin) and complete red cell indices.',
    },
    {
      id: 'demo-2',
      testName: 'Fasting Blood Glucose',
      category: 'Metabolic & Carbohydrate',
      resultValue: '118',
      numericValue: 118,
      unit: 'mg/dL',
      referenceRange: '70 - 99',
      minRange: 70,
      maxRange: 99,
      status: 'High',
      generalExplanation:
        'Measures the concentration of circulating glucose in the blood stream after an overnight fasting period (minimum 8 to 12 hours).',
      abnormalExplanation:
        'Elevations above 100 mg/dL may reflect reduced cellular insulin sensitivity, recent carbohydrate-heavy meals before testing, acute stress, or poor sleep prior to blood draw.',
      healthRelevance:
        'Fasting glucose between 100 and 125 mg/dL is frequently categorized by health guidelines as impaired fasting glucose, highlighting an early window where diet and exercise can prevent long-term blood sugar complications.',
      cautiousNote:
        'A single reading can fluctuate due to hydration, acute illness, or stress; clinical guidelines recommend repeat testing alongside HbA1c before drawing conclusions.',
    },
    {
      id: 'demo-3',
      testName: 'HbA1c (Glycated Hemoglobin)',
      category: 'Metabolic & Carbohydrate',
      resultValue: '5.9',
      numericValue: 5.9,
      unit: '%',
      referenceRange: '4.0 - 5.6',
      minRange: 4.0,
      maxRange: 5.6,
      status: 'High',
      generalExplanation:
        'Reflects the weighted average percentage of hemoglobin bound to glucose over the lifespan of red blood cells (approximately the past 2 to 3 months).',
      abnormalExplanation:
        'An HbA1c between 5.7% and 6.4% often correlates with sustained mild glucose elevations and reduced peripheral insulin sensitivity.',
      healthRelevance:
        'Provides a reliable, long-term metric of glucose regulation, unswayed by day-to-day dietary fluctuations.',
      cautiousNote:
        'This metric serves as a valuable early alert for lifestyle optimization; it is not an automatic diagnosis of diabetes.',
    },
    {
      id: 'demo-4',
      testName: 'Total Cholesterol',
      category: 'Lipid Panel',
      resultValue: '224',
      numericValue: 224,
      unit: 'mg/dL',
      referenceRange: '< 200',
      minRange: 100,
      maxRange: 199,
      status: 'High',
      generalExplanation:
        'Calculates the composite sum of all cholesterol molecules circulating in your bloodstream, including LDL, HDL, and VLDL particles.',
      abnormalExplanation:
        'Can be elevated due to dietary saturated fat intake, genetic predisposition, reduced metabolic clearance, or physical inactivity.',
      healthRelevance:
        'Higher total cholesterol values, particularly when driven by elevated non-HDL particles, represent a cumulative risk factor for arterial wall plaque formation over decades.',
      cautiousNote:
        'Total cholesterol must always be interpreted in combination with HDL, LDL, and triglyceride fractions rather than in isolation.',
    },
    {
      id: 'demo-5',
      testName: 'LDL Cholesterol',
      category: 'Lipid Panel',
      resultValue: '142',
      numericValue: 142,
      unit: 'mg/dL',
      referenceRange: '< 100',
      minRange: 50,
      maxRange: 99,
      status: 'High',
      generalExplanation:
        'Often colloquially termed "low-density lipoprotein," this carries cholesterol from the liver to tissues.',
      abnormalExplanation:
        'Levels in the 130–159 mg/dL bracket are deemed borderline-high and may stem from dietary patterns, insulin resistance, or slower hepatic receptor clearance.',
      healthRelevance:
        'Excess circulating LDL particles can slowly penetrate endothelial vessel linings, contributing to atherosclerosis over extended time horizons.',
      cautiousNote:
        'Lifestyle modifications focusing on soluble fiber, omega-3 fatty acids, and aerobic exercise can significantly improve LDL clearance.',
    },
    {
      id: 'demo-6',
      testName: 'HDL Cholesterol',
      category: 'Lipid Panel',
      resultValue: '41',
      numericValue: 41,
      unit: 'mg/dL',
      referenceRange: '> 40',
      minRange: 40,
      maxRange: 90,
      status: 'Normal',
      generalExplanation:
        'High-Density Lipoprotein functions as the "reverse cholesterol transport" vehicle, picking up surplus vascular cholesterol and returning it to the liver for disposal.',
      abnormalExplanation: '',
      healthRelevance:
        'A value of 41 mg/dL meets minimum clinical criteria for men, though optimizing closer to 50+ mg/dL via vigorous activity and healthy fats provides stronger vascular protection.',
      cautiousNote: 'Currently within expected baseline parameters.',
    },
    {
      id: 'demo-7',
      testName: 'Triglycerides',
      category: 'Lipid Panel',
      resultValue: '195',
      numericValue: 195,
      unit: 'mg/dL',
      referenceRange: '< 150',
      minRange: 40,
      maxRange: 149,
      status: 'High',
      generalExplanation:
        'The most common type of fat stored in the body, derived directly from unused dietary calories, sugars, and simple carbohydrates.',
      abnormalExplanation:
        'Mild elevation (150–199 mg/dL) frequently mirrors higher intake of refined carbs, added sugars, alcohol, or decreased physical conditioning.',
      healthRelevance:
        'Elevated triglycerides commonly coincide with insulin resistance and can heighten cardiovascular and endothelial inflammation.',
      cautiousNote:
        'Triglycerides are remarkably responsive to dietary changes, often dropping significantly within weeks of reducing simple sugars and alcohol.',
    },
    {
      id: 'demo-8',
      testName: 'Serum Creatinine',
      category: 'Renal / Kidney Function',
      resultValue: '0.95',
      numericValue: 0.95,
      unit: 'mg/dL',
      referenceRange: '0.7 - 1.3',
      minRange: 0.7,
      maxRange: 1.3,
      status: 'Normal',
      generalExplanation:
        'A natural breakdown byproduct of muscle creatine metabolism, filtered out almost entirely by healthy kidney glomeruli.',
      abnormalExplanation: '',
      healthRelevance:
        'A level of 0.95 mg/dL indicates solid, unobstructed glomerular filtration and stable renal excretion capability.',
      cautiousNote: 'Healthy kidney function demonstrated.',
    },
    {
      id: 'demo-9',
      testName: 'ALT (Alanine Aminotransferase)',
      category: 'Hepatic / Liver Function',
      resultValue: '38',
      numericValue: 38,
      unit: 'U/L',
      referenceRange: '7 - 56',
      minRange: 7,
      maxRange: 56,
      status: 'Normal',
      generalExplanation:
        'An intracellular enzyme found primarily in liver parenchymal cells that converts proteins into cellular energy.',
      abnormalExplanation: '',
      healthRelevance:
        'Normal levels suggest no active acute liver cell membrane inflammation or hepatocellular stress.',
      cautiousNote: 'Optimal hepatic biomarker.',
    },
    {
      id: 'demo-10',
      testName: 'AST (Aspartate Aminotransferase)',
      category: 'Hepatic / Liver Function',
      resultValue: '32',
      numericValue: 32,
      unit: 'U/L',
      referenceRange: '10 - 40',
      minRange: 10,
      maxRange: 40,
      status: 'Normal',
      generalExplanation:
        'An enzyme aiding amino acid metabolism, located predominantly in liver tissue, cardiac muscle, and skeletal muscle cells.',
      abnormalExplanation: '',
      healthRelevance:
        'Normal AST alongside normal ALT demonstrates balanced cellular metabolism in liver and muscle tissue.',
      cautiousNote: 'Within expected parameters.',
    },
    {
      id: 'demo-11',
      testName: 'TSH (Thyroid Stimulating Hormone)',
      category: 'Endocrine & Thyroid',
      resultValue: '2.45',
      numericValue: 2.45,
      unit: 'mIU/L',
      referenceRange: '0.4 - 4.0',
      minRange: 0.4,
      maxRange: 4.0,
      status: 'Normal',
      generalExplanation:
        'A pituitary signaling hormone that regulates the synthesis and secretion of thyroxine (T4) and triiodothyronine (T3) by the thyroid gland.',
      abnormalExplanation: '',
      healthRelevance:
        'A value of 2.45 mIU/L lies squarely in the optimal physiologic middle, reflecting balanced basal metabolic rate command.',
      cautiousNote: 'Normal endocrine thyroid balance.',
    },
    {
      id: 'demo-12',
      testName: 'Vitamin D, 25-Hydroxy',
      category: 'Vitamins & Micronutrients',
      resultValue: '18.2',
      numericValue: 18.2,
      unit: 'ng/mL',
      referenceRange: '30 - 100',
      minRange: 30,
      maxRange: 100,
      status: 'Low',
      generalExplanation:
        'A fat-soluble prohormone vital for calcium homeostasis, bone mineralization, immune surveillance, and neuromuscular function.',
      abnormalExplanation:
        'Readings below 20 ng/mL represent insufficiency commonly stemming from low UV sunlight exposure, limited dietary fortification, or suboptimal absorption.',
      healthRelevance:
        'Chronically low levels can contribute to muscle aches, bone density diminishment, and suboptimal immune cell activation.',
      cautiousNote:
        'Easily manageable via physician-guided dietary supplementation and sensible outdoor sunlight exposure.',
    },
  ],
  riskCategories: [
    {
      id: 'risk-1',
      title: 'Blood Sugar & Carbohydrate Metabolism',
      categoryKey: 'blood_sugar',
      riskLevel: 'Moderate',
      relevantParameters: ['Fasting Blood Glucose (118 mg/dL)', 'HbA1c (5.9%)'],
      shortExplanation:
        'Both fasting glucose and 3-month glycated hemoglobin show subtle elevations above standard baselines, reflecting early peripheral insulin resistance.',
      recommendedNextStep:
        'Schedule a routine follow-up with your primary physician to discuss repeating fasting glucose and insulin sensitivity markers; focus on limiting processed sugary foods and increasing post-meal walks.',
      supportedByData: true,
    },
    {
      id: 'risk-2',
      title: 'Cardiovascular & Lipid Health',
      categoryKey: 'cardiovascular',
      riskLevel: 'Moderate',
      relevantParameters: ['Total Cholesterol (224 mg/dL)', 'LDL (142 mg/dL)', 'Triglycerides (195 mg/dL)'],
      shortExplanation:
        'Elevated circulating LDL particles and triglycerides indicate a moderate long-term atherogenic risk factor, particularly when paired with early blood sugar changes.',
      recommendedNextStep:
        'Discuss a comprehensive cardiovascular risk assessment (such as ASCVD score or Apolipoprotein B) with your doctor; substitute saturated animal fats with Mediterranean extra virgin olive oil and soluble oats.',
      supportedByData: true,
    },
    {
      id: 'risk-3',
      title: 'Anemia & Oxygen Carrying Capacity',
      categoryKey: 'anemia',
      riskLevel: 'Moderate',
      relevantParameters: ['Hemoglobin (10.8 g/dL)'],
      shortExplanation:
        'Hemoglobin levels fall slightly below standard male reference limits, suggesting possible iron deficiency, micronutrient insufficiency, or subtle red cell production decrease.',
      recommendedNextStep:
        'Ask your doctor to check serum ferritin, iron saturation, and Vitamin B12 to identify whether nutritional iron supplementation or further evaluation is warranted.',
      supportedByData: true,
    },
    {
      id: 'risk-4',
      title: 'Kidney & Renal Filtration',
      categoryKey: 'kidney',
      riskLevel: 'Low',
      relevantParameters: ['Serum Creatinine (0.95 mg/dL)'],
      shortExplanation:
        'Creatinine clearance is completely intact, demonstrating healthy glomerular filtration and electrolyte balance.',
      recommendedNextStep:
        'Maintain consistent daily hydration (approx. 2 to 2.5 liters of water) and avoid excessive use of NSAID pain relievers.',
      supportedByData: true,
    },
    {
      id: 'risk-5',
      title: 'Liver & Hepatic Health',
      categoryKey: 'liver',
      riskLevel: 'Low',
      relevantParameters: ['ALT (38 U/L)', 'AST (32 U/L)'],
      shortExplanation:
        'Liver cellular enzymes are balanced with no indication of active hepatocellular inflammation, despite mildly elevated triglycerides.',
      recommendedNextStep:
        'Maintain moderate alcohol restraint and balanced whole-food nutrition to prevent hepatic fat accumulation over time.',
      supportedByData: true,
    },
    {
      id: 'risk-6',
      title: 'Thyroid & Endocrine Function',
      categoryKey: 'thyroid',
      riskLevel: 'Low',
      relevantParameters: ['TSH (2.45 mIU/L)'],
      shortExplanation:
        'Pituitary-thyroid signaling is completely normal, ruling out thyroid dysfunction as an underlying driver for fatigue or metabolic fluctuations.',
      recommendedNextStep: 'No intervention required; continue routine annual physical checkups.',
      supportedByData: true,
    },
  ],
  recommendations: [
    {
      id: 'rec-1',
      category: 'Diet',
      priority: 'Important',
      recommendation:
        'Emphasize a low-glycemic Mediterranean dietary pattern rich in soluble viscous fiber (steel-cut oats, lentils, chia seeds, broccoli) and healthy monounsaturated fats (extra virgin olive oil, avocados, raw almonds).',
      rationale:
        'Soluble fiber binds digestive bile acids to reduce LDL cholesterol by 5-10% and slows carbohydrate absorption to flatten post-meal glucose spikes.',
    },
    {
      id: 'rec-2',
      category: 'Diet',
      priority: 'Important',
      recommendation:
        'Substantially cut down on sugar-sweetened beverages, refined white flour products, and processed snack items, replacing them with whole fruits, legumes, and lean protein sources.',
      rationale:
        'Directly targets elevated triglycerides (195 mg/dL) and helps return fasting glucose to the two-digit normal range.',
    },
    {
      id: 'rec-3',
      category: 'Physical Activity',
      priority: 'Important',
      recommendation:
        'Aim for 150 minutes of moderate-intensity aerobic movement (such as brisk 30-minute walking 5 days a week) plus a brief 10-minute relaxed stroll immediately following lunch and dinner.',
      rationale:
        'Postprandial ambulation activates skeletal muscle GLUT4 transporters to clear glucose from blood circulation without requiring excess insulin.',
    },
    {
      id: 'rec-4',
      category: 'Hydration',
      priority: 'Routine',
      recommendation:
        'Drink 2.0 to 2.5 liters of clean water throughout the waking day; reduce sweetened sodas, sweetened teas, and high-sugar energy drinks.',
      rationale:
        'Ensures optimal kidney filtration, prevents hemoconcentration of serum biomarkers, and promotes cellular metabolism.',
    },
    {
      id: 'rec-5',
      category: 'Sleep',
      priority: 'Consider',
      recommendation:
        'Prioritize 7 to 8 hours of consistent, restorative sleep nightly by keeping a dark, cool sleeping space and avoiding screens 45 minutes before bedtime.',
      rationale:
        'Chronic sleep fragmentation or deficit of under 6 hours elevates morning cortisol, exacerbating insulin resistance and elevating fasting blood glucose.',
    },
    {
      id: 'rec-6',
      category: 'General Lifestyle',
      priority: 'Important',
      recommendation:
        'Inquire with your physician regarding safe Vitamin D3 supplementation (e.g. 1,000–2,000 IU daily under medical supervision) alongside safe midday sunlight exposure.',
      rationale:
        'Targets your low 18.2 ng/mL Vitamin D level to assist immune health, bone remodeling, and muscular performance.',
    },
    {
      id: 'rec-7',
      category: 'When to Consult a Healthcare Professional',
      priority: 'Important',
      recommendation:
        'Bring this report summary to your primary care physician within the next 4 to 8 weeks for formal clinical evaluation, complete iron studies (ferritin/TIBC), and repeat metabolic panels.',
      rationale:
        'Early discussion ensures personalized physician oversight before borderline values advance into established clinical conditions.',
    },
  ],
};

// Historical datasets for trend demonstration
export const DEMO_TRENDS: TestTrendItem[] = [
  {
    testName: 'Fasting Blood Glucose',
    unit: 'mg/dL',
    referenceRange: '70 - 99',
    history: [
      { date: '12 Months Ago', value: 98, unit: 'mg/dL', status: 'Normal', reportId: 'hist-1' },
      { date: '6 Months Ago', value: 106, unit: 'mg/dL', status: 'High', reportId: 'hist-2' },
      { date: 'Current Report', value: 118, unit: 'mg/dL', status: 'High', reportId: 'demo-report-current' },
    ],
    trendDirection: 'increasing',
    changePercent: 11.3,
  },
  {
    testName: 'HbA1c',
    unit: '%',
    referenceRange: '4.0 - 5.6',
    history: [
      { date: '12 Months Ago', value: 5.4, unit: '%', status: 'Normal', reportId: 'hist-1' },
      { date: '6 Months Ago', value: 5.7, unit: '%', status: 'High', reportId: 'hist-2' },
      { date: 'Current Report', value: 5.9, unit: '%', status: 'High', reportId: 'demo-report-current' },
    ],
    trendDirection: 'increasing',
    changePercent: 3.5,
  },
  {
    testName: 'Total Cholesterol',
    unit: 'mg/dL',
    referenceRange: '< 200',
    history: [
      { date: '12 Months Ago', value: 195, unit: 'mg/dL', status: 'Normal', reportId: 'hist-1' },
      { date: '6 Months Ago', value: 212, unit: 'mg/dL', status: 'High', reportId: 'hist-2' },
      { date: 'Current Report', value: 224, unit: 'mg/dL', status: 'High', reportId: 'demo-report-current' },
    ],
    trendDirection: 'increasing',
    changePercent: 5.6,
  },
  {
    testName: 'LDL Cholesterol',
    unit: 'mg/dL',
    referenceRange: '< 100',
    history: [
      { date: '12 Months Ago', value: 122, unit: 'mg/dL', status: 'High', reportId: 'hist-1' },
      { date: '6 Months Ago', value: 134, unit: 'mg/dL', status: 'High', reportId: 'hist-2' },
      { date: 'Current Report', value: 142, unit: 'mg/dL', status: 'High', reportId: 'demo-report-current' },
    ],
    trendDirection: 'increasing',
    changePercent: 6.0,
  },
  {
    testName: 'Hemoglobin',
    unit: 'g/dL',
    referenceRange: '13.5 - 17.5',
    history: [
      { date: '12 Months Ago', value: 13.8, unit: 'g/dL', status: 'Normal', reportId: 'hist-1' },
      { date: '6 Months Ago', value: 11.9, unit: 'g/dL', status: 'Low', reportId: 'hist-2' },
      { date: 'Current Report', value: 10.8, unit: 'g/dL', status: 'Low', reportId: 'demo-report-current' },
    ],
    trendDirection: 'decreasing',
    changePercent: -9.2,
  },
  {
    testName: 'Triglycerides',
    unit: 'mg/dL',
    referenceRange: '< 150',
    history: [
      { date: '12 Months Ago', value: 140, unit: 'mg/dL', status: 'Normal', reportId: 'hist-1' },
      { date: '6 Months Ago', value: 175, unit: 'mg/dL', status: 'High', reportId: 'hist-2' },
      { date: 'Current Report', value: 195, unit: 'mg/dL', status: 'High', reportId: 'demo-report-current' },
    ],
    trendDirection: 'increasing',
    changePercent: 11.4,
  },
  {
    testName: 'Serum Creatinine',
    unit: 'mg/dL',
    referenceRange: '0.7 - 1.3',
    history: [
      { date: '12 Months Ago', value: 0.92, unit: 'mg/dL', status: 'Normal', reportId: 'hist-1' },
      { date: '6 Months Ago', value: 0.94, unit: 'mg/dL', status: 'Normal', reportId: 'hist-2' },
      { date: 'Current Report', value: 0.95, unit: 'mg/dL', status: 'Normal', reportId: 'demo-report-current' },
    ],
    trendDirection: 'stable',
    changePercent: 1.0,
  },
];
