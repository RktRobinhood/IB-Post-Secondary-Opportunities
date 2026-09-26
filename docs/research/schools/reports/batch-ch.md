# Batch report: Switzerland, ch-* (issue #43)

Researched 2026-09-26 with WebFetch/WebSearch and curl (no browser: the pane is shared). Hand-off checks are
fetch-based; where a table loads by JavaScript, the underlying JSON was read instead and is named below.

## ch-eth (none, German)
- Scope none: "The main teaching language in all Bachelor's degree programmes is German" (admission-prerequisites page).
- 2027 dates are published, with years, in JSON tables behind the dates page (`.../dates/_jcr_content/par/table_83420306_copy_.tableComp.json`): "Application period 01.12.2026 - 31.03.2027"; "Submission of German language certificate until 31.03.2027 at the latest"; "Submission of upper secondary school-leaving certificate immediately upon receipt, until 31.08.2027 at the latest"; "Start of the study 20.09.2027".
- Improves on data/countries/ch.json, which marks the 1 Dec–31 Mar period "provisional" and "published with no year": the dates page gives the years.
- Exam route: the autumn-2027 table for "Admission with entrance examination" (`table_1322192949_cop_1566530997`) says applying 01.12.2026–31.03.2027 leads to "Entrance exam 17.01.2028 - 27.01.2028" and "Start of the study programme 18.09.2028" — matches ch.json's framing.
- IB rule is from the country list PDF headed "Academic Year 2026/27"; the 2027/28 list is not out. ETH says "changes to the entry requirements for all Bachelor's degree programmes from the autumn semester 2028 onwards … Further details will be available on our website from spring 2027."
- Could not verify: the application fee amount ("An application fee is charged", no figure).
- Hand-off: the non-Swiss-certificate bachelor's application page (a hub, not a list; bachelor's only).

## ch-epfl (none, French)
- Scope none: "Bachelor: Most courses are given in French. In principle, there is a maximum of one course given in English per semester … From the second year, study plans may include up to 50% of courses given in English." (teaching-languages page).
- Dates are EPFL standing dates, published without a year: "Applications can be submitted from mid-November to the 30th of April to start your studies at EPFL the following September"; "Uploading form to be completed and submitted on July 10 at the latest (September 30 exceptionally for school certificates and diplomas delivered after July 10)"; "must be submitted no later than September 30th. Admission is otherwise canceled." Labelled "(standing date)". Opening day not recorded: "mid-November" gives no day.
- Decision month only ("accepted at the beginning of August within the places available"), so no decision date recorded.
- IB rule agrees with data/countries/ch.json (HL Maths, Physics, and chemistry/biology/CS; 38/42; 6 in Maths and Physics). Page adds: "The general average (or total number of points scored) of the school-leaving certificate will be used to rank and select the applicants." "The criteria are valid for the ongoing year" — 2027 criteria not separately published.
- Hand-off: the bachelor admission criteria page (bachelor's/CMS only).
