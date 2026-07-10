# Enterprise Platform

# 03 Personas

## Purpose

This document defines all user personas supported by the Enterprise Platform.

Every feature, workflow, permission, AI experience and product decision must belong to one or more personas.

Personas define:

- Who uses the platform
- What they want to achieve
- Which product they use
- What success means
- What they should not access

---

# Persona 1

# Enterprise Customer

## Typical Users

- HR
- Administration
- Office Manager
- Company Owner
- Employee Wellness Manager

---

## Product Line

Enterprise Builder

---

## Primary Goal

Build an enterprise fitness space for employees.

---

## Business Need

The customer wants professional guidance to transform an idea into a feasible fitness facility project.

---

## Pain Points

- Lack of professional planning knowledge
- Unknown investment requirements
- Difficulty selecting equipment
- Difficulty evaluating space requirements
- Need professional proposal materials

---

## Core Workflow

Company Information

↓

AI Requirement Understanding

↓

Solution Planning

↓

Budget Estimation

↓

Final Proposal

↓

Supplier Connection

---

## Success Definition

The user successfully receives:

- Fitness Space Solution
- Investment Budget
- Implementation Recommendation
- Professional Proposal

The user can use the output for internal decision making.

---

## Boundary

Enterprise Customer should not directly access:

- Tender workflow
- Supplier management
- Internal AI engines
- Platform administration

---

# Persona 2

# Tender Customer

## Typical Users

- Tender Manager
- Bid Team
- Engineering Company
- Equipment Provider
- System Integrator

---

## Product Line

Tender Intelligence

---

## Primary Goal

Generate professional tender documents efficiently.

---

## Business Need

The user needs to transform complex tender requirements into compliant submission documents.

---

## Pain Points

- Large tender documents are difficult to analyze
- Manual requirement extraction takes time
- Compliance checking is difficult
- Proposal preparation is repetitive

---

## Core Workflow

Upload Tender Document

↓

AI Tender Analysis

↓

Requirement Review

↓

Technical Proposal

↓

Commercial Proposal

↓

Tender Package

↓

Download

---

## Success Definition

The user receives:

- Technical Proposal
- Commercial Proposal
- Budget
- Tender Package

The documents are ready for review and submission.

---

## Boundary

Tender Customer should not directly access:

- Enterprise planning workflow
- Supplier internal data
- Platform administration

---

# Persona 3

# Sales Consultant

## Typical Users

- Sales Representative
- Business Development Manager
- Channel Sales
- Consultant

---

## Product Line

Sales Center

---

## Primary Goal

Generate customer proposals and improve sales conversion.

---

## Business Need

The user needs to quickly transform customer requirements into professional commercial proposals.

---

## Pain Points

- Proposal creation is repetitive
- Response speed affects conversion
- Pricing communication is inefficient
- Customer follow-up is difficult

---

## Core Workflow

Customer Information

↓

AI Proposal Generation

↓

Solution

↓

Budget

↓

Quote

↓

Customer Communication

---

## Success Definition

The user successfully:

- Creates customer proposal
- Sends commercial materials
- Moves opportunity forward

---

## Boundary

Sales Consultant should not access:

- Platform administration
- Supplier private information
- Internal governance functions

---

# Persona 4

# Supplier

## Typical Users

- Equipment Manufacturer
- Brand Manager
- Product Manager
- Distributor

---

## Product Line

Supplier Hub

---

## Primary Goal

Provide product and commercial information.

---

## Business Need

The supplier wants their products to be accurately represented in AI-generated solutions.

---

## Pain Points

- Product information is fragmented
- Specifications are difficult to maintain
- Pricing updates are inefficient
- Project opportunities are difficult to discover

---

## Core Workflow

Product Management

↓

Brand Management

↓

Specification Update

↓

Pricing Update

↓

Project Matching

---

## Success Definition

Supplier successfully provides:

- Product Information
- Technical Parameters
- Brand Information
- Pricing Data

---

## Boundary

Supplier should not access:

- Customer private projects
- Platform administration
- Other suppliers' information

---

# Persona 5

# Partner / Integrator

## Typical Users

- System Integrator
- Construction Partner
- Regional Distributor
- Project Delivery Partner

---

## Product Line

Delivery Platform

---

## Primary Goal

Deliver customer projects successfully.

---

## Business Need

Partners need tools to coordinate multiple projects and delivery activities.

---

## Pain Points

- Multiple projects are difficult to manage
- Documents are scattered
- Delivery progress is difficult to track
- Communication efficiency is low

---

## Core Workflow

Project Assignment

↓

Project Planning

↓

Document Coordination

↓

Delivery Tracking

↓

Acceptance

---

## Success Definition

Partner completes:

- Project Delivery
- Document Handover
- Customer Acceptance

---

## Boundary

Partner should not access:

- Platform administration
- Unrelated customer projects
- Private supplier information

---

# Persona 6

# Platform Administrator

## Typical Users

- SaaS Operator
- Internal Operations Team
- Technical Administrator

---

## Product Line

Enterprise Operations

---

## Primary Goal

Operate and maintain the SaaS platform.

---

## Business Need

The administrator ensures system reliability, security and business operations.

---

## Pain Points

- User management complexity
- Permission management
- Platform monitoring
- Data governance

---

## Core Workflow

Tenant Management

↓

User Management

↓

Permission Management

↓

Monitoring

↓

Governance

---

## Success Definition

The platform remains:

- Stable
- Secure
- Observable
- Scalable

---

## Boundary

Platform Administrator controls the platform but should not modify customer business decisions.

---

# Persona Design Principles

## Principle 1

Different personas must see different workflows.

---

## Principle 2

Users should only see information required for their goals.

---

## Principle 3

Internal implementation concepts should not be exposed.

Examples:

- Quote Engine
- Budget Engine
- Tender Engine
- Workspace
- Artifact

These are platform concepts, not user goals.

---

## Principle 4

AI experience must adapt to persona goals.

The same AI platform provides different experiences for different users.

---

## Principle 5

Persona defines:

- Product Access
- Navigation
- Workflow
- Permission
- AI Assistant Behavior
