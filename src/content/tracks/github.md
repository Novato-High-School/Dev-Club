---
title: GitHub
summary: Learn how real software teams share code, review each other's work, and never lose a file again.
icon: git-branch
level: start here
time: one or two meetings
needs:
  - A GitHub account, and an invite to the club organization. Both are covered on the Start here page.
outcomes:
  - Explain what a repository, a branch, and a pull request actually are
  - Change a file and open a pull request without touching a command line
  - Review somebody else's pull request and leave a useful comment
  - Have at least one merged contribution to the club website
snippetLang: bash
snippet: |
  git switch -c my-first-change
  git add .
  git commit -m "Add my project to the site"
  git push
resources:
  - label: GitHub Skills — Introduction to GitHub
    url: https://skills.github.com/
    note: Free, runs inside GitHub itself, about 20 minutes
  - label: Git and GitHub for Beginners (freeCodeCamp)
    url: https://www.youtube.com/watch?v=RGOj5yH7evk
    note: One long video, good if you prefer being talked through it
  - label: Oh Sh*t, Git!?!
    url: https://ohshitgit.com/
    note: How to undo things when Git goes wrong. Bookmark it now, thank us later.
order: 10
---

This is the track everybody starts with, because everything else in the club
runs on it. You do not need a command line for any of it.

## What you will actually do

1. **Read a repository.** Open the club site repo and find where the project
   files live. Sounds trivial. It is the thing that makes everything else make
   sense.
2. **Make a branch.** A branch is a safe copy where your change lives until
   somebody agrees it is good. Nothing you do on a branch can break the live
   site.
3. **Open a pull request.** This is you saying "here is my change, please look
   at it." A check runs automatically to confirm the site still builds.
4. **Get it reviewed and merged.** Somebody reads it, maybe asks a question,
   then merges. About a minute later it is live on the internet.
5. **Review somebody else's.** Harder than it sounds and more useful than you
   expect. Reading other people's work is most of the job.

## The bit that trips people up

A pull request is not a request to *pull* something. It is a request that
somebody pull *your* change into the main copy. The name is bad. Everyone
agrees the name is bad.

## When you are done

Add yourself to a project on the [Build](/build) page, or fix a typo you spot
anywhere on this site. Both are real contributions and both count.
