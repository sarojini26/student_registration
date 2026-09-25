import { useEffect, useMemo, useState } from 'react'
import './App.css'

const apiBaseUrl = import.meta.env.VITE_API_URL || ''

const companies = [
  { name: 'Microsoft', mark: 'M', color: '#2563eb' },
  { name: 'Google', mark: 'G', color: '#ea4335' },
  { name: 'Amazon', mark: 'a', color: '#f59e0b' },
  { name: 'TCS', mark: 'T', color: '#2563eb' },
  { name: 'Infosys', mark: 'i', color: '#0ea5e9' },
  { name: 'HCLTech', mark: 'H', color: '#ef4444' },
  { name: 'Wipro', mark: 'W', color: '#8b5cf6' },
  { name: 'Accenture', mark: 'A', color: '#a855f7' },
  { name: 'Cognizant', mark: 'C', color: '#0f766e' },
  { name: 'Deloitte', mark: 'D', color: '#16a34a' },
]

const emptyForm = {
  name: '',
  bloodGroup: '',
  studentId: '',
  dob: '',
  phone: '',
  email: '',
  address: '',
  department: '',
  gender: '',
  year: '',
  section: '',
  backlogs: '',
}

const departmentOptions = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication',
  'Electrical & Electronics',
  'Mechanical Engineering',
  'Civil Engineering',
  'Artificial Intelligence & Data Science',
]

function Icon({ name, size = 18 }) {
  const paths = {
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m6 9 6 6 6-6" />,
    grid: <><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87m-4-12a4 4 0 0 1 0 7.75" /></>,
    download: <><path d="M12 3v12m0 0 4-4m-4 4-4-4" /><path d="M5 21h14" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

function Field({ label, name, value, onChange, type = 'text', placeholder, required = true, children }) {
  return (
    <label className="field">
      <span>{label}{required && <b>*</b>}</span>
      {children || <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} required={required} />}
    </label>
  )
}

function App() {
  const [view, setView] = useState('register')
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(emptyForm)
  const [selectedCompanies, setSelectedCompanies] = useState([])
  const [registrations, setRegistrations] = useState([])
  const [query, setQuery] = useState('')
  const [toast, setToast] = useState(null)

  useEffect(() => {
    fetch(`${apiBaseUrl}/api/registrations`)
      .then((response) => {
        if (!response.ok) throw new Error('Unable to load registrations')
        return response.json()
      })
      .then(setRegistrations)
      .catch((error) => {
        console.error(error)
        setToast({ message: 'Unable to connect to the server', type: 'error' })
      })
  }, [])

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value })

  const goToCompanies = (event) => {
    event.preventDefault()
    if (Number(form.backlogs) !== 0) return
    setStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleCompany = (name) => {
    setSelectedCompanies((current) => current.includes(name)
      ? current.filter((company) => company !== name)
      : current.length < 4 ? [...current, name] : current)
  }

  const submitRegistration = async (event) => {
    event.preventDefault()
    if (selectedCompanies.length !== 4) return
    const registration = { ...form, companies: selectedCompanies, submittedAt: new Date().toISOString() }
    try {
      const response = await fetch(`${apiBaseUrl}/api/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registration),
      })
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}))
        throw new Error(errorBody.message || 'Unable to save registration')
      }
      const savedRegistration = await response.json()
      setRegistrations((current) => [savedRegistration, ...current])
      setToast({ message: 'Registration submitted successfully', type: 'success' })
      setForm(emptyForm)
      setSelectedCompanies([])
      setStep(1)
      setTimeout(() => setToast(null), 3500)
    } catch (error) {
      console.error(error)
      setToast({ message: error.message, type: 'error' })
    }
  }

  const companyCounts = useMemo(() => companies.map((company) => ({
    ...company,
    count: registrations.filter((registration) => registration.companies?.includes(company.name)).length,
  })), [registrations])

  const filteredRegistrations = registrations.filter((registration) =>
    `${registration.name} ${registration.studentId} ${registration.email}`.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">C</span><span>Campus<span>Connect</span></span></div>
        <div className="sidebar-label">Workspace</div>
        <nav>
          <button className={view === 'register' ? 'nav-item active' : 'nav-item'} onClick={() => { setView('register'); setStep(1) }}><Icon name="plus" /> New registration</button>
          <button className={view === 'admin' ? 'nav-item active' : 'nav-item'} onClick={() => setView('admin')}><Icon name="grid" /> Admin overview</button>
        </nav>
        <div className="sidebar-bottom"><div className="secure"><span>●</span> Data is stored securely</div><div className="user-chip"><span className="avatar">AD</span><span><strong>Admin desk</strong><small>Placement cell</small></span></div></div>
      </aside>

      <main className="main-content">
        <header className="topbar"><div><p className="eyebrow">PLACEMENT CELL <span>/</span> {view === 'register' ? 'STUDENT REGISTRATION' : 'ADMIN OVERVIEW'}</p><h1>{view === 'register' ? 'Student registration' : 'Registration overview'}</h1></div><button className="help-button">Need help? <span>Contact placement cell</span></button></header>

        {view === 'register' ? (
          <section className="content-width">
            <div className="intro-row"><div><p className="intro-copy">Complete your profile to participate in upcoming campus placements.</p></div><div className="status-pill"><span className="status-dot" /> Registration open</div></div>
            <div className="stepper"><div className={step >= 1 ? 'step active' : 'step'}><span>01</span><div><strong>Student details</strong><small>Basic information</small></div></div><div className="step-line" /><div className={step >= 2 ? 'step active' : 'step'}><span>02</span><div><strong>Company preferences</strong><small>Choose your top 4</small></div></div></div>
            {step === 1 ? (
              <form className="card form-card" onSubmit={goToCompanies}>
                <div className="card-heading"><div><h2>Tell us about yourself</h2><p>All fields marked with <b>*</b> are required.</p></div><span className="section-number">1 / 2</span></div>
                <div className="form-section"><h3>Personal information</h3><div className="fields-grid"><Field label="Full name" name="name" value={form.name} onChange={update} placeholder="e.g. Arjun Kumar" /><Field label="Student ID" name="studentId" value={form.studentId} onChange={update} placeholder="e.g. 21CSE001" /><Field label="Date of birth" name="dob" value={form.dob} onChange={update} type="date" /><Field label="Blood group" name="bloodGroup" value={form.bloodGroup} onChange={update}><select name="bloodGroup" value={form.bloodGroup} onChange={update} required><option value="">Select blood group</option>{['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−'].map((group) => <option key={group}>{group}</option>)}</select></Field><Field label="Phone number" name="phone" value={form.phone} onChange={update} type="tel" placeholder="+91 98765 43210" /><Field label="Email address" name="email" value={form.email} onChange={update} type="email" placeholder="you@college.edu" /><label className="field full"><span>Current address<b>*</b></span><textarea name="address" value={form.address} onChange={update} placeholder="Enter your full address" required /></label></div></div>
                <div className="form-section"><h3>Academic information</h3><div className="fields-grid"><Field label="Department" name="department" value={form.department} onChange={update}><select name="department" value={form.department} onChange={update} required><option value="">Select your department</option>{departmentOptions.map((department) => <option key={department}>{department}</option>)}</select></Field><Field label="Year" name="year" value={form.year} onChange={update}><select name="year" value={form.year} onChange={update} required><option value="">Select year</option>{['1st Year', '2nd Year', '3rd Year', '4th Year'].map((year) => <option key={year}>{year}</option>)}</select></Field><Field label="Section" name="section" value={form.section} onChange={update}><select name="section" value={form.section} onChange={update} required><option value="">Select section</option>{['A', 'B', 'C', 'D'].map((section) => <option key={section}>{section}</option>)}</select></Field><Field label="Gender" name="gender" value={form.gender} onChange={update}><select name="gender" value={form.gender} onChange={update} required><option value="">Select gender</option>{['Female', 'Male', 'Non-binary', 'Prefer not to say'].map((gender) => <option key={gender}>{gender}</option>)}</select></Field><Field label="Number of backlogs" name="backlogs" value={form.backlogs} onChange={update} type="number" placeholder="0" /></div><div className="info-note"><span>i</span><p>Students with <strong>0 backlogs</strong> can continue to company preferences. Keep your academic record up to date.</p></div></div>
                <div className="form-actions"><span>Step 1 of 2</span><button className="primary-button" type="submit" disabled={form.backlogs === '' || Number(form.backlogs) !== 0}>Continue to companies <Icon name="arrow" size={16} /></button></div>
              </form>
            ) : (
              <form className="card form-card" onSubmit={submitRegistration}>
                <div className="card-heading"><div><h2>Choose your preferences</h2><p>Select exactly 4 companies you would like to apply to.</p></div><span className="section-number">2 / 2</span></div>
                <div className="company-toolbar"><div><h3>Top companies</h3><p>Choose your four preferred companies in any order.</p></div><span className={selectedCompanies.length === 4 ? 'selection-count complete' : 'selection-count'}>{selectedCompanies.length} <small>/ 4 selected</small></span></div>
                <div className="company-grid">{companies.map((company) => <button type="button" key={company.name} className={selectedCompanies.includes(company.name) ? 'company-card selected' : 'company-card'} onClick={() => toggleCompany(company.name)}><span className="company-logo" style={{ background: company.color }}>{company.mark}</span><span><strong>{company.name}</strong><small>Technology & services</small></span><span className="checkbox">{selectedCompanies.includes(company.name) && <Icon name="check" size={14} />}</span></button>)}</div>
                <div className="form-actions"><button type="button" className="back-button" onClick={() => setStep(1)}>Back to details</button><button className="primary-button" type="submit" disabled={selectedCompanies.length !== 4}>Submit registration <Icon name="check" size={16} /></button></div>
              </form>
            )}
          </section>
        ) : (
          <section className="content-width admin-view"><div className="stats-grid"><div className="stat-card"><span className="stat-icon blue"><Icon name="users" /></span><small>Total registrations</small><strong>{registrations.length}</strong><span className="stat-note">All submitted profiles</span></div><div className="stat-card"><span className="stat-icon green"><Icon name="check" /></span><small>Eligible students</small><strong>{registrations.length}</strong><span className="stat-note">Zero backlog verified</span></div><div className="stat-card"><span className="stat-icon purple"><Icon name="grid" /></span><small>Companies selected</small><strong>{companyCounts.filter((company) => company.count > 0).length}<small> / 10</small></strong><span className="stat-note">With at least one preference</span></div></div><div className="admin-toolbar"><div><h2>Company-wise registrations</h2><p>See how students are distributed across their preferences.</p></div><button className="export-button" onClick={() => { const blob = new Blob([JSON.stringify(registrations, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'campus-registrations.json'; link.click(); URL.revokeObjectURL(url) }}><Icon name="download" size={16} /> Export data</button></div><div className="company-summary">{companyCounts.map((company) => <div className="summary-row" key={company.name}><span className="company-logo small" style={{ background: company.color }}>{company.mark}</span><strong>{company.name}</strong><div className="progress"><span style={{ width: `${registrations.length ? Math.max(4, (company.count / Math.max(...companyCounts.map((item) => item.count), 1)) * 100) : 4}%` }} /></div><span className="summary-count">{company.count} {company.count === 1 ? 'student' : 'students'}</span></div>)}</div><div className="registrations-heading"><div><h2>All registrations</h2><p>Review submitted student profiles.</p></div><label className="search"><Icon name="search" size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search students" /></label></div><div className="table-wrap"><table><thead><tr><th>Student</th><th>Student ID</th><th>Department</th><th>Preferences</th><th>Submitted</th></tr></thead><tbody>{filteredRegistrations.length ? filteredRegistrations.map((registration) => <tr key={`${registration.studentId}-${registration.submittedAt}`}><td><strong>{registration.name}</strong><small>{registration.email}</small></td><td>{registration.studentId}</td><td>{registration.department}</td><td><div className="table-tags">{registration.companies.map((company) => <span key={company}>{company}</span>)}</div></td><td>{new Date(registration.submittedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td></tr>) : <tr><td colSpan="5" className="empty-state">No registrations found yet.</td></tr>}</tbody></table></div></section>
        )}
      </main>
      {toast && <div className={`toast ${toast.type}`} role="status"><span><Icon name={toast.type === 'success' ? 'check' : 'close'} size={15} /></span><strong>{toast.type === 'success' ? 'Success' : 'Action needed'}</strong><p>{toast.message}</p></div>}
    </div>
  )
}

export default App
