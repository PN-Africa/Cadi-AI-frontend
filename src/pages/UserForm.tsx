import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createUser, getUserEdit, updateUser } from "../services/apiAdmin";
import { useAuthStore } from "../auth/auth";
import { isAdminRole } from "../auth/roles";
import {
  AreaField,
  FormCard,
  LoadState,
  Page,
  PhoneField,
  Section,
  SelectField,
  TextField,
  fromPhone,
  toPhone,
  useFields,
  useLoad,
  useSubmit,
} from "../components/AdminForm";

const opts = (...values: string[]) => values.map((v) => ({ value: v, label: v }));

const roles = [
  { value: "CAREGIVER", label: "Caregiver" },
  { value: "HCP", label: "Healthcare professional (HCP)" },
];
const accessLevels = opts("Standard", "Elevated", "Administrative");
const departments = opts("Emergency Ward", "Cardiology", "ICU", "Geriatrics", "General Ward");
const teams = opts("Team Alpha", "Team Beta", "Team Gamma");
const groups = opts("Group A - Geriatric", "Group B - Cardiac", "Group C - General");

const initial = {
  firstName: "",
  lastName: "",
  role: "",
  email: "",
  phoneNumber: "",
  licenseNumber: "",
  accessLevel: "",
  department: "",
  assignedTeam: "",
  patientGroup: "",
  notes: "",
};

// Add user (/users/new) and user details/edit (/users/:id) share this form.
const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isAdmin = isAdminRole(useAuthStore((s) => s.user?.role));
  const { f, setF, bind } = useFields(initial);
  const { data, error: loadError, loading } = useLoad(
    () => (id ? getUserEdit(id) : Promise.resolve(null)),
    [id]
  );

  useEffect(() => {
    if (!data) return;
    setF({
      firstName: data.firstName ?? "",
      lastName: data.lastName ?? "",
      role: data.role ?? "",
      email: data.email ?? "",
      phoneNumber: fromPhone(data.phoneNumber),
      licenseNumber: data.licenseNumber ?? "",
      accessLevel: data.accessLevel ?? "",
      department: data.department ?? "",
      assignedTeam: data.assignedTeam ?? "",
      patientGroup: data.patientGroup ?? "",
      notes: data.notes ?? "",
    });
  }, [data, setF]);

  const submit = useSubmit(async () => {
    const payload = {
      ...f,
      firstName: f.firstName.trim(),
      lastName: f.lastName.trim(),
      email: f.email.trim(),
      phoneNumber: toPhone(f.phoneNumber),
      licenseNumber: f.licenseNumber.trim(),
      notes: f.notes.trim(),
    };
    if (id) await updateUser(id, payload);
    else await createUser(payload);
    navigate("/users");
  });

  const ready = !id || !!data;

  return (
    <Page
      crumbs={[{ label: "Users", to: "/users" }, { label: id ? "User details" : "Manage Users" }]}
      title={id ? "User Details" : "Manage Users"}
      description="Manage caregivers and healthcare professionals. Assign roles and access levels to ensure seamless patient care coordination."
      action={
        id && isAdmin ? (
          <Link
            to="/users/new"
            className="h-10 rounded-md bg-[#2563EB] px-5 text-[13px] font-medium leading-10 text-white hover:bg-[#1D4ED8]"
          >
            Add user
          </Link>
        ) : undefined
      }
    >
      {!ready ? (
        <LoadState loading={loading} error={loadError} />
      ) : (
        <FormCard
          {...submit}
          note="User access is restricted to their assigned role and patient groups."
          submitLabel="Save user"
          onCancel={() => navigate("/users")}
        >
          <Section
            title="User Details"
            description="Enter the user's identity and role information."
            badge={data?.userIdCode ? `User ID: ${data.userIdCode}` : "User ID generated on save"}
          >
            <TextField label="First name" required placeholder="Enter first name" {...bind("firstName")} />
            <TextField label="Last name" required placeholder="Enter last name" {...bind("lastName")} />
            <SelectField
              label="Role"
              required
              placeholder="Select role (Caregiver / HCP)"
              options={roles}
              {...bind("role")}
            />
            <TextField
              label="Email address"
              required
              type="email"
              placeholder="Enter email address"
              {...bind("email")}
            />
            <PhoneField label="Phone number" required placeholder="Enter phone number" {...bind("phoneNumber")} />
            <TextField label="License Number" placeholder="Enter license number" {...bind("licenseNumber")} />
          </Section>

          <Section
            title="Permissions & Access"
            description="Define the level of access this user should have within the system."
            cols={2}
          >
            <SelectField
              label="Access Level"
              required
              placeholder="Select access level"
              options={accessLevels}
              {...bind("accessLevel")}
            />
            <SelectField
              label="Department"
              placeholder="Select department"
              options={departments}
              {...bind("department")}
            />
          </Section>

          <Section
            title="Care Team Assignment"
            description="Assign this user to a specific care team or patient group."
            cols={2}
          >
            <SelectField label="Assigned Team" placeholder="Select care team" options={teams} {...bind("assignedTeam")} />
            <SelectField
              label="Patient Group"
              placeholder="Select patient group"
              options={groups}
              {...bind("patientGroup")}
            />
          </Section>

          <Section title="Notes" description="Add any internal notes regarding this user's access or responsibilities.">
            <AreaField
              label=""
              className="h-28"
              placeholder="Add notes about user permissions, training requirements, or special access instructions..."
              {...bind("notes")}
            />
          </Section>
        </FormCard>
      )}
    </Page>
  );
};

export default UserForm;