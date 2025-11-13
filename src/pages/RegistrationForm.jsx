import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { apiPost } from "../lib/api";

const EMP_ID_PATTERN = "EMP-[A-Z0-9]{4,20}";

// ✅ Employee ID Generator
const generateEmpId = () => {
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `EMP-${rand}`;
};

export default function RegistrationForm() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    empRole: "",
    empId: generateEmpId(), // Auto-filled on load
    isActive: true,
  });

  const [validated, setValidated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [showPassword, setShowPassword] = useState(false);

  // ✅ Update form values + regenerate ID when role changes
  const onChange = (e) => {
    const { name, type, value, checked } = e.target;

    if (name === "empRole") {
      setForm((prev) => ({
        ...prev,
        empRole: value,
        empId: generateEmpId(),
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formEl = e.currentTarget;

    if (!formEl.checkValidity()) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    try {
      setSubmitting(true);
      setAlert({ type: "", message: "" });

      const res = await apiPost("/v1/auth/register", form);

      if (res.ok) {
        setAlert({ type: "success", message: "Registration successful." });
        setForm({
          email: "",
          password: "",
          empRole: "",
          empId: generateEmpId(), // Reset new auto ID after success
          isActive: true,
        });
        setValidated(false);
      } else {
        let msg = "Registration failed.";
        try {
          const data = await res.json();
          msg = data.message || data.error || msg;
        } catch {}
        setAlert({ type: "danger", message: msg });
      }
    } catch {
      setAlert({ type: "danger", message: "Network error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 px-4">
      <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-1">
          Employee Registration
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Fill in your details below to proceed.
        </p>

        <form noValidate onSubmit={handleSubmit}>
          {/* Email */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700">Work Email</label>
            <input
              type="email"
              name="email"
              required
              maxLength={120}
              className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-black focus:border-black outline-none"
              placeholder="name@company.com"
              value={form.email}
              onChange={onChange}
            />
          </div>

          {/* Password with Show/Hide Toggle */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                minLength={6}
                required
                className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-black focus:border-black outline-none pr-10"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={onChange}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword((p) => !p)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Role */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700">Role</label>
            <select
              name="empRole"
              required
              value={form.empRole}
              onChange={onChange}
              className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-black focus:border-black outline-none"
            >
              <option value="" disabled>Select role</option>
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="hr">HR</option>
              <option value="owner">Owner</option>
            </select>
          </div>

          {/* Employee ID (auto-filled + editable) */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700">Employee ID</label>
            <input
              name="empId"
              type="text"
              required
              pattern={EMP_ID_PATTERN}
              value={form.empId}
              onChange={onChange}
              className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-black focus:border-black outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Auto-generated. You may modify if needed.
            </p>
          </div>

          {/* Active Checkbox */}
          <label className="flex items-center gap-2 mb-5 cursor-pointer">
            <input type="checkbox" name="isActive" checked={form.isActive} onChange={onChange} />
            <span className="text-sm text-gray-700">Active</span>
          </label>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-black text-white py-2.5 rounded-lg font-medium hover:bg-gray-900 transition disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Register"}
          </button>
        </form>

        {alert.message && (
          <p
            className={`mt-4 text-center text-sm ${
              alert.type === "success" ? "text-green-600" : "text-red-600"
            }`}
          >
            {alert.message}
          </p>
        )}
      </div>

      <p className="text-center text-gray-400 text-xs mt-4">
        By continuing, you agree to our Terms and Privacy Policy.
      </p>
    </div>
  );
}
