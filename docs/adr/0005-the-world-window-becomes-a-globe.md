# One pastel globe, with the list as fallback

The World Window is a floating illustrated globe that turns and moves smoothly
from world to continent to country, where university pins open university pages.
The owner chose this signature feature in #79 and #83, with one pastel style and
country-level detail: satellite imagery, clouds, street maps and travel vehicles
added weight and fragile transitions without helping students choose a university.

The list underneath names and links every place, follows the same filters and
remains available without JavaScript or WebGL. Home and the country index show a
Europe-facing still of the globe before its first frame. Reduced motion makes
camera changes instant and stops idle movement; rendering pauses offscreen.

The renderer decision and download measurements are recorded on #79. This
description replaces the former flat-map and multi-mode decisions in ADRs 0004,
0005 and 0007; Git history retains those superseded descriptions.
