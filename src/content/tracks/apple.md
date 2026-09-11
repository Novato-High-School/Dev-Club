---
title: Apple Development
summary: Build an app for the phone in your pocket using Swift and SwiftUI.
icon: smartphone
level: intermediate
time: a term, honestly
needs:
  - Access to a Mac. We have a few in the lab, so not owning one is fine.
  - Some programming experience — Python counts
outcomes:
  - Build a multi-screen app that runs on a real iPhone
  - Use SwiftUI to describe a screen and watch it update as you type
  - Store data so it survives closing the app
  - Explain why your app looks the way it does, in design terms
snippetLang: swift
snippet: |
  struct ContentView: View {
      var body: some View {
          Text("while { Dev Club }")
              .font(.system(.title, design: .monospaced))
      }
  }
resources:
  - label: Hacking with Swift — 100 Days of SwiftUI
    url: https://www.hackingwithswift.com/100/swiftui
    note: Free, structured, and the best starting point there is
  - label: Apple — SwiftUI Tutorials
    url: https://developer.apple.com/tutorials/swiftui
    note: Official, polished, and works well alongside the course above
  - label: Swift Playgrounds
    url: https://www.apple.com/swift/playgrounds/
    note: Learn Swift on an iPad, which is genuinely a good way in
order: 40
---

SwiftUI lets you describe what a screen should look like and watch it appear
next to your code as you type. It is one of the most satisfying ways to learn
programming, because the thing you are building is right there.

## What you will actually do

1. **Open Xcode without panicking.** It is an enormous piece of software. You
   need about four parts of it, and we will point at those four.
2. **Build one screen.** Text, an image, a button that does something.
3. **Add a second screen.** Navigation is where an app starts feeling like an
   app rather than a demo.
4. **Keep some data.** Make the app remember something after you close it.
5. **Run it on a real phone.** This is the moment that gets people hooked, and
   it is worth doing even if the app is tiny.

## Be realistic about the pace

This is the longest track we run. Swift is stricter than Python and Xcode is a
lot of software to meet at once. Nobody finishes this in a month, and that is
not a reflection on you.

If you have never programmed before, do [Python](/learn/python) first. You will
get further, faster, and enjoy it more.

## When you are done

Pitch an app the school would actually use. The [Campus Map](/build) idea is
sitting unclaimed and would work well as a phone app.
