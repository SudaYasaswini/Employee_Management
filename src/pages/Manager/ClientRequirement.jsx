// ClientIntakePage.jsx
import { useForm, FormProvider, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useMemo } from "react";

const RequirementIntakeSchema = z.object({
  clientInfo: z.object({
    businessName: z.string().min(2),
    stakeholders: z.array(z.string().min(2)).min(1),
    targetAudience: z.string().min(2),
    budget: z.number().nonnegative().optional(),
    timelineWeeks: z.number().int().positive().optional(),
  }),
  functional: z.object({
    features: z.array(z.string().min(2)).min(1),
    userRoles: z.array(z.string().min(2)).min(1),
    integrations: z.array(z.string()).optional(),
    // optional helpers used by UI; keep schema permissive if you later bind them
    featuresCsv: z.string().optional(),
    userRolesCsv: z.string().optional(),
    integrationsCsv: z.string().optional(),
    pagesCsv: z.string().optional(),
    // product-specific optional fields
    ecom: z
      .object({
        variants: z.string().optional(),
        taxRegions: z.string().optional(),
        gateways: z.string().optional(),
        shipping: z.string().optional(),
      })
      .optional(),
    mobile: z
      .object({
        targets: z.string().optional(),
        approach: z.string().optional(),
        push: z.string().optional(),
        offline: z.string().optional(),
      })
      .optional(),
    seo: z
      .object({
        pages: z.string().optional(),
        schema: z.string().optional(),
        kpis: z.string().optional(),
        cadence: z.string().optional(),
      })
      .optional(),
    content: z
      .object({
        types: z.string().optional(),
        tone: z.string().optional(),
      })
      .optional(),
    marketing: z
      .object({
        channels: z.string().optional(),
        split: z.string().optional(),
      })
      .optional(),
  }),
  nonFunctional: z.object({
    performanceSla: z.string().optional(),
    securityCompliance: z.array(z.string()).optional(),
    availability: z.string().optional(),
    accessibility: z.string().optional(),
  }),
  technical: z.object({
    preferredStack: z.array(z.string()).optional(),
    dbChoice: z.string().optional(),
    hosting: z.enum(["cloud", "onprem", "hybrid"]).optional(),
    frontend: z.string().optional(),
    backend: z.string().optional(),
    frameworks: z.string().optional(),
  }),
  uiux: z.object({
    brandColors: z.array(z.string()).optional(),
    hasWireframes: z.boolean().default(false),
    responsive: z.boolean().default(true),
  }),
  qa: z.object({
    testTypes: z.array(z.string()).optional(),
    acceptanceCriteria: z.array(z.string()).optional(),
    acceptanceCriteriaText: z.string().optional(),
  }),
  deployment: z.object({
    model: z.enum(["cloud", "onprem", "hybrid"]).optional(),
    releaseStrategy: z.enum(["continuous", "scheduled"]).optional(),
    supportSla: z.string().optional(),
  }),
});

export default function ClientIntakePage() {
  const methods = useForm({
    resolver: zodResolver(RequirementIntakeSchema),
    defaultValues: {
      clientInfo: { stakeholders: [] },
      functional: { features: [], userRoles: [], integrations: [] },
      nonFunctional: { securityCompliance: [] },
      technical: { preferredStack: [] },
      uiux: { brandColors: [], hasWireframes: false, responsive: true },
      qa: { testTypes: [], acceptanceCriteria: [] },
      deployment: { model: "cloud", releaseStrategy: "continuous" },
    },
  });

  const { handleSubmit, register, control, formState } = methods;
  const { isSubmitting, errors } = formState;

  const onSubmit = async (data) => {
    const res = await fetch("http://localhost:8080/api/requirements/intake", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      alert("Save failed");
      return;
    }
    alert("Saved successfully");
  };

  const Section = ({ title, children }) => (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 font-semibold tracking-tight text-zinc-900">{title}</h3>
      <div className="grid gap-4">{children}</div>
    </section>
  );

  const inputBase =
    "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 shadow-sm outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10";

  const labelBase = "text-sm font-medium text-zinc-700";
  const gridTwo = "grid grid-cols-1 gap-4 md:grid-cols-2";

  // NEW: local state to enable/disable each subsection group (for Web type)
  const [sectionsEnabled, setSectionsEnabled] = useState({
    header: false,
    footer: false,
    home: false,
    auth: false,
    settings: false,
  });
  const toggleSection = (key) =>
    setSectionsEnabled((p) => ({ ...p, [key]: !p[key] }));

  // Watch selected product type (reuse your Type select path)
  const selectedType = useWatch({ control, name: "functional.pagesCsv" });

  // Product type -> JSX mapping (only used inside the modified section)
  const TypeFields = useMemo(() => {
    switch (selectedType) {
      case "Website Development":
        return (
          <>
            {/* Header */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 font-semibold text-gray-900">
                <input
                  type="checkbox"
                  className="section-toggle w-4 h-4 accent-indigo-600"
                  checked={sectionsEnabled.header}
                  onChange={() => toggleSection("header")}
                />
                <span>Header</span>
                </label>
                 <fieldset
                  className="grid grid-cols-2 gap-2 rounded-md border border-gray-200 p-3 disabled:opacity-50"
                  disabled={!sectionsEnabled.header}
                >
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="header.logo" className="w-4 h-4 accent-indigo-600" />
                    <span>Logo</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="header.nav" className="w-4 h-4 accent-indigo-600" />
                    <span>Navigation</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="header.search" className="w-4 h-4 accent-indigo-600" />
                    <span>Search</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="header.cta" className="w-4 h-4 accent-indigo-600" />
                    <span>CTA</span>
                  </label>
                </fieldset>
              </div>

              {/* Footer */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 font-semibold text-gray-900">
                  <input
                    type="checkbox"
                    className="section-toggle w-4 h-4 accent-indigo-600"
                    checked={sectionsEnabled.footer}
                    onChange={() => toggleSection("footer")}
                  />
                  <span>Footer</span>
                </label>

                <fieldset
                  className="grid grid-cols-2 gap-2 rounded-md border border-gray-200 p-3 disabled:opacity-50"
                  disabled={!sectionsEnabled.footer}
                >
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="footer.links" className="w-4 h-4 accent-indigo-600" />
                    <span>Links</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="footer.contact" className="w-4 h-4 accent-indigo-600" />
                    <span>Contact</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="footer.social" className="w-4 h-4 accent-indigo-600" />
                    <span>Social</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="footer.legal" className="w-4 h-4 accent-indigo-600" />
                    <span>Legal</span>
                  </label>
                </fieldset>
              </div>

              {/* Home */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 font-semibold text-gray-900">
                  <input
                    type="checkbox"
                    className="section-toggle w-4 h-4 accent-indigo-600"
                    checked={sectionsEnabled.home}
                    onChange={() => toggleSection("home")}
                  />
                  <span>Home</span>
                </label>

                <fieldset
                  className="grid grid-cols-2 gap-2 rounded-md border border-gray-200 p-3 disabled:opacity-50"
                  disabled={!sectionsEnabled.home}
                >
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="home.hero" className="w-4 h-4 accent-indigo-600" />
                    <span>Hero</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="home.features" className="w-4 h-4 accent-indigo-600" />
                    <span>Features</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="home.testimonials" className="w-4 h-4 accent-indigo-600" />
                    <span>Testimonials</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="home.faq" className="w-4 h-4 accent-indigo-600" />
                    <span>FAQ</span>
                  </label>
                </fieldset>
              </div>

              {/* Authentication */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 font-semibold text-gray-900">
                  <input
                    type="checkbox"
                    className="section-toggle w-4 h-4 accent-indigo-600"
                    checked={sectionsEnabled.auth}
                    onChange={() => toggleSection("auth")}
                  />
                  <span>Authentication</span>
                </label>

                <fieldset
                  className="grid grid-cols-2 gap-2 rounded-md border border-gray-200 p-3 disabled:opacity-50"
                  disabled={!sectionsEnabled.auth}
                >
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="auth.signup" className="w-4 h-4 accent-indigo-600" />
                    <span>Sign up</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="auth.login" className="w-4 h-4 accent-indigo-600" />
                    <span>Login</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="auth.reset" className="w-4 h-4 accent-indigo-600" />
                    <span>Password reset</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="auth.mfa" className="w-4 h-4 accent-indigo-600" />
                    <span>MFA</span>
                  </label>
                </fieldset>
              </div>

              {/* Settings */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 font-semibold text-gray-900">
                  <input
                    type="checkbox"
                    className="section-toggle w-4 h-4 accent-indigo-600"
                    checked={sectionsEnabled.settings}
                    onChange={() => toggleSection("settings")}
                  />
                  <span>Settings</span>
                </label>

                <fieldset
                  className="grid grid-cols-2 gap-2 rounded-md border border-gray-200 p-3 disabled:opacity-50"
                  disabled={!sectionsEnabled.settings}
                >
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="settings.profile" className="w-4 h-4 accent-indigo-600" />
                    <span>Profile</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="settings.billing" className="w-4 h-4 accent-indigo-600" />
                    <span>Billing</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="settings.team" className="w-4 h-4 accent-indigo-600" />
                    <span>Team &amp; roles</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="settings.integrations" className="w-4 h-4 accent-indigo-600" />
                    <span>Integrations</span>
                  </label>
                </fieldset>
              </div>
            </>
        );

      case "E-commerce Development":
        return (
          <>
            <div className="space-y-2">
              <h4 className="font-semibold text-zinc-900">Catalog & PDP</h4>
              <div className={gridTwo}>
                <div>
                  <label className={labelBase}>Product variants</label>
                  <input className={inputBase} placeholder="Size, Color" {...register("functional.ecom.variants")} />
                </div>
                <div>
                  <label className={labelBase}>Tax regions</label>
                  <input className={inputBase} placeholder="US, EU, IN" {...register("functional.ecom.taxRegions")} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-zinc-900">Checkout & Payments</h4>
              <div className={gridTwo}>
                <div>
                  <label className={labelBase}>Gateways</label>
                  <input className={inputBase} placeholder="Stripe, Razorpay" {...register("functional.ecom.gateways")} />
                </div>
                <div>
                  <label className={labelBase}>Shipping providers</label>
                  <input className={inputBase} placeholder="Shippo, Shiprocket" {...register("functional.ecom.shipping")} />
                </div>
              </div>
            </div>
          </>
        );

      case "Mobile App Development":
        return (
          <>
            <div className="space-y-2">
              <h4 className="font-semibold text-zinc-900">Platforms</h4>
              <div className={gridTwo}>
                <div>
                  <label className={labelBase}>Targets</label>
                  <select className={inputBase} {...register("functional.mobile.targets")}>
                    <option value="ios">iOS</option>
                    <option value="android">Android</option>
                    <option value="both">Both</option>
                  </select>
                </div>
                <div>
                  <label className={labelBase}>Build approach</label>
                  <select className={inputBase} {...register("functional.mobile.approach")}>
                    <option value="native">Native</option>
                    <option value="react-native">React Native</option>
                    <option value="flutter">Flutter</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-zinc-900">App features</h4>
              <div className={gridTwo}>
                <div>
                  <label className={labelBase}>Push notifications</label>
                  <select className={inputBase} {...register("functional.mobile.push")}>
                    <option value="none">None</option>
                    <option value="basic">Basic</option>
                    <option value="segmented">Segmented</option>
                  </select>
                </div>
                <div>
                  <label className={labelBase}>Offline mode</label>
                  <select className={inputBase} {...register("functional.mobile.offline")}>
                    <option value="no">No</option>
                    <option value="partial">Partial</option>
                    <option value="full">Full</option>
                  </select>
                </div>
              </div>
            </div>
          </>
        );

      case "SEO Services":
        return (
          <>
            <div className="space-y-2">
              <h4 className="font-semibold text-zinc-900">On-page</h4>
              <div className={gridTwo}>
                <div>
                  <label className={labelBase}>Pages to optimize</label>
                  <input className={inputBase} placeholder="Home, Category, Blog" {...register("functional.seo.pages")} />
                </div>
                <div>
                  <label className={labelBase}>Schema types</label>
                  <input className={inputBase} placeholder="Article, Product, FAQ" {...register("functional.seo.schema")} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-zinc-900">Reporting</h4>
              <div className={gridTwo}>
                <div>
                  <label className={labelBase}>KPIs</label>
                  <input className={inputBase} placeholder="Impressions, CTR, Conversions" {...register("functional.seo.kpis")} />
                </div>
                <div>
                  <label className={labelBase}>Cadence</label>
                  <select className={inputBase} {...register("functional.seo.cadence")}>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Biweekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
            </div>
          </>
        );

      case "Content Creation":
        return (
          <div className="space-y-2">
            <h4 className="font-semibold text-zinc-900">Content</h4>
            <div className={gridTwo}>
              <div>
                <label className={labelBase}>Content types</label>
                <input className={inputBase} placeholder="Blogs, Case studies, Videos" {...register("functional.content.types")} />
              </div>
              <div>
                <label className={labelBase}>Tone & guidelines</label>
                <input className={inputBase} placeholder="Professional, Conversational" {...register("functional.content.tone")} />
              </div>
            </div>
          </div>
        );

      case "Digital Marketing":
        return (
          <div className="space-y-2">
            <h4 className="font-semibold text-zinc-900">Channels</h4>
            <div className={gridTwo}>
              <div>
                <label className={labelBase}>Primary channels</label>
                <input className={inputBase} placeholder="Search, Social, Email" {...register("functional.marketing.channels")} />
              </div>
              <div>
                <label className={labelBase}>Budget split</label>
                <input className={inputBase} placeholder="40/40/20" {...register("functional.marketing.split")} />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  }, [selectedType, sectionsEnabled]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <FormProvider {...methods}>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Client Intake</h1>
          <p className="mt-1 text-zinc-600">All categories on one page, saved in a single submission.</p>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="grid gap-6">
            <Section title="Client Info">
              <div className={gridTwo}>
                <div>
                  <label className={labelBase}>Business name</label>
                  <input className={inputBase} placeholder="Acme Corp" {...register("clientInfo.businessName")} />
                </div>
                <div>
                  <label className={labelBase}>Target audience</label>
                  <input className={inputBase} placeholder="SMBs in retail" {...register("clientInfo.targetAudience")} />
                </div>
              </div>
              <div className={gridTwo}>
                <div>
                  <label className={labelBase}>Budget</label>
                  <input type="number" className={inputBase} placeholder="50000" {...register("clientInfo.budget", { valueAsNumber: true })} />
                </div>
                <div>
                  <label className={labelBase}>Timeline (weeks)</label>
                  <input type="number" className={inputBase} placeholder="12" {...register("clientInfo.timelineWeeks", { valueAsNumber: true })} />
                </div>
              </div>
            </Section>

            {/* ONLY THIS SECTION MODIFIED */}
            <Section title="Project/Product Type">
              <div>
                <label className={labelBase}>Type</label>
                <select className={inputBase} {...register("functional.pagesCsv")}>
                  <option value="" disabled hidden>Select type </option>
                  <option value="Website Development">Website Development</option>
                  <option value="Mobile App Development">Mobile App Development</option>
                  <option value="E-commerce Development">E-commerce Development</option>
                  <option value="SEO Services">SEO Services</option>
                  <option value="Content Creation">Content Creation</option>
                  <option value="Digital Marketing">Digital Marketing</option>
                </select>
              </div>

              {/* Conditionally rendered fields for the chosen product type */}
              {TypeFields}
            </Section>
            {/* END MODIFICATION */}

            <Section title="Technical">
              <div className={gridTwo}>
                <div>
                  <label className={labelBase}>DB choice</label>
                  <input className={inputBase} placeholder="PostgreSQL" {...register("technical.dbChoice")} />
                </div>
                <div>
                  <label className={labelBase} >Frontend</label>
                  <select className={inputBase} {...register("technical.frontend")}>
                    <option value="" disabled hidden>Select skills (HTML, JS, CSS) </option>
                    <option value="Required">Required</option>
                    <option value="Not Required">Not Required</option>
                  </select>
                </div>
                <div>
                  <label className={labelBase}>Backend</label>
                  <select className={inputBase} {...register("technical.backend")}>
                    <option value="cloud">JAVA</option>
                    <option value="onprem">PYTHON</option>
                    <option value="hybrid">.NET</option>
                    <option value="NODE.js">NODE.js</option>
                  </select>
                </div>
                <div>
                  <label className={labelBase}>Frameworks</label>
                  <select className={inputBase} {...register("technical.frameworks")}>
                    <option value="cloud">cloud</option>
                    <option value="onprem">onprem</option>
                    <option value="hybrid">hybrid</option>
                  </select>
                </div>
                <div>
                  <label className={labelBase}>Hosting</label>
                  <select className={inputBase} {...register("technical.hosting")}>
                    <option value="cloud">cloud</option>
                    <option value="onprem">onprem</option>
                    <option value="hybrid">hybrid</option>
                  </select>
                </div>
              </div>
            </Section>

            
          </div>

          <div className="grid gap-6">
            <Section title="Non-Functional">
              <div className={gridTwo}>
                <div>
                  <label className={labelBase}>Performance SLA</label>
                  <input className={inputBase} placeholder="p95 < 300ms" {...register("nonFunctional.performanceSla")} />
                </div>
                <div>
                  <label className={labelBase}>Availability</label>
                  <input className={inputBase} placeholder="99.9%" {...register("nonFunctional.availability")} />
                </div>
              </div>
              <div>
                <label className={labelBase}>Accessibility</label>
                <input className={inputBase} placeholder="WCAG 2.1 AA" {...register("nonFunctional.accessibility")} />
              </div>
            </Section>

            {/* <Section title="UI/UX"> ... </Section> */}

            <Section title="QA">
              <div>
                <label className={labelBase}>Acceptance criteria (one per line)</label>
                <textarea className={inputBase} rows={4} placeholder="User can sign in&#10;Admin can assign tasks" {...register("qa.acceptanceCriteriaText")} />
              </div>
            </Section>

            <Section title="Deployment">
              <div className={gridTwo}>
                <div>
                  <label className={labelBase}>Model</label>
                  <select className={inputBase} {...register("deployment.model")}>
                    <option value="cloud">cloud</option>
                    <option value="onprem">onprem</option>
                    <option value="hybrid">hybrid</option>
                  </select>
                </div>
                <div>
                  <label className={labelBase}>Release strategy</label>
                  <select className={inputBase} {...register("deployment.releaseStrategy")}>
                    <option value="continuous">continuous</option>
                    <option value="scheduled">scheduled</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelBase}>Support SLA</label>
                <input className={inputBase} placeholder="Business hours" {...register("deployment.supportSla")} />
              </div>
            </Section>

            <div className="flex items-center justify-between gap-4">
              <div className="text-sm text-zinc-600">
                {Object.keys(errors ?? {}).length > 0 ? "Fix validation errors" : " "}
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-white shadow-sm transition hover:bg-zinc-800 disabled:opacity-50"
              >
                Save all
              </button>
            </div>
          </div>
        </form>
      </div>
    </FormProvider>
  );
}
