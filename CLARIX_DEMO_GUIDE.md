# Clarix AI — Demonstration Guide

Welcome to the **Clarix AI** demonstration! This guide will help you navigate and present the core features of this premium, venture-funded EdTech platform.

## What is Clarix AI?

Clarix AI is an adaptive, AI-powered learning environment designed specifically for teaching Java Object-Oriented Programming (OOP). Unlike static video courses, Clarix continuously analyzes learner responses, confidence levels, and cognitive patterns to dynamically adjust difficulty, provide contextual hints, and detect deep-rooted misconceptions.

## How to Demo the Platform

### 1. The Landing Page
**URL:** `/` (Home)
- **Visuals:** Showcase the premium Stripe/Linear-inspired aesthetic. Point out the glowing mesh gradients, tight typography, and glassmorphism cards.
- **Key Message:** Emphasize that Clarix is a "living platform" rather than a passive content delivery system. 
- **Action:** Click on "Start Free Assessment" or "Start Learning for Free" to enter the Learner Portal.

### 2. Learner Diagnostic & Onboarding
**URL:** `/learner` (Signup / Login)
- Select an experience level (Beginner, Intermediate, or Advanced).
- Explain that the diagnostic test (5 quick questions) establishes the learner's baseline and initializes the adaptive engine.
- Complete the diagnostic to unlock the Dashboard.

### 3. The Learner Workspace (The Core Product)
**URL:** `/learner/dashboard`
- **3-Column Layout:** Explain the architectural decisions behind the UI.
  - **Left Sidebar:** The curriculum tree and progress tracker.
  - **Main Area:** The focused learning environment where lessons and assessments take place.
  - **Right Panel:** The persistent Gemini AI Assistant on standby.
- **Teaching Mode:** Show how the lesson content is generated on-the-fly based on the student's mastery level.
- **Assessment Mode:** Answer a question incorrectly to trigger the **Misconception Detection** engine. 
- **AI Tutor Chat:** Click "Open AI Help" to shift focus to the right sidebar. Ask the tutor a contextual question (e.g., "I don't get the difference between Overloading and Overriding").

### 4. The Educator Command Center
**URL:** `/educator`
- **Login:** Use the access code `educator123`.
- **Command Center:** Show the high-level metrics (Class Health, Average Mastery).
- **Class Heatmap:** Demonstrate how instructors can see exactly which concepts the class is struggling with (represented by red/yellow/green blocks).
- **AI Classroom Insights:** Highlight the AI-generated summaries that suggest specific teaching interventions based on real-time aggregated student data.

## Technical Highlights for Investors/Partners
- **Adaptive Engine:** Uses a localized Bayesian-style mastery tracking system.
- **Real-time LLM Integration:** Powered by Google Gemini via prompt engineering, allowing dynamic curriculum generation and conversational Socratic tutoring.
- **Modern UI Stack:** React, Tailwind CSS v4, Framer Motion (CSS animations), CSS Variables for seamless theming.

---

*Clarix AI — Master concepts, not just syntax.*
