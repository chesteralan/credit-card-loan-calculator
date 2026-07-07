# Product Requirement Document (PRD)
## Credit Card & Loan Calculator

### 1. Document Control
- **Version**: 1.0.0
- **Status**: Draft
- **Date**: 2026-07-08
- **Author**: Antigravity (AI Coding Assistant)

---

### 2. Product Overview & Goal
The **Credit Card & Loan Calculator** is a premium, interactive web application designed to help users model, analyze, and optimize their debt repayment strategies. It serves a dual purpose:
1. **Loan Calculator**: Simulates traditional amortized loans (e.g., auto, personal, or mortgage loans) with variable terms, interest rates, and extra payments.
2. **Credit Card Payoff Calculator**: Models credit card interest compounding, minimum payment requirements, and payoff timelines under different monthly payment scenarios.
3. **Consolidation & Comparison Tool**: Helps users decide if consolidating credit card debt into a single personal loan makes financial sense by comparing total interest saved and time-to-payoff.

The goal is to deliver an exceptionally polished, fast, and visually stunning tool with an interactive dashboard, clean visualizations, and actionable financial insights.

---

### 3. Key User Personas
- **The Debt Repayer (Sarah)**: Has multiple high-interest credit cards and wants to see how increasing her monthly payment or consolidating her debt will shorten her payoff timeline and save money.
- **The Future Borrower (Marcus)**: Is considering taking out a personal or auto loan and wants to understand his monthly payment obligations and the impact of paying extra principal each month.
- **The Financial Planner (Elena)**: Wants a clean, detailed amortization schedule to download or analyze to optimize her household budget.

---

### 4. Functional Requirements

#### 4.1. Core Calculators

##### Feature A: Traditional Loan Calculator
- **Inputs**:
  - Loan Amount ($)
  - Annual Interest Rate (APR, %)
  - Loan Term (Years and/or Months)
  - Extra Monthly Payment ($) (Optional)
- **Outputs**:
  - Estimated Monthly Payment (Principal + Interest)
  - Total Interest Paid
  - Total Cost of Loan (Principal + Interest)
  - Payoff Date
  - Interest Saved (if extra payments are applied)
- **Detailed Schedule**: An interactive, exportable amortization table showing Month, Beginning Balance, Monthly Payment, Principal Paid, Interest Paid, Extra Payment, and Ending Balance.

##### Feature B: Credit Card Payoff Calculator
- **Inputs**:
  - Current Card Balance ($)
  - Annual Interest Rate (APR, %)
  - Minimum Payment Formula (e.g., greater of $25 or [Interest + 1% of balance])
  - Planned Custom Monthly Payment ($) (Optional)
- **Outputs**:
  - Months to Pay Off (paying minimum only vs. custom payment)
  - Total Interest Paid under both scenarios
  - Total Amount Paid under both scenarios
- **Visual Payoff Timeline**: Graphic chart illustrating the declining balance over time.

##### Feature C: Debt Consolidation Comparison (Interactive Dashboard)
- **Action**: Allows users to compare their credit card debt profile with a prospective consolidation personal loan.
- **Comparison Metrics**:
  - Total monthly payment difference.
  - Overall interest savings.
  - Time saved until debt-free.

---

### 5. User Interface (UI) & User Experience (UX)

#### 5.1. Design Language & Aesthetics
- **Theme**: Premium dark mode by default with an optional light mode toggle.
- **Color Palette**:
  - Primary Accent: Sleek Indigo/Violet gradient (`#6366f1` to `#a855f7`)
  - Success/Savings: Mint Green (`#10b981`)
  - Backgrounds: Deep Slate/Charcoal with Glassmorphism overlays (`backdrop-filter: blur()`)
- **Typography**: Modern sans-serif (e.g., *Outfit* or *Inter* via Google Fonts).
- **Interactions**: Smooth hover states, micro-animations on input changes, and animated transitions for charts/tabs.

#### 5.2. Page Structure
- **Sidebar/Navigation**: Quick switching between:
  1. Loan Calculator
  2. Credit Card Payoff
  3. Consolidation Compare
  4. Financial Glossary / Tips
- **Main Panel**: Split-screen dashboard layout:
  - *Left Column*: Dynamic slider controls and input forms.
  - *Right Column*: High-level summary cards (KPI blocks) and interactive SVG/Canvas charts.
- **Detailed View (below fold)**: Accordion-style or tabbed Amortization Schedule and Payment Breakdown charts.

---

### 6. Technical Stack & Architecture

- **Frontend Core**: HTML5 (semantic layout) and CSS3 (custom properties, Grid/Flexbox, transitions).
- **Framework/Build Tool**: Vite with TypeScript/React or Vanilla TypeScript (based on final application complexity).
- **Styling**: Vanilla CSS for bespoke styling control.
- **State Management**: React Context or local reactive state.
- **Data Visualization**: Chart.js, Recharts, or lightweight custom SVG charts for high-performance rendering.
- **Build & Package Manager**: `yarn`.

---

### 7. Non-Functional Requirements

- **Performance**:
  - Near-instantaneous calculator updates (all calculations client-side).
  - Target Core Web Vitals (CWV) metrics: LCP < 1.5s, INP < 100ms.
- **Accessibility (a11y)**:
  - Full keyboard navigability for forms and sliders.
  - ARIA labels for charts and custom form controls.
  - Contrast ratio meeting WCAG AA standards (minimum 4.5:1).
- **SEO & Social**:
  - Semantic markup, meta tags, and structured data for financial calculators.
  - Responsive design supporting mobile, tablet, and desktop views.
