import { useForm, FormProvider, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState, useEffect } from "react";
import TaskTemplatePicker from "../../components/TaskTemplatePicker";

// ------------------ Validation Schema ------------------
const RequirementIntakeSchema = z.object({
  clientInfo: z.object({
    businessName: z.string().min(2),
    stakeholders: z.array(z.string().min(2)).optional(),
    projectname: z.string().min(2),
    budget: z.number().nonnegative().optional(),
    timelineWeeks: z.number().int().positive().optional(),
  }),
  functional: z.object({
    pagesCsv: z.string().optional(),
  }),
  technical: z.object({
    dbChoice: z.string().optional(),
    hosting: z.enum(["cloud", "onprem", "hybrid"]).optional(),
    frontend: z.string().optional(),
    backend: z.string().optional(),
    frameworks: z.string().optional(),
    deployModel: z.enum(["cloud", "onprem", "hybrid"]).optional(),
    releaseStrategy: z.enum(["continuous", "scheduled"]).optional(),
    supportSla: z.string().optional(),
  }),
  uiux: z.object({
    brandColors: z.array(z.string()).optional(),
    hasWireframes: z.boolean().default(false),
    responsive: z.boolean().default(true),
  }),
});

// ------------------ Component ------------------
export default function ClientIntakePage() {
  const methods = useForm({
    resolver: zodResolver(RequirementIntakeSchema),
    defaultValues: {
      clientInfo: { stakeholders: [] },
      functional: { pagesCsv: "" },
      technical: {
        deployModel: "cloud",
        releaseStrategy: "continuous",
      },
      uiux: { brandColors: [], hasWireframes: false, responsive: true },
    },
  });

  const { handleSubmit, register, control, formState } = methods;
  const { isSubmitting, errors } = formState;

  const [files, setFiles] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateIds, setSelectedTemplateIds] = useState([]);
  const selectedType = useWatch({ control, name: "functional.pagesCsv" });

  // ---------- Scroll Helpers ----------
  const scrollYRef = useRef(0);
  const saveScroll = () => {
    if (typeof window !== "undefined") scrollYRef.current = window.scrollY; // [web:52]
  };
  const restoreScroll = () => {
    if (typeof window !== "undefined")
      requestAnimationFrame(() => window.scrollTo({ top: scrollYRef.current })); // [web:52]
  };

  const preventDefault = (e) => e.preventDefault(); // [web:52]
  const onDrop = (e) => {
    e.preventDefault();
    setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files || [])]); // [web:106]
  };
  const onPick = (e) => {
    setFiles((prev) => [...prev, ...Array.from(e.target.files || [])]); // [web:106]
  };

  const Section = ({ title, children }) => (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 font-semibold tracking-tight text-zinc-900">{title}</h3>
      <div className="grid gap-4">{children}</div>
    </section>
  ); // [web:130]

  const inputBase =
    "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 shadow-sm outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10";
  const labelBase = "text-sm font-medium text-zinc-700";
  const gridTwo = "grid grid-cols-1 gap-4 md:grid-cols-2";

  // ---------- Template Picker ----------
  const handleSelectTemplate = (id) => {
    setSelectedTemplateIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    ); // [web:130]
  };

  // ---------- Load Templates (backend-only) ----------
  useEffect(() => {
    if (!selectedType) {
      setTemplates([]);
      return;
    }
    let abort = false;

    const loadTemplates = async () => {
      try {
        const res = await fetch(
          `/api/task-templates?type=${encodeURIComponent(selectedType)}`
        ); // [web:137]
        if (!res.ok) throw new Error("Failed to load templates"); // [web:130]
        const data = await res.json(); // [web:130]
        if (!abort) setTemplates(Array.isArray(data) ? data : []); // [web:130]
      } catch (e) {
        console.error("Failed to load templates", e); // [web:130]
        if (!abort) setTemplates([]); // [web:130]
      }
    };

    loadTemplates();
    return () => {
      abort = true; // [web:52]
    };
  }, [selectedType]);

  // ---------- Submit (backend-only) ----------
  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append(
        "payload",
        new Blob([JSON.stringify(data)], { type: "application/json" })
      ); // [web:106]
      files.forEach((f) => formData.append("files", f, f.name)); // [web:106]

      // 1) Create requirement intake
      const intakeRes = await fetch(`/api/requirements/intake`, {
        method: "POST",
        body: formData,
      }); // [web:57][web:106]
      if (!intakeRes.ok) throw new Error("Failed to save intake"); // [web:130]
      const saved = await intakeRes.json(); // [web:57]

      // 2) Create stories from selected templates (optional)
      if (selectedTemplateIds.length) {
        try {
          await fetch(`/api/stories/from-templates`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              projectId: saved.projectId,
              requirementId: saved.id,
              templateIds: selectedTemplateIds,
              intakePayload: data,
              createdBy: "manager",
            }),
          }); // [web:57]
        } catch (e) {
          console.error("Failed to create backlog stories from templates", e); // [web:130]
          alert("Saved intake, but failed to create backlog stories."); // [web:130]
        }
      }

      alert("✅ Saved successfully!"); // [web:130]
    } catch (e) {
      console.error("❌ Save failed:", e); // [web:130]
      alert("❌ Save failed — please try again."); // [web:130]
    }
  };

  // ---------- UI ----------
  return (
    <FormProvider {...methods}>
      <div className="min-h-screen w-full bg-zinc-50">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <header className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              Client Intake
            </h1>
            <p className="mt-1 text-zinc-600">
              All categories on one page, saved in a single submission.
            </p>
          </header>

          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-6">
            <div className="grid gap-6">
              <Section title="Client Info">
                <div className={gridTwo}>
                  <div>
                    <label className={labelBase}>Business name</label>
                    <input
                      className={inputBase}
                      placeholder="Acme Corp"
                      {...register("clientInfo.businessName")}
                      onFocus={saveScroll}
                    />
                  </div>
                  <div>
                    <label className={labelBase}>Project name</label>
                    <input
                      className={inputBase}
                      placeholder="Project Name"
                      {...register("clientInfo.projectname")}
                      onFocus={saveScroll}
                    />
                  </div>
                </div>
              </Section>

              <Section title="Project / Product Type">
                <div>
                  <label className={labelBase}>Type</label>
                  <select
                    className={inputBase}
                    {...register("functional.pagesCsv")}
                    onFocus={saveScroll}
                  >
                    <option value="" disabled hidden>
                      Select type
                    </option>
                    <option value="Website Development">Website Development</option>
                    <option value="Mobile App Development">Mobile App Development</option>
                    <option value="E-commerce Development">E-commerce Development</option>
                    <option value="SEO Services">SEO Services</option>
                    <option value="Content Creation">Content Creation</option>
                    <option value="Digital Marketing">Digital Marketing</option>
                  </select>
                </div>

                {selectedType && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-zinc-700 mb-2">
                      Suggested Features (click + to add)
                    </h4>
                    {templates.length > 0 ? (
                      <TaskTemplatePicker
                        templates={templates}
                        selected={selectedTemplateIds}
                        onSelect={handleSelectTemplate}
                      />
                    ) : (
                      <p className="text-sm text-gray-500">
                        No templates found for this type.
                      </p>
                    )}
                  </div>
                )}
              </Section>

              <Section title="Technical + Deployment">
                <div className={gridTwo}>
                  <div>
                    <label className={labelBase}>DB choice</label>
                    <input
                      className={inputBase}
                      placeholder="PostgreSQL"
                      {...register("technical.dbChoice")}
                      onFocus={saveScroll}
                    />
                  </div>
                  <div>
                    <label className={labelBase}>Frontend</label>
                    <select className={inputBase} {...register("technical.frontend")}>
                      <option value="" disabled hidden>
                        Select
                      </option>
                      <option value="Required">Required</option>
                      <option value="Not Required">Not Required</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelBase}>Backend</label>
                    <select className={inputBase} {...register("technical.backend")}>
                      <option value="JAVA">JAVA</option>
                      <option value="PYTHON">PYTHON</option>
                      <option value=".NET">.NET</option>
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

                <div className="mt-4 border-t border-zinc-200 pt-4">
                  <h4 className="font-semibold text-zinc-900 mb-2">Deployment</h4>
                  <div className={gridTwo}>
                    <div>
                      <label className={labelBase}>Model</label>
                      <select className={inputBase} {...register("technical.deployModel")}>
                        <option value="cloud">cloud</option>
                        <option value="onprem">onprem</option>
                        <option value="hybrid">hybrid</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelBase}>Release strategy</label>
                      <select className={inputBase} {...register("technical.releaseStrategy")}>
                        <option value="continuous">continuous</option>
                        <option value="scheduled">scheduled</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className={labelBase}>Support SLA</label>
                    <input
                      className={inputBase}
                      placeholder="Business hours"
                      {...register("technical.supportSla")}
                    />
                  </div>
                </div>
              </Section>

              <Section title="UI / UX">
                <div className={gridTwo}>
                  <div>
                    <label className={labelBase}>Brand colors</label>
                    <input
                      className={inputBase}
                      placeholder="#000000, #FFFFFF"
                      {...register("uiux.brandColors.0")}
                    />
                  </div>
                  <div>
                    <label className={labelBase}>Wireframes available</label>
                    <select
                      className={inputBase}
                      {...register("uiux.hasWireframes", {
                        setValueAs: (v) => v === "true",
                      })}
                    >
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelBase}>Responsive</label>
                  <select
                    className={inputBase}
                    {...register("uiux.responsive", {
                      setValueAs: (v) => v === "true",
                    })}
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </Section>

              <Section title="Attachments">
                <div
                  onDragOver={preventDefault}
                  onDragEnter={preventDefault}
                  onDrop={onDrop}
                  className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 p-6 text-center"
                >
                  <p className="text-sm text-zinc-700">
                    Drag & drop files here, or click to browse
                  </p>
                  <input type="file" multiple onChange={onPick} className="mt-3 block w-full text-sm" />
                  {files.length > 0 && (
                    <ul className="mt-3 w-full text-left text-xs text-zinc-600 list-disc pl-4">
                      {files.map((f, i) => (
                        <li key={i}>
                          {f.name} ({f.type || "unknown"})
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <p className="text-xs text-zinc-500">All file types accepted.</p>
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
      </div>
    </FormProvider>
  );
}
