# Landing Illustration Manifest

These project-bound illustrations were generated with OpenAI's built-in image model for the Crime Genome landing page. Final files use WebP at 1536x1024 and are served from `/assets/landing/`.

## Style Lock

Use premium cut-paper editorial illustration with crisp deep-ink outlines, flat geometric forms, subtle risograph texture, and restrained paper grain. Keep the palette anchored to orange `#FD6703`, pink `#FEBED9`, lavender `#F3E8FF`, and ink `#111827`. Do not generate readable text, logos, official insignia, watermarks, weapons, or generic AI glow.

## Assets

| File | Placement | Alt text | Prompt focus |
| --- | --- | --- | --- |
| `case-intelligence.webp` | Case intelligence card | Case evidence converging into a single prioritized action | Layered case folders, map fragments, evidence silhouettes, and timeline markers converging on one orange action card. |
| `field-coordination.webp` | Field context card | Two police officers coordinating around a digital case map | A woman and man officer in khaki reviewing a Bengaluru location together without insignia or weapons. |
| `connected-evidence.webp` | Connected evidence card | Case entities linked through a shared evidence network | Phone, vehicle, people, location, and case folder connected through one precise investigative network. |
| `prosecution-readiness.webp` | Prosecution readiness card | Case documents moving through checks toward court readiness | Legal case folder, blank statements, evidence packet, deadline calendar, checks, and restrained courthouse silhouette. |

## Delivery Rules

- Keep source copy and status labels in accessible HTML, not inside images.
- Include explicit `width` and `height`; use `loading="lazy"` and `decoding="async"` below the fold.
- Prefer a new versioned filename when changing artwork so cached deployments do not retain stale imagery.
- Verify desktop and mobile crops, local network loading, console errors, and horizontal overflow in a browser.
