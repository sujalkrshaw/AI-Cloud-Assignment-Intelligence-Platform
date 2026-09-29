import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const HERO =
  'https://images.unsplash.com/photo-1748609278627-4b0e483b9b70?auto=format&fit=crop&fm=jpg&q=80&w=1800';

async function api(path, options = {}) {
  const token = localStorage.getItem('token');

  const headers = {
    ...(options.body instanceof FormData
      ? {}
      : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(API + path, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.detail || 'Request failed');
  }

  return data;
}

/* -------------------------------------------------------------------------- */
/* LOGIN                                                                     */
/* -------------------------------------------------------------------------- */

function Login({ onLogin }) {
  const [mode, setMode] = useState('login');

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'teacher',
  });

  const [err, setErr] = useState('');

  async function submit(e) {
    e.preventDefault();
    setErr('');

    try {
      const data = await api('/auth/' + mode, {
        method: 'POST',
        body: JSON.stringify(form),
      });

      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));

      onLogin(data.user);
    } catch (x) {
      setErr(x.message);
    }
  }

  return (
    <div className="login-shell">
      <div
        className="login-visual"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(6,17,30,.08), rgba(6,17,30,.92)), url(${HERO}), url(/reference-dashboard-visual.png)`,
        }}
      >
        <div className="visual-copy">
          <span className="logo-mark">AI</span>
          <span className="brand-name">Cloud Intelligence</span>

          <h1>Turn academic workflows into actionable intelligence.</h1>

          <p>
            Secure cloud submissions, document intelligence, similarity
            analysis and human-reviewed AI feedback in one platform.
          </p>
        </div>
      </div>

      <div className="login-card">
        <div className="brand-row">
          <span className="logo-mark">AI</span>

          <div>
            <b>Assignment Intelligence</b>
            <small>Cloud + AI academic workflow</small>
          </div>
        </div>

        <h2>
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </h2>

        <p className="muted">
          Use the demo accounts or register a new student/teacher.
        </p>

        {err && <div className="error">{err}</div>}

        <form onSubmit={submit} className="form-stack">
          {mode === 'register' && (
            <input
              placeholder="Full name"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
              required
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value,
              })
            }
            required
          />

          {mode === 'register' && (
            <select
              value={form.role}
              onChange={(e) =>
                setForm({
                  ...form,
                  role: e.target.value,
                })
              }
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          )}

          <button className="primary wide">
            {mode === 'login' ? 'Sign in' : 'Register'}
          </button>
        </form>

        <button
          className="ghost wide"
          onClick={() =>
            setMode(mode === 'login' ? 'register' : 'login')
          }
        >
          {mode === 'login'
            ? 'Create an account'
            : 'Back to sign in'}
        </button>

        <div className="demo-box">
          <b>Demo credentials</b>
          <br />
          Teacher: teacher@demo.edu / Teacher@123
          <br />
          Student: student1@demo.edu / Student@123
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* SIDEBAR                                                                    */
/* -------------------------------------------------------------------------- */

function Sidebar({ user, section, setSection, logout }) {
  const items =
    user.role === 'admin'
      ? [
          ['overview', '⌂', 'Admin Overview'],
          ['users', '♙', 'User Governance'],
          ['courses', '▣', 'Courses & Batches'],
          ['audit', '◷', 'Audit Logs'],
          ['analytics', '◒', 'Enterprise Analytics'],
          ['settings', '⚙', 'AI Settings'],
        ]
      : user.role === 'teacher'
        ? [
            ['overview', '⌂', 'Dashboard'],
            ['assignments', '▣', 'Assignments'],
            ['review', '✓', 'AI Review'],
            ['analytics', '◒', 'Analytics'],
            ['settings', '⚙', 'Settings'],
          ]
        : [
            ['overview', '⌂', 'Dashboard'],
            ['assignments', '▣', 'Assignments'],
            ['submissions', '↥', 'My Submissions'],
            ['analytics', '◒', 'Performance'],
            ['settings', '⚙', 'Settings'],
          ];

  return (
    <aside className="sidebar">
      <div className="side-brand">
        <span className="logo-mark">AI</span>

        <div>
          <b>Assignment</b>
          <small>Intelligence Cloud</small>
        </div>
      </div>

      <div className="profile-mini">
        <div className="avatar">
          {user.name?.slice(0, 1)}
        </div>

        <div>
          <b>{user.name}</b>

          <small>
            {user.role === 'admin'
              ? 'Platform administrator'
              : user.role === 'teacher'
                ? 'Faculty reviewer'
                : 'Student learner'}
          </small>
        </div>
      </div>

      <nav>
        {items.map(([id, icon, label]) => (
          <button
            key={id}
            className={
              section === id
                ? 'nav-item active'
                : 'nav-item'
            }
            onClick={() => setSection(id)}
          >
            <span>{icon}</span>
            {label}
          </button>
        ))}
      </nav>

      <div className="side-bottom">
        <div className="cloud-badge">
          <span>☁</span>

          <div>
            <b>Cloud status</b>
            <small>Operational</small>
          </div>

          <i></i>
        </div>

        <button className="nav-item" onClick={logout}>
          <span>↪</span>
          Sign out
        </button>
      </div>
    </aside>
  );
}

/* -------------------------------------------------------------------------- */
/* GENERIC BAR CHART                                                          */
/* -------------------------------------------------------------------------- */

function BarChart({ values }) {
  const max = Math.max(
    ...values.map((v) => Number(v.value) || 0),
    1
  );

  return (
    <div className="bars">
      {values.map((v) => (
        <div className="bar-col" key={v.label}>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{
                height: `${Math.max(
                  8,
                  ((Number(v.value) || 0) / max) * 100
                )}%`,
              }}
            />
          </div>

          <small>{v.label}</small>
          <b>{v.value}</b>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* DATASET HELPERS                                                            */
/* -------------------------------------------------------------------------- */

function DatasetMetricCard({ label, value, description }) {
  return (
    <div className="insight-card">
      <span>{label}</span>
      <strong>{value ?? '—'}</strong>
      <p>{description}</p>
    </div>
  );
}

function DatasetSubjectCard({ title, data }) {
  if (!data) {
    return (
      <section className="panel nested">
        <div className="panel-head">
          <div>
            <span className="section-kicker">
              UCI DATASET
            </span>
            <h3>{title}</h3>
          </div>
        </div>

        <div className="empty">
          Dataset not available.
        </div>
      </section>
    );
  }

  const m = data.metrics;

  return (
    <section className="panel nested">
      <div className="panel-head">
        <div>
          <span className="section-kicker">
            UCI DATASET
          </span>

          <h3>{title}</h3>
        </div>

        <span className="live-pill">
          REAL DATA
        </span>
      </div>

      <div className="analytics-grid">
        <DatasetMetricCard
          label="Records"
          value={m.records}
          description="Actual UCI records"
        />

        <DatasetMetricCard
          label="Average G3"
          value={`${m.average_final_grade} / 20`}
          description="Mean final grade"
        />

        <DatasetMetricCard
          label="Median G3"
          value={`${m.median_final_grade} / 20`}
          description="Median final grade"
        />

        <DatasetMetricCard
          label="Pass rate"
          value={`${m.pass_rate}%`}
          description="G3 ≥ 10"
        />

        <DatasetMetricCard
          label="Fail rate"
          value={`${m.fail_rate}%`}
          description="G3 < 10"
        />

        <DatasetMetricCard
          label="Absences"
          value={m.average_absences}
          description="Average absences"
        />

        <DatasetMetricCard
          label="Study time"
          value={m.average_studytime}
          description="Average study-time category"
        />

        <DatasetMetricCard
          label="Failures"
          value={m.average_failures}
          description="Average past failures"
        />

        <DatasetMetricCard
          label="Average age"
          value={m.average_age}
          description="Average student age"
        />
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* GRADE DISTRIBUTION                                                         */
/* -------------------------------------------------------------------------- */

function GradeDistribution({ title, data }) {
  if (!data) return null;

  const distribution =
    data.metrics?.grade_distribution || {};

  const values = [
    {
      label: '0–4',
      value: distribution['0-4'] || 0,
    },
    {
      label: '5–9',
      value: distribution['5-9'] || 0,
    },
    {
      label: '10–14',
      value: distribution['10-14'] || 0,
    },
    {
      label: '15–20',
      value: distribution['15-20'] || 0,
    },
  ];

  return (
    <section className="panel nested">
      <div className="panel-head">
        <div>
          <span className="section-kicker">
            GRADE DISTRIBUTION
          </span>
          <h3>{title}</h3>
        </div>
      </div>

      <BarChart values={values} />
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* DATASET COMPARISON                                                         */
/* -------------------------------------------------------------------------- */

function DatasetComparison({ performance }) {
  const math =
    performance?.datasets?.math?.metrics;

  const portuguese =
    performance?.datasets?.portuguese?.metrics;

  if (!math && !portuguese) {
    return null;
  }

  const values = [
    {
      label: 'Math G3',
      value: math?.average_final_grade || 0,
    },
    {
      label: 'Portuguese G3',
      value: portuguese?.average_final_grade || 0,
    },
    {
      label: 'Math pass %',
      value: math?.pass_rate || 0,
    },
    {
      label: 'Portuguese pass %',
      value: portuguese?.pass_rate || 0,
    },
  ];

  return (
    <section className="panel nested">
      <div className="panel-head">
        <div>
          <span className="section-kicker">
            DATA COMPARISON
          </span>
          <h3>Mathematics vs Portuguese</h3>
        </div>
      </div>

      <BarChart values={values} />
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* UCI ANALYTICS PANEL                                                        */
/* -------------------------------------------------------------------------- */

function UCIAnalytics({ performance }) {
  const math =
    performance?.datasets?.math;

  const portuguese =
    performance?.datasets?.portuguese;

  if (!performance) {
    return (
      <section className="panel page-panel">
        <div className="panel-head">
          <div>
            <span className="section-kicker">
              REAL-WORLD DATA
            </span>
            <h2>UCI Student Performance Analytics</h2>
          </div>
        </div>

        <div className="empty">
          Loading real UCI dataset analytics...
        </div>
      </section>
    );
  }

  return (
    <div className="uci-analytics">
      <div className="analytics-grid">
        <DatasetMetricCard
          label="Math records"
          value={math?.metrics?.records}
          description="student-mat.csv"
        />

        <DatasetMetricCard
          label="Portuguese records"
          value={portuguese?.metrics?.records}
          description="student-por.csv"
        />

        <DatasetMetricCard
          label="Math average"
          value={
            math
              ? `${math.metrics.average_final_grade} / 20`
              : '—'
          }
          description="Average final G3"
        />

        <DatasetMetricCard
          label="Portuguese average"
          value={
            portuguese
              ? `${portuguese.metrics.average_final_grade} / 20`
              : '—'
          }
          description="Average final G3"
        />

        <DatasetMetricCard
          label="Math pass rate"
          value={
            math
              ? `${math.metrics.pass_rate}%`
              : '—'
          }
          description="Final grade ≥ 10"
        />

        <DatasetMetricCard
          label="Portuguese pass rate"
          value={
            portuguese
              ? `${portuguese.metrics.pass_rate}%`
              : '—'
          }
          description="Final grade ≥ 10"
        />
      </div>

      <div className="dashboard-grid">
        <DatasetSubjectCard
          title="Mathematics Performance"
          data={math}
        />

        <DatasetSubjectCard
          title="Portuguese Performance"
          data={portuguese}
        />
      </div>

      <div className="dashboard-grid">
        <GradeDistribution
          title="Mathematics Grade Distribution"
          data={math}
        />

        <GradeDistribution
          title="Portuguese Grade Distribution"
          data={portuguese}
        />
      </div>

      <div className="dashboard-grid">
        <DatasetComparison
          performance={performance}
        />

        <section className="panel nested">
          <div className="panel-head">
            <div>
              <span className="section-kicker">
                DATA INTERPRETATION
              </span>

              <h3>Dataset dimensions</h3>
            </div>
          </div>

          <div className="analytics-grid">
            <DatasetMetricCard
              label="Math average absences"
              value={
                math?.metrics?.average_absences
              }
              description="Mean absences"
            />

            <DatasetMetricCard
              label="Portuguese average absences"
              value={
                portuguese?.metrics
                  ?.average_absences
              }
              description="Mean absences"
            />

            <DatasetMetricCard
              label="Math study time"
              value={
                math?.metrics?.average_studytime
              }
              description="Mean category"
            />

            <DatasetMetricCard
              label="Portuguese study time"
              value={
                portuguese?.metrics
                  ?.average_studytime
              }
              description="Mean category"
            />

            <DatasetMetricCard
              label="Math failures"
              value={
                math?.metrics?.average_failures
              }
              description="Mean previous failures"
            />

            <DatasetMetricCard
              label="Portuguese failures"
              value={
                portuguese?.metrics
                  ?.average_failures
              }
              description="Mean previous failures"
            />
          </div>
        </section>
      </div>

      <div className="panel dataset-source-note">
        <span className="section-kicker">
          DATA PROVENANCE
        </span>

        <h3>Public UCI research dataset</h3>

        <p>
          These analytics are calculated from the downloaded
          UCI Student Performance CSV files. They represent
          public research data and are not actual college
          records, platform users, or assignment submissions.
        </p>

        <a
          href="https://archive.ics.uci.edu/dataset/320/student%2Bperformance"
          target="_blank"
          rel="noreferrer"
        >
          Open UCI Student Performance dataset →
        </a>
      </div>
    </div>
  );
}


/* -------------------------------------------------------------------------- */
/* UK DfE REAL PUBLIC DATA                                                   */
/* -------------------------------------------------------------------------- */

function DFEAttendanceAnalytics({ data, onAcquire, canAcquire }) {
  if (!data) {
    return (
      <section className="panel page-panel">
        <div className="panel-head">
          <div>
            <span className="section-kicker">REAL PUBLIC DATA</span>
            <h2>UK Department for Education Attendance</h2>
          </div>
        </div>
        <div className="empty">Loading official public attendance data...</div>
      </section>
    );
  }

  const metrics = data.metrics || {};
  const phases = metrics.education_phases || {};

  return (
    <div className="uci-analytics">
      <section className="panel dataset-source-note">
        <div className="panel-head">
          <div>
            <span className="section-kicker">OFFICIAL PUBLIC STATISTICS</span>
            <h2>UK Department for Education — Pupil Attendance</h2>
          </div>
          <span className="live-pill">REAL PUBLIC DATA</span>
        </div>

        <p className="muted">
          {data.available
            ? `Official statistics release: ${data.release}. Data period: ${data.data_period}.`
            : 'The official public dataset has not yet been acquired into local storage.'}
        </p>

        {!data.available && canAcquire && (
          <button className="primary" onClick={onAcquire}>
            Acquire official dataset online
          </button>
        )}

        {data.available && (
          <div className="analytics-grid">
            <DatasetMetricCard
              label="Public records"
              value={data.records}
              description="Local CSV observations"
            />
            <DatasetMetricCard
              label="Average attendance"
              value={`${metrics.attendance_rate_avg}%`}
              description="Across stored observations"
            />
            <DatasetMetricCard
              label="Average absence"
              value={`${metrics.absence_rate_avg}%`}
              description="Across stored observations"
            />
            <DatasetMetricCard
              label="Local authorities"
              value={metrics.local_authorities}
              description="Local-authority observations"
            />
            <DatasetMetricCard
              label="Schools represented"
              value={metrics.schools_total}
              description="Summed source field; not unique institutions"
            />
            <DatasetMetricCard
              label="Enrolments represented"
              value={metrics.enrolments_total}
              description="Summed source field"
            />
          </div>
        )}

        {data.available && (
          <>
            <div className="dashboard-grid">
              <section className="panel nested">
                <div className="panel-head">
                  <div>
                    <span className="section-kicker">EDUCATION PHASE</span>
                    <h3>Source observations</h3>
                  </div>
                </div>
                <div className="analytics-grid">
                  {Object.entries(phases).map(([phase, count]) => (
                    <DatasetMetricCard
                      key={phase}
                      label={phase}
                      value={count}
                      description="Rows in source dataset"
                    />
                  ))}
                </div>
              </section>

              <section className="panel nested">
                <div className="panel-head">
                  <div>
                    <span className="section-kicker">PROVENANCE</span>
                    <h3>Source metadata</h3>
                  </div>
                </div>
                <p><b>Dataset ID:</b> {data.dataset_id}</p>
                <p><b>Published:</b> {data.published}</p>
                <p><b>Data period:</b> {data.data_period}</p>
                <p><b>Acquired:</b> {data.acquired_at || 'Recorded locally'}</p>
                <a href={data.source_url} target="_blank" rel="noreferrer">
                  Open official DfE dataset →
                </a>
              </section>
            </div>

            <div className="panel dataset-source-note">
              <span className="section-kicker">DATA INTEGRITY</span>
              <h3>Public source, not generated demo data</h3>
              <p>
                These records are acquired from the official Department for
                Education open-data release. The application stores the source
                CSV and the actual acquisition timestamp. They are not platform
                users, assignments, submissions, or fabricated student records.
              </p>
              {canAcquire && (
                <button className="ghost" onClick={onAcquire}>
                  Refresh from official source
                </button>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* MAIN DASHBOARD                                                             */
/* -------------------------------------------------------------------------- */

function Dashboard({ user, logout }) {
  const [section, setSection] = useState('overview');

  const [assignments, setAssignments] = useState([]);
  const [subs, setSubs] = useState([]);
  const [courses, setCourses] = useState([]);
  const [dash, setDash] = useState({});

  const [message, setMessage] = useState('');

  const [dataset, setDataset] = useState(null);

  const [datasetPerformance, setDatasetPerformance] =
    useState(null);

  const [dfeAttendance, setDfeAttendance] = useState(null);

  const [selected, setSelected] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  const [uploadAssignment, setUploadAssignment] =
    useState(null);

  const [file, setFile] = useState(null);

  const [grade, setGrade] = useState({
    marks: '',
    feedback: '',
  });

  const [showCreate, setShowCreate] =
    useState(false);

  const [adminData, setAdminData] = useState({
    users: [],
    audit: [],
    batches: [],
    courses: [],
    overview: null,
    ai: null,
  });

  const [enterprise, setEnterprise] =
    useState({
      distribution: null,
      heatmap: null,
    });

  const [systemStatus, setSystemStatus] =
    useState({
      database: 'unknown',
      object_storage: 'unknown',
      ai_engine: 'unknown',
      api: 'unknown',
    });

  const [newAssignment, setNewAssignment] =
    useState({
      title: '',
      description: '',
      deadline: '',
      max_marks: 50,
      course_id: '',
    });

  /* ---------------------------------------------------------------------- */
  /* LOAD DATA                                                              */
  /* ---------------------------------------------------------------------- */

  const load = async () => {
    try {
      if (user.role === 'admin') {
        const [
          ov,
          us,
          logs,
          bs,
          cs,
          aiSet,
          ds,
          perf,
          dfe,
          dist,
          heat,
          st,
        ] = await Promise.all([
          api('/admin/overview'),
          api('/admin/users'),
          api('/admin/audit-logs'),
          api('/admin/batches'),
          api('/admin/courses'),
          api('/admin/ai-settings'),
          api('/analytics/dataset'),
          api('/analytics/dataset/performance'),
          api('/analytics/public/dfe-attendance'),
          api(
            '/enterprise-analytics/similarity-distribution'
          ),
          api(
            '/enterprise-analytics/rubric-heatmap'
          ),
          api('/system/status'),
        ]);

        setAdminData({
          overview: ov,
          users: us,
          audit: logs,
          batches: bs,
          courses: cs,
          ai: aiSet,
        });

        setDataset(ds);
        setDatasetPerformance(perf);
        setDfeAttendance(dfe);

        setEnterprise({
          distribution: dist,
          heatmap: heat,
        });

        setSystemStatus(st);

        return;
      }

      const [
        a,
        d,
        c,
        ds,
        perf,
        dfe,
        st,
      ] = await Promise.all([
        api('/assignments'),
        api('/dashboard/' + user.role),
        api('/courses'),
        api('/analytics/dataset'),
        api('/analytics/dataset/performance'),
        api('/analytics/public/dfe-attendance'),
        api('/system/status'),
      ]);

      setAssignments(a);
      setDash(d);
      setCourses(c);
      setDataset(ds);
      setDatasetPerformance(perf);
      setDfeAttendance(dfe);
      setSystemStatus(st);

      if (user.role === 'student') {
        setSubs(await api('/submissions/mine'));
      }
    } catch (e) {
      setMessage(e.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  /* ---------------------------------------------------------------------- */
  /* TEACHER SUBMISSIONS                                                    */
  /* ---------------------------------------------------------------------- */

  const teacherSubmissions =
    user.role === 'teacher'
      ? subs
      : [];

  const chartValues = useMemo(() => {
    if (user.role === 'admin') {
      return [
        {
          label: 'Users',
          value:
            adminData.overview?.users || 0,
        },
        {
          label: 'Courses',
          value:
            adminData.overview?.courses || 0,
        },
        {
          label: 'Batches',
          value:
            adminData.overview?.batches || 0,
        },
        {
          label: 'Audit',
          value:
            adminData.overview?.audit_events || 0,
        },
      ];
    }

    if (user.role === 'teacher') {
      return [
        {
          label: 'Submitted',
          value: dash.submissions || 0,
        },
        {
          label: 'Pending',
          value: dash.pending || 0,
        },
        {
          label: 'Graded',
          value: dash.graded || 0,
        },
        {
          label: 'Late',
          value: dash.late || 0,
        },
      ];
    }

    return [
      {
        label: 'Submitted',
        value: dash.submitted || 0,
      },
      {
        label: 'Graded',
        value: dash.graded || 0,
      },
      {
        label: 'Late',
        value: dash.late || 0,
      },
      {
        label: 'Avg',
        value: Math.round(
          dash.average_marks || 0
        ),
      },
    ];
  }, [
    dash,
    user.role,
    adminData.overview,
  ]);

  /* ---------------------------------------------------------------------- */
  /* TEACHER SUBMISSION LOADING                                             */
  /* ---------------------------------------------------------------------- */

  async function loadTeacherSubmissions() {
    try {
      const all = [];

      for (const a of assignments) {
        const rows = await api(
          `/submissions/assignment/${a.id}`
        );

        all.push(
          ...rows.map((x) => ({
            ...x,
            assignment_title: a.title,
          }))
        );
      }

      setSubs(all);
    } catch (e) {
      setMessage(e.message);
    }
  }

  useEffect(() => {
    if (
      user.role === 'teacher' &&
      assignments.length
    ) {
      loadTeacherSubmissions();
    }
  }, [assignments.length]);

  /* ---------------------------------------------------------------------- */
  /* UPLOAD                                                                 */
  /* ---------------------------------------------------------------------- */

  async function upload() {
    if (!file || !uploadAssignment) return;

    try {
      const fd = new FormData();

      fd.append('file', file);

      await api(
        `/submissions/assignments/${uploadAssignment.id}/submit`,
        {
          method: 'POST',
          body: fd,
        }
      );

      setMessage(
        'Submission uploaded securely. Document extraction completed.'
      );

      setUploadAssignment(null);
      setFile(null);

      await load();
    } catch (e) {
      setMessage(e.message);
    }
  }

  /* ---------------------------------------------------------------------- */
  /* AI ANALYSIS                                                            */
  /* ---------------------------------------------------------------------- */

  async function analyze(s) {
    try {
      const a = await api(
        `/ai/submissions/${s.id}/analyze`,
        {
          method: 'POST',
        }
      );

      setAnalysis(a);
      setSelected(s);

      setGrade({
        marks: a.suggested_marks,
        feedback: a.feedback,
      });

      setSection('review');
    } catch (e) {
      setMessage(e.message);
    }
  }

  /* ---------------------------------------------------------------------- */
  /* GRADING                                                                */
  /* ---------------------------------------------------------------------- */

  async function saveGrade() {
    try {
      await api(
        `/grading/submissions/${selected.id}`,
        {
          method: 'POST',
          body: JSON.stringify({
            marks: Number(grade.marks),
            feedback: grade.feedback,
          }),
        }
      );

      setMessage('Final teacher grade saved.');

      setAnalysis(null);
      setSelected(null);

      await load();

      if (user.role === 'teacher') {
        await loadTeacherSubmissions();
      }
    } catch (e) {
      setMessage(e.message);
    }
  }

  async function acquireDfeAttendance() {
    try {
      await api('/analytics/public/dfe-attendance/acquire', {
        method: 'POST',
      });
      setMessage('Official DfE attendance dataset acquired from the public source.');
      const refreshed = await api('/analytics/public/dfe-attendance');
      setDfeAttendance(refreshed);
    } catch (e) {
      setMessage(e.message);
    }
  }

  /* ---------------------------------------------------------------------- */
  /* REPORTS                                                                */
  /* ---------------------------------------------------------------------- */

  async function downloadReport(
    path,
    filename
  ) {
    const token =
      localStorage.getItem('token');

    const r = await fetch(API + path, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!r.ok) {
      throw new Error(
        'Report download failed'
      );
    }

    const blob = await r.blob();

    const url =
      URL.createObjectURL(blob);

    const a =
      document.createElement('a');

    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
  }

  /* ---------------------------------------------------------------------- */
  /* CREATE ASSIGNMENT                                                      */
  /* ---------------------------------------------------------------------- */

  async function createAssignment(e) {
    e.preventDefault();

    try {
      const payload = {
        ...newAssignment,
        max_marks: Number(
          newAssignment.max_marks
        ),
        deadline: new Date(
          newAssignment.deadline
        ).toISOString(),
        rubric:
          'Technical accuracy: 40%; Cloud architecture: 25%; Security: 20%; Clarity and completeness: 15%',
        allowed_extensions:
          'pdf,txt,docx',
      };

      await api('/assignments', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setShowCreate(false);

      setNewAssignment({
        title: '',
        description: '',
        deadline: '',
        max_marks: 50,
        course_id:
          courses[0]?.id || '',
      });

      setMessage(
        'Assignment created successfully.'
      );

      await load();
    } catch (e) {
      setMessage(e.message);
    }
  }

  /* ---------------------------------------------------------------------- */
  /* UI                                                                     */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="app-shell">
      <Sidebar
        user={user}
        section={section}
        setSection={setSection}
        logout={logout}
      />

      <main className="main-content">
        <header className="topbar">
          <div className="mobile-brand">
            <span className="logo-mark">
              AI
            </span>
            <b>Assignment Intelligence</b>
          </div>

          <div className="top-actions">
            <button className="icon-btn">
              ⌕
            </button>

            <button className="icon-btn">
              ◔
            </button>

            <div className="top-user">
              <div className="avatar small">
                {user.name?.slice(0, 1)}
              </div>

              <div>
                <b>{user.name}</b>
                <small>{user.role}</small>
              </div>
            </div>
          </div>
        </header>

        <div className="content-wrap">
          {message && (
            <div className="notice">
              <span>✓</span>
              {message}

              <button
                onClick={() =>
                  setMessage('')
                }
              >
                ×
              </button>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* HERO                                                             */}
          {/* ---------------------------------------------------------------- */}

          <section className="hero-dashboard">
            <div>
              <span className="eyebrow">
                {user.role === 'teacher'
                  ? 'FACULTY WORKSPACE'
                  : user.role === 'admin'
                    ? 'ADMIN WORKSPACE'
                    : 'STUDENT WORKSPACE'}{' '}
                • CLOUD + AI
              </span>

              <h1>
                Good morning,{' '}
                {user.name?.split(' ')[0]}{' '}
                <span>✦</span>
              </h1>

              <p>
                {user.role === 'admin'
                  ? 'Govern users, academic structure, AI thresholds, audit events and platform health from one control plane.'
                  : user.role === 'teacher'
                    ? 'Review submissions, use AI-assisted analysis, and keep every academic workflow in one place.'
                    : 'Stay on top of assignments, deadlines, submissions and personalized feedback.'}
              </p>

              <div className="hero-actions">
                <button
                  className="primary"
                  onClick={() =>
                    setSection(
                      user.role === 'teacher'
                        ? 'review'
                        : 'assignments'
                    )
                  }
                >
                  {user.role === 'teacher'
                    ? 'Open AI review queue →'
                    : 'View assignments →'}
                </button>

                <span className="secure-note">
                  ● Secure cloud workspace
                </span>
              </div>
            </div>

            <div
              className="hero-image"
              style={{
                backgroundImage: `url(${HERO}), url(/reference-dashboard-visual.png)`,
              }}
            >
              <div className="hero-image-overlay">
                <span>LIVE</span>
                <b>Cloud analytics</b>
                <small>
                  Real-time workspace insights
                </small>
              </div>
            </div>
          </section>

          {/* ---------------------------------------------------------------- */}
          {/* OVERVIEW                                                         */}
          {/* ---------------------------------------------------------------- */}

          {section === 'overview' && (
            <>
              <div className="kpi-grid">
                {(user.role === 'teacher'
                  ? [
                      [
                        'Total Assignments',
                        dash.assignments || 0,
                        '▣',
                      ],
                      [
                        'Total Submissions',
                        dash.submissions || 0,
                        '↥',
                      ],
                      [
                        'Pending Reviews',
                        dash.pending || 0,
                        '◷',
                      ],
                      [
                        'Graded',
                        dash.graded || 0,
                        '✓',
                      ],
                    ]
                  : [
                      [
                        'Total Assignments',
                        dash.total_assignments ||
                          0,
                        '▣',
                      ],
                      [
                        'Submitted',
                        dash.submitted || 0,
                        '↥',
                      ],
                      [
                        'Graded',
                        dash.graded || 0,
                        '✓',
                      ],
                      [
                        'Average Score',
                        `${dash.average_marks || 0}%`,
                        '◒',
                      ],
                    ]
                ).map(
                  ([label, value, icon]) => (
                    <div
                      className="kpi"
                      key={label}
                    >
                      <div className="kpi-icon">
                        {icon}
                      </div>

                      <div>
                        <small>{label}</small>
                        <strong>{value}</strong>
                        <span className="trend">
                          ● Live data
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>

              <div className="dashboard-grid">
                <section className="panel large">
                  <div className="panel-head">
                    <div>
                      <span className="section-kicker">
                        WORKFLOW
                      </span>

                      <h2>
                        {user.role === 'admin'
                          ? 'Platform control pipeline'
                          : 'Application pipeline'}
                      </h2>
                    </div>

                    <button
                      className="ghost"
                      onClick={() =>
                        setSection(
                          user.role === 'teacher'
                            ? 'assignments'
                            : 'submissions'
                        )
                      }
                    >
                      View all
                    </button>
                  </div>

                  <div className="pipeline">
                    {assignments
                      .slice(0, 3)
                      .map((a) => (
                        <div
                          className="pipeline-card"
                          key={a.id}
                        >
                          <div className="pipeline-top">
                            <span className="course-tag">
                              CC-501
                            </span>

                            <button className="dots">
                              •••
                            </button>
                          </div>

                          <h3>{a.title}</h3>

                          <p>
                            {a.description.slice(
                              0,
                              100
                            )}
                            …
                          </p>

                          <div className="progress-line">
                            <span
                              style={{
                                width: `${
                                  user.role ===
                                  'teacher'
                                    ? 70
                                    : 55
                                }%`,
                              }}
                            />
                          </div>

                          <small>
                            {new Date(
                              a.deadline
                            ).toLocaleDateString()}{' '}
                            · {a.max_marks} marks
                          </small>
                        </div>
                      ))}
                  </div>
                </section>

                <section className="panel chart-panel">
                  <div className="panel-head">
                    <div>
                      <span className="section-kicker">
                        OPERATIONS
                      </span>

                      <h2>
                        Workflow health
                      </h2>
                    </div>

                    <span className="live-pill">
                      LIVE
                    </span>
                  </div>

                  <BarChart
                    values={chartValues}
                  />
                </section>
              </div>

              <div className="dashboard-grid lower">
                <section className="panel">
                  <div className="panel-head">
                    <div>
                      <span className="section-kicker">
                        ACTIVITY
                      </span>

                      <h2>
                        Recent activity
                      </h2>
                    </div>
                  </div>

                  <div className="activity">
                    <div>
                      <span className="activity-icon green">
                        ✓
                      </span>

                      <p>
                        <b>
                          Cloud database
                        </b>

                        <small>
                          Database:{' '}
                          {
                            systemStatus.database
                          }
                        </small>
                      </p>

                      <time>Now</time>
                    </div>

                    <div>
                      <span className="activity-icon blue">
                        AI
                      </span>

                      <p>
                        <b>AI engine</b>

                        <small>
                          AI engine:{' '}
                          {
                            systemStatus.ai_engine
                          }
                        </small>
                      </p>

                      <time>Live</time>
                    </div>

                    <div>
                      <span className="activity-icon orange">
                        ↥
                      </span>

                      <p>
                        <b>
                          Object storage
                        </b>

                        <small>
                          Object storage:{' '}
                          {
                            systemStatus.object_storage
                          }
                        </small>
                      </p>

                      <time>Live</time>
                    </div>
                  </div>
                </section>

                {/* REAL DATA DASHBOARD CARD */}

                <section className="panel dataset-panel">
                  <div className="panel-head">
                    <div>
                      <span className="section-kicker">
                        REAL-WORLD DATA
                      </span>

                      <h2>
                        UCI Student Performance
                      </h2>
                    </div>

                    <span className="live-pill">
                      REAL DATA
                    </span>
                  </div>

                  <p className="muted">
                    Public UCI research data
                    calculated directly from the
                    downloaded CSV files.
                  </p>

                  <div className="analytics-grid">
                    <DatasetMetricCard
                      label="Mathematics"
                      value={
                        datasetPerformance
                          ?.datasets?.math
                          ?.metrics?.records
                      }
                      description="Student records"
                    />

                    <DatasetMetricCard
                      label="Portuguese"
                      value={
                        datasetPerformance
                          ?.datasets?.portuguese
                          ?.metrics?.records
                      }
                      description="Student records"
                    />

                    <DatasetMetricCard
                      label="Math average G3"
                      value={
                        datasetPerformance
                          ?.datasets?.math
                          ?.metrics
                          ?.average_final_grade
                          ? `${datasetPerformance.datasets.math.metrics.average_final_grade} / 20`
                          : '—'
                      }
                      description="Final grade"
                    />

                    <DatasetMetricCard
                      label="Portuguese average G3"
                      value={
                        datasetPerformance
                          ?.datasets?.portuguese
                          ?.metrics
                          ?.average_final_grade
                          ? `${datasetPerformance.datasets.portuguese.metrics.average_final_grade} / 20`
                          : '—'
                      }
                      description="Final grade"
                    />
                  </div>

                  <button
                    className="ghost"
                    onClick={() =>
                      setSection('analytics')
                    }
                  >
                    Open full dataset analytics →
                  </button>
                </section>
              </div>
            </>
          )}


          {/* RECENT OFFICIAL PUBLIC DATA */}

          {section === 'overview' && dfeAttendance && (
            <section className="panel dataset-panel">
              <div className="panel-head">
                <div>
                  <span className="section-kicker">OFFICIAL PUBLIC DATA</span>
                  <h2>UK DfE Pupil Attendance</h2>
                </div>
                <span className="live-pill">PUBLIC DATA</span>
              </div>

              <p className="muted">
                {dfeAttendance.available
                  ? `${dfeAttendance.release} • ${dfeAttendance.records} local observations`
                  : 'Official public attendance dataset not acquired yet.'}
              </p>

              {dfeAttendance.available ? (
                <div className="analytics-grid">
                  <DatasetMetricCard
                    label="Records"
                    value={dfeAttendance.records}
                    description="Official weekly observations"
                  />
                  <DatasetMetricCard
                    label="Attendance"
                    value={`${dfeAttendance.metrics?.attendance_rate_avg ?? 0}%`}
                    description="Average source attendance rate"
                  />
                  <DatasetMetricCard
                    label="Absence"
                    value={`${dfeAttendance.metrics?.absence_rate_avg ?? 0}%`}
                    description="Average source absence rate"
                  />
                </div>
              ) : user.role === 'admin' ? (
                <button className="primary" onClick={acquireDfeAttendance}>
                  Acquire real public data
                </button>
              ) : null}
            </section>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* ADMIN USERS                                                      */}
          {/* ---------------------------------------------------------------- */}

          {user.role === 'admin' &&
            section === 'users' && (
              <section className="panel page-panel">
                <div className="panel-head">
                  <div>
                    <span className="section-kicker">
                      GOVERNANCE
                    </span>

                    <h2>
                      User governance
                    </h2>
                  </div>
                </div>

                {adminData.users.map(
                  (u) => (
                    <div
                      className="submission-row"
                      key={u.id}
                    >
                      <div>
                        <h3>{u.name}</h3>

                        <small>
                          {u.email} · {u.role}
                        </small>
                      </div>

                      <span
                        className={`status ${
                          u.active
                            ? 'graded'
                            : 'late'
                        }`}
                      >
                        {u.active
                          ? 'ACTIVE'
                          : 'DEACTIVATED'}
                      </span>

                      <select
                        value={u.role}
                        onChange={async (e) => {
                          await api(
                            `/admin/users/${u.id}`,
                            {
                              method: 'PATCH',
                              body: JSON.stringify(
                                {
                                  role: e
                                    .target
                                    .value,
                                }
                              ),
                            }
                          );

                          setMessage(
                            'Role updated and audit event recorded.'
                          );

                          await load();
                        }}
                      >
                        <option value="student">
                          student
                        </option>

                        <option value="teacher">
                          teacher
                        </option>

                        <option value="admin">
                          admin
                        </option>
                      </select>

                      <button
                        className="ghost"
                        onClick={async () => {
                          await api(
                            `/admin/users/${u.id}`,
                            {
                              method: 'PATCH',
                              body: JSON.stringify(
                                {
                                  active:
                                    !u.active,
                                }
                              ),
                            }
                          );

                          setMessage(
                            'Account status updated.'
                          );

                          await load();
                        }}
                      >
                        {u.active
                          ? 'Deactivate'
                          : 'Activate'}
                      </button>
                    </div>
                  )
                )}
              </section>
            )}

          {/* ---------------------------------------------------------------- */}
          {/* ADMIN COURSES                                                    */}
          {/* ---------------------------------------------------------------- */}

          {user.role === 'admin' &&
            section === 'courses' && (
              <section className="panel page-panel">
                <div className="panel-head">
                  <div>
                    <span className="section-kicker">
                      ACADEMIC STRUCTURE
                    </span>

                    <h2>
                      Courses & batches
                    </h2>
                  </div>
                </div>

                <div className="analytics-grid">
                  <div className="insight-card">
                    <span>Batches</span>

                    <strong>
                      {
                        adminData.batches
                          .length
                      }
                    </strong>

                    <p>
                      {adminData.batches
                        .map(
                          (b) => b.name
                        )
                        .join(' · ') ||
                        'No batches yet'}
                    </p>
                  </div>

                  <div className="insight-card">
                    <span>Courses</span>

                    <strong>
                      {
                        adminData.courses
                          .length
                      }
                    </strong>

                    <p>
                      {adminData.courses
                        .map(
                          (c) => c.code
                        )
                        .join(' · ') ||
                        'No courses yet'}
                    </p>
                  </div>

                  <div className="insight-card">
                    <span>
                      Course control
                    </span>

                    <strong>
                      Centralized
                    </strong>

                    <p>
                      Administrators can
                      assign courses to
                      teachers and batches.
                    </p>
                  </div>
                </div>

                <div className="form-grid">
                  <input
                    id="batchName"
                    placeholder="Batch name"
                  />

                  <input
                    id="batchSem"
                    placeholder="Semester"
                  />

                  <input
                    id="batchDept"
                    placeholder="Department"
                  />

                  <input
                    id="batchYear"
                    placeholder="Academic year"
                  />

                  <button
                    className="primary"
                    onClick={async () => {
                      const name =
                        document.getElementById(
                          'batchName'
                        ).value;

                      const semester =
                        document.getElementById(
                          'batchSem'
                        ).value;

                      const department =
                        document.getElementById(
                          'batchDept'
                        ).value;

                      const academic_year =
                        document.getElementById(
                          'batchYear'
                        ).value;

                      await api(
                        '/admin/batches',
                        {
                          method: 'POST',
                          body: JSON.stringify(
                            {
                              name,
                              semester,
                              department,
                              academic_year,
                            }
                          ),
                        }
                      );

                      setMessage(
                        'Batch created.'
                      );

                      await load();
                    }}
                  >
                    + Create batch
                  </button>
                </div>

                <div className="form-grid">
                  <input
                    id="courseName"
                    placeholder="Course name"
                  />

                  <input
                    id="courseCode"
                    placeholder="Course code"
                  />

                  <input
                    id="courseTeacher"
                    type="number"
                    placeholder="Teacher user ID"
                  />

                  <input
                    id="courseBatch"
                    type="number"
                    placeholder="Batch ID"
                  />

                  <button
                    className="primary"
                    onClick={async () => {
                      const name =
                        document.getElementById(
                          'courseName'
                        ).value;

                      const code =
                        document.getElementById(
                          'courseCode'
                        ).value;

                      const teacher_id =
                        Number(
                          document.getElementById(
                            'courseTeacher'
                          ).value
                        );

                      const batch_id =
                        Number(
                          document.getElementById(
                            'courseBatch'
                          ).value
                        ) || null;

                      await api(
                        '/admin/courses',
                        {
                          method: 'POST',
                          body: JSON.stringify(
                            {
                              name,
                              code,
                              teacher_id,
                              batch_id,
                            }
                          ),
                        }
                      );

                      setMessage(
                        'Course created and audit logged.'
                      );

                      await load();
                    }}
                  >
                    + Create course
                  </button>
                </div>
              </section>
            )}

          {/* ---------------------------------------------------------------- */}
          {/* AUDIT                                                            */}
          {/* ---------------------------------------------------------------- */}

          {user.role === 'admin' &&
            section === 'audit' && (
              <section className="panel page-panel">
                <div className="panel-head">
                  <div>
                    <span className="section-kicker">
                      SECURITY TRAIL
                    </span>

                    <h2>Audit logs</h2>
                  </div>
                </div>

                {adminData.audit.map(
                  (x) => (
                    <div
                      className="activity"
                      key={x.id}
                    >
                      <div>
                        <span
                          className={`activity-icon ${
                            x.severity ===
                            'WARNING'
                              ? 'orange'
                              : 'blue'
                          }`}
                        >
                          {x.severity ===
                          'WARNING'
                            ? '!'
                            : '◷'}
                        </span>

                        <p>
                          <b>
                            {x.action}
                          </b>

                          <small>
                            {x.resource_type} #
                            {x.resource_id ||
                              '-'}{' '}
                            · actor{' '}
                            {x.actor_user_id ||
                              'system'}
                          </small>
                        </p>

                        <time>
                          {new Date(
                            x.created_at
                          ).toLocaleString()}
                        </time>
                      </div>
                    </div>
                  )
                )}
              </section>
            )}

          {/* ---------------------------------------------------------------- */}
          {/* ASSIGNMENTS                                                      */}
          {/* ---------------------------------------------------------------- */}

          {section === 'assignments' && (
            <section className="panel page-panel">
              <div className="panel-head">
                <div>
                  <span className="section-kicker">
                    ACADEMIC WORKFLOW
                  </span>

                  <h2>
                    {user.role === 'teacher'
                      ? 'Assignments'
                      : 'Available assignments'}
                  </h2>
                </div>

                {user.role ===
                  'teacher' && (
                  <button
                    className="primary"
                    onClick={() => {
                      setShowCreate(true);

                      setNewAssignment({
                        ...newAssignment,
                        course_id:
                          courses[0]?.id ||
                          '',
                      });
                    }}
                  >
                    + Create assignment
                  </button>
                )}
              </div>

              {assignments.map((a) => (
                <div
                  className="assignment-row"
                  key={a.id}
                >
                  <div className="assignment-main">
                    <div className="course-tag">
                      CC-501
                    </div>

                    <div>
                      <h3>{a.title}</h3>

                      <p>
                        {a.description}
                      </p>

                      <small>
                        Deadline{' '}
                        {new Date(
                          a.deadline
                        ).toLocaleString()}{' '}
                        · Maximum{' '}
                        {a.max_marks} marks
                      </small>
                    </div>
                  </div>

                  {user.role ===
                  'student' ? (
                    <button
                      className="primary"
                      onClick={() =>
                        setUploadAssignment(
                          a
                        )
                      }
                    >
                      Submit work
                    </button>
                  ) : (
                    <>
                      <button
                        className="ghost"
                        onClick={async () => {
                          const rows =
                            await api(
                              `/submissions/assignment/${a.id}`
                            );

                          setSubs(
                            rows.map((x) => ({
                              ...x,
                              assignment_title:
                                a.title,
                            }))
                          );

                          setSection(
                            'review'
                          );
                        }}
                      >
                        Review submissions
                      </button>

                      <button
                        className="ghost"
                        onClick={async () => {
                          const p =
                            await api(
                              `/resubmission/${a.id}`
                            );

                          const max =
                            window.prompt(
                              'Maximum resubmissions',
                              p.max_resubmissions
                            );

                          if (
                            max !== null
                          ) {
                            const ext =
                              window.prompt(
                                'Optional extension deadline (ISO, e.g. 2026-10-05T23:59:00) or leave blank',
                                ''
                              );

                            await api(
                              `/resubmission/${a.id}`,
                              {
                                method:
                                  'PUT',
                                body: JSON.stringify(
                                  {
                                    max_resubmissions:
                                      Number(
                                        max
                                      ),
                                    allow_resubmissions:
                                      true,
                                    allow_late:
                                      true,
                                    extension_deadline:
                                      ext ||
                                      null,
                                  }
                                ),
                              }
                            );

                            setMessage(
                              'Resubmission policy updated and audited.'
                            );
                          }
                        }}
                      >
                        Resubmission policy
                      </button>
                    </>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* SUBMISSIONS                                                       */}
          {/* ---------------------------------------------------------------- */}

          {section === 'submissions' && (
            <section className="panel page-panel">
              <div className="panel-head">
                <div>
                  <span className="section-kicker">
                    MY WORK
                  </span>

                  <h2>
                    Submission history
                  </h2>
                </div>
              </div>

              {subs.map((s) => (
                <div
                  className="submission-row"
                  key={s.id}
                >
                  <div>
                    <span
                      className={`status ${s.status.toLowerCase()}`}
                    >
                      {s.status}
                    </span>

                    <h3>{s.file_name}</h3>

                    <small>
                      Submitted{' '}
                      {new Date(
                        s.submitted_at
                      ).toLocaleString()}
                    </small>
                  </div>

                  <div className="submission-score">
                    {s.marks == null
                      ? 'Pending'
                      : `${s.marks} marks`}
                  </div>

                  <button
                    className="ghost"
                    onClick={() =>
                      setSelected(s)
                    }
                  >
                    Details
                  </button>
                </div>
              ))}
            </section>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* AI REVIEW                                                        */}
          {/* ---------------------------------------------------------------- */}

          {section === 'review' && (
            <section className="panel page-panel">
              <div className="panel-head">
                <div>
                  <span className="section-kicker">
                    HUMAN-IN-THE-LOOP AI
                  </span>

                  <h2>
                    AI review queue
                  </h2>
                </div>

                <span className="live-pill">
                  {
                    subs.filter(
                      (s) =>
                        s.status !==
                        'GRADED'
                    ).length
                  }{' '}
                  PENDING
                </span>
              </div>

              {teacherSubmissions
                .filter(
                  (s) =>
                    s.status !==
                    'GRADED'
                )
                .map((s) => (
                  <div
                    className="submission-row"
                    key={s.id}
                  >
                    <div>
                      <span className="status submitted">
                        {s.status}
                      </span>

                      <h3>
                        {s.file_name}
                      </h3>

                      <small>
                        {s.assignment_title ||
                          'Assignment'}{' '}
                        · Student #
                        {s.student_id}
                      </small>
                    </div>

                    <button
                      className="primary"
                      onClick={() =>
                        analyze(s)
                      }
                    >
                      Run AI analysis
                    </button>
                  </div>
                ))}

              {!teacherSubmissions.length && (
                <div className="empty">
                  No submissions loaded yet.
                  Open an assignment to
                  review its submissions.
                </div>
              )}

              {analysis && selected && (
                <div className="review-drawer">
                  <div className="review-head">
                    <div>
                      <span className="section-kicker">
                        AI ANALYSIS RESULT
                      </span>

                      <h2>
                        {selected.file_name}
                      </h2>
                    </div>

                    <button
                      className="ghost"
                      onClick={() =>
                        setAnalysis(
                          null
                        )
                      }
                    >
                      Close
                    </button>
                  </div>

                  <div className="ai-score-grid">
                    <div>
                      <small>
                        Suggested marks
                      </small>

                      <strong>
                        {
                          analysis.suggested_marks
                        }
                      </strong>
                    </div>

                    <div>
                      <small>
                        Similarity
                      </small>

                      <strong>
                        {
                          analysis.similarity_score
                        }
                        %
                      </strong>
                    </div>

                    <div>
                      <small>
                        Relevance
                      </small>

                      <strong>
                        {
                          analysis.keyword_score
                        }
                        %
                      </strong>
                    </div>

                    <div>
                      <small>
                        Words
                      </small>

                      <strong>
                        {
                          analysis.word_count
                        }
                      </strong>
                    </div>
                  </div>

                  <div className="feedback-box">
                    <span>
                      AI-generated feedback
                      draft
                    </span>

                    <p>
                      {analysis.feedback}
                    </p>
                  </div>

                  <div className="grade-form">
                    <input
                      type="number"
                      min="0"
                      placeholder="Final marks"
                      value={
                        grade.marks
                      }
                      onChange={(e) =>
                        setGrade({
                          ...grade,
                          marks:
                            e.target
                              .value,
                        })
                      }
                    />

                    <textarea
                      placeholder="Teacher feedback"
                      value={
                        grade.feedback
                      }
                      onChange={(e) =>
                        setGrade({
                          ...grade,
                          feedback:
                            e.target
                              .value,
                        })
                      }
                    />

                    <button
                      className="primary"
                      onClick={
                        saveGrade
                      }
                    >
                      Approve & publish
                      final grade
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* ANALYTICS                                                        */}
          {/* ---------------------------------------------------------------- */}

          {section === 'analytics' && (
            <section className="panel page-panel">
              <div className="panel-head">
                <div>
                  <span className="section-kicker">
                    INTELLIGENCE + GOVERNANCE
                  </span>

                  <h2>
                    {user.role === 'admin'
                      ? 'Enterprise analytics'
                      : user.role === 'teacher'
                        ? 'Academic analytics'
                        : 'My performance'}
                  </h2>
                </div>

                {user.role !==
                  'student' && (
                  <div>
                    <button
                      className="ghost"
                      onClick={() =>
                        downloadReport(
                          '/reports/submissions.csv',
                          'assignment_report.csv'
                        ).catch((e) =>
                          setMessage(
                            e.message
                          )
                        )
                      }
                    >
                      Export CSV
                    </button>

                    <button
                      className="ghost"
                      onClick={() =>
                        downloadReport(
                          '/reports/submissions.pdf',
                          'assignment_report.pdf'
                        ).catch((e) =>
                          setMessage(
                            e.message
                          )
                        )
                      }
                    >
                      Export PDF
                    </button>

                    {user.role ===
                      'admin' && (
                      <>
                        <button
                          className="ghost"
                          onClick={async () => {
                            const r =
                              await api(
                                '/analytics/dataset/metadata'
                              );

                            setMessage(
                              `${r.files.length} dataset file(s) indexed.`
                            );
                          }}
                        >
                          Inspect dataset
                        </button>

                        <button
                          className="primary"
                          onClick={async () => {
                            await api(
                              '/analytics/dataset/acquire',
                              {
                                method:
                                  'POST',
                              }
                            );

                            setMessage(
                              'Dataset acquisition completed.'
                            );

                            await load();
                          }}
                        >
                          Acquire UCI data
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* EXISTING PLATFORM ANALYTICS */}

              <div className="analytics-grid">
                <div className="insight-card">
                  <span>Dataset</span>

                  <strong>
                    UCI Student Performance
                  </strong>

                  <p>
                    {dataset?.records ??
                      649}{' '}
                    public records.{' '}
                    {dataset?.available
                      ? 'Acquired locally.'
                      : 'Run the included downloader to ingest it.'}
                  </p>
                </div>

                <div className="insight-card">
                  <span>AI model</span>

                  <strong>
                    TF-IDF + rubric engine
                  </strong>

                  <p>
                    Deterministic,
                    reproducible and usable
                    without a paid LLM key.
                  </p>
                </div>

                <div className="insight-card">
                  <span>Similarity</span>

                  <strong>
                    {enterprise.distribution
                      ? `${enterprise.distribution.bands.high_over_30} high-risk flags`
                      : 'Cosine similarity'}
                  </strong>

                  <p>
                    Threshold-based screening
                    for human review.
                  </p>
                </div>

                <div className="insight-card">
                  <span>Governance</span>

                  <strong>
                    Human approval
                  </strong>

                  <p>
                    AI suggestions never
                    silently become final grades.
                  </p>
                </div>
              </div>

              {/* REAL UCI ANALYTICS */}

              <UCIAnalytics
                performance={
                  datasetPerformance
                }
              />

              <DFEAttendanceAnalytics
                data={dfeAttendance}
                onAcquire={acquireDfeAttendance}
                canAcquire={user.role === 'admin'}
              />

              {/* PLATFORM AI ANALYTICS */}

              {user.role !==
                'student' && (
                <div className="dashboard-grid">
                  <section className="panel nested">
                    <div className="panel-head">
                      <h3>
                        Similarity distribution
                      </h3>
                    </div>

                    <div className="analytics-grid">
                      <div className="insight-card">
                        <span>
                          &lt;15%
                        </span>

                        <strong>
                          {enterprise
                            .distribution
                            ?.bands
                            ?.low_under_15 ??
                            0}
                        </strong>

                        <p>
                          Low similarity
                        </p>
                      </div>

                      <div className="insight-card">
                        <span>
                          15–30%
                        </span>

                        <strong>
                          {enterprise
                            .distribution
                            ?.bands
                            ?.review_15_30 ??
                            0}
                        </strong>

                        <p>
                          Review band
                        </p>
                      </div>

                      <div className="insight-card">
                        <span>
                          &gt;30%
                        </span>

                        <strong>
                          {enterprise
                            .distribution
                            ?.bands
                            ?.high_over_30 ??
                            0}
                        </strong>

                        <p>
                          Flag band
                        </p>
                      </div>
                    </div>
                  </section>

                  <section className="panel nested">
                    <div className="panel-head">
                      <h3>
                        Rubric alignment
                        heatmap
                      </h3>
                    </div>

                    {(
                      enterprise.heatmap
                        ?.criteria ||
                      []
                    ).map((c) => (
                      <div
                        className="rubric-line"
                        key={
                          c.criterion
                        }
                      >
                        <span>
                          {c.criterion}
                        </span>

                        <div className="progress-line">
                          <span
                            style={{
                              width: `${
                                c.max
                                  ? Math.min(
                                      100,
                                      (c.score /
                                        c.max) *
                                        100
                                    )
                                  : 0
                              }%`,
                            }}
                          />
                        </div>

                        <b>
                          {c.score}/
                          {c.max}
                        </b>
                      </div>
                    ))}
                  </section>
                </div>
              )}
            </section>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* SETTINGS                                                         */}
          {/* ---------------------------------------------------------------- */}

          {section === 'settings' && (
            <section className="panel page-panel">
              <span className="section-kicker">
                SYSTEM + AI GOVERNANCE
              </span>

              <h2>
                {user.role === 'admin'
                  ? 'AI parameter control'
                  : 'Workspace settings'}
              </h2>

              <p className="muted">
                Role: {user.role}.
                Authentication uses JWT +
                backend RBAC. AI outputs remain
                reviewable and auditable.
              </p>

              <div className="settings-list">
                <div>
                  <b>API</b>
                  <span>{API}</span>
                </div>

                <div>
                  <b>AI</b>
                  <span>
                    Local deterministic TF-IDF +
                    rubric engine
                  </span>
                </div>

                <div>
                  <b>Storage</b>
                  <span>
                    Private object-storage adapter
                  </span>
                </div>
              </div>

              {user.role === 'admin' && (
                <div className="form-grid">
                  <label>
                    Similarity warning %
                    <input
                      id="simThreshold"
                      type="number"
                      defaultValue={
                        adminData.ai
                          ?.similarity_warning_threshold ||
                        30
                      }
                    />
                  </label>

                  <label>
                    Minimum relevance %
                    <input
                      id="relThreshold"
                      type="number"
                      defaultValue={
                        adminData.ai
                          ?.relevance_minimum ||
                        50
                      }
                    />
                  </label>

                  <button
                    className="primary"
                    onClick={async () => {
                      await api(
                        '/admin/ai-settings',
                        {
                          method: 'PUT',
                          body: JSON.stringify(
                            {
                              similarity_warning_threshold:
                                Number(
                                  document.getElementById(
                                    'simThreshold'
                                  ).value
                                ),

                              relevance_minimum:
                                Number(
                                  document.getElementById(
                                    'relThreshold'
                                  ).value
                                ),
                            }
                          ),
                        }
                      );

                      setMessage(
                        'AI thresholds updated and audited.'
                      );

                      await load();
                    }}
                  >
                    Save AI policy
                  </button>
                </div>
              )}
            </section>
          )}
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* UPLOAD MODAL                                                       */}
        {/* ------------------------------------------------------------------ */}

        {uploadAssignment && (
          <div className="modal-backdrop">
            <div className="modal">
              <button
                className="modal-close"
                onClick={() =>
                  setUploadAssignment(
                    null
                  )
                }
              >
                ×
              </button>

              <span className="section-kicker">
                SUBMISSION
              </span>

              <h2>
                {uploadAssignment.title}
              </h2>

              <p>
                {uploadAssignment.description}
              </p>

              <label className="dropzone">
                <input
                  type="file"
                  accept=".pdf,.txt,.docx"
                  onChange={(e) =>
                    setFile(
                      e.target.files[0]
                    )
                  }
                />

                <span>↥</span>

                <b>
                  {file
                    ? file.name
                    : 'Choose PDF, DOCX or TXT'}
                </b>

                <small>
                  Maximum file size is
                  configured by the backend
                </small>
              </label>

              <button
                className="primary wide"
                onClick={upload}
              >
                Upload securely
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* CREATE ASSIGNMENT MODAL                                            */}
        {/* ------------------------------------------------------------------ */}

        {showCreate && (
          <div className="modal-backdrop">
            <div className="modal">
              <button
                className="modal-close"
                onClick={() =>
                  setShowCreate(false)
                }
              >
                ×
              </button>

              <span className="section-kicker">
                NEW WORKFLOW
              </span>

              <h2>
                Create assignment
              </h2>

              <form
                className="form-stack"
                onSubmit={createAssignment}
              >
                <input
                  placeholder="Assignment title"
                  required
                  value={
                    newAssignment.title
                  }
                  onChange={(e) =>
                    setNewAssignment({
                      ...newAssignment,
                      title:
                        e.target.value,
                    })
                  }
                />

                <textarea
                  placeholder="Description"
                  required
                  value={
                    newAssignment.description
                  }
                  onChange={(e) =>
                    setNewAssignment({
                      ...newAssignment,
                      description:
                        e.target.value,
                    })
                  }
                />

                <select
                  value={
                    newAssignment.course_id
                  }
                  onChange={(e) =>
                    setNewAssignment({
                      ...newAssignment,
                      course_id:
                        Number(
                          e.target.value
                        ),
                    })
                  }
                >
                  {courses.map((c) => (
                    <option
                      key={c.id}
                      value={c.id}
                    >
                      {c.code} · {c.name}
                    </option>
                  ))}
                </select>

                <input
                  type="datetime-local"
                  required
                  value={
                    newAssignment.deadline
                  }
                  onChange={(e) =>
                    setNewAssignment({
                      ...newAssignment,
                      deadline:
                        e.target.value,
                    })
                  }
                />

                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={
                    newAssignment.max_marks
                  }
                  onChange={(e) =>
                    setNewAssignment({
                      ...newAssignment,
                      max_marks:
                        e.target.value,
                    })
                  }
                />

                <button className="primary wide">
                  Create assignment
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* APP                                                                        */
/* -------------------------------------------------------------------------- */

function App() {
  const [user, setUser] =
    useState(() =>
      JSON.parse(
        localStorage.getItem(
          'user'
        ) || 'null'
      )
    );

  if (!user) {
    return (
      <Login
        onLogin={setUser}
      />
    );
  }

  return (
    <Dashboard
      user={user}
      logout={() => {
        localStorage.clear();
        setUser(null);
      }}
    />
  );
}

createRoot(
  document.getElementById('root')
).render(<App />);