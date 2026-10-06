// ============================================================================
// Official School Letterhead & Document Generation Service
// ============================================================================

import type { School, OnlineApplication } from '../types';

export interface LetterContent {
  refNumber: string;
  date: string;
  recipientName: string;
  recipientAddress?: string;
  subject: string;
  salutation: string;
  bodyParagraphs: string[];
  bulletPoints?: string[];
  signatoryTitle: string;
  signatoryName: string;
  showStamp: boolean;
  statusBadge?: {
    text: string;
    variant: 'success' | 'warning' | 'danger' | 'info';
  };
}

/**
 * Creates dynamic letter content for an Online Application based on its status
 */
export function generateApplicationLetter(
  school: School, 
  application: OnlineApplication
): LetterContent {
  const dateFormatted = new Date(application.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const refNumber = `REF: ${school.code}/ADM/${application.id}`;

  // 1. Accepted Letter
  if (application.registrarReview.status === 'accepted') {
    return {
      refNumber,
      date: dateFormatted,
      recipientName: application.applicantName,
      recipientAddress: `c/o ${application.parentName}, ${application.phone}`,
      subject: `OFFICIAL OFFER OF PROVISIONAL ADMISSION – GRADE ${application.gradeApplied} (ACADEMIC YEAR 2026)`,
      salutation: `Dear ${application.applicantName},`,
      bodyParagraphs: [
        `Following the comprehensive evaluation of your application credentials and academic records, the Admissions Committee of ${school.name} is delighted to inform you that you have been offered provisional admission into Grade ${application.gradeApplied}.`,
        `Your prior academic average of ${application.previousAverageMarks.toFixed(1)}% met our institutional entrance criteria. We were highly impressed with your qualifications and believe you will contribute positively to our student community.`,
        `To confirm and finalize your enrolment, kindly present this letter alongside original copies of your supporting documents to the Registrar's Office within fourteen (14) business days.`
      ],
      bulletPoints: [
        `Admission Reference: ${application.id}`,
        `Approved Grade: Grade ${application.gradeApplied}`,
        `Status: Accepted & Validated by Admissions Office`,
        `Orientation Schedule: To be communicated upon final registration.`
      ],
      signatoryName: school.letterhead.signatureTitle || "The Registrar & Head of Admissions",
      signatoryTitle: school.name,
      showStamp: true,
      statusBadge: {
        text: 'PROVISIONAL ADMISSION OFFERED',
        variant: 'success',
      }
    };
  }

  // 2. Automated Screening Passed (Awaiting Registrar Validation)
  if (application.autoEvaluation.status === 'passed') {
    return {
      refNumber,
      date: dateFormatted,
      recipientName: application.applicantName,
      recipientAddress: `c/o ${application.parentName}, ${application.phone}`,
      subject: `ACKNOWLEDGEMENT OF APPLICATION & AUTOMATED SCREENING QUALIFICATION`,
      salutation: `Dear ${application.applicantName},`,
      bodyParagraphs: [
        `Thank you for submitting your online application to ${school.name} for Grade ${application.gradeApplied}.`,
        `We are pleased to inform you that your application has successfully cleared our automated pre-screening evaluation with a qualifying entrance score of ${application.autoEvaluation.score.toFixed(0)}%.`,
        `Your application has now been placed in the Registrar's Verification Queue for secondary document authentication and interview placement if applicable. You do not need to take any further action at this moment.`
      ],
      bulletPoints: [
        `Application Code: ${application.id}`,
        `Automated Evaluation Status: QUALIFIED (Passed Threshold)`,
        `Next Phase: Document Verification by School Registrar`,
        `Notification: You will receive an SMS and Email update once finalized.`
      ],
      signatoryName: "Admissions Automated Assessment System",
      signatoryTitle: `${school.name} Registrar Division`,
      showStamp: true,
      statusBadge: {
        text: 'AUTO-SCREENING: QUALIFIED (AWAITING REGISTRAR)',
        variant: 'info',
      }
    };
  }

  // 3. Additional Documents Requested
  if (application.registrarReview.status === 'documents_requested') {
    return {
      refNumber,
      date: dateFormatted,
      recipientName: application.applicantName,
      recipientAddress: `c/o ${application.parentName}, ${application.phone}`,
      subject: `REQUEST FOR SUPPLEMENTARY DOCUMENTATION – APPLICATION ${application.id}`,
      salutation: `Dear ${application.applicantName},`,
      bodyParagraphs: [
        `We have conducted an initial review of your admission application for Grade ${application.gradeApplied} at ${school.name}.`,
        `Before the Registrar can finalize your admission status, our admissions office requires clear, certified copies of supplementary verification documents as noted below:`,
        application.registrarReview.reviewNotes || "Please re-upload a clear copy of your previous term report card and verified birth certificate."
      ],
      bulletPoints: [
        `Reference Number: ${application.id}`,
        `Current Status: Action Required (Pending Documents)`,
        `Deadline: Please submit within 7 working days to preserve your position.`
      ],
      signatoryName: "Office of the Registrar",
      signatoryTitle: school.name,
      showStamp: false,
      statusBadge: {
        text: 'ACTION REQUIRED: DOCUMENTS REQUESTED',
        variant: 'warning',
      }
    };
  }

  // 4. Default / Application Under Review
  return {
    refNumber,
    date: dateFormatted,
    recipientName: application.applicantName,
    recipientAddress: `c/o ${application.parentName}`,
    subject: `FORMAL ACKNOWLEDGEMENT OF APPLICATION FOR ADMISSION`,
    salutation: `Dear ${application.applicantName},`,
    bodyParagraphs: [
      `This letter formally acknowledges receipt of your online application for admission to Grade ${application.gradeApplied} at ${school.name}.`,
      `Your application dossier has been logged into the school management system under reference ${application.id}. Our admissions team will review your application according to our admissions policy.`
    ],
    bulletPoints: [
      `Tracking Reference: ${application.id}`,
      `Grade Applied: Grade ${application.gradeApplied}`,
      `Submission Date: ${dateFormatted}`
    ],
    signatoryName: "Admissions Secretariat",
    signatoryTitle: school.name,
    showStamp: true,
    statusBadge: {
      text: 'APPLICATION RECEIVED & LOGGED',
      variant: 'info',
    }
  };
}
