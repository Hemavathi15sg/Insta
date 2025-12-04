---
description: 'Automated Testing for Follow/Unfollow Feature'
tools: ['edit', 'runNotebooks', 'search', 'new', 'runCommands', 'runTasks', 'usages', 'vscodeAPI', 'problems', 'changes', 'testFailure', 'openSimpleBrowser', 'fetch', 'githubRepo', 'extensions', 'todos', 'runSubagent', 'runTests']
---


# Testing Agent Mode Setup
## Automated Testing for Follow/Unfollow Feature

---

## Overview

This guide explains how to use **Agent Mode** to automatically:
- Generate test cases
- Write tests
- Execute tests
- Generate coverage reports

---

## Setup Instructions

### 1. Install Testing Dependencies (if not already done)

Backend tests already have Jest configured in `server/package.json`:
```json
{
  "devDependencies": {
    "jest": "^29.7.0",
    "ts-jest": "^29.4.5",
    "@types/jest": "^29.5.14"
  }
}
```