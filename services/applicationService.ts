/**
 * Application API Service for PWD registration submissions.
 * Maps frontend form states to exact API fields.
 */

const BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'https://api-dbpwd.drchiocms.com/api';

export interface SubmitApplicationResponse {
  success: boolean;
  message?: string;
  data?: {
    id: number;
    personal_information: {
      full_name: string;
    };
    application_details: {
      date_applied: string;
      control_number: string;
    };
    processing_info: {
      appointment_date: string;
    };
  };
  errors?: Record<string, string[]>;
}

export const submitApplication = async (
  values: any,
  files: {
    certificateOfDisability: File | null;
    certificateOfResidency: File | null;
    scannedGovernmentId: File | null;
  }
): Promise<SubmitApplicationResponse> => {
  console.log("Submitting form", values);

  const formData = new FormData();

  // STEP 1 — PERSONAL INFORMATION
  formData.append("first_name", values.firstName || "");
  formData.append("last_name", values.lastName || "");
  formData.append("middle_name", values.middleName || "");
  formData.append("suffix", values.suffix || "");
  formData.append("date_of_birth", values.birthDate || "");
  formData.append("gender", values.gender || "");
  formData.append("civil_status", values.civilStatus || "");

  // Convert array or comma-separated string to list, then join cleanly
  const disabilityTypes = Array.isArray(values.typeOfDisability)
    ? values.typeOfDisability.join(", ")
    : (typeof values.typeOfDisability === "string" ? values.typeOfDisability : "");
  formData.append("disability_types", disabilityTypes);

  // Parse causes derived from checkboxes or manual inputs
  const causes = Array.isArray(values.causeOfDisability)
    ? values.causeOfDisability
    : (typeof values.causeOfDisability === "string" ? values.causeOfDisability.split(",").map((s: string) => s.trim()).filter(Boolean) : []);

  const congenitalList = ["Autism", "ADHD", "Cerebral Palsy", "Down Syndrome"];
  const acquiredList = ["Chronic Illness", "Cerebral Palsy", "Injury"];

  const hasCongenitalParent = causes.includes("Congenital / Inborn");
  const hasAcquiredParent = causes.includes("Acquired");

  const congenitalChosen = congenitalList.filter(opt => {
    if (opt === "Cerebral Palsy") {
      return causes.includes(opt) && (hasCongenitalParent || !hasAcquiredParent);
    }
    return causes.includes(opt);
  });

  const acquiredChosen = acquiredList.filter(opt => {
    if (opt === "Cerebral Palsy") {
      return causes.includes(opt) && (hasAcquiredParent || !hasCongenitalParent);
    }
    return causes.includes(opt);
  });

  let congenitalVal = congenitalChosen.join(", ");
  if (!congenitalVal && hasCongenitalParent) {
    congenitalVal = "Congenital / Inborn";
  }

  let acquiredVal = acquiredChosen.join(", ");
  if (!acquiredVal && hasAcquiredParent) {
    acquiredVal = "Acquired";
  }

  formData.append("congenital", values.congenital || congenitalVal);
  formData.append("acquired", values.acquired || acquiredVal);

  formData.append("certifying_physician", values.physicianName || "");
  formData.append("physician_license_no", values.physicianLicense || "");

  // STEP 2 — ADDRESS & CONTACT
  formData.append("house_street", values.streetAddress || "");
  formData.append("barangay", values.barangay || "");
  formData.append("municipality", values.cityMunicipality || "San Juan City");
  formData.append("province", values.province || "Metro Manila");
  formData.append("region", values.region || "NCR");
  formData.append("landline_no", values.landline || "");
  formData.append("mobile_no", values.mobileNumber || "");
  formData.append("email_address", values.emailAddress || "");

  // STEP 3 — EMERGENCY & FAMILY
  formData.append("emergency_contact_name", values.emergencyContactPerson || "");
  formData.append("emergency_contact_number", values.emergencyContactNumber || "");
  formData.append("emergency_contact_relation", values.relationship || "");

  formData.append("father_first_name", values.fatherFirstName || "");
  formData.append("father_middle_name", values.fatherMiddleName || "");
  formData.append("father_last_name", values.fatherLastName || "");

  formData.append("mother_first_name", values.motherFirstName || "");
  formData.append("mother_middle_name", values.motherMiddleName || "");
  formData.append("mother_last_name", values.motherLastName || "");

  formData.append("guardian_first_name", values.guardianFirstName || "");
  formData.append("guardian_middle_name", values.guardianMiddleName || "");
  formData.append("guardian_last_name", values.guardianLastName || "");

  // STEP 4 — EDUCATION & EMPLOYMENT
  formData.append("educational_attainment", values.highestEducation || "");
  formData.append("employment_status", values.employmentStatus || "");

  // Map Employment Type
  let empType = values.employmentType || "";
  if (empType === "Permanent / Regular") {
    empType = "Permanent";
  }
  formData.append("employment_type", empType);

  // Map Employment Category
  formData.append("employment_category", values.employmentCategory || "");

  formData.append("occupation", values.occupation || "");
  formData.append("organization_affiliated", values.orgName || "");
  formData.append("organization_contact_person", values.orgContactPerson || "");
  formData.append("organization_address", values.orgAddress || "");
  formData.append("organization_tel_no", values.orgContactNo || "");

  // STEP 5 — GOVERNMENT IDS & ACCOMPLISHED BY
  formData.append("sss_no", values.sssNumber || "");
  formData.append("gsis_no", values.gsisNumber || "");
  formData.append("pagibig_no", values.pagIbigNumber || "");
  formData.append("psn_no", values.psnNumber || "");
  formData.append("philhealth_no", values.philHealthNumber || "");

  // Document Files
  if (files.certificateOfDisability) {
    formData.append("certificate_of_disability", files.certificateOfDisability);
  }
  if (files.certificateOfResidency) {
    formData.append("certificate_of_residency", files.certificateOfResidency);
  }
  if (files.scannedGovernmentId) {
    formData.append("scanned_government_id", files.scannedGovernmentId);
  }

  // ACCOMPLISHED BY
  let accBy = values.accomplishedBy || "Applicant";
  const upperAcc = accBy.toUpperCase();
  if (upperAcc === "APPLICANT") {
    accBy = "Applicant";
  } else if (upperAcc === "GUARDIAN") {
    accBy = "Guardian";
  } else if (upperAcc === "REPRESENTATIVE") {
    accBy = "Representative";
  }
  formData.append("accomplished_by", accBy);
  formData.append("accomplished_by_last_name", values.accomplishedByLastName || "");
  formData.append("accomplished_by_first_name", values.accomplishedByFirstName || "");
  formData.append("accomplished_by_middle_name", values.accomplishedByMiddleName || "");

  // AUTO GENERATED / HIDDEN FIELDS
  const todayStr = new Date().toISOString().split("T")[0];
  formData.append("date_applied", todayStr);
  formData.append("encoder_name", "online_applicant");
  formData.append("reg_status", "Pending");

  try {
    const response = await fetch(`${BASE_URL}/applications`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        // Note: Do NOT set Content-Type; browser will set multipart/form-data with boundary automatically
      },
      body: formData,
    });

    const status = response.status;
    const dataObj = await response.json().catch(() => ({}));

    if (response.ok) {
      console.log("API response", dataObj);
      return {
        success: true,
        message: dataObj.message || "Submitted successfully!",
        data: dataObj.data,
      };
    } else {
      console.error("API error status:", status, "data:", dataObj);
      if (status === 422) {
        return {
          success: false,
          message: dataObj.message || "Validation failed.",
          errors: dataObj.errors,
        };
      }
      return {
        success: false,
        message: dataObj.message || "Unable to submit registration. Please try again.",
      };
    }
  } catch (error: any) {
    console.error("API error", error);
    return {
      success: false,
      message: "Unable to submit registration. Please try again.",
    };
  }
};
