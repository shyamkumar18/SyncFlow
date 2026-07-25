# $yncFlow — Project Specification

## Overview

$yncFlow is a production-ready personal finance platform that automatically syncs banking transactions from Gmail, normalizes them, and provides rich analytics via a React web app and Flutter mobile apps.

## Problem Statement

Users receive hundreds of banking emails monthly — transaction alerts, credit card statements, UPI notifications, EMI reminders, etc. Manually tracking expenses across multiple bank accounts and cards is error-prone and time-consuming.

## Solution

$yncFlow connects to the user's Gmail via Google OAuth 2.0 (read-only), scans banking emails, extracts structured transaction data using intelligent parsing, stores it securely in MongoDB, and presents actionable financial insights.

## Goals

1. Automate personal finance tracking
2. Support all major Indian banks (HDFC, ICICI, SBI, Axis, Yes Bank, Kotak, etc.)
3. Provide real-time financial dashboards
4. Enable budgeting and goal tracking
5. Deliver a premium fintech user experience

## Non-Goals

1. Not a payment processor
2. Not a replacement for bank statements
3. Does not initiate transactions
4. Does not store Gmail passwords

## Target Users

- Salaried professionals
- Freelancers
- Small business owners
- Anyone who wants automated expense tracking

## Key Differentiators

- Zero manual data entry
- Automatic bank detection
- Intelligent merchant extraction
- Encrypted sensitive data
- Cross-platform (Web + Mobile)

## Success Metrics

- Transaction extraction accuracy > 95%
- Email processing time < 2 seconds per email
- Zero security breaches
- User onboarding completion rate > 80%
