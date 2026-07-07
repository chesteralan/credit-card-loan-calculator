# Project Implementation TODO List

This document outlines the step-by-step checklist for implementing the **Credit Card & Loan Calculator** web application, based on the specifications in [PRD.md](file:///Volumes/ACASIS%20BIWIN%201TB/WORK/Joanna/Projects/credit-card-loan-calculator/docs/PRD.md).

---

## Phase 1: Project Setup & Foundation
- [ ] **1.1. Project Initialization**
  - [ ] Initialize the project using Vite with React and TypeScript (`npx create-vite@latest . --template react-ts`).
  - [ ] Install dependencies with `yarn install`.
  - [ ] Set up package scripts and confirm successful local dev build.
- [ ] **1.2. Design System & CSS Setup**
  - [ ] Configure `src/index.css` with CSS Custom Properties (CSS variables) for the color palette, fonts, spacing, and transitions.
  - [ ] Set up global style rules (reset, base styling for dark/light themes, typography).
  - [ ] Design Glassmorphism utility classes and scrollbar customization.

---

## Phase 2: Core Mathematical Engines
- [ ] **2.1. Traditional Loan Calculator Engine**
  - [ ] Implement monthly payment calculation formula: 
    $$M = P \frac{r(1+r)^n}{(1+r)^n - 1}$$
  - [ ] Implement logic to generate an amortization schedule including monthly extra payments.
  - [ ] Write unit tests to verify accuracy against standard financial calculators.
- [ ] **2.2. Credit Card Payoff Engine**
  - [ ] Implement dynamic minimum payment logic based on standard card issuer rules (e.g., $\max(25, \text{Interest} + 1\% \text{ of Balance})$).
  - [ ] Implement payment simulations comparing "Minimum Payment Only" vs. "Fixed Monthly Payment".
  - [ ] Write unit tests to verify payoff timelines and total interest paid.
- [ ] **2.3. Consolidation Comparison Engine**
  - [ ] Write consolidation logic to compare a list of credit card debts against a single personal consolidation loan.
  - [ ] Calculate total savings (interest and time saved).

---

## Phase 3: UI Component Development
- [ ] **3.1. Navigation & App Layout**
  - [ ] Build the sidebar/navbar panel for fast tab/calculator selection.
  - [ ] Create responsive top bar with a Theme Toggle (Dark/Light mode).
- [ ] **3.2. Common Input & Control Components**
  - [ ] Create slider inputs paired with numeric text fields for seamless adjustment of loan parameters.
  - [ ] Add input validation (positive numbers, maximum values, etc.).
- [ ] **3.3. Output & Metric Cards**
  - [ ] Create premium metric summary cards (KPI blocks) showing payoff time, monthly payments, and total interest.
  - [ ] Add micro-animations/transitions for value updates (e.g., number count-up transitions).

---

## Phase 4: Dashboard Integration & Data Visualization
- [ ] **4.1. Charting Integration**
  - [ ] Integrate Chart.js or Recharts for financial visualization.
  - [ ] Implement the **Payoff Timeline Chart** (line/area chart comparing balance declines over time).
  - [ ] Implement the **Payment Composition Chart** (donut chart comparing total principal vs. total interest).
- [ ] **4.2. Interactive Amortization Table**
  - [ ] Build the detailed schedule component with pagination/scroll.
  - [ ] Add a filter/search by year or month.
  - [ ] Implement "Export to CSV" functionality.
- [ ] **4.3. Combined Comparison Dashboard**
  - [ ] Render side-by-side or stacked comparisons for the consolidation feature.

---

## Phase 5: Polishing, Accessibility (a11y) & SEO
- [ ] **5.1. Accessibility Audit & Implementation**
  - [ ] Ensure all input elements have corresponding `<label>` tags or `aria-label` attributes.
  - [ ] Confirm full keyboard navigation support for tabs, inputs, and sliders.
  - [ ] Verify color contrast using a11y tools to meet WCAG AA standards.
- [ ] **5.2. SEO & Performance Optimization**
  - [ ] Add dynamic document titles, meta descriptions, and OpenGraph tags.
  - [ ] Optimize images, SVG icons, and vendor bundles to hit target Core Web Vitals (LCP < 1.5s).
- [ ] **5.3. Responsive Layout Adjustments**
  - [ ] Optimize dashboard grid layout for mobile devices.
  - [ ] Check touch target sizing (minimum 44x44px).
