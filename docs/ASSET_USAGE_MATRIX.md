# Asset Usage Matrix (Use All Existing Media)

## Source of Truth
- Full filename-level inventory is documented in:
  - `docs/IMAGE_INVENTORY.md`
- Rule for redesign: no media file in `images/` or `logos/` remains unused.

## Current Media Collections
- `images/` root: 7 files
- `images/banner/`: 10 files
- `images/gallery/annual-championships-2024/`: 36 files
- `images/gallery/Class Activities/`: 14 files
- `images/scanner25/`: 124 files
- `images/scannerresults/`: 23 files
- `images/videos/`: 4 files
- `logos/`: 2 files

## Planned Usage by Section
1. Brand and identity
- `logos/brainogym-logo-primary.png`: header/footer/logo strip.
- `logos/brainogym-favicon.ico`: favicon + app metadata.

2. Hero + rotating highlights
- `images/banner/1.jpg` to `images/banner/9.jpg`: homepage hero rotation.
- `images/banner/44.jpg`: static fallback hero/poster image.

3. Program overview cards
- `images/course-abacus.jpg`
- `images/course-vedic-maths.jpg`
- `images/course-robotics.jpg`
- `images/course-personality.jpg`

4. Founder/trust
- `images/Kavita-Founder.png`: founder spotlight section.

5. Invitation/event promo
- `images/invitation.png` and `images/invitation.jpg`: event CTA + downloadable invite preview.

6. Results proof wall
- `images/scannerresults/1.jpg` to `images/scannerresults/23.jpg`: results proof grid on Results page.

7. Media gallery collections
- `images/gallery/annual-championships-2024/*` (all 36): championship gallery album.
- `images/gallery/Class Activities/*` (all 14): class activity gallery album.
- `images/scanner25/*` (all 124): SCANNER’25 complete gallery album (paginated/lazy loaded).

8. Video content
- `images/videos/1.mp4` to `images/videos/4.mp4`: media showcase/video section with posters and lazy playback.

## Implementation Rules (to guarantee 100% usage)
- Gallery rendering is data-driven from filesystem-derived manifest.
- Each collection must report rendered count matching folder count.
- Build-time validation fails if any image/video is not mapped.
- Duplicate-looking files (example: `01.jpg` and `1.jpg`) are both retained and displayed.

## Validation Checklist (pre-launch)
- Total files discovered == total files in inventory.
- Total files rendered in routes/components == discovered files.
- No broken media URLs in final build.
- Lighthouse media optimization pass completed (compression + lazy load + responsive sizes).
