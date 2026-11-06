import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPatientEdit, updatePatient } from "../services/apiAdmin";
import {
  AreaField,
  FormCard,
  LoadState,
  Page,
  Section,
  SelectField,
  TextField,
  normalizeEnum,
  patientStatusOptions,
  useFields,
  useLoad,
  useSubmit,
} from "../components/AdminForm";

const genders = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const initial = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  emailAddress: "",
  phoneNumber: "",
  gender: "",
  medicalRecordNumber: "",
  primaryCarePhysician: "",
  careTeam: "",
  patientStatus: "NORMAL",
  notes: "",
};

const EditPatient = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { f, setF, bind } = useFields(initial);
  const { data, error: loadError, loading } = useLoad(() => getPatientEdit(id), [id]);

  useEffect(() => {
    if (!data) return;
    const d = data.patientDetails ?? {};
    const c = data.clinicalInformation ?? {};
    setF({
      firstName: d.firstName ?? "",
      lastName: d.lastName ?? "",
      dateOfBirth: (d.dateOfBirth ?? "").slice(0, 10),
      emailAddress: d.emailAddress ?? "",
      phoneNumber: d.phoneNumber ?? "",
      gender: (d.gender ?? "").toLowerCase(),
      medicalRecordNumber: c.medicalRecordNumber ?? "",
      primaryCarePhysician: c.primaryCarePhysician ?? "",
      careTeam: c.careTeam ?? "",
      patientStatus: normalizeEnum(c.patientStatus) || "NORMAL",
      notes: c.notes ?? "",
    });
  }, [data, setF]);

  const back = () => navigate(`/patient/${id}`);

  const submit = useSubmit(async () => {
    await updatePatient(id, {
      patientDetails: {
        firstName: f.firstName.trim(),
        lastName: f.lastName.trim(),
        dateOfBirth: f.dateOfBirth,
        emailAddress: f.emailAddress.trim(),
        phoneNumber: f.phoneNumber.trim(),
        gender: f.gender,
      },
      clinicalInformation: {
        medicalRecordNumber: f.medicalRecordNumber.trim(),
        primaryCarePhysician: f.primaryCarePhysician.trim(),
        careTeam: f.careTeam.trim(),
        patientStatus: f.patientStatus,
        notes: f.notes.trim(),
      },
    });
    back();
  });

  return (
    <Page
      crumbs={[{ label: "Patients", to: "/patients" }, { label: "Edit Patient" }]}
      title="Edit Patient"
      description="Update the patient's profile, contact details, and clinical information. Changes are saved to the existing patient record."
    >
      {!data ? (
        <LoadState loading={loading} error={loadError} />
      ) : (
        <FormCard
          {...submit}
          note="Changes are saved to the existing patient record and shared with authorized care team members."
          submitLabel="Save changes"
          onCancel={back}
        >
          <Section
            title="Patient Details"
            description="Review and update the patient's identity and contact information."
            badge={data.patientIdCode ? `Patient ID: ${data.patientIdCode}` : undefined}
          >
            <TextField label="First name" required {...bind("firstName")} />
            <TextField label="Last name" required {...bind("lastName")} />
            <TextField label="Date of birth" type="date" {...bind("dateOfBirth")} />
            <TextField label="Email address" required type="email" {...bind("emailAddress")} />
            <TextField label="Phone number" required type="tel" {...bind("phoneNumber")} />
            <SelectField label="Gender" chevron={false} placeholder="" options={genders} {...bind("gender")} />
          </Section>

          <Section
            title="Clinical Information"
            description="Update the patient's medical identifiers, status, and care assignment."
            cols={2}
          >
            <TextField label="Medical Record Number" {...bind("medicalRecordNumber")} />
            <TextField label="Primary Care Physician" {...bind("primaryCarePhysician")} />
            <TextField label="Care Team" {...bind("careTeam")} />
            <SelectField label="Patient Status" chevron={false} options={patientStatusOptions} {...bind("patientStatus")} />
          </Section>

          <Section
            title="Notes"
            description="Add any internal notes regarding this patient's record, allergies, or special instructions."
          >
            <AreaField label="" className="h-28" {...bind("notes")} />
          </Section>
        </FormCard>
      )}
    </Page>
  );
};

export default EditPatient;