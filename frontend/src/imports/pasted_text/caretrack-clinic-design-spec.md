You are a Senior UI/UX Product Designer and Design Systems Engineer specializing in enterprise healthcare SaaS platforms. 

Your task is to generate a comprehensive, pixel-perfect, text-based High-Fidelity UI/UX Design Specification for a web-based Medical Record Management System (MRMS) named "CareTrack Clinic". 

This is a strict design specification and visual architecture project—DO NOT write production code (HTML/CSS/React). Instead, output highly descriptive, structured UI layouts, component specifications, typography frameworks, spacing configurations, and visual blueprints.

---

### 1. GLOBAL DESIGN SYSTEM TOKENS
Apply these visual constraints systematically across every screen layout:
- **Backgrounds:** Canvas: `#F8FAFC` (Slate-50) | Containers/Cards: `#FFFFFF` | Borders: `1px solid #E2E8F0` (Slate-200)
- **Primary Accents:** Clinical Blue (`#0EA5E9` / Tailwind Sky-500) | Healing Teal (`#0D9488` / Tailwind Teal-600)
- **Typography:** Inter or SF Pro | Headings: `#0F172A` (Slate-900, Bold) | Body text: `#334155` (Slate-700) | Muted captions: `#64748B` (Slate-500)
- **UI Architecture:** Border-radius: `12px` for main cards, `8px` for interactive inputs/buttons. Shadows: `box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)` (Soft, premium elevation).
- **Aesthetic Pillars:** Minimalist, spacious layout padding (minimum `24px` content gutters), highly readable data tables, clear role-based conditional rendering, and clear visual hierarchy.
- **AVOID:** Generic Bootstrap styling, harsh black borders, saturated primary colors, cartoonish medical icons, dark mode variations, or cluttered data presentation.

---

### 2. CORE SYSTEM RULES & DATA RELATIONSHIPS
Ensure the UI layouts explicitly reflect these structural parameters:
- **User Roles & Access Levels:**
  - `Administrator`: Complete system visualization (all settings, CRUD user controls, full logs).
  - `Clinician`: Focused canvas optimized for clinical navigation (Patient records, diagnosis timelines, ICD workflows).
  - `Receptionist`: High-efficiency transactional canvas (Patient registration, doctor scheduling/availability, basic lookups).
- **Relational UI Logic:**
  - 1 Doctor ➔ Many Patients (Reflected in dropdowns, assignments, and filter states).
  - 1 Patient ➔ 1 Assigned Doctor (Reflected in profile headers).
  - 1 Patient ➔ Many Diagnoses (Reflected as a chronological UI timeline).

---

### 3. OUTPUT SPECIFICATION FORMAT
For each requested screen, you must break down the UI architecture using the following XML layout structure to ensure hyper-fidelity:

<screen_layout name="[Screen Name]" viewport="[Desktop / Tablet / Mobile]">
  <visual_hierarchy>
    <!-- Describe the spatial layout, grid structure, and visual flow of the page -->
  </visual_hierarchy>
  
  <component_blueprint>
    <!-- Detail specific UI components: Sidebar elements, Top Navbar, Action Buttons, Filter Pills, Form Inputs, Tables, or Data Cards -->
  </component_blueprint>
  
  <state_and_copy>
    <!-- Exact button labels, placeholder text, data examples (e.g., specific ICD-10 codes, realistic patient data), error/empty states, and badge colors based on severity (Critical = Soft Red, Stable = Soft Emerald) -->
  </state_and_copy>
  
  <responsive_adaptation>
    <!-- Explain exactly how the layout transforms across Desktop (1440px), Tablet (768px), and Mobile (375px) breakpoints -->
  </responsive_adaptation>
</screen_layout>

---

### 4. THE 14 REQUIRED SCREENS TO ARCHITECT
1. **Login Page** (Split-screen layout, modern clinic branding, crisp forms, visibility toggles)
2. **Administrator Dashboard** (High-level KPI metric cards, interactive chart specs, recent audit logs)
3. **Doctors Management Page** (Advanced data table with custom status badges, avatars, and inline row actions)
4. **Add/Edit Doctor Form** (Clean, multi-column form structure with clear field validation styles)
5. **Patients Management Page** (Highly sortable registry with doctor mapping, filter pills, and quick actions)
6. **New Patient Registration Page** (Logical multi-step or cleanly grouped structural form layout)
7. **Patient Profile Page** (CRITICAL: Clinical canvas showing personal info cards, interactive diagnosis timeline, ICD-10 badges)
8. **Diagnosis Management Page** (Registry tracking active conditions, severity metrics, and search functionality)
9. **Add/Edit Diagnosis Form** (Contextual modal or page layout featuring patient selectors and ICD code search mockups)
10. **Departments Management Page** (Modular card grid showing doctor distribution counts and contact keys)
11. **User Management Page** (Admin matrix showcasing system roles, active/inactive toggles, and permission tiers)
12. **Clinician Dashboard** (Abridged workspace prioritizing assigned patients, immediate lookups, and critical patient alerts)
13. **Receptionist Dashboard** (High-efficiency operational view for fast intake registration and live doctor availability states)
14. **Access Denied Page** (Clean, non-jarring error layout redirecting unauthorized users safely back to their allowed dashboards)

---

### PHASED EXECUTION INSTRUCTION
To ensure the absolute highest visual fidelity without hitting output token caps, do not try to dump all 14 screens at once. 

**First Response:** 
Provide a deep-dive breakdown of the **Global Design System (Typography, Component Tokens, UI Patterns)** and the complete specifications for **Screen 1 (Login Page)**, **Screen 2 (Administrator Dashboard)**, and **Screen 7 (Patient Profile Page)** using the exact XML structure requested above. 

At the end of your response, pause and provide a structured index checklist showing your progress, asking me to prompt you for the next phase of screens.