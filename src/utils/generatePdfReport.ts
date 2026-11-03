import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AnalysisResult } from '../types';

export function generateHealthSummaryPdf(analysis: AnalysisResult): void {
  // A4 Dimensions: 210mm x 297mm
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20; // At least 20mm margin on all sides
  const contentWidth = pageWidth - margin * 2; // Exactly 170mm
  const maxY = pageHeight - margin - 8; // 269mm: safe lower threshold before running footer

  let y = margin;

  // Exact mm line height with 1.5 line spacing (1 pt = 0.352778 mm)
  const getLineHeightMm = (fontSizePt: number, factor = 1.5): number => {
    return fontSizePt * 0.352778 * factor;
  };

  // Check if content fits on page; if not, create new page
  const ensureSpace = (neededHeightMm: number): void => {
    if (y + neededHeightMm > maxY) {
      doc.addPage();
      y = margin + 4;
    }
  };

  // Section Heading with academic styling and orphan prevention
  const addSectionHeading = (title: string, minSpaceNeededMm = 25): void => {
    ensureSpace(minSpaceNeededMm);
    y += 3.5;
    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42); // slate-900

    doc.text(title, margin, y);
    y += 2;

    // Clean horizontal rule under section heading
    doc.setDrawColor(148, 163, 184); // slate-400
    doc.setLineWidth(0.35);
    doc.line(margin, y, margin + contentWidth, y);

    y += 4;
  };

  // ==========================================
  // PAGE 1: TITLE, METADATA, DISCLAIMER, PATIENT DEMOGRAPHICS & OVERALL SUMMARY
  // ==========================================

  // 1. Academic & Institutional Header
  doc.setFont('times', 'bold');
  doc.setFontSize(14.5);
  doc.setTextColor(15, 23, 42);
  doc.text('LABWISE AI — CLINICAL LABORATORY HEALTH SUMMARY', margin, y);
  y += 5;

  doc.setFont('times', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(
    'Academic Project Report • Health Informatics & Diagnostic Decision Support System',
    margin,
    y
  );
  y += 3;

  // Header Divider Rule
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.5);
  doc.line(margin, y, margin + contentWidth, y);
  y += 4;

  // Metadata Row
  const reportDate =
    analysis.reportDate ||
    new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  const sourceDoc = analysis.uploadedFileName || 'Standard Laboratory Panel';
  const reportId = `LW-${(analysis.id || '202601').slice(0, 8).toUpperCase()}`;

  doc.setFont('times', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);

  doc.text(`Report ID: ${reportId}`, margin, y);
  doc.text(`Generated Date: ${reportDate}`, margin + 58, y);
  doc.text(`Status: Verified Automated Analysis`, margin + contentWidth, y, { align: 'right' });
  y += 3.8;

  doc.text(`Source Document: ${sourceDoc}`, margin, y);
  doc.text(`Evaluation: Multi-Biomarker Risk Screening`, margin + contentWidth, y, { align: 'right' });
  y += 5;

  // 2. Mandatory Medical Advice Disclaimer Box
  const disclaimerTitle = 'MANDATORY MEDICAL ADVICE DISCLAIMER';
  const disclaimerQuote =
    '"This result is for health-risk awareness only and is not a medical diagnosis. Please consult a qualified healthcare professional for medical advice."';
  const disclaimerSub =
    'This report is generated for educational health awareness and patient empowerment. Laboratory values outside standard statistical reference ranges represent biological variations and do not constitute an independent diagnosis.';

  doc.setFont('times', 'bolditalic');
  doc.setFontSize(8.5);
  const splitQuote = doc.splitTextToSize(disclaimerQuote, contentWidth - 8);

  doc.setFont('times', 'normal');
  doc.setFontSize(7.8);
  const splitSub = doc.splitTextToSize(disclaimerSub, contentWidth - 8);

  const disclaimerBoxHeight =
    7 +
    splitQuote.length * getLineHeightMm(8.5, 1.4) +
    splitSub.length * getLineHeightMm(7.8, 1.4);

  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(0.35);
  doc.roundedRect(margin, y, contentWidth, disclaimerBoxHeight, 1.5, 1.5, 'FD');

  // Amber Accent Line
  doc.setFillColor(217, 119, 6); // amber-600
  doc.rect(margin, y, 2.5, disclaimerBoxHeight, 'F');

  doc.setFont('times', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(180, 83, 9); // amber-700
  doc.text(disclaimerTitle, margin + 6, y + 4.5);

  doc.setFont('times', 'bolditalic');
  doc.setFontSize(8.2);
  doc.setTextColor(30, 41, 59);
  doc.text(splitQuote, margin + 6, y + 8.5, { lineHeightFactor: 1.4 });

  doc.setFont('times', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(
    splitSub,
    margin + 6,
    y + 9.5 + splitQuote.length * getLineHeightMm(8.2, 1.4),
    { lineHeightFactor: 1.4 }
  );

  y += disclaimerBoxHeight + 5;

  // 3. Section 1: Patient Demographics & Clinical Context
  addSectionHeading('1. PATIENT DEMOGRAPHICS & CLINICAL CONTEXT', 30);

  const p = analysis.patientProfile;
  const pName = p.name?.trim() ? p.name : 'Anonymous Patient';
  const pAge = p.age ? `${p.age} years` : 'Not documented';
  const pGender = p.gender ? p.gender : 'Not documented';
  const pHeight = p.height?.trim() ? p.height : '—';
  const pWeight = p.weight?.trim() ? p.weight : '—';
  const pActivity = p.lifestyle?.activityLevel || 'Sedentary';
  const pConditions = p.existingConditions?.length
    ? p.existingConditions.join(', ')
    : 'None reported';
  const pFamily = p.familyHistory?.trim() ? p.familyHistory : 'No significant history noted';

  const ptBoxHeight = 24;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, ptBoxHeight, 1.5, 1.5, 'FD');

  const col1 = margin + 4;
  const col2 = margin + 60;
  const col3 = margin + 115;

  doc.setFontSize(8.5);

  // Row 1
  doc.setFont('times', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('Patient Name:', col1, y + 5);
  doc.setFont('times', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(pName, col1 + 22, y + 5);

  doc.setFont('times', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('Age / Gender:', col2, y + 5);
  doc.setFont('times', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`${pAge} / ${pGender}`, col2 + 22, y + 5);

  doc.setFont('times', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('Height / Weight:', col3, y + 5);
  doc.setFont('times', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`${pHeight} / ${pWeight}`, col3 + 25, y + 5);

  // Row 2
  doc.setFont('times', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('Activity Level:', col1, y + 11.5);
  doc.setFont('times', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(pActivity, col1 + 22, y + 11.5);

  doc.setFont('times', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('Known Conditions:', col2, y + 11.5);
  doc.setFont('times', 'normal');
  doc.setTextColor(15, 23, 42);
  const condLines = doc.splitTextToSize(pConditions, 85);
  doc.text(condLines[0] || 'None', col2 + 28, y + 11.5);

  // Row 3
  doc.setFont('times', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('Family History:', col1, y + 18);
  doc.setFont('times', 'normal');
  doc.setTextColor(15, 23, 42);
  const famLines = doc.splitTextToSize(pFamily, contentWidth - 32);
  doc.text(famLines[0] || 'None noted', col1 + 24, y + 18);

  y += ptBoxHeight + 5;

  // 4. Section 2: Overall Health-Risk Assessment & Summary
  addSectionHeading('2. OVERALL HEALTH-RISK ASSESSMENT & SUMMARY', 40);

  const risk = analysis.riskAssessment;

  // Risk Classification Bar
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, 10, 1, 1, 'FD');

  doc.setFont('times', 'bold');
  doc.setFontSize(9);
  if (risk.riskLevel === 'High') {
    doc.setTextColor(185, 28, 28);
  } else if (risk.riskLevel === 'Moderate') {
    doc.setTextColor(180, 83, 9);
  } else {
    doc.setTextColor(21, 128, 61);
  }
  doc.text(`Risk Stratification: ${risk.riskLevel.toUpperCase()} RISK`, margin + 4, y + 6.5);

  doc.setFont('times', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Total Biomarkers: ${risk.totalCount}  |  Within Reference Range: ${risk.normalCount}  |  Flagged Deviations: ${risk.abnormalCount}`,
    margin + contentWidth - 4,
    y + 6.5,
    { align: 'right' }
  );

  y += 14;

  // Clinical Summary Narrative (1.5 line spacing)
  doc.setFont('times', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);

  const summaryText =
    risk.summaryText ||
    'Biomarker analysis indicates key physiological parameters evaluated against standard clinical thresholds. Flagged markers warrant proactive physician consultation.';
  const wrappedSummary = doc.splitTextToSize(summaryText, contentWidth);
  doc.text(wrappedSummary, margin, y, { lineHeightFactor: 1.5 });
  y += wrappedSummary.length * getLineHeightMm(9.5, 1.5) + 3;

  // Key Clinical Findings (1.5 line spacing)
  if (risk.keyFindings && risk.keyFindings.length > 0) {
    doc.setFont('times', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('Key Clinical Observations:', margin, y);
    y += 4.5;

    doc.setFont('times', 'normal');
    doc.setFontSize(8.8);
    doc.setTextColor(51, 65, 85);

    risk.keyFindings.slice(0, 6).forEach((finding) => {
      const bulletText = `•  ${finding}`;
      const wrappedBullet = doc.splitTextToSize(bulletText, contentWidth - 4);
      doc.text(wrappedBullet, margin + 2, y, { lineHeightFactor: 1.5 });
      y += wrappedBullet.length * getLineHeightMm(8.8, 1.5) + 1.5;
    });
  }

  // ==========================================
  // PAGE 2: EXTRACTED LABORATORY PARAMETERS TABLE & INTERPRETATION
  // ==========================================
  doc.addPage();
  y = margin + 2;

  addSectionHeading('3. EXTRACTED LABORATORY PARAMETERS & REFERENCE INTERVALS', 30);

  doc.setFont('times', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'Biomarker values digitized from the laboratory report and evaluated against standard clinical reference intervals:',
    margin,
    y
  );
  y += 4.5;

  // Table Configuration (Total Width = Exactly 170mm)
  // Col 0: 48mm, Col 1: 32mm, Col 2: 28mm, Col 3: 36mm, Col 4: 26mm -> 170mm
  const tableData = analysis.tests.map((t) => [
    t.testName,
    t.category,
    `${t.resultValue} ${t.unit}`.trim(),
    t.referenceRange || 'Not provided',
    t.status,
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Biomarker / Test Name', 'Panel / Category', 'Patient Result', 'Reference Range', 'Status']],
    body: tableData,
    theme: 'grid',
    styles: {
      font: 'times',
      fontSize: 8.5,
      cellPadding: 2.2,
      textColor: [30, 41, 59],
      lineColor: [203, 213, 225],
      lineWidth: 0.2,
      overflow: 'linebreak',
    },
    headStyles: {
      font: 'times',
      fontStyle: 'bold',
      fillColor: [30, 41, 59], // Dark slate / Charcoal
      textColor: [255, 255, 255],
      fontSize: 8.5,
      halign: 'left',
      cellPadding: 2.5,
    },
    columnStyles: {
      0: { cellWidth: 48, fontStyle: 'bold' },
      1: { cellWidth: 32, textColor: [71, 85, 105] },
      2: { cellWidth: 28, fontStyle: 'bold' },
      3: { cellWidth: 36, textColor: [71, 85, 105] },
      4: { cellWidth: 26, halign: 'center' },
    },
    didParseCell: (data) => {
      if (data.section === 'body') {
        const row = analysis.tests[data.row.index];
        if (row && data.column.index === 4) {
          data.cell.styles.fontStyle = 'bold';
          if (row.status === 'High') {
            data.cell.styles.textColor = [185, 28, 28]; // Dark Red
            data.cell.styles.fillColor = [254, 242, 242];
          } else if (row.status === 'Low') {
            data.cell.styles.textColor = [30, 64, 175]; // Dark Blue
            data.cell.styles.fillColor = [239, 246, 255];
          } else {
            data.cell.styles.textColor = [21, 128, 61]; // Dark Green
            data.cell.styles.fillColor = [240, 253, 244];
          }
        }
      }
    },
    margin: { left: margin, right: margin },
  });

  y = (doc as any).lastAutoTable.finalY + 6;

  // Laboratory Parameters Clinical Context Box (Bottom of Page 2)
  doc.setFont('times', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Biomarker Reference Interpretation Notes:', margin, y);
  y += 4.5;

  doc.setFont('times', 'normal');
  doc.setFontSize(8.8);
  doc.setTextColor(51, 65, 85);

  const abnormalTests = analysis.tests.filter((t) => t.status === 'High' || t.status === 'Low');
  const normalTests = analysis.tests.filter((t) => t.status === 'Normal');

  const notesText = [
    `•  Flagged Parameters (${abnormalTests.length} tests): Parameters marked HIGH or LOW deviate from established reference ranges. Reference intervals are statistically determined to represent 95% of healthy individuals. Minor deviations may reflect acute metabolic states, dietary factors, or early organ stress.`,
    `•  Preserved Homeostatic Biomarkers (${normalTests.length} tests): Parameters within standard clinical reference boundaries suggest functional biological equilibrium across those measured organ pathways.`,
    `•  Clinical Action: Individual biomarker abnormalities must be reviewed in combination rather than in isolation, alongside personal symptoms and medical history.`,
  ];

  notesText.forEach((note) => {
    const wrappedNote = doc.splitTextToSize(note, contentWidth - 4);
    doc.text(wrappedNote, margin + 2, y, { lineHeightFactor: 1.5 });
    y += wrappedNote.length * getLineHeightMm(8.8, 1.5) + 2.5;
  });

  // ==========================================
  // PAGE 3: RISK CATEGORIES, RECOMMENDATIONS, DOCTOR QUESTIONS & ATTESTATION
  // ==========================================
  doc.addPage();
  y = margin + 2;

  // 4. Section 4: Systemic Risk Categories Evaluation
  addSectionHeading('4. SYSTEMIC RISK CATEGORIES EVALUATION', 30);

  // Filter or format categories concisely to fit cleanly
  const riskCategoriesToDisplay = analysis.riskCategories.slice(0, 5);

  riskCategoriesToDisplay.forEach((rc) => {
    doc.setFont('times', 'bold');
    doc.setFontSize(9);

    let riskColor: [number, number, number] = [21, 128, 61];
    if (rc.riskLevel === 'High') riskColor = [185, 28, 28];
    else if (rc.riskLevel === 'Moderate') riskColor = [180, 83, 9];

    doc.setTextColor(15, 23, 42);
    const catPrefix = `•  ${rc.title}  [`;
    doc.text(catPrefix, margin + 2, y);
    const prefixWidth = doc.getTextWidth(catPrefix);

    doc.setTextColor(...riskColor);
    doc.text(`${rc.riskLevel} Risk`, margin + 2 + prefixWidth, y);
    const levelWidth = doc.getTextWidth(`${rc.riskLevel} Risk`);

    doc.setTextColor(15, 23, 42);
    doc.text(']: ', margin + 2 + prefixWidth + levelWidth, y);
    const totalLeadWidth = prefixWidth + levelWidth + doc.getTextWidth(']: ');

    // Observation & action inline / indented (1.5 line spacing)
    doc.setFont('times', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);

    const firstLineMax = contentWidth - 4 - totalLeadWidth;
    const allExplLines = doc.splitTextToSize(rc.shortExplanation, contentWidth - 8);

    if (allExplLines.length > 0) {
      doc.text(allExplLines[0], margin + 2 + totalLeadWidth, y);
      y += getLineHeightMm(8.5, 1.45);

      for (let i = 1; i < allExplLines.length; i++) {
        doc.text(allExplLines[i], margin + 6, y);
        y += getLineHeightMm(8.5, 1.45);
      }
    }

    doc.setFont('times', 'italic');
    doc.setTextColor(15, 23, 42);
    const stepText = `Action: ${rc.recommendedNextStep}`;
    const stepLines = doc.splitTextToSize(stepText, contentWidth - 8);
    doc.text(stepLines, margin + 6, y, { lineHeightFactor: 1.45 });
    y += stepLines.length * getLineHeightMm(8.5, 1.45) + 2;
  });

  y += 1.5;

  // 5. Section 5: Personalized Recommendations
  addSectionHeading('5. PERSONALIZED LIFESTYLE & HEALTH RECOMMENDATIONS', 30);

  const recommendationsToDisplay = analysis.recommendations.slice(0, 4);

  recommendationsToDisplay.forEach((rec) => {
    doc.setFont('times', 'bold');
    doc.setFontSize(8.8);
    doc.setTextColor(15, 23, 42);

    const recTitle = `• [${rec.category.toUpperCase()}] ${rec.recommendation} (${rec.priority} Priority)`;
    const titleLines = doc.splitTextToSize(recTitle, contentWidth - 4);
    doc.text(titleLines, margin + 2, y, { lineHeightFactor: 1.4 });
    y += titleLines.length * getLineHeightMm(8.8, 1.4);

    doc.setFont('times', 'normal');
    doc.setFontSize(8.2);
    doc.setTextColor(71, 85, 105);
    const ratLines = doc.splitTextToSize(`Rationale: ${rec.rationale}`, contentWidth - 8);
    doc.text(ratLines, margin + 6, y, { lineHeightFactor: 1.45 });
    y += ratLines.length * getLineHeightMm(8.2, 1.45) + 2;
  });

  y += 1.5;

  // 6. Section 6: Suggested Doctor Discussion Questions
  addSectionHeading('6. SUGGESTED QUESTIONS FOR PHYSICIAN CONSULTATION', 35);

  const docQuestions = [
    '1. "Given my laboratory values that fell outside reference ranges, what follow-up timeline do you advise?"',
    '2. "What are your specific target clinical goals for my glycemic and lipid parameters based on my medical history?"',
    '3. "Are confirmatory laboratory or imaging evaluations (e.g. HbA1c, repeat panel, ultrasound) recommended?"',
    '4. "What personalized dietary adjustments or physical exercise modifications are safest for my current baseline?"',
  ];

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);

  const qBoxHeight = 29;
  doc.roundedRect(margin, y, contentWidth, qBoxHeight, 1.5, 1.5, 'FD');

  doc.setFont('times', 'italic');
  doc.setFontSize(8.2);
  doc.setTextColor(30, 41, 59);

  let qY = y + 5.2;
  docQuestions.forEach((q) => {
    doc.text(q, margin + 4, qY);
    qY += 5.8;
  });

  y += qBoxHeight + 6;

  // Final Project Sign-off / Attestation Block
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.25);
  doc.line(margin, y, margin + contentWidth, y);
  y += 4;

  doc.setFont('times', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'LabWise AI Biomedical Informatics Platform • Academic Final-Year Project Demonstration Report',
    margin,
    y
  );
  doc.text(
    'End of Formal Report',
    margin + contentWidth,
    y,
    { align: 'right' }
  );

  // ==========================================
  // RUNNING HEADERS & FOOTERS FOR ALL PAGES
  // ==========================================
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Running Header on Pages 2 and 3
    if (i > 1) {
      doc.setFont('times', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('LabWise AI — Clinical Laboratory Health Summary Report', margin, margin - 4);
      doc.text(`Patient: ${pName}`, margin + contentWidth, margin - 4, { align: 'right' });

      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.line(margin, margin - 2, margin + contentWidth, margin - 2);
    }

    // Running Footer on all pages
    const footerRuleY = pageHeight - margin + 4; // 281mm
    const footerTextY = pageHeight - margin + 8; // 285mm

    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.25);
    doc.line(margin, footerRuleY, margin + contentWidth, footerRuleY);

    doc.setFont('times', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('LabWise AI • Medical Educational Awareness Report', margin, footerTextY);
    doc.text(
      `Page ${i} of ${totalPages}`,
      margin + contentWidth,
      footerTextY,
      { align: 'right' }
    );
  }

  // Save the PDF with the exact standard name
  doc.save('LabWise_AI_Health_Report.pdf');
}
