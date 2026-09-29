# UI / Visual Design

The dashboard is designed as a dark, recruiter-facing operations workspace inspired by modern SaaS analytics products: persistent navigation, KPI cards, workflow cards, activity feed, AI review queue, data panel and responsive mobile layout.

## Visual asset

The dashboard uses a real office/analytics photograph from Unsplash when the network is available:

- Photo: "Someone works at their computer with a mouse"
- Photographer: Jakub Żerdzicki
- Source: https://unsplash.com/photos/someone-works-at-their-computer-with-a-mouse-ZXh3zbw1oHc
- License: Unsplash License

A local reference image is included as a fallback so the UI still renders if the external image cannot be fetched.

## Real public data

The analytics panel is connected to the local UCI Student Performance dataset status endpoint. The acquisition script downloads the public dataset from UCI when internet access is available. The UI never represents that dataset as live institutional records.
