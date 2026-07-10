# Enterprise Platform

# 05 Information Architecture

## Purpose

This document defines the information structure of AI Fitness Solution.

The goal is to organize information around user goals instead of internal technical modules.

---

# Information Architecture Overview

AI Fitness Solution

|

├── Product Entry

├── Projects

├── AI Workspace

├── Documents

└── Operations


---

# Layer 1

# Product Entry

Purpose

Provide clear business entry points.

Users choose their business goal.

---

## Entry Products

### Enterprise Builder

For enterprise customers.

Goal:

Build fitness spaces.

---

### Tender Intelligence

For tender users.

Goal:

Generate tender documents.

---

### Sales Center

For sales users.

Goal:

Create customer proposals.

---

# Layer 2

# Projects

Purpose

Projects are the central business object.

Everything belongs to a project.

---

Project contains:

- Customer Information
- Requirements
- AI Sessions
- Solutions
- Budgets
- Documents
- Delivery Status

---

# Layer 3

# AI Workspace

Purpose

Provide AI-assisted work environment.

AI Workspace includes:

## Requirement Understanding

AI analyzes user needs.

---

## Planning

AI creates solutions.

---

## Decision Support

AI provides recommendations.

---

## Generation

AI creates business outputs.

---

# Layer 4

# Documents

Purpose

Manage generated business materials.

User-facing names:

## Solution

(previously Proposal)

Contains:

- Planning Documents
- Technical Documents

---

## Budget

Contains:

- Investment Estimate
- Cost Analysis

---

## Final Documents

Contains:

- Tender Package
- Delivery Files

---

# Internal Concepts

The following concepts remain internal:

- Quote Engine
- Budget Engine
- Tender Engine
- Artifact
- Workflow Engine

Users should not need to understand these concepts.

---

# Layer 5

# Operations

Purpose

Support continuous business operation.

Includes:

## Delivery

- Project Delivery
- Status Tracking

---

## Analytics

- Performance
- Usage
- Reports

---

## Customer Success

- Follow-up
- Renewal

---

## Governance

- Compliance
- Administration

---

# Navigation Principle

Users should navigate through goals.

Not through technical modules.

---

# Example

Wrong:

Quote

↓

Budget

↓

Tender


Correct:

Project

↓

AI Workspace

↓

Solution

↓

Budget

↓

Final Documents