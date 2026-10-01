# Michio: illustrated workbench

Direction: illustrative, non-generic portfolio, requested by the owner. Antislop applies during implementation. This direction supersedes the previous near-black terminal presentation.

Design read: a personal portfolio for people inspecting Michio's software and systems work, using a technical sketchbook visual language. ENERGY 3 / RHYTHM 3 / MOTION 1.

- Palette: cream paper #f9f4e8 and dark ink #242b27 establish a printed sketchbook; muted sage fills organize hardware drawings; burnt orange #a13f22 is reserved for the primary action and cable/ink annotations.
- Typography: Fraunces 600 gives the owner's name and headings the character of printed book titles. DM Sans keeps project descriptions and controls clear. Font files are served locally with their OFL licenses.
- Hero: a bespoke SVG workbench combines a Linux penguin, computer, Android phone and router to depict the actual areas of work. It is an illustration, not a claimed photograph or a working terminal.
- Layout: a large personal introduction pairs with the workbench; project spreads preserve actual screenshots; the toolkit is a horizontal rail; biography uses connected-cable line art; contact is a folded address note.
- Spacing: generous editorial sections contrast with compact project metadata and tool rows. The phone layout stacks the introduction, drawing and project visual before its description; intermediate widths retain balanced two-column sections.
- Project frames: paper-like frames contain actual app screenshots without cropping. The kernel illustration is explicitly labeled as an illustration, not live telemetry.
- Icons: verified brand marks identify named tools; directional arrows identify external destinations and down-page movement. No decorative feature icons or status dots.
- Motion: requested one-time entrance motion is limited to the workbench, project previews and contact note. The workbench rises 12px while appearing over 0.6 seconds to establish the hero illustration, then stays still; desktop mouse movement adds a maximum 2-degree physical tilt, while touch and reduced-motion render it static. Other sequences explain illustrated connections and physical paper/screenshot placement, then stop. The central ruler retains direct control without easing or inertia.
- Requested interaction refinement: router-local signal arcs briefly explain the networking illustration on deliberate hover/click/tap, never indicate a live connection. Kernel replay uses the same activation path for mouse and touch. Contact-paper lift and fold feedback convey the existing letter-on-desk motif without animating its contact rows; direct links retain their native action. These bounded sequences use MOTION 2 locally and preserve all layout, colors, and typography.
- Fixed light palette: the paper-and-ink illustration treatment is the visual identity, rather than a partial light/dark theme. There is no theme toggle.
- Content: existing project data, repository/release URLs, email and Telegram destinations are retained. No fabricated metrics, testimonials, roles or live system status.
- Accessibility: visible keyboard focus, mobile Menu label, 44px minimum targets, polite selected-tool updates, and visible image failure/loading states.

## Toolkit section refinement

Scope: only the Tools on the desk section, at the owner's request; rest of the page retains its design and content. Antislop applies during the work. Dials remain ENERGY 3 / RHYTHM 3 / MOTION 1.

- Two open shelves replace the boxed console table, separating development tools from supporting platforms while preserving horizontal browsing.
- Brand icons sit beside tool names for quick recognition; selected cards lift slightly and carry a visible Selected label, so state is not color-only.
- One clipped-paper note holds the selected tool's existing description and category; it sits beside the shelves on desktop and below them on narrower screens.
- A larger two-line heading gives the section a distinct editorial rhythm without adding another illustration or changing the overall palette.
- Paper edges and a restrained selected-card offset express the existing workbench motif, rather than adding decorative gradients, badges or glowing status lights.
- The native range input styled as a ruler is the only movement control: dragging left moves the bottom cards left and top cards right. Dragging right reverses both. Track transforms follow its position directly without trailing easing; row drag, swipe, wheel, and focus no longer move either shelf. Clipped cards are reached through the keyboard-operable ruler, while fully visible cards remain in the Tab order.
- The two long shelf-bottom rules and native scrollbars are removed to avoid suggesting additional drag controls. Card outlines, internal dividers, typography, colors, spacing, and content remain unchanged.
- Ruler ticks mark the continuous travel range, not fabricated statistics; its 44px handle remains keyboard and touch operable. Midpoint initialization leaves travel available in both directions.
- Latest slider-only verification evidence lives in qa/slider-only/; earlier ruler and toolkit evidence lives in qa/ruler/ and qa/toolkit/.

## Micro-Core project preview refinement

Scope: only the Micro-Core visual in Selected work. Antislop remains active during implementation, with ENERGY 3 / RHYTHM 3 / MOTION 1 unchanged.

- The real application screenshot remains visible because it is direct evidence of the shipped interface; its dark product palette is not recolored or disguised as part of the portfolio palette.
- The source screenshot is cropped after the final update row to remove unused black space while keeping the complete dashboard content intact.
- A warm paper mat, thin ink edge, restrained burnt-orange offset and slight physical tilt connect the dark interface to the existing technical-sketchbook identity without adding a heavy phone bezel.
- The preview is enlarged so the application UI, rather than its surrounding decoration, remains the focal point at desktop and mobile widths.

## PKL project preview refinement

Scope: only the PKL Management System visual in Selected work. Antislop remains active during implementation, with ENERGY 3 / RHYTHM 3 / MOTION 1 unchanged.

Design read: match the approved Micro-Core artifact treatment instead of introducing a separate device mockup language.

- The laptop illustration is removed. The real PKL dashboard uses the same warm paper mat, thin ink edge, burnt-orange offset and restrained tilt as the Micro-Core screenshot.
- The landscape screenshot fills the available visual width, so its interface remains larger and clearer than it was inside the laptop treatment.
- The project keeps its authentic dashboard colors; the surrounding paper treatment, caption and metadata connect it to the portfolio palette.
- PKL tilts gently in the opposite direction from Micro-Core, creating a deliberate pasted-work rhythm without reducing screenshot legibility.
- The Micro-Core and PKL paper frames lean toward the pointer as direct physical feedback. Mouse movement uses the full restrained tilt; touch press and horizontal movement use a softer tilt and press scale while vertical page scrolling remains native. Reduced-motion preference disables the effect.

## Flexible About cable

Scope: only the cable beneath “Curiosity goes all the way down.” Antislop remains active during implementation, with ENERGY 3 / RHYTHM 3 / MOTION 1 unchanged.

- The cable is a Verlet-style chain of connected points updated with `requestAnimationFrame`; its first point stays fixed and its last point is pinned to the plug on every simulation step. A quadratic midpoint spline draws the live points without cubic overshoot, while a fold-prevention projection keeps fast reversals inside the viewbox and progressing toward the plug.
- Pointer and touch dragging move the plug directly in both horizontal directions. Pulling right removes slack until the chain is almost straight; pushing left gives the simulated points room to form history-dependent arcs or asymmetric S-curves instead of selecting a stored path.
- Releasing the plug switches only the plug to a damped return spring, while the cable points preserve their inertia and follow with a short physical delay. Reduced motion resets immediately without oscillation. Arrow keys and Enter/Space retain keyboard control; Home remains an explicit reset.

## Kernel illustration motion

Scope: only the MT6781 illustration in the Realme 8i project card. Antislop remains active during implementation, with ENERGY 3 / RHYTHM 3 / MOTION 1 unchanged.

- Red traces, pins, chip lift and label animate once to explain the physical route into the chip, rather than to imply live diagnostics. The 1.16-second sequence remains inside the existing illustration bounds and preserves the printed cream, ink and burnt-orange treatment.
- The chip lift is limited to 3px and returns to its original position, so it establishes the chip as the focal point without turning the illustration into a perpetual motion element.
- Desktop hover adds a brief, fine-pointer-only physical tilt and trace glow. A coarse-pointer tap can replay the same short sequence. Reduced-motion rendering keeps every illustrated part visible and static.

