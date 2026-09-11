---
title: Python
summary: The language we teach first. Readable, forgiving, and used for everything from club bots to serious science.
icon: terminal
level: start here
time: a few weeks of lunches
needs:
  - Nothing. This is the genuine beginning.
outcomes:
  - Read a short Python program and predict what it does
  - Write loops, conditions, and functions without looking them up every time
  - Read an error message and work out what you actually did wrong
  - Add a working command to the club Discord bot
snippetLang: python
snippet: |
  members = ["you", "and everyone else"]

  for name in members:
      print(f"welcome to dev club, {name}")
resources:
  - label: Python for Everybody
    url: https://www.py4e.com/
    note: Free course and textbook. Slow, patient, genuinely good for beginners.
  - label: Automate the Boring Stuff with Python
    url: https://automatetheboringstuff.com/
    note: Free to read online. Aimed at making your own life easier, which is the best reason to learn.
  - label: Python Tutor
    url: https://pythontutor.com/
    note: Paste code in and watch it run one line at a time. Unreasonably helpful when you are stuck.
order: 20
---

Python is where most people here write their first working program. The syntax
stays out of your way, error messages are readable, and you can build something
that does a real job within a couple of meetings.

## What you will actually do

1. **Get it running.** No installing required to start — we use an online editor
   for the first few sessions so nobody loses a meeting to setup problems.
2. **Variables and printing.** Make the computer remember something and say it
   back. This is a smaller step than it sounds and everything builds on it.
3. **Loops and conditions.** Do a thing many times; do a thing only sometimes.
   Most programs are mostly these two.
4. **Functions.** Wrap up something useful and give it a name so you can use it
   again without copying and pasting.
5. **Ship something.** Add a real command to the club Discord bot. Roughly ten
   lines, and there is a template in the repo to copy.

## On errors

You will see a wall of red text. It is not a punishment and it does not mean you
are bad at this. Read the **last line first** — that is the actual problem. The
rest is the computer showing its work.

Everyone in this club, including whoever is teaching it, still gets these
constantly. That is not encouragement, it is just true.

## When you are done

Look at the [Build](/build) page for a project using Python and claim a task.
