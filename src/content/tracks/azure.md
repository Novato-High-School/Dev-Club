---
title: Azure & the Cloud
summary: Put something you built on the internet, and understand what is actually happening when you do.
icon: cloud
level: intermediate
time: a few meetings
needs:
  - Something you have already built that works on your own machine
  - Comfort with the basics of Python or JavaScript
outcomes:
  - Explain what "the cloud" actually is without hand-waving
  - Deploy a small app so other people can use it
  - Keep passwords and keys out of your code, properly
  - Read a bill and know what would make it go up
snippetLang: bash
snippet: |
  az login
  az webapp up --name hornet-bot --runtime "PYTHON:3.12"
resources:
  - label: Microsoft Learn — Azure Fundamentals
    url: https://learn.microsoft.com/en-us/training/paths/azure-fundamentals/
    note: Free, official, and the same material the paid certification uses
  - label: Azure for Students
    url: https://azure.microsoft.com/en-us/free/students/
    note: Free credit with no credit card, if you can verify you are a student
  - label: The Twelve-Factor App
    url: https://12factor.net/
    note: Short and opinionated. Explains why deployed apps are built the way they are.
order: 30
---

"The cloud" means somebody else's computer, rented by the minute. Once that
lands, most of the mystery goes away and what is left is a set of practical
skills that show up on job listings constantly.

## What you will actually do

1. **Get an account.** Azure for Students gives credit without a credit card,
   which is the part that usually blocks people under 18.
2. **Deploy something tiny.** One page, one command. The goal is to see it work
   end to end before anything gets complicated.
3. **Handle secrets properly.** API keys do not go in your code. This is the
   single most important habit in this track — a leaked key in a public repo is
   found by bots within minutes.
4. **Deploy something real.** Put the club Discord bot somewhere it can run
   without your laptop being open.
5. **Read the bill.** Understand what costs money and what is free, so a hobby
   project never turns into a surprise charge.

## A warning worth repeating

Anything you push to a public repository is public **forever**, including things
you delete later — the history keeps them. If you ever commit a key by accident,
the fix is to revoke it immediately, not to quietly delete the line.

Tell somebody when it happens. It happens to professionals monthly.

## When you are done

Take something on the [Build](/build) page that only runs on somebody's laptop,
and give it a real home.
