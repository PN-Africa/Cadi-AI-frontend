import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPatient, getCaregivers } from "../services/apiAdmin";
import {
  AreaField,
  FormCard,
  Page,
  PhoneField,
  Section,
  SelectField,
  TextField,
  patientStatusOptions,
  toPhone,
  useFields,
  useLoad,
  useSubmit,
} from "../components/AdminForm";

const genders = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const relationships = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married" },
];

const initial = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "",
  phoneNumber: "",
  emailAddress: "",
  homeAddress: "",
  contactName: "",
  relationship: "",
  contactPhone: "",
  status: "NORMAL",
  caregiverId: "",
  allergies: "",
  careNotes: "",
};

const AddPatient = () => {
  const navigate = useNavigate();
  const { f, setF, bind } = useFields(initial);
  const { data: caregivers } = useLoad(getCaregivers, []);

  // Preselect the first caregiver, as in the design
  useEffect(() => {
    if (caregivers?.length) setF((p) => (p.caregiverId ? p : { ...p, caregiverId: caregivers[0].id }));
  }, [caregivers, setF]);

  const submit = useSubmit(async () => {
    await createPatient({
      personalInformation: {
        firstName: f.firstName.trim(),
        lastName: f.lastName.trim(),
        dateOfBirth: f.dateOfBirth,
        gender: f.gender,
        phoneNumber: toPhone(f.phoneNumber),
        emailAddress: f.emailAddress.trim(),
        homeAddress: f.homeAddress.trim(),
      },
      emergencyContact: {
        fullName: f.contactName.trim(),
        relationship: f.relationship,
        phoneNumber: toPhone(f.contactPhone),
      },
      care: {
        status: f.status,
        assignedCaregiverId: f.caregiverId,
        allergies: f.allergies.trim(),
        careNotes: f.careNotes.trim(),
      },
    });
    navigate("/patients");
  });

  return (
    <Page
      crumbs={[{ label: "Patients", to: "/patients" }, { label: "Add patient" }]}
      title="Add Patient"
      description="Create a patient record to start managing their care. Fields marked * are required."
    >
      <FormCard
        {...submit}
        note="Patient details are only visible to your care team."
        submitLabel="Save patient"
        onCancel={() => navigate("/patients")}
      >
        <Section
          title="Personal information"
          description="Enter the patient's identity and contact details."
          badge="Patient ID generated on save"
        >
          <TextField label="First name" required placeholder="Enter first name" {...bind("firstName")} />
          <TextField label="Last name" required placeholder="Enter last name" {...bind("lastName")} />
          <TextField
            label="Date of birth"
            required
            type="date"
            max={new Date().toISOString().slice(0, 10)}
            {...bind("dateOfBirth")}
          />
          <SelectField label="Gender" placeholder="Select gender" options={genders} {...bind("gender")} />
          <PhoneField label="Phone number" required placeholder="Enter phone number" {...bind("phoneNumber")} />
          <TextField label="Email address" type="email" placeholder="Enter email address" {...bind("emailAddress")} />
          <TextField label="Home address" wide placeholder="Street address, city, state" {...bind("homeAddress")} />
        </Section>

        <Section title="Emergency contact" description="Who should we contact if the patient needs urgent help?">
          <TextField label="Full name" required placeholder="Enter contact's full name" {...bind("contactName")} />
          <SelectField
            label="Relationship"
            required
            placeholder="Select relationship"
            options={relationships}
            {...bind("relationship")}
          />
          <PhoneField label="Phone number" required placeholder="Enter phone number" {...bind("contactPhone")} />
        </Section>

        <Section title="Care information" description="Set the patient's initial status and any important care details.">
          <SelectField label="Patient status" required options={patientStatusOptions} {...bind("status")} />
          <SelectField
            label="Assigned caregiver"
            placeholder="Select caregiver"
            options={(caregivers ?? []).map((c) => ({ value: c.id, label: `${c.fullName} (Caregiver)` }))}
            {...bind("caregiverId")}
          />
          <TextField label="Allergies (None if applicable)" placeholder="e.g. Penicillin, or none known" {...bind("allergies")} />
          <AreaField
            label={
              <>
                Care notes <span className="font-normal text-[#6B7C93]">(optional)</span>
              </>
            }
            placeholder="Add medical conditions, current medications or care instructions..."
            {...bind("careNotes")}
          />
        </Section>
      </FormCard>
    </Page>
  );
};

export default AddPatient;